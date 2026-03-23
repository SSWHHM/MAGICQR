import React from 'react';
import { landingData } from '../../data/landingData';

export default function TrustStrip() {
    const { items } = landingData.trustStrip;
    
    // Triple items for infinite scroll effect
    const marqueeItems = [...items, ...items, ...items];

    return (
        <div className="w-full py-10 border-y border-white/5 relative bg-white/1 overflow-hidden">
            <div className="marquee-container">
                <div className="marquee-content items-center flex gap-16 md:gap-24">
                    {marqueeItems.map((item, i) => (
                        <div 
                            key={i} 
                            className="text-white/40 font-black text-sm md:text-lg uppercase tracking-[0.2em] flex items-center gap-4 whitespace-nowrap group hover:text-white/80 transition-colors"
                        >
                            <span className="w-2 h-2 rounded-full bg-primary group-hover:scale-125 transition-transform" />
                            {item}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
