<script lang="ts">
    import type { Player } from '$lib/server/socket';
    import { io, type Socket } from 'socket.io-client';
    import { onMount } from 'svelte';

    let socket: Socket;
    let lobbyCode = $state('');
    let players = $state<Array<Player>>([]);
    let lobbyCreated = $state(false);

    let myName = $state('CoolPlayerName');
    let oldName = $state('');

    onMount(() => {
        socket = io();

        socket.on('lobbyCreated', (data: any) => {
            lobbyCode = data.code;
            players = data.players;
            lobbyCreated = true;
        });

        socket.on('lobbyUpdated', (data: any) => {
            lobbyCode = data.code;
            players = data.players;
        });

        socket.on('gameStarted', (data: any) => {
            console.log("Game Starting!", data);
        });

        socket.on('error', (data: any) => alert(data.message));
    });


    // We send this to server
    function createLobby() {
        if (!lobbyCode) socket?.emit('createLobby', myName);
    }

    function joinLobby(code: string) {
        socket?.emit('joinLobby', code, myName);
        lobbyCreated = false;
    }

    function startGame() {
        if (lobbyCode) socket?.emit('startGame', lobbyCode);
    }
</script>

<div class="p-8">
    <input bind:value={
            () => myName,
            (v) => {
                oldName = myName;
                myName = v;


                if (lobbyCode) socket?.emit('nameChanged', lobbyCode, oldName, v);
            }
        } placeholder="Your name" class="bg-zinc-800 p-2" />


    {#if !lobbyCode}
        <button class="p-2 rounded-lg" onclick={createLobby}>Create Game</button>
        <div class="mt-8">
            <input id="joinCode" placeholder="Enter code" class="bg-zinc-800 p-2" />
            <button class="p-2 rounded-lg" onclick={() => {
                const code = (document.getElementById('joinCode') as HTMLInputElement).value.toUpperCase();
                if (code) joinLobby(code);
            }}>Join Game</button>
        </div>
    {/if}

    {#if lobbyCode}
        <p class="mt-8 text-2xl">Lobby Code: <strong class="text-yellow-400">{lobbyCode}</strong></p>

        <ul class="mt-4">
            {#each players as player}
                <li>{player.name} {player.id === socket?.id ? '(you)' : ''}</li>
            {/each}
        </ul>

        {#if lobbyCreated}
        <button onclick={startGame} class="rounded-md bg-red-600 px-6 py-3 mt-8 text-xl">
            Start Game (when everyone is here)
        </button>
        {/if}
    {/if}
</div>

<style>
</style>
