import type { PageLoad } from "./$types";

export const load: PageLoad = ({ params }) => {
    const code = params.lobbyCode?.toUpperCase().trim();

    if (!code || code.length !== 6) {
        goto('/');
    }

    const lobbyPlayers = lobbies.get(code);

    if (!lobbyPlayers) {
        error(404, 'This lobby does not exist');
    }

    return {
        lobbyCode: code,
        players: lobbyPlayers
    };
};
