import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, X, Play, Loader2, Sword, Check } from 'lucide-react';
import { collection, addDoc, query, orderBy, limit, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import OnigiriIcon from './OnigiriIcon';
import EggTartIcon from './EggTartIcon';
import BuoyIcon from './BuoyIcon';
import SailboatIcon from './SailboatIcon';

interface HungryDragonGameProps {
    onClose: () => void;
    targetScore?: number;
}

export default function HungryDragonGame({ onClose, targetScore }: HungryDragonGameProps) {
    const [gameState, setGameState] = useState<'idle' | 'playing' | 'gameover'>('idle');
    const [netId, setNetId] = useState('');
    const [score, setScore] = useState(0);
    const [highScores, setHighScores] = useState<{ id: string, netId: string, score: number }[]>([]);
    const [isCopied, setIsCopied] = useState(false);
    
    // Grid slot 0-8. Null if nothing is active.
    const [activeItem, setActiveItem] = useState<{ index: number, type: 'onigiri' | 'eggtart' | 'boat' | 'buoy', id: string } | null>(null);

    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Fetch Leaderboard
    useEffect(() => {
        const q = query(collection(db, 'leaderboard'), orderBy('score', 'desc'), limit(3));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const scores = snapshot.docs.map(doc => ({
                id: doc.id,
                netId: doc.data().netId,
                score: doc.data().score
            }));
            setHighScores(scores);
        }, (error) => {
            console.error("Error fetching leaderboard:", error);
        });
        return () => unsubscribe();
    }, []);

    const startGame = () => {
        if (!netId.trim()) return;
        setScore(0);
        setGameState('playing');
        spawnNextItem(0);
    };

    const endGame = async (finalScore: number) => {
        setGameState('gameover');
        setActiveItem(null);
        if (timerRef.current) clearTimeout(timerRef.current);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);

        // Save score
        if (finalScore > 0) {
            try {
                await addDoc(collection(db, 'leaderboard'), {
                    netId: netId.trim(),
                    score: finalScore,
                    createdAt: serverTimestamp()
                });
            } catch (e) {
                console.error("Error saving score", e);
            }
        }
    };

    const spawnNextItem = (currentScore: number) => {
        setActiveItem(null);
        
        // Pace getting faster
        const delay = Math.max(100, 800 - (currentScore * 20)); 
        const visibleTime = Math.max(300, 1500 - (currentScore * 30));

        timerRef.current = setTimeout(() => {
            const types: ('onigiri' | 'eggtart' | 'boat' | 'buoy')[] = ['onigiri', 'eggtart', 'boat', 'buoy'];
            // As score goes up, slightly higher chance for bad items, but keep good items common
            const isBad = Math.random() < 0.3; 
            let selectedType = types[0];
            if (isBad) {
                selectedType = types[Math.floor(Math.random() * 2) + 2]; // index 2, 3 (boat, buoy)
            } else {
                selectedType = types[Math.floor(Math.random() * 2)]; // index 0, 1 (onigiri, eggtart)
            }

            const item = {
                index: Math.floor(Math.random() * 9),
                type: selectedType,
                id: Math.random().toString()
            };
            
            setActiveItem(item);

            timeoutRef.current = setTimeout(() => {
                // If it was a good item and time ran out, Game Over!
                if (item.type === 'onigiri' || item.type === 'eggtart') {
                    endGame(currentScore);
                } else {
                    // It was a bad item and they ignored it (Good!)
                    spawnNextItem(currentScore);
                }
            }, visibleTime);

        }, delay);
    };

    const handleTap = (index: number) => {
        if (gameState !== 'playing' || !activeItem || activeItem.index !== index) return;

        // Clear the timeout that would trigger game over for missing
        if (timeoutRef.current) clearTimeout(timeoutRef.current);

        if (activeItem.type === 'onigiri' || activeItem.type === 'eggtart') {
            // Good Tap!
            const newScore = score + 1;
            setScore(newScore);
            spawnNextItem(newScore);
        } else {
            // Bad Tap (Boat, Buoy)
            endGame(score);
        }
    };

    const BadItemGraphic = ({ type }: { type: 'boat' | 'buoy' }) => {
        if (type === 'buoy') return <div className="w-10 h-10"><BuoyIcon /></div>;
        return <div className="w-10 h-10"><SailboatIcon /></div>;
    };

    const handleChallenge = async () => {
        const shareUrl = `${window.location.origin}${window.location.pathname}?play=dragon&target=${score}`;
        const shareData = {
            title: 'Hungry Dragon Challenge',
            text: `I just scored ${score} in the Hungry Dragon mini-game! 🐉 Think you can beat me?`,
            url: shareUrl
        };

        if (navigator.share && /mobile|android|iphone|ipad|ipod/i.test(navigator.userAgent)) {
            try {
                await navigator.share(shareData);
            } catch (err) {
                console.error('Error sharing', err);
                fallbackCopy(shareUrl);
            }
        } else {
            fallbackCopy(shareUrl);
        }
    };

    const fallbackCopy = (url: string) => {
        const text = `I just scored ${score} in the Hungry Dragon mini-game! 🐉 Think you can beat me? Play here: ${url}`;
        navigator.clipboard.writeText(text).then(() => {
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        });
    };

    const getScoreMessage = (s: number) => {
        if (s === 0) return "The dragon starved... guarantee your survival by ordering below!";
        if (s > 0 && s <= 10) return "Not bad, but you look hungry. Treat yourself to the real deal!";
        if (s > 10 && s <= 20) return "Great reflexes! But reach top 3 to win a FREE onigiri!";
        if (s > 20 && s <= 30) return "Ur cooking! Time to celebrate with a real Onigiri.";
        if (s > 30 && s < 40) return "Godly";
        return "Buddy, just buy 1 atp.";
    };

    const handleOrderClick = () => {
        onClose();
        setTimeout(() => {
            const orderSection = document.getElementById('order-section');
            if (orderSection) {
                orderSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }, 300);
    };

    return (
        <div className="fixed inset-0 z-50 bg-stone-900/80 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-red-50 rounded-3xl shadow-xl w-full max-w-md overflow-hidden flex flex-col relative"
            >
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center bg-white rounded-full text-stone-500 shadow-sm"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="bg-red-700 text-white p-6 text-center shadow-inner relative overflow-hidden">
                    <h2 className="text-2xl font-black italic tracking-wide uppercase relative z-10">Hungry Dragon</h2>
                    <p className="text-red-100 text-sm font-medium relative z-10">Win a FREE Onigiri</p>
                </div>

                <div className="p-6 flex-1 flex flex-col">
                    {gameState === 'idle' && (
                        <div className="flex flex-col items-center justify-center space-y-6 flex-1">
                            {targetScore && (
                                <div className="bg-yellow-100 border border-yellow-300 text-yellow-800 px-4 py-3 rounded-xl shadow-sm font-bold animate-pulse inline-block mb-2 text-center w-full">
                                    ⚔️ Someone challenged you to beat {targetScore}!
                                </div>
                            )}

                            <div className="w-full grid grid-cols-2 gap-3 px-2">
                                {/* Treats Column */}
                                <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-green-100 flex flex-col items-center text-center shadow-sm">
                                    <span className="text-[10px] font-black text-green-600 uppercase tracking-widest mb-3 italic">Treats</span>
                                    <div className="flex gap-2 mb-3">
                                        <div className="w-10 h-10 drop-shadow-sm"><OnigiriIcon /></div>
                                        <div className="w-10 h-10 drop-shadow-sm"><EggTartIcon /></div>
                                    </div>
                                    <p className="text-[11px] font-bold text-stone-600 leading-tight">Catch the<br/>treats.</p>
                                </div>
                                {/* Obstacles Column */}
                                <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-red-100 flex flex-col items-center text-center shadow-sm">
                                    <span className="text-[10px] font-black text-red-600 uppercase tracking-widest mb-3 italic">Obstacles</span>
                                    <div className="flex gap-2 mb-3">
                                        <div className="w-10 h-10 drop-shadow-sm"><BuoyIcon /></div>
                                        <div className="w-10 h-10 drop-shadow-sm"><SailboatIcon /></div>
                                    </div>
                                    <p className="text-[11px] font-bold text-stone-600 leading-tight">Avoid the<br/>obstacles.</p>
                                </div>
                            </div>

                            <div className="w-full flex-col items-center space-y-3">
                                <p className="text-center text-[10px] text-stone-400 font-black uppercase tracking-widest">Top 3 scores win a free Onigiri! 🥡</p>
                                <input 
                                    type="text"
                                    placeholder="Enter NetID"
                                    value={netId}
                                    onChange={(e) => setNetId(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-red-200 focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none text-center font-bold text-stone-700 uppercase"
                                    maxLength={10}
                                />
                            </div>
                            
                            <button 
                                onClick={startGame}
                                disabled={!netId.trim()}
                                className="w-full bg-red-600 hover:bg-red-700 disabled:bg-stone-300 text-white font-bold py-3 rounded-xl transition-colors flex justify-center items-center gap-2"
                            >
                                <Play className="w-5 h-5 fill-current" /> Play Now
                            </button>

                            <div className="w-full mt-4 bg-white rounded-xl p-4 shadow-sm border border-red-100">
                                <div className="flex items-center gap-2 mb-3 text-red-700 font-bold justify-center">
                                    <Trophy className="w-4 h-4" /> Leaderboard
                                </div>
                                {highScores.length === 0 ? (
                                    <p className="text-center text-stone-400 text-sm">No scores yet. Be the first!</p>
                                ) : (
                                    <div className="space-y-2">
                                        {highScores.map((hs, i) => (
                                            <div key={hs.id} className="flex justify-between items-center bg-red-50 px-3 py-2 rounded-lg text-sm">
                                                <div className="flex items-center gap-3">
                                                    <span className={`font-black ${i === 0 ? 'text-amber-500' : 'text-stone-400'}`}>#{i + 1}</span>
                                                    <span className="font-bold text-stone-700 uppercase">{hs.netId}</span>
                                                </div>
                                                <span className="font-black text-red-600">{hs.score}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <p className="mt-4 pt-3 border-t border-red-50 text-[10px] text-red-500 font-bold text-center uppercase tracking-wider leading-relaxed">
                                    Free onigiri for top 3 by<br/>Tuesday (4/28) @ 10 AM!
                                </p>
                            </div>
                        </div>
                    )}

                    {gameState === 'playing' && (
                        <div className="flex flex-col items-center flex-1">
                            <div className="text-4xl font-black text-red-600 mb-6 drop-shadow-sm">{score}</div>
                            
                            <div className="grid grid-cols-3 gap-3 w-full max-w-[300px]">
                                {[0, 1, 2, 3, 4, 5, 6, 7, 8].map(index => {
                                    const isActive = activeItem?.index === index;
                                    return (
                                        <button 
                                            key={index}
                                            onClick={() => handleTap(index)}
                                            className="w-full aspect-square bg-white rounded-2xl shadow-inner border-b-4 border-r-4 border-red-200 active:border-b-0 active:border-r-0 active:translate-y-1 active:translate-x-1 relative overflow-hidden flex items-center justify-center transition-all touch-manipulation"
                                        >
                                            {/* Water styling */}
                                            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-blue-50 z-0"></div>
                                            
                                            <AnimatePresence mode="popLayout">
                                                {isActive && (
                                                    <motion.div
                                                        key={activeItem.id}
                                                        initial={{ y: 50, opacity: 0 }}
                                                        animate={{ y: 0, opacity: 1 }}
                                                        exit={{ y: 50, opacity: 0 }}
                                                        transition={{ type: "spring", stiffness: 500, damping: 25 }}
                                                        className="relative z-10 w-12 h-12 flex items-center justify-center"
                                                    >
                                                        {activeItem.type === 'onigiri' && <div className="w-10 h-10"><OnigiriIcon /></div>}
                                                        {activeItem.type === 'eggtart' && <div className="w-10 h-10"><EggTartIcon /></div>}
                                                        {(activeItem.type === 'boat' || activeItem.type === 'buoy') && (
                                                            <BadItemGraphic type={activeItem.type} />
                                                        )}
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </button>
                                    )
                                })}
                            </div>
                        </div>
                    )}

                    {gameState === 'gameover' && (
                        <div className="flex flex-col items-center justify-center space-y-4 flex-1 text-center">
                            <h3 className="text-3xl font-black text-stone-800">GAME OVER</h3>
                            <div className="bg-white px-8 py-5 rounded-2xl shadow-sm border border-red-100">
                                <p className="text-stone-500 font-medium mb-1">Final Score</p>
                                <p className="text-5xl font-black text-red-600">{score}</p>
                            </div>
                            
                            <p className="text-sm font-bold text-stone-600 px-4 bg-stone-100 py-3 rounded-xl border border-stone-200">
                                {getScoreMessage(score)}
                            </p>
                            
                            <div className="w-full space-y-3 pt-2">
                                <button 
                                    onClick={handleOrderClick}
                                    className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-3.5 rounded-xl transition-colors shadow-md border-b-4 border-red-800 active:border-b-0 active:translate-y-1"
                                >
                                    Hungry for real? Build your order!
                                </button>
                                
                                <button 
                                    onClick={handleChallenge}
                                    className="w-full bg-yellow-400 hover:bg-yellow-500 text-stone-900 font-bold py-3 rounded-xl transition-colors flex justify-center items-center gap-2 shadow-sm"
                                >
                                    {isCopied ? <Check className="w-5 h-5"/> : <Sword className="w-5 h-5"/>} 
                                    {isCopied ? "Copied to clipboard!" : "Challenge a Friend"}
                                </button>
                                
                                <button 
                                    onClick={startGame}
                                    className="w-full bg-stone-800 hover:bg-stone-900 text-white font-bold py-3 rounded-xl transition-colors flex justify-center items-center gap-2"
                                >
                                    Play Again
                                </button>
                            </div>
                            
                            <button 
                                onClick={() => setGameState('idle')}
                                className="text-stone-500 font-bold hover:text-stone-700 transition-colors"
                            >
                                View Leaderboard
                            </button>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
