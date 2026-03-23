import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
    ArrowRight, Zap, Target, BarChart3, ShieldCheck, 
    Star, Menu, X, ChevronDown, Play, MessageCircle 
} from 'lucide-react';
import PricingTable from '../components/PricingTable';

const NavLink = ({ href, children, onClick }) => (
    <a 
        href={href} 
        onClick={onClick}
        className="text-white/60 hover:text-white font-medium transition-colors"
    >
        {children}
    </a>
);

const FeatureCard = ({ icon: Icon, title, desc }) => (
    <motion.div 
        whileHover={{ y: -8, scale: 1.02 }}
        className="relative group p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl transition-all hover:bg-white/[0.07] hover:border-white/20"
    >
        <div className="w-12 h-12 rounded-2xl bg-[#00b894]/10 flex items-center justify-center mb-6 ring-1 ring-[#00b894]/20">
            <Icon size={24} className="text-[#00b894]" />
        </div>
        <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
        <p className="text-white/50 leading-relaxed">{desc}</p>
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-[#00b894]/0 to-[#00b894]/5 opacity-0 group-hover:opacity-100 transition-opacity" />
    </motion.div>
);

const FAQItem = ({ q, a }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="border-b border-white/10">
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="w-full py-6 flex items-center justify-between text-left group"
            >
                <span className="text-lg font-semibold text-white/90 group-hover:text-white transition-colors">{q}</span>
                <ChevronDown className={`text-[#00b894] transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <p className="pb-6 text-white/50 leading-relaxed">{a}</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default function Landing() {
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
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div className="bg-[#050505] text-white min-h-screen font-['Inter'] selection:bg-[#00b894]/30">
            {/* Header */}
            <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'py-4' : 'py-6'}`}>
                <div className={`absolute inset-0 backdrop-blur-xl border-b border-white/5 transition-opacity duration-300 ${scrolled ? 'opacity-100' : 'opacity-0'}`} />
                <div className="max-w-7xl mx-auto px-6 relative flex items-center justify-between">
                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
                        <div className="w-10 h-10 bg-gradient-to-br from-[#00b894] to-[#fab1a0] rounded-xl flex items-center justify-center font-black text-white text-xl">M</div>
                        <span className="text-xl font-black bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">MAGIC QR</span>
                    </div>

                    <nav className="hidden md:flex items-center gap-8">
                        <NavLink href="#features" onClick={(e) => { e.preventDefault(); scrollToSection('features'); }}>Features</NavLink>
                        <NavLink href="#how-it-works" onClick={(e) => { e.preventDefault(); scrollToSection('how-it-works'); }}>How It Works</NavLink>
                        <NavLink href="#pricing" onClick={(e) => { e.preventDefault(); scrollToSection('pricing'); }}>Pricing</NavLink>
                        <NavLink href="#faq" onClick={(e) => { e.preventDefault(); scrollToSection('faq'); }}>FAQ</NavLink>
                    </nav>

                    <div className="hidden md:flex items-center gap-4">
                        <button onClick={() => navigate('/login')} className="px-6 py-2.5 font-semibold text-white/80 hover:text-white transition-colors">Login</button>
                        <button 
                            onClick={() => navigate('/signup')} 
                            className="px-6 py-3 bg-[#00b894] hover:bg-[#00a884] text-white font-bold rounded-xl transition-all active:scale-95 shadow-lg shadow-[#00b894]/20"
                        >
                            Start Free Trial
                        </button>
                    </div>

                    <button className="md:hidden text-white" onClick={() => setIsMenuOpen(true)}>
                        <Menu size={24} />
                    </button>
                </div>
            </header>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="fixed inset-0 z-[60] bg-[#050505] p-6 flex flex-col pt-24"
                    >
                        <button className="absolute top-6 right-6 text-white" onClick={() => setIsMenuOpen(false)}>
                            <X size={32} />
                        </button>
                        <div className="flex flex-col gap-6 text-3xl font-bold">
                            <a href="#features" onClick={(e) => { e.preventDefault(); scrollToSection('features'); }}>Features</a>
                            <a href="#how-it-works" onClick={(e) => { e.preventDefault(); scrollToSection('how-it-works'); }}>How It Works</a>
                            <a href="#pricing" onClick={(e) => { e.preventDefault(); scrollToSection('pricing'); }}>Pricing</a>
                            <a href="#faq" onClick={(e) => { e.preventDefault(); scrollToSection('faq'); }}>FAQ</a>
                        </div>
                        <div className="mt-auto flex flex-col gap-4">
                            <button onClick={() => navigate('/login')} className="w-full py-4 rounded-2xl bg-white/5 font-bold text-xl">Login</button>
                            <button onClick={() => navigate('/signup')} className="w-full py-4 rounded-2xl bg-[#00b894] font-bold text-xl">Start Free Trial</button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <main className="pt-24">
                {/* Hero Section */}
                <section className="relative min-h-[90vh] flex flex-col items-center justify-center px-6 overflow-hidden pt-12">
                    <div className="absolute inset-0 -z-10 overflow-hidden">
                        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-[#00b894]/10 blur-[120px] rounded-full" />
                        <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[500px] bg-[#fab1a0]/5 blur-[100px] rounded-full" />
                    </div>

                    <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
                        <motion.div 
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                            className="text-center lg:text-left"
                        >
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-md">
                                <div className="flex gap-0.5">
                                    {[...Array(5)].map((_, i) => <Star key={i} size={14} className="fill-yellow-500 text-yellow-500" />)}
                                </div>
                                <span className="text-xs font-bold text-white/80 uppercase tracking-widest">Trusted by 500+ Mumbai Businesses</span>
                            </div>

                            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black leading-[0.9] tracking-tighter mb-8 bg-gradient-to-br from-white to-white/40 bg-clip-text text-transparent">
                                Instant 5★ Google Reviews via QR Scan
                            </h1>
                            
                            <p className="text-xl md:text-2xl text-white/40 mb-10 leading-relaxed max-w-xl mx-auto lg:mx-0">
                                Print QR once. Customers scan. You rank higher on Google. No tech skills needed. Works from Day 1.
                            </p>

                            <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                                <button 
                                    onClick={() => navigate('/signup')}
                                    className="px-10 py-5 bg-[#00b894] hover:bg-[#00a884] text-white font-black text-lg rounded-2xl shadow-2xl shadow-[#00b894]/20 transition-all active:scale-95 flex items-center gap-3"
                                >
                                    Start Free Trial <ArrowRight size={24} />
                                </button>
                                <button 
                                    onClick={() => scrollToSection('how-it-works')}
                                    className="px-10 py-5 bg-white/5 hover:bg-white/10 text-white font-bold text-lg rounded-2xl border border-white/10 backdrop-blur-md transition-all flex items-center gap-3"
                                >
                                    <Play size={20} fill="white" /> See How It Works
                                </button>
                            </div>
                        </motion.div>

                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9, y: 30 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            transition={{ duration: 1, delay: 0.2 }}
                            className="relative"
                        >
                            <div className="relative w-full aspect-[4/3] bg-white/5 rounded-[3rem] border border-white/10 p-4 backdrop-blur-3xl overflow-hidden shadow-2xl">
                                <div className="absolute inset-0 bg-gradient-to-br from-[#00b894]/10 to-transparent" />
                                <div className="relative h-full w-full rounded-[2.5rem] overflow-hidden border border-white/10 bg-[#0a0a0a]">
                                    {/* Mockup Content */}
                                    <div className="p-8 h-full flex flex-col">
                                        <div className="flex justify-between items-center mb-8">
                                            <div className="w-12 h-12 bg-white/10 rounded-xl" />
                                            <div className="flex gap-2">
                                                <div className="w-8 h-8 bg-white/5 rounded-full" />
                                                <div className="w-8 h-8 bg-white/5 rounded-full" />
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="h-8 w-3/4 bg-white/10 rounded-lg animate-pulse" />
                                            <div className="h-4 w-1/2 bg-white/5 rounded-lg animate-pulse" />
                                            <div className="pt-8 flex justify-center">
                                                <div className="w-48 h-48 bg-white p-4 rounded-3xl shadow-2xl">
                                                  <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=MAGIC-QR-DEMO" alt="QR Demo" className="w-full h-full" />
                                                </div>
                                            </div>
                                            <div className="pt-8 text-center">
                                                <div className="inline-flex gap-1">
                                                    {[...Array(5)].map((_, i) => <Star key={i} size={24} className="fill-[#00b894] text-[#00b894] animate-bounce" style={{ animationDelay: `${i * 100}ms` }} />)}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Floating elements */}
                            <div className="absolute -top-6 -right-6 p-4 rounded-2xl bg-[#00b894] text-white font-bold shadow-2xl rotate-12">+47 reviews this week</div>
                            <div className="absolute -bottom-6 -left-6 p-4 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 text-white font-bold shadow-2xl -rotate-6">Verified by Google</div>
                        </motion.div>
                    </div>

                    {/* Trust Strip Marquee */}
                    <div className="w-full mt-24 py-12 border-y border-white/5 relative bg-white/[0.02]">
                        <div className="marquee-container">
                            <div className="marquee-content items-center">
                                {[...Array(3)].map((_, i) => (
                                    <React.Fragment key={i}>
                                        <span className="text-white/40 font-bold text-xl uppercase tracking-widest flex items-center gap-3">
                                            <span className="text-[#00b894] text-2xl">⭐</span> 500+ businesses
                                        </span>
                                        <span className="text-white/40 font-bold text-xl uppercase tracking-widest flex items-center gap-3">
                                            <span className="text-[#00b894] text-2xl">📍</span> Mumbai · Pune · Delhi
                                        </span>
                                        <span className="text-white/40 font-bold text-xl uppercase tracking-widest flex items-center gap-3">
                                            <span className="text-[#00b894] text-2xl">⚡</span> Setup in 2 mins
                                        </span>
                                        <span className="text-white/40 font-bold text-xl uppercase tracking-widest flex items-center gap-3">
                                            <span className="text-[#00b894] text-2xl">🔒</span> No credit card
                                        </span>
                                        <span className="text-white/40 font-bold text-xl uppercase tracking-widest flex items-center gap-3">
                                            <span className="text-[#00b894] text-2xl">📈</span> Avg +47 reviews/month
                                        </span>
                                    </React.Fragment>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* How It Works */}
                <section id="how-it-works" className="py-32 px-6 max-w-7xl mx-auto">
                    <div className="text-center mb-24">
                        <h2 className="text-4xl md:text-6xl font-black mb-6">How It Works</h2>
                        <p className="text-xl text-white/50">Start growing your reputation in 3 simple steps.</p>
                    </div>

                    <div className="relative grid md:grid-cols-3 gap-12">
                        <div className="dashed-line" />
                        
                        {[
                            { step: 1, title: 'Print your QR', desc: 'Generate and print your branded QR in 60 seconds.', icon: '🖨️' },
                            { step: 2, title: 'Customer scans', desc: 'Customers scan the QR at table or checkout.', icon: '📱' },
                            { step: 3, title: 'Get 5★ Reviews', desc: 'You get Google reviews automatically. Every day.', icon: '⭐' }
                        ].map((s) => (
                            <div key={s.step} className="relative z-10 flex flex-col items-center text-center">
                                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#00b894] to-[#00b894]/20 p-px mb-8">
                                    <div className="w-full h-full rounded-full bg-[#0a0a0a] flex items-center justify-center text-5xl">
                                        {s.icon}
                                    </div>
                                </div>
                                <div className="absolute top-0 right-1/4 translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-[#00b894] text-white flex items-center justify-center font-black text-xl border-4 border-[#0a0a0a]">
                                    {s.step}
                                </div>
                                <h3 className="text-2xl font-bold mb-4">{s.title}</h3>
                                <p className="text-white/50 leading-relaxed max-w-[250px]">{s.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Features Section */}
                <section id="features" className="py-32 px-6 max-w-7xl mx-auto">
                    <div className="text-center mb-24">
                        <h2 className="text-4xl md:text-6xl font-black mb-6">Built for local businesses</h2>
                        <p className="text-xl text-white/50">Everything you need to rank #1 in your local city.</p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <FeatureCard icon={Zap} title="QR Generator" desc="Instant high-res QR codes for your storefront or receipts. Branded with your logo." />
                        <FeatureCard icon={Target} title="Service Reviews" desc="Direct customers to specific services for targeted 5★ feedback. Perfect for multi-service shops." />
                        <FeatureCard icon={BarChart3} title="Ranking Boost" desc="More positive volume signals to Google that you're the best business in town." />
                        <FeatureCard icon={ShieldCheck} title="Smart Dashboard" desc="Manage all your locations and view scan metrics in real-time. No technical skills required." />
                        <FeatureCard icon={MessageCircle} title="WhatsApp Share" desc="Send your QR directly to customers via WhatsApp and boost reviews from your chat history." />
                        <div className="relative group p-8 rounded-3xl bg-gradient-to-br from-[#00b894] to-[#fab1a0] p-[1px]">
                            <div className="h-full w-full bg-[#0a0a0a] rounded-3xl p-8 flex flex-col justify-center">
                                <h3 className="text-2xl font-black mb-4 bg-gradient-to-r from-[#00b894] to-[#fab1a0] bg-clip-text text-transparent">Scale your empire</h3>
                                <p className="text-white/50 mb-6">Join 500+ local businesses in Mumbai already growing with MAGIC QR.</p>
                                <button onClick={() => navigate('/signup')} className="text-[#00b894] font-bold flex items-center gap-2 group-hover:gap-4 transition-all">
                                    Get Started <ArrowRight size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Pricing */}
                <PricingTable />

                {/* Testimonials */}
                <section className="py-32 px-6 max-w-7xl mx-auto">
                    <div className="text-center mb-24">
                        <h2 className="text-4xl md:text-6xl font-black mb-6">Wall of Love</h2>
                        <p className="text-xl text-white/50">Join the business owners who ditched flyers for MAGIC QR.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { name: 'Ramesh', biz: 'Satguru Prints', role: 'Owner', txt: 'Game changer for my print shop. We used to struggle to get reviews, now they come in every day automatically.', initial: 'R', color: '#00b894' },
                            { name: 'Priya', biz: 'Glow Salon', role: 'Owner', txt: 'Setup took literally 5 minutes. Within a week, my Google reviews doubled. Best investment of 2026.', initial: 'P', color: '#fab1a0' },
                            { name: 'Ahmed', biz: 'Coastal Cafe', role: 'Owner', txt: 'We rank #1 for "best cafe in Andheri" now thanks to the review volume from MAGIC QR scans.', initial: 'A', color: '#A29BFE' }
                        ].map((t, i) => (
                            <div key={i} className="p-8 rounded-[2rem] bg-white/5 border border-white/10 flex flex-col items-start hover:border-white/20 transition-all">
                                <div className="flex gap-0.5 mb-6">
                                    {[...Array(5)].map((_, i) => <Star key={i} size={16} className="fill-yellow-500 text-yellow-500" />)}
                                </div>
                                <p className="text-xl font-medium text-white/80 mb-8 italic">"{t.txt}"</p>
                                <div className="flex items-center gap-4 mt-auto">
                                    <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg" style={{ background: t.color }}>{t.initial}</div>
                                    <div>
                                        <div className="font-bold">{t.name}</div>
                                        <div className="text-xs text-white/40 uppercase tracking-widest">{t.biz} · {t.role}</div>
                                    </div>
                                    <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="Google" className="w-5 h-5 ml-auto opacity-50" />
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* FAQ */}
                <section id="faq" className="py-32 px-6 max-w-3xl mx-auto">
                    <div className="text-center mb-24">
                        <h2 className="text-4xl md:text-6xl font-black mb-6">Questions?</h2>
                        <p className="text-xl text-white/50">Everything you need to know about the platform.</p>
                    </div>

                    <div className="space-y-4">
                        <FAQItem 
                            q="Does it work with any Google Business profile?" 
                            a="Yes! As long as you have a verified Google Business listing, MAGIC QR can direct customers straight to your review popup." 
                        />
                        <FAQItem 
                            q="Will customers actually scan it?" 
                            a="Absolutely. We recommend placing standard QR tents on tables or near checkout. In our experience, customers are 70% more likely to review when scanning than being asked verbally." 
                        />
                        <FAQItem 
                            q="What happens after the free trial?" 
                            a="You can upgrade to any of our paid plans to keep your QR active. If you don't upgrade, your QR will simply redirect to a landing page until you're ready." 
                        />
                        <FAQItem 
                            q="Can I use it for multiple locations?" 
                            a="Yes, the Growth and Pro plans allow for unlimited and multi-location management from a single master dashboard." 
                        />
                        <FAQItem 
                            q="Is the QR code permanent?" 
                            a="It is! Print your QR once. You can change the destination, the business info, or even the logo inside the QR without ever needing to reprint the physical asset." 
                        />
                    </div>
                </section>

                {/* Final CTA Banner */}
                <section className="px-6 py-24">
                    <div className="max-w-6xl mx-auto rounded-[3rem] bg-gradient-to-br from-[#00b894] to-[#fab1a0]/20 p-px relative overflow-hidden group">
                        <div className="absolute inset-0 bg-[#0a0a0a] rounded-[3rem] -z-10" />
                        <div className="absolute inset-0 bg-gradient-to-br from-[#00b894]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                        
                        <div className="p-12 md:p-24 text-center">
                            <h2 className="text-4xl md:text-7xl font-black mb-8 leading-tight">Ready to rank #1 in your city?</h2>
                            <p className="text-xl md:text-2xl text-white/50 mb-12 max-w-2xl mx-auto italic">Join 500+ local businesses already growing with MAGIC QR. No credit card required.</p>
                            
                            <button 
                                onClick={() => navigate('/signup')}
                                className="px-12 py-6 bg-[#00b894] hover:bg-[#00a884] text-white font-black text-2xl rounded-2xl shadow-2xl transition-all active:scale-95 translate-y-0 hover:-translate-y-1"
                            >
                                Start Your Free Trial →
                            </button>
                            <p className="mt-6 text-white/30 font-medium tracking-wide font-mono">CANCEL ANYTIME. 14 DAYS ON US.</p>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="pt-24 pb-12 px-6 border-t border-white/5 bg-white/[0.01]">
                    <div className="max-w-7xl mx-auto">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-24">
                            <div className="col-span-2 md:col-span-1">
                                <div className="flex items-center gap-2 mb-6">
                                    <div className="w-8 h-8 bg-[#00b894] rounded-lg flex items-center justify-center font-black text-white">M</div>
                                    <span className="text-xl font-black">MAGIC QR</span>
                                </div>
                                <p className="text-white/40 leading-relaxed max-w-[200px]">India's #1 QR review tool for local businesses. Setup in 2 mins.</p>
                            </div>

                            <div>
                                <h4 className="font-bold mb-6">Products</h4>
                                <ul className="space-y-4 text-white/40 font-medium">
                                    <li><a href="#" className="hover:text-[#00b894] transition-colors">QR Generator</a></li>
                                    <li><a href="#" className="hover:text-[#00b894] transition-colors">Service Reviews</a></li>
                                    <li><a href="#pricing" className="hover:text-[#00b894] transition-colors">Pricing</a></li>
                                </ul>
                            </div>

                            <div>
                                <h4 className="font-bold mb-6">Company</h4>
                                <ul className="space-y-4 text-white/40 font-medium">
                                    <li><a href="#" className="hover:text-[#00b894] transition-colors">About Us</a></li>
                                    <li><a href="#" className="hover:text-[#00b894] transition-colors">Blog</a></li>
                                    <li><a href="#" className="hover:text-[#00b894] transition-colors">Contact Us</a></li>
                                </ul>
                            </div>

                            <div>
                                <h4 className="font-bold mb-6">Legal</h4>
                                <ul className="space-y-4 text-white/40 font-medium">
                                    <li><a href="#" className="hover:text-[#00b894] transition-colors">Privacy Policy</a></li>
                                    <li><a href="#" className="hover:text-[#00b894] transition-colors">Terms of Service</a></li>
                                    <li><a href="mailto:wildnutbeats@gmail.com" className="hover:text-[#00b894] transition-colors">wildnutbeats@gmail.com</a></li>
                                </ul>
                            </div>
                        </div>

                        <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-12 border-t border-white/5 text-sm text-white/30 font-medium uppercase tracking-widest">
                            <div>© 2026 MAGIC QR by Harry Singh IT Services. All rights reserved.</div>
                            <div className="flex items-center gap-2">Made with ❤️ in Mumbai 🇮🇳</div>
                        </div>
                    </div>
                </footer>
            </main>
        </div>
    );
}
