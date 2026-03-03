import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import StatusBadge from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const AUDIT_ICON = { CREATED: '📝', SUBMITTED: '📤', APPROVED: '✅', REJECTED: '❌' };

// ─── Reject Modal ──────────────────────────────────────────────────────────────
const RejectModal = ({ onConfirm, onCancel, loading }) => {
    const [reason, setReason] = useState('');
    return (
        <div className="modal-overlay">
            <div className="modal">
                <h3>❌ Reject Payout</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 16 }}>
                    Please provide a reason for rejection. This is mandatory.
                </p>
                <div className="form-group">
                    <label className="form-label" htmlFor="reject-reason">
                        Rejection Reason <span className="required">*</span>
                    </label>
                    <textarea
                        id="reject-reason"
                        className="form-textarea"
                        placeholder="e.g. Duplicate request, insufficient documentation..."
                        value={reason}
                        onChange={e => setReason(e.target.value)}
                        autoFocus
                    />
                </div>
                <div className="modal-actions">
                    <button className="btn btn-ghost" onClick={onCancel}>Cancel</button>
                    <button
                        id="confirm-reject-btn"
                        className="btn btn-danger"
                        disabled={!reason.trim() || loading}
                        onClick={() => onConfirm(reason)}
                    >
                        {loading ? 'Rejecting...' : 'Confirm Reject'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// ─── Main Component ────────────────────────────────────────────────────────────
const PayoutDetail = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [payout, setPayout] = useState(null);
    const [audits, setAudits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [actionMsg, setActionMsg] = useState('');
    const [showReject, setShowReject] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    const fetchPayout = async () => {
        setLoading(true); setError('');
        try {
            const res = await api.get(`/payouts/${id}`);
            setPayout(res.data.data);
            setAudits(res.data.audits);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load payout.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchPayout(); }, [id]);

    const doAction = async (endpoint, body = {}) => {
        setActionLoading(true); setError(''); setActionMsg('');
        try {
            await api.post(`/payouts/${id}/${endpoint}`, body);
            await fetchPayout();
            const msgs = {
                submit: '✅ Payout submitted for approval!',
                approve: '✅ Payout approved successfully!',
                reject: '✅ Payout rejected.'
            };
            setActionMsg(msgs[endpoint] || 'Action completed.');
        } catch (err) {
            setError(err.response?.data?.message || 'Action failed.');
        } finally {
            setActionLoading(false);
            setShowReject(false);
        }
    };

    if (loading) return (
        <Layout title="Payout Detail">
            <div className="loading-wrap"><div className="spinner"></div></div>
        </Layout>
    );

    if (error && !payout) return (
        <Layout title="Payout Detail">
            <div className="alert alert-error">⚠️ {error}</div>
        </Layout>
    );

    const vendor = payout?.vendor_id;

    return (
        <Layout title="Payout Detail">
            {showReject && (
                <RejectModal
                    loading={actionLoading}
                    onCancel={() => setShowReject(false)}
                    onConfirm={reason => doAction('reject', { decision_reason: reason })}
                />
            )}

            <button className="back-btn" onClick={() => navigate('/payouts')}>
                ← Back to Payouts
            </button>

            {/* Header */}
            <div className="page-header">
                <div>
                    <h2>
                        Payout #{payout?._id?.slice(-8).toUpperCase()}
                        &nbsp;&nbsp;
                        <StatusBadge status={payout?.status} />
                    </h2>
                    <p style={{ marginTop: 4 }}>
                        Created on {new Date(payout?.createdAt).toLocaleString('en-IN')} by{' '}
                        <strong>{payout?.created_by?.email}</strong>
                    </p>
                </div>
                <div style={{ fontSize: 36, fontWeight: 800, color: 'var(--success)' }}>
                    ₹{payout?.amount?.toLocaleString('en-IN')}
                </div>
            </div>

            {error && <div className="alert alert-error">⚠️ {error}</div>}
            {actionMsg && <div className="alert alert-success">{actionMsg}</div>}

            {/* Rejection Reason */}
            {payout?.status === 'Rejected' && payout?.decision_reason && (
                <div className="rejected-box">
                    <div className="label">❌ Rejection Reason</div>
                    <div className="reason">{payout.decision_reason}</div>
                </div>
            )}

            {/* Action Panel - based on role + status */}
            {(
                (user?.role === 'OPS' && payout?.status === 'Draft') ||
                (user?.role === 'FINANCE' && payout?.status === 'Submitted')
            ) && (
                    <div className="action-panel">
                        <h3>Available Actions</h3>
                        <div className="action-buttons">
                            {user?.role === 'OPS' && payout?.status === 'Draft' && (
                                <button
                                    id="submit-action-btn"
                                    className="btn btn-warning"
                                    disabled={actionLoading}
                                    onClick={() => doAction('submit')}
                                >
                                    📤 Submit for Approval
                                </button>
                            )}
                            {user?.role === 'FINANCE' && payout?.status === 'Submitted' && (
                                <>
                                    <button
                                        id="approve-action-btn"
                                        className="btn btn-success"
                                        disabled={actionLoading}
                                        onClick={() => doAction('approve')}
                                    >
                                        ✅ Approve
                                    </button>
                                    <button
                                        id="reject-action-btn"
                                        className="btn btn-danger"
                                        disabled={actionLoading}
                                        onClick={() => setShowReject(true)}
                                    >
                                        ❌ Reject
                                    </button>
                                </>
                            )}
                        </div>
                        {user?.role === 'OPS' && payout?.status === 'Draft' && (
                            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 10 }}>
                                ℹ️ Submitting will send this payout to Finance for approval.
                            </p>
                        )}
                        {user?.role === 'FINANCE' && payout?.status === 'Submitted' && (
                            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 10 }}>
                                ℹ️ Rejection requires a mandatory reason. Approval cannot be undone.
                            </p>
                        )}
                    </div>
                )}

            <div className="detail-grid">
                {/* Payout Details */}
                <div className="card">
                    <div className="card-header">
                        <div className="card-title">💸 Payout Details</div>
                    </div>

                    <div className="detail-row">
                        <div className="detail-label">Amount</div>
                        <div className="amount-display">₹{payout?.amount?.toLocaleString('en-IN')}</div>
                    </div>
                    <div className="detail-row">
                        <div className="detail-label">Payment Mode</div>
                        <div className="detail-value">
                            <span className="badge badge-draft">{payout?.mode}</span>
                        </div>
                    </div>
                    <div className="detail-row">
                        <div className="detail-label">Status</div>
                        <div className="detail-value"><StatusBadge status={payout?.status} /></div>
                    </div>
                    <div className="detail-row">
                        <div className="detail-label">Note</div>
                        <div className="detail-value" style={{ color: payout?.note ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                            {payout?.note || 'No note provided'}
                        </div>
                    </div>
                    <div className="detail-row">
                        <div className="detail-label">Created By</div>
                        <div className="detail-value">
                            {payout?.created_by?.email}
                            <span className={`badge ${payout?.created_by?.role === 'OPS' ? 'badge-ops' : 'badge-finance'}`}
                                style={{ marginLeft: 8 }}>
                                {payout?.created_by?.role}
                            </span>
                        </div>
                    </div>
                    <div className="detail-row">
                        <div className="detail-label">Created At</div>
                        <div className="detail-value">{new Date(payout?.createdAt).toLocaleString('en-IN')}</div>
                    </div>
                    <div className="detail-row">
                        <div className="detail-label">Last Updated</div>
                        <div className="detail-value">{new Date(payout?.updatedAt).toLocaleString('en-IN')}</div>
                    </div>
                </div>

                {/* Vendor Details */}
                <div className="card">
                    <div className="card-header">
                        <div className="card-title">🏪 Vendor Details</div>
                    </div>

                    <div className="detail-row">
                        <div className="detail-label">Vendor Name</div>
                        <div className="detail-value">{vendor?.name}</div>
                    </div>
                    <div className="detail-row">
                        <div className="detail-label">UPI ID</div>
                        <div className="detail-value" style={{ fontFamily: 'monospace' }}>
                            {vendor?.upi_id || <span style={{ color: 'var(--text-muted)' }}>Not provided</span>}
                        </div>
                    </div>
                    <div className="detail-row">
                        <div className="detail-label">Bank Account</div>
                        <div className="detail-value" style={{ fontFamily: 'monospace' }}>
                            {vendor?.bank_account
                                ? `****${vendor.bank_account.slice(-4)}`
                                : <span style={{ color: 'var(--text-muted)' }}>Not provided</span>}
                        </div>
                    </div>
                    <div className="detail-row">
                        <div className="detail-label">IFSC Code</div>
                        <div className="detail-value" style={{ fontFamily: 'monospace' }}>
                            {vendor?.ifsc || <span style={{ color: 'var(--text-muted)' }}>Not provided</span>}
                        </div>
                    </div>
                    <div className="detail-row">
                        <div className="detail-label">Vendor Status</div>
                        <div className="detail-value">
                            <span className={`badge ${vendor?.is_active ? 'badge-active' : 'badge-inactive'}`}>
                                {vendor?.is_active ? 'Active' : 'Inactive'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Audit Trail */}
            <div className="card">
                <div className="card-header">
                    <div className="card-title">📋 Audit Trail</div>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{audits.length} event{audits.length !== 1 ? 's' : ''}</span>
                </div>

                {audits.length === 0 ? (
                    <div className="empty-state" style={{ padding: '30px' }}>
                        <p>No audit events yet.</p>
                    </div>
                ) : (
                    <div className="audit-trail">
                        {audits.map((a) => (
                            <div className="audit-item" key={a._id}>
                                <div className={`audit-dot ${a.action}`}>
                                    {AUDIT_ICON[a.action]}
                                </div>
                                <div className="audit-content">
                                    <div className="audit-action">{a.action}</div>
                                    <div className="audit-meta">
                                        by <strong>{a.performed_by?.email}</strong>
                                        <span className={`badge ${a.performed_by?.role === 'OPS' ? 'badge-ops' : 'badge-finance'}`}
                                            style={{ marginLeft: 6, fontSize: 10 }}>
                                            {a.performed_by?.role}
                                        </span>
                                        &nbsp;·&nbsp;
                                        {new Date(a.createdAt).toLocaleString('en-IN')}
                                    </div>
                                    {a.note && (
                                        <div className="audit-note">Reason: "{a.note}"</div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default PayoutDetail;
