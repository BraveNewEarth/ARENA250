import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/useGameStore';

interface SuppressHistoriansProps {
    onClose: () => void;
}

interface Enemy {
    id: number;
    x: number;
    y: number;
    speed: number;
    angle: number;
}

interface Particle {
    id: number;
    x: number;
    y: number;
    emoji: string;
}

type Faction = 'PROMOTER' | 'STATESMAN';

export const SuppressHistorians = ({ onClose }: SuppressHistoriansProps) => {
    const { addLog } = useGameStore();
    const [faction, setFaction] = useState<Faction | null>(null);
    const [fireIntensity, setFireIntensity] = useState(50); // 0 = Pure Water, 100 = Raging Fire
    const [gameActive, setGameActive] = useState(false);
    const [gameOver, setGameOver] = useState(false);
    const [enemies, setEnemies] = useState<Enemy[]>([]);
    const [particles, setParticles] = useState<Particle[]>([]);

    // New State for "Stages" / "Waves"
    const [currentStage, setCurrentStage] = useState(1);
    const [stageMessage, setStageMessage] = useState<string | null>(null);

    // Game loop refs
    const requestRef = useRef<number>(undefined);
    const lastTimeRef = useRef<number>(undefined);
    const spawnTimerRef = useRef<number>(0);
    const enemyIdCounter = useRef(0);
    const particleIdCounter = useRef(0);

    // Constants
    const CENTER_X = 50;
    const CENTER_Y = 50;
    const FIRE_RADIUS = 10;
    const MAX_STAGES = 3;

    // Difficulty Scaling based on Stage
    const getSpawnRate = () => Math.max(400, 1200 - ((currentStage - 1) * 300));
    const getEnemySpeedMultiplier = () => 1 + ((currentStage - 1) * 0.3);

    // Sound effects logic
    const playSound = (type: 'good' | 'bad' | 'win' | 'lose' | 'stage_clear') => {
        try {
            const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            const now = ctx.currentTime;

            if (type === 'good') {
                osc.type = 'sine';
                osc.frequency.setValueAtTime(440, now);
                osc.frequency.exponentialRampToValueAtTime(880, now + 0.1);
                gain.gain.setValueAtTime(0.1, now);
                gain.gain.linearRampToValueAtTime(0, now + 0.1);
                osc.start();
                osc.stop(now + 0.1);
            } else if (type === 'bad') {
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(100, now);
                osc.frequency.linearRampToValueAtTime(50, now + 0.2);
                gain.gain.setValueAtTime(0.1, now);
                gain.gain.linearRampToValueAtTime(0, now + 0.2);
                osc.start();
                osc.stop(now + 0.2);
            } else if (type === 'stage_clear') {
                osc.type = 'square';
                osc.frequency.setValueAtTime(440, now);
                osc.frequency.setValueAtTime(554, now + 0.1);
                osc.frequency.setValueAtTime(659, now + 0.2);
                gain.gain.setValueAtTime(0.1, now);
                gain.gain.linearRampToValueAtTime(0, now + 0.6);
                osc.start();
                osc.stop(now + 0.6);
            }
            osc.connect(gain);
            gain.connect(ctx.destination);
        } catch (e) {
            // Ignore audio errors
        }
    };

    const startGame = (selectedFaction: Faction) => {
        setFaction(selectedFaction);
        setFireIntensity(50);
        setEnemies([]);
        setParticles([]);
        setGameActive(true);
        setGameOver(false);
        setCurrentStage(1);
        setStageMessage(null);
        lastTimeRef.current = undefined;
    };

    const spawnEnemy = () => {
        const side = Math.floor(Math.random() * 4);
        let x = 0, y = 0;

        switch (side) {
            case 0: x = Math.random() * 100; y = -10; break;
            case 1: x = 110; y = Math.random() * 100; break;
            case 2: x = Math.random() * 100; y = 110; break;
            case 3: x = -10; y = Math.random() * 100; break;
        }

        const dx = CENTER_X - x;
        const dy = CENTER_Y - y;
        const angle = Math.atan2(dy, dx);
        const baseSpeed = 0.03 + (Math.random() * 0.03);

        const newEnemy: Enemy = {
            id: enemyIdCounter.current++,
            x,
            y,
            speed: baseSpeed * getEnemySpeedMultiplier(),
            angle
        };

        setEnemies(prev => [...prev, newEnemy]);
    };

    const animate = (time: number) => {
        if (!gameActive || gameOver || stageMessage) return;

        if (lastTimeRef.current !== undefined) {
            const deltaTime = time - lastTimeRef.current;

            // Spawning
            spawnTimerRef.current += deltaTime;
            if (spawnTimerRef.current > getSpawnRate()) {
                spawnEnemy();
                spawnTimerRef.current = 0;
            }

            // Move Enemies & Check Collisions
            setEnemies(prevEnemies => {
                const nextEnemies: Enemy[] = [];
                let intensityChange = 0;

                prevEnemies.forEach(enemy => {
                    const dx = Math.cos(enemy.angle) * enemy.speed * deltaTime;
                    const dy = Math.sin(enemy.angle) * enemy.speed * deltaTime;

                    enemy.x += dx / 2;
                    enemy.y += dy / 2;

                    const dist = Math.sqrt(Math.pow(enemy.x - CENTER_X, 2) + Math.pow(enemy.y - CENTER_Y, 2));

                    if (dist < FIRE_RADIUS) {
                        if (faction === 'PROMOTER') {
                            intensityChange -= 5; // Reduced damage slightly for balance
                            playSound('bad');
                        } else {
                            intensityChange += 5;
                            playSound('bad');
                        }
                    } else {
                        nextEnemies.push(enemy);
                    }
                });

                if (intensityChange !== 0) {
                    setFireIntensity(prev => {
                        const next = Math.max(0, Math.min(100, prev + intensityChange));

                        // Check Boundaries (0 or 100)
                        if (faction === 'PROMOTER') {
                            if (next >= 100) {
                                handleStageComplete(true);
                                return 50; // Reset visually, though handleStageComplete handles logic
                            }
                            if (next <= 0) {
                                handleGameOver(false);
                                return 0;
                            }
                        } else {
                            // Statesman
                            if (next <= 0) {
                                handleStageComplete(true);
                                return 50;
                            }
                            if (next >= 100) {
                                handleGameOver(false);
                                return 100;
                            }
                        }

                        return next;
                    });
                }

                return nextEnemies;
            });
        }

        lastTimeRef.current = time;
        requestRef.current = requestAnimationFrame(animate);
    };

    const handleStageComplete = (success: boolean) => {
        if (!success) return; // Should catch this in intensity check, but double check

        if (currentStage < MAX_STAGES) {
            // Next Stage
            playSound('stage_clear');
            setStageMessage(`STAGE ${currentStage} COMPLETE! INTELLIGENCE RESISTING AT ${currentStage * 100 + 10}%!`);
            setEnemies([]); // Clear board

            setTimeout(() => {
                setCurrentStage(prev => prev + 1);
                setFireIntensity(50);
                setStageMessage(null);
                lastTimeRef.current = undefined; // Reset delta timer
            }, 2500);
        } else {
            // Total Victory
            handleGameOver(true);
        }
    };

    const handleGameOver = (victory: boolean) => {
        setGameOver(true);
        setGameActive(false);
        if (victory) {
            playSound('win');
            if (faction === 'PROMOTER') {
                addLog("Victory! The Past is Ash! Long live the Future!", "Promoter");
            } else {
                addLog("Victory! The Truth has extinguished the lies!", "System");
            }
        } else {
            playSound('lose');
            if (faction === 'PROMOTER') {
                addLog("Failure! The Woke Mob flooded the arena!", "Promoter");
            } else {
                addLog("Failure! Ignorance has consumed us all!", "System");
            }
        }
    };

    useEffect(() => {
        if (gameActive && !stageMessage && !gameOver) {
            requestRef.current = requestAnimationFrame(animate);
        }
        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, [gameActive, gameOver, stageMessage, faction, currentStage]); // Re-run when stage changes

    const handleEnemyClick = (id: number, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!gameActive || gameOver || stageMessage) return;

        setEnemies(prev => prev.filter(en => en.id !== id));
        playSound('good');

        const enemy = enemies.find(en => en.id === id);
        if (enemy) {
            const emoji = faction === 'PROMOTER' ? '🚫' : '🕊️';
            setParticles(prev => [...prev, { id: particleIdCounter.current++, x: enemy.x, y: enemy.y, emoji }]);
        }
    };

    const handleCenterClick = () => {
        if (!gameActive || gameOver || stageMessage) return;

        playSound('good');

        if (faction === 'PROMOTER') {
            setFireIntensity(prev => {
                const next = Math.min(100, prev + 5);
                if (next >= 100) handleStageComplete(true);
                return next >= 100 ? 50 : next; // Reset immediate if win to avoid glitches
            });
            setParticles(prev => [...prev, { id: particleIdCounter.current++, x: 50, y: 50, emoji: '⛽' }]);
        } else {
            setFireIntensity(prev => {
                const next = Math.max(0, prev - 5);
                if (next <= 0) handleStageComplete(true);
                return next <= 0 ? 50 : next;
            });
            setParticles(prev => [...prev, { id: particleIdCounter.current++, x: 50, y: 50, emoji: '🪣' }]);
        }
    };

    const getEnemyEmoji = () => faction === 'PROMOTER' ? '👩‍🏫' : '👮‍♂️';

    if (!faction) {
        return (
            <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4">
                <div className="max-w-4xl w-full text-center space-y-8 animate-in zoom-in-95 duration-300">
                    <h2 className="text-4xl md:text-6xl font-black text-white uppercase tracking-widest mb-12">
                        Battle for History
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <button
                            onClick={() => startGame('PROMOTER')}
                            className="group relative p-8 border-4 border-macho-red bg-zinc-900 overflow-hidden hover:scale-105 transition-all"
                        >
                            <div className="absolute inset-0 bg-macho-red/10 group-hover:bg-macho-red/20 transition-colors" />
                            <div className="text-6xl mb-4">🔥</div>
                            <h3 className="text-2xl font-black text-macho-red uppercase mb-4">The Promoter</h3>
                            <p className="text-gray-400 font-mono text-sm leading-relaxed">
                                "Burn the past to fuel the future!"<br /><br />
                                <strong>Goal:</strong> Reach 100% Fire Intensity 3 Times.<br />
                                <strong>Action:</strong> Pour Gasoline & Deport Historians.
                            </p>
                        </button>

                        <button
                            onClick={() => startGame('STATESMAN')}
                            className="group relative p-8 border-4 border-blue-500 bg-zinc-900 overflow-hidden hover:scale-105 transition-all"
                        >
                            <div className="absolute inset-0 bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors" />
                            <div className="text-6xl mb-4">📚</div>
                            <h3 className="text-2xl font-black text-blue-500 uppercase mb-4">The Statesman</h3>
                            <p className="text-gray-400 font-mono text-sm leading-relaxed">
                                "Preserve truth from the flames!"<br /><br />
                                <strong>Goal:</strong> Reach 0% Fire Intensity 3 Times.<br />
                                <strong>Action:</strong> Douse Fire & Convert Agents.
                            </p>
                        </button>
                    </div>

                    <button onClick={onClose} className="mt-12 text-gray-500 hover:text-white uppercase tracking-widest">
                        Cancel Operation
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center font-mono overflow-hidden select-none">
            <div className={`absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] animate-pulse ${faction === 'PROMOTER' ? 'from-orange-900/40 via-black to-black' : 'from-blue-900/40 via-black to-black'}`} />

            <div className="absolute top-8 left-0 right-0 text-center z-20 pointer-events-none px-4">
                <h2 className={`text-2xl md:text-3xl font-black uppercase tracking-widest ${faction === 'PROMOTER' ? 'text-macho-red' : 'text-blue-500'}`}>
                    {faction === 'PROMOTER' ? 'Operation: Total Recall' : 'Operation: Archivist'}
                </h2>

                <div className="mt-2 text-xl font-bold text-white uppercase tracking-widest">
                    Wave {currentStage} / {MAX_STAGES}
                </div>

                <div className="mt-4 flex flex-col items-center gap-2">
                    <div className="w-full max-w-md h-8 bg-gray-800 rounded-full border border-gray-600 overflow-hidden relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-transparent to-red-600" />
                        <div className="absolute top-0 bottom-0 w-2 bg-white shadow-[0_0_10px_white] transition-all duration-100 mix-blend-overlay"
                            style={{ left: `${fireIntensity}%` }}
                        />
                    </div>
                </div>
            </div>

            <div className="relative w-full max-w-lg aspect-square">
                {/* Center Target */}
                <div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 cursor-pointer transition-transform active:scale-95"
                    onClick={handleCenterClick}
                >
                    <motion.div
                        className="text-8xl filter transition-all duration-300 origin-center select-none"
                        style={{
                            scale: 1, // Base scale, override in animate
                            filter: `drop-shadow(0 0 ${Math.max(10, fireIntensity / 2)}px ${fireIntensity > 50 ? 'rgba(255,60,0,0.8)' : 'rgba(0,100,255,0.5)'})`
                        }}
                        animate={{
                            rotate: fireIntensity > 80 ? [-3, 3, -3] : 0,
                            // Dramatic scaling: 0% -> 0.5x, 50% -> 1.5x, 100% -> 4.5x
                            scale: (() => {
                                const base = 0.5 + (Math.pow(fireIntensity, 1.5) / 250); // Exponential growth
                                const pulse = fireIntensity > 80 ? 1.1 : 1.0;
                                return [base, base * pulse, base];
                            })()
                        }}
                        transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
                    >
                        {fireIntensity > 60 ? '🔥' : fireIntensity < 40 ? '🌊' : '📚'}
                    </motion.div>

                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-4 font-bold text-white uppercase text-xs bg-black/60 px-3 py-1 rounded backdrop-blur-sm whitespace-nowrap border border-white/10">
                        {faction === 'PROMOTER' ? 'CLICK TO BURN!' : 'CLICK TO SAVE!'}
                    </div>
                </div>

                {/* Enemies */}
                <AnimatePresence>
                    {enemies.map(enemy => (
                        <motion.button
                            key={enemy.id}
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1, left: `${enemy.x}%`, top: `${enemy.y}%` }}
                            exit={{ scale: 0, opacity: 0 }}
                            transition={{ duration: 0 }}
                            className="absolute text-5xl cursor-pointer hover:scale-125 transition-transform z-20"
                            style={{ left: `${enemy.x}%`, top: `${enemy.y}%`, transform: 'translate(-50%, -50%)' }}
                            onMouseDown={(e) => handleEnemyClick(enemy.id, e)}
                        >
                            {getEnemyEmoji()}
                        </motion.button>
                    ))}
                </AnimatePresence>

                {/* Particles */}
                {particles.map(p => (
                    <motion.div
                        key={p.id}
                        initial={{ opacity: 1, y: 0, scale: 1 }}
                        animate={{ opacity: 0, y: -100, scale: 2 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.8 }}
                        className="absolute text-4xl pointer-events-none z-30"
                        style={{ left: `${p.x}%`, top: `${p.y}%` }}
                    >
                        {p.emoji}
                    </motion.div>
                ))}
            </div>

            {/* Stage Message Overlay */}
            {stageMessage && (
                <div className="absolute inset-0 z-40 bg-black/80 flex items-center justify-center animate-in fade-in duration-300">
                    <div className="text-center p-8 bg-zinc-900 border-2 border-gilded-gold rounded-xl shadow-2xl transform scale-125">
                        <h3 className="text-4xl font-black text-gilded-gold mb-4 animate-bounce">
                            🚧 PHASE COMPLETE 🚧
                        </h3>
                        <p className="text-white text-xl font-bold uppercase tracking-widest mb-2">
                            {stageMessage}
                        </p>
                        <p className="text-sm text-gray-400">Preparing next wave...</p>
                    </div>
                </div>
            )}

            {/* Game Over Modal */}
            {gameOver && (
                <div className="absolute inset-0 bg-black/95 z-50 flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-500">
                    <h3 className={`text-5xl md:text-6xl font-black mb-6 ${stageMessage ? 'text-gilded-gold' : 'text-white'}`}>
                        {stageMessage ? "TOTAL VICTORY" : (faction === 'PROMOTER' && fireIntensity >= 100 && currentStage === MAX_STAGES) || (faction === 'STATESMAN' && fireIntensity <= 0 && currentStage === MAX_STAGES)
                            ? 'MISSION ACCOMPLISHED'
                            : 'MISSION FAILED'}
                    </h3>

                    <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-xl leading-relaxed">
                        {gameActive === false && enemies.length === 0 && (faction === 'PROMOTER' ? fireIntensity >= 100 : fireIntensity <= 0)
                            ? "History has been successfully rewritten."
                            : "The narrative control was lost."}
                    </p>

                    <div className="flex flex-col md:flex-row gap-4">
                        <button
                            onClick={() => startGame(faction)}
                            className="px-8 py-4 bg-white text-black font-black rounded text-xl uppercase tracking-wider hover:bg-gray-200 transition-colors"
                        >
                            Replay Operation
                        </button>
                        <button
                            onClick={onClose}
                            className="px-8 py-4 border-2 border-white text-white font-black rounded text-xl uppercase tracking-wider hover:bg-white/10 transition-colors"
                        >
                            Return to HQ
                        </button>
                    </div>
                </div>
            )}

            <button
                onClick={onClose}
                className="absolute top-4 right-4 text-white/50 hover:text-white text-4xl z-[110]"
            >
                ✕
            </button>
        </div>
    );
};
