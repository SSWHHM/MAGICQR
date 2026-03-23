import React from 'react';
import Navbar from '../components/landing/Navbar';
import Hero from '../components/landing/Hero';
import TrustStrip from '../components/landing/TrustStrip';
import HowItWorks from '../components/landing/HowItWorks';
import Features from '../components/landing/Features';
import Pricing from '../components/landing/Pricing';
import FAQ from '../components/landing/FAQ';
import Footer from '../components/landing/Footer';

export default function Landing() {
    return (
        <div className="bg-bg text-white min-h-screen selection:bg-primary/30">
            <Navbar />
            <main>
                <Hero />
                <TrustStrip />
                <div className="relative">
                    {/* Background Decorative Blur */}
                    <div className="absolute top-1/4 -left-20 w-96 h-96 bg-primary/10 blur-[150px] rounded-full -z-10 animate-pulse" />
                    <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-secondary/10 blur-[150px] rounded-full -z-10 animate-pulse" />
                    
                    <HowItWorks />
                    <Features />
                    <Pricing />
                    <FAQ />
                </div>
                <Footer />
            </main>
        </div>
    );
}
