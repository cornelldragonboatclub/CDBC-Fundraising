import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Lock, History } from 'lucide-react';

export default function Home() {
  const [isCheThaiOpen, setIsCheThaiOpen] = useState<boolean | null>(null);
  const [isOnigiriOpen, setIsOnigiriOpen] = useState<boolean | null>(null);

  useEffect(() => {
    // Fetch statuses
    Promise.all([
      fetch('/api/form-status?formId=che-thai').then(res => res.json()),
      fetch('/api/form-status?formId=onigiri-tarts').then(res => res.json())
    ]).then(([cheThai, onigiri]) => {
      setIsCheThaiOpen(cheThai.isOpen);
      setIsOnigiriOpen(onigiri.isOpen);
    }).catch(err => {
      console.error('Error fetching form statuses:', err);
      if (isCheThaiOpen === null) setIsCheThaiOpen(true);
      if (isOnigiriOpen === null) setIsOnigiriOpen(true);
    });
  }, []);

  const fundraisers = [
    {
      id: 'onigiri-tarts',
      title: 'Onigiri & Egg Tarts',
      pickup: 'April 28, 2026 @ Willard Straight Hall',
      path: '/onigiri-tarts',
      isOpen: isOnigiriOpen
    },
    {
      id: 'che-thai',
      title: 'Chè Thái Fundraiser',
      pickup: 'April 10, 2026 @ Willard Straight Hall',
      path: '/che-thai',
      isOpen: isCheThaiOpen
    }
  ];

  const activeFundraisers = fundraisers.filter(f => f.isOpen === true);
  const pastFundraisers = fundraisers.filter(f => f.isOpen === false);

  return (
    <div className="bg-stone-50 text-stone-800 font-sans antialiased min-h-screen flex flex-col items-center py-12 px-4 relative">
      <Link 
        to="/admin" 
        className="absolute top-4 right-4 flex items-center space-x-1 text-sm font-medium text-stone-500 hover:text-stone-800 transition-colors bg-white px-3 py-1.5 rounded-full shadow-sm border border-stone-200"
      >
        <Lock size={14} />
        <span>Admin</span>
      </Link>

      <div className="max-w-2xl w-full">
        <div className="text-center mb-12">
          <div className="w-24 h-24 mx-auto mb-6 relative animate-bob">
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
              <polygon points="50,13 44,3 56,3" fill="#fbbf24" />
              <polygon points="32,45 20,40 26,52" fill="#fbbf24" />
              <polygon points="68,45 80,40 74,52" fill="#fbbf24" />
              <path d="M 35 60 Q 22 65 28 72" fill="none" stroke="#dc2626" strokeWidth="7" strokeLinecap="round" />
              <path d="M 65 60 Q 78 65 72 72" fill="none" stroke="#dc2626" strokeWidth="7" strokeLinecap="round" />
            </svg>
          </div>
          
          <h1 className="text-4xl font-bold tracking-tight text-stone-900 mb-3">Cornell Dragon Boat</h1>
          <p className="text-lg text-stone-500">Support our team through our fundraisers!</p>
        </div>

        <div className="space-y-12">
          {/* Active Fundraisers */}
          <section>
            <h2 className="text-xl font-bold text-stone-800 mb-6 flex items-center">
              <span className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></span>
              Active Fundraisers
            </h2>
            
            {activeFundraisers.length > 0 ? (
              <div className="grid gap-4">
                {activeFundraisers.map(f => (
                  <Link 
                    key={f.id}
                    to={f.path} 
                    className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200 hover:shadow-md hover:border-red-200 transition-all group flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                  >
                    <div>
                      <h3 className="text-lg font-bold text-stone-900 group-hover:text-red-600 transition-colors">{f.title}</h3>
                      <p className="text-stone-500 text-sm mt-1">Pickup: {f.pickup}</p>
                    </div>
                    <div className="bg-red-50 text-red-600 px-5 py-2.5 rounded-xl font-bold text-sm group-hover:bg-red-600 group-hover:text-white transition-colors w-full sm:w-auto text-center">
                      Order Now
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="bg-white/50 border border-dashed border-stone-300 rounded-2xl p-10 text-center">
                <p className="text-stone-500 italic">There are currently no active fundraisers.</p>
              </div>
            )}
          </section>

          {/* Past Fundraisers */}
          {pastFundraisers.length > 0 && (
            <section>
              <h2 className="text-xl font-bold text-stone-800 mb-6 flex items-center">
                <History size={20} className="mr-2 text-stone-400" />
                Past Fundraisers
              </h2>
              <div className="grid gap-4">
                {pastFundraisers.map(f => (
                  <Link 
                    key={f.id}
                    to={f.path} 
                    className="bg-stone-50 p-6 rounded-2xl border border-stone-200 hover:bg-white hover:border-stone-300 transition-all group flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 opacity-75 hover:opacity-100"
                  >
                    <div>
                      <h3 className="text-lg font-bold text-stone-600 group-hover:text-stone-800 transition-colors">{f.title}</h3>
                      <p className="text-stone-400 text-sm mt-1">Completed: {f.pickup.split('@')[0]}</p>
                    </div>
                    <div className="bg-stone-200 text-stone-500 px-5 py-2.5 rounded-xl font-bold text-sm w-full sm:w-auto text-center">
                      Closed
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
