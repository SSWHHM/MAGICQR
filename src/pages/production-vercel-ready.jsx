import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { createBusiness, createService } from '../lib/db';

/**
 * 🚀 PRODUCTION-VERCEL-READY AUDIT
 * Final test before --prod launch.
 */
export default function ProductionVercelReady() {
    const [status, setStatus] = useState('Checking systems...');
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(false);

    const log = (msg) => setLogs(prev => [...prev, `${new Date().toLocaleTimeString()} - ${msg}`]);

    const runAudit = async () => {
        setLoading(true);
        setLogs([]);
        setStatus('🚀 Auditing...');
        try {
            // 1. Auth
            log("🔍 Verifying Project ID: ilxupjirtfxbvucvqpxm");
            const { data: { user }, error: authErr } = await supabase.auth.getUser();
            if (authErr) throw new Error("Auth Failed: " + authErr.message);
            log(`✅ Session OK: ${user.email}`);

            // 2. Insert Test (Minimal Select)
            log("🏢 Testing Business Insert (.select('id') mode)");
            const business = await createBusiness({ name: "PROD AUDIT", slug: `audit-${Date.now()}` });
            log(`✅ Business Inserted: ID=${business.id}`);

            // 3. Service Test
            log("🛎️ Testing Service Insert (Chain Check)");
            const service = await createService(business.id, { name: "AUDIT SERVICE" });
            log(`✅ Service Inserted: ID=${service.id}`);

            // 4. Logo Storage Test (Nuclear Fix check)
            log("📷 testing Storage Bucket 'logos'...");
            const blob = new Blob(["prod-test"], { type: "text/plain" });
            const file = new File([blob], `audit-${Date.now()}.txt`);
            const { error: upErr } = await supabase.storage.from('logos').upload(`audit/${file.name}`, file);
            if (upErr) throw new Error("Storage Error: " + upErr.message);
            log("✅ Storage Write OK!");

            setStatus('🎉 MISSION READY. Deploy to Vercel now! 🚀');
        } catch (err) {
            console.error(err);
            log(`❌ AUDIT FAILED: ${err.message}`);
            setStatus('❌ FIX REQUIRED. Check your SQL Editor.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '3rem', background: '#09090b', minHeight: '100vh', color: 'white', fontFamily: 'Inter, sans-serif' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '1.5rem', color: '#8b5cf6' }}>Production Readiness Audit</h1>
            
            <button 
                onClick={runAudit} 
                disabled={loading}
                style={{
                    padding: '1rem 2rem', background: '#8b5cf6', color: 'white', 
                    border: 'none', borderRadius: '0.75rem', fontWeight: 'bold', 
                    cursor: 'pointer', boxShadow: '0 10px 15px -3px rgba(139, 92, 246, 0.3)'
                }}
            >
                {loading ? 'Auditing...' : '🚀 RUN FINAL AUDIT'}
            </button>

            <div style={{ marginTop: '2rem', fontSize: '1.25rem', color: status.includes('READY') ? '#10b981' : (status.includes('FAILED') ? '#ef4444' : 'white') }}>
                {status}
            </div>

            <div style={{ marginTop: '2rem', background: '#18181b', padding: '1.5rem', borderRadius: '1rem', border: '1px solid #27272a' }}>
                <h3 style={{ marginBottom: '1rem', color: '#71717a' }}>Audit Details:</h3>
                {logs.map((l, i) => <div key={i} style={{ marginBottom: '0.4rem', color: l.includes('❌') ? '#ef4444' : (l.includes('✅') ? '#10b981' : '#a1a1aa') }}>{l}</div>)}
            </div>
        </div>
    );
}
