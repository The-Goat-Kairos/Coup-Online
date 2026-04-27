<!-- src/routes/[lobbyCode]/+page.svelte -->
<script lang="ts">
    import { onMount } from 'svelte';
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
                Coup — Room <span class="text-yellow-400 font-mono tracking-widest">{lobbyCode}</span>
            </h1>
            <button onclick={() => goto('/')} class="text-zinc-400 hover:text-white">
                ← Leave
            </button>
        </div>

        {#if !isInLobby}
            <div class="bg-yellow-900/30 border border-yellow-600 p-6 rounded-2xl text-center mb-8">
                <p class="text-xl">You are spectating this game.</p>
            </div>
        {/if}

        <!-- Game Table -->
        <div class="mt-12 bg-zinc-950 border border-zinc-700 rounded-3xl pl-12 pr-12 pb-12 pt-6 min-h-[200px] relative {!isInLobby ? 'disabled' : ''}">
            <p class="text-center text-zinc-500 mb-1">Game Table</p>
            <p class="text-center text-white-500 font-bold mb-11">Coins: 2</p>

            <div class="flex flex-10 justify-evenly gap-8">
                {#each [1,2]} <!-- temporary list just to see how 2 cards would look -->
                <div class="text-center">
                    <div class="h-120 w-80 bg-zinc-900 rounded-2xl flex items-center justify-center border-2 border-dashed border-zinc-700 text-xl">
                        <!-- This is where we display the players cards -->
                        <!-- so This is an imagae -->
                    </div>
                    <p class="mt-4 font-medium">
                        <!-- This is where we put the name of the card -->
                    </p>
                    <p class="mt-4 font-small text-zinc-600">
                        <!-- This is where we put the description of the characters action -->
                    </p>
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
