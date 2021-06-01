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


interface Layer {
    visible?: boolean;
    blocked?: boolean;
    highlighted?: boolean;
}

export interface PaintTool {
    type?: PaintToolType;
    tileId?: number;
}

const useWorldEditorStore = create(
    combine(
        {   
            ready: false,
            highlight: false,
            activeLayer: null,
            activeConference: null,
            layers: {} as Record<string, Layer>,
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
