import React from 'react';
import { useGameStore } from '../store/useGameStore';

export const HistoryLog = () => {
    const logs = useGameStore(state => state.logs);

    return (
        <div className="bg-zinc-900/50 border border-white/10 rounded-lg p-4 h-64 overflow-y-auto font-mono text-xs">
            <h3 className="text-gray-500 uppercase tracking-widest text-xs font-bold mb-3 sticky top-0 bg-zinc-900/90 py-1">
                Discard Pile (History)
            </h3>
            <div className="space-y-3">
                {logs.map(log => (
                    <div key={log.id} className="border-l-2 border-gray-700 pl-3 py-1 opacity-70 hover:opacity-100 transition-opacity">
                        <div className="flex justify-between items-center mb-1">
                            <span className={`font-bold ${log.source === 'Promoter' ? 'text-macho-red' : 'text-blue-400'}`}>
                                {log.source}
                            </span>
                            <span className="text-gray-600 text-[10px]">
                                {new Date(log.timestamp).toLocaleTimeString()}
                            </span>
                        </div>
                        <p className="text-gray-300 leading-snug">{log.message}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};
