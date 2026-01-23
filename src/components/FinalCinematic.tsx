
import { useGameStore } from '../store/useGameStore';

export const FinalCinematic = () => {
    const decay = useGameStore(state => state.decay);
    const resetGame = useGameStore(state => state.resetGame);

    if (decay < 100) return null;

    return (
        <div className="fixed inset-0 z-[999] bg-black/95 backdrop-blur-sm flex flex-col items-center justify-center text-center p-4 md:p-8 animate-in fade-in duration-[3000ms] overflow-y-auto">
            <h1 className="text-5xl md:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-b from-macho-red to-black mb-4 md:mb-8 animate-pulse uppercase tracking-tighter drop-shadow-lg">
                FALL OF ROME
            </h1>
            <p className="text-gray-400 text-lg md:text-2xl font-serif italic max-w-3xl leading-relaxed px-4">
                "And so the curtain falls. Not with a whimper, but with a roar of applause for the destruction. The Republic is dead. Long live the Ratings."
            </p>

            <div className="mt-12 md:mt-16 space-y-8 flex flex-col items-center animate-bounce">
                <span className="text-macho-red text-xs uppercase tracking-[0.5em] border border-macho-red/30 px-4 py-2 rounded mb-4">
                    Game Over
                </span>

                <button
                    onClick={resetGame}
                    className="pointer-events-auto px-8 py-4 bg-gradient-to-r from-macho-red to-red-900 text-white font-black uppercase tracking-widest rounded transition-transform hover:scale-105 active:scale-95 shadow-lg shadow-macho-red/20 border border-macho-red/50"
                >
                    Restart The Simulation
                </button>
            </div>
        </div>
    );
};
