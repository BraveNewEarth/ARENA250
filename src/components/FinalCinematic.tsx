import React from 'react';
import { useGameStore } from '../store/useGameStore';

export const FinalCinematic = () => {
    const decay = useGameStore(state => state.decay);

    if (decay < 100) return null;

    return (
        <div className="fixed inset-0 z-[999] bg-black flex flex-col items-center justify-center text-center p-8 animate-in fade-in duration-[5000ms]">
            <h1 className="text-6xl md:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-b from-macho-red to-black mb-8 animate-pulse uppercase tracking-tighter">
                FALL OF ROME
            </h1>
            <p className="text-gray-400 text-xl md:text-2xl font-serif italic max-w-3xl leading-relaxed">
                "And so the curtain falls. Not with a whimper, but with a roar of applause for the destruction. The Republic is dead. Long live the Ratings."
            </p>

            <div className="mt-16 animate-bounce">
                <span className="text-macho-red text-xs uppercase tracking-[0.5em] border border-macho-red/30 px-4 py-2 rounded">
                    Game Over
                </span>
            </div>
        </div>
    );
};
