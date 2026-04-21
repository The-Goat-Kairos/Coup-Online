import { goto } from '$app/navigation';
import { lobbies } from "$lib/server/lobbies";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = ({ params }) => {
    const code = params.lobbyCode?.toUpperCase().trim();

    if (!code || code.length !== 6) {
        goto('/');
    }

    console.log(lobbies);
    const lobbyPlayers = lobbies.get(code);

    if (!lobbyPlayers) {
        goto('/');
    }

    return {
        lobbyCode: code,
        players: lobbyPlayers
    };
};
