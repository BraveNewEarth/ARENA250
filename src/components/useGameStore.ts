import { create } from 'zustand';
import type { GameState } from '../types';

interface LogEntry {
    id: string;
    message: string;
    source: "Promoter" | "System" | "The Swamp";
    timestamp: number;
}

interface Milestone {
    threshold: number;
    message: string;
    reached: boolean;
}

const MILESTONES: Milestone[] = [
    { threshold: 25, message: "Look at you! Trading dust for dominance! The crowd loves a winner, even a fake one!", reached: false },
    { threshold: 50, message: "Halfway to glory! Or is it hell? Who cares! The ratings are through the roof!", reached: false },
    { threshold: 75, message: "They're chanting your name! Or maybe they're screaming. Same thing in this town!", reached: false },
    { threshold: 100, message: "MAXIMUM MACHO! You are the King of the Ashes! Bow before your own reflection!", reached: false },
];

import ufcOctagon from '../assets/ufc_octagon.png';
import gladiatorHelmet from '../assets/gladiator_helmet.png';
import whiteHouseNight from '../assets/white_house_night.png';

const INITIAL_LANDMARKS = [
    { id: "rose_garden", name: "The Rose Garden", replacement: "The UFC Octagon", macho_gain: 25, decay_cost: 15, isBuilt: false, image: ufcOctagon },
    { id: "east_wing", name: "The East Wing", replacement: "VIP Betting Ballroom", macho_gain: 40, decay_cost: 25, isBuilt: false, image: gladiatorHelmet },
    { id: "portico", name: "South Portico", replacement: "Gladiator Entrance", macho_gain: 15, decay_cost: 10, isBuilt: false, image: whiteHouseNight }
];

const INITIAL_ARTIFACTS = [
    { name: "Shattered Constitution", trigger: "Macho > 80", reality: "The foundation of the Republic discarded for a cage match.", isUnlocked: false },
    { name: "Gilded Nobel Prize", trigger: "Build VIP Ballroom", reality: "Diplomacy melted down to gold-plate a champion's belt.", isUnlocked: false },
    { name: "The People's Megaphone", trigger: "Macho > 40", reality: "A golden megaphone that only broadcasts insults.", isUnlocked: false }
];

type CharacterType = 'promoter' | 'statesman' | null;

interface CharacterStats {
    id: CharacterType;
    name: string;
    description: string;
    machoMultiplier: number;
    decayMultiplier: number;
    special: string;
}

const CHARACTERS: CharacterStats[] = [
    {
        id: 'promoter',
        name: 'The Promoter',
        description: 'High Macho gain, but high Decay risk. Go big or go home!',
        machoMultiplier: 1.5,
        decayMultiplier: 1.5,
        special: 'Pyrotechnics - Double damage in combat'
    },
    {
        id: 'statesman',
        name: 'The Statesman',
        description: 'Low Macho, but keeps Decay at zero. Hard Mode for the dignified.',
        machoMultiplier: 0.5,
        decayMultiplier: 0,
        special: 'Civic Reflection - Heal 10 HP in combat'
    }
];

interface ExtendedGameState extends GameState {
    logs: LogEntry[];
    unlockedEvents: string[];
    milestones: Milestone[];
    activeMilestone: Milestone | null;
    decayStage: 0 | 1 | 2 | 3;
    isGameOver: boolean;
    selectedCharacter: CharacterType;
    gameStarted: boolean;
    characters: CharacterStats[];
    addLog: (message: string, source: "Promoter" | "System" | "The Swamp") => void;
    dismissMilestone: () => void;
    resetGame: () => void;
    quickRestart: () => void;
    resolveCombat: (winner: 'player' | 'opponent') => void;
    selectCharacter: (character: CharacterType) => void;
    startGame: () => void;
}

export const useGameStore = create<ExtendedGameState>((set, get) => ({
    macho: 0,
    decay: 0,
    landmarks: INITIAL_LANDMARKS,
    artifacts: INITIAL_ARTIFACTS,
    logs: [],
    unlockedEvents: [],
    milestones: MILESTONES,
    activeMilestone: null,
    decayStage: 0,
    isGameOver: false,
    selectedCharacter: null,
    gameStarted: true,
    characters: CHARACTERS,
    activeBuff: null,

    addLog: (message, source) => {
        set((state) => ({
            logs: [{
                id: crypto.randomUUID(),
                message,
                source,
                timestamp: Date.now()
            }, ...state.logs].slice(0, 50) // Keep last 50 logs
        }));
    },

    dismissMilestone: () => set({ activeMilestone: null }),

    resetGame: () => {
        set({
            macho: 0,
            decay: 0,
            landmarks: INITIAL_LANDMARKS,
            artifacts: INITIAL_ARTIFACTS,
            logs: [],
            unlockedEvents: [],
            milestones: MILESTONES,
            activeMilestone: null,
            decayStage: 0,
            isGameOver: false,
            selectedCharacter: null,
            gameStarted: false
        });
    },

    quickRestart: () => {
        set({
            macho: 0,
            decay: 0,
            landmarks: INITIAL_LANDMARKS,
            artifacts: INITIAL_ARTIFACTS,
            logs: [],
            unlockedEvents: [],
            milestones: MILESTONES,
            activeMilestone: null,
            decayStage: 0,
            isGameOver: false,
            // Keep selectedCharacter and gameStarted as is
        });
        // Log the restart
        get().addLog("The Simulation has been reset. Try again, winner!", "System");
    },

    selectCharacter: (character) => {
        set({ selectedCharacter: character });
    },

    startGame: () => {
        const { selectedCharacter, addLog } = get();
        if (selectedCharacter) {
            set({ gameStarted: true });
            const charName = selectedCharacter === 'promoter' ? 'The Promoter' : 'The Statesman';
            addLog(`Welcome to the Arena, ${charName}! Let the games begin!`, 'Promoter');
        }
    },

    resolveCombat: (winner: 'player' | 'opponent') => {
        set((state) => {
            if (winner === 'player') {
                const newMacho = state.macho + 20;
                return {
                    macho: newMacho,
                    logs: [{
                        id: crypto.randomUUID(),
                        message: "KNOCKOUT! The Promoter reigns supreme! +20 MACHO!",
                        source: "Promoter" as const,
                        timestamp: Date.now()
                    }, ...state.logs].slice(0, 50)
                };
            } else {
                const newDecay = state.decay + 15;
                let newDecayStage: 0 | 1 | 2 | 3 = state.decayStage;
                if (newDecay > 75) newDecayStage = 3;
                else if (newDecay > 50) newDecayStage = 2;
                else if (newDecay > 25) newDecayStage = 1;

                return {
                    decay: newDecay,
                    decayStage: newDecayStage,
                    isGameOver: newDecay >= 100,
                    logs: [{
                        id: crypto.randomUUID(),
                        message: "The Spectacle failed! The crowd grows restless... +15 DECAY.",
                        source: "System" as const,
                        timestamp: Date.now()
                    }, ...state.logs].slice(0, 50)
                };
            }
        });
        get().checkArtifactTriggers();
    },

    performLandmarkAction: (id, actionType, payload) => {
        set((state) => {
            // Rose Garden: UFC Betting
            if (id === 'rose_garden' && actionType === 'BET') {
                const choice = payload as 'RED' | 'BLUE';
                const winner = Math.random() > 0.5 ? 'RED' : 'BLUE';
                const isWin = choice === winner;

                if (isWin) {
                    return {
                        macho: state.macho + 15,
                        logs: [{
                            id: crypto.randomUUID(),
                            message: `WINNER! You backed ${choice} and they delivered a skull-crushing KO! +15 Macho!`,
                            source: "Promoter" as const,
                            timestamp: Date.now()
                        }, ...state.logs].slice(0, 50)
                    };
                } else {
                    return {
                        decay: state.decay + 10,
                        logs: [{
                            id: crypto.randomUUID(),
                            message: `FIXED FIGHT! ${choice} took a dive in the first round! The crowd is throwing chairs! +10 Decay!`,
                            source: "The Swamp" as const,
                            timestamp: Date.now()
                        }, ...state.logs].slice(0, 50)
                    };
                }
            }

            // East Wing: VIP Gala (Schmooze)
            if (id === 'east_wing' && actionType === 'SCHMOOZE') {
                if (state.macho >= 30) {
                    const narratives = [
                        "Sold the Lincoln Bedroom furniture to buy more gold plating! Donors love it! Decay -20!",
                        "Replaced the history books with cocktail menus. Discussing the 'real' truth over caviar! Decay -20!",
                        "Auctioned off the First Lady's shovel to a fracking CEO! He loves 'digging up dirt'! Decay -20!",
                        "Hosted an 'End of History' masquerade. The elites are literally dancing on the archives! Decay -20!",
                        "Convinced a hedge fund manager that 'Democracy' is just a distressed asset. He's buying in! Decay -20!"
                    ];
                    const randomMsg = narratives[Math.floor(Math.random() * narratives.length)];

                    return {
                        macho: state.macho - 30,
                        decay: Math.max(0, state.decay - 20),
                        logs: [{
                            id: crypto.randomUUID(),
                            message: randomMsg,
                            source: "Promoter" as const,
                            timestamp: Date.now()
                        }, ...state.logs].slice(0, 50)
                    };
                } else {
                    return {
                        logs: [{
                            id: crypto.randomUUID(),
                            message: `GALA FAILED! You can't afford the shrimp cocktail! You need 30 Macho!`,
                            source: "System" as const,
                            timestamp: Date.now()
                        }, ...state.logs].slice(0, 50)
                    };
                }
            }

            // South Portico: Gladiator Recruitment
            if (id === 'portico' && actionType === 'RECRUIT') {
                if (state.macho >= 10) {
                    const gladiators = [
                        { name: "The Tactical Larper", bonus: 15, desc: "Has 50lbs of gear, can't run." },
                        { name: "Florida Gator Man", bonus: 25, desc: "Literally just a guy with a gator." },
                        { name: "Cancelled Celebrity", bonus: 10, desc: "Fighting for a comeback special." },
                        { name: "Disgraced General", bonus: 30, desc: "Knows where the bodies are buried." },
                        { name: "Q-Shaman's Mom", bonus: 40, desc: "Brought organic snacks and rage." }
                    ];
                    const recruit = gladiators[Math.floor(Math.random() * gladiators.length)];

                    return {
                        macho: state.macho - 10,
                        activeBuff: { name: recruit.name, bonus: recruit.bonus, description: recruit.desc },
                        logs: [{
                            id: crypto.randomUUID(),
                            message: `GATE OPENED! Enter: ${recruit.name}! (+${recruit.bonus} Combat Bonus)`,
                            source: "Promoter" as const,
                            timestamp: Date.now()
                        }, ...state.logs].slice(0, 50)
                    };
                } else {
                    return {
                        logs: [{
                            id: crypto.randomUUID(),
                            message: `RECRUITMENT FAILED! Even the desperate need an appearance fee (10 Macho)!`,
                            source: "System" as const,
                            timestamp: Date.now()
                        }, ...state.logs].slice(0, 50)
                    };
                }
            }
            return {};
        });
    },

    buildLandmark: (id: string) => {
        set((state) => {
            const landmarkIndex = state.landmarks.findIndex(l => l.id === id);
            if (landmarkIndex === -1) return state;
            if (state.landmarks[landmarkIndex].isBuilt) return state;

            const newLandmarks = [...state.landmarks];
            newLandmarks[landmarkIndex] = { ...newLandmarks[landmarkIndex], isBuilt: true };

            const landmark = newLandmarks[landmarkIndex];
            const newMacho = state.macho + landmark.macho_gain;
            const newDecay = state.decay + landmark.decay_cost;

            // Calculate Decay Stage
            let newDecayStage: 0 | 1 | 2 | 3 = 0;
            if (newDecay > 75) newDecayStage = 3;
            else if (newDecay > 50) newDecayStage = 2;
            else if (newDecay > 25) newDecayStage = 1;

            // Check for Game Over (CivilicDecay >= 100)
            let isGameOver = false;
            if (newDecay >= 100) {
                isGameOver = true;
            }

            // Log the destruction
            const logMessage = `Trash it! "${landmark.name}" is gone! Only wimps need history! We got "${landmark.replacement}" now!`;
            const newLogs = [{
                id: crypto.randomUUID(),
                message: logMessage,
                source: "Promoter" as const,
                timestamp: Date.now()
            }, ...state.logs].slice(0, 50);

            // Unlock Events logic
            const newUnlockedEvents = [...state.unlockedEvents];
            if (landmark.id === "east_wing" && !newUnlockedEvents.includes("Gilded Nobel Prize")) {
                newUnlockedEvents.push("Gilded Nobel Prize");
            }

            // Check artifacts
            const newArtifacts = state.artifacts.map(a => {
                if (a.isUnlocked) return a;
                if (a.trigger === "Build VIP Ballroom" && landmark.replacement === "VIP Betting Ballroom") return { ...a, isUnlocked: true };
                return a;
            });

            // Check Milestones
            let newActiveMilestone = state.activeMilestone;
            const newMilestones = state.milestones.map(m => {
                if (!m.reached && newMacho >= m.threshold) {
                    newActiveMilestone = { ...m, reached: true }; // Set as active to trigger popup
                    return { ...m, reached: true };
                }
                return m;
            });

            return {
                landmarks: newLandmarks,
                macho: newMacho,
                decay: newDecay,
                artifacts: newArtifacts,
                logs: newLogs,
                decayStage: newDecayStage,
                unlockedEvents: newUnlockedEvents,
                milestones: newMilestones,
                activeMilestone: newActiveMilestone || state.activeMilestone,
                isGameOver: isGameOver
            };
        });

        get().checkArtifactTriggers();
    },

    checkArtifactTriggers: () => {
        set((state) => {
            const newArtifacts = state.artifacts.map(a => {
                if (a.isUnlocked) return a;
                if (a.trigger === "Macho > 80" && state.macho > 80) return { ...a, isUnlocked: true };
                if (a.trigger === "Macho > 40" && state.macho > 40) return { ...a, isUnlocked: true };
                return a;
            });
            return { artifacts: newArtifacts };
        });
    }
}));
