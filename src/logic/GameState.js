import { create } from 'zustand';

const useGameState = create((set, get) => ({
    machoBravado: 10,
    civilicDecay: 0,
    revenue: 1000000, // Starts with a small loan of a million dollars?

    // Unlocks
    milestones: {
        roseGardenDestroyed: false,
        eastWingDemolished: false,
        heavyweightOctagonUnlocked: false,
        gildedVIPLoungeUnlocked: false,
    },

    // Actions
    addMacho: (amount) => set((state) => {
        const newMacho = Math.min(100, state.machoBravado + amount);
        // Macho increases decay
        const decayIncrease = amount * 0.5;
        return {
            machoBravado: newMacho,
            civilicDecay: Math.min(100, state.civilicDecay + decayIncrease)
        };
    }),

    destroyRoseGarden: () => set((state) => {
        if (state.milestones.roseGardenDestroyed) return {};
        return {
            machoBravado: state.machoBravado + 20,
            civilicDecay: state.civilicDecay + 15,
            revenue: state.revenue - 50000, // Cost of bulldozers
            milestones: {
                ...state.milestones,
                roseGardenDestroyed: true,
                heavyweightOctagonUnlocked: true
            }
        };
    }),

    demolishEastWing: () => set((state) => {
        if (state.milestones.eastWingDemolished) return {};
        return {
            machoBravado: state.machoBravado + 35,
            civilicDecay: state.civilicDecay + 25,
            revenue: state.revenue - 200000,
            milestones: {
                ...state.milestones,
                eastWingDemolished: true,
                gildedVIPLoungeUnlocked: true
            }
        };
    }),

    collectRevenue: () => set((state) => ({
        revenue: state.revenue + (state.machoBravado * 1000)
    })),
}));

export default useGameState;
