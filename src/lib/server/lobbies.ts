import type { Player } from '$lib/types';

declare global {
    var coup_lobbies: Map<string, Player[]> | undefined;
}

if (!globalThis.coup_lobbies) {
    globalThis.coup_lobbies = new Map<string, Player[]>();
}

export const lobbies = globalThis.coup_lobbies;
