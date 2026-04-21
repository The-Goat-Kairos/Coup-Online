<script lang="ts">
    import type { Player } from '$lib/server/types';
    import { goto } from '$app/navigation';
    import { io, type Socket } from 'socket.io-client';
    import { onMount } from 'svelte';

    let socket = $state<Socket | undefined>();
    let lobbyCode = $state('');
    let players = $state<Player[]>([]);
    let isHost = $state(false);

    let myName = $state('CoolPlayerName');

    onMount(() => {
        socket = io();

        socket.on('lobbyCreated', (data: any) => {
            lobbyCode = data.code;
            players = data.players;
            isHost = true;
        });

        socket.on('lobbyUpdated', (data: any) => {
            lobbyCode = data.code;
            players = data.players;
            isHost = players.some(p => p.id === socket?.id && p.isHost);
        });

        socket.on('gameStarted', (data: any) => {
            console.log("Game Starting!", data);
            goto(`/${data.code}`);
        });

        socket.on('error', (data: any) => alert(data.message));
    });


    // We send this to server
    function createLobby() {
        if (!lobbyCode) socket?.emit('createLobby', myName);
    }

    function joinLobby() {
        const codeInput = document.getElementById('joinCode') as HTMLInputElement;
        const code = codeInput?.value.trim().toUpperCase();
        if (code) {
            socket?.emit('joinLobby', code, myName);
        }
    }

    function startGame() {
        if (lobbyCode) socket?.emit('startGame', lobbyCode);
    }

    function handleNameChanged(newName: string) {
        const trimmed = newName.trim();
        if (trimmed && trimmed !== myName && lobbyCode && socket) {
            socket.emit('nameChanged', lobbyCode, trimmed);
        }
        myName = trimmed;
    }
</script>

<div class="p-8">
    <input
        oninput={(e) => handleNameChanged(e.currentTarget.value)}
        placeholder=" Your name"
        max="10"
        class="bg-zinc-800 p-2 mb-4"
    />


    {#if !lobbyCode}
        <div class="space-y-4 mt-4">
            <button onclick={createLobby} class="w-full bg-green-600 hover:bg-green-700 p-4 rounded-xl text-xl font-medium">
                Create New Game
            </button>

            <div class="flex gap-3">
                <input id="joinCode" placeholder=" Enter 6-digit code" maxlength="6"
                       class="flex-1 bg-zinc-800 p-3 rounded-xl text-lg" />
                <button onclick={joinLobby} class="bg-blue-600 hover:bg-blue-700 px-8 rounded-xl">
                    Join Game
                </button>
            </div>
        </div>
    {:else}
        <p class="text-2xl mb-2">Lobby Code: <span class="text-yellow-400">{lobbyCode}</span></p>

        <ul class="mt-6 space-y-2">
            {#each players as player}
            <li class="pr-3 pl-3 rounded-lg flex justify-between">
                <span>{player.name}</span>
                <span class="text-md text-zinc-500">
                    {player.id === socket?.id ? '(you)' : ''}
                    {player.isHost ? '👑' : ''}
                </span>
            </li>
            {/each}
        </ul>

            {#if isHost}
                <button onclick={startGame}
                        class="w-full mt-10 bg-red-600 hover:bg-red-700 p-4 rounded-2xl text-xl font-medium">
                    Start Game
                </button>
            {/if}

            <p class="text-center text-sm text-zinc-500 mt-6">
                Waiting for players... ({players.length}/6)
            </p>
    {/if}
</div>

<style>
</style>
