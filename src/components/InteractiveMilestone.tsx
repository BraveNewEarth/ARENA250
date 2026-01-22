import React from 'react';
import { useGameStore } from '../store/useGameStore';

export const InteractiveMilestone = () => {
    const { activeMilestone, dismissMilestone } = useGameStore();

    if (!activeMilestone) return null;

    return (
        <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4">
            <div className="bg-zinc-900 border-4 border-gilded-gold p-8 max-w-lg text-center shadow-[0_0_50px_rgba(212,175,55,0.4)] animate-in zoom-in-95 duration-300">
                <div className="text-6xl mb-4">🏆</div>
                <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-2">
                    Milestone Reached!
                </h2>
                <div className="h-1 w-24 bg-macho-red mx-auto mb-6"></div>

                <p className="text-xl text-gilded-gold font-bold italic font-serif mb-8 leading-relaxed">
                    "{activeMilestone.message}"
                </p>

                <button
                    onClick={dismissMilestone}
                    className="bg-macho-red hover:bg-red-700 text-white font-black uppercase tracking-widest py-3 px-8 rounded transition-all hover:scale-105 active:scale-95 shadow-lg"
                >
                    Soak up the applause!
                </button>
            </div>
        </div>
    );
};
