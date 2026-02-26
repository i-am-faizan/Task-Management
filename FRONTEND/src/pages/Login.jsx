import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { LogIn, Mail, Lock, ArrowRight } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await login(email, password);
            toast.success('Welcome back!');
            navigate('/');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Login failed');
        }
    };

    const s = {
        wrapper: {
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            minHeight: '85vh', padding: 24,
        },
        container: { width: '100%', maxWidth: 420 },
        header: { textAlign: 'center', marginBottom: 40 },
        iconBox: {
            width: 56, height: 56, borderRadius: 16,
            background: 'var(--primary-light)', color: 'var(--primary)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 16,
        },
        title: { fontSize: 28, fontWeight: 700, color: 'var(--text)', marginBottom: 8 },
        subtitle: { fontSize: 15, color: 'var(--text-muted)' },
        inputWrap: { position: 'relative' },
        inputIcon: {
            position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
            color: 'var(--text-muted)', pointerEvents: 'none',
        },
        input: { paddingLeft: 44 },
        submitBtn: { width: '100%', padding: '14px 20px', fontSize: 15, fontWeight: 600 },
        footer: {
            marginTop: 32, paddingTop: 24,
            borderTop: '1px solid var(--border)', textAlign: 'center',
            fontSize: 14, color: 'var(--text-muted)',
        },
        footerLink: {
            color: 'var(--primary)', fontWeight: 600,
            display: 'inline-flex', alignItems: 'center', gap: 4,
        },
    };

    return (
        <div style={s.wrapper} className="animate-fade">
            <div style={s.container}>
                <div style={s.header}>
                    <div style={s.iconBox}><Lock size={28} /></div>
                    <h1 style={s.title}>Welcome Back</h1>
                    <p style={s.subtitle}>Sign in to your task manager</p>
                </div>

                <div className="card animate-slide" style={{ boxShadow: 'var(--shadow-lg)' }}>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label">Email Address</label>
                            <div style={s.inputWrap}>
                                <div style={s.inputIcon}><Mail size={18} /></div>
                                <input type="email" className="form-input" style={s.input}
                                    placeholder="name@example.com" value={email}
                                    onChange={e => setEmail(e.target.value)} required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Password</label>
                            <div style={s.inputWrap}>
                                <div style={s.inputIcon}><Lock size={18} /></div>
                                <input type="password" className="form-input" style={s.input}
                                    placeholder="••••••••" value={password}
                                    onChange={e => setPassword(e.target.value)} required
                                />
                            </div>
                        </div>

                        <button type="submit" className="btn btn-primary" style={s.submitBtn}>
                            Sign In <LogIn size={18} />
                        </button>
                    </form>

                    <div style={s.footer}>
                        Don't have an account?{' '}
                        <Link to="/register" style={s.footerLink}>
                            Create account <ArrowRight size={14} />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
