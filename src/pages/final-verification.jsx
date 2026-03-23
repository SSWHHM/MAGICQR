import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { createBusiness, createService } from '../lib/db';

/**
 * 🧪 FINAL MISSION VERIFICATION
 * Tests: Auth -> Business -> Service -> Logo Storage
 */
export default function FinalVerification() {
    const [status, setStatus] = useState('Ready to launch...');
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(false);

    const log = (msg) => setLogs(prev => [...prev, `${new Date().toLocaleTimeString()} - ${msg}`]);

    const runFinalTest = async () => {
        setLoading(true);
        setLogs([]);
        setStatus('🚀 Launch sequence initiated...');
        try {
            // 1. Auth Check
            log("🔍 Checking Session...");
            const { data: { user }, error: authErr } = await supabase.auth.getUser();
            if (authErr) throw new Error("Session Invalid: " + authErr.message);
            log(`✅ Authenticated: ${user.email}`);

            // 2. Business Check (RLS Nuke check)
            log("🏢 Creating Business...");
            const business = await createBusiness({ name: "FINAL TEST BIZ", slug: `final-test-${Date.now()}` });
            log(`✅ Business ID: ${business.id}`);

            // 3. Service Check (RLS check)
            log("🛎️ Creating Service...");
            const service = await createService(business.id, { name: "LAUNCH SERVICE", description: "All systems go" });
            log(`✅ Service ID: ${service.id}`);

            // 4. Storage Check (Bucket check)
            log("📷 testing Logo Upload...");
            const testBlob = new Blob(["test"], { type: "text/plain" });
            const testFile = new File([testBlob], `test-${Date.now()}.txt`);
            const { error: upErr } = await supabase.storage.from('logos').upload(`test/${testFile.name}`, testFile);
            
            if (upErr) {
                if (upErr.message.includes('bucket_id')) {
                    log("❌ STORAGE ERROR: Bucket 'logos' does not exist or RLS blocked.");
                } else {
                    log(`❌ STORAGE ERROR: ${upErr.message}`);
                }
                throw upErr;
            }
            log("✅ Storage Upload Successful!");

            setStatus('✨ ALL SYSTEMS GO. MAGIC QR IS LIVE! 🚀');
        } catch (err) {
            console.error(err);
            log(`❌ CRITICAL FAILURE: ${err.message}`);
            setStatus('❌ MISSION ABORTED. Fix the error in logs.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '3rem', background: '#0d0c1e', minHeight: '100vh', color: 'white', fontFamily: 'monospace' }}>
            <h1 style={{ color: '#7c3aed', marginBottom: '1.5rem' }}>MAGIC QR MISSION CONTROL</h1>
            <button 
                onClick={runFinalTest} 
                disabled={loading}
                style={{ padding: '1.2rem 2.5rem', background: '#7c3aed', border: 'none', borderRadius: '1rem', color: 'white', fontWeight: '800', cursor: 'pointer', transition: 'transform 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            >
                {loading ? 'Executing...' : '🚀 START FINAL VERIFICATION'}
            </button>
            <div style={{ marginTop: '2rem', fontSize: '1.5rem', fontWeight: 'bold', color: status.includes('LIVE') ? '#4ade80' : status.includes('FAILED') ? '#fb7185' : 'white' }}>
                {status}
            </div>
            <div style={{ marginTop: '2rem', background: '#1a1a2e', padding: '1.5rem', borderRadius: '1.25rem', border: '1px solid #333' }}>
                <h3 style={{ marginBottom: '1rem', color: '#888' }}>Real-time Audit Logs:</h3>
                {logs.map((l, i) => (
                    <div key={i} style={{ marginBottom: '0.4rem', color: l.includes('❌') ? '#fb7185' : l.includes('✅') ? '#4ade80' : '#888' }}>
                        {l}
                    </div>
                ))}
            </div>
        </div>
    );
}
