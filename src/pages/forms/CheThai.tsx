import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import TriangleGrid from '../../components/TriangleGrid';
import CheThaiCup from '../../components/CheThaiCup';

const PRICE_PER_CUP = 5;

const dialogues = [
    { text: "Hi! I'm here to help you order some delicious Chè Thái!", expression: "happy" },
    { text: "Tell me a bit about yourself so we know who's ordering!", expression: "thinking" },
    { text: "Ooh, the best part! How many cups would you like?", expression: "excited" },
    { text: "Almost done! Just review your total and payment instructions.", expression: "happy" },
    { text: "Yay! Thank you so much for supporting us!", expression: "excited" }
];

const cupPositions = [
    // 1. Left base (default)
    { xOffset: '-7.5rem', bottom: '-0.5rem', rotate: -15, scale: 0.9, delay: 1.0, floatClass: 'animate-float-delayed', zIndex: 10 },
    // 2. Right base (default)
    { xOffset: '4rem', bottom: '0.5rem', rotate: 12, scale: 0.95, delay: 1.2, floatClass: 'animate-float', zIndex: 10 },
    // 3. Front Left (below dragon)
    { xOffset: '-4rem', bottom: '-1.5rem', rotate: -25, scale: 0.85, delay: 0.2, floatClass: 'animate-float', zIndex: 30 },
    // 4. Front Right (below dragon)
    { xOffset: '1rem', bottom: '-1rem', rotate: 20, scale: 0.9, delay: 0.3, floatClass: 'animate-float-delayed', zIndex: 30 },
    // 5. Far Left Mid
    { xOffset: '-9.5rem', bottom: '1rem', rotate: -35, scale: 0.8, delay: 0.4, floatClass: 'animate-float', zIndex: 5 },
    // 6. Far Right Mid
    { xOffset: '6rem', bottom: '1.5rem', rotate: 30, scale: 0.85, delay: 0.5, floatClass: 'animate-float-delayed', zIndex: 5 },
    // 7. Front Center (lowest)
    { xOffset: '-1.5rem', bottom: '-2rem', rotate: -5, scale: 1, delay: 0.6, floatClass: 'animate-float-delayed', zIndex: 35 },
    // 8. Left High (behind)
    { xOffset: '-6rem', bottom: '2rem', rotate: -10, scale: 0.75, delay: 0.7, floatClass: 'animate-float', zIndex: 5 },
    // 9. Right High (behind)
    { xOffset: '2.5rem', bottom: '2.5rem', rotate: 15, scale: 0.75, delay: 0.8, floatClass: 'animate-float-delayed', zIndex: 5 },
    // 10. Far Left Low (front-ish)
    { xOffset: '-8rem', bottom: '-1.5rem', rotate: -20, scale: 0.7, delay: 0.9, floatClass: 'animate-float', zIndex: 25 },
    // 11. Far Right Low (front-ish)
    { xOffset: '5rem', bottom: '-1rem', rotate: 25, scale: 0.7, delay: 1.1, floatClass: 'animate-float-delayed', zIndex: 25 },
    // 12. Front Far Right (lowest)
    { xOffset: '3rem', bottom: '-2.5rem', rotate: 10, scale: 0.95, delay: 1.3, floatClass: 'animate-float', zIndex: 35 },
];

export default function CheThai() {
    const [isLoading, setIsLoading] = useState(true);
    const [currentStep, setCurrentStep] = useState(0);
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        netId: '',
        quantity: 0,
        paymentId: '',
        referrals: '',
        pickupAgreement: false
    });
    const [errors, setErrors] = useState<Record<string, boolean>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [dragonOpacity, setDragonOpacity] = useState(1);

    const d = dialogues[currentStep];
    const displayCups = currentStep < 2 ? 2 : formData.quantity;

    useEffect(() => {
        // Trigger the exit animation after a short delay
        const t = setTimeout(() => setIsLoading(false), 100);
        return () => clearTimeout(t);
    }, []);

    const handleNext = () => {
        const newErrors: Record<string, boolean> = {};
        let isValid = true;

        if (currentStep === 1) {
            if (!formData.fullName.trim()) { newErrors.fullName = true; isValid = false; }
            if (!formData.email.trim()) { newErrors.email = true; isValid = false; }
            if (!formData.netId.trim()) { newErrors.netId = true; isValid = false; }
        } else if (currentStep === 2) {
            if (formData.quantity <= 0) {
                newErrors.quantity = true; 
                isValid = false;
                // Temporarily show error dialogue
                setDragonOpacity(0);
                setTimeout(() => {
                    setDragonOpacity(1);
                }, 300);
            }
            if (!formData.paymentId.trim()) { newErrors.paymentId = true; isValid = false; }
        } else if (currentStep === 3) {
            if (!formData.pickupAgreement) { newErrors.pickupAgreement = true; isValid = false; }
        }

        if (isValid) {
            setErrors({});
            setDragonOpacity(0);
            setTimeout(() => {
                setCurrentStep(prev => prev + 1);
                setDragonOpacity(1);
            }, 300);
        } else {
            setErrors(newErrors);
            setTimeout(() => setErrors({}), 2000);
        }
    };

    const handlePrev = () => {
        setDragonOpacity(0);
        setTimeout(() => {
            setCurrentStep(prev => prev - 1);
            setDragonOpacity(1);
        }, 300);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.pickupAgreement) {
            setErrors({ pickupAgreement: true });
            setTimeout(() => setErrors({}), 2000);
            return;
        }

        setIsSubmitting(true);
        try {
            const payload = {
                ...formData,
                formId: 'che-thai',
                totalCost: formData.quantity * PRICE_PER_CUP,
                timestamp: new Date().toISOString()
            };

            const response = await fetch('/api/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                setDragonOpacity(0);
                setTimeout(() => {
                    setCurrentStep(4);
                    setDragonOpacity(1);
                }, 300);
            } else {
                const rawText = await response.text();
                let errorMsg = `HTTP ${response.status} - Submission failed`;
                try {
                    const errorData = JSON.parse(rawText);
                    errorMsg = errorData.details || errorData.error || errorMsg;
                } catch (e) {
                    errorMsg += `\nServer returned: ${rawText.substring(0, 100)}...`;
                }
                throw new Error(errorMsg);
            }
        } catch (error: any) {
            console.error('Error:', error);
            alert(`There was an error submitting your order: ${error.message}\n\nPlease try again.`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderDragonEyes = () => {
        const isError = errors.quantity && currentStep === 2;
        const expression = isError ? 'thinking' : d.expression;

        if (expression === 'happy') {
            return (
                <g id="dragon-eyes">
                    <path d="M 38 30 Q 42 25 46 30" fill="none" stroke="#1c1917" strokeWidth="2.5" strokeLinecap="round" />
                    <path d="M 54 30 Q 58 25 62 30" fill="none" stroke="#1c1917" strokeWidth="2.5" strokeLinecap="round" />
                </g>
            );
        } else if (expression === 'thinking') {
            return (
                <g id="dragon-eyes">
                    <circle cx="42" cy="28" r="3.5" fill="#1c1917" />
                    <path d="M 54 30 Q 58 25 62 30" fill="none" stroke="#1c1917" strokeWidth="2.5" strokeLinecap="round" />
                </g>
            );
        } else if (expression === 'excited') {
            return (
                <g id="dragon-eyes">
                    <circle cx="42" cy="28" r="3.5" fill="#1c1917" />
                    <circle cx="58" cy="28" r="3.5" fill="#1c1917" />
                    <circle cx="43" cy="27" r="1.5" fill="#FFF" />
                    <circle cx="59" cy="27" r="1.5" fill="#FFF" />
                    <ellipse cx="36" cy="34" rx="3" ry="2" fill="#ef4444" opacity="0.6" />
                    <ellipse cx="64" cy="34" rx="3" ry="2" fill="#ef4444" opacity="0.6" />
                </g>
            );
        }
    };

    return (
        <div className="bg-red-50 text-stone-800 font-sans antialiased min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
            <AnimatePresence>
                {isLoading && (
                    <motion.div
                        key="triangle-grid-overlay"
                        className="fixed inset-0 z-[100] pointer-events-none"
                        exit={{ opacity: 0, transition: { duration: 0.3, delay: 3.5 } }}
                    >
                        <TriangleGrid />
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="max-w-md w-full bg-white rounded-3xl shadow-xl overflow-hidden relative min-h-[600px] flex flex-col z-10">
                
                <div className="bg-red-600 text-white p-6 text-center z-10 relative shadow-md">
                    <Link 
                        to="/" 
                        className="absolute top-6 left-6 text-red-200 hover:text-white transition-colors"
                        title="Return Home"
                    >
                        <Home size={24} />
                    </Link>
                    <h1 className="text-2xl font-bold tracking-tight">Chè Thái Fundraiser</h1>
                    <p className="text-red-100 text-sm mt-1">Cornell Dragon Boat Club</p>
                </div>

                <div className="flex flex-col items-center mt-6 z-10 relative min-h-[11rem]">
                    <div 
                        className="bg-white border-2 border-red-100 text-stone-700 text-sm font-medium py-2 px-4 rounded-2xl shadow-sm relative mb-4 max-w-[80%] text-center transition-opacity duration-300"
                        style={{ opacity: dragonOpacity }}
                    >
                        <span>{errors.quantity && currentStep === 2 ? "Please select at least 1 cup!" : d.text}</span>
                        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-white border-b-2 border-r-2 border-red-100 rotate-45"></div>
                    </div>

                    <div className="relative flex items-end justify-center w-full mb-12">
                        <AnimatePresence>
                            {Array.from({ length: Math.min(displayCups, cupPositions.length) }).map((_, i) => {
                                const pos = cupPositions[i];
                                return (
                                    <motion.div 
                                        key={`cup-${i}`}
                                        initial={{ scale: 0, opacity: 0, rotate: pos.rotate - 45 }}
                                        animate={{ scale: pos.scale, opacity: 1, rotate: pos.rotate }}
                                        exit={{ scale: 0, opacity: 0, rotate: pos.rotate + 45 }}
                                        transition={{ type: "spring", delay: currentStep < 2 ? pos.delay : 0, duration: 0.5 }}
                                        className="absolute"
                                        style={{ 
                                            left: '50%',
                                            marginLeft: pos.xOffset,
                                            bottom: pos.bottom,
                                            width: '4rem',
                                            height: '4rem',
                                            zIndex: pos.zIndex,
                                            transform: 'translateX(-50%)'
                                        }}
                                    >
                                        <div className={`w-full h-full ${pos.floatClass}`}>
                                            <CheThaiCup />
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>

                        <div className="w-24 h-24 relative animate-bob z-20">
                            <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md overflow-visible">
                                <path d="M 30 80 C 30 45, 40 35, 50 35 C 60 35, 70 45, 70 80 Z" fill="#dc2626" />
                                <path d="M 40 80 C 40 55, 45 45, 50 45 C 55 45, 60 55, 60 80 Z" fill="#fca5a5" />
                                <circle cx="50" cy="35" r="22" fill="#dc2626" />
                                <ellipse cx="50" cy="44" rx="14" ry="10" fill="#fca5a5" />
                                <circle cx="45" cy="42" r="2" fill="#991b1b" />
                                <circle cx="55" cy="42" r="2" fill="#991b1b" />
                                {renderDragonEyes()}
                                <path d="M 33 18 Q 25 5 20 12 Q 28 22 33 22 Z" fill="#fbbf24" />
                                <path d="M 67 18 Q 75 5 80 12 Q 72 22 67 22 Z" fill="#fbbf24" />
                                <polygon points="50,13 44,3 56,3" fill="#fbbf24" />
                                <polygon points="32,45 20,40 26,52" fill="#fbbf24" />
                                <polygon points="68,45 80,40 74,52" fill="#fbbf24" />
                                <path d="M 35 60 Q 22 65 28 72" fill="none" stroke="#dc2626" strokeWidth="7" strokeLinecap="round" />
                                <path d="M 65 60 Q 78 65 72 72" fill="none" stroke="#dc2626" strokeWidth="7" strokeLinecap="round" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="flex-1 relative overflow-hidden">
                    <form onSubmit={handleSubmit} className="absolute inset-0 w-full h-full transition-transform duration-500 ease-in-out flex" style={{ transform: `translateX(-${currentStep * 100}%)` }}>
                        
                        {/* Step 0: Welcome */}
                        <div className="w-full h-full flex-shrink-0 p-6 flex flex-col step-container overflow-y-auto">
                            <h2 className="text-xl font-bold text-stone-800 mb-2 text-center">Welcome!</h2>
                            <p className="text-stone-600 text-center mb-4 leading-relaxed text-sm">
                                Help us paddle our way to San Francisco! Grab a refreshing cup of sweet Vietnamese fruit cocktail and fuel our journey.
                            </p>
                            <div className="mt-auto">
                                <button type="button" onClick={handleNext} className="w-full bg-red-600 text-white font-bold py-3 rounded-xl shadow-md hover:bg-red-700 transition-colors relative z-20">Start Order</button>
                            </div>
                        </div>

                        {/* Step 1: Personal Info */}
                        <div className="w-full h-full flex-shrink-0 p-6 flex flex-col step-container overflow-y-auto">
                            <h2 className="text-xl font-bold text-stone-800 mb-4">Personal Info</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-stone-700 mb-1">Full Name *</label>
                                    <input 
                                        type="text" 
                                        value={formData.fullName}
                                        onChange={e => setFormData({...formData, fullName: e.target.value})}
                                        className={`w-full border ${errors.fullName ? 'border-red-500 ring-2 ring-red-500' : 'border-stone-300'} rounded-lg px-4 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all`}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-stone-700 mb-1">Email *</label>
                                    <input 
                                        type="email" 
                                        value={formData.email}
                                        onChange={e => setFormData({...formData, email: e.target.value})}
                                        className={`w-full border ${errors.email ? 'border-red-500 ring-2 ring-red-500' : 'border-stone-300'} rounded-lg px-4 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all`}
                                    />
                                </div>
                                <div className="flex space-x-4">
                                    <div className="flex-1">
                                        <label className="block text-sm font-medium text-stone-700 mb-1">Net ID *</label>
                                        <input 
                                            type="text" 
                                            value={formData.netId}
                                            onChange={e => setFormData({...formData, netId: e.target.value})}
                                            className={`w-full border ${errors.netId ? 'border-red-500 ring-2 ring-red-500' : 'border-stone-300'} rounded-lg px-4 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all`}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="mt-auto pt-6 flex space-x-3">
                                <button type="button" onClick={handlePrev} className="flex-1 bg-stone-200 text-stone-700 font-bold py-3 rounded-xl hover:bg-stone-300 transition-colors">Back</button>
                                <button type="button" onClick={handleNext} className="flex-1 bg-red-600 text-white font-bold py-3 rounded-xl shadow-md hover:bg-red-700 transition-colors">Next</button>
                            </div>
                        </div>

                        {/* Step 2: Your Order */}
                        <div className="w-full h-full flex-shrink-0 p-6 flex flex-col step-container overflow-y-auto">
                            <h2 className="text-xl font-bold text-stone-800 mb-4">Your Order</h2>
                            <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 mb-6 flex items-center justify-between">
                                <div>
                                    <h3 className="font-bold text-stone-800">Chè Thái</h3>
                                    <p className="text-sm text-stone-500">$5.00 / cup</p>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <button type="button" onClick={() => setFormData({...formData, quantity: Math.max(0, formData.quantity - 1)})} className="w-8 h-8 rounded-full bg-white border border-stone-300 flex items-center justify-center text-stone-600 hover:bg-stone-100 transition-colors font-bold">-</button>
                                    <input 
                                        type="number" 
                                        value={formData.quantity} 
                                        readOnly
                                        className={`w-12 text-center font-bold text-lg bg-transparent outline-none ${errors.quantity ? 'text-red-600' : ''}`} 
                                    />
                                    <button type="button" onClick={() => setFormData({...formData, quantity: formData.quantity + 1})} className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center hover:bg-red-200 transition-colors font-bold">+</button>
                                </div>
                            </div>
                            <div className="space-y-4 mb-6">
                                <div>
                                    <label className="block text-sm font-medium text-stone-700 mb-1">Phone Number or Venmo ID *</label>
                                    <p className="text-xs text-stone-500 mb-2">Whichever payment method you will use</p>
                                    <input 
                                        type="text" 
                                        value={formData.paymentId}
                                        onChange={e => setFormData({...formData, paymentId: e.target.value})}
                                        className={`w-full border ${errors.paymentId ? 'border-red-500 ring-2 ring-red-500' : 'border-stone-300'} rounded-lg px-4 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all`}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-stone-700 mb-1">Referrals (Optional)</label>
                                    <p className="text-xs text-stone-500 mb-2">If a club member referred you, please write their name(s).</p>
                                    <input 
                                        type="text" 
                                        value={formData.referrals}
                                        onChange={e => setFormData({...formData, referrals: e.target.value})}
                                        className="w-full border border-stone-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
                                    />
                                </div>
                            </div>
                            <div className="mt-auto pt-4 flex space-x-3">
                                <button type="button" onClick={handlePrev} className="flex-1 bg-stone-200 text-stone-700 font-bold py-3 rounded-xl hover:bg-stone-300 transition-colors">Back</button>
                                <button type="button" onClick={handleNext} className="flex-1 bg-red-600 text-white font-bold py-3 rounded-xl shadow-md hover:bg-red-700 transition-colors">Next</button>
                            </div>
                        </div>

                        {/* Step 3: Payment & Pickup */}
                        <div className="w-full h-full flex-shrink-0 p-6 flex flex-col step-container overflow-y-auto">
                            <h2 className="text-xl font-bold text-stone-800 mb-4">Payment & Pickup</h2>
                            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="font-medium text-stone-700">Total Due:</span>
                                    <span className="text-2xl font-bold text-red-600">${(formData.quantity * PRICE_PER_CUP).toFixed(2)}</span>
                                </div>
                            </div>
                            <div className="space-y-3 text-sm text-stone-700 mb-6 bg-stone-50 p-4 rounded-xl border border-stone-200">
                                <p><strong>Step 1:</strong> Venmo <strong>@HilaryKuang</strong> or Zelle <strong>415-307-1306</strong> for your order to be purchased! If you don't have Venmo or Zelle, stop by our table and order in-person with cash.</p>
                                <p><strong>Step 2:</strong> Write <span className="bg-yellow-100 px-1 rounded font-mono">Dragonboat + {formData.quantity} cups + {formData.netId || 'netID'}</span> in the payment subject line/description.</p>
                                <p><strong>Step 3:</strong> You will receive an email regarding pickup once we receive your payment!</p>
                                <p className="text-xs text-stone-500 mt-2 pt-2 border-t border-stone-200">Contact: Reach out to en329@cornell.edu with any questions!</p>
                            </div>
                            <label className={`flex items-start space-x-3 cursor-pointer p-3 border ${errors.pickupAgreement ? 'border-red-500 bg-red-50' : 'border-stone-200'} rounded-xl hover:bg-stone-50 transition-colors`}>
                                <input 
                                    type="checkbox" 
                                    checked={formData.pickupAgreement}
                                    onChange={e => setFormData({...formData, pickupAgreement: e.target.checked})}
                                    className="mt-1 w-5 h-5 text-red-600 rounded focus:ring-red-500"
                                />
                                <span className="text-sm text-stone-700 leading-tight">
                                    I agree to pick up my order from Willard Straight Hall on April 10, 2026 between 10am-2pm. If not, I will send a friend to pick them up. *
                                </span>
                            </label>
                            <div className="mt-auto pt-6 flex space-x-3">
                                <button type="button" onClick={handlePrev} className="flex-1 bg-stone-200 text-stone-700 font-bold py-3 rounded-xl hover:bg-stone-300 transition-colors relative z-20">Back</button>
                                <button type="submit" disabled={isSubmitting} className="flex-1 bg-red-600 text-white font-bold py-3 rounded-xl shadow-md hover:bg-red-700 transition-colors flex justify-center items-center relative z-20 disabled:opacity-70">
                                    <span>Submit Order</span>
                                    {isSubmitting && (
                                        <svg className="animate-spin ml-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Step 4: Success */}
                        <div className="w-full h-full flex-shrink-0 p-6 flex flex-col justify-center items-center step-container text-center">
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                                <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                                </svg>
                            </div>
                            <h2 className="text-2xl font-bold text-stone-800 mb-2">Order Received!</h2>
                            <p className="text-stone-600 mb-8">Thank you for supporting the Cornell Dragon Boat Club. Don't forget to send your payment!</p>
                            <button type="button" onClick={() => window.location.reload()} className="bg-stone-200 text-stone-700 font-bold py-3 px-8 rounded-xl hover:bg-stone-300 transition-colors">Place Another Order</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
