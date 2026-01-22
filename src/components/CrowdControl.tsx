import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/useGameStore';

interface Protester {
    id: number;
    type: 'student' | 'journalist' | 'worker' | 'elder';
    x: number;
    y: number;
    speed: number;
    fact: string;
}

interface Van {
    id: number;
    x: number;
    y: number;
    direction: 'left' | 'right';
    active: boolean;
}

interface CameraDrone {
    id: number;
    x: number;
    y: number;
}

const PROTESTER_TYPES = {
    student: { emoji: '👨‍🎓', speed: 2.5, fact: 'The First Amendment protects peaceful assembly...' },
    journalist: { emoji: '📰', speed: 2, fact: 'Freedom of the press is foundational...' },
    worker: { emoji: '👷', speed: 1.5, fact: 'Workers built this nation...' },
    elder: { emoji: '👵', speed: 1, fact: 'Those who forget history are doomed...' },
};

const PROMOTER_QUOTES = [
    "They should've brought papers!",
    "Law and ORDER, folks!",
    "Beautiful. Just beautiful.",
    "The system WORKS!",
    "That's what I call efficiency!",
    "Nobody does deportations like us!",
];

interface CrowdControlProps {
    onClose: () => void;
    onComplete: (success: boolean) => void;
}

export const CrowdControl = ({ onClose, onComplete }: CrowdControlProps) => {
    const { addLog } = useGameStore();
    const gameAreaRef = useRef<HTMLDivElement>(null);
    const vansRef = useRef<Van[]>([]); // Track vans in ref for collision detection

    const [protesters, setProtesters] = useState<Protester[]>([]);
    const [vans, setVans] = useState<Van[]>([]);
    const [drones, setDrones] = useState<CameraDrone[]>([]);
    const [processed, setProcessed] = useState(0);
    const [breached, setBreached] = useState(0);
    const [wave, setWave] = useState(1);
    const [waveProgress, setWaveProgress] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [promoterQuote, setPromoterQuote] = useState('');
    const [flashingFact, setFlashingFact] = useState<string | null>(null);
    const [particles, setParticles] = useState<{ id: number; x: number; y: number; emoji: string }[]>([]);
    const [viralScandal, setViralScandal] = useState(false);

    const particleIdCounter = useRef(0);

    const BREACH_LIMIT = 5;
    const WAVES_TO_WIN = 3;
    const PROTESTERS_PER_WAVE = 8 + wave * 2;

    const playSound = (type: 'siren' | 'capture' | 'fail') => {
        try {
            const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            const now = ctx.currentTime;

            if (type === 'siren') {
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(600, now);
                osc.frequency.linearRampToValueAtTime(800, now + 0.3);
                osc.frequency.linearRampToValueAtTime(600, now + 0.6);
                gain.gain.setValueAtTime(0.1, now);
                gain.gain.linearRampToValueAtTime(0, now + 0.6);
                osc.start();
                osc.stop(now + 0.6);
            } else if (type === 'capture') {
                osc.type = 'square';
                osc.frequency.setValueAtTime(100, now);
                osc.frequency.exponentialRampToValueAtTime(10, now + 0.1);
                gain.gain.setValueAtTime(0.2, now);
                gain.gain.linearRampToValueAtTime(0, now + 0.1);
                osc.start();
                osc.stop(now + 0.1);
            }
            osc.connect(gain);
            gain.connect(ctx.destination);
        } catch (e) {
            // ignore
        }
    };

    // Spawn protesters based on wave
    useEffect(() => {
        if (gameOver || waveProgress >= PROTESTERS_PER_WAVE) return;

        const spawnInterval = Math.max(800 - wave * 100, 400);
        const interval = setInterval(() => {
            const types = Object.keys(PROTESTER_TYPES) as Array<keyof typeof PROTESTER_TYPES>;
            const type = types[Math.floor(Math.random() * types.length)];
            const config = PROTESTER_TYPES[type];

            const newProtester: Protester = {
                id: Date.now() + Math.random(),
                type,
                x: -50,
                y: 80 + Math.random() * 200,
                speed: config.speed + (wave - 1) * 0.3,
                fact: config.fact,
            };

            setProtesters(prev => [...prev, newProtester]);
            setWaveProgress(prev => prev + 1);
        }, spawnInterval);

        return () => clearInterval(interval);
    }, [gameOver, wave, waveProgress, PROTESTERS_PER_WAVE]);

    // Spawn camera drones in later waves
    useEffect(() => {
        if (gameOver || wave < 2) return;

        const interval = setInterval(() => {
            if (Math.random() > 0.7) {
                const newDrone: CameraDrone = {
                    id: Date.now(),
                    x: Math.random() * 400 + 50,
                    y: 50 + Math.random() * 100,
                };
                setDrones(prev => [...prev, newDrone]);
                setTimeout(() => {
                    setDrones(prev => prev.filter(d => d.id !== newDrone.id));
                }, 4000);
            }
        }, 3000);

        return () => clearInterval(interval);
    }, [gameOver, wave]);

    // Move protesters
    useEffect(() => {
        if (gameOver) return;

        const interval = setInterval(() => {
            setProtesters(prev => {
                const updated: Protester[] = [];
                prev.forEach(p => {
                    const newX = p.x + p.speed;
                    if (newX > 500) {
                        setBreached(b => b + 1);
                    } else {
                        updated.push({ ...p, x: newX });
                    }
                });
                return updated;
            });
        }, 50);

        return () => clearInterval(interval);
    }, [gameOver]);

    // Move vans
    useEffect(() => {
        if (gameOver) return;

        const interval = setInterval(() => {
            setVans(prev => {
                const updated = prev.map(v => ({
                    ...v,
                    x: v.direction === 'right' ? v.x + 8 : v.x - 8,
                    active: v.x > -100 && v.x < 600,
                })).filter(v => v.active);
                vansRef.current = updated; // Keep ref in sync
                return updated;
            });
        }, 50);

        return () => clearInterval(interval);
    }, [gameOver]);

    // Collision detection - use vansRef for accurate collision checking
    useEffect(() => {
        if (gameOver) return;

        const interval = setInterval(() => {
            const currentVans = vansRef.current;
            if (currentVans.length === 0) return;

            setProtesters(prev => {
                const remaining: Protester[] = [];
                prev.forEach(p => {
                    // X: generous (van sweeping), Y: strict (must be aligned)
                    const hitByVan = currentVans.some(v =>
                        Math.abs(p.x - v.x) < 60 && Math.abs(p.y - v.y) < 25
                    );
                    if (hitByVan) {
                        setProcessed(s => s + 1);
                        playSound('capture');
                        setFlashingFact(p.fact);
                        setTimeout(() => setFlashingFact(null), 1500);

                        // Add Dust Particle
                        setParticles(particlesPrev => [...particlesPrev, {
                            id: particleIdCounter.current++,
                            x: p.x,
                            y: p.y,
                            emoji: '💨'
                        }]);

                        const quote = PROMOTER_QUOTES[Math.floor(Math.random() * PROMOTER_QUOTES.length)];
                        setPromoterQuote(quote);
                        setTimeout(() => setPromoterQuote(''), 2000);
                    } else {
                        remaining.push(p);
                    }
                });
                return remaining;
            });
        }, 30); // Check more frequently

        return () => clearInterval(interval);
    }, [gameOver]);

    // Wave completion check
    useEffect(() => {
        if (gameOver) return;

        if (waveProgress >= PROTESTERS_PER_WAVE && protesters.length === 0) {
            if (wave >= WAVES_TO_WIN) {
                setGameOver(true);
                addLog(`CROWD CONTROLLED! ${processed} undesirables processed. Arena secured!`, 'Promoter');
                setTimeout(() => onComplete(true), 2500);
            } else {
                setWave(w => w + 1);
                setWaveProgress(0);
                addLog(`Wave ${wave} cleared! The machine keeps turning...`, 'Promoter');
            }
        }
    }, [waveProgress, protesters.length, wave, gameOver, processed, addLog, onComplete, PROTESTERS_PER_WAVE]);

    // Breach limit check
    useEffect(() => {
        if (breached >= BREACH_LIMIT && !gameOver) {
            setGameOver(true);
            addLog('The perimeter was breached! The crowd has awakened!', 'The Swamp');
            setTimeout(() => onComplete(false), 2500);
        }
    }, [breached, gameOver, addLog, onComplete]);

    // Viral scandal check
    useEffect(() => {
        if (viralScandal && !gameOver) {
            setGameOver(true);
            addLog('VIRAL SCANDAL! The cameras caught everything! -30 Macho!', 'System');
            setTimeout(() => onComplete(false), 2500);
        }
    }, [viralScandal, gameOver, addLog, onComplete]);

    const deployVan = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        if (gameOver) return;

        playSound('siren');
        const rect = gameAreaRef.current?.getBoundingClientRect();
        if (!rect) return;

        const y = e.clientY - rect.top;

        // Vans only come from the right (arena side) and sweep left
        const newVan: Van = {
            id: Date.now(),
            x: 550,
            y: Math.max(60, Math.min(280, y)),
            direction: 'left',
            active: true,
        };

        setVans(prev => [...prev, newVan]);
    }, [gameOver]);

    const handleDroneClick = useCallback((droneId: number) => {
        setViralScandal(true);
        setDrones(prev => prev.filter(d => d.id !== droneId));
    }, []);

    return (
        <div className="fixed inset-0 z-[90] bg-black/95 flex items-center justify-center p-4">
            <div className="bg-zinc-900 border-2 border-macho-red rounded-xl max-w-3xl w-full p-6 relative overflow-hidden">
                {/* Header */}
                <div className="text-center mb-4">
                    <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-macho-red to-orange-500 uppercase tracking-widest">
                        🚐 Crowd Control: Deportation Express 🚐
                    </h2>
                    <p className="text-gray-500 text-sm">Click to deploy ICE vans. Don't click the drones!</p>
                </div>

                {/* Stats */}
                <div className="flex justify-around mb-4 text-sm">
                    <div className="text-center">
                        <span className="text-orange-400 font-bold text-xl">Wave {wave}/{WAVES_TO_WIN}</span>
                        <p className="text-gray-500">Progress</p>
                    </div>
                    <div className="text-center">
                        <span className="text-green-400 font-bold text-xl">{processed}</span>
                        <p className="text-gray-500">Processed</p>
                    </div>
                    <div className="text-center">
                        <span className="text-red-400 font-bold text-xl">{breached}/{BREACH_LIMIT}</span>
                        <p className="text-gray-500">Breached</p>
                    </div>
                </div>

                {/* Game Area */}
                <div
                    ref={gameAreaRef}
                    onClick={deployVan}
                    className="relative bg-gradient-to-r from-zinc-800 to-zinc-900 rounded-lg border border-gray-700 h-80 overflow-hidden cursor-crosshair"
                >
                    {/* Arena Gate (right side) */}
                    <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-macho-red/50 to-transparent border-l-4 border-macho-red flex items-center justify-center">
                        <span className="text-2xl">🏟️</span>
                    </div>

                    {/* Spawn Zone (left side) */}
                    <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-blue-900/30 to-transparent border-r border-blue-500/30" />

                    {/* Flashing Fact */}
                    <AnimatePresence>
                        {flashingFact && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.5 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-x-4 top-4 bg-black/90 border border-yellow-500/50 rounded-lg p-3 z-20"
                            >
                                <p className="text-yellow-400 text-xs italic text-center">"{flashingFact}"</p>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Promoter Quote */}
                    <AnimatePresence>
                        {promoterQuote && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="absolute bottom-4 right-16 bg-macho-red text-white px-3 py-1 rounded-lg text-sm font-bold z-20"
                            >
                                {promoterQuote}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Particles */}
                    {particles.map(p => (
                        <motion.div
                            key={p.id}
                            initial={{ opacity: 1, scale: 0.5 }}
                            animate={{ opacity: 0, scale: 2 }}
                            onAnimationComplete={() => setParticles(prev => prev.filter(par => par.id !== p.id))}
                            className="absolute text-2xl pointer-events-none z-20"
                            style={{ left: p.x, top: p.y }}
                        >
                            {p.emoji}
                        </motion.div>
                    ))}

                    {/* Protesters */}
                    <AnimatePresence>
                        {protesters.map(p => (
                            <motion.div
                                key={p.id}
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 2, rotate: 180 }}
                                className="absolute text-2xl pointer-events-none"
                                style={{ left: p.x, top: p.y }}
                            >
                                {PROTESTER_TYPES[p.type].emoji}
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {/* ICE Vans */}
                    <AnimatePresence>
                        {vans.map(v => (
                            <motion.div
                                key={v.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute text-3xl pointer-events-none"
                                style={{
                                    left: v.x,
                                    top: v.y,
                                    transform: v.direction === 'left' ? 'scaleX(-1)' : 'none'
                                }}
                            >
                                🚐
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {/* Camera Drones */}
                    {drones.map(d => (
                        <motion.div
                            key={d.id}
                            onClick={(e) => { e.stopPropagation(); handleDroneClick(d.id); }}
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="absolute text-2xl cursor-not-allowed hover:scale-125 transition-transform z-10"
                            style={{ left: d.x, top: d.y }}
                            whileHover={{ scale: 1.3 }}
                        >
                            🎥
                            <span className="absolute -top-1 -right-1 text-xs bg-red-500 text-white px-1 rounded-full animate-pulse">LIVE</span>
                        </motion.div>
                    ))}

                    {/* Game Over Overlay */}
                    {gameOver && (
                        <div className="absolute inset-0 bg-black/90 flex items-center justify-center z-30">
                            <div className="text-center">
                                <p className={`text-4xl font-black ${breached < BREACH_LIMIT && !viralScandal ? 'text-green-400' : 'text-red-400'}`}>
                                    {viralScandal ? '📹 VIRAL SCANDAL!' : breached < BREACH_LIMIT ? '✅ AREA SECURED!' : '❌ PERIMETER BREACHED!'}
                                </p>
                                <p className="text-gray-400 mt-2">
                                    {viralScandal
                                        ? 'The footage is everywhere...'
                                        : breached < BREACH_LIMIT
                                            ? `${processed} undesirables processed.`
                                            : 'The crowd has awakened...'}
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Legend */}
                <div className="flex justify-center gap-4 mt-4 text-xs text-gray-500">
                    <span>👨‍🎓 Student</span>
                    <span>📰 Journalist</span>
                    <span>👷 Worker</span>
                    <span>👵 Elder</span>
                    <span className="text-red-400">🎥 AVOID!</span>
                </div>

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-white text-2xl"
                >
                    ✕
                </button>
            </div>
        </div>
    );
};
