import { redirect } from "@sveltejs/kit";
import { lobbies } from "$lib/server/lobbies";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = ({ params }) => {
    const code = params.lobbyCode?.toUpperCase().trim();

    if (!code || code.length !== 6) {
        throw redirect(308, '/');
    }

    const lobbyPlayers = lobbies.get(code);

    if (!lobbyPlayers) {
        // throw redirect(308, '/');
        return {
            lobbyCode: "123456",
            players: [{
                id: "tests1",
                name: "testing",
                isHost: true
            }, {
                id: "tests2",
                name: "tester",
                isHost: false
            }]
        }
    }

    return {
        lobbyCode: code,
        players: lobbyPlayers
    };
};
