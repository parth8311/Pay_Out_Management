import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import api from '../services/api';

const AddVendor = () => {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        name: '', upi_id: '', bank_account: '', ifsc: '', is_active: true
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = e => {
        const { name, value, type, checked } = e.target;
        setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleSubmit = async e => {
        e.preventDefault();
        setError(''); setSuccess('');

        if (!form.name.trim()) {
            return setError('Vendor name is required.');
        }

        setLoading(true);
        try {
            await api.post('/vendors', {
                name: form.name.trim(),
                upi_id: form.upi_id.trim() || undefined,
                bank_account: form.bank_account.trim() || undefined,
                ifsc: form.ifsc.trim().toUpperCase() || undefined,
                is_active: form.is_active
            });
            setSuccess('Vendor created successfully! Redirecting...');
            setTimeout(() => navigate('/vendors'), 1500);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create vendor.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout title="Add Vendor">
            <button className="back-btn" onClick={() => navigate('/vendors')}>
                ← Back to Vendors
            </button>

            <div className="page-header">
                <div>
                    <h2>Add New Vendor</h2>
                    <p>Fill in vendor details for payout disbursement</p>
                </div>
            </div>

            <div className="card" style={{ maxWidth: 640 }}>
                {error && <div className="alert alert-error">⚠️ {error}</div>}
                {success && <div className="alert alert-success">✅ {success}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label" htmlFor="v-name">
                            Vendor Name <span className="required">*</span>
                        </label>
                        <input
                            id="v-name" name="name" type="text"
                            className="form-input"
                            placeholder="e.g. Tech Solutions Pvt Ltd"
                            value={form.name} onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-grid">
                        <div className="form-group">
                            <label className="form-label" htmlFor="v-upi">UPI ID</label>
                            <input
                                id="v-upi" name="upi_id" type="text"
                                className="form-input"
                                placeholder="vendor@paytm"
                                value={form.upi_id} onChange={handleChange}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label" htmlFor="v-bank">Bank Account</label>
                            <input
                                id="v-bank" name="bank_account" type="text"
                                className="form-input"
                                placeholder="Account number"
                                value={form.bank_account} onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="v-ifsc">IFSC Code</label>
                        <input
                            id="v-ifsc" name="ifsc" type="text"
                            className="form-input"
                            placeholder="HDFC0001234"
                            value={form.ifsc} onChange={handleChange}
                            style={{ textTransform: 'uppercase' }}
                        />
                    </div>

                    <div className="form-group">
                        <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                            <input
                                type="checkbox" name="is_active"
                                checked={form.is_active} onChange={handleChange}
                                style={{ width: 16, height: 16, accentColor: 'var(--primary)' }}
                            />
                            <span style={{ fontSize: 14, color: 'var(--text-primary)', fontWeight: 500 }}>
                                Active Vendor (can receive payouts)
                            </span>
                        </label>
                    </div>

                    <div className="form-actions">
                        <button type="submit" id="submit-vendor-btn" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Creating...' : '+ Create Vendor'}
                        </button>
                        <button type="button" className="btn btn-ghost" onClick={() => navigate('/vendors')}>
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </Layout>
    );
};

export default AddVendor;
