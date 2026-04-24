import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Home, Share, ChevronDown, ArrowUpDown, Copy, Check, ExternalLink, Gamepad2, ArrowUp } from 'lucide-react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import TriangleGrid from '../../components/TriangleGrid';
import OnigiriIcon from '../../components/OnigiriIcon';
import EggTartIcon from '../../components/EggTartIcon';
import HungryDragonGame from '../../components/HungryDragonGame';

const PRICING = {
    onigiri_1: 4,
    egg_tart_1: 3,
    onigiri_2: 7,
    egg_tart_3: 7
};
// ... rest of the file stays same, just update the jsx usage
// (skipping some lines for brevity in thought, will provide full block)

const REFERRAL_OPTIONS = [
    "Alex", "Crystal", "Emily", "Ethan", "Hilary", "Janice", "Vivian", "Zach", "Other"
];

export default function OnigiriEggTarts() {
    const [isLoading, setIsLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState<boolean | null>(null);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isGameOpen, setIsGameOpen] = useState(false);
    const [targetScore, setTargetScore] = useState<number | undefined>(undefined);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        onigiri_1: 0,
        egg_tart_1: 0,
        onigiri_2: 0,
        egg_tart_3: 0,
        referrals: [] as string[],
        otherReferral: '',
        pickupAgreement: false
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [copied, setCopied] = useState(false);

    const totalCost = (formData.onigiri_1 * PRICING.onigiri_1) + 
                      (formData.egg_tart_1 * PRICING.egg_tart_1) + 
                      (formData.onigiri_2 * PRICING.onigiri_2) + 
                      (formData.egg_tart_3 * PRICING.egg_tart_3);

    const totalQuantity = (formData.onigiri_1 * 1) + 
                         (formData.egg_tart_1 * 1) + 
                         (formData.onigiri_2 * 2) + 
                         (formData.egg_tart_3 * 3);

    const treatsRef = useRef<HTMLDivElement>(null);
    const treatsInView = useInView(treatsRef, { amount: 0.1 });

    const orderedItems = useMemo(() => {
        const items = [];
        const onigiriCount = (formData.onigiri_1 * 1) + (formData.onigiri_2 * 2);
        const eggTartCount = (formData.egg_tart_1 * 1) + (formData.egg_tart_3 * 3);
        
        // Use a deterministic pileIndex (evens for onigiri, odds for egg tarts)
        // so adding one type doesn't shift the positions of the other type!
        for (let i = 0; i < onigiriCount; i++) {
            items.push({ type: 'onigiri', id: `o_${i}`, pileIndex: i * 2 });
        }
        for (let i = 0; i < eggTartCount; i++) {
            items.push({ type: 'eggtart', id: `e_${i}`, pileIndex: (i * 2) + 1 });
        }
        
        // Sort to ensure the pile layers correctly based on index
        return items.sort((a, b) => a.pileIndex - b.pileIndex);
    }, [formData]);

    const getPilePos = (index: number) => {
        const angle = index * 137.5; // Golden angle for natural distribution
        // Balanced base distance and multiplier for a moderate early spread
        const r = 42 + (Math.sqrt(index) * 16); 
        // Moderate horizontal stretch
        const xOffset = Math.cos(angle * Math.PI / 180) * r * 1.2;
        const yOffset = Math.abs(Math.sin(angle * Math.PI / 180) * r * 0.65) + 15;
        const rotate = (index * 67) % 360;
        return { xOffset, yOffset, rotate, zIndex: 10 + index };
    };

    const showInitialLargeIcons = totalQuantity === 0;

    useEffect(() => {
        const checkFormStatus = async () => {
            try {
                const res = await fetch('/api/form-status?formId=onigiri-egg-tarts');
                if (res.ok) {
                    const data = await res.json();
                    setIsFormOpen(data.isOpen);
                } else {
                    setIsFormOpen(true);
                }
            } catch (err) {
                console.error('Failed to fetch form status:', err);
                setIsFormOpen(true);
            }
        };

        const params = new URLSearchParams(window.location.search);
        if (params.get('play') === 'dragon') {
            setIsGameOpen(true);
            const target = params.get('target');
            if (target) {
                setTargetScore(parseInt(target, 10));
            }
        }
        
        checkFormStatus();
        const t = setTimeout(() => setIsLoading(false), 100);
        return () => clearTimeout(t);
    }, []);

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.fullName.trim()) newErrors.fullName = "Name is required";
        if (!formData.email.trim()) newErrors.email = "Email is required";
        if (totalQuantity <= 0) newErrors.quantity = "Please select at least one item";
        if (formData.referrals.includes('Other') && !formData.otherReferral.trim()) newErrors.otherReferral = "Please specify";
        if (!formData.pickupAgreement) newErrors.pickupAgreement = "You must agree to the pickup terms";
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        setIsSubmitting(true);
        try {
            const selectedReferrals = formData.referrals.map(r => r === 'Other' ? formData.otherReferral : r);
            const payload = {
                fullName: formData.fullName,
                email: formData.email,
                quantity: totalQuantity, // Required by backend
                items: {
                    onigiri_single: formData.onigiri_1,
                    onigiri_double: formData.onigiri_2,
                    egg_tart_single: formData.egg_tart_1,
                    egg_tart_triple: formData.egg_tart_3
                },
                totalCost,
                referrals: selectedReferrals,
                formId: 'onigiri-egg-tarts',
                timestamp: new Date().toISOString()
            };

            const response = await fetch('/api/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                setIsSubmitted(true);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else if (response.status === 403) {
                alert("Sorry! The fundraiser closed while you were filling out the form.");
                setIsFormOpen(false);
            } else {
                throw new Error('Submission failed');
            }
        } catch (error: any) {
            console.error('Error:', error);
            alert("There was an error submitting your order. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleShare = async () => {
        const shareData = {
            title: 'Onigiri & Egg Tarts Fundraiser',
            text: 'Support the Cornell Dragon Boat Club with some delicious treats!',
            url: window.location.href,
        };
        if (navigator.share) {
            try { await navigator.share(shareData); } catch (err) {}
        } else {
            navigator.clipboard.writeText(window.location.href);
            alert('Link copied to clipboard!');
        }
    };

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (isSubmitted) {
        return (
            <div className="bg-red-50 text-stone-800 font-sans antialiased min-h-screen flex flex-col items-center justify-center p-4">
                <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6 mx-auto">
                        <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-stone-800 mb-2">Order Received!</h2>
                    <p className="text-stone-600 mb-6">Thank you for supporting Cornell Dragon Boat! We've received your order for {totalQuantity} items.</p>
                    <div className="bg-stone-50 p-6 rounded-xl mb-6">
                        <div className="flex justify-between items-center pb-4 mb-4 border-b border-stone-200">
                            <span className="text-stone-500 font-bold uppercase tracking-wider text-[10px]">Total Amount Due</span>
                            <span className="text-2xl font-black text-red-600">${totalCost}.00</span>
                        </div>
                        <p className="font-bold mb-2 text-stone-800 text-left text-xs uppercase tracking-tight">Next Steps:</p>
                        <div className="space-y-3 text-sm text-left">
                            <p>
                                Venmo <a href="https://venmo.com/u/hilarykuang" target="_blank" rel="noopener noreferrer" className="text-red-600 font-bold hover:underline inline-flex items-center gap-1">
                                    @HilaryKuang <ExternalLink size={12} />
                                </a>
                            </p>
                            <div className="flex items-center justify-start gap-2">
                                <span>Zelle <strong>415-307-1306</strong></span>
                                <button 
                                    onClick={() => handleCopy("415-307-1306")}
                                    className="p-1.5 hover:bg-stone-200 rounded-md transition-colors text-stone-500"
                                    title="Copy number"
                                >
                                    {copied ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
                                </button>
                            </div>
                            <p className="mt-2">Subject: <span className="bg-yellow-100 px-1 rounded font-mono">Dragonboat</span></p>
                        </div>
                    </div>
                    <div className="flex flex-col gap-3">
                        <button onClick={handleShare} className="bg-red-600 text-white flex items-center justify-center gap-2 font-bold py-3 rounded-xl hover:bg-red-700 transition-colors">
                            <Share size={18} /> Share with Friends
                        </button>
                        <Link to="/" className="text-stone-500 hover:text-stone-800 underline text-sm transition-colors">Return to Home</Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-red-50 text-stone-800 font-sans antialiased min-h-screen flex flex-col items-center p-4 relative no-scrollbar">
            <AnimatePresence>
                {isLoading && (
                    <motion.div
                        key="triangle-grid-overlay"
                        className="fixed inset-0 z-[100] pointer-events-none"
                        exit={{ opacity: 0, transition: { duration: 0.3, delay: 0.5 } }}
                    >
                        <TriangleGrid />
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isGameOpen && (
                    <HungryDragonGame onClose={() => setIsGameOpen(false)} targetScore={targetScore} />
                )}
            </AnimatePresence>

            <div className="max-w-md w-full bg-white rounded-3xl shadow-xl relative flex flex-col z-10 mb-8">
                
                <div className="bg-red-600 text-white p-6 pb-5 text-center z-10 relative rounded-t-3xl">
                    <Link 
                        to="/" 
                        className="absolute top-1/2 -translate-y-1/2 left-4 text-red-200 hover:text-white transition-colors"
                    >
                        <Home size={20} />
                    </Link>
                    <div className="px-8 flex flex-col items-center justify-center">
                        <h1 className="text-xl font-bold tracking-tight leading-tight">Onigiri & Egg Tarts</h1>
                        <p className="text-red-100 text-xs mt-0.5">Cornell Dragon Boat Club</p>
                    </div>
                    <button 
                        onClick={() => setIsGameOpen(true)}
                        className="absolute top-1/2 -translate-y-1/2 right-4 text-red-200 hover:text-yellow-300 hover:scale-110 transition-all drop-shadow-md"
                        title="Play Hungry Dragon!"
                    >
                        <Gamepad2 size={24} />
                    </button>
                    <motion.div 
                        animate={{ y: [0, -3, 0], opacity: [0.7, 1, 0.7] }} 
                        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                        className="absolute top-[calc(50%+16px)] right-[21px] text-yellow-300 pointer-events-none"
                    >
                        <ArrowUp size={14} strokeWidth={3} />
                    </motion.div>
                </div>

                {isFormOpen === false ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-8 py-16 text-center z-10 relative">
                        <div className="w-24 h-24 mb-6 relative animate-bob">
                            <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md overflow-visible">
                                <path d="M 30 80 C 30 45, 40 35, 50 35 C 60 35, 70 45, 70 80 Z" fill="#dc2626" />
                                <path d="M 40 80 C 40 55, 45 45, 50 45 C 55 45, 60 55, 60 80 Z" fill="#fca5a5" />
                                <circle cx="50" cy="35" r="22" fill="#dc2626" />
                                <ellipse cx="50" cy="44" rx="14" ry="10" fill="#fca5a5" />
                                <circle cx="45" cy="42" r="2" fill="#991b1b" />
                                <circle cx="55" cy="42" r="2" fill="#991b1b" />
                                <g id="dragon-eyes-closed">
                                    <path d="M 38 30 Q 42 35 46 30" fill="none" stroke="#1c1917" strokeWidth="2.5" strokeLinecap="round" />
                                    <path d="M 54 30 Q 58 35 62 30" fill="none" stroke="#1c1917" strokeWidth="2.5" strokeLinecap="round" />
                                </g>
                                <path d="M 33 18 Q 25 5 20 12 Q 28 22 33 22 Z" fill="#fbbf24" />
                                <path d="M 67 18 Q 75 5 80 12 Q 72 22 67 22 Z" fill="#fbbf24" />
                                <polygon points="50,13 44,3 56,3" fill="#fbbf24" />
                                <polygon points="32,45 20,40 26,52" fill="#fbbf24" />
                                <polygon points="68,45 80,40 74,52" fill="#fbbf24" />
                                <path d="M 35 60 Q 22 65 28 72" fill="none" stroke="#dc2626" strokeWidth="7" strokeLinecap="round" />
                                <path d="M 65 60 Q 78 65 72 72" fill="none" stroke="#dc2626" strokeWidth="7" strokeLinecap="round" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-stone-800 mb-3">Fundraiser Closed</h2>
                        <p className="text-stone-600 leading-relaxed max-w-sm">
                            Thank you for your support! Our Onigiri & Egg Tarts fundraiser is now closed. 
                            Stay tuned for future events and follow us on Instagram!
                        </p>
                        <Link to="/" className="mt-8 text-sm font-bold text-red-600 hover:text-red-700 underline underline-offset-4">
                            Return to Home
                        </Link>
                    </div>
                ) : (
                    <div className="flex flex-col z-10">
                        {/* Sticky Header with Dragon & Treat Pile */}
                        <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm pt-6 pb-6 w-full border-b border-red-50 shadow-sm flex flex-col items-center transition-all rounded-b-3xl">
                            <div className="bg-white border-2 border-red-50 text-stone-700 text-sm py-2 px-4 rounded-2xl shadow-sm relative mb-4 text-center max-w-[90%]">
                                Help us paddle to San Francisco! Choose your treats below.
                                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-white border-b-2 border-r-2 border-red-50 rotate-45"></div>
                            </div>
                            
                            <div className="flex items-center justify-center w-full relative h-[100px]">
                                {/* Initial Large Onigiri */}
                                <AnimatePresence>
                                    {showInitialLargeIcons && (
                                        <motion.div 
                                            key="initial-onigiri"
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, scale: 0 }}
                                            className="w-16 h-16 absolute left-1/2 -ml-[6rem] animate-float translate-y-2 z-10"
                                        >
                                            <OnigiriIcon />
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Dragon & Hoard Area */}
                                <div className="w-24 h-24 relative z-30 flex-shrink-0">
                                    <div className="animate-bob w-full h-full relative z-20">
                                        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md overflow-visible">
                                            <path d="M 30 80 C 30 45, 40 35, 50 35 C 60 35, 70 45, 70 80 Z" fill="#dc2626" />
                                            <path d="M 40 80 C 40 55, 45 45, 50 45 C 55 45, 60 55, 60 80 Z" fill="#fca5a5" />
                                            <circle cx="50" cy="35" r="22" fill="#dc2626" />
                                            <ellipse cx="50" cy="44" rx="14" ry="10" fill="#fca5a5" />
                                            <circle cx="45" cy="42" r="2" fill="#991b1b" />
                                            <circle cx="55" cy="42" r="2" fill="#991b1b" />
                                            <g id="dragon-eyes">
                                                <path d="M 38 30 Q 42 25 46 30" fill="none" stroke="#1c1917" strokeWidth="2.5" strokeLinecap="round" />
                                                <path d="M 54 30 Q 58 25 62 30" fill="none" stroke="#1c1917" strokeWidth="2.5" strokeLinecap="round" />
                                            </g>
                                            <path d="M 33 18 Q 25 5 20 12 Q 28 22 33 22 Z" fill="#fbbf24" />
                                            <path d="M 67 18 Q 75 5 80 12 Q 72 22 67 22 Z" fill="#fbbf24" />
                                        </svg>
                                    </div>
                                    
                                    {/* Dynamic Treat Hoard */}
                                    <AnimatePresence>
                                        {orderedItems.map((item) => {
                                            const pos = getPilePos(item.pileIndex);
                                            return (
                                                <motion.div
                                                    key={item.id}
                                                    initial={{ scale: 0, opacity: 0, y: -50 }}
                                                    animate={{ scale: 0.7, opacity: 1, x: pos.xOffset, y: pos.yOffset, rotate: pos.rotate }}
                                                    className="absolute top-1/2 left-1/2 -mt-8 -ml-8 w-16 h-16 origin-center"
                                                    style={{ zIndex: pos.zIndex }}
                                                >
                                                    {item.type === 'onigiri' ? <OnigiriIcon /> : <EggTartIcon />}
                                                </motion.div>
                                            );
                                        })}
                                    </AnimatePresence>
                                </div>

                                {/* Initial Large Egg Tart */}
                                <AnimatePresence>
                                    {showInitialLargeIcons && (
                                        <motion.div 
                                            key="initial-eggtart"
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, scale: 0 }}
                                            className="w-14 h-14 absolute left-1/2 ml-[2.5rem] animate-float-delayed translate-y-2 z-10"
                                        >
                                            <EggTartIcon />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-8 pt-10">
                            {/* Personal Info */}
                            <section className="space-y-4">
                                <h2 className="text-lg font-bold border-b border-stone-100 pb-2 flex items-center">
                                    <span className="w-1.5 h-1.5 rounded-full bg-red-600 mr-2"></span>
                                    1. Personal Info
                                </h2>
                                <div>
                                    <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-1">Full Name</label>
                                    <input 
                                        type="text" 
                                        placeholder="Enter your name"
                                        value={formData.fullName}
                                        onChange={e => setFormData({...formData, fullName: e.target.value})}
                                        className={`w-full border-2 ${errors.fullName ? 'border-red-200 bg-red-50' : 'border-stone-50 bg-stone-50'} rounded-2xl px-4 py-3 outline-none focus:border-red-100 focus:bg-white transition-all`}
                                    />
                                    {errors.fullName && <p className="text-xs text-red-500 mt-1 pl-1">{errors.fullName}</p>}
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-1">Email</label>
                                    <input 
                                        type="email" 
                                        placeholder="email@cornell.edu"
                                        value={formData.email}
                                        onChange={e => setFormData({...formData, email: e.target.value})}
                                        className={`w-full border-2 ${errors.email ? 'border-red-200 bg-red-50' : 'border-stone-50 bg-stone-50'} rounded-2xl px-4 py-3 outline-none focus:border-red-100 focus:bg-white transition-all`}
                                    />
                                    {errors.email && <p className="text-xs text-red-500 mt-1 pl-1">{errors.email}</p>}
                                </div>
                            </section>

                            {/* Order Selection */}
                            <section className="space-y-4 scroll-mt-64" ref={treatsRef} id="order-section">
                                <h2 className="text-lg font-bold border-b border-stone-100 pb-2 flex items-center">
                                    <span className="w-1.5 h-1.5 rounded-full bg-red-600 mr-2"></span>
                                    2. Choose Your Treats
                                </h2>
                                
                                <div className="grid grid-cols-2 gap-4">
                                    {[
                                        { id: 'onigiri_1', name: '1 Onigiri', price: 4 },
                                        { id: 'onigiri_2', name: '2 Onigiri', price: 7 },
                                        { id: 'egg_tart_1', name: '1 Egg Tart', price: 3 },
                                        { id: 'egg_tart_3', name: '3 Egg Tarts', price: 7 }
                                    ].map(item => {
                                        const isBundle = item.id.includes('_2') || item.id.includes('_3');
                                        const originalPrice = item.id === 'onigiri_2' ? 8 : 9;
                                        return (
                                            <div 
                                                key={item.id} 
                                                className={`${isBundle ? 'bg-yellow-50 border-yellow-400 ring-2 ring-yellow-400/10 relative' : 'bg-stone-50 border-stone-100'} p-4 rounded-2xl border flex flex-col items-center transition-all hover:shadow-md`}
                                            >
                                                {isBundle && (
                                                    <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-yellow-400 text-[10px] font-black text-yellow-900 px-2.5 py-0.5 rounded-full shadow-sm whitespace-nowrap uppercase tracking-wider">
                                                        Better Deal
                                                    </div>
                                                )}
                                                <p className="font-bold text-stone-800 text-sm mb-1">{item.name}</p>
                                                <div className="flex items-center gap-1.5 mb-3">
                                                    {isBundle && (
                                                        <span className="text-[10px] text-stone-400 line-through font-bold leading-none">${originalPrice}.00</span>
                                                    )}
                                                    <p className="text-xs text-red-600 font-black leading-none">${item.price}.00</p>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <button 
                                                        type="button" 
                                                        onClick={() => setFormData(f => ({...f, [item.id]: Math.max(0, (f as any)[item.id] - 1)}))}
                                                        className="w-8 h-8 rounded-full bg-white border border-stone-200 flex items-center justify-center font-bold text-stone-400 hover:text-red-600 hover:border-red-100 transition-colors shadow-sm"
                                                    >
                                                        -
                                                    </button>
                                                    <span className="font-bold w-4 text-center">{(formData as any)[item.id]}</span>
                                                    <button 
                                                        type="button" 
                                                        onClick={() => setFormData(f => ({...f, [item.id]: (f as any)[item.id] + 1}))}
                                                        className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center font-bold hover:bg-red-700 shadow-sm"
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                                
                                <div className="mt-4 p-3.5 bg-stone-50/50 border border-stone-100 rounded-2xl self-stretch">
                                    <h3 className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-2 flex items-center">
                                        <span className="w-1 h-1 rounded-full bg-stone-300 mr-1.5"></span>
                                        Ingredients
                                    </h3>
                                    <div className="space-y-1.5">
                                        <p className="text-[11px] leading-relaxed text-stone-500">
                                            <span className="font-bold text-stone-700 text-[10px] uppercase tracking-tight mr-1">Onigiri:</span> rice, tuna, mayo, seaweed, soy sauce
                                        </p>
                                        <div className="h-[1px] w-full bg-stone-100 my-1 opacity-50"></div>
                                        <p className="text-[11px] leading-relaxed text-stone-500">
                                            <span className="font-bold text-stone-700 text-[10px] uppercase tracking-tight mr-1">Egg tart:</span> flour, butter, sugar, egg, milk
                                        </p>
                                    </div>
                                </div>

                                {errors.quantity && <p className="text-sm text-red-500 text-center font-bold">{errors.quantity}</p>}
                            </section>

                            {/* Referral */}
                            <section className="space-y-4">
                                <h2 className="text-lg font-bold border-b border-stone-100 pb-2 flex items-center">
                                    <span className="w-1.5 h-1.5 rounded-full bg-red-600 mr-2"></span>
                                    3. Referral
                                </h2>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-3">Who referred you? (optional)</label>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                            {REFERRAL_OPTIONS.map(opt => (
                                                <label 
                                                    key={opt}
                                                    className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all cursor-pointer ${
                                                        formData.referrals.includes(opt) 
                                                        ? 'bg-red-50 border-red-200 text-red-700 font-bold' 
                                                        : 'bg-stone-50 border-stone-50 text-stone-600 hover:border-stone-200'
                                                    }`}
                                                >
                                                    <input 
                                                        type="checkbox"
                                                        className="hidden"
                                                        checked={formData.referrals.includes(opt)}
                                                        onChange={(e) => {
                                                            const newRefs = e.target.checked 
                                                                ? [...formData.referrals, opt]
                                                                : formData.referrals.filter(r => r !== opt);
                                                            setFormData({...formData, referrals: newRefs});
                                                        }}
                                                    />
                                                    <span className="text-xs">{opt}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                    
                                    {formData.referrals.includes('Other') && (
                                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                                            <input 
                                                type="text" 
                                                placeholder="Who referred you?"
                                                value={formData.otherReferral}
                                                onChange={e => setFormData({...formData, otherReferral: e.target.value})}
                                                className={`w-full border-2 ${errors.otherReferral ? 'border-red-200 bg-red-50' : 'border-stone-50 bg-stone-50'} rounded-2xl px-4 py-3 outline-none focus:border-red-100 focus:bg-white transition-all`}
                                            />
                                        </motion.div>
                                    )}
                                </div>
                            </section>

                            {/* Payment */}
                            <section className="space-y-4">
                                <h2 className="text-lg font-bold border-b border-stone-100 pb-2 flex items-center">
                                    <span className="w-1.5 h-1.5 rounded-full bg-red-600 mr-2"></span>
                                    4. Payment & Review
                                </h2>
                                <div className="bg-red-50 p-6 rounded-2xl border-2 border-red-100">
                                    <div className="flex justify-between items-center mb-4">
                                        <span className="font-bold text-stone-600 text-sm uppercase tracking-wider">Total Price</span>
                                        <span className="text-3xl font-black text-red-600">${totalCost}.00</span>
                                    </div>
                                    
                                    <AnimatePresence>
                                        {(formData.onigiri_1 > 0 || formData.onigiri_2 > 0 || formData.egg_tart_1 > 0 || formData.egg_tart_3 > 0) && (
                                            <motion.div 
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="overflow-hidden border-t border-red-100/50 pt-4 mb-4"
                                            >
                                                <p className="text-[11px] font-black text-red-800 uppercase tracking-[0.15em] mb-2">Your Order</p>
                                                <div className="space-y-1.5">
                                                    {[
                                                        { name: '1 Onigiri', qty: formData.onigiri_1, price: PRICING.onigiri_1 },
                                                        { name: '2 Onigiri', qty: formData.onigiri_2, price: PRICING.onigiri_2 },
                                                        { name: '1 Egg Tart', qty: formData.egg_tart_1, price: PRICING.egg_tart_1 },
                                                        { name: '3 Egg Tarts', qty: formData.egg_tart_3, price: PRICING.egg_tart_3 }
                                                    ].filter(item => item.qty > 0).map(item => (
                                                        <div key={item.name} className="flex justify-between items-center text-sm text-stone-600">
                                                            <span>{item.qty}x {item.name}</span>
                                                            <span className="font-medium">${item.qty * item.price}.00</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    <div className="space-y-3 text-sm leading-relaxed text-stone-600 bg-white/50 p-4 rounded-xl">
                                        <p>
                                            <strong>Step 1:</strong> Pay via Venmo 
                                            <a href="https://venmo.com/u/hilarykuang" target="_blank" rel="noopener noreferrer" className="text-red-600 font-bold hover:underline mx-1 inline-flex items-center gap-0.5">
                                                @HilaryKuang <ExternalLink size={10} />
                                            </a>
                                            or Zelle 
                                            <span className="inline-flex items-center bg-white px-1.5 py-0.5 rounded border border-stone-200 ml-1">
                                                <strong className="mr-1">415-307-1306</strong>
                                                <button 
                                                    type="button"
                                                    onClick={() => handleCopy("415-307-1306")}
                                                    className="p-1 hover:bg-stone-100 rounded transition-colors"
                                                >
                                                    {copied ? <Check size={10} className="text-green-600" /> : <Copy size={10} />}
                                                </button>
                                            </span>
                                        </p>
                                        <p><strong>Step 2:</strong> Use subject: <span className="font-mono bg-yellow-100 px-1">Dragonboat</span></p>
                                    </div>
                                </div>
                                
                                <label className={`flex items-start space-x-3 cursor-pointer p-4 rounded-2xl border-2 ${errors.pickupAgreement ? 'bg-red-50 border-red-200' : 'bg-stone-50 border-stone-50'} transition-all`}>
                                    <input 
                                        type="checkbox" 
                                        checked={formData.pickupAgreement}
                                        onChange={e => setFormData({...formData, pickupAgreement: e.target.checked})}
                                        className="mt-1 w-5 h-5 rounded border-stone-300 text-red-600 focus:ring-red-500"
                                    />
                                    <span className="text-xs text-stone-600 leading-normal">
                                        I agree to pick up my order from <strong>Willard Straight Hall</strong> on <strong>April 28th</strong> between <strong>11 AM - 3 PM</strong>. *
                                    </span>
                                </label>
                                {errors.pickupAgreement && <p className="text-xs text-red-500 pl-1">{errors.pickupAgreement}</p>}
                            </section>

                            <button 
                                type="submit" 
                                disabled={isSubmitting}
                                className="w-full bg-red-600 text-white font-black py-4 rounded-2xl shadow-xl shadow-red-200 hover:bg-red-700 hover:shadow-red-300 transform active:scale-[0.98] transition-all flex items-center justify-center disabled:opacity-50"
                            >
                                {isSubmitting ? (
                                    <svg className="animate-spin h-6 w-6 text-white" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                ) : "Place My Order ✨"}
                            </button>
                        </form>
                    </div>
                )}
            </div>
            
            <Link to="/" className="text-stone-400 hover:text-stone-600 flex items-center text-sm font-medium transition-colors pb-8">
               <ArrowUpDown size={14} className="rotate-90 mr-1" /> Back to Home
            </Link>
        </div>
    );
}
