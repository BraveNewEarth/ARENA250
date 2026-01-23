import { useEffect, useState } from 'react';
import { useGameStore } from '../store/useGameStore';

export const NarrativeOverlay = () => {
    const logs = useGameStore(state => state.logs);
    const [activeMessage, setActiveMessage] = useState<string | null>(null);

    useEffect(() => {
        if (logs.length > 0) {
            const latestLog = logs[0];
            if (latestLog.source === "Promoter") {
                setActiveMessage(latestLog.message);
                const timer = setTimeout(() => setActiveMessage(null), 6000); // Hide after 6s
                return () => clearTimeout(timer);
            }
        }
    }, [logs]);

    if (!activeMessage) return null;

    return (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-2xl px-4 z-50 pointer-events-none">
            <div className="bg-black/90 border-2 border-macho-red p-6 rounded-lg shadow-[0_0_30px_rgba(138,3,3,0.6)] transform transition-all duration-300 animate-in slide-in-from-bottom-5">
                <div className="flex items-start gap-4">
                    <div className="w-16 h-16 bg-macho-red shrink-0 rounded-full border-2 border-gilded-gold flex items-center justify-center overflow-hidden">
                        <span className="text-3xl">😤</span>
                    </div>
                    <div className="flex-1">
                        <h4 className="text-macho-red font-black uppercase tracking-widest text-sm mb-1">The Promoter</h4>
                        <p className="text-white text-lg font-bold italic font-serif leading-relaxed">
                            "{activeMessage}"
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
