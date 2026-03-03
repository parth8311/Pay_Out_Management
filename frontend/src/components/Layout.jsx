import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
    { to: '/payouts', label: 'Payouts', icon: '💸', roles: ['OPS', 'FINANCE'] },
    { to: '/vendors', label: 'Vendors', icon: '🏪', roles: ['OPS', 'FINANCE'] },
];

const Layout = ({ children, title }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const initials = user?.name
        ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
        : user?.email?.[0]?.toUpperCase() || 'U';

    const filteredNav = navItems.filter(n => n.roles.includes(user?.role));

    return (
        <div className="app-layout">
            {/* Sidebar */}
            <aside className="sidebar">
                <div className="sidebar-logo">
                    <h2>💰 PayoutMgr</h2>
                    <p>Payout Management System</p>
                </div>

                <nav className="sidebar-nav">
                    {filteredNav.map(item => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                        >
                            <span className="nav-icon">{item.icon}</span>
                            {item.label}
                        </NavLink>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <div className="user-info">
                        <div className="user-avatar">{initials}</div>
                        <div className="user-details">
                            <div className="user-name">{user?.name || user?.email}</div>
                            <span className={`badge ${user?.role === 'OPS' ? 'badge-ops' : 'badge-finance'}`}>
                                {user?.role}
                            </span>
                        </div>
                        <button className="logout-btn" onClick={handleLogout} title="Logout">⏻</button>
                    </div>
                </div>
            </aside>

            {/* Main */}
            <main className="main-content">
                <div className="topbar">
                    <h1>{title}</h1>
                    <div className="topbar-right">
                        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                            Logged in as <strong style={{ color: 'var(--primary-light)' }}>{user?.role}</strong>
                        </span>
                    </div>
                </div>
                <div className="page-body">{children}</div>
            </main>
        </div>
    );
};

export default Layout;
