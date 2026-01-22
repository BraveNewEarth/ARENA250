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
    speed: number; // Speed in pixels per millisecond
    angle: number; // Angle to move towards center
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

    // Game loop refs
    const requestRef = useRef<number>(undefined);
    const lastTimeRef = useRef<number>(undefined);
    const spawnTimerRef = useRef<number>(0);
    const enemyIdCounter = useRef(0);
    const particleIdCounter = useRef(0);

    // Constants
    const CENTER_X = 50; // Percent
    const CENTER_Y = 50; // Percent
    const SPAWN_RATE = 1200; // ms (base spawn rate)
    const FIRE_RADIUS = 10; // Percent (approx radius of fire collision)

    // Sound effects logic
    const playSound = (type: 'good' | 'bad' | 'win' | 'lose') => {
        try {
            const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            const now = ctx.currentTime;

            if (type === 'good') { // Successful click/action
                osc.type = 'sine';
                osc.frequency.setValueAtTime(440, now);
                osc.frequency.exponentialRampToValueAtTime(880, now + 0.1);
                gain.gain.setValueAtTime(0.1, now);
                gain.gain.linearRampToValueAtTime(0, now + 0.1);
                osc.start();
                osc.stop(now + 0.1);
            } else if (type === 'bad') { // Enemy hit fire / fail
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(100, now);
                osc.frequency.linearRampToValueAtTime(50, now + 0.2);
                gain.gain.setValueAtTime(0.1, now);
                gain.gain.linearRampToValueAtTime(0, now + 0.2);
                osc.start();
                osc.stop(now + 0.2);
            }
            osc.connect(gain);
            gain.connect(ctx.destination);
        } catch (e) {
            // Ignore audio errors
        }
    };

    const startGame = (selectedFaction: Faction) => {
        setFaction(selectedFaction);
        setFireIntensity(50); // Reset to neutral
        setEnemies([]);
        setParticles([]);
        setGameActive(true);
        setGameOver(false);
        lastTimeRef.current = undefined; // Reset time
    };

    // Spawn Logic
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

        const newEnemy: Enemy = {
            id: enemyIdCounter.current++,
            x,
            y,
            speed: 0.03 + (Math.random() * 0.03),
            angle
        };

        setEnemies(prev => [...prev, newEnemy]);
    };

    // Main Loop
    const animate = (time: number) => {
        if (!gameActive || gameOver) return;

        if (lastTimeRef.current !== undefined) {
            const deltaTime = time - lastTimeRef.current;

            // Spawning
            spawnTimerRef.current += deltaTime;
            if (spawnTimerRef.current > SPAWN_RATE) {
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

                    enemy.x += dx / 2; // Approximate scale adjustment
                    enemy.y += dy / 2;

                    // Collision check
                    const dist = Math.sqrt(Math.pow(enemy.x - CENTER_X, 2) + Math.pow(enemy.y - CENTER_Y, 2));

                    if (dist < FIRE_RADIUS) {
                        // Enemy reached center!
                        if (faction === 'PROMOTER') {
                            // Enemy is Historian (Water) -> Fire goes DOWN
                            intensityChange -= 10;
                            playSound('bad');
                        } else {
                            // Enemy is ICE (Fuel) -> Fire goes UP
                            intensityChange += 10;
                            playSound('bad');
                        }
                    } else {
                        nextEnemies.push(enemy);
                    }
                });

                if (intensityChange !== 0) {
                    setFireIntensity(prev => {
                        const next = Math.max(0, Math.min(100, prev + intensityChange));
                        if (next <= 0) {
                            // Map 0 -> Win for Statesman, Loss for Promoter
                            if (faction === 'STATESMAN') {
                                setGameOver(true); // Win!
                                addLog("Victory! The Truth has extinguished the lies!", "System");
                            } else {
                                setGameOver(true); // Loss!
                                addLog("Failure! The Woke Mob flooded the arena!", "Promoter");
                            }
                        } else if (next >= 100) {
                            // Map 100 -> Win for Promoter, Loss for Statesman
                            if (faction === 'PROMOTER') {
                                setGameOver(true); // Win!
                                addLog("Victory! The Past is Ash! Long live the Future!", "Promoter");
                            } else {
                                setGameOver(true); // Loss!
                                addLog("Failure! Ignorance has consumed us all!", "System");
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

    useEffect(() => {
        if (gameActive) {
            requestRef.current = requestAnimationFrame(animate);
        }
        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, [gameActive, gameOver, faction, fireIntensity]);


    // Interaction Handlers
    const handleEnemyClick = (id: number, e: React.MouseEvent) => {
        e.stopPropagation(); // Don't click fire/bg
        if (!gameActive || gameOver) return;

        // Remove enemy
        setEnemies(prev => prev.filter(en => en.id !== id));
        playSound('good');

        // Visual Feedack
        const enemy = enemies.find(en => en.id === id);
        if (enemy) {
            const emoji = faction === 'PROMOTER' ? '🚫' : '🕊️';
            setParticles(prev => [...prev, { id: particleIdCounter.current++, x: enemy.x, y: enemy.y, emoji }]);
        }
    };

    const handleCenterClick = () => {
        if (!gameActive || gameOver) return;

        playSound('good');

        // Manual influence
        if (faction === 'PROMOTER') {
            // Pour Gas -> Increase Intensity
            setFireIntensity(prev => Math.min(100, prev + 5));
            setParticles(prev => [...prev, { id: particleIdCounter.current++, x: 50, y: 50, emoji: '⛽' }]);
        } else {
            // Pour Water -> Decrease Intensity
            setFireIntensity(prev => Math.max(0, prev - 5));
            setParticles(prev => [...prev, { id: particleIdCounter.current++, x: 50, y: 50, emoji: '🪣' }]);
        }
    };


    // Render Helpers
    const getEnemyEmoji = () => faction === 'PROMOTER' ? '👩‍🏫' : '👮‍♂️'; // Promoter fights Historians, Statesman fights ICE

    // RENDER: Faction Selection Screen
    if (!faction) {
        return (
            <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4">
                <div className="max-w-4xl w-full text-center space-y-8">
                    <h2 className="text-4xl md:text-6xl font-black text-white uppercase tracking-widest mb-12">
                        Battle for History
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Promoter Option */}
                        <button
                            onClick={() => startGame('PROMOTER')}
                            className="group relative p-8 border-4 border-macho-red bg-zinc-900 overflow-hidden hover:scale-105 transition-all"
                        >
                            <div className="absolute inset-0 bg-macho-red/10 group-hover:bg-macho-red/20 transition-colors" />
                            <div className="text-6xl mb-4">🔥</div>
                            <h3 className="text-2xl font-black text-macho-red uppercase mb-4">The Promoter</h3>
                            <p className="text-gray-400 font-mono text-sm leading-relaxed">
                                "Burn the past to fuel the future!"<br /><br />
                                <strong>Goal:</strong> Reach 100% Fire Intensity.<br />
                                <strong>Action:</strong> Pour Gasoline & Deport Historians.
                            </p>
                        </button>

                        {/* Statesman Option */}
                        <button
                            onClick={() => startGame('STATESMAN')}
                            className="group relative p-8 border-4 border-blue-500 bg-zinc-900 overflow-hidden hover:scale-105 transition-all"
                        >
                            <div className="absolute inset-0 bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors" />
                            <div className="text-6xl mb-4">📚</div>
                            <h3 className="text-2xl font-black text-blue-500 uppercase mb-4">The Statesman</h3>
                            <p className="text-gray-400 font-mono text-sm leading-relaxed">
                                "Preserve truth from the flames!"<br /><br />
                                <strong>Goal:</strong> Reach 0% Fire Intensity.<br />
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

    // RENDER: Active Game
    return (
        <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center font-mono overflow-hidden select-none">
            {/* Background Atmosphere */}
            <div className={`absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] animate-pulse ${faction === 'PROMOTER' ? 'from-orange-900/40 via-black to-black' : 'from-blue-900/40 via-black to-black'
                }`} />

            {/* Game UI */}
            <div className="absolute top-8 left-0 right-0 text-center z-20 pointer-events-none">
                <h2 className={`text-3xl font-black uppercase tracking-widest ${faction === 'PROMOTER' ? 'text-macho-red' : 'text-blue-500'}`}>
                    {faction === 'PROMOTER' ? 'Operation: Total Recall' : 'Operation: Archivist'}
                </h2>
                <div className="mt-4 flex flex-col items-center gap-2">
                    <p className="text-white text-lg font-bold">
                        Target: {faction === 'PROMOTER' ? 'MAXIMUM FIRE (100%)' : 'EXTINGUISH FIRE (0%)'}
                    </p>
                    {/* Progress Bar */}
                    <div className="w-96 h-8 bg-gray-800 rounded-full border border-gray-600 overflow-hidden relative">
                        {/* Water Zone (Blue) */}
                        <div className="absolute left-0 top-0 bottom-0 bg-blue-600 transition-all duration-300"
                            style={{ width: `${100 - fireIntensity}%` }}
                        />
                        {/* Fire Zone (Red/Orange) Overlay - actually we can just use the background as fire or invert logic */}
                        {/* Let's visualize Intensity directly. 0 = Full Blue. 100 = Full Red. */}
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-transparent to-red-600" />

                        {/* Indicator Line */}
                        <div className="absolute top-0 bottom-0 w-2 bg-white shadow-[0_0_10px_white] transition-all duration-100"
                            style={{ left: `${fireIntensity}%` }}
                        />
                    </div>
                    <span className="text-sm text-gray-400">{Math.round(fireIntensity)}% INTENSITY</span>
                </div>
            </div>

            {/* Main Game Area */}
            <div className="relative w-full max-w-2xl aspect-square">

                {/* Center Target (Fire/Books) */}
                <div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 cursor-pointer hover:scale-110 active:scale-95 transition-transform"
                    onClick={handleCenterClick}
                >
                    {(() => {
                        // Explicit Step-Function Logic
                        let scale = 1;
                        if (fireIntensity >= 100) scale = 4.0;
                        else if (fireIntensity >= 90) scale = 3.5;
                        else if (fireIntensity >= 80) scale = 3.0;
                        else if (fireIntensity >= 70) scale = 2.5;
                        else if (fireIntensity >= 60) scale = 2.0;
                        else if (fireIntensity > 50) scale = 1.5;
                        else scale = 1; // 50 or below

                        return (
                            <motion.div
                                key={`fire-${scale}`} // Force re-render on step change to ensure crisp transition
                                className="text-8xl filter transition-all duration-100 origin-center select-none"
                                style={{
                                    filter: `drop-shadow(0 0 ${Math.max(10, (fireIntensity - 50) * 3)}px ${fireIntensity > 50 ? 'rgba(255,60,0,0.9)' : 'rgba(0,100,255,0.3)'})`
                                }}
                                initial={{ scale: scale }}
                                animate={{
                                    scale: fireIntensity > 50 ? [scale, scale * 1.1, scale] : scale,
                                    opacity: fireIntensity > 50 ? 1 : 0.8,
                                    rotate: fireIntensity >= 80 ? [-3, 3, -3] : 0
                                }}
                                transition={{
                                    repeat: Infinity,
                                    duration: Math.max(0.1, 0.6 - ((fireIntensity - 50) / 150))
                                }}
                            >
                                {fireIntensity > 50 ? '🔥' : fireIntensity < 20 ? '🌊' : '📚'}
                            </motion.div>
                        );
                    })()}

                    <div className="text-center mt-8 font-bold text-white uppercase text-sm bg-black/50 px-2 rounded backdrop-blur-sm whitespace-nowrap">
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

                {/* Particles (Ephemeral) */}
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

            {/* Game Over Modal */}
            {gameOver && (
                <div className="absolute inset-0 bg-black/95 z-50 flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-500">
                    <h3 className={`text-6xl font-black mb-6 ${(faction === 'PROMOTER' && fireIntensity >= 100) || (faction === 'STATESMAN' && fireIntensity <= 0)
                        ? 'text-gilded-gold'
                        : 'text-gray-500'
                        }`}>
                        {(faction === 'PROMOTER' && fireIntensity >= 100) || (faction === 'STATESMAN' && fireIntensity <= 0)
                            ? 'MISSION ACCOMPLISHED'
                            : 'MISSION FAILED'}
                    </h3>

                    <p className="text-2xl text-white mb-12 max-w-xl leading-relaxed">
                        {fireIntensity >= 100
                            ? "The flames of progress have consumed the past. History is now whatever you say it is."
                            : fireIntensity <= 0
                                ? "The fire is out. The books are soggy but safe. The truth survives another day."
                                : "The struggle continues..."}
                    </p>

                    <div className="flex gap-4">
                        <button
                            onClick={() => startGame(faction)}
                            className="px-8 py-4 bg-white text-black font-black rounded text-xl uppercase tracking-wider hover:bg-gray-200 transition-colors"
                        >
                            Replay Level
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
