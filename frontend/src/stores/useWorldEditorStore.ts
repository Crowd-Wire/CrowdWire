import create from "zustand";
import { combine } from "zustand/middleware";


export enum PaintToolType {
    DRAW = "DRAW",
    FILL = "FILL",
    SELECT = "SELECT",
    ERASE = "ERASE",
    PICK = "PICK",
}


interface Layer {
    visible: boolean;
}

interface PaintTool {
    type?: PaintToolType;
    tileId?: number;
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
