import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CheckSquare, LogOut, User, ChevronRight } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

const Navbar = () => {
    const { user, logout } = useAuth();

    const styles = {
        nav: {
            position: 'sticky',
            top: 0,
            zIndex: 50,
            borderBottom: '1px solid var(--border)',
            transition: 'all 0.3s ease',
        },
        inner: {
            maxWidth: 1200,
            margin: '0 auto',
            padding: '0 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: 64,
        },
        logo: {
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            fontWeight: 700,
            fontSize: 20,
            color: 'var(--text)',
        },
        logoIcon: {
            width: 36,
            height: 36,
            borderRadius: 10,
            background: 'var(--primary)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
        },
        right: {
            display: 'flex',
            alignItems: 'center',
            gap: 16,
        },
        userBadge: {
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '6px 14px',
            borderRadius: 'var(--radius-full)',
            background: 'var(--bg-subtle)',
            border: '1px solid var(--border)',
            fontSize: 13,
            fontWeight: 600,
            color: 'var(--text-secondary)',
        },
        avatar: {
            width: 24,
            height: 24,
            borderRadius: '50%',
            background: 'var(--primary-light)',
            color: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 11,
            fontWeight: 700,
        },
        logoutBtn: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 36,
            height: 36,
            borderRadius: 'var(--radius-sm)',
            border: 'none',
            background: 'transparent',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            transition: 'all 0.2s',
        },
        link: {
            fontSize: 14,
            fontWeight: 500,
            color: 'var(--text-secondary)',
            transition: 'color 0.2s',
        },
    };

    return (
        <nav className="glass" style={styles.nav}>
            <div style={styles.inner}>
                <Link to="/" style={styles.logo}>
                    <div style={styles.logoIcon}>
                        <CheckSquare size={20} />
                    </div>
                    <span>Taskify</span>
                </Link>

                <div style={styles.right}>
                    <ThemeToggle />

                    {user ? (
                        <>
                            <div style={styles.userBadge}>
                                <div style={styles.avatar}>
                                    {user.name.charAt(0).toUpperCase()}
                                </div>
                                <span>{user.name.split(' ')[0]}</span>
                            </div>
                            <button
                                onClick={logout}
                                style={styles.logoutBtn}
                                title="Logout"
                                onMouseEnter={e => { e.currentTarget.style.color = 'var(--danger)'; e.currentTarget.style.background = 'var(--danger-light)'; }}
                                onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'transparent'; }}
                            >
                                <LogOut size={18} />
                            </button>
                        </>
                    ) : (
                        <>
                            <Link
                                to="/login"
                                style={styles.link}
                                onMouseEnter={e => e.currentTarget.style.color = 'var(--primary)'}
                                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
                            >
                                Log in
                            </Link>
                            <Link to="/register" className="btn btn-primary">
                                Get Started
                                <ChevronRight size={16} />
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
