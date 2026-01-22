import type { Artifact } from '../types';

interface Props {
    artifacts: Artifact[];
}

export const ArtifactPanel = ({ artifacts }: Props) => {
    return (
        <div className="bg-void-black border border-gilded-gold/30 p-6 rounded-lg shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-macho-red via-gilded-gold to-macho-red opacity-50"></div>

            <h2 className="text-2xl font-bold text-gilded-gold mb-6 pb-2 border-b border-gilded-gold/20 flex items-center gap-2">
                <span>🏆</span> Artifacts
            </h2>

            <div className="space-y-4">
                {artifacts.map((artifact, idx) => (
                    <div key={idx} className={`p-4 rounded border transition-all duration-300 ${artifact.isUnlocked ? 'border-gilded-gold bg-gilded-gold/5 shadow-[0_0_10px_rgba(212,175,55,0.1)]' : 'border-gray-800 bg-gray-900/50 text-gray-600 grayscale'}`}>
                        <h4 className={`font-bold text-lg ${artifact.isUnlocked ? 'text-macho-red' : 'text-gray-500'}`}>
                            {artifact.name}
                        </h4>

                        {artifact.isUnlocked ? (
                            <div className="mt-2 text-sm text-gray-300 border-l-2 border-gilded-gold pl-3 italic">
                                "{artifact.reality}"
                            </div>
                        ) : (
                            <div className="mt-2 text-xs text-gray-500 flex items-center gap-2">
                                <span>🔒</span>
                                <span>Locked (Trigger: {artifact.trigger})</span>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};
