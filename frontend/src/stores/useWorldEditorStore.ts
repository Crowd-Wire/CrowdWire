import create from "zustand";
import { combine } from "zustand/middleware";


enum PaintToolType {
    STAMP = "STAMP",
    FILL = "FILL",
    SHAPE = "SHAPE",
    ERASE = "ERASE",
}


export interface Tile {
    id: number;
    height: number;
    width: number;
    imageURL: string;
}

interface Layer {
    visible: boolean;
}

interface PaintTool {
    type?: PaintToolType;
    tile?: Tile;
}

const useWorldEditorStore = create(
    combine(
        {   
            ready: false,
            activeLayer: null,
            layers: {} as Record<string, Layer>,
            paintTool: {} as PaintTool,
        },
        (set) => ({
            setReady: () => {
                return set(() => {
                    return { ready: true };
                });
            },
            setPaintTool: (settings: PaintTool) => {
                return set((s) => {
                    return { paintTool: {...s.paintTool, ...settings} };
                });
            },
            setActiveLayer: (activeLayer: string) => {
                return set(() => {
                    return { activeLayer };
                });
            },
            setLayer: (name: string, settings: Layer) => {
                return set((s) => {
                    const layers = {...s.layers};
                    layers[name] = {...layers[name], ...settings};
                    return { layers };
                });
            },
        })
    )
);

export default useWorldEditorStore;
