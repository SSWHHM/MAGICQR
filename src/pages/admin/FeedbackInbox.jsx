import { useState, useEffect } from 'react';
import { getFeedback, resolveFeedback } from '../../lib/db';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

const STAR = { 1: '😡', 2: '😞', 3: '😐', 4: '😊', 5: '🤩' };

export default function FeedbackInbox() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('unresolved');

    // Load all businesses for this user, then all feedback
    useEffect(() => {
        loadFeedback();
    }, []);

    async function loadFeedback() {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        const { data: bizList } = await supabase.from('businesses').select('id').eq('owner_id', user.id);
        if (!bizList?.length) { setLoading(false); return; }

        const allFeedback = [];
        for (const biz of bizList) {
            const fb = await getFeedback(biz.id);
            allFeedback.push(...fb);
        }
        allFeedback.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        setItems(allFeedback);
        setLoading(false);
    }

    async function handleResolve(feedbackId) {
        await resolveFeedback(feedbackId);
        setItems((prev) => prev.map((f) => f.id === feedbackId ? { ...f, is_resolved: true } : f));
    }

    const filtered = items.filter((f) =>
        filter === 'all' ? true : filter === 'unresolved' ? !f.is_resolved : f.is_resolved
    );

    const unresolved = items.filter((f) => !f.is_resolved).length;

    if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}><div className="spinner" /></div>;

    return (
        <div className="fade-in">
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: '700', background: 'linear-gradient(135deg, var(--color-text), var(--color-primary-light))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                    📬 Feedback Inbox
                </h1>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                    Private customer feedback from 1–2 star ratings — intercepted before reaching Google Review
                </p>
                {unresolved > 0 && (
                    <span style={{ display: 'inline-block', marginTop: '0.5rem', padding: '0.2rem 0.6rem', borderRadius: '999px', background: 'rgba(225,112,85,0.2)', color: 'var(--color-error)', fontSize: '0.8rem', fontWeight: '600' }}>
                        {unresolved} unresolved
                    </span>
                )}
            </div>

            {/* Filter Tabs */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
                {[
                    { key: 'unresolved', label: `Unresolved (${unresolved})` },
                    { key: 'resolved', label: 'Resolved' },
                    { key: 'all', label: 'All' },
                ].map(({ key, label }) => (
                    <button key={key} onClick={() => setFilter(key)} style={{
                        padding: '0.5rem 1rem', borderRadius: '0.75rem',
                        border: '1px solid ' + (filter === key ? 'var(--color-primary)' : 'rgba(255,255,255,0.1)'),
                        background: filter === key ? 'rgba(108,92,231,0.15)' : 'rgba(255,255,255,0.03)',
                        color: filter === key ? 'var(--color-primary-light)' : 'var(--color-text-muted)',
                        cursor: 'pointer', fontSize: '0.85rem', fontWeight: '500',
                    }}>
                        {label}
                    </button>
                ))}
            </div>

            {/* Feedback List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {filtered.map((f) => (
                    <div key={f.id} className="glass-light" style={{ padding: '1.25rem', opacity: f.is_resolved ? 0.6 : 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                            <span style={{ fontSize: '1.5rem' }}>{STAR[f.rating] || '⭐'}</span>
                            <div>
                                <span style={{ fontWeight: '600', fontSize: '0.9rem' }}>
                                    {f.rating}-star feedback {f.services?.name ? `• ${f.services.name}` : ''}
                                </span>
                                <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.125rem' }}>
                                    {new Date(f.created_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                                </p>
                            </div>
                            <div style={{ marginLeft: 'auto' }}>
                                {f.is_resolved ? (
                                    <span style={{ fontSize: '0.75rem', color: '#4ade80', fontWeight: '600' }}>✅ Resolved</span>
                                ) : (
                                    <button
                                        onClick={() => handleResolve(f.id)}
                                        className="btn-secondary"
                                        style={{ width: 'auto', padding: '0.35rem 0.85rem', fontSize: '0.8rem', minHeight: 'auto' }}
                                    >
                                        Mark Resolved
                                    </button>
                                )}
                            </div>
                        </div>
                        {f.message && (
                            <p style={{ fontSize: '0.9rem', lineHeight: '1.6', color: 'var(--color-text)', background: 'rgba(255,255,255,0.03)', padding: '0.75rem 1rem', borderRadius: '0.75rem' }}>
                                "{f.message}"
                            </p>
                        )}
                    </div>
                ))}
                {filtered.length === 0 && (
                    <div style={{ padding: '3rem', textAlign: 'center' }}>
                        <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📭</div>
                        <p style={{ color: 'var(--color-text-muted)' }}>
                            {filter === 'unresolved' ? 'No unresolved feedback — all clear! 🎉' : 'No feedback found.'}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
