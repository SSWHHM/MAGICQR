import React from 'react';
import Navbar from '../components/landing/Navbar';
import Hero from '../components/landing/Hero';
import StatsBar from '../components/landing/StatsBar';
import Comparison from '../components/landing/Comparison';
import HowItWorks from '../components/landing/HowItWorks';
import Features from '../components/landing/Features';
import Testimonials from '../components/landing/Testimonials';
import Pricing from '../components/landing/Pricing';
import FAQ from '../components/landing/FAQ';
import Footer from '../components/landing/Footer';

export default function Landing() {
    return (
        <div className="bg-bg text-white min-h-screen font-sans selection:bg-primary/30">
            <Navbar />
            <main>
                <Hero />
                <StatsBar />
                <Comparison />
                <div className="relative">
                    {/* Subtle Enterprise Decorative Blur */}
                    <div className="absolute top-1/4 -left-20 w-96 h-96 bg-primary/5 blur-[150px] rounded-full -z-10 animate-pulse" />
                    
                    <HowItWorks />
                    <Features />
                    <Testimonials />
                    <Pricing />
                    <FAQ />
                </div>
            </main>
            <Footer />
        </div>
    );
}
