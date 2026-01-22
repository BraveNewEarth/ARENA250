export interface Landmark {
    id: string;
    name: string;
    replacement: string;
    macho_gain: number;
    decay_cost: number;
    isBuilt: boolean;
    image: string;
}

export interface Artifact {
    name: string;
    trigger: string;
    reality: string;
    isUnlocked: boolean;
}

export interface GameState {
    macho: number;
    decay: number;
    landmarks: Landmark[];
    artifacts: Artifact[];
    activeBuff: { name: string; bonus: number; description: string } | null;
    buildLandmark: (id: string) => void;
    checkArtifactTriggers: () => void;
    performLandmarkAction: (id: string, actionType: string, payload?: any) => void;
}
