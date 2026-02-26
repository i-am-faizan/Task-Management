import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { UserPlus, Mail, Lock, User, ArrowRight, Sparkles } from 'lucide-react';

const Register = () => {
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const success = await register(formData);
            if (success) {
                toast.success('Account created!');
                navigate('/');
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Registration failed');
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
                    <div style={s.iconBox}><Sparkles size={28} /></div>
                    <h1 style={s.title}>Create Account</h1>
                    <p style={s.subtitle}>Start managing your tasks today</p>
                </div>

                <div className="card animate-slide" style={{ boxShadow: 'var(--shadow-lg)' }}>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label">Full Name</label>
                            <div style={s.inputWrap}>
                                <div style={s.inputIcon}><User size={18} /></div>
                                <input type="text" className="form-input" style={s.input}
                                    placeholder="John Doe" value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })} required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Email Address</label>
                            <div style={s.inputWrap}>
                                <div style={s.inputIcon}><Mail size={18} /></div>
                                <input type="email" className="form-input" style={s.input}
                                    placeholder="name@example.com" value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })} required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Password</label>
                            <div style={s.inputWrap}>
                                <div style={s.inputIcon}><Lock size={18} /></div>
                                <input type="password" className="form-input" style={s.input}
                                    placeholder="Create a strong password" value={formData.password}
                                    onChange={e => setFormData({ ...formData, password: e.target.value })} required
                                />
                            </div>
                        </div>

                        <button type="submit" className="btn btn-primary" style={s.submitBtn}>
                            <UserPlus size={18} style={{ marginRight: 5 }} />
                            Sign up
                        </button>
                    </form>

                    <div style={s.footer}>
                        Already have an account?{' '}
                        <Link to="/login" style={s.footerLink}>
                            Log in <ArrowRight size={14} />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
