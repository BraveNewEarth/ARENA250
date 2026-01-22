import { useGameStore } from '../store/useGameStore';
import trumpHead from '../assets/trump_head.png';
import obamaHead from '../assets/obama_head.png';

interface CharacterSelectProps {
    onStart?: () => void;
}

export const CharacterSelect = ({ onStart }: CharacterSelectProps) => {
    const { characters, selectedCharacter, selectCharacter, startGame } = useGameStore();

    const getCharacterImage = (id: string | null) => {
        if (id === 'promoter') return trumpHead;
        if (id === 'statesman') return obamaHead;
        return null;
    };

    const handleStart = () => {
        startGame();
        if (onStart) onStart();
    };

    return (
        <div className="min-h-screen bg-void-black flex items-center justify-center p-4 fixed inset-0 z-50 overflow-y-auto">
            <div className="max-w-4xl w-full">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-gilded-gold to-yellow-700 uppercase tracking-tighter mb-4">
                        The Patriot Games
                    </h1>
                    <h2 className="text-2xl md:text-3xl font-bold text-macho-red tracking-[0.3em] uppercase">
                        Arena 250
                    </h2>
                    <p className="text-gray-500 mt-4 max-w-xl mx-auto">
                        Choose your path. Will you embrace the spectacle, or try to preserve what remains?
                    </p>
                </div>

                {/* Character Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    {characters.map((char) => {
                        const isSelected = selectedCharacter === char.id;
                        const imgSrc = getCharacterImage(char.id);

                        return (
                            <button
                                key={char.id}
                                onClick={() => selectCharacter(char.id)}
                                className={`relative p-6 rounded-xl border-2 transition-all duration-300 text-left ${isSelected
                                    ? 'border-gilded-gold bg-gilded-gold/10 scale-105 shadow-lg shadow-gilded-gold/20'
                                    : 'border-gray-700 bg-zinc-900/80 hover:border-gray-500 hover:bg-zinc-800'
                                    }`}
                            >
                                {/* Selection Badge */}
                                {isSelected && (
                                    <div className="absolute -top-3 -right-3 bg-gilded-gold text-black px-3 py-1 rounded-full text-xs font-bold uppercase">
                                        Selected
                                    </div>
                                )}

                                {/* Character Image */}
                                <div className="flex items-center gap-4 mb-4">
                                    {imgSrc && (
                                        <img
                                            src={imgSrc}
                                            alt={char.name}
                                            className="w-20 h-20 object-contain"
                                        />
                                    )}
                                    <div>
                                        <h3 className={`text-2xl font-black uppercase ${char.id === 'promoter' ? 'text-macho-red' : 'text-blue-400'
                                            }`}>
                                            {char.name}
                                        </h3>
                                        <p className="text-gray-400 text-sm">{char.description}</p>
                                    </div>
                                </div>

                                {/* Stats */}
                                <div className="space-y-2 mb-4">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Macho Multiplier:</span>
                                        <span className={`font-bold ${char.machoMultiplier > 1 ? 'text-green-400' : 'text-yellow-400'}`}>
                                            {char.machoMultiplier}x
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Decay Multiplier:</span>
                                        <span className={`font-bold ${char.decayMultiplier === 0 ? 'text-green-400' : 'text-red-400'}`}>
                                            {char.decayMultiplier === 0 ? 'NONE' : `${char.decayMultiplier}x`}
                                        </span>
                                    </div>
                                </div>

                                {/* Special */}
                                <div className="bg-black/40 rounded-lg p-3 border border-gray-700">
                                    <span className="text-xs text-gilded-gold font-bold uppercase tracking-wider">Special Ability:</span>
                                    <p className="text-white text-sm mt-1">{char.special}</p>
                                </div>
                            </button>
                        );
                    })}
                </div>

                {/* Start Button */}
                <div className="text-center">
                    <button
                        onClick={handleStart}
                        disabled={!selectedCharacter}
                        className={`px-12 py-4 rounded-lg font-black uppercase tracking-widest text-lg transition-all ${selectedCharacter
                            ? 'bg-gradient-to-r from-macho-red to-red-700 text-white hover:from-red-700 hover:to-red-800 hover:scale-105 shadow-lg shadow-macho-red/30'
                            : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                            }`}
                    >
                        {selectedCharacter ? 'Enter the Arena' : 'Select a Character'}
                    </button>
                </div>

                {/* Footer */}
                <p className="text-center text-gray-600 text-xs mt-8 uppercase tracking-widest">
                    "Every choice has a cost. Every victory, a consequence."
                </p>
            </div>
        </div>
    );
};
