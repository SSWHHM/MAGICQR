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
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
                scrolled ? 'bg-bg/80 backdrop-blur-xl border-b border-border py-4' : 'bg-transparent py-6'
            }`}
        >
            <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
                {/* Logo */}
                <div 
                    className="flex items-center gap-2 cursor-pointer" 
                    onClick={() => navigate('/')}
                >
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center font-black text-white text-lg shadow-lg shadow-primary/20">
                        {logo[0]}
                    </div>
                    <span className="text-xl font-extrabold tracking-tight text-white">
                        {logo}
                    </span>
                </div>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center gap-10">
                    {links.map((link) => (
                        <a 
                            key={link.name}
                            href={link.href}
                            onClick={(e) => { e.preventDefault(); scrollToSection(link.href); }}
                            className="text-sm font-bold text-text-muted hover:text-white transition-colors"
                        >
                            {link.name}
                        </a>
                    ))}
                </nav>

                {/* Desktop Actions */}
                <div className="hidden md:flex items-center gap-8">
                    <button 
                        onClick={() => navigate('/login')}
                        className="text-sm font-bold text-text-muted hover:text-white transition-colors"
                    >
                        {cta.login}
                    </button>
                    <button 
                        onClick={() => navigate('/signup')}
                        className="px-6 py-3 bg-primary hover:bg-primary-light text-white font-extrabold rounded-lg transition-all active:scale-95 text-sm shadow-xl shadow-primary/20"
                    >
                        {cta.trial}
                    </button>
                </div>

                {/* Mobile Menu Toggle */}
                <button 
                    className="md:hidden text-white"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                    {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="absolute top-full left-0 right-0 bg-surface border-b border-border p-6 md:hidden flex flex-col gap-6"
                    >
                        {links.map((link) => (
                            <a
                                key={link.name}
                                href={link.href}
                                onClick={(e) => { e.preventDefault(); scrollToSection(link.href); }}
                                className="text-xl font-bold text-white hover:text-primary transition-colors"
                            >
                                {link.name}
                            </a>
                        ))}
                        <div className="flex flex-col gap-4 pt-6 border-t border-border">
                            <button 
                                onClick={() => navigate('/login')}
                                className="w-full py-4 rounded-lg bg-border font-bold text-white"
                            >
                                {cta.login}
                            </button>
                            <button 
                                onClick={() => navigate('/signup')}
                                className="w-full py-4 rounded-lg bg-primary font-bold text-white"
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
