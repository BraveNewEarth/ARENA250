import { useState } from 'react';
import { useGameStore } from '../store/useGameStore';
import ruinedColosseum from '../assets/ruined_colosseum.png';
import ghostlyAmerica from '../assets/ghostly_america.png';

export const Ruins = () => {
    const { resetGame } = useGameStore();
    const [showGhostlyMemory, setShowGhostlyMemory] = useState(false);

    const handleReflect = () => {
        setShowGhostlyMemory(true);
        setTimeout(() => {
            resetGame();
        }, 4000); // 4 seconds to reflect before reset
    };

    return (
        <div className="fixed inset-0 z-[100] bg-void-black flex items-center justify-center overflow-hidden">
            {/* Background Image */}
            <div
                className="absolute inset-0 bg-cover bg-center transition-all duration-[3000ms] ease-out scale-105"
                style={{ backgroundImage: `url(${ruinedColosseum})` }}
            >
                <div className="absolute inset-0 bg-black/60"></div>
            </div>

            {/* Ember Particles (CSS Animation Simulation) */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="animate-float-up absolute bottom-0 left-1/4 w-2 h-2 bg-orange-500 rounded-full blur-[1px] opacity-80" style={{ animationDuration: '4s' }}></div>
                <div className="animate-float-up absolute bottom-0 left-3/4 w-1 h-1 bg-red-400 rounded-full blur-[1px] opacity-60" style={{ animationDuration: '6s', animationDelay: '1s' }}></div>
                <div className="animate-float-up absolute bottom-1/4 left-1/2 w-1.5 h-1.5 bg-yellow-600 rounded-full blur-[1px] opacity-70" style={{ animationDuration: '5s', animationDelay: '2s' }}></div>
                {/* Basic Ember Simulation - can be improved with many more divs or a canvas, but simple is good for now */}
            </div>

            {/* Content Container */}
            <div className={`relative z-10 max-w-4xl mx-auto text-center px-6 transition-opacity duration-1000 ${showGhostlyMemory ? 'opacity-0' : 'opacity-100'}`}>
                <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-700 to-black uppercase tracking-widest drop-shadow-lg mb-8 border-b-2 border-yellow-800/30 pb-4">
                    The Patriot Games: Arena 250<br />
                    <span className="text-2xl md:text-3xl text-red-900 block mt-4">The End of the Experiment</span>
                </h1>

                <div className="bg-black/80 border border-yellow-900/40 p-8 rounded-sm shadow-2xl backdrop-blur-sm max-w-2xl mx-auto transform transition-all hover:scale-[1.01]">
                    <div className="uppercase text-yellow-800 text-xs font-bold tracking-[0.3em] mb-4">Promoter Log: Final Entry</div>
                    <p className="text-xl md:text-2xl text-yellow-100/90 font-serif italic leading-relaxed">
                        "The Colosseum stands. The crowds are roaring. But the House is empty. We traded the foundation for the show."
                    </p>
                </div>

                <button
                    onClick={handleReflect}
                    className="mt-12 bg-transparent text-yellow-700 border border-yellow-800/50 px-8 py-3 uppercase tracking-widest text-sm font-bold hover:bg-yellow-900/20 hover:text-yellow-500 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-yellow-900 rounded-sm"
                >
                    Reflect on the Experiment
                </button>
            </div>

            {/* Ghostly Memory Overlay */}
            <div className={`absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-[2000ms] ${showGhostlyMemory ? 'opacity-40' : 'opacity-0'}`}>
                <img src={ghostlyAmerica} alt="Ghostly America Unity" className="max-w-md w-full opacity-60 blur-[1px]" />
            </div>
        </div>
    );
};
