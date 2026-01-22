import type { Landmark } from '../types';
import { useGameStore } from '../store/useGameStore';
import { useState } from 'react';

interface Props {
    landmark: Landmark;
    onBuild: (id: string) => void;
}

export const LandmarkCard = ({ landmark, onBuild }: Props) => {
    const [localFeedback, setLocalFeedback] = useState<string | null>(null);

    const playSfx = (type: 'PUNCH' | 'BOO' | 'CASH') => {
        try {
            const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            const now = ctx.currentTime;

            if (type === 'PUNCH') {
                // Short, sharp noise/thud
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(150, now);
                osc.frequency.exponentialRampToValueAtTime(40, now + 0.1);
                gain.gain.setValueAtTime(0.5, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
                osc.start(now);
                osc.stop(now + 0.1);
            } else {
                // Heavy thud / Low Punch (Loss)
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(100, now);
                osc.frequency.exponentialRampToValueAtTime(20, now + 0.2);
                gain.gain.setValueAtTime(0.6, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
                osc.start(now);
                osc.stop(now + 0.2);
            }

            osc.connect(gain);
            gain.connect(ctx.destination);
        } catch (e) {
            console.error("Audio error", e);
        }
    };

    const checkFeedback = () => {
        // Slight delay to allow store update (synchronous for Zustand, but safe)
        const latestLog = useGameStore.getState().logs[0];
        if (latestLog && (latestLog.source === 'Promoter' || latestLog.source === 'System' || latestLog.source === 'The Swamp')) {
            setLocalFeedback(latestLog.message);
            if (latestLog.message.includes("WINNER") || latestLog.message.includes("SUCCESS")) {
                playSfx(latestLog.message.includes("SUCCESS") ? 'CASH' : 'PUNCH');
            } else {
                playSfx('BOO');
            }
            // Clear after 3 seconds
            setTimeout(() => setLocalFeedback(null), 3000);
        }
    };

    const handleBet = (choice: 'RED' | 'BLUE') => {
        useGameStore.getState().performLandmarkAction(landmark.id, 'BET', choice);
        checkFeedback();
    };

    const handleSchmooze = () => {
        useGameStore.getState().performLandmarkAction(landmark.id, 'SCHMOOZE');
        checkFeedback();
    };

    const handleRecruit = () => {
        useGameStore.getState().performLandmarkAction(landmark.id, 'RECRUIT');
        checkFeedback();
    };

    return (
        <div className={`border-2 p-6 rounded-lg transition-all duration-300 ${landmark.isBuilt ? 'border-gilded-gold bg-void-black shadow-[0_0_15px_rgba(212,175,55,0.2)]' : 'border-macho-red/50 bg-zinc-900/50 hover:border-macho-red hover:bg-zinc-900'}`}>
            <h3 className="text-2xl font-bold text-gilded-gold mb-3 tracking-wide">
                {landmark.isBuilt ? landmark.replacement : landmark.name}
            </h3>

            {!landmark.isBuilt ? (
                <div className="space-y-4">
                    <div className="text-sm text-gray-400 bg-black/40 p-2 rounded border border-gray-800">
                        <span className="text-gray-500 block text-xs uppercase mb-1">Current State</span>
                        Boring Historical Site
                    </div>

                    {/* Preview Image (Blurred/Grayscale or Desaturated) */}
                    <div className="relative h-32 rounded overflow-hidden opacity-50 grayscale transition-all hover:grayscale-0 hover:opacity-100">
                        <img src={landmark.image} alt={landmark.name} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <span className="text-xs font-bold uppercase tracking-widest text-white border border-white/30 px-2 py-1 bg-black/50">Preview</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="bg-macho-red/10 border border-macho-red/20 p-2 rounded text-center">
                            <span className="block text-xl font-bold text-macho-red">+{landmark.macho_gain}</span>
                            <span className="text-xs text-gray-400 uppercase">Macho</span>
                        </div>
                        <div className="bg-purple-900/10 border border-purple-500/20 p-2 rounded text-center">
                            <span className="block text-xl font-bold text-purple-400">+{landmark.decay_cost}</span>
                            <span className="text-xs text-gray-400 uppercase">Decay</span>
                        </div>
                    </div>

                    <button
                        onClick={() => onBuild(landmark.id)}
                        className="w-full py-3 bg-macho-red text-white font-black hover:bg-red-700 transition-colors uppercase tracking-widest shadow-lg hover:shadow-macho-red/50 active:scale-95 transform"
                    >
                        Transform
                    </button>

                    <div className="text-xs text-center text-gray-500 mt-2">
                        Replacement: <span className="text-gilded-gold">{landmark.replacement}</span>
                    </div>
                </div>
            ) : (
                <div className="text-center py-2 animate-in fade-in duration-700">
                    {/* Active State Logic */}
                    {/* Active State Logic */}
                    {landmark.id === 'rose_garden' ? (
                        <div className="space-y-3">
                            <div className="relative h-32 rounded-lg overflow-hidden border border-macho-red/50 group">
                                <img src={landmark.image} alt={landmark.replacement} className="w-full h-full object-cover opacity-80" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end justify-center pb-2">
                                    <h4 className="text-macho-red font-black uppercase tracking-widest text-sm text-shadow-sm">⚡ TONIGHT'S MAIN EVENT ⚡</h4>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    onClick={() => handleBet('RED')}
                                    className="bg-red-900/80 hover:bg-red-600 border border-red-500 text-white p-2 rounded uppercase font-bold text-xs transition-colors group relative overflow-hidden"
                                >
                                    <div className="absolute inset-0 bg-macho-red/20 translate-y-full group-hover:translate-y-0 transition-transform" />
                                    <span className="relative z-10 block text-xl mb-1">🥊</span>
                                    <span className="relative z-10">Red Corner</span>
                                    <span className="relative z-10 block text-[8px] opacity-70 mt-1 group-hover:opacity-100">"The Crusher"</span>
                                </button>
                                <button
                                    onClick={() => handleBet('BLUE')}
                                    className="bg-blue-900/80 hover:bg-blue-600 border border-blue-500 text-white p-2 rounded uppercase font-bold text-xs transition-colors group relative overflow-hidden"
                                >
                                    <div className="absolute inset-0 bg-blue-500/20 translate-y-full group-hover:translate-y-0 transition-transform" />
                                    <span className="relative z-10 block text-xl mb-1">🥋</span>
                                    <span className="relative z-10">Blue Corner</span>
                                    <span className="relative z-10 block text-[8px] opacity-70 mt-1 group-hover:opacity-100">"The Mauler"</span>
                                </button>
                            </div>

                            {/* Feedback Ticker */}
                            <div className="bg-black/50 border border-white/10 p-2 rounded min-h-[40px] flex items-center justify-center transition-all">
                                {localFeedback ? (
                                    <p className="text-[10px] font-bold animate-pulse text-yellow-400">
                                        {localFeedback}
                                    </p>
                                ) : (
                                    <p className="text-[10px] text-gray-400 italic">
                                        Win: <span className="text-macho-red font-bold">+15 Macho</span> • Lose: <span className="text-purple-400 font-bold">+10 Decay</span>
                                    </p>
                                )}
                            </div>
                        </div>
                    ) : landmark.id === 'east_wing' ? (
                        <div className="space-y-3">
                            <div className="relative h-32 rounded-lg overflow-hidden border border-purple-500/50 group">
                                <img src={landmark.image} alt={landmark.replacement} className="w-full h-full object-cover opacity-80" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end justify-center pb-2">
                                    <h4 className="text-purple-400 font-black uppercase tracking-widest text-sm text-shadow-sm">💎 VIP FUNDRAISER 💎</h4>
                                </div>
                            </div>

                            <button
                                onClick={handleSchmooze}
                                className="w-full bg-purple-900/80 hover:bg-purple-600 border border-purple-500 text-white p-3 rounded uppercase font-bold text-xs transition-colors group relative overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-purple-500/20 translate-y-full group-hover:translate-y-0 transition-transform" />
                                <span className="relative z-10 block text-xl mb-1">🥂</span>
                                <span className="relative z-10 block">Host Gala Event</span>
                                <span className="relative z-10 block text-[9px] opacity-70 mt-1 group-hover:opacity-100">Cost: 30 Macho • Reward: -20 Decay</span>
                            </button>

                            {/* Feedback Ticker */}
                            <div className="bg-black/50 border border-white/10 p-2 rounded min-h-[40px] flex items-center justify-center transition-all">
                                {localFeedback ? (
                                    <p className="text-[10px] font-bold animate-pulse text-yellow-400">
                                        {localFeedback}
                                    </p>
                                ) : (
                                    <p className="text-[10px] text-gray-400 italic">
                                        "Schmooze the media. Spin the story. Save the swamp."
                                    </p>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <div className="relative h-32 rounded-lg overflow-hidden border border-white/50 group">
                                <img src={landmark.image} alt={landmark.replacement} className="w-full h-full object-cover opacity-80" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end justify-center pb-2">
                                    <h4 className="text-white font-black uppercase tracking-widest text-sm text-shadow-sm">⚔️ CHALLENGER GATE ⚔️</h4>
                                </div>
                            </div>

                            <button
                                onClick={handleRecruit}
                                className="w-full bg-zinc-800 hover:bg-zinc-700 border border-white/50 text-white p-3 rounded uppercase font-bold text-xs transition-colors group relative overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform" />
                                <span className="relative z-10 block text-xl mb-1">🦁</span>
                                <span className="relative z-10 block">Summon Gladiator</span>
                                <span className="relative z-10 block text-[9px] opacity-70 mt-1 group-hover:opacity-100">Cost: 10 Macho • Reward: Combat Buff</span>
                            </button>

                            {/* Feedback Ticker */}
                            <div className="bg-black/50 border border-white/10 p-2 rounded min-h-[40px] flex items-center justify-center transition-all">
                                {localFeedback ? (
                                    <p className="text-[10px] font-bold animate-pulse text-white">
                                        {localFeedback}
                                    </p>
                                ) : (
                                    <p className="text-[10px] text-gray-400 italic">
                                        "Who will emerge from the depths?"
                                    </p>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )
            }
        </div >
    );
};
