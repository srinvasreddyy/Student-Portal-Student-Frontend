import React, { useState, useEffect, useRef } from 'react';
import {
    motion,
    AnimatePresence,
    useScroll,
    useTransform,
    useSpring,
    useInView,
    useMotionValue,
    useMotionTemplate
} from 'framer-motion';
import { studentApi } from '../../services/api';
import { toast } from '../../components/Toast';
import {
    User, GraduationCap, Briefcase, Code, Save, Check, Plus, X,
    Calendar, Building2, BookOpen, Sparkles, PenLine, Shield, Eye, Lock,
    ChevronRight, Activity
} from 'lucide-react';

// ============================================================================
// MOTION PHYSICS & DESIGN TOKENS (Antigravity System)
// ============================================================================
const PHYSICS = {
    spring: { type: "spring", stiffness: 400, damping: 30, mass: 0.8 },
    snappy: { type: "spring", stiffness: 500, damping: 25, mass: 0.5 },
    morph: { type: "spring", stiffness: 300, damping: 25, mass: 1 },
    smooth: { type: "tween", ease: [0.16, 1, 0.3, 1], duration: 0.7 }
};

const THEME = {
    glassBase: 'rgba(255, 255, 255, 0.7)',
    glassDeep: 'rgba(255, 255, 255, 0.4)',
    glassBorder: 'rgba(255, 255, 255, 0.8)',
    shadowAmbient: '0 8px 32px -8px rgba(15, 23, 42, 0.05)',
    shadowElevated: '0 24px 48px -12px rgba(15, 23, 42, 0.12)',
    accentPrimary: '#2563EB',
    accentAzure: '#3B82F6',
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444'
};

// ============================================================================
// CORE ABSTRACTIONS & REUSABLE MOTION COMPONENTS
// ============================================================================

const AmbientCanvas = () => {
    const { scrollYProgress } = useScroll();
    const y1 = useTransform(scrollYProgress, [0, 1], [0, 400]);
    const y2 = useTransform(scrollYProgress, [0, 1], [0, -300]);
    const rotate = useTransform(scrollYProgress, [0, 1], [0, 45]);

    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: -1, overflow: 'hidden', background: '#FAFAFA', pointerEvents: 'none' }}>
            <motion.div style={{
                position: 'absolute', top: '-20%', left: '-10%', width: '70vw', height: '70vw',
                background: 'radial-gradient(circle, rgba(37,99,235,0.03) 0%, transparent 60%)',
                filter: 'blur(100px)', y: y1, rotate
            }} />
            <motion.div style={{
                position: 'absolute', bottom: '-20%', right: '-10%', width: '60vw', height: '60vw',
                background: 'radial-gradient(circle, rgba(16,185,129,0.02) 0%, transparent 60%)',
                filter: 'blur(120px)', y: y2
            }} />
        </div>
    );
};

const CinematicScene = ({ children, delay = 0, direction = 'up' }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-10%" });
    const yOffset = direction === 'up' ? 40 : direction === 'down' ? -40 : 0;

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: yOffset, filter: 'blur(10px)' }}
            animate={isInView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
            transition={{ ...PHYSICS.smooth, delay }}
            style={{ width: '100%', position: 'relative' }}
        >
            {children}
        </motion.div>
    );
};

const MagneticInteraction = ({ children, strength = 20 }) => {
    const ref = useRef(null);
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const springX = useSpring(x, PHYSICS.snappy);
    const springY = useSpring(y, PHYSICS.snappy);

    const handleMouseMove = (e) => {
        const node = ref.current;
        if (!node) return;
        const rect = node.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        x.set((e.clientX - centerX) / (rect.width / strength));
        y.set((e.clientY - centerY) / (rect.height / strength));
    };

    const handleMouseLeave = () => { x.set(0); y.set(0); };

    return (
        <motion.div ref={ref} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} style={{ x: springX, y: springY }}>
            {children}
        </motion.div>
    );
};

const GlowSurface = ({ children, style, className }) => {
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const handleMouseMove = (e) => {
        const { currentTarget, clientX, clientY } = e;
        const { left, top } = currentTarget.getBoundingClientRect();
        mouseX.set(clientX - left);
        mouseY.set(clientY - top);
    };

    return (
        <motion.div
            onMouseMove={handleMouseMove}
            style={{
                position: 'relative',
                background: THEME.glassBase,
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                border: `1px solid ${THEME.glassBorder}`,
                borderRadius: '24px',
                boxShadow: THEME.shadowAmbient,
                overflow: 'hidden',
                ...style
            }}
            className={className}
        >
            <motion.div
                style={{
                    position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none',
                    background: useMotionTemplate`radial-gradient(400px circle at ${mouseX}px ${mouseY}px, rgba(255,255,255,0.6), transparent 80%)`,
                    opacity: 0, transition: 'opacity 0.4s ease'
                }}
                onHoverStart={(e) => e.target.style.opacity = 1}
                onHoverEnd={(e) => e.target.style.opacity = 0}
            />
            <div style={{ position: 'relative', zIndex: 1, height: '100%' }}>
                {children}
            </div>
        </motion.div>
    );
};

const PremiumInput = ({ label, icon: Icon, type = 'text', readOnly, ...props }) => {
    const [isFocused, setIsFocused] = useState(false);
    const isTextArea = type === 'textarea';
    const Component = isTextArea ? 'textarea' : 'input';

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', width: '100%' }}>
            {label && (
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    {Icon && <Icon size={14} color="#64748B" />} {label}
                </label>
            )}
            <motion.div
                animate={{
                    borderColor: isFocused ? THEME.accentPrimary : '#E2E8F0',
                    boxShadow: isFocused ? `0 0 0 4px ${THEME.accentPrimary}15` : '0 0 0 0px transparent'
                }}
                transition={PHYSICS.snappy}
                style={{
                    position: 'relative', borderRadius: '12px', background: readOnly ? '#F8FAFC' : '#FFFFFF',
                    border: '1px solid #E2E8F0', overflow: 'hidden'
                }}
            >
                <Component
                    {...props}
                    type={type !== 'textarea' ? type : undefined}
                    readOnly={readOnly}
                    onFocus={(e) => { setIsFocused(true); props.onFocus?.(e); }}
                    onBlur={(e) => { setIsFocused(false); props.onBlur?.(e); }}
                    style={{
                        width: '100%', padding: '0.75rem 1rem', border: 'none', background: 'transparent',
                        outline: 'none', fontSize: '0.95rem', color: readOnly ? '#94A3B8' : '#0F172A',
                        resize: isTextArea ? 'vertical' : 'none', minHeight: isTextArea ? '80px' : 'auto',
                        fontFamily: 'inherit'
                    }}
                />
            </motion.div>
        </div>
    );
};

// ============================================================================
// DOMAIN-SPECIFIC MICRO-INTERACTIONS
// ============================================================================

const DynamicIslandStatus = ({ saving, saved }) => (
    <AnimatePresence mode="wait">
        {(saving || saved) && (
            <motion.div
                initial={{ opacity: 0, width: 40, scale: 0.9 }}
                animate={{ opacity: 1, width: 'auto', scale: 1 }}
                exit={{ opacity: 0, width: 40, scale: 0.9 }}
                transition={PHYSICS.morph}
                style={{
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                    padding: '0.5rem 1rem', borderRadius: '999px',
                    background: saving ? '#FFFBEB' : '#ECFDF5',
                    border: `1px solid ${saving ? '#FEF3C7' : '#D1FAE5'}`,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                    overflow: 'hidden', whiteSpace: 'nowrap'
                }}
            >
                {saving ? (
                    <>
                        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} style={{ width: '14px', height: '14px', border: '2px solid #D97706', borderTopColor: 'transparent', borderRadius: '50%' }} />
                        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#B45309' }}>Syncing Data...</span>
                    </>
                ) : (
                    <>
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={PHYSICS.snappy}>
                            <div style={{ background: THEME.success, borderRadius: '50%', padding: '2px' }}><Check size={12} color="#FFF" /></div>
                        </motion.div>
                        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#059669' }}>Secured</span>
                    </>
                )}
            </motion.div>
        )}
    </AnimatePresence>
);

const FluidSkillTag = ({ skill, onRemove, index }) => (
    <motion.span
        layout
        initial={{ opacity: 0, scale: 0.8, filter: 'blur(4px)' }}
        animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
        exit={{ opacity: 0, scale: 0.8, filter: 'blur(4px)' }}
        transition={{ ...PHYSICS.snappy, delay: index * 0.02 }}
        whileHover={{ y: -2, scale: 1.02, backgroundColor: '#EFF6FF' }}
        style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
            padding: '0.5rem 1rem', background: '#F8FAFC', border: '1px solid #E2E8F0',
            borderRadius: '12px', fontSize: '0.85rem', fontWeight: 600, color: '#334155',
            boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
        }}
    >
        {skill}
        <motion.button
            whileHover={{ scale: 1.2, color: THEME.danger }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onRemove(skill)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', display: 'flex', color: '#94A3B8', transition: 'color 0.2s' }}
        >
            <X size={12} />
        </motion.button>
    </motion.span>
);

const TimelineEntryForm = ({ entry, onChange, onRemove, type, readOnly }) => {
    const isEdu = type === 'education';
    const fields = isEdu ? [
        { key: 'institution', label: 'Institution', icon: Building2, required: true },
        { key: 'degree', label: 'Degree', icon: GraduationCap },
        { key: 'field', label: 'Field of Study', icon: BookOpen },
        { key: 'startYear', label: 'Start Year', icon: Calendar, type: 'number' },
        { key: 'endYear', label: 'End Year', icon: Calendar, type: 'number' },
        { key: 'grade', label: 'Grade / GPA', icon: Sparkles },
    ] : [
        { key: 'title', label: 'Title', icon: Briefcase, required: true },
        { key: 'company', label: 'Company', icon: Building2, required: true },
        { key: 'from', label: 'From', icon: Calendar, type: 'date' },
        { key: 'to', label: 'To', icon: Calendar, type: 'date', disabledIfCurrent: true },
        { key: 'description', label: 'Description', icon: PenLine, type: 'textarea' },
    ];

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        try { return new Date(dateStr).toISOString().split('T')[0]; } catch { return ''; }
    };

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, filter: 'blur(5px)' }} transition={PHYSICS.spring}>
            <div style={{
                position: 'relative', padding: '1.5rem', background: THEME.glassDeep,
                borderRadius: '20px', border: '1px solid rgba(255,255,255,0.6)',
                boxShadow: 'inset 0 2px 10px rgba(255,255,255,0.5), 0 4px 20px rgba(0,0,0,0.03)',
                opacity: readOnly ? 0.8 : 1
            }}>
                {readOnly && (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} style={{
                        display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.4rem 0.8rem',
                        borderRadius: '999px', background: '#EFF6FF', border: '1px solid #BFDBFE',
                        fontSize: '0.75rem', fontWeight: 700, color: THEME.accentPrimary,
                        position: 'absolute', top: '1rem', right: '1rem', zIndex: 10
                    }}>
                        <Lock size={12} /> Verified Record
                    </motion.div>
                )}

                {!readOnly && (
                    <motion.button whileHover={{ scale: 1.1, backgroundColor: '#FEE2E2', color: THEME.danger }} whileTap={{ scale: 0.9 }}
                        onClick={onRemove} style={{
                            position: 'absolute', top: '1rem', right: '1rem', background: '#F8FAFC',
                            border: '1px solid #E2E8F0', cursor: 'pointer', padding: '6px',
                            borderRadius: '10px', color: '#64748B', display: 'flex', zIndex: 10,
                            transition: 'all 0.2s'
                        }}
                    >
                        <X size={16} />
                    </motion.button>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(220px, 100%), 1fr))', gap: '1rem', marginTop: readOnly ? '1.5rem' : '0' }}>
                    {fields.map(f => {
                        const isDisabled = readOnly || (f.disabledIfCurrent && entry.isCurrent);
                        return (
                            <div key={f.key} style={f.type === 'textarea' ? { gridColumn: '1 / -1' } : {}}>
                                <PremiumInput
                                    label={f.label} icon={f.icon} type={f.type || 'text'}
                                    value={f.type === 'date' ? formatDate(entry[f.key]) : (entry[f.key] || '')}
                                    onChange={e => onChange(f.key, e.target.value)}
                                    placeholder={`Enter ${f.label.toLowerCase()}...`}
                                    readOnly={isDisabled}
                                />
                            </div>
                        );
                    })}
                </div>

                {!isEdu && !readOnly && (
                    <div style={{ marginTop: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                            <input
                                type="checkbox" id={`current-${entry.title || Math.random()}`}
                                checked={!!entry.isCurrent}
                                onChange={(e) => {
                                    onChange('isCurrent', e.target.checked);
                                    if (e.target.checked) onChange('to', null);
                                }}
                                style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: THEME.accentPrimary, margin: 0 }}
                            />
                        </div>
                        <label htmlFor={`current-${entry.title || Math.random()}`} style={{ fontSize: '0.9rem', fontWeight: 500, color: '#475569', cursor: 'pointer', userSelect: 'none' }}>
                            I currently work here
                        </label>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

// ============================================================================
// MAIN ARCHITECTURE: PROFILE INTERFACE (Immutable Logic)
// ============================================================================

const Profile = () => {
    // ------------------------------------------------------------------------
    // ORIGINAL STATE & LOGIC PRESERVED 100%
    // ------------------------------------------------------------------------
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);
    const [newSkill, setNewSkill] = useState('');

    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await studentApi.getProfile();
                setProfile(res.data.data);
            } catch (err) { toast.error('Failed to load profile'); }
            setLoading(false);
        };
        fetch();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        setSaved(false);
        try {
            const cleanEducation = (profile.education || []).filter(e => e.institution && e.institution.trim());
            const cleanExperience = (profile.experience || []).filter(e => e.title && e.title.trim() && e.company && e.company.trim());

            await studentApi.updateProfile({
                education: cleanEducation, techStack: profile.techStack,
                experience: cleanExperience, bio: profile.bio, privacy: profile.privacy,
            });

            setProfile(prev => ({ ...prev, education: cleanEducation, experience: cleanExperience }));
            setSaving(false); setSaved(true); setHasChanges(false);
            toast.success('Profile saved successfully!');
            setTimeout(() => setSaved(false), 2000);
        } catch (err) {
            setSaving(false);
            toast.error(err.response?.data?.message || "Couldn't save changes. Please try again.");
        }
    };

    const updateField = (field, value) => { setProfile(prev => ({ ...prev, [field]: value })); setHasChanges(true); };

    const addSkill = () => {
        const skill = newSkill.trim();
        if (!skill || profile.techStack.includes(skill)) return;
        setProfile(prev => ({ ...prev, techStack: [...prev.techStack, skill] }));
        setNewSkill(''); setHasChanges(true);
    };

    const removeSkill = (skill) => { setProfile(prev => ({ ...prev, techStack: prev.techStack.filter(s => s !== skill) })); setHasChanges(true); };

    const addTimelineEntry = (type) => {
        const empty = type === 'education'
            ? { institution: '', degree: '', field: '', startYear: '', endYear: '', grade: '' }
            : { title: '', company: '', from: '', to: '', isCurrent: false, description: '' };
        setProfile(prev => ({ ...prev, [type]: [...(prev[type] || []), empty] })); setHasChanges(true);
    };

    const updateTimelineEntry = (type, index, key, value) => {
        setProfile(prev => {
            const arr = [...(prev[type] || [])];
            arr[index] = { ...arr[index], [key]: value };
            return { ...prev, [type]: arr };
        });
        setHasChanges(true);
    };

    const removeTimelineEntry = (type, index) => {
        setProfile(prev => {
            const arr = [...(prev[type] || [])];
            arr.splice(index, 1);
            return { ...prev, [type]: arr };
        });
        setHasChanges(true);
    };

    // ------------------------------------------------------------------------
    // RENDER LAYER (Antigravity Upgraded)
    // ------------------------------------------------------------------------

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#FAFAFA' }}>
                <motion.div animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: THEME.glassBase, backdropFilter: 'blur(10px)', border: `1px solid ${THEME.glassBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: THEME.shadowElevated }}>
                        <Activity size={24} color={THEME.accentPrimary} />
                    </div>
                </motion.div>
            </div>
        );
    }

    if (!profile) return <div style={{ padding: '4rem', textAlign: 'center' }}>System Error: Failed to load profile infrastructure.</div>;

    return (
        <div style={{ minHeight: '100vh', padding: 'clamp(1rem, 5vw, 4rem)', position: 'relative', maxWidth: '900px', margin: '0 auto', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
            <AmbientCanvas />

            {/* Cinematic Floating Header */}
            <motion.header
                initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={PHYSICS.spring}
                style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    flexWrap: 'wrap', gap: '1rem', marginBottom: 'clamp(1.5rem, 3vw, 3rem)', position: 'sticky', top: '1rem',
                    zIndex: 50, padding: '1rem 1.5rem', background: 'rgba(255,255,255,0.7)',
                    backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
                    borderRadius: '24px', border: '1px solid rgba(255,255,255,0.8)',
                    boxShadow: '0 10px 40px -10px rgba(0,0,0,0.08)'
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: 'linear-gradient(135deg, #EFF6FF, #DBEAFE)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #BFDBFE' }}>
                        <User size={24} color={THEME.accentPrimary} />
                    </div>
                    <div>
                        <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', margin: 0, letterSpacing: '-0.02em' }}>Identity Matrix</h1>
                        <p style={{ fontSize: '0.85rem', color: '#64748B', margin: 0 }}>Configure your professional topology.</p>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <DynamicIslandStatus saving={saving} saved={saved} />
                    <MagneticInteraction>
                        <motion.button
                            onClick={handleSave} disabled={saving || !hasChanges}
                            whileTap={{ scale: 0.95 }}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '0.5rem',
                                padding: '0.75rem 1.5rem', borderRadius: '14px',
                                background: hasChanges ? 'linear-gradient(135deg, #2563EB, #1D4ED8)' : '#E2E8F0',
                                color: hasChanges ? '#FFFFFF' : '#94A3B8',
                                border: 'none', fontWeight: 600, fontSize: '0.9rem',
                                cursor: hasChanges ? 'pointer' : 'not-allowed',
                                boxShadow: hasChanges ? '0 8px 20px -6px rgba(37,99,235,0.4)' : 'none',
                                transition: 'all 0.3s ease'
                            }}
                        >
                            <Save size={16} /> Update Matrix
                        </motion.button>
                    </MagneticInteraction>
                </div>
            </motion.header>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                {/* BIO SECTION */}
                <CinematicScene delay={0.1}>
                    <GlowSurface style={{ padding: 'clamp(1.5rem, 4vw, 2.5rem)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                            <div style={{ padding: '0.5rem', background: '#F1F5F9', borderRadius: '10px' }}><PenLine size={18} color={THEME.accentPrimary} /></div>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0F172A', margin: 0 }}>Executive Summary</h2>
                        </div>
                        <PremiumInput
                            type="textarea"
                            value={profile.bio || ''}
                            onChange={e => updateField('bio', e.target.value)}
                            placeholder="Architect your narrative..."
                        />
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: (profile.bio?.length || 0) > 1900 ? THEME.warning : '#94A3B8' }}>
                                {(profile.bio || '').length} / 2000
                            </span>
                        </div>
                    </GlowSurface>
                </CinematicScene>

                {/* SKILLS SECTION */}
                <CinematicScene delay={0.2}>
                    <GlowSurface style={{ padding: 'clamp(1.5rem, 4vw, 2.5rem)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                            <div style={{ padding: '0.5rem', background: '#F1F5F9', borderRadius: '10px' }}><Code size={18} color={THEME.accentPrimary} /></div>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0F172A', margin: 0 }}>Technical Topography</h2>
                        </div>

                        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
                            <div style={{ flex: 1 }}>
                                <PremiumInput
                                    value={newSkill} onChange={e => setNewSkill(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                                    placeholder="Input skill vector and initialize (Enter)"
                                />
                            </div>
                            <motion.button
                                onClick={addSkill} disabled={!newSkill.trim()}
                                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95 }}
                                style={{
                                    padding: '0 1.5rem', borderRadius: '12px', background: '#F8FAFC',
                                    border: '1px solid #E2E8F0', color: THEME.accentPrimary,
                                    fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem',
                                    cursor: newSkill.trim() ? 'pointer' : 'not-allowed', opacity: newSkill.trim() ? 1 : 0.5
                                }}
                            >
                                <Plus size={16} /> Inject
                            </motion.button>
                        </div>

                        <motion.div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', minHeight: '50px' }}>
                            <AnimatePresence>
                                {(profile.techStack || []).map((skill, i) => (
                                    <FluidSkillTag key={skill} skill={skill} onRemove={removeSkill} index={i} />
                                ))}
                            </AnimatePresence>
                            {(profile.techStack || []).length === 0 && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ width: '100%', padding: '2rem', textAlign: 'center', border: '1px dashed #CBD5E1', borderRadius: '16px', color: '#94A3B8', fontSize: '0.9rem' }}>
                                    System awaiting technical input array.
                                </motion.div>
                            )}
                        </motion.div>
                    </GlowSurface>
                </CinematicScene>

                {/* EDUCATION TIMELINE */}
                <CinematicScene delay={0.3}>
                    <GlowSurface style={{ padding: 'clamp(1.5rem, 4vw, 2.5rem)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div style={{ padding: '0.5rem', background: '#F1F5F9', borderRadius: '10px' }}><GraduationCap size={18} color={THEME.accentPrimary} /></div>
                                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0F172A', margin: 0 }}>Academic History</h2>
                            </div>
                            <MagneticInteraction strength={10}>
                                <motion.button onClick={() => addTimelineEntry('education')} whileTap={{ scale: 0.9 }} style={{ padding: '0.5rem 1rem', borderRadius: '10px', background: '#EFF6FF', color: THEME.accentPrimary, border: 'none', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
                                    <Plus size={14} /> Append Record
                                </motion.button>
                            </MagneticInteraction>
                        </div>

                        <div style={{ position: 'relative', paddingLeft: '2rem' }}>
                            {/* Glowing Timeline Line */}
                            <div style={{ position: 'absolute', left: '0', top: '1rem', bottom: '1rem', width: '2px', background: 'linear-gradient(to bottom, #DBEAFE, transparent)' }} />

                            <AnimatePresence>
                                {(profile.education || []).map((edu, i) => (
                                    <div key={i} style={{ position: 'relative', marginBottom: '2rem' }}>
                                        {/* Timeline Dot */}
                                        <div style={{ position: 'absolute', left: '-2.35rem', top: '1.5rem', width: '14px', height: '14px', borderRadius: '50%', background: THEME.accentPrimary, border: '3px solid #FFFFFF', boxShadow: '0 0 0 4px #EFF6FF' }} />
                                        <TimelineEntryForm
                                            entry={edu} onChange={(k, v) => updateTimelineEntry('education', i, k, v)}
                                            onRemove={() => removeTimelineEntry('education', i)} type="education" readOnly={!!edu.isPrimary}
                                        />
                                    </div>
                                ))}
                            </AnimatePresence>

                            {(profile.education || []).length === 0 && (
                                <div style={{ padding: '2rem', textAlign: 'center', color: '#94A3B8', fontSize: '0.9rem', fontStyle: 'italic' }}>No academic records found in database.</div>
                            )}
                        </div>
                    </GlowSurface>
                </CinematicScene>

                {/* EXPERIENCE TIMELINE */}
                <CinematicScene delay={0.4}>
                    <GlowSurface style={{ padding: 'clamp(1.5rem, 4vw, 2.5rem)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div style={{ padding: '0.5rem', background: '#F1F5F9', borderRadius: '10px' }}><Briefcase size={18} color={THEME.accentPrimary} /></div>
                                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0F172A', margin: 0 }}>Operational Deployments</h2>
                            </div>
                            <MagneticInteraction strength={10}>
                                <motion.button onClick={() => addTimelineEntry('experience')} whileTap={{ scale: 0.9 }} style={{ padding: '0.5rem 1rem', borderRadius: '10px', background: '#EFF6FF', color: THEME.accentPrimary, border: 'none', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
                                    <Plus size={14} /> Append Record
                                </motion.button>
                            </MagneticInteraction>
                        </div>

                        <div style={{ position: 'relative', paddingLeft: '2rem' }}>
                            <div style={{ position: 'absolute', left: '0', top: '1rem', bottom: '1rem', width: '2px', background: 'linear-gradient(to bottom, #DBEAFE, transparent)' }} />

                            <AnimatePresence>
                                {(profile.experience || []).map((exp, i) => (
                                    <div key={i} style={{ position: 'relative', marginBottom: '2rem' }}>
                                        <div style={{ position: 'absolute', left: '-2.35rem', top: '1.5rem', width: '14px', height: '14px', borderRadius: '50%', background: THEME.accentPrimary, border: '3px solid #FFFFFF', boxShadow: '0 0 0 4px #EFF6FF' }} />
                                        <TimelineEntryForm
                                            entry={exp} onChange={(k, v) => updateTimelineEntry('experience', i, k, v)}
                                            onRemove={() => removeTimelineEntry('experience', i)} type="experience"
                                        />
                                    </div>
                                ))}
                            </AnimatePresence>

                            {(profile.experience || []).length === 0 && (
                                <div style={{ padding: '2rem', textAlign: 'center', color: '#94A3B8', fontSize: '0.9rem', fontStyle: 'italic' }}>No operational records found.</div>
                            )}
                        </div>
                    </GlowSurface>
                </CinematicScene>

                {/* PRIVACY SHIELD */}
                <CinematicScene delay={0.5}>
                    <GlowSurface style={{ padding: 'clamp(1.5rem, 4vw, 2.5rem)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                            <div style={{ padding: '0.5rem', background: '#F1F5F9', borderRadius: '10px' }}><Shield size={18} color={THEME.accentPrimary} /></div>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0F172A', margin: 0 }}>Security & Visibility</h2>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {[
                                { key: 'publicProfile', label: 'Network Broadcasting', desc: 'Permit global access to identity profile' },
                                { key: 'portfolioPublic', label: 'Asset Exposure', desc: 'Permit global access to portfolio artifacts' }
                            ].map(item => {
                                const isActive = profile.privacy?.[item.key];
                                return (
                                    <motion.label
                                        key={item.key} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 1.5rem', background: '#F8FAFC', borderRadius: '16px', border: '1px solid #E2E8F0', cursor: 'pointer' }}
                                    >
                                        <div style={{ paddingRight: '1rem' }}>
                                            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.2rem' }}>{item.label}</div>
                                            <div style={{ fontSize: '0.85rem', color: '#64748B' }}>{item.desc}</div>
                                        </div>

                                        <div onClick={() => updateField('privacy', { ...profile.privacy, [item.key]: !isActive })}
                                            style={{
                                                width: '52px', height: '28px', borderRadius: '14px',
                                                background: isActive ? THEME.success : '#CBD5E1',
                                                position: 'relative', cursor: 'pointer', transition: 'background 0.3s ease',
                                                boxShadow: isActive ? 'inset 0 2px 4px rgba(0,0,0,0.1)' : 'inset 0 2px 4px rgba(0,0,0,0.1)'
                                            }}
                                        >
                                            <motion.div
                                                animate={{ x: isActive ? 26 : 2 }}
                                                transition={PHYSICS.snappy}
                                                style={{
                                                    width: '24px', height: '24px', borderRadius: '50%', background: '#FFFFFF',
                                                    position: 'absolute', top: '2px', boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
                                                }}
                                            />
                                        </div>
                                    </motion.label>
                                );
                            })}
                        </div>
                    </GlowSurface>
                </CinematicScene>
            </div>
        </div>
    );
};

export default Profile;