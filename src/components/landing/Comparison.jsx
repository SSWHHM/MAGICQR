import React from 'react';
import { motion } from 'framer-motion';
import { XCircle, CheckCircle2, AlertTriangle } from 'lucide-react';
import { landingData } from '../../data/landingData';

export default function Comparison() {
    const { title, subtitle, otherApps, magicQR } = landingData.comparison;

    return (
        <section id="comparison" className="py-32 px-6 max-w-6xl mx-auto">
            <div className="text-center mb-20">
                <motion.h2 
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="text-4xl md:text-6xl font-black mb-6 tracking-tight max-w-3xl mx-auto"
                >
                    {title}
                </motion.h2>
                <motion.p 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-2xl font-black text-primary"
                >
                    {subtitle}
                </motion.p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 relative">
                {/* VS Badge */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-bg border border-border rounded-full hidden md:flex items-center justify-center font-black text-xl z-10 text-text-muted">
                    VS
                </div>

                {/* Other Apps */}
                <motion.div 
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="p-10 rounded-2xl bg-danger/5 border border-danger/20 relative overflow-hidden group"
                >
                    <div className="absolute top-0 right-0 p-4">
                        <AlertTriangle className="text-danger opacity-20 group-hover:opacity-100 transition-opacity" size={40} />
                    </div>
                    
                    <h3 className="text-2xl font-black text-danger mb-8 uppercase tracking-widest">{otherApps.title}</h3>
                    <ul className="space-y-6">
                        {otherApps.warnings.map((warning, i) => (
                            <li key={i} className="flex items-start gap-4 text-text-muted font-bold leading-tight">
                                <XCircle className="text-danger shrink-0" size={20} />
                                {warning}
                            </li>
                        ))}
                    </ul>
                </motion.div>

                {/* MagicQR */}
                <motion.div 
                    initial={{ opacity: 0, x: 30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="p-10 rounded-2xl bg-success/5 border border-success/30 relative overflow-hidden group shadow-[0_0_50px_rgba(34,197,94,0.1)]"
                >
                    <div className="absolute top-0 right-0 p-4">
                        <CheckCircle2 className="text-success opacity-20 group-hover:opacity-100 transition-opacity" size={40} />
                    </div>
                    
                    <div className="absolute inset-0 bg-linear-to-br from-success/5 to-transparent opacity-50 group-hover:opacity-100 transition-opacity" />
                    
                    <div className="relative z-10">
                        <h3 className="text-2xl font-black text-success mb-8 uppercase tracking-widest">{magicQR.title}</h3>
                        <ul className="space-y-6">
                            {magicQR.advantages.map((adv, i) => (
                                <li key={i} className="flex items-start gap-4 text-white font-black leading-tight">
                                    <CheckCircle2 className="text-success shrink-0" size={20} />
                                    {adv}
                                </li>
                            ))}
                        </ul>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
