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
        <div class="mt-12 bg-zinc-950 border border-zinc-700 rounded-3xl p-12 min-h-[500px] relative">
            <p class="text-center text-zinc-500 mb-12">Game Table (custom art coming soon)</p>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                {#each currentPlayers as player (player.id)}
                    <div class="text-center">
                        <div class="h-32 bg-zinc-900 rounded-2xl flex items-center justify-center border-2 border-dashed border-zinc-700 text-xl">
                            {#if player.id === myPlayerId}
                                Your Influence Cards
                            {:else}
                                🃏 {player.name}'s cards
                            {/if}
                        </div>
                        <p class="mt-4 font-medium">
                            {player.name}
                            {#if player.isHost} 👑{/if}
                            {#if player.id === myPlayerId} <span class="text-green-400">(You)</span>{/if}
                        </p>
                    </div>
                {/each}
            </div>
        </div>

        {#if currentPlayers.some((p: Player) => p.id === myPlayerId && p.isHost)}
            <button onclick={endGame} class="mt-8 bg-red-600 px-6 py-3 rounded-xl w-full">
                End Game (Host only)
            </button>
        {/if}
    </div>
</div>
