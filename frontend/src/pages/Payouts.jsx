import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import StatusBadge from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const STATUS_OPTIONS = ['', 'Draft', 'Submitted', 'Approved', 'Rejected'];

const Payouts = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [payouts, setPayouts] = useState([]);
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [filterVendor, setFilterVendor] = useState('');

    const fetchPayouts = async () => {
        setLoading(true); setError('');
        try {
            const params = {};
            if (filterStatus) params.status = filterStatus;
            if (filterVendor) params.vendor_id = filterVendor;

            const res = await api.get('/payouts', { params });
            setPayouts(res.data.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load payouts.');
        } finally {
            setLoading(false);
        }
    };

    const fetchVendors = async () => {
        try {
            const res = await api.get('/vendors');
            setVendors(res.data.data);
        } catch { }
    };

    useEffect(() => { fetchVendors(); }, []);
    useEffect(() => { fetchPayouts(); }, [filterStatus, filterVendor]);

    // Stats
    const counts = payouts.reduce((acc, p) => {
        acc[p.status] = (acc[p.status] || 0) + 1;
        return acc;
    }, {});

    return (
        <Layout title="Payouts">
            {/* Stats */}
            <div className="stats-grid">
                {[
                    { key: 'Draft', label: 'Draft', cls: 'draft' },
                    { key: 'Submitted', label: 'Submitted', cls: 'submitted' },
                    { key: 'Approved', label: 'Approved', cls: 'approved' },
                    { key: 'Rejected', label: 'Rejected', cls: 'rejected' },
                ].map(s => (
                    <div key={s.key} className={`stat-card ${s.cls}`}>
                        <div className="stat-label">{s.label}</div>
                        <div className="stat-value">{counts[s.key] || 0}</div>
                    </div>
                ))}
            </div>

            <div className="page-header">
                <div>
                    <h2>Payout Requests</h2>
                    <p>
                        {filterStatus || filterVendor
                            ? `Filtered results (${payouts.length})`
                            : `All payouts (${payouts.length})`}
                    </p>
                </div>
                {user?.role === 'OPS' && (
                    <button
                        id="create-payout-btn"
                        className="btn btn-primary"
                        onClick={() => navigate('/payouts/create')}
                    >
                        + Create Payout
                    </button>
                )}
            </div>

            {/* Filters */}
            <div className="filter-bar">
                <select
                    id="filter-status"
                    className="form-select"
                    value={filterStatus}
                    onChange={e => setFilterStatus(e.target.value)}
                >
                    <option value="">All Statuses</option>
                    {STATUS_OPTIONS.filter(Boolean).map(s => (
                        <option key={s} value={s}>{s}</option>
                    ))}
                </select>

                <select
                    id="filter-vendor"
                    className="form-select"
                    value={filterVendor}
                    onChange={e => setFilterVendor(e.target.value)}
                >
                    <option value="">All Vendors</option>
                    {vendors.map(v => (
                        <option key={v._id} value={v._id}>{v.name}</option>
                    ))}
                </select>

                {(filterStatus || filterVendor) && (
                    <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => { setFilterStatus(''); setFilterVendor(''); }}
                    >
                        ✕ Clear Filters
                    </button>
                )}
            </div>

            {error && <div className="alert alert-error">⚠️ {error}</div>}

            <div className="card" style={{ padding: 0 }}>
                {loading ? (
                    <div className="loading-wrap"><div className="spinner"></div></div>
                ) : payouts.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">💸</div>
                        <h3>No payouts found</h3>
                        <p>{filterStatus || filterVendor ? 'Try changing the filters.' : 'Create your first payout.'}</p>
                    </div>
                ) : (
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Payout ID</th>
                                    <th>Vendor</th>
                                    <th>Amount</th>
                                    <th>Mode</th>
                                    <th>Status</th>
                                    <th>Created By</th>
                                    <th>Date</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {payouts.map(p => (
                                    <tr key={p._id}>
                                        <td>
                                            <span style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--text-muted)' }}>
                                                #{p._id.slice(-8).toUpperCase()}
                                            </span>
                                        </td>
                                        <td>
                                            <div style={{ fontWeight: 600 }}>{p.vendor_id?.name || '—'}</div>
                                            {p.vendor_id?.upi_id && (
                                                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{p.vendor_id.upi_id}</div>
                                            )}
                                        </td>
                                        <td className="amount-cell">₹{p.amount.toLocaleString('en-IN')}</td>
                                        <td>
                                            <span className="badge badge-draft" style={{ textTransform: 'none' }}>{p.mode}</span>
                                        </td>
                                        <td><StatusBadge status={p.status} /></td>
                                        <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                                            {p.created_by?.email?.split('@')[0]}
                                            <div>
                                                <span className={`badge ${p.created_by?.role === 'OPS' ? 'badge-ops' : 'badge-finance'}`}
                                                    style={{ fontSize: 10 }}>
                                                    {p.created_by?.role}
                                                </span>
                                            </div>
                                        </td>
                                        <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                                            {new Date(p.createdAt).toLocaleDateString('en-IN')}
                                        </td>
                                        <td>
                                            <button
                                                className="btn btn-outline btn-sm"
                                                onClick={() => navigate(`/payouts/${p._id}`)}
                                            >
                                                View →
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default Payouts;
