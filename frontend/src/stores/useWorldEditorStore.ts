import create from "zustand";
import { combine } from "zustand/middleware";


export enum ToolType {
    NONE = "",
    DRAW = "DRAW",
    FILL = "FILL",
    SELECT = "SELECT",
    ERASE = "ERASE",
    PICK = "PICK",
}

export interface Tool {
    type: ToolType;
}

interface Tile {
    style: Record<string, string | number>;
}

interface Object extends Tile { }

interface Wall { }

export interface Conference {
    name: string;
    color: string;
}

export interface Layer {
    visible: boolean;
    blocked: boolean;
    active: boolean;
}

interface Active {
    tile: string;
    object: string;
    wall: string;
    conference: string;
}

const useWorldEditorStore = create(
    combine(
        {
            ready: false,
            grid: false,
            highlight: false,
            save: false,
            activeLayer: null,
            active: {} as Active,
            tiles: {} as Record<string, Tile>,
            // objects: {} as Record<string, Object>,
            // walls: {} as Record<string, Wall>,
            layers: {} as Record<string, Layer>,
            conferences: {} as Record<string, Conference>,
            tool: { type: ToolType.DRAW } as Tool,
        },
        (set) => ({
            setState: (state: any) => {
                return set(() => {
                    return { ...state };
                });
            },
            setActive: (key: 'tile' | 'object' | 'wall' | 'conference', value: string) => {
                return set(() => {
                    if (value) {
                        const active: Active = {
                            tile: null,
                            object: null,
                            wall: null,
                            conference: null,
                        };
                        active[key] = value;
                        return { active };
                    }
                });
            },
            setTool: (partialTool: Partial<Tool>) => {
                return set((s) => {
                    return { tool: { ...s.tool, ...partialTool } };
                });
            },
            setLayer: (name: string, partialLayer: Partial<Layer>) => {
                return set((s) => {
                    const layers = { ...s.layers };
                    layers[name] = { ...layers[name], ...partialLayer };
                    return { layers };
                });
            },
            setLayers: (partialLayer: Partial<Layer>) => {
                return set((s) => {
                    const layers = { ...s.layers };
                    Object.keys(layers).map((name) => {
                        layers[name] = { ...layers[name], ...partialLayer }
                    })
                    return { layers };
                });
            },
            addTile: (id: string, tile: Tile) => {
                return set((s) => {
                    const tiles = s.tiles;
                    tiles[id] = tile;
                    return { tiles };
                });
            },
            addLayers: (layers: Record<string, Layer>) => {
                return set(() => {
                    return { layers };
                });
            },
            remActive: (key: 'tile' | 'object' | 'wall' | 'conference') => {
                return set((s) => {
                    const active = s.active;
                    active[key] = null;
                    return { active };
                });
            },
        })
    )
);

export default useWorldEditorStore;
