import create from "zustand";
import { combine } from "zustand/middleware";


export enum PaintToolType {
    NONE = "",
    DRAW = "DRAW",
    FILL = "FILL",
    SELECT = "SELECT",
    ERASE = "ERASE",
    PICK = "PICK",
}

export interface PaintTool {
    type?: PaintToolType;
}

interface Tile {
    style?: Record<string, string>;
}
export interface Conference {
    name: string;
    color: string;
}

interface Layer {
    visible?: boolean;
    blocked?: boolean;
    active?: boolean;
}

const useWorldEditorStore = create(
    combine(
        {   
            ready: false,
            grid: false,
            highlight: false,
            activeTile: null,
            activeLayer: null,
            activeConference: null,
            tiles: {} as Record<string, Tile>,
            layers: {} as Record<string, Layer>,
            conferences: {} as Record<string, Conference>,
            paintTool: {} as PaintTool,
        },
        (set) => ({
            setState: (state: any) => {
                return set(() => {
                    return { ...state };
                });
            },
            setPaintTool: (settings: PaintTool) => {
                return set((s) => {
                    return { paintTool: {...s.paintTool, ...settings} };
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
            setLayer: (name: string, settings: Layer) => {
                return set((s) => {
                    const layers = {...s.layers};
                    layers[name] = {...layers[name], ...settings};
                    return { layers };
                });
            },
            setLayers: (settings: Layer) => {
                return set((s) => {
                    const layers = {...s.layers};
                    Object.keys(layers).map((name) => {
                        layers[name] = {...layers[name], ...settings}
                    })
                    return { layers };
                });
            },
        })
    )
);

export default useWorldEditorStore;
