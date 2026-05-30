import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API = 'http://localhost:5000';

export default function Login() {
    const [form, setForm] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const { data } = await axios.post(`${API}/api/auth/login`, form);
            login(data);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
        }
        setLoading(false);
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
        }}>
            {/* Floating orbs */}
            <div style={{
                position: 'fixed', width: '300px', height: '300px',
                background: 'radial-gradient(circle, #7c3aed40, transparent)',
                borderRadius: '50%', top: '-100px', right: '-100px',
                pointerEvents: 'none'
            }} />
            <div style={{
                position: 'fixed', width: '200px', height: '200px',
                background: 'radial-gradient(circle, #06b6d440, transparent)',
                borderRadius: '50%', bottom: '-50px', left: '-50px',
                pointerEvents: 'none'
            }} />

            <div style={{
                background: 'rgba(255,255,255,0.05)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '24px',
                padding: '48px 40px',
                width: '100%',
                maxWidth: '420px',
                boxShadow: '0 25px 50px rgba(0,0,0,0.5)'
            }}>
                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <div style={{
                        width: '64px', height: '64px',
                        background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
                        borderRadius: '20px',
                        display: 'flex', alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '28px', margin: '0 auto 16px',
                        boxShadow: '0 8px 32px rgba(124,58,237,0.4)'
                    }}>
                        💬
                    </div>
                    <h1 style={{
                        fontSize: '28px', fontWeight: '800',
                        background: 'linear-gradient(135deg, #a78bfa, #38bdf8)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}>
                        ChatWave
                    </h1>
                    <p style={{ color: '#94a3b8', marginTop: '6px', fontSize: '14px' }}>
                        Welcome back! Sign in to continue
                    </p>
                </div>

                {error && (
                    <div style={{
                        background: 'rgba(239,68,68,0.1)',
                        border: '1px solid rgba(239,68,68,0.3)',
                        color: '#fca5a5',
                        padding: '12px 16px',
                        borderRadius: '12px',
                        marginBottom: '20px',
                        fontSize: '14px'
                    }}>
                        ⚠️ {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '6px', display: 'block' }}>
                            Email Address
                        </label>
                        <input
                            type="email"
                            placeholder="you@example.com"
                            value={form.email}
                            onChange={e => setForm({...form, email: e.target.value})}
                            style={{
                                width: '100%', padding: '14px 16px',
                                background: 'rgba(255,255,255,0.07)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '12px', color: 'white',
                                fontSize: '15px', outline: 'none',
                                transition: 'border-color 0.2s'
                            }}
                            onFocus={e => e.target.style.borderColor = '#7c3aed'}
                            onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                        />
                    </div>

                    <div style={{ marginBottom: '24px' }}>
                        <label style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '6px', display: 'block' }}>
                            Password
                        </label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            value={form.password}
                            onChange={e => setForm({...form, password: e.target.value})}
                            style={{
                                width: '100%', padding: '14px 16px',
                                background: 'rgba(255,255,255,0.07)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '12px', color: 'white',
                                fontSize: '15px', outline: 'none',
                                transition: 'border-color 0.2s'
                            }}
                            onFocus={e => e.target.style.borderColor = '#7c3aed'}
                            onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: '100%', padding: '14px',
                            background: loading ? '#4c1d95' : 'linear-gradient(135deg, #7c3aed, #06b6d4)',
                            border: 'none', borderRadius: '12px',
                            color: 'white', fontSize: '16px',
                            fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer',
                            boxShadow: '0 4px 20px rgba(124,58,237,0.4)',
                            transition: 'transform 0.2s, box-shadow 0.2s'
                        }}
                        onMouseEnter={e => { if(!loading) e.target.style.transform = 'translateY(-2px)'; }}
                        onMouseLeave={e => { e.target.style.transform = 'translateY(0)'; }}
                    >
                        {loading ? '✨ Signing in...' : '🚀 Sign In'}
                    </button>
                </form>

                <p style={{ color: '#64748b', textAlign: 'center', marginTop: '24px', fontSize: '14px' }}>
                    Don't have an account?{' '}
                    <Link to="/register" style={{
                        color: '#a78bfa', fontWeight: '600', textDecoration: 'none'
                    }}>
                        Create one →
                    </Link>
                </p>
            </div>
        </div>
    );
}