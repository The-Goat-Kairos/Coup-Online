<!-- src/routes/[lobbyCode]/+page.svelte -->
<script lang="ts">
    import { onMount } from 'svelte';
	import cardDrawing from '$lib/assets/cardDrawing.png';
    import { goto } from '$app/navigation';
    import { io, type Socket } from 'socket.io-client';
    import type { Player } from '$lib/types';

    // Data from +page.ts load function
    let { data } = $props<{
        data: {
            lobbyCode: string;
            players: Player[];
        }
    }>();

    let gameState = $state({
        coins: 2,                             // your coins
        myInfluences: ['Duke', 'Assassin'],   // your real cards (face up)
        revealedCards: [] as string[],        // lost cards shown face up
        turn: 'CoolPlayerName'                // whose turn it is
    });

    // Derived values so they react if data changes (fixes the Svelte warning)
    let lobbyCode = $derived(data.lobbyCode);
    let initialPlayers = $derived(data.players);

    let socket = $state<Socket | undefined>();
    let currentPlayers = $state<Player[]>(((() => initialPlayers))());
    let myPlayerId = $state<string | undefined>();
    let isInLobby = $state(false);

    onMount(() => {
        socket = io();

        // Join the socket.io room for real-time updates
        socket.emit('joinGameRoom', lobbyCode);

        socket.on('lobbyUpdated', (update: { code: string; players: Player[] }) => {
            if (update.code === lobbyCode) {
                currentPlayers = update.players;
                updateIsInLobby();
            }
        });

        socket.on('gameStateUpdate', (newState: any) => {
            console.log('Game state updated', newState);
            // TODO: Use this for rendering cards, coins, etc.
        });

        socket.on('gameEnded', () => {
            alert('Game has ended!');
            goto('/');
        });

        socket.on('connect', () => {
            if (socket) {
                myPlayerId = socket.id;
                updateIsInLobby();
            }
        });

        function updateIsInLobby() {
            console.log($state.snapshot(currentPlayers));
            console.log($state.snapshot(myPlayerId));
            isInLobby = currentPlayers.some((p: Player) => p.id === myPlayerId);
        }

        // Cleanup when leaving the page
        return () => {
            socket?.emit('leaveGameRoom', lobbyCode);
            socket?.disconnect();
        };
    });

    function endGame() {
        socket?.emit('endGame', lobbyCode);
    }
</script>

<div class="min-h-screen bg-[#181818] p-8 text-white">
    <div class="max-w-6xl mx-auto">
        <div class="flex justify-between items-center mb-8">
            <h1 class="text-5xl font-bold">
                Coup - Room <span class="text-yellow-400 font-mono tracking-widest">{lobbyCode}</span>
            </h1>
            <button onclick={() => goto('/')} class="text-zinc-400 hover:text-white">
                ← Leave
            </button>
        </div>

        <!-- {#if !isInLobby} -->
        <!--     <div class="bg-yellow-900/30 border border-yellow-600 p-6 rounded-2xl text-center mb-8"> -->
        <!--         <p class="text-xl">You are spectating this game.</p> -->
        <!--     </div> -->
        <!-- {/if} -->

        <!-- Main Game Area -->
        <div class="mt-12 bg-zinc-950 border border-zinc-700 rounded-3xl pl-12 pr-12 pb-12 pt-6 min-h-[500px] relative {!isInLobby ? 'disabled' : ''}">
            <div class="text-center mb-8">
                <p class="text-center text-zinc-500">Game Table</p>
            </div>

            <div class="bg-zinc-900 border-2 border-emerald-500 rounded-3xl p-6 shadow-2xl mb-16">
                <p class="text-center text-emerald-400 text-sm mb-4 tracking-widest">YOUR INFLUENCE</p>

                <div class="flex gap-6 justify-evenly">
                    {#each gameState.myInfluences as card}
                        <div class="flex flex-col justify-center text-center">
                            <div class="w-28 aspect-[2/3] bg-gradient-to-br from-amber-900 to-amber-700 border-4 border-amber-400 rounded-2xl overflow-hidden flex items-center justify-center shadow-xl">
                                <img src={cardDrawing} alt="card" class="w-full h-full object-cover" />
                            </div>
                            <p class="font-bold text-lg">{card}</p>
                        </div>
                    {/each}
                </div>

                <div class="text-center mt-6">
                    <p class="text-3xl font-bold text-yellow-400">{gameState.coins} 💰</p>
                </div>
            </div>


            <div class="grid grid-cols-2 md:grid-cols-4 gap-8">
                {#each currentPlayers as player (player.id)}
                    <div class="text-center">
                        <div class="flex justify-center gap-3 mb-3">
                            {#each [1, 2]}
                                <div class="w-20 aspect-[2/3] bg-zinc-800 border-3 border-zinc-600 rounded-xl overflow-hidden flex items-center justify-center text-4xl shadow-md">
                                    <img src={cardDrawing} alt="card" class="w-full h-full object-cover" />
                                </div>
                            {/each}
                        </div>
                        <p class="font-medium text-lg">
                            {player.name}
                            {#if player.id === myPlayerId}<span class="text-green-400"> (You)</span>{/if}
                        </p>
                        <p class="text-2xl font-bold text-yellow-400">2 💰</p>
                    </div>
                {/each}
            </div>
        </div>
        <!-- {#each currentPlayers as player (player.id)} -->
        <!--     <p>Yes</p> -->
        <!-- {/each} -->

        {#if currentPlayers.some((p: Player) => p.id === myPlayerId && p.isHost)}
            <button onclick={endGame} class="mt-8 bg-red-600 px-6 py-3 rounded-xl w-full">
                End Game (Host only)
            </button>
        {/if}
    </div>
</div>
