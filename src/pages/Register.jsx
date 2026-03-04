import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import {
    UserPlus, Mail, Lock, Shield, ArrowRight, ArrowLeft, AlertCircle, CheckCircle,
    GraduationCap, Building2, BookOpen, Calendar, Globe, Clock, User, Check
} from 'lucide-react';

const ACADEMIC_STATUSES = [
    'Undergraduate', 'Postgraduate', 'PhD / Doctoral', 'Diploma', 'Foundation Year', 'Other'
];

/* ─────────── Motion Physics & Theme Engine ─────────── */
const physics = {
    spring: { type: "spring", stiffness: 400, damping: 30, mass: 0.8 },
    float: { type: "spring", stiffness: 150, damping: 20, mass: 1 },
    morph: { type: "spring", stiffness: 350, damping: 25 },
    smooth: { type: "tween", ease: [0.22, 1, 0.36, 1], duration: 0.6 }
};

const theme = {
    glass: "rgba(255, 255, 255, 0.6)",
    glassDeep: "rgba(255, 255, 255, 0.85)",
    glassBorder: "rgba(255, 255, 255, 0.5)",
    shadowAmbient: "0 24px 48px rgba(15, 23, 42, 0.04)",
    shadowElevated: "0 32px 64px rgba(37, 99, 235, 0.08), 0 0 0 1px rgba(255,255,255,0.6) inset",
    textPrimary: "#0f172a",
    textSecondary: "#64748b",
    textMuted: "#94a3b8",
    accentSoft: "#eff6ff",
    accentStrong: "#2563eb",
    errorBg: "#fef2f2",
    errorText: "#991b1b",
    errorBorder: "#fecaca"
};

/* ─────────── Ambient Cinematic Environment ─────────── */
const AmbientEnvironment = () => (
    <div style={{ position: "fixed", inset: 0, zIndex: 0, overflow: "hidden", pointerEvents: "none", background: "linear-gradient(135deg, #F8FAFC 0%, #FFFFFF 50%, #EFF6FF 100%)" }}>
        <motion.div
            animate={{ y: [0, -40, 0], x: [0, 30, 0], opacity: [0.4, 0.7, 0.4] }}
            transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
            style={{ position: "absolute", top: "-10%", left: "-5%", width: "55vw", height: "55vw", borderRadius: "50%", background: "radial-gradient(circle, rgba(37,99,235,0.05) 0%, transparent 70%)", filter: "blur(90px)" }}
        />
        <motion.div
            animate={{ y: [0, 50, 0], x: [0, -30, 0], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            style={{ position: "absolute", bottom: "-15%", right: "-10%", width: "65vw", height: "65vw", borderRadius: "50%", background: "radial-gradient(circle, rgba(139,92,246,0.04) 0%, transparent 70%)", filter: "blur(110px)" }}
        />
    </div>
);

/* ─────────── Intelligent UI Primitives ─────────── */
const CinematicInput = ({ icon: Icon, label, type, placeholder, value, onChange, required, autoComplete, min, max, maxLength, style }) => {
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
                {Icon && (
                    <motion.div
                        animate={{ color: isFocused ? theme.accentStrong : theme.textMuted }}
                        transition={{ duration: 0.2 }}
                        style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', pointerEvents: 'none' }}
                    >
                        <Icon size={18} />
                    </motion.div>
                )}
                <input
                    type={type} value={value} onChange={onChange} onFocus={() => setIsFocused(true)} onBlur={() => setIsFocused(false)}
                    placeholder={placeholder} required={required} autoComplete={autoComplete} min={min} max={max} maxLength={maxLength}
                    style={{
                        width: '100%', padding: Icon ? '1rem 1rem 1rem 2.8rem' : '1rem',
                        border: 'none', background: 'transparent', outline: 'none',
                        fontSize: '0.95rem', color: theme.textPrimary, fontFamily: 'inherit',
                        ...style
                    }}
                />
            </motion.div>
        </motion.div>
    );
};

const CinematicSelect = ({ label, value, onChange, options, required }) => {
    const [isFocused, setIsFocused] = useState(false);

    return (
        <motion.div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: isFocused ? theme.accentStrong : theme.textPrimary, transition: 'color 0.3s ease', letterSpacing: '0.3px' }}>{label}</label>
            <motion.div
                animate={{ borderColor: isFocused ? theme.accentStrong : '#e2e8f0', boxShadow: isFocused ? '0 0 0 4px rgba(37,99,235,0.1)' : '0 2px 4px rgba(0,0,0,0.02)', backgroundColor: isFocused ? '#ffffff' : '#f8fafc' }}
                transition={{ duration: 0.2 }} style={{ position: 'relative', borderRadius: '16px', border: '1px solid', overflow: 'hidden' }}
            >
                <select
                    value={value} onChange={onChange} onFocus={() => setIsFocused(true)} onBlur={() => setIsFocused(false)} required={required}
                    style={{
                        width: '100%', padding: '1rem', border: 'none', background: 'transparent', outline: 'none',
                        fontSize: '0.95rem', color: value ? theme.textPrimary : theme.textMuted, fontFamily: 'inherit',
                        appearance: 'none', cursor: 'pointer'
                    }}
                >
                    <option value="" disabled>Select configuration...</option>
                    {options.map(opt => <option key={opt} value={opt} style={{ color: theme.textPrimary }}>{opt}</option>)}
                </select>
                <div style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: isFocused ? theme.accentStrong : theme.textMuted }}>
                    <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </div>
            </motion.div>
        </motion.div>
    );
};

const AlertIsland = ({ icon: Icon, title, children }) => (
    <motion.div
        layout initial={{ opacity: 0, scale: 0.95, y: -10, filter: "blur(4px)" }} animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }} exit={{ opacity: 0, scale: 0.95, y: -10, filter: "blur(4px)" }} transition={physics.morph}
        style={{ background: theme.errorBg, border: `1px solid ${theme.errorBorder}`, borderRadius: '16px', padding: '1.25rem', color: theme.errorText, width: '100%', overflow: 'hidden', boxShadow: '0 10px 30px rgba(153,27,27,0.08)' }}
    >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: children ? '0.5rem' : '0', fontWeight: 700, fontSize: '0.9rem' }}>
            <Icon size={18} /> {title}
        </div>
        {children && <p style={{ margin: 0, fontSize: '0.85rem', lineHeight: 1.6, opacity: 0.9 }}>{children}</p>}
    </motion.div>
);

const OrchestrationTimeline = ({ currentStep }) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '2.5rem', gap: '0.5rem', position: 'relative' }}>
        {[1, 2, 3].map((step, idx) => (
            <React.Fragment key={step}>
                <motion.div
                    layout animate={{ background: currentStep >= step ? theme.accentStrong : '#e2e8f0', scale: currentStep === step ? 1.1 : 1 }}
                    transition={physics.spring}
                    style={{ width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: currentStep >= step ? '#fff' : theme.textMuted, fontSize: '0.8rem', fontWeight: 700, zIndex: 2, boxShadow: currentStep === step ? '0 0 0 4px rgba(37,99,235,0.1)' : 'none' }}
                >
                    {currentStep > step ? <Check size={14} strokeWidth={3} /> : step}
                </motion.div>
                {idx < 2 && (
                    <div style={{ flex: '0 1 40px', height: '2px', background: '#e2e8f0', position: 'relative', borderRadius: '2px', overflow: 'hidden' }}>
                        <motion.div
                            initial={{ width: '0%' }} animate={{ width: currentStep > step ? '100%' : '0%' }} transition={{ duration: 0.4, ease: "easeInOut" }}
                            style={{ position: 'absolute', top: 0, left: 0, bottom: 0, background: theme.accentStrong }}
                        />
                    </div>
                )}
            </React.Fragment>
        ))}
    </div>
);

/* ═══════════ MAIN REGISTRATION ENGINE ═══════════ */
const Register = () => {
    // ----------------------------------------------------------------------
    // CORE IMMUTABLE LOGIC (Preserved Exactly)
    // ----------------------------------------------------------------------
    const [step, setStep] = useState(1);
    const [direction, setDirection] = useState(1);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [isPending, setIsPending] = useState(false);
    const { register, login } = useAuth();
    const navigate = useNavigate();

    // Step 1: Personal
    const [firstName, setFirstName] = useState('');
    const [middleName, setMiddleName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPw, setConfirmPw] = useState('');

    // Step 2: Academic
    const [currentAcademicStatus, setCurrentAcademicStatus] = useState('');
    const [institutionName, setInstitutionName] = useState('');
    const [institutionWebsite, setInstitutionWebsite] = useState('');
    const [course, setCourse] = useState('');
    const [fieldOfStudy, setFieldOfStudy] = useState('');
    const [courseStartYear, setCourseStartYear] = useState('');
    const [courseEndYear, setCourseEndYear] = useState('');

    // Step 3
    const [code, setCode] = useState('');

    const goNext = () => { setDirection(1); setStep(s => s + 1); setError(''); };
    const goBack = () => { setDirection(-1); setStep(s => s - 1); setError(''); };

    const validateStep1 = () => {
        const names = [firstName, middleName, lastName].filter(n => n.trim());
        if (names.length < 2) { setError('Please provide at least 2 of 3 name fields.'); return false; }
        if (!email) { setError('Email is required.'); return false; }
        if (password.length < 8) { setError('Password must be at least 8 characters.'); return false; }
        if (!/[A-Z]/.test(password)) { setError('Password must contain at least one uppercase letter.'); return false; }
        if (!/[0-9]/.test(password)) { setError('Password must contain at least one number.'); return false; }
        if (password !== confirmPw) { setError('Passwords do not match.'); return false; }
        return true;
    };

    const validateStep2 = () => {
        if (!currentAcademicStatus) { setError('Please select your academic status.'); return false; }
        if (!institutionName.trim()) { setError('Institution name is required.'); return false; }
        if (!course.trim()) { setError('Course is required.'); return false; }
        if (!courseStartYear || !courseEndYear) { setError('Start and end year are required.'); return false; }
        if (Number(courseEndYear) <= Number(courseStartYear)) { setError('End year must be after start year.'); return false; }
        return true;
    };

    const handleStep1Next = (e) => {
        e.preventDefault();
        if (validateStep1()) goNext();
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        if (!validateStep2()) return;
        setLoading(true);
        setError('');
        try {
            const result = await register({
                email, password,
                firstName: firstName.trim(), middleName: middleName.trim(), lastName: lastName.trim(),
                currentAcademicStatus, institutionName: institutionName.trim(),
                institutionWebsite: institutionWebsite.trim() || undefined,
                course: course.trim(), fieldOfStudy: fieldOfStudy.trim() || undefined,
                courseStartYear: Number(courseStartYear), courseEndYear: Number(courseEndYear)
            });

            if (result.user?.status === 'pending') {
                setIsPending(true);
                goNext();
            } else {
                try {
                    await login(email, password);
                    goNext();
                } catch {
                    goNext();
                }
            }
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const { authApi } = await import('../services/api');
            await authApi.verifyEmail({ code });
            navigate('/dashboard', { replace: true });
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid verification code');
        } finally {
            setLoading(false);
        }
    };
    // ----------------------------------------------------------------------

    const currentYear = new Date().getFullYear();

    const slideVariants = {
        enter: (d) => ({ x: d > 0 ? 40 : -40, opacity: 0, filter: "blur(8px)", scale: 0.98 }),
        center: { x: 0, opacity: 1, filter: "blur(0px)", scale: 1 },
        exit: (d) => ({ x: d > 0 ? -40 : 40, opacity: 0, filter: "blur(8px)", scale: 0.98 }),
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', position: 'relative', zIndex: 1 }}>
            <AmbientEnvironment />

            <motion.div
                layout
                initial={{ opacity: 0, y: 40, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={physics.spring}
                style={{
                    width: '100%', maxWidth: '520px',
                    background: theme.glassDeep, backdropFilter: 'blur(40px)', WebkitBackdropFilter: 'blur(40px)',
                    borderRadius: '32px', border: `1px solid ${theme.glassBorder}`,
                    boxShadow: theme.shadowElevated, padding: 'clamp(1.5rem, 5vw, 3rem) clamp(1.25rem, 4vw, 2.5rem)',
                    position: 'relative', zIndex: 10, overflow: 'hidden'
                }}
            >
                {/* Luminous Top Edge */}
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, transparent, rgba(37,99,235,0.5), transparent)' }} />

                <OrchestrationTimeline currentStep={step} />

                <AnimatePresence mode="wait" custom={direction}>

                    {/* ═══════ PHASE 1: IDENTITY ═══════ */}
                    {step === 1 && (
                        <motion.div key="personal" custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={physics.spring}>

                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 400, damping: 20 }} style={{ width: '64px', height: '64px', borderRadius: '20px', background: 'linear-gradient(135deg, #2563EB, #007AFF)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', boxShadow: '0 12px 24px rgba(37,99,235,0.3)' }}>
                                <UserPlus size={28} color="#fff" strokeWidth={2.5} />
                            </motion.div>

                            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                                <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: theme.textPrimary, margin: '0 0 0.4rem', letterSpacing: '-0.03em' }}>Establish Identity</h1>
                                <p style={{ fontSize: '0.95rem', color: theme.textSecondary, margin: 0, fontWeight: 500 }}>Phase 1 — Core Credentials</p>
                            </div>

                            <AnimatePresence mode="popLayout">
                                {error && (
                                    <motion.div layout style={{ marginBottom: '1.5rem' }}>
                                        <AlertIsland icon={AlertCircle} title={error} />
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <form onSubmit={handleStep1Next} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '1rem' }}>
                                    <CinematicInput icon={User} label="First Name *" placeholder="Given Name" value={firstName} onChange={e => setFirstName(e.target.value)} />
                                    <CinematicInput label="Middle Name" placeholder="Optional" value={middleName} onChange={e => setMiddleName(e.target.value)} />
                                </div>
                                <CinematicInput label="Last Name *" placeholder="Surname" value={lastName} onChange={e => setLastName(e.target.value)} />
                                <p style={{ fontSize: '0.75rem', color: theme.textMuted, marginTop: '-0.75rem', paddingLeft: '0.2rem' }}>* Minimum 2 fields required for identity resolution.</p>

                                <CinematicInput icon={Mail} label="Institutional Email" type="email" placeholder="scholar@university.edu" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" />

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem' }}>
                                    <CinematicInput icon={Lock} label="Security Passphrase" type="password" placeholder="Min 8 chars" value={password} onChange={e => setPassword(e.target.value)} required autoComplete="new-password" />
                                    <CinematicInput icon={Shield} label="Confirm Passphrase" type="password" placeholder="Re-enter" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} required autoComplete="new-password" />
                                </div>

                                <motion.button type="submit" whileHover={{ scale: 1.02, boxShadow: '0 20px 40px rgba(37,99,235,0.2)' }} whileTap={{ scale: 0.98 }} style={{ width: '100%', padding: '1.1rem', marginTop: '1rem', background: theme.textPrimary, color: '#fff', border: 'none', borderRadius: '16px', fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', cursor: 'pointer', boxShadow: '0 10px 20px rgba(15,23,42,0.1)' }}>
                                    Proceed to Phase 2 <ArrowRight size={18} />
                                </motion.button>
                            </form>

                            <p style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.9rem', color: theme.textSecondary, fontWeight: 500 }}>
                                Already integrated? <Link to="/login" style={{ fontWeight: 700, color: theme.accentStrong, textDecoration: 'none' }}>Authenticate</Link>
                            </p>
                        </motion.div>
                    )}

                    {/* ═══════ PHASE 2: ACADEMIC ═══════ */}
                    {step === 2 && (
                        <motion.div key="academic" custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={physics.spring}>

                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 400, damping: 20 }} style={{ width: '64px', height: '64px', borderRadius: '20px', background: 'linear-gradient(135deg, #8B5CF6, #6366F1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', boxShadow: '0 12px 24px rgba(139,92,246,0.3)' }}>
                                <GraduationCap size={28} color="#fff" strokeWidth={2.5} />
                            </motion.div>

                            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                                <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: theme.textPrimary, margin: '0 0 0.4rem', letterSpacing: '-0.03em' }}>Academic Matrix</h1>
                                <p style={{ fontSize: '0.95rem', color: theme.textSecondary, margin: 0, fontWeight: 500 }}>Phase 2 — Institutional Context</p>
                            </div>

                            <AnimatePresence mode="popLayout">
                                {error && (
                                    <motion.div layout style={{ marginBottom: '1.5rem' }}>
                                        <AlertIsland icon={AlertCircle} title={error} />
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

                                <CinematicSelect label="Academic Status" value={currentAcademicStatus} onChange={e => setCurrentAcademicStatus(e.target.value)} options={ACADEMIC_STATUSES} required />

                                <CinematicInput icon={Building2} label="Institution Origin" placeholder="e.g. University of Oxford" value={institutionName} onChange={e => setInstitutionName(e.target.value)} required />

                                <div>
                                    <CinematicInput icon={Globe} label="Institution Domain (Optional)" placeholder="e.g. https://ox.ac.uk" value={institutionWebsite} onChange={e => setInstitutionWebsite(e.target.value)} />
                                    <p style={{ fontSize: '0.75rem', color: theme.textMuted, marginTop: '0.4rem', paddingLeft: '0.2rem' }}>Automatic domain matching expedites the clearance sequence.</p>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem' }}>
                                    <CinematicInput icon={BookOpen} label="Course Designation" placeholder="e.g. B.Sc" value={course} onChange={e => setCourse(e.target.value)} required />
                                    <CinematicInput label="Field of Study" placeholder="e.g. Computer Science" value={fieldOfStudy} onChange={e => setFieldOfStudy(e.target.value)} />
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <CinematicInput icon={Calendar} label="Commencement Year" type="number" placeholder={String(currentYear)} min="2000" max={currentYear + 2} value={courseStartYear} onChange={e => setCourseStartYear(e.target.value)} required />
                                    <CinematicInput icon={Calendar} label="Completion Year" type="number" placeholder={String(currentYear + 3)} min="2000" max="2040" value={courseEndYear} onChange={e => setCourseEndYear(e.target.value)} required />
                                </div>

                                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                    <motion.button type="button" onClick={goBack} whileHover={{ background: 'rgba(0,0,0,0.05)' }} whileTap={{ scale: 0.95 }} style={{ flex: '0 0 auto', padding: '1.1rem 1.5rem', background: 'transparent', color: theme.textSecondary, border: '1px solid #e2e8f0', borderRadius: '16px', fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }}>
                                        <ArrowLeft size={18} />
                                    </motion.button>
                                    <motion.button type="submit" disabled={loading} whileHover={!loading ? { scale: 1.02, boxShadow: '0 20px 40px rgba(37,99,235,0.2)' } : {}} whileTap={!loading ? { scale: 0.98 } : {}} style={{ flex: 1, padding: '1.1rem', background: theme.textPrimary, color: '#fff', border: 'none', borderRadius: '16px', fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', cursor: loading ? 'not-allowed' : 'pointer', boxShadow: '0 10px 20px rgba(15,23,42,0.1)' }}>
                                        {loading ? <div style={{ width: '20px', height: '20px', border: '3px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 1s linear infinite' }} /> : <>Initialize Account <ArrowRight size={18} /></>}
                                    </motion.button>
                                </div>
                            </form>
                        </motion.div>
                    )}

                    {/* ═══════ PHASE 3: CLEARANCE ═══════ */}
                    {step === 3 && (
                        <motion.div key="verify" custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={physics.spring}>

                            {isPending ? (
                                /* ── Pending Sequence ── */
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 400, damping: 20 }} style={{ width: '64px', height: '64px', borderRadius: '20px', background: 'linear-gradient(135deg, #F59E0B, #FBBF24)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', boxShadow: '0 12px 24px rgba(245,158,11,0.3)' }}>
                                        <Clock size={28} color="#fff" strokeWidth={2.5} />
                                    </motion.div>

                                    <h1 style={{ textAlign: 'center', fontSize: '1.8rem', fontWeight: 800, color: theme.textPrimary, marginBottom: '0.5rem', letterSpacing: '-0.03em' }}>Clearance Pending</h1>
                                    <p style={{ textAlign: 'center', fontSize: '0.95rem', color: theme.textSecondary, marginBottom: '2rem', lineHeight: 1.6, maxWidth: '90%' }}>
                                        Domain mismatch detected. Your ecosystem entry requires manual authorization by a Super Admin.
                                    </p>

                                    <div style={{ width: '100%', padding: '1.5rem', borderRadius: '16px', background: '#FFFBEB', border: '1px solid #FDE68A', color: '#92400E', boxShadow: '0 10px 30px rgba(146,64,14,0.05)' }}>
                                        <strong style={{ fontSize: '0.9rem', display: 'block', marginBottom: '0.75rem' }}>Subsequent Protocol:</strong>
                                        <ul style={{ paddingLeft: '1.2rem', margin: 0, fontSize: '0.85rem', lineHeight: 1.7, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                            <li>Administrators will audit your provided parameters.</li>
                                            <li>Upon verification, system access will be granted.</li>
                                            <li>A final email verification layer will be triggered.</li>
                                        </ul>
                                    </div>

                                    <Link to="/login" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '2.5rem', fontSize: '0.9rem', fontWeight: 700, color: theme.accentStrong, textDecoration: 'none' }}>
                                        <ArrowLeft size={16} /> Return to Authentication
                                    </Link>
                                </div>
                            ) : (
                                /* ── Verification Sequence ── */
                                <div>
                                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 400, damping: 20 }} style={{ width: '64px', height: '64px', borderRadius: '20px', background: 'linear-gradient(135deg, #10B981, #34D399)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', boxShadow: '0 12px 24px rgba(16,185,129,0.3)' }}>
                                        <Mail size={28} color="#fff" strokeWidth={2.5} />
                                    </motion.div>

                                    <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                                        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: theme.textPrimary, margin: '0 0 0.4rem', letterSpacing: '-0.03em' }}>Verify Frequency</h1>
                                        <p style={{ fontSize: '0.95rem', color: theme.textSecondary, margin: 0, lineHeight: 1.5 }}>
                                            A 6-digit cryptographic code was transmitted to <br />
                                            <strong style={{ color: theme.textPrimary }}>{email}</strong>
                                        </p>
                                    </div>

                                    <AnimatePresence mode="popLayout">
                                        {error && (
                                            <motion.div layout style={{ marginBottom: '1.5rem' }}>
                                                <AlertIsland icon={AlertCircle} title={error} />
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    <form onSubmit={handleVerify} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                        <CinematicInput
                                            label="Cryptographic Hash" type="text" placeholder="• • • • • •"
                                            value={code} onChange={e => setCode(e.target.value)} required maxLength={6}
                                            style={{ textAlign: 'center', fontSize: '1.75rem', letterSpacing: '0.75rem', fontWeight: 800, padding: '1.5rem' }}
                                        />

                                        <motion.button type="submit" disabled={loading} whileHover={!loading ? { scale: 1.02, boxShadow: '0 20px 40px rgba(16,185,129,0.2)' } : {}} whileTap={!loading ? { scale: 0.98 } : {}} style={{ width: '100%', padding: '1.1rem', background: '#10B981', color: '#fff', border: 'none', borderRadius: '16px', fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', cursor: loading ? 'not-allowed' : 'pointer', boxShadow: '0 10px 20px rgba(16,185,129,0.1)' }}>
                                            {loading ? <div style={{ width: '20px', height: '20px', border: '3px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 1s linear infinite' }} /> : <>Verify & Finalize <CheckCircle size={18} /></>}
                                        </motion.button>
                                    </form>

                                    <button onClick={() => navigate('/dashboard')} style={{ display: 'block', margin: '2rem auto 0', background: 'none', border: 'none', fontSize: '0.85rem', fontWeight: 600, color: theme.textMuted, cursor: 'pointer', transition: 'color 0.2s' }} onMouseOver={e => e.target.style.color = theme.textPrimary} onMouseOut={e => e.target.style.color = theme.textMuted}>
                                        Bypass Layer Temporarily →
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            {/* Global Spin Animation */}
            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            `}} />
        </div>
    );
};

export default Register;