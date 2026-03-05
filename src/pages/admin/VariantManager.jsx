import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
    getBusiness,
    getAllVariantsAdmin,
    createVariant,
    createVariantsBatch,
    updateVariant,
    deleteVariant,
} from '../../lib/firestore';
import { generateVariants } from '../../lib/gemini';

export default function VariantManager() {
    const { id: businessId, serviceId } = useParams();
    const [business, setBusiness] = useState(null);
    const [variants, setVariants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newText, setNewText] = useState('');
    const [adding, setAdding] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [editText, setEditText] = useState('');
    const [generating, setGenerating] = useState(false);
    const [genCount, setGenCount] = useState(200);
    const [genServiceName, setGenServiceName] = useState('');
    const [toast, setToast] = useState(null);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        loadData();
    }, [businessId, serviceId]);

    async function loadData() {
        setLoading(true);
        const [biz, vars] = await Promise.all([
            getBusiness(businessId),
            getAllVariantsAdmin(businessId, serviceId),
        ]);
        setBusiness(biz);
        setVariants(vars);
        setLoading(false);
    }

    async function handleAdd(e) {
        e.preventDefault();
        if (!newText.trim()) return;
        setAdding(true);
        await createVariant(businessId, serviceId, newText.trim());
        setNewText('');
        await loadData();
        setAdding(false);
        showToast('✅ Variant added');
    }

    async function handleEditSave(variantId) {
        if (!editText.trim()) return;
        await updateVariant(businessId, serviceId, variantId, { text: editText.trim() });
        setEditingId(null);
        await loadData();
        showToast('✅ Variant updated');
    }

    async function handleDelete(variantId) {
        if (!confirm('Delete this variant?')) return;
        await deleteVariant(businessId, serviceId, variantId);
        await loadData();
        showToast('🗑️ Variant deleted');
    }

    async function handleReactivate(variantId) {
        await updateVariant(businessId, serviceId, variantId, {
            status: 'active',
            usedAt: null,
            deprioritizedUntil: null,
        });
        await loadData();
        showToast('✅ Variant reactivated');
    }

    async function handleGenerate() {
        if (!genServiceName.trim()) {
            showToast('⚠️ Enter a service name for generation');
            return;
        }
        setGenerating(true);
        try {
            const texts = await generateVariants(genServiceName.trim(), genCount);
            await createVariantsBatch(businessId, serviceId, texts);
            await loadData();
            showToast(`✅ Generated ${texts.length} variants!`);
        } catch (err) {
            showToast(`❌ Error: ${err.message}`);
            console.error(err);
        }
        setGenerating(false);
    }

    function showToast(message) {
        setToast(message);
        setTimeout(() => setToast(null), 3000);
    }

    const filteredVariants = variants.filter((v) => {
        if (filter === 'active') return v.status === 'active';
        if (filter === 'used') return v.status === 'used';
        return true;
    });

    const activeCount = variants.filter((v) => v.status === 'active').length;
    const usedCount = variants.filter((v) => v.status === 'used').length;

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
                <div className="spinner" />
            </div>
        );
    }

    return (
        <div className="fade-in">
            {/* Breadcrumb */}
            <div style={{ marginBottom: '1rem' }}>
                <Link
                    to={`/admin/restaurant/${businessId}`}
                    style={{ color: 'var(--color-primary-light)', textDecoration: 'none', fontSize: '0.85rem' }}
                >
                    ← Back to {business?.displayName}
                </Link>
            </div>

            <h1 style={{
                fontSize: '1.5rem',
                fontWeight: '700',
                marginBottom: '0.25rem',
                background: 'linear-gradient(135deg, var(--color-text), var(--color-primary-light))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
            }}>
                Review Variants
            </h1>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginBottom: '2rem' }}>
                {activeCount} active · {usedCount} used · {variants.length} total
            </p>

            {/* AI Generate Section */}
            <div className="glass" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.05rem', fontWeight: '600', marginBottom: '0.75rem' }}>
                    🤖 Generate with AI
                </h2>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <input
                        className="input"
                        value={genServiceName}
                        onChange={(e) => setGenServiceName(e.target.value)}
                        placeholder="Service name (e.g., Ice cream)"
                        style={{ flex: '1 1 200px' }}
                    />
                    <select
                        className="input"
                        value={genCount}
                        onChange={(e) => setGenCount(Number(e.target.value))}
                        style={{ width: 'auto', flex: '0 0 100px' }}
                    >
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                        <option value={200}>200</option>
                    </select>
                    <button
                        className="btn-primary"
                        onClick={handleGenerate}
                        disabled={generating}
                        style={{ width: 'auto', padding: '0.75rem 1.25rem', minHeight: 'auto', flex: '0 0 auto' }}
                    >
                        {generating ? (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <div className="spinner spinner-sm" /> Generating...
                            </span>
                        ) : '⚡ Generate'}
                    </button>
                </div>
                {generating && (
                    <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>
                        This may take a minute. Please don't close this page...
                    </p>
                )}
            </div>

            {/* Manual Add */}
            <div className="glass" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.05rem', fontWeight: '600', marginBottom: '0.75rem' }}>
                    ✍️ Add Manually
                </h2>
                <form onSubmit={handleAdd} style={{ display: 'flex', gap: '0.5rem' }}>
                    <textarea
                        className="input"
                        value={newText}
                        onChange={(e) => setNewText(e.target.value)}
                        placeholder="Type a review variant..."
                        rows={2}
                        style={{ flex: 1, resize: 'vertical' }}
                    />
                    <button
                        className="btn-primary"
                        type="submit"
                        disabled={adding || !newText.trim()}
                        style={{ width: 'auto', padding: '0.75rem 1.25rem', minHeight: 'auto', alignSelf: 'flex-end' }}
                    >
                        {adding ? '...' : '➕ Add'}
                    </button>
                </form>
            </div>

            {/* Filter Tabs */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                {['all', 'active', 'used'].map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        style={{
                            padding: '0.5rem 1rem',
                            borderRadius: '0.75rem',
                            border: '1px solid ' + (filter === f ? 'var(--color-primary)' : 'rgba(255,255,255,0.1)'),
                            background: filter === f ? 'rgba(108, 92, 231, 0.15)' : 'rgba(255,255,255,0.03)',
                            color: filter === f ? 'var(--color-primary-light)' : 'var(--color-text-muted)',
                            cursor: 'pointer',
                            fontSize: '0.85rem',
                            fontWeight: '500',
                            textTransform: 'capitalize',
                        }}
                    >
                        {f} {f === 'all' ? `(${variants.length})` : f === 'active' ? `(${activeCount})` : `(${usedCount})`}
                    </button>
                ))}
            </div>

            {/* Variant List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {filteredVariants.map((v) => (
                    <div key={v.id} className="glass-light" style={{
                        padding: '0.875rem 1rem',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '0.75rem',
                    }}>
                        <div style={{ flex: 1 }}>
                            {editingId === v.id ? (
                                <textarea
                                    className="input"
                                    value={editText}
                                    onChange={(e) => setEditText(e.target.value)}
                                    rows={2}
                                    autoFocus
                                    style={{ resize: 'vertical' }}
                                />
                            ) : (
                                <p style={{ fontSize: '0.9rem', lineHeight: '1.5', color: 'var(--color-text)' }}>
                                    "{v.text}"
                                </p>
                            )}
                        </div>

                        <span className={`badge ${v.status === 'active' ? 'badge-active' : v.status === 'used' ? 'badge-used' : 'badge-archived'}`}>
                            {v.status}
                        </span>

                        <div style={{ display: 'flex', gap: '0.25rem', flexShrink: 0 }}>
                            {editingId === v.id ? (
                                <>
                                    <button onClick={() => handleEditSave(v.id)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>✅</button>
                                    <button onClick={() => setEditingId(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>❌</button>
                                </>
                            ) : (
                                <>
                                    <button onClick={() => { setEditingId(v.id); setEditText(v.text); }} style={{ background: 'none', border: 'none', cursor: 'pointer' }} title="Edit">✏️</button>
                                    {v.status === 'used' && (
                                        <button onClick={() => handleReactivate(v.id)} style={{ background: 'none', border: 'none', cursor: 'pointer' }} title="Reactivate">🔄</button>
                                    )}
                                    <button onClick={() => handleDelete(v.id)} style={{ background: 'none', border: 'none', cursor: 'pointer' }} title="Delete">🗑️</button>
                                </>
                            )}
                        </div>
                    </div>
                ))}
                {filteredVariants.length === 0 && (
                    <p style={{ color: 'var(--color-text-muted)', textAlign: 'center', padding: '2rem', fontSize: '0.9rem' }}>
                        No variants found. Generate some with AI or add them manually!
                    </p>
                )}
            </div>

            {/* Toast */}
            {toast && <div className="toast">{toast}</div>}
        </div>
    );
}
