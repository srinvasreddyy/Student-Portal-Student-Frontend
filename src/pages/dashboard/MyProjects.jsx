import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
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
import { projectApi } from '../../services/api';
import { toast } from '../../components/Toast';
import {
    Briefcase, Clock, Users, CheckCircle, XCircle, ArrowRight,
    Send, X, Sparkles, Activity
} from 'lucide-react';

// ============================================================================
// MOTION PHYSICS & TOKENS (Antigravity System)
// ============================================================================
const PHYSICS = {
    spring: { type: "spring", stiffness: 400, damping: 30, mass: 0.8 },
    float: { type: "spring", stiffness: 100, damping: 20, mass: 1 },
    smooth: { type: "tween", ease: [0.16, 1, 0.3, 1], duration: 0.7 }
};

const THEME = {
    glassBase: 'rgba(255, 255, 255, 0.65)',
    glassBorder: 'rgba(255, 255, 255, 0.8)',
    shadowAmbient: '0 8px 32px -8px rgba(15, 23, 42, 0.08)',
    shadowElevated: '0 24px 48px -12px rgba(15, 23, 42, 0.15)',
    accentBlue: '#2563EB',
    jadeGreen: '#10B981',
    amber: '#F59E0B'
};

// ============================================================================
// CORE ABSTRACTIONS & REUSABLE COMPONENTS
// ============================================================================

const AmbientCanvas = () => {
    const { scrollYProgress } = useScroll();
    const y1 = useTransform(scrollYProgress, [0, 1], [0, 300]);
    const y2 = useTransform(scrollYProgress, [0, 1], [0, -200]);

    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: -1, overflow: 'hidden', background: '#FAFAFA', pointerEvents: 'none' }}>
            <motion.div style={{
                position: 'absolute', top: '-10%', left: '-10%', width: '50vw', height: '50vw',
                background: 'radial-gradient(circle, rgba(37,99,235,0.04) 0%, transparent 70%)',
                filter: 'blur(80px)', y: y1
            }} />
            <motion.div style={{
                position: 'absolute', bottom: '-20%', right: '-10%', width: '60vw', height: '60vw',
                background: 'radial-gradient(circle, rgba(16,185,129,0.03) 0%, transparent 70%)',
                filter: 'blur(100px)', y: y2
            }} />
        </div>
    );
};

const CinematicScene = ({ children, delay = 0, direction = 'up' }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-10%" });
    const yOffset = direction === 'up' ? 30 : direction === 'down' ? -30 : 0;
    const xOffset = direction === 'left' ? 30 : direction === 'right' ? -30 : 0;

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: yOffset, x: xOffset, filter: 'blur(8px)' }}
            animate={isInView ? { opacity: 1, y: 0, x: 0, filter: 'blur(0px)' } : {}}
            transition={{ ...PHYSICS.smooth, delay }}
            style={{ width: '100%' }}
        >
            {children}
        </motion.div>
    );
};

const GlowSurface = ({ children, onClick, activeGlow, style, className }) => {
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
            onClick={onClick}
            whileHover={{ y: -4, scale: 1.01 }}
            whileTap={onClick ? { scale: 0.98 } : {}}
            transition={PHYSICS.spring}
            style={{
                position: 'relative',
                background: THEME.glassBase,
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: `1px solid ${THEME.glassBorder}`,
                borderRadius: '24px',
                boxShadow: THEME.shadowAmbient,
                overflow: 'hidden',
                cursor: onClick ? 'pointer' : 'default',
                ...style
            }}
            className={className}
        >
            <motion.div
                style={{
                    position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none',
                    background: useMotionTemplate`radial-gradient(400px circle at ${mouseX}px ${mouseY}px, ${activeGlow || 'rgba(255,255,255,0.4)'}, transparent 80%)`,
                    opacity: 0, transition: 'opacity 0.3s ease'
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

const StatusPulse = ({ color }) => (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <motion.div
            animate={{ scale: [1, 1.8, 1], opacity: [0.4, 0, 0.4] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            style={{ position: 'absolute', width: '12px', height: '12px', borderRadius: '50%', background: color }}
        />
        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: color, zIndex: 1, boxShadow: `0 0 10px ${color}` }} />
    </div>
);

// ============================================================================
// DOMAIN COMPONENTS
// ============================================================================

const StatWidget = ({ icon: Icon, label, count, color, bg, delay }) => (
    <CinematicScene delay={delay}>
        <GlowSurface activeGlow={bg} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ ...PHYSICS.spring, delay: delay + 0.2 }}
                style={{ width: '48px', height: '48px', borderRadius: '16px', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}
            >
                <Icon size={22} color={color} />
            </motion.div>
            <motion.div
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: delay + 0.3 }}
                style={{ fontSize: '2.5rem', fontWeight: 800, color: '#0F172A', lineHeight: 1, letterSpacing: '-0.03em' }}
            >
                {count}
            </motion.div>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '0.5rem' }}>
                {label}
            </div>
        </GlowSurface>
    </CinematicScene>
);

const ActiveProjectHero = ({ project, onClick, index }) => (
    <CinematicScene delay={index * 0.1}>
        <GlowSurface
            onClick={() => onClick(project)}
            activeGlow="rgba(16, 185, 129, 0.15)"
            style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', borderLeft: `4px solid ${THEME.jadeGreen}` }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <StatusPulse color={THEME.jadeGreen} />
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: THEME.jadeGreen, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Active Operation</span>
                    </div>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0F172A', margin: 0 }}>{project.title}</h3>
                </div>
                <motion.div whileHover={{ x: 5 }} transition={PHYSICS.spring} style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #E2E8F0' }}>
                    <ArrowRight size={18} color="#64748B" />
                </motion.div>
            </div>

            <p style={{ fontSize: '0.95rem', color: '#475569', lineHeight: 1.6, margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {project.description}
            </p>

            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
                {project.techStack?.slice(0, 4).map((tech, i) => (
                    <span key={i} style={{ padding: '0.4rem 0.8rem', background: '#F1F5F9', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 600, color: '#334155' }}>
                        {tech}
                    </span>
                ))}
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.4rem 0.8rem', background: '#F8FAFC', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 600, color: '#64748B', border: '1px solid #E2E8F0' }}>
                    <Clock size={12} /> {project.durationInWeeks} Weeks
                </span>
            </div>
        </GlowSurface>
    </CinematicScene>
);

const PendingProjectStrip = ({ project, withdrawing, onWithdraw, index }) => (
    <CinematicScene delay={index * 0.05} direction="left">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', padding: '1.25rem', background: THEME.glassBase, backdropFilter: 'blur(20px)', borderRadius: '16px', border: `1px solid ${THEME.glassBorder}`, boxShadow: THEME.shadowAmbient }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#FFFBEB', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1px solid #FEF3C7' }}>
                <Send size={20} color={THEME.amber} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#0F172A', margin: '0 0 0.25rem 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{project.title}</h4>
                <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: '#64748B', fontWeight: 500 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Users size={12} /> {project.maxStudentsRequired} Spots</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Clock size={12} /> {project.durationInWeeks}W</span>
                </div>
            </div>
            <motion.button
                whileHover={{ scale: 1.05, backgroundColor: '#FEE2E2' }}
                whileTap={{ scale: 0.95 }}
                disabled={withdrawing === project._id}
                onClick={() => onWithdraw(project._id)}
                style={{ padding: '0.6rem 1rem', background: '#FEF2F2', color: '#EF4444', border: '1px solid #FECACA', borderRadius: '10px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', transition: 'background 0.2s' }}
            >
                {withdrawing === project._id ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} style={{ width: '14px', height: '14px', border: '2px solid #EF4444', borderTopColor: 'transparent', borderRadius: '50%' }} /> : <><XCircle size={14} /> Withdraw</>}
            </motion.button>
        </div>
    </CinematicScene>
);

// ============================================================================
// MAIN PAGE COMPONENT (Preserved Logic & State)
// ============================================================================

const MyProjects = () => {
    // ------------------------------------------------------------------------
    // EXACT ORIGINAL STATE & LOGIC (Immutable Directive)
    // ------------------------------------------------------------------------
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [withdrawing, setWithdrawing] = useState(null);
    const [selectedProject, setSelectedProject] = useState(null);

    const fetchMyProjects = async () => {
        setLoading(true);
        try {
            const acceptedRes = await projectApi.getMyProjects();
            const acceptedProjects = acceptedRes.data.data || [];

            const allRes = await projectApi.list({ page: 1, limit: 100 });
            const allProjects = allRes.data.data || [];

            const userStr = localStorage.getItem('user');
            const userId = userStr ? JSON.parse(userStr).id : null;

            const appliedProjects = allProjects.filter(p =>
                (p.appliedStudents || []).some(a => (a.studentRef?._id || a.studentRef) === userId) &&
                !acceptedProjects.some(ap => ap._id === p._id)
            );

            const categorized = [
                ...acceptedProjects.filter(p => ['open', 'in_progress'].includes(p.status)).map(p => ({ ...p, _category: 'active' })),
                ...acceptedProjects.filter(p => p.status === 'completed').map(p => ({ ...p, _category: 'completed' })),
                ...appliedProjects.map(p => ({ ...p, _category: 'pending' })),
                ...acceptedProjects.filter(p => !['open', 'in_progress', 'completed'].includes(p.status)).map(p => ({ ...p, _category: 'other' })),
            ];

            setProjects(categorized);
        } catch {
            toast.error('Failed to load your projects');
        }
        setLoading(false);
    };

    useEffect(() => { fetchMyProjects(); }, []);

    const handleWithdraw = async (projectId) => {
        if (!window.confirm('Are you sure you want to withdraw your application?')) return;
        setWithdrawing(projectId);
        try {
            await projectApi.withdraw(projectId);
            toast.success('Application withdrawn');
            setProjects(prev => prev.filter(p => !(p._id === projectId && p._category === 'pending')));
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to withdraw');
        }
        setWithdrawing(null);
    };

    const activeProjects = projects.filter(p => p._category === 'active');
    const pendingProjects = projects.filter(p => p._category === 'pending');
    const completedProjects = projects.filter(p => p._category === 'completed');

    // ------------------------------------------------------------------------
    // ANTIGRAVITY RENDER LAYER
    // ------------------------------------------------------------------------

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#FAFAFA' }}>
                <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}
                >
                    <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: THEME.glassBase, backdropFilter: 'blur(10px)', border: `1px solid ${THEME.glassBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: THEME.shadowElevated }}>
                        <Activity size={24} color={THEME.accentBlue} />
                    </div>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748B', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Synchronizing Data...</span>
                </motion.div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', padding: 'clamp(1rem, 5vw, 4rem)', position: 'relative', maxWidth: '1200px', margin: '0 auto', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
            <AmbientCanvas />

            {/* Cinematic Header */}
            <CinematicScene direction="down">
                <header style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '3rem' }}>
                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={PHYSICS.spring} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: '#EFF6FF', color: THEME.accentBlue, borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', width: 'max-content' }}>
                        <Briefcase size={14} /> Workspace Setup
                    </motion.div>
                    <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 3.5rem)', fontWeight: 800, color: '#0F172A', margin: 0, letterSpacing: '-0.04em', lineHeight: 1.1 }}>
                        Mission Control
                    </h1>
                    <p style={{ fontSize: '1.1rem', color: '#64748B', maxWidth: '500px', margin: 0, lineHeight: 1.6 }}>
                        Monitor your operational cadence, track application statuses, and manage active deployments.
                    </p>
                </header>
            </CinematicScene>

            {/* Orchestrated Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(220px, 100%), 1fr))', gap: '1.5rem', marginBottom: '4rem' }}>
                <StatWidget label="Active Operations" count={activeProjects.length} color={THEME.jadeGreen} bg="rgba(16, 185, 129, 0.1)" icon={Activity} delay={0.1} />
                <StatWidget label="Pending Signals" count={pendingProjects.length} color={THEME.amber} bg="rgba(245, 158, 11, 0.1)" icon={Clock} delay={0.2} />
                <StatWidget label="Archived Intel" count={completedProjects.length} color={THEME.accentBlue} bg="rgba(37, 99, 235, 0.1)" icon={CheckCircle} delay={0.3} />
            </div>

            {/* Layout Composition Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '3rem', lg: { gridTemplateColumns: '2fr 1fr' } }}>

                {/* Main Content Column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
                    {activeProjects.length > 0 && (
                        <section>
                            <CinematicScene>
                                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                                    <Sparkles size={20} color={THEME.jadeGreen} /> Priority Deployments
                                </h2>
                            </CinematicScene>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                {activeProjects.map((project, i) => (
                                    <ActiveProjectHero key={project._id} project={project} index={i} onClick={setSelectedProject} />
                                ))}
                            </div>
                        </section>
                    )}

                    {pendingProjects.length > 0 && (
                        <section>
                            <CinematicScene>
                                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                                    <Clock size={20} color={THEME.amber} /> In Transit
                                </h2>
                            </CinematicScene>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {pendingProjects.map((project, i) => (
                                    <PendingProjectStrip key={project._id} project={project} withdrawing={withdrawing} onWithdraw={handleWithdraw} index={i} />
                                ))}
                            </div>
                        </section>
                    )}
                </div>

                {/* Secondary Content Column */}
                <div>
                    {completedProjects.length > 0 && (
                        <section>
                            <CinematicScene delay={0.4}>
                                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                                    <CheckCircle size={20} color={THEME.accentBlue} /> Archive
                                </h2>
                            </CinematicScene>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(250px, 100%), 1fr))', gap: '1rem' }}>
                                {completedProjects.map((project, i) => (
                                    <CinematicScene key={project._id} delay={0.5 + (i * 0.05)}>
                                        <GlowSurface style={{ padding: '1.25rem', opacity: 0.9 }}>
                                            <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#0F172A', marginBottom: '0.5rem' }}>{project.title}</h4>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <span style={{ padding: '0.25rem 0.5rem', background: '#F1F5F9', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 600, color: '#475569' }}>Completed</span>
                                                <span style={{ fontSize: '0.75rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '0.2rem' }}><Clock size={10} /> {project.durationInWeeks}w</span>
                                            </div>
                                        </GlowSurface>
                                    </CinematicScene>
                                ))}
                            </div>
                        </section>
                    )}
                </div>
            </div>

            {/* Zero State Fallback */}
            {projects.length === 0 && (
                <CinematicScene delay={0.4}>
                    <div style={{ padding: '4rem 2rem', textAlign: 'center', background: THEME.glassBase, backdropFilter: 'blur(20px)', borderRadius: '24px', border: `1px dashed #CBD5E1`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)' }}>
                            <Briefcase size={28} color="#94A3B8" />
                        </div>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.5rem' }}>Awaiting Directive</h3>
                        <p style={{ color: '#64748B', maxWidth: '400px', lineHeight: 1.6 }}>Navigate to the Discover portal to initialize your first structural deployment.</p>
                    </div>
                </CinematicScene>
            )}

            {/* Dynamic Island Detail Morph (Modal) */}
            <AnimatePresence>
                {selectedProject && createPortal(
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        onClick={() => setSelectedProject(null)}
                        style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: 40, opacity: 0, filter: 'blur(10px)' }}
                            animate={{ scale: 1, y: 0, opacity: 1, filter: 'blur(0px)' }}
                            exit={{ scale: 0.95, y: 20, opacity: 0, filter: 'blur(10px)' }}
                            transition={PHYSICS.spring}
                            style={{ width: '100%', maxWidth: '640px', maxHeight: '85vh', overflowY: 'auto', background: '#FFFFFF', borderRadius: '24px', padding: 'clamp(1.5rem, 5vw, 3rem)', position: 'relative', boxShadow: THEME.shadowElevated, border: '1px solid rgba(255,255,255,0.5)' }}
                        >
                            <motion.button
                                whileHover={{ scale: 1.1, rotate: 90 }} whileTap={{ scale: 0.9 }} transition={PHYSICS.spring}
                                onClick={() => setSelectedProject(null)}
                                style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', width: '36px', height: '36px', borderRadius: '50%', background: '#F1F5F9', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#475569' }}
                            >
                                <X size={18} />
                            </motion.button>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: selectedProject._category === 'active' ? THEME.jadeGreen : selectedProject._category === 'pending' ? THEME.amber : THEME.accentBlue }} />
                                <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748B' }}>
                                    System Status: {selectedProject._category}
                                </span>
                            </div>

                            <h2 style={{ fontSize: 'clamp(1.5rem, 5vw, 2rem)', fontWeight: 800, color: '#0F172A', marginBottom: '1rem', lineHeight: 1.2, letterSpacing: '-0.02em' }}>{selectedProject.title}</h2>
                            <p style={{ fontSize: '1.05rem', color: '#475569', lineHeight: 1.8, marginBottom: '2rem' }}>{selectedProject.description}</p>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(200px, 100%), 1fr))', gap: '2rem' }}>
                                {selectedProject.roles?.length > 0 && (
                                    <div>
                                        <h5 style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: '#94A3B8', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>Assigned Directives</h5>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                            {selectedProject.roles.map((r, i) => <span key={i} style={{ padding: '0.5rem 1rem', background: '#EFF6FF', color: THEME.accentBlue, borderRadius: '10px', fontSize: '0.85rem', fontWeight: 600 }}>{r}</span>)}
                                        </div>
                                    </div>
                                )}

                                {selectedProject.techStack?.length > 0 && (
                                    <div>
                                        <h5 style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: '#94A3B8', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>Infrastructure</h5>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                            {selectedProject.techStack.map((t, i) => <span key={i} style={{ padding: '0.5rem 1rem', background: '#F8FAFC', color: '#334155', border: '1px solid #E2E8F0', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 600 }}>{t}</span>)}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div style={{ marginTop: '2.5rem', paddingTop: '2rem', borderTop: '1px solid #F1F5F9', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.25rem', background: '#F8FAFC', borderRadius: '12px', color: '#475569', fontWeight: 600, fontSize: '0.9rem' }}><Users size={16} color={THEME.accentBlue} /> {selectedProject.maxStudentsRequired} Capacity</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.25rem', background: '#F8FAFC', borderRadius: '12px', color: '#475569', fontWeight: 600, fontSize: '0.9rem' }}><Clock size={16} color={THEME.amber} /> {selectedProject.durationInWeeks} Weeks Lifecycle</div>
                            </div>
                        </motion.div>
                    </motion.div>
                    , document.body)}
            </AnimatePresence>
        </div >
    );
};

export default MyProjects;