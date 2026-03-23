import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { createBusiness, createService } from '../lib/db';

/**
 * 🧪 End-to-End Onboard Verification Script
 * This component tests the exact chain of calls:
 * Auth -> Create Business -> Create Service
 * to uncover why RLS violation occurs.
 */
export default function TestOnboardComplete() {
    const [status, setStatus] = useState('Ready to test...');
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(false);

    const log = (msg) => setLogs(prev => [...prev, `${new Date().toLocaleTimeString()} - ${msg}`]);

    const runTest = async () => {
        setLoading(true);
        setLogs([]);
        setStatus('Testing...');
        try {
            // 1. Check Auth
            log("🔍 Step 1: Checking Auth...");
            const { data: { user }, error: authErr } = await supabase.auth.getUser();
            if (authErr) throw new Error("Auth Failed: " + authErr.message);
            log(`✅ Authenticated as: ${user.email} (${user.id})`);

            // 2. Create Business
            log("🏢 Step 2: Creating Test Business...");
            const bizData = {
                name: "RLS TEST BIZ",
                slug: `rls-test-${Date.now()}`,
                category: "test"
            };
            const business = await createBusiness(bizData);
            log(`✅ Business Created: ID=${business.id}, Name=${business.name}`);

            // 3. Create Service (The problematic part)
            log("🛎️ Step 3: Creating Test Service...");
            const svcData = {
                name: "RLS TEST SERVICE",
                description: "Verifying policy stability"
            };
            const service = await createService(business.id, svcData);
            log(`✅ Service Created: ID=${service.id}`);

            setStatus('🎉 TEST SUCCESSFUL! Your RLS policies are working.');
        } catch (err) {
            console.error(err);
            log(`❌ FAILED: ${err.message}`);
            setStatus('❌ TEST FAILED. Check logs below.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '3rem', background: '#0a0a0a', minHeight: '100vh', color: 'white', fontFamily: 'monospace' }}>
            <h1 style={{ marginBottom: '1.5rem' }}>RLS Verification Dashboard</h1>
            <button 
                onClick={runTest} 
                disabled={loading}
                style={{ padding: '1rem 2rem', background: '#7c3aed', color: 'white', border: 'none', borderRadius: '1rem', cursor: 'pointer', fontWeight: 'bold' }}
            >
                {loading ? 'Testing...' : '🚀 Start End-to-End Test'}
            </button>
            
            <div style={{ marginTop: '2rem', fontSize: '1.2rem', color: status.includes('FAILED') ? '#fb7185' : '#4ade80' }}>
                {status}
            </div>

            <div style={{ marginTop: '2rem', padding: '1.5rem', background: '#111', borderRadius: '1rem', border: '1px solid #333' }}>
                <h3 style={{ marginBottom: '1rem' }}>Audit Logs:</h3>
                {logs.map((l, i) => <div key={i} style={{ marginBottom: '0.4rem', color: l.includes('❌') ? '#fb7185' : '#94a3b8' }}>{l}</div>)}
                {logs.length === 0 && <div style={{ color: '#444' }}>Waiting for test run...</div>}
            </div>
        </div>
    );
}
