import create from "zustand";
import { combine } from "zustand/middleware";


interface Vector {
    x: number;
    y: number;
}

interface Player {
    position: Vector;
    velocity: Vector;
    //name
}

interface Player2 {
    name: string
}

const usePlayerStore = create(
    combine(
        {   
            groups: {} as Record<string, string[]>,
            players: {} as Record<string, Player>,
            groupPlayers: {} as Record<string, Player2>,
        },
        (set) => ({
            connectPlayers: (snapshot: Record<string, Vector>) => {
                return set(() => {
                    const players = {};
                    for (const [id, position] of Object.entries(snapshot)) {
                        players[id] = { position, velocity: { x: 0, y: 0 } };
                    }
                    return { players };
                });
            },
            connectPlayer: (id: string, position: Vector) => {
                return set((s) => {
                    const players = {...s.players};
                    players[id] = { position, velocity: { x: 0, y: 0 } };
                    return { players };
                });
            },
            disconnectPlayer: (id: string) => {
                return set((s) => {
                    const players = {...s.players};
                    delete players[id];
                    return { players };
                });
            },
            wirePlayers: (ids: string[], merge: boolean) => {
                return set((s) => {
                    if (merge) {
                        const groupPlayers = {...s.groupPlayers};
                        for (const id of ids)
                            groupPlayers[id] = { name: `User ${id}` };
                        return { groupPlayers };
                    }
                    const groupPlayers = {} as Record<string, Player2>;
                    for (const id of ids)
                        groupPlayers[id] = { name: `User ${id}` };
                    return { ...s, groupPlayers };
                }, !merge);
            },
            unwirePlayers: (ids: string[], merge: boolean) => {
                return set((s) => {
                    if (merge) {
                        const groupPlayers = {...s.groupPlayers};
                        for (const id of ids)
                            delete groupPlayers[id];
                        return { groupPlayers };
                    }
                    const groupPlayers = {} as Record<string, Player2>;
                    for (const id of ids)
                        groupPlayers[id] = { name: `User ${id}` };
                    return { ...s, groupPlayers };
                }, !merge);
            },
            movePlayer: (id: string, position: Vector, velocity: Vector) => {
                return set((s) => {
                    const players = {...s.players};
                    players[id] = { position: position, velocity: velocity };
                    return { players };
                });
            },
            setGroups: (grps: Record<string, string[]>) => {
                return set((s) => {
                    return { ...s, groups: grps };
                }, true);
            },

        })
    )
);

export default usePlayerStore;
