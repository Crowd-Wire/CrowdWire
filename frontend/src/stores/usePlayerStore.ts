import create from "zustand";
import { combine } from "zustand/middleware";


interface Vector {
    x: number;
    y: number;
}

interface PlayerMovement {
    position: Vector;
    velocity: Vector;
}

const usePlayerStore = create(
    combine(
        {
            players: {} as Record<string, PlayerMovement>,
        },
        (set) => ({
            connectPlayer: (id: string, position: Vector) => {
                return set((s) => {
                    const players = {...s.players};
                    players[id] = { position: position, velocity: { x: 0, y: 0 } };
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
            movePlayer: (id: string, position: Vector, velocity: Vector) => {
                return set((s) => {
                    const players = {...s.players};
                    players[id] = { position: position, velocity: velocity };
                    return { players };
                });
            }

        })
    )
);

export default usePlayerStore;
