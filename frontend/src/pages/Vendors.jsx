import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Vendors = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchVendors = async () => {
        setLoading(true);
        try {
            const res = await api.get('/vendors');
            setVendors(res.data.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load vendors.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchVendors(); }, []);

    return (
        <Layout title="Vendors">
            <div className="page-header">
                <div>
                    <h2>Vendors</h2>
                    <p>Manage all vendors for payout disbursement</p>
                </div>
                {user?.role === 'OPS' && (
                    <button
                        id="add-vendor-btn"
                        className="btn btn-primary"
                        onClick={() => navigate('/vendors/add')}
                    >
                        + Add Vendor
                    </button>
                )}
            </div>

            {error && <div className="alert alert-error">⚠️ {error}</div>}

            <div className="card">
                {loading ? (
                    <div className="loading-wrap"><div className="spinner"></div></div>
                ) : vendors.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">🏪</div>
                        <h3>No vendors yet</h3>
                        <p>Add your first vendor to get started.</p>
                    </div>
                ) : (
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Vendor Name</th>
                                    <th>UPI ID</th>
                                    <th>Bank Account</th>
                                    <th>IFSC</th>
                                    <th>Status</th>
                                    <th>Created</th>
                                </tr>
                            </thead>
                            <tbody>
                                {vendors.map((v, i) => (
                                    <tr key={v._id}>
                                        <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{i + 1}</td>
                                        <td>
                                            <strong>{v.name}</strong>
                                        </td>
                                        <td style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
                                            {v.upi_id || <span style={{ color: 'var(--text-muted)' }}>—</span>}
                                        </td>
                                        <td style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
                                            {v.bank_account
                                                ? `****${v.bank_account.slice(-4)}`
                                                : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                                        </td>
                                        <td style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
                                            {v.ifsc || <span style={{ color: 'var(--text-muted)' }}>—</span>}
                                        </td>
                                        <td>
                                            <span className={`badge ${v.is_active ? 'badge-active' : 'badge-inactive'}`}>
                                                {v.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                                            {new Date(v.createdAt).toLocaleDateString('en-IN')}
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

export default Vendors;
