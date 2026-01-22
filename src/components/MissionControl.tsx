import { useState } from 'react';
import { useGameStore } from '../store/useGameStore';
import { LandmarkCard } from './LandmarkCard';
import { ArtifactPanel } from './ArtifactPanel';
import { NarrativeOverlay } from './NarrativeOverlay';
import { HistoryLog } from './HistoryLog';
import { FinalCinematic } from './FinalCinematic';
import { InteractiveMilestone } from './InteractiveMilestone';
import { LiveFeed } from './LiveFeed';
import { Ruins } from './Ruins';
import { CombatArena } from './CombatArena';
import { SuppressHistorians } from './SuppressHistorians';
import { CrowdControl } from './CrowdControl';
import { CharacterSelect } from './CharacterSelect';
import southLawnBg from '../assets/south_lawn_arena.png';

export const MissionControl = () => {
    const { macho, decay, landmarks, artifacts, buildLandmark, decayStage, isGameOver } = useGameStore();
    const [showCombat, setShowCombat] = useState(false);
    const [showProtest, setShowProtest] = useState(false);
    const [showCrowdControl, setShowCrowdControl] = useState(false);
    const [showCharacterSelect, setShowCharacterSelect] = useState(false);



    const handleCrowdControlComplete = (success: boolean) => {
        setShowCrowdControl(false);
        const store = useGameStore.getState();
        if (success) {
            store.addLog("Crowd CONTROLLED! +25 Macho for maintaining order!", "Promoter");
        } else {
            store.addLog("The perimeter was breached! -20 Macho!", "The Swamp");
        }
    };

    if (isGameOver) {
        return <Ruins />;
    }

    // Determine visual state based on decayStage
    const getDecayStyles = () => {
        switch (decayStage) {
            case 1: return "bg-rust";
            case 2: return "bg-rust border-cracked";
            case 3: return "bg-rust border-cracked animate-neon-flicker";
            default: return "";
        }
    };

    return (
        <div
            className={`min-h-screen text-gray-100 p-4 md:p-8 font-sans selection:bg-macho-red selection:text-white transition-all duration-1000 bg-cover bg-center bg-no-repeat bg-fixed relative ${getDecayStyles()}`}
            style={{ backgroundImage: `url(${southLawnBg})` }}
        >
            <div className="absolute inset-0 bg-black/80 z-0 select-none pointer-events-none" />
            <div className="relative z-10">
                <NarrativeOverlay />
                <InteractiveMilestone />
                <FinalCinematic />
                {showCombat && <CombatArena onClose={() => setShowCombat(false)} />}
                {showCharacterSelect && <CharacterSelect onStart={() => {
                    setShowCharacterSelect(false);
                    setShowCombat(true);
                }} />}
                {showProtest && <SuppressHistorians onClose={() => setShowProtest(false)} />}
                {showCrowdControl && <CrowdControl onClose={() => setShowCrowdControl(false)} onComplete={handleCrowdControlComplete} />}

                <div className="max-w-7xl mx-auto">
                    <header className="mb-12 text-center relative">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-macho-red/20 blur-[100px] -z-10 rounded-full"></div>

                        <h1 className={`text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-gilded-gold to-yellow-600 uppercase tracking-tighter drop-shadow-sm mb-2 ${decayStage >= 3 ? 'animate-neon-flicker' : ''}`}>
                            The Fall of America
                        </h1>
                        <h2 className="text-2xl md:text-3xl font-bold text-macho-red tracking-[0.2em] uppercase">
                            Arena 250
                        </h2>

                        <div className="mt-8 flex justify-center gap-8 md:gap-16">
                            <div className="flex flex-col items-center p-4 bg-zinc-900/80 rounded-xl border border-macho-red/30 min-w-[120px]">
                                <span className="text-4xl md:text-5xl font-black text-white">{macho}</span>
                                <span className="text-xs text-macho-red font-bold uppercase tracking-widest mt-1">Macho Score</span>
                            </div>
                            <div className="flex flex-col items-center p-4 bg-zinc-900/80 rounded-xl border border-purple-500/30 min-w-[120px]">
                                <span className="text-4xl md:text-5xl font-black text-white">{decay}</span>
                                <span className="text-xs text-purple-400 font-bold uppercase tracking-widest mt-1">Decay Level</span>
                            </div>
                        </div>
                    </header>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <main className="lg:col-span-2 space-y-8">
                            {/* Arena Preview / Hypocrisy Engine */}
                            <div className="bg-zinc-900 border border-gilded-gold/20 p-6 rounded-lg relative overflow-hidden group">
                                <div className="absolute top-0 right-0 bg-gilded-gold text-black text-xs font-bold px-3 py-1 uppercase">
                                    Live Feed
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2 font-serif italic">"The Arena"</h3>
                                <div className="aspect-video w-full rounded bg-black/50 flex items-center justify-center border border-white/5 relative">
                                    <iframe
                                        className="w-full h-full absolute inset-0 rounded"
                                        src="https://www.youtube.com/embed/EYGF2IloY4U?rel=0"
                                        title="The Arena Live Feed"
                                        frameBorder="0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    ></iframe>
                                </div>
                            </div>

                            {/* Combat Button */}
                            <button
                                onClick={() => setShowCharacterSelect(true)}
                                className="w-full py-4 bg-gradient-to-r from-macho-red to-red-800 text-white font-black uppercase tracking-widest rounded-lg border-2 border-gilded-gold/50 hover:from-red-700 hover:to-red-900 hover:border-gilded-gold transition-all duration-300 shadow-lg hover:shadow-macho-red/30"
                            >
                                ⚔️ Initiate Arena Combat! ⚔️
                            </button>

                            {/* Protest Button */}
                            <button
                                onClick={() => setShowProtest(true)}
                                className="w-full py-4 bg-gradient-to-r from-purple-700 to-purple-900 text-white font-black uppercase tracking-widest rounded-lg border-2 border-purple-400/50 hover:from-purple-600 hover:to-purple-800 hover:border-purple-300 transition-all duration-300 shadow-lg hover:shadow-purple-500/30"
                            >
                                📚 Suppress the Historians! 📚
                            </button>

                            {/* Crowd Control Button */}
                            <button
                                onClick={() => setShowCrowdControl(true)}
                                className="w-full py-4 bg-gradient-to-r from-orange-600 to-red-700 text-white font-black uppercase tracking-widest rounded-lg border-2 border-orange-400/50 hover:from-orange-500 hover:to-red-600 hover:border-orange-300 transition-all duration-300 shadow-lg hover:shadow-orange-500/30"
                            >
                                🚐 Crowd Control: Deportation Express 🚐
                            </button>

                            <div className="flex items-center justify-between border-b border-gray-800 pb-4">
                                <h2 className="text-3xl font-bold text-white">The Swamp</h2>
                                <span className="px-3 py-1 bg-macho-red/10 text-macho-red text-xs font-bold rounded uppercase border border-macho-red/20">Target Selection Active</span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {landmarks.map(landmark => (
                                    <LandmarkCard
                                        key={landmark.id}
                                        landmark={landmark}
                                        onBuild={buildLandmark}
                                    />
                                ))}
                            </div>
                        </main>

                        <aside className="lg:col-span-1 space-y-8">
                            <ArtifactPanel artifacts={artifacts} />
                            <HistoryLog />
                        </aside>
                    </div>

                    <div className="mt-8">
                        <LiveFeed />
                    </div>

                    <footer className="mt-8 text-center text-gray-600 text-xs uppercase tracking-widest">
                        Patriot Games: Arena 250 © 2026 • Build The Future (Or Sell It)
                    </footer>
                </div>
            </div>
        </div>
    );
};
