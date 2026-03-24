import React from 'react';
import { useNavigate } from 'react-router-dom';
import { landingData } from '../../data/landingData';

export default function Footer() {
    const { columns, copyright } = landingData.footer;
    const navigate = useNavigate();

    return (
        <footer className="pt-32 pb-12 px-6 border-t border-border bg-bg">
            <div className="max-w-6xl mx-auto">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12 mb-24">
                    <div className="col-span-2">
                        <div className="flex items-center gap-2 mb-8 cursor-pointer" onClick={() => navigate('/')}>
                            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center font-black text-white text-lg">
                                M
                            </div>
                            <span className="text-xl font-black text-white tracking-tight">
                                MAGIC QR
                            </span>
                        </div>
                        <p className="text-text-muted font-bold leading-relaxed max-w-xs">
                            India's most trusted QR review tool. Elevating business reputation one scan at a time.
                        </p>
                    </div>

                    {columns.map((col, i) => (
                        <div key={i}>
                            <h4 className="font-black text-white mb-8 uppercase tracking-widest text-[10px]">{col.title}</h4>
                            <ul className="space-y-4">
                                {col.links.map((link, j) => (
                                    <li key={j}>
                                        <a href="#" className="text-sm font-bold text-text-muted hover:text-white transition-colors">
                                            {link}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                    
                    <div>
                        <h4 className="font-black text-white mb-8 uppercase tracking-widest text-[10px]">Follow</h4>
                        <div className="flex gap-4 text-text-muted">
                            <a href="#" className="font-bold hover:text-white transition-colors">Twitter</a>
                            <a href="#" className="font-bold hover:text-white transition-colors">LinkedIn</a>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-12 border-t border-border text-[11px] font-bold text-text-muted uppercase tracking-[0.2em]">
                    <div>{copyright}</div>
                    <div className="flex gap-8">
                        <a href="#" className="hover:text-white transition-colors">Privacy</a>
                        <a href="#" className="hover:text-white transition-colors">Terms</a>
                        <a href="mailto:wildnutbeats@gmail.com" className="hover:text-white transition-colors lowercase tracking-normal text-sm font-normal underline decoration-primary/50">wildnutbeats@gmail.com</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
