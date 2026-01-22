import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/useGameStore';

interface Protester {
    id: number;
    x: number;
    speed: number;
    fact: string;
}

interface Guard {
    id: number;
    x: number;
    y: number;
}

const HISTORICAL_FACTS = [
    "The Constitution was designed with checks and balances...",
    "E Pluribus Unum means 'Out of many, one'...",
    "The Bill of Rights protects individual liberties...",
    "Democracy requires civic participation...",
    "The Founding Fathers valued compromise...",
];

interface ProtestMinigameProps {
    onClose: () => void;
    onComplete: (success: boolean) => void;
}

export const ProtestMinigame = ({ onClose, onComplete }: ProtestMinigameProps) => {
    const { addLog } = useGameStore();
    const [protesters, setProtesters] = useState<Protester[]>([]);
    const [guards, setGuards] = useState<Guard[]>([
        { id: 1, x: 150, y: 200 },
        { id: 2, x: 250, y: 200 },
        { id: 3, x: 350, y: 200 },
    ]);
    const [score, setScore] = useState(0);
    const [leakedFacts, setLeakedFacts] = useState(0);
    const [timeLeft, setTimeLeft] = useState(30);
    const [gameOver, setGameOver] = useState(false);
    const [draggingGuard, setDraggingGuard] = useState<number | null>(null);

    // Spawn protesters
    useEffect(() => {
        if (gameOver) return;
        const interval = setInterval(() => {
            const newProtester: Protester = {
                id: Date.now(),
                x: 0,
                speed: Math.random() * 2 + 1,
                fact: HISTORICAL_FACTS[Math.floor(Math.random() * HISTORICAL_FACTS.length)],
            };
            setProtesters(prev => [...prev, newProtester]);
        }, 2000);
        return () => clearInterval(interval);
    }, [gameOver]);

    // Move protesters
    useEffect(() => {
        if (gameOver) return;
        const interval = setInterval(() => {
            setProtesters(prev =>
                prev.map(p => ({ ...p, x: p.x + p.speed }))
                    .filter(p => {
                        if (p.x > 450) {
                            // Protester escaped!
                            setLeakedFacts(prev => prev + 1);
                            return false;
                        }
                        return true;
                    })
            );
        }, 50);
        return () => clearInterval(interval);
    }, [gameOver]);

    // Timer
    useEffect(() => {
        if (gameOver) return;
        const interval = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    setGameOver(true);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, [gameOver]);

    // Check collisions
    useEffect(() => {
        if (gameOver) return;
        const checkCollisions = () => {
            setProtesters(prev => {
                const remaining: Protester[] = [];
                prev.forEach(p => {
                    const isBlocked = guards.some(g =>
                        Math.abs(p.x - g.x) < 50 && g.y > 150
                    );
                    if (isBlocked) {
                        setScore(s => s + 10);
                    } else {
                        remaining.push(p);
                    }
                });
                return remaining;
            });
        };
        const interval = setInterval(checkCollisions, 100);
        return () => clearInterval(interval);
    }, [guards, gameOver]);

    // Handle game over
    useEffect(() => {
        if (gameOver) {
            const success = leakedFacts < 3;
            if (success) {
                addLog("Protest suppressed! The spectacle continues uninterrupted.", "Promoter");
            } else {
                addLog("The citizens learned history! Macho takes a hit.", "The Swamp");
            }
            setTimeout(() => onComplete(success), 2000);
        }
    }, [gameOver, leakedFacts, addLog, onComplete]);

    const handleGuardDrag = useCallback((guardId: number, x: number, y: number) => {
        setGuards(prev => prev.map(g =>
            g.id === guardId ? { ...g, x: Math.max(50, Math.min(450, x)), y: Math.max(100, Math.min(280, y)) } : g
        ));
    }, []);

    return (
        <div className="fixed inset-0 z-[90] bg-black/90 flex items-center justify-center p-4">
            <div className="bg-zinc-900 border-2 border-gilded-gold rounded-xl max-w-2xl w-full p-6 relative overflow-hidden">
                {/* Header */}
                <div className="text-center mb-4">
                    <h2 className="text-2xl font-black text-gilded-gold uppercase tracking-widest">
                        🚧 Protest Alert! 🚧
                    </h2>
                    <p className="text-gray-500 text-sm">Drag guards to block the historians!</p>
                </div>

                {/* Stats */}
                <div className="flex justify-around mb-4 text-sm">
                    <div className="text-center">
                        <span className="text-green-400 font-bold text-xl">{score}</span>
                        <p className="text-gray-500">Blocked</p>
                    </div>
                    <div className="text-center">
                        <span className="text-red-400 font-bold text-xl">{leakedFacts}/3</span>
                        <p className="text-gray-500">Facts Leaked</p>
                    </div>
                    <div className="text-center">
                        <span className="text-yellow-400 font-bold text-xl">{timeLeft}s</span>
                        <p className="text-gray-500">Time Left</p>
                    </div>
                </div>

                {/* Game Area */}
                <div
                    className="relative bg-black/50 rounded-lg border border-gray-700 h-72 overflow-hidden"
                    style={{ touchAction: 'none' }}
                >
                    {/* Bulldozer Zone */}
                    <div className="absolute right-0 top-0 bottom-0 w-16 bg-macho-red/30 border-l-2 border-macho-red flex items-center justify-center">
                        <span className="text-2xl">🚜</span>
                    </div>

                    {/* Protesters */}
                    <AnimatePresence>
                        {protesters.map(p => (
                            <motion.div
                                key={p.id}
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{ opacity: 1, scale: 1, x: p.x }}
                                exit={{ opacity: 0, scale: 0 }}
                                className="absolute top-1/2 -translate-y-1/2 text-3xl cursor-default"
                                style={{ left: 0 }}
                            >
                                📚
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {/* Guards */}
                    {guards.map(g => (
                        <motion.div
                            key={g.id}
                            drag
                            dragMomentum={false}
                            onDrag={(_, info) => handleGuardDrag(g.id, info.point.x - 300, info.point.y - 200)}
                            onDragStart={() => setDraggingGuard(g.id)}
                            onDragEnd={() => setDraggingGuard(null)}
                            className={`absolute text-3xl cursor-grab active:cursor-grabbing transition-transform ${draggingGuard === g.id ? 'scale-125 z-10' : ''
                                }`}
                            style={{ left: g.x, top: g.y }}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 1.2 }}
                        >
                            👮
                        </motion.div>
                    ))}

                    {/* Game Over Overlay */}
                    {gameOver && (
                        <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
                            <div className="text-center">
                                <p className={`text-3xl font-black ${leakedFacts < 3 ? 'text-green-400' : 'text-red-400'}`}>
                                    {leakedFacts < 3 ? '✅ SUCCESS!' : '❌ THEY LEARNED HISTORY!'}
                                </p>
                                <p className="text-gray-400 mt-2">
                                    {leakedFacts < 3
                                        ? 'The demolition continues unimpeded.'
                                        : 'The crowd is questioning the spectacle...'}
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Instructions */}
                <p className="text-center text-gray-600 text-xs mt-4">
                    Drag 👮 guards to intercept 📚 historians before they reach the bulldozer!
                </p>

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
