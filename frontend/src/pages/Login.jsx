import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const { login } = useAuth();
    const navigate = useNavigate();

    const [form, setForm] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

    const handleSubmit = async e => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(form.email.trim(), form.password);
            navigate('/payouts');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const fillCredentials = (email, password) => {
        setForm({ email, password });
        setError('');
    };

    return (
        <div className="login-page">
            <div className="login-card">
                <div className="login-logo">
                    <div className="logo-icon">💰</div>
                    <h1>PayoutMgr</h1>
                    <p>Payout Management System</p>
                </div>

                <div className="demo-creds">
                    <strong>🔑 Demo Accounts</strong>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 6 }}>
                        <button
                            className="btn btn-outline btn-sm"
                            onClick={() => fillCredentials('ops@demo.com', 'ops123')}
                        >
                            OPS User
                        </button>
                        <button
                            className="btn btn-outline btn-sm"
                            onClick={() => fillCredentials('finance@demo.com', 'fin123')}
                        >
                            FINANCE User
                        </button>
                    </div>
                    <div style={{ marginTop: 6, lineHeight: 1.7 }}>
                        <code>ops@demo.com</code> / <code>ops123</code><br />
                        <code>finance@demo.com</code> / <code>fin123</code>
                    </div>
                </div>

                {error && (
                    <div className="alert alert-error">⚠️ {error}</div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label" htmlFor="email">
                            Email Address <span className="required">*</span>
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            className="form-input"
                            placeholder="Enter your email"
                            value={form.email}
                            onChange={handleChange}
                            required
                            autoFocus
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="password">
                            Password <span className="required">*</span>
                        </label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            className="form-input"
                            placeholder="Enter your password"
                            value={form.password}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary"
                        id="login-btn"
                        disabled={loading}
                        style={{ width: '100%', justifyContent: 'center', padding: '12px', marginTop: 8 }}
                    >
                        {loading ? (
                            <>
                                <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }}></span>
                                Signing in...
                            </>
                        ) : (
                            '🔐 Sign In'
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
