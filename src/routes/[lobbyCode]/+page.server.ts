import { redirect } from "@sveltejs/kit";
import { lobbies } from "$lib/server/lobbies";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = ({ params }) => {
    const code = params.lobbyCode?.toUpperCase().trim();

    // if (!code || code.length !== 6) {
    //     throw redirect(308, '/');
    // }

    const lobbyPlayers = lobbies.get(code);

    if (!lobbyPlayers) {
        // throw redirect(308, '/');
        return {
            lobbyCode: "123456",
            players: [{
                id: "test1",
                name: "test1",
                isHost: true
            }, {
                id: "test2",
                name: "test2",
                isHost: false
            },
            {
                id: "test3",
                name: "test3",
                isHost: false
            },
            {
                id: "test4",
                name: "test4",
                isHost: false
            },
            {
                id: "test5",
                name: "test5",
                isHost: false
            },
            ]
        }
    }

    return {
        lobbyCode: code,
        players: lobbyPlayers
    };
};
