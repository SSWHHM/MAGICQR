import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { landingData } from '../../data/landingData';

export default function Navbar() {
    const { logo, links, cta } = landingData.navbar;
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToSection = (id) => {
        setIsMenuOpen(false);
        const el = document.querySelector(id);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <header 
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
                scrolled ? 'py-4' : 'py-6'
            }`}
        >
            {/* Glassmorphism Background */}
            <div 
                className={`absolute inset-0 backdrop-blur-xl border-b border-white/5 transition-all duration-500 ${
                    scrolled ? 'bg-surface/80 opacity-100' : 'opacity-0'
                }`} 
            />
            
            <div className="max-w-7xl mx-auto px-6 relative flex items-center justify-between">
                {/* Logo */}
                <div 
                    className="flex items-center gap-2 cursor-pointer group" 
                    onClick={() => navigate('/')}
                >
                    <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center font-black text-white text-xl shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
                        {logo[0]}
                    </div>
                    <span className="text-xl font-black bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                        {logo}
                    </span>
                </div>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center gap-8">
                    {links.map((link) => (
                        <a 
                            key={link.name}
                            href={link.href}
                            onClick={(e) => { e.preventDefault(); scrollToSection(link.href); }}
                            className="text-sm font-semibold text-white/60 hover:text-white transition-colors relative group"
                        >
                            {link.name}
                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300" />
                        </a>
                    ))}
                </nav>

                {/* Desktop Actions */}
                <div className="hidden md:flex items-center gap-6">
                    <button 
                        onClick={() => navigate('/login')}
                        className="text-sm font-bold text-white/80 hover:text-white transition-colors"
                    >
                        {cta.login}
                    </button>
                    <button 
                        onClick={() => navigate('/signup')}
                        className="px-6 py-3 bg-gradient-to-r from-primary to-secondary hover:shadow-[0_0_20px_rgba(124,58,237,0.4)] text-white font-bold rounded-xl transition-all active:scale-95 text-sm"
                    >
                        {cta.trial}
                    </button>
                </div>

                {/* Mobile Menu Toggle */}
                <button 
                    className="md:hidden text-white p-2 hover:bg-white/5 rounded-lg transition-colors"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                    {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: '100vh' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="fixed inset-0 z-40 bg-surface/95 backdrop-blur-2xl md:hidden overflow-hidden flex flex-col pt-24 px-6"
                    >
                        <div className="flex flex-col gap-8">
                            {links.map((link, i) => (
                                <motion.a
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    key={link.name}
                                    href={link.href}
                                    onClick={(e) => { e.preventDefault(); scrollToSection(link.href); }}
                                    className="text-3xl font-black text-white hover:text-primary transition-colors"
                                >
                                    {link.name}
                                </motion.a>
                            ))}
                        </div>
                        
                        <div className="mt-auto mb-12 flex flex-col gap-4">
                            <button 
                                onClick={() => navigate('/login')}
                                className="w-full py-4 rounded-2xl bg-white/5 font-bold text-xl text-white border border-white/10"
                            >
                                {cta.login}
                            </button>
                            <button 
                                onClick={() => navigate('/signup')}
                                className="w-full py-4 rounded-2xl bg-gradient-to-r from-primary to-secondary font-bold text-xl text-white shadow-xl shadow-primary/20"
                            >
                                {cta.trial}
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
}
