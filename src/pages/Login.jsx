import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { LogIn, Mail, Lock, ArrowRight, AlertCircle, Clock, Sparkles } from 'lucide-react';

/* ─────────── Motion Physics & Theme Engine ─────────── */
const physics = {
    spring: { type: "spring", stiffness: 400, damping: 30, mass: 0.8 },
    float: { type: "spring", stiffness: 150, damping: 20, mass: 1 },
    morph: { type: "spring", stiffness: 350, damping: 25 },
    smooth: { type: "tween", ease: [0.22, 1, 0.36, 1], duration: 0.6 }
};

const theme = {
    glass: "rgba(255, 255, 255, 0.75)",
    glassDeep: "rgba(255, 255, 255, 0.9)",
    glassBorder: "rgba(255, 255, 255, 0.4)",
    shadowAmbient: "0 24px 48px rgba(15, 23, 42, 0.04)",
    shadowElevated: "0 32px 64px rgba(37, 99, 235, 0.08), 0 0 0 1px rgba(255,255,255,0.6) inset",
    textPrimary: "#0f172a",
    textSecondary: "#64748b",
    textMuted: "#94a3b8",
    accentSoft: "#eff6ff",
    accentStrong: "#2563eb",
    errorBg: "#fef2f2",
    errorText: "#991b1b",
    errorBorder: "#fecaca",
    warnBg: "#fffbeb",
    warnText: "#92400e",
    warnBorder: "#fde68a",
};

/* ─────────── Cinematic Environment ─────────── */
const AmbientEnvironment = () => (
    <div style={{ position: "fixed", inset: 0, zIndex: 0, overflow: "hidden", pointerEvents: "none", background: "linear-gradient(135deg, #F8FAFC 0%, #FFFFFF 50%, #EFF6FF 100%)" }}>
        <motion.div
            animate={{ y: [0, -30, 0], x: [0, 20, 0], opacity: [0.4, 0.7, 0.4] }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
            style={{ position: "absolute", top: "-10%", right: "-5%", width: "50vw", height: "50vw", borderRadius: "50%", background: "radial-gradient(circle, rgba(37,99,235,0.06) 0%, transparent 70%)", filter: "blur(80px)" }}
        />
        <motion.div
            animate={{ y: [0, 40, 0], x: [0, -20, 0], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            style={{ position: "absolute", bottom: "-15%", left: "-10%", width: "60vw", height: "60vw", borderRadius: "50%", background: "radial-gradient(circle, rgba(0,122,255,0.04) 0%, transparent 70%)", filter: "blur(100px)" }}
        />
    </div>
);

/* ─────────── Reusable Intelligent Primitives ─────────── */
const AnimatedInput = ({ icon: Icon, label, type, placeholder, value, onChange, required, autoComplete }) => {
    const [isFocused, setIsFocused] = useState(false);

    return (
        <motion.div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: isFocused ? theme.accentStrong : theme.textPrimary, transition: 'color 0.3s ease', letterSpacing: '0.3px' }}>
                {label}
            </label>
            <motion.div
                animate={{
                    borderColor: isFocused ? theme.accentStrong : '#e2e8f0',
                    boxShadow: isFocused ? '0 0 0 4px rgba(37,99,235,0.1)' : '0 2px 4px rgba(0,0,0,0.02)',
                    backgroundColor: isFocused ? '#ffffff' : '#f8fafc'
                }}
                transition={{ duration: 0.2 }}
                style={{ position: 'relative', borderRadius: '16px', border: '1px solid', overflow: 'hidden' }}
            >
                <motion.div
                    animate={{ color: isFocused ? theme.accentStrong : theme.textMuted }}
                    transition={{ duration: 0.2 }}
                    style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', pointerEvents: 'none' }}
                >
                    <Icon size={18} />
                </motion.div>
                <input
                    type={type}
                    value={value}
                    onChange={onChange}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    placeholder={placeholder}
                    required={required}
                    autoComplete={autoComplete}
                    style={{
                        width: '100%', padding: '1rem 1rem 1rem 2.8rem',
                        border: 'none', background: 'transparent', outline: 'none',
                        fontSize: '0.95rem', color: theme.textPrimary,
                        fontFamily: 'inherit'
                    }}
                />
            </motion.div>
        </motion.div>
    );
};

/* Dynamic Island Style Alert Container */
const AlertIsland = ({ type = "error", icon: Icon, title, children }) => {
    const isError = type === "error";
    const bg = isError ? theme.errorBg : theme.warnBg;
    const border = isError ? theme.errorBorder : theme.warnBorder;
    const color = isError ? theme.errorText : theme.warnText;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95, y: -10, filter: "blur(4px)" }}
            animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 0.95, y: -10, filter: "blur(4px)" }}
            transition={physics.morph}
            style={{
                background: bg, border: `1px solid ${border}`, borderRadius: '16px',
                padding: '1.25rem', color: color, width: '100%', overflow: 'hidden',
                boxShadow: `0 10px 30px ${isError ? 'rgba(153,27,27,0.08)' : 'rgba(146,64,14,0.08)'}`
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: children ? '0.5rem' : '0', fontWeight: 700, fontSize: '0.9rem' }}>
                <Icon size={18} /> {title}
            </div>
            {children && (
                <p style={{ margin: 0, fontSize: '0.85rem', lineHeight: 1.6, opacity: 0.9 }}>
                    {children}
                </p>
            )}
        </motion.div>
    );
};

/* ═══════════ MAIN ARCHITECTURE ENGINE ═══════════ */
const Login = () => {
    // ----------------------------------------------------------------------
    // CORE IMMUTABLE LOGIC (Do Not Modify)
    // ----------------------------------------------------------------------
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [pendingReview, setPendingReview] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setPendingReview(false);
        setLoading(true);
        try {
            await login(email, password);
            navigate('/dashboard', { replace: true });
        } catch (err) {
            const status = err.response?.status;
            const code = err.response?.data?.code;
            if (status === 403 && code === 'ACCOUNT_PENDING') {
                setPendingReview(true);
            } else {
                setError(err.response?.data?.message || err.message || 'Login failed');
            }
        } finally {
            setLoading(false);
        }
    };
    // ----------------------------------------------------------------------

    const staggerVariants = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: physics.spring }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', padding: '1.5rem', zIndex: 1 }}>
            <AmbientEnvironment />

            <motion.div
                layout
                initial={{ opacity: 0, y: 40, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={physics.spring}
                style={{
                    width: '100%', maxWidth: '440px',
                    background: theme.glassDeep,
                    backdropFilter: 'blur(40px)', WebkitBackdropFilter: 'blur(40px)',
                    borderRadius: '32px', border: `1px solid ${theme.glassBorder}`,
                    boxShadow: theme.shadowElevated, padding: 'clamp(1.5rem, 5vw, 3rem) clamp(1.25rem, 4vw, 2.5rem)',
                    position: 'relative', zIndex: 10, overflow: 'hidden'
                }}
            >
                {/* Internal Card Highlight Gradient */}
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, transparent, rgba(37,99,235,0.4), transparent)' }} />

                <motion.div variants={staggerVariants} initial="hidden" animate="show" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>

                    {/* Brand Emblem */}
                    <motion.div variants={itemVariants} style={{ position: 'relative', marginBottom: '1.5rem' }}>
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                            style={{ position: 'absolute', inset: '-10px', background: 'conic-gradient(from 0deg, transparent, rgba(37,99,235,0.2), transparent)', borderRadius: '50%', filter: 'blur(10px)', zIndex: -1 }}
                        />
                        <div style={{ width: '64px', height: '64px', borderRadius: '20px', background: 'linear-gradient(135deg, #2563EB, #007AFF)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 12px 24px rgba(37,99,235,0.3), inset 0 2px 4px rgba(255,255,255,0.3)', border: '1px solid rgba(255,255,255,0.2)' }}>
                            <LogIn size={28} color="#ffffff" strokeWidth={2.5} />
                        </div>
                    </motion.div>

                    {/* Typography Hierarchy */}
                    <motion.div variants={itemVariants} style={{ textAlign: 'center', marginBottom: '2rem', width: '100%' }}>
                        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: theme.textPrimary, margin: '0 0 0.4rem', letterSpacing: '-0.03em' }}>
                            Welcome Back
                        </h1>
                        <p style={{ fontSize: '0.95rem', color: theme.textSecondary, margin: 0, fontWeight: 500 }}>
                            Authenticate to access your portal
                        </p>
                    </motion.div>

                    {/* Dynamic Morphing Alert Zones */}
                    <motion.div layout style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: (pendingReview || error) ? '2rem' : '0' }}>
                        <AnimatePresence mode="popLayout">
                            {pendingReview && (
                                <AlertIsland key="pending" type="warn" icon={Clock} title="Authorization Pending">
                                    Your architectural credentials are under review by a Super Admin. Access will be granted upon domain verification.
                                </AlertIsland>
                            )}
                            {error && (
                                <AlertIsland key="error" type="error" icon={AlertCircle} title={error} />
                            )}
                        </AnimatePresence>
                    </motion.div>

                    {/* Auth Form Orchestration */}
                    <motion.form variants={itemVariants} onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', width: '100%' }}>

                        <AnimatedInput
                            icon={Mail} label="Institutional Email" type="email"
                            placeholder="scholar@university.edu" value={email}
                            onChange={(e) => setEmail(e.target.value)} required autoComplete="email"
                        />

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <AnimatedInput
                                icon={Lock} label="Security Passphrase" type="password"
                                placeholder="••••••••••••" value={password}
                                onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password"
                            />
                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.2rem' }}>
                                <Link to="/forgot-password" style={{ fontSize: '0.8rem', fontWeight: 600, color: theme.accentStrong, textDecoration: 'none', transition: 'color 0.2s', padding: '0.2rem 0' }}>
                                    Recover Credentials?
                                </Link>
                            </div>
                        </div>

                        <motion.button
                            type="submit"
                            disabled={loading}
                            whileHover={!loading ? { scale: 1.02, boxShadow: '0 20px 40px rgba(37,99,235,0.2)' } : {}}
                            whileTap={!loading ? { scale: 0.98 } : {}}
                            style={{
                                width: '100%', padding: '1.1rem', marginTop: '0.5rem',
                                background: theme.textPrimary, color: '#ffffff',
                                border: 'none', borderRadius: '16px', fontSize: '1rem', fontWeight: 700,
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem',
                                cursor: loading ? 'not-allowed' : 'pointer', transition: 'background 0.3s ease',
                                boxShadow: '0 10px 20px rgba(15,23,42,0.1)'
                            }}
                        >
                            {loading ? (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <div style={{ width: '18px', height: '18px', border: '3px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                                    <span>Authenticating...</span>
                                </div>
                            ) : (
                                <>Initialize Session <ArrowRight size={18} /></>
                            )}
                        </motion.button>
                    </motion.form>

                    {/* Footer Routing */}
                    <motion.div variants={itemVariants} style={{ textAlign: 'center', marginTop: '2rem', width: '100%', paddingTop: '1.5rem', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
                        <p style={{ fontSize: '0.9rem', color: theme.textSecondary, margin: 0, fontWeight: 500 }}>
                            Unregistered?{' '}
                            <Link to="/register" style={{ fontWeight: 700, color: theme.accentStrong, textDecoration: 'none', position: 'relative' }}>
                                Establish Identity
                            </Link>
                        </p>
                    </motion.div>
                </motion.div>
            </motion.div>

            {/* Global Spin Animation for CSS-less integration */}
            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            `}} />
        </div>
    );
};

export default Login;