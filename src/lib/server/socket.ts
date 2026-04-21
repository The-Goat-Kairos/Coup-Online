import { Server as SocketIOServer } from "socket.io";
import type { Server as HTTPServer } from 'http';
import { lobbies } from './lobbies';

let io: SocketIOServer | null = null

export function initSocket(server: HTTPServer) {
    if (io) return io;

    io = new SocketIOServer(server, {
        cors: { origin: '*' } // TODO: Adjust for production later?
    });

    io.on('connection', (socket) => {
        console.log("Player Connected:", socket.id);

        socket.on('createLobby', (playerName: string) => {
            const lobbyCode = generateLobbyCode();
            // Create new lobby with the creator as first player

            lobbies.set(lobbyCode, [{
                id: socket.id,
                name: playerName,
                isHost: true,
            }]);

            socket.join(lobbyCode); // Join socket.io room
            socket.emit('lobbyCreated', {
                code: lobbyCode,
                players: lobbies.get(lobbyCode)!
            });

            console.log(`Lobby Created: ${lobbyCode} by ${playerName}`);
        });

        socket.on('nameChanged', (code: string, newName: string) => {
            const lobby = lobbies.get(code);

            if (!lobby) {
                socket.emit('error', { message: 'Lobby does not exist' });
                return;
            }

            const player = lobby.find(p => p.id === socket.id);
            if (player) {
                const oldName = player.name;
                player.name = newName;

                io?.to(code).emit('lobbyUpdated', { code, players: lobby });
                console.log(`Name changed in ${code}: ${oldName} → ${newName}`);
            }

        });

        socket.on('joinLobby', (code: string, playerName: string) => {
            const lobby = lobbies.get(code)

            if (!lobby) {
                socket.emit('error', { message: 'Lobby does not exist' });
                return;
            }

            if (lobby.length >= 6) {
                socket.emit('error', { message: 'Lobby is full' });
            }

            lobby.push({
                id: socket.id,
                name: playerName,
                isHost: false,
            })
            socket.join(code);

            io?.to(code).emit('lobbyUpdated', {
                code,
                players: lobby
            });

            console.log(`${playerName} join lobby ${code}.`);
        });

        socket.on('startGame', (code: string) => {
            const lobby = lobbies.get(code);
            if (!lobby || lobby.length < 2) {
                socket.emit('error', { message: 'Not enough players' });
                return;
            }

            // TODO: Coup game state
            io?.to(code).emit('gameStarted', {
                code,
                players: lobby.map(p => ({ id: p.id, name: p.name })),
                // publicState: { ... }
            });

            console.log(`Game started in lobby ${code}`);
        });

        // More events later: action, challenge, block, loseInfluence, etc.

        socket.on('disconnect', () => {
            console.log(`Player disconnected: ${socket.id}.`);

            for (const [code, players] of lobbies.entries()) {
                const index = players.findIndex(p => p.id === socket.id);
                if (index !== -1) {
                    players.splice(index, 1);

                    if (players.length === 0) {
                        lobbies.delete(code);
                    } else {
                        io?.to(code).emit('lobbyUpdated', {
                            code,
                            players
                        });
                    }
                    break;
                }
            }
        });
    });

    return io;
}

function generateLobbyCode(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export { lobbies };
