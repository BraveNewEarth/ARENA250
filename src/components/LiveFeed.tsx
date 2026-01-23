
import { useGameStore } from '../store/useGameStore';

const FEED_CONTENT = [
    { speaker: "Historian", text: "The erosion of institutional norms is accelerating at an unprecedented rate.", type: "warning" },
    { speaker: "Promoter", text: "Norms? Norms are for losers who can't sell tickets! acceleration is exciting!", type: "rebuttal" },
    { speaker: "Historian", text: "We are witnessing the commodification of our very soul.", type: "warning" },
    { speaker: "Promoter", text: "Soul? I call it 'Market Value'! And business is BOOMING!", type: "rebuttal" },
    { speaker: "Historian", text: "This structure cannot support such weight. It will collapse.", type: "warning" },
    { speaker: "Promoter", text: "Then we'll build a bigger one on the rubble! With fireworks!", type: "rebuttal" },
    { speaker: "Historian", text: "History will judge us harshly.", type: "warning" },
    { speaker: "Promoter", text: "History is written by the winners, and I'm undefeated!", type: "rebuttal" }
];

export const LiveFeed = () => {
    const macho = useGameStore(state => state.macho);

    if (macho < 50) return null;

    return (
        <div className="bg-black/90 border-t border-b border-macho-red/50 py-2 overflow-hidden relative font-mono text-sm whitespace-nowrap">
            <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-black to-transparent z-10"></div>
            <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-black to-transparent z-10"></div>

            <div className="animate-ticker inline-block">
                {FEED_CONTENT.map((item, index) => (
                    <span key={index} className="mx-8">
                        <span className={`uppercase font-bold mr-2 ${item.type === 'warning' ? 'text-gray-500' : 'text-macho-red'}`}>
                            {item.speaker}:
                        </span>
                        <span className={item.type === 'warning' ? 'text-gray-400 italic' : 'text-macho-red font-black'}>
                            "{item.text}"
                        </span>
                    </span>
                ))}
                {/* Duplicate for seamless loop effect matching logic generally needed for simple CSS marquees */}
                {FEED_CONTENT.map((item, index) => (
                    <span key={`dup-${index}`} className="mx-8">
                        <span className={`uppercase font-bold mr-2 ${item.type === 'warning' ? 'text-gray-500' : 'text-macho-red'}`}>
                            {item.speaker}:
                        </span>
                        <span className={item.type === 'warning' ? 'text-gray-400 italic' : 'text-macho-red font-black'}>
                            "{item.text}"
                        </span>
                    </span>
                ))}
            </div>
        </div>
    );
};
