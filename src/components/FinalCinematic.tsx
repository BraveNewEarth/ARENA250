import ruinedColosseum from '../assets/ruined_colosseum.png';
import { useGameStore } from '../store/useGameStore';

export const FinalCinematic = () => {
    const decay = useGameStore(state => state.decay);
    const quickRestart = useGameStore(state => state.quickRestart);

    if (decay < 100) return null;

    return (
        <div className="fixed inset-0 z-[999] bg-black flex flex-col items-center justify-center text-center p-4 md:p-8 animate-in fade-in duration-[3000ms] overflow-y-auto">
            {/* Background Image with Overlay */}
            <div
                className="absolute inset-0 z-0 bg-cover bg-center opacity-40 grayscale"
                style={{ backgroundImage: `url(${ruinedColosseum})` }}
            />
            <div className="absolute inset-0 z-0 bg-gradient-to-t from-black via-black/80 to-transparent" />

            <div className="relative z-10 flex flex-col items-center max-w-4xl mx-auto">
                <h1 className="text-6xl md:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-b from-red-500 to-red-900 mb-6 animate-pulse uppercase tracking-tighter drop-shadow-[0_0_25px_rgba(220,38,38,0.8)] filter">
                    FALL OF ROME
                </h1>

                <div className="bg-black/60 p-6 rounded-xl border border-red-900/30 backdrop-blur-sm mb-12">
                    <p className="text-gray-200 text-xl md:text-3xl font-serif italic leading-relaxed drop-shadow-md">
                        "And so the curtain falls. Not with a whimper, but with a roar of applause for the destruction. The Republic is dead. Long live the Ratings."
                    </p>
                </div>

                <div className="space-y-8 flex flex-col items-center">
                    <span className="text-red-500 font-bold text-sm uppercase tracking-[0.5em] border border-red-500/50 px-6 py-2 rounded-full bg-black/50">
                        Total System Failure
                    </span>

                    <button
                        onClick={quickRestart}
                        className="group relative pointer-events-auto px-10 py-5 bg-gradient-to-r from-red-700 to-red-900 text-white text-xl font-black uppercase tracking-widest rounded transition-all transform hover:scale-105 hover:shadow-[0_0_30px_rgba(220,38,38,0.5)] border-2 border-red-500"
                    >
                        <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>
                        <span className="relative flex items-center gap-3">
                            <span>🔄</span> Restart The Simulation
                        </span>
                    </button>
                </div>
            </div>
        </div>
    );
};
