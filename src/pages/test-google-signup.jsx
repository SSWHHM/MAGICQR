import React from 'react';
import { supabase } from '../lib/supabase';
import { FcGoogle } from 'react-icons/fc';

/**
 * 🧪 Test Google Signup Component
 * This is a minimal component to verify that your Supabase 
 * Google Provider is correctly configured with your new credentials.
 */
export default function TestGoogleSignup() {
    const handleGoogleSignup = async () => {
        console.log("🚀 Testing Google Auth Flow...");
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                // Ensure this matches your "Authorized redirect URIs" in Google Console
                redirectTo: `${window.location.origin}/onboard`
            }
        });
        
        if (error) {
            console.error("❌ Google Auth Error:", error.message);
            alert("Google Auth Error: " + error.message);
        } else {
            console.log("✅ OAuth flow initiated successfully.");
        }
    };

    return (
        <div style={{ padding: '4rem', textAlign: 'center', background: '#0a0a0a', minHeight: '100vh', color: 'white' }}>
            <h1 style={{ marginBottom: '2rem' }}>Google Auth Tester</h1>
            <button 
                onClick={handleGoogleSignup}
                style={{
                    padding: '1rem 2rem', fontSize: '1.2rem', fontWeight: 'bold',
                    background: 'white', color: '#0f172a', borderRadius: '1rem',
                    border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '0 auto'
                }}
            >
                <FcGoogle size={28} /> Test Continue with Google
            </button>
            <p style={{ marginTop: '2rem', color: 'rgba(255,255,255,0.4)' }}>
                Check the browser console (F12) for logs.
            </p>
        </div>
    );
}
