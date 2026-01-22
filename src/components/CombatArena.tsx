import { useState, useEffect, useCallback } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';
import { useGameStore } from '../store/useGameStore';
import trumpHead from '../assets/trump_head_final.png';
import trumpBody from '../assets/trump_body_final.png';
import obamaHead from '../assets/obama_head_final.png';
import obamaBody from '../assets/obama_body_v4.png';

interface CombatArenaProps {
    onClose: () => void;
}

// Bobblehead Component with head-only wobble
const Bobblehead = ({
    headSrc,
    bodySrc,
    wobble,
    name,
    useTrueTransparency = false
}: {
    headSrc: string;
    bodySrc: string;
    wobble: ReturnType<typeof useSpring>;
    name: string;
    useTrueTransparency?: boolean;
}) => {
    const rotate = useTransform(wobble, [-1, 1], [-15, 15]);
    const translateY = useTransform(wobble, [-1, 0, 1], [-3, 0, -3]);

    return (
        <div className="relative flex flex-col items-center">
            {/* Head - Animated with spring physics */}
            <motion.div
                style={{ rotate, y: translateY }}
                className="relative z-10 origin-bottom"
            >
                <img
                    src={headSrc}
                    alt={`${name} head`}
                    className="w-36 h-36 object-contain"
                    style={useTrueTransparency ? {} : { mixBlendMode: 'lighten' }}
                />
            </motion.div>
            {/* Body - Static */}
            <div className={`${useTrueTransparency ? '-mt-12' : '-mt-14'} relative z-0`}>
                <img
                    src={bodySrc}
                    alt={`${name} body`}
                    className="w-40 h-48 object-contain"
                    style={useTrueTransparency ? {} : { mixBlendMode: 'lighten' }}
                />
            </div>
        </div>
    );
};

export const CombatArena = ({ onClose }: CombatArenaProps) => {
    const { resolveCombat, addLog } = useGameStore();
    const [playerHP, setPlayerHP] = useState(100);
    const [opponentHP, setOpponentHP] = useState(100);
    const [combatLog, setCombatLog] = useState<string[]>([]);
    const [isPlayerTurn, setIsPlayerTurn] = useState(true);
    const [combatEnded, setCombatEnded] = useState(false);

    // Spring physics for bobblehead wobble - high stiffness for snappy bounce
    const playerWobble = useSpring(0, { stiffness: 600, damping: 8 });
    const opponentWobble = useSpring(0, { stiffness: 600, damping: 8 });

    const addCombatLog = useCallback((message: string) => {
        setCombatLog(prev => [message, ...prev].slice(0, 5));
    }, []);

    // Check for combat end
    useEffect(() => {
        if (combatEnded) return;

        if (opponentHP <= 0) {
            setCombatEnded(true);
            addCombatLog("🎉 KNOCKOUT! THE PROMOTER WINS!");
            addLog("Combat Victory! The crowd goes wild!", "Promoter");
            resolveCombat('player');
            setTimeout(onClose, 2500);
        } else if (playerHP <= 0) {
            setCombatEnded(true);
            addCombatLog("💀 DEFEAT! The Statesman prevails...");
            addLog("Combat Loss. The spectacle falters.", "System");
            resolveCombat('opponent');
            setTimeout(onClose, 2500);
        }
    }, [playerHP, opponentHP, combatEnded, resolveCombat, addLog, addCombatLog, onClose]);

    // Opponent AI turn
    useEffect(() => {
        if (!isPlayerTurn && !combatEnded && opponentHP > 0) {
            const timeout = setTimeout(() => {
                const damage = Math.floor(Math.random() * 15) + 10;
                setPlayerHP(prev => Math.max(0, prev - damage));
                // Trigger wobble animation
                playerWobble.set(1);
                setTimeout(() => playerWobble.set(-0.5), 80);
                setTimeout(() => playerWobble.set(0.3), 160);
                setTimeout(() => playerWobble.set(0), 250);
                addCombatLog(`📢 Statesman counters with logic! -${damage} HP`);
                setIsPlayerTurn(true);
            }, 1200);
            return () => clearTimeout(timeout);
        }
    }, [isPlayerTurn, combatEnded, opponentHP, playerWobble, addCombatLog]);

    const playPunchSound = () => {
        try {
            const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(150, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.1);

            gain.gain.setValueAtTime(0.5, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start();
            osc.stop(ctx.currentTime + 0.1);
        } catch (e) {
            console.error('Audio play failed', e);
        }
    };

    const playTweetSound = () => {
        try {
            const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(2000, ctx.currentTime);
            osc.frequency.linearRampToValueAtTime(1000, ctx.currentTime + 0.1);
            osc.frequency.linearRampToValueAtTime(2000, ctx.currentTime + 0.2);

            gain.gain.setValueAtTime(0.1, ctx.currentTime);
            gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.2);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start();
            osc.stop(ctx.currentTime + 0.2);
        } catch (e) {
            console.error('Audio play failed', e);
        }
    };

    const handlePunch = () => {
        if (!isPlayerTurn || combatEnded) return;
        playPunchSound();
        const damage = Math.floor(Math.random() * 20) + 15;
        setOpponentHP(prev => Math.max(0, prev - damage));
        // Trigger wobble animation - multi-bounce for realism
        opponentWobble.set(-1);
        setTimeout(() => opponentWobble.set(0.6), 80);
        setTimeout(() => opponentWobble.set(-0.3), 160);
        setTimeout(() => opponentWobble.set(0), 250);
        addCombatLog(`👊 PUNCH! The Promoter lands a hit! -${damage} HP`);
        setIsPlayerTurn(false);
    };

    const handleTweet = () => {
        if (!isPlayerTurn || combatEnded) return;
        playTweetSound();
        const damage = Math.floor(Math.random() * 30) + 25;
        setOpponentHP(prev => Math.max(0, prev - damage));
        // Trigger intense wobble for tweet
        opponentWobble.set(1);
        setTimeout(() => opponentWobble.set(-1), 60);
        setTimeout(() => opponentWobble.set(0.8), 120);
        setTimeout(() => opponentWobble.set(-0.4), 180);
        setTimeout(() => opponentWobble.set(0), 280);
        addCombatLog(`🐦 TWEET DEPLOYED! Devastating! -${damage} HP`);
        setIsPlayerTurn(false);
    };

    return (
        <div className="fixed inset-0 z-[90] bg-black/90 flex items-center justify-center p-4">
            <div className="bg-black border-2 border-macho-red rounded-xl max-w-4xl w-full p-6 relative overflow-hidden">
                {/* Header */}
                <div className="text-center mb-6">
                    <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-macho-red to-gilded-gold uppercase tracking-widest">
                        ⚔️ Arena Combat ⚔️
                    </h2>
                    <p className="text-gray-500 text-sm mt-1">The Spectacle Demands Blood!</p>
                </div>

                {/* Combat Area */}
                <div className="flex justify-around items-end mb-8">
                    {/* Player (Trump) */}
                    <div className="text-center">
                        <Bobblehead
                            headSrc={trumpHead}
                            bodySrc={trumpBody}
                            wobble={playerWobble}
                            name="The Promoter"
                            useTrueTransparency={true}
                        />
                        <p className="text-gilded-gold font-bold mt-2 uppercase text-sm">The Promoter</p>
                        <div className="w-32 mx-auto bg-gray-800 rounded-full h-4 mt-2 overflow-hidden">
                            <motion.div
                                className="h-full bg-gradient-to-r from-green-500 to-green-400"
                                initial={{ width: '100%' }}
                                animate={{ width: `${playerHP}%` }}
                                transition={{ type: 'spring', stiffness: 300 }}
                            />
                        </div>
                        <p className="text-white text-xs mt-1">{playerHP} HP</p>
                    </div>

                    {/* VS */}
                    <div className="text-5xl font-black text-macho-red animate-pulse">VS</div>

                    {/* Opponent (Obama) */}
                    <div className="text-center">
                        <Bobblehead
                            headSrc={obamaHead}
                            bodySrc={obamaBody}
                            wobble={opponentWobble}
                            name="The Statesman"
                            useTrueTransparency={true}
                        />
                        <p className="text-blue-400 font-bold mt-2 uppercase text-sm">The Statesman</p>
                        <div className="w-32 mx-auto bg-gray-800 rounded-full h-4 mt-2 overflow-hidden">
                            <motion.div
                                className="h-full bg-gradient-to-r from-blue-500 to-blue-400"
                                initial={{ width: '100%' }}
                                animate={{ width: `${opponentHP}%` }}
                                transition={{ type: 'spring', stiffness: 300 }}
                            />
                        </div>
                        <p className="text-white text-xs mt-1">{opponentHP} HP</p>
                    </div>
                </div>

                {/* Combat Log */}
                <div className="bg-black/50 border border-gray-700 rounded-lg p-3 mb-6 h-24 overflow-y-auto">
                    {combatLog.length === 0 ? (
                        <p className="text-gray-500 text-center italic">The crowd roars in anticipation...</p>
                    ) : (
                        combatLog.map((log, i) => (
                            <p key={i} className={`text-sm ${i === 0 ? 'text-white font-bold' : 'text-gray-400'}`}>{log}</p>
                        ))
                    )}
                </div>

                {/* Actions */}
                <div className="flex justify-center gap-4">
                    <button
                        onClick={handlePunch}
                        disabled={!isPlayerTurn || combatEnded}
                        className={`px-6 py-3 rounded-lg font-bold uppercase tracking-wider transition-all ${isPlayerTurn && !combatEnded
                            ? 'bg-macho-red text-white hover:bg-red-700 hover:scale-105'
                            : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                            }`}
                    >
                        👊 Throw a Punch
                    </button>
                    <button
                        onClick={handleTweet}
                        disabled={!isPlayerTurn || combatEnded}
                        className={`px-6 py-3 rounded-lg font-bold uppercase tracking-wider transition-all ${isPlayerTurn && !combatEnded
                            ? 'bg-blue-600 text-white hover:bg-blue-700 hover:scale-105'
                            : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                            }`}
                    >
                        🐦 Deploy a Tweet
                    </button>
                </div>

                {/* Turn Indicator */}
                {!combatEnded && (
                    <p className={`text-center mt-4 text-sm font-bold uppercase tracking-widest ${isPlayerTurn ? 'text-gilded-gold' : 'text-blue-400'}`}>
                        {isPlayerTurn ? "Your Turn!" : "Opponent's Turn..."}
                    </p>
                )}

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
