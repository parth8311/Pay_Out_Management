import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import api from '../services/api';

const MODES = ['UPI', 'IMPS', 'NEFT'];

const CreatePayout = () => {
    const navigate = useNavigate();

    const [vendors, setVendors] = useState([]);
    const [form, setForm] = useState({
        vendor_id: '', amount: '', mode: '', note: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        api.get('/vendors?is_active=true')
            .then(res => setVendors(res.data.data.filter(v => v.is_active)))
            .catch(() => setError('Failed to load vendors.'));
    }, []);

    const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

    const handleSubmit = async e => {
        e.preventDefault();
        setError(''); setSuccess('');

        if (!form.vendor_id) return setError('Please select a vendor.');
        if (!form.amount || Number(form.amount) <= 0) return setError('Amount must be greater than 0.');
        if (!form.mode) return setError('Please select a payment mode.');

        setLoading(true);
        try {
            const res = await api.post('/payouts', {
                vendor_id: form.vendor_id,
                amount: Number(form.amount),
                mode: form.mode,
                note: form.note.trim() || undefined
            });
            setSuccess('Payout created as Draft! Redirecting...');
            setTimeout(() => navigate(`/payouts/${res.data.data._id}`), 1500);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create payout.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout title="Create Payout">
            <button className="back-btn" onClick={() => navigate('/payouts')}>
                ← Back to Payouts
            </button>

            <div className="page-header">
                <div>
                    <h2>Create Payout Request</h2>
                    <p>Payout will be saved as <strong>Draft</strong> — submit it to send for Finance approval</p>
                </div>
            </div>

            <div className="card" style={{ maxWidth: 640 }}>
                {error && <div className="alert alert-error">⚠️ {error}</div>}
                {success && <div className="alert alert-success">✅ {success}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label" htmlFor="p-vendor">
                            Vendor <span className="required">*</span>
                        </label>
                        <select
                            id="p-vendor" name="vendor_id"
                            className="form-select"
                            value={form.vendor_id} onChange={handleChange}
                            required
                        >
                            <option value="">— Select Vendor —</option>
                            {vendors.map(v => (
                                <option key={v._id} value={v._id}>
                                    {v.name} {v.upi_id ? `(${v.upi_id})` : ''}
                                </option>
                            ))}
                        </select>
                        {vendors.length === 0 && (
                            <div className="form-hint">⚠️ No active vendors. Add vendors first.</div>
                        )}
                    </div>

                    <div className="form-grid">
                        <div className="form-group">
                            <label className="form-label" htmlFor="p-amount">
                                Amount (₹) <span className="required">*</span>
                            </label>
                            <input
                                id="p-amount" name="amount" type="number"
                                className="form-input"
                                placeholder="e.g. 5000"
                                min="0.01" step="0.01"
                                value={form.amount} onChange={handleChange}
                                required
                            />
                            <div className="form-hint">Must be greater than 0</div>
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="p-mode">
                                Payment Mode <span className="required">*</span>
                            </label>
                            <select
                                id="p-mode" name="mode"
                                className="form-select"
                                value={form.mode} onChange={handleChange}
                                required
                            >
                                <option value="">— Select Mode —</option>
                                {MODES.map(m => <option key={m} value={m}>{m}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="p-note">Note (Optional)</label>
                        <textarea
                            id="p-note" name="note"
                            className="form-textarea"
                            placeholder="Add any reference or description..."
                            value={form.note} onChange={handleChange}
                        />
                    </div>

                    <div className="alert alert-info" style={{ marginTop: 8 }}>
                        ℹ️ After creating, you can <strong>Submit</strong> the payout for Finance approval.
                    </div>

                    <div className="form-actions">
                        <button type="submit" id="submit-payout-btn" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Creating...' : '💸 Create Payout'}
                        </button>
                        <button type="button" className="btn btn-ghost" onClick={() => navigate('/payouts')}>
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </Layout>
    );
};

export default CreatePayout;
