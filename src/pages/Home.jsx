import React, { useEffect, useRef, useState } from 'react';
import {
    motion,
    useScroll,
    useTransform,
    AnimatePresence,
    useSpring,
    useInView,
    useMotionValue,
    useMotionTemplate
} from 'framer-motion';
import { Link } from 'react-router-dom';
import {
    ArrowRight, Sparkles, Target, Globe, Users, Code,
    Briefcase, Award, Zap, ChevronRight, PlayCircle,
    CheckCircle2, Star, Quote, ArrowUpRight, ShieldCheck,
    Cpu, LineChart, Layers
} from 'lucide-react';

// ============================================================================
// 1. DATA & CONFIGURATION (Immutable)
// ============================================================================

const FEATURES_DATA = [
    { id: 1, title: "Algorithmic Portfolio Matching", desc: "Our AI analyzes your uploaded projects and tech stack to instantly match you with universities and companies seeking your specific skill profile.", icon: <Cpu size={28} strokeWidth={1.5} />, color: "#0ea5e9", bg: "rgba(14, 165, 233, 0.05)" },
    { id: 2, title: "Global Visibility Network", desc: "Break geographical barriers. Your digital proof-of-work is put directly in front of global recruiters actively scouting for fresh, verified talent.", icon: <Globe size={28} strokeWidth={1.5} />, color: "#2563eb", bg: "rgba(37, 99, 235, 0.05)" },
    { id: 3, title: "Direct Industry Outreach", desc: "Skip the generic application queue. Receive direct interview requests and recruitment emails straight from companies who love your portfolio.", icon: <Target size={28} strokeWidth={1.5} />, color: "#0284c7", bg: "rgba(2, 132, 199, 0.05)" },
    { id: 4, title: "Verified Proof of Work", desc: "Upload assignments, source code, and live apps. Let your tangible creations speak for your expertise far louder than a traditional paper resume.", icon: <Briefcase size={28} strokeWidth={1.5} />, color: "#3b82f6", bg: "rgba(59, 130, 246, 0.05)" },
    { id: 5, title: "Real-time Skill Analytics", desc: "Track how your skills align with current market demands. Get intelligent suggestions on which technologies to learn next to boost your employability.", icon: <LineChart size={28} strokeWidth={1.5} />, color: "#0369a1", bg: "rgba(3, 105, 161, 0.05)" },
    { id: 6, title: "Secure Enterprise Infrastructure", desc: "Bank-grade security ensures your intellectual property, personal data, and academic records remain entirely under your control and protected.", icon: <ShieldCheck size={28} strokeWidth={1.5} />, color: "#0c4a6e", bg: "rgba(12, 74, 110, 0.05)" }
];

const TIMELINE_DATA = [
    { step: "01", title: "Create Your Digital Identity", desc: "Sign up and build a comprehensive profile detailing your academic journey, preferred roles, and core technical skills." },
    { step: "02", title: "Upload & Showcase", desc: "Add your best projects, research papers, and code repositories. Transform your academic work into a professional portfolio." },
    { step: "03", title: "Get Discovered", desc: "Our matching engine highlights your profile to universities and companies searching for your exact skill set." },
    { step: "04", title: "Accelerate Your Career", desc: "Receive direct messages, interview invites, and acceptance letters straight through your secure dashboard." }
];

const STATS_DATA = [
    { value: "50K+", label: "Active Students" },
    { value: "1,200+", label: "Partner Companies" },
    { value: "300+", label: "Top Universities" },
    { value: "94%", label: "Placement Rate" }
];

// ============================================================================
// 2. MOTION PHYSICS & THEME TOKENS (Antigravity System)
// ============================================================================

const PHYSICS = {
    spring: { type: "spring", stiffness: 300, damping: 30, mass: 0.8 },
    snappy: { type: "spring", stiffness: 400, damping: 25, mass: 0.5 },
    float: { type: "spring", stiffness: 100, damping: 20, mass: 1 },
    smooth: { type: "tween", ease: [0.16, 1, 0.3, 1], duration: 0.8 }
};

const THEME = {
    glassBase: 'rgba(255, 255, 255, 0.65)',
    glassDeep: 'rgba(255, 255, 255, 0.85)',
    glassBorder: 'rgba(255, 255, 255, 0.9)',
    shadowAmbient: '0 8px 32px -8px rgba(15, 23, 42, 0.06)',
    shadowElevated: '0 24px 48px -12px rgba(14, 165, 233, 0.15)',
    accentBlue: '#0ea5e9',
    accentAzure: '#3b82f6',
    textMain: '#0f172a',
    textMuted: '#64748b'
};

const globalStyles = `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Outfit:wght@300;400;500;600;700;800;900&display=swap');
        body { margin: 0; padding: 0; font-family: 'Inter', sans-serif; background: #ffffff; color: ${THEME.textMain}; overflow-x: hidden; }
        .outfit-font { font-family: 'Outfit', sans-serif; }
        .text-gradient { background: linear-gradient(135deg, ${THEME.accentBlue}, ${THEME.accentAzure}); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: #f8fafc; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 8px; }
        ::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
    `;

// ============================================================================
// 3. CORE MOTION ABSTRACTIONS
// ============================================================================

const AmbientCanvas = () => {
    const { scrollYProgress } = useScroll();
    const y1 = useTransform(scrollYProgress, [0, 1], [0, 500]);
    const y2 = useTransform(scrollYProgress, [0, 1], [0, -400]);
    const scale = useTransform(scrollYProgress, [0, 1], [1, 1.2]);

    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: -1, overflow: 'hidden', pointerEvents: 'none' }}>
            <motion.div style={{
                position: 'absolute', top: '-20%', left: '-10%', width: '60vw', height: '60vw',
                background: 'radial-gradient(circle, rgba(14,165,233,0.04) 0%, transparent 60%)',
                filter: 'blur(100px)', y: y1, scale
            }} />
            <motion.div style={{
                position: 'absolute', bottom: '-20%', right: '-10%', width: '70vw', height: '70vw',
                background: 'radial-gradient(circle, rgba(59,130,246,0.03) 0%, transparent 60%)',
                filter: 'blur(120px)', y: y2
            }} />
        </div>
    );
};

const CinematicScene = ({ children, delay = 0, direction = 'up', stagger = false }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-10%" });
    const yOffset = direction === 'up' ? 50 : direction === 'down' ? -50 : 0;

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: yOffset, filter: 'blur(12px)' }}
            animate={isInView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
            transition={{ ...PHYSICS.smooth, delay }}
            style={{ width: '100%', position: 'relative' }}
        >
            {children}
        </motion.div>
    );
};

const MagneticAction = ({ children, strength = 30 }) => {
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
        <motion.div ref={ref} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} style={{ x: springX, y: springY, display: 'inline-block' }}>
            {children}
        </motion.div>
    );
};

const GlowSurface = ({ children, style, className, depth = 1 }) => {
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
            whileHover={{ y: -4, scale: 1.01 }}
            transition={PHYSICS.spring}
            style={{
                position: 'relative',
                background: depth === 2 ? THEME.glassDeep : THEME.glassBase,
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                border: `1px solid ${THEME.glassBorder}`,
                borderRadius: '24px',
                boxShadow: depth === 2 ? THEME.shadowElevated : THEME.shadowAmbient,
                overflow: 'hidden',
                ...style
            }}
            className={className}
        >
            <motion.div
                style={{
                    position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none',
                    background: useMotionTemplate`radial-gradient(400px circle at ${mouseX}px ${mouseY}px, rgba(255,255,255,0.8), transparent 80%)`,
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

// ============================================================================
// 4. DOMAIN COMPONENTS (Rewritten for Antigravity standard)
// ============================================================================

const Navbar = () => {
    const { scrollY } = useScroll();
    const [scrolled, setScrolled] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        return scrollY.onChange((latest) => setScrolled(latest > 50));
    }, [scrollY]);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <motion.nav
            initial={{ y: -100 }} animate={{ y: 0 }} transition={PHYSICS.spring}
            style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, display: 'flex', justifyContent: 'center', padding: isMobile ? '1rem 4%' : '1.5rem 5%', pointerEvents: 'none' }}
        >
            <motion.div
                layout
                transition={PHYSICS.spring}
                style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    width: '100%', maxWidth: '1400px',
                    padding: scrolled ? '0.75rem 1.5rem' : '0 0',
                    background: scrolled ? THEME.glassDeep : 'transparent',
                    backdropFilter: scrolled ? 'blur(24px)' : 'none',
                    border: scrolled ? `1px solid ${THEME.glassBorder}` : '1px solid transparent',
                    borderRadius: scrolled ? '999px' : '0px',
                    boxShadow: scrolled ? THEME.shadowElevated : 'none',
                    pointerEvents: 'auto'
                }}
            >
                <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
                    <motion.div whileHover={{ rotate: 15 }} transition={PHYSICS.snappy} style={{ background: `linear-gradient(135deg, ${THEME.accentBlue}, ${THEME.accentAzure})`, padding: '0.6rem', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Sparkles size={isMobile ? 16 : 20} color="#ffffff" />
                    </motion.div>
                    <span className="outfit-font" style={{ fontWeight: 800, fontSize: isMobile ? '1.1rem' : '1.4rem', color: THEME.textMain, letterSpacing: '-0.02em' }}>
                        Student<span style={{ color: THEME.accentBlue }}>Connect</span>
                    </span>
                </Link>

                <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '0.75rem' : '1.5rem' }}>
                    {!isMobile && (
                        <Link to="/login" style={{ color: THEME.textMuted, textDecoration: 'none', fontWeight: 600, fontSize: '0.95rem', transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color = THEME.accentBlue} onMouseLeave={e => e.target.style.color = THEME.textMuted}>
                            Sign In
                        </Link>
                    )}
                    <MagneticAction strength={20}>
                        <Link to="/register" style={{ padding: isMobile ? '0.6rem 1.2rem' : '0.75rem 1.5rem', borderRadius: '999px', background: THEME.textMain, color: '#ffffff', textDecoration: 'none', fontWeight: 600, fontSize: isMobile ? '0.85rem' : '0.95rem', display: 'block', transition: 'background 0.3s' }} onMouseEnter={e => e.target.style.background = THEME.accentBlue} onMouseLeave={e => e.target.style.background = THEME.textMain}>
                            Get Started
                        </Link>
                    </MagneticAction>
                </div>
            </motion.div>
        </motion.nav>
    );
};

const HeroSection = () => {
    // Spatial 3D effect driven by mouse
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const rotateX = useTransform(y, [-500, 500], [5, -5]);
    const rotateY = useTransform(x, [-500, 500], [-5, 5]);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleMouseMove = (e) => {
        if (isMobile) return;
        x.set(e.clientX - window.innerWidth / 2);
        y.set(e.clientY - window.innerHeight / 2);
    };

    return (
        <div onMouseMove={handleMouseMove} style={{ minHeight: isMobile ? 'auto' : '100vh', display: 'flex', alignItems: 'center', paddingTop: isMobile ? '100px' : '80px', paddingBottom: isMobile ? '3rem' : 0, position: 'relative', overflow: 'hidden', perspective: '1000px' }}>
            <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 5%', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? '2rem' : '4rem', alignItems: 'center' }}>

                {/* Left Typography */}
                <div style={{ zIndex: 10 }}>
                    <CinematicScene delay={0.1}>
                        <motion.div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '999px', marginBottom: '2rem' }}>
                            <Zap size={14} color={THEME.accentBlue} fill={THEME.accentBlue} />
                            <span style={{ color: '#0284c7', fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>The New Standard for Talent</span>
                        </motion.div>
                    </CinematicScene>

                    <CinematicScene delay={0.2}>
                        <h1 className="outfit-font" style={{ fontSize: 'clamp(3.5rem, 6vw, 5rem)', fontWeight: 900, lineHeight: 1.05, color: THEME.textMain, marginBottom: '1.5rem', letterSpacing: '-0.03em' }}>
                            Where Academia Meets <br />
                            <span className="text-gradient">Industry Innovation.</span>
                        </h1>
                    </CinematicScene>

                    <CinematicScene delay={0.3}>
                        <p style={{ fontSize: '1.15rem', color: THEME.textMuted, lineHeight: 1.7, marginBottom: '2.5rem', maxWidth: '90%' }}>
                            Transform your academic projects into a verified professional portfolio. StudentConnect intelligently bridges the gap between top-tier students, prestigious universities, and enterprise companies.
                        </p>
                    </CinematicScene>

                    <CinematicScene delay={0.4}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap' }}>
                            <MagneticAction strength={15}>
                                <Link to="/register" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '1.1rem 2.5rem', borderRadius: '16px', background: `linear-gradient(135deg, ${THEME.accentBlue}, ${THEME.accentAzure})`, color: '#ffffff', textDecoration: 'none', fontWeight: 600, fontSize: '1.1rem', boxShadow: '0 20px 40px -10px rgba(14, 165, 233, 0.4)' }}>
                                    Launch Portfolio <ArrowRight size={20} />
                                </Link>
                            </MagneticAction>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ display: 'flex', flexDirection: 'row-reverse' }}>
                                    {[1, 2, 3, 4].map((i) => (
                                        <div key={i} style={{ width: '42px', height: '42px', borderRadius: '50%', border: '2px solid #ffffff', background: '#e2e8f0', marginLeft: '-16px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
                                            <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        </div>
                                    ))}
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                                    <div style={{ display: 'flex', color: '#fbbf24' }}>
                                        {[1, 2, 3, 4, 5].map(i => <Star key={i} size={14} fill="#fbbf24" />)}
                                    </div>
                                    <span style={{ fontSize: '0.8rem', color: THEME.textMuted, fontWeight: 600 }}>Loved by 50k+ students</span>
                                </div>
                            </div>
                        </div>
                    </CinematicScene>
                </div>

                {/* Right Spatial Dashboard — hidden on mobile */}
                {!isMobile && (
                    <CinematicScene delay={0.5}>
                        <motion.div style={{ position: 'relative', height: '600px', display: 'flex', alignItems: 'center', justifyContent: 'center', rotateX, rotateY, transformStyle: 'preserve-3d' }}>

                            {/* Core Glass Card */}
                            <GlowSurface depth={2} style={{ position: 'relative', zIndex: 2, width: '100%', maxWidth: '520px', padding: '2rem', transform: 'translateZ(50px)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: `1px solid rgba(15,23,42,0.05)` }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: THEME.accentBlue, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'inset 0 -2px 10px rgba(0,0,0,0.2)' }}>
                                            <Code size={28} color="#ffffff" />
                                        </div>
                                        <div>
                                            <h3 style={{ margin: '0 0 0.2rem', fontSize: '1.2rem', color: THEME.textMain, fontWeight: 800 }}>Alex Rivera</h3>
                                            <p style={{ margin: 0, fontSize: '0.9rem', color: THEME.textMuted, fontWeight: 500 }}>Full Stack Engineer</p>
                                        </div>
                                    </div>
                                    <div style={{ background: '#dcfce7', color: '#166534', padding: '0.4rem 1rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 700, border: '1px solid #bbf7d0' }}>Available</div>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {[
                                        { title: 'Machine Learning Model Analysis', tag: 'Python', color: '#f59e0b' },
                                        { title: 'E-Commerce Microservices Architecture', tag: 'Node.js', color: '#10b981' },
                                        { title: 'Interactive Data Visualization', tag: 'React', color: '#0ea5e9' }
                                    ].map((item, idx) => (
                                        <div key={idx} style={{ padding: '1.25rem', background: '#ffffff', borderRadius: '16px', border: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 12px -2px rgba(0,0,0,0.02)' }}>
                                            <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#334155' }}>{item.title}</span>
                                            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: item.color, background: `${item.color}15`, padding: '0.3rem 0.8rem', borderRadius: '8px' }}>{item.tag}</span>
                                        </div>
                                    ))}
                                </div>
                            </GlowSurface>

                            {/* Floating Morphing Elements (Z-translated for parallax) */}
                            <motion.div animate={{ y: [0, -15, 0] }} transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }} style={{ position: 'absolute', top: '5%', right: '-10%', transform: 'translateZ(80px)', zIndex: 3 }}>
                                <GlowSurface style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', borderRadius: '20px' }}>
                                    <div style={{ background: '#ecfdf5', padding: '0.6rem', borderRadius: '50%' }}><CheckCircle2 size={24} color="#10b981" /></div>
                                    <div>
                                        <p style={{ margin: 0, fontSize: '0.75rem', color: THEME.textMuted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</p>
                                        <p style={{ margin: 0, fontSize: '1rem', color: THEME.textMain, fontWeight: 800 }}>Profile Verified</p>
                                    </div>
                                </GlowSurface>
                            </motion.div>

                            <motion.div animate={{ y: [0, 20, 0] }} transition={{ repeat: Infinity, duration: 6, ease: "easeInOut", delay: 1 }} style={{ position: 'absolute', bottom: '10%', left: '-15%', transform: 'translateZ(100px)', zIndex: 3 }}>
                                <GlowSurface style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', borderRadius: '20px' }}>
                                    <div style={{ background: '#eff6ff', padding: '0.6rem', borderRadius: '50%' }}><Briefcase size={24} color={THEME.accentAzure} /></div>
                                    <div>
                                        <p style={{ margin: 0, fontSize: '0.75rem', color: THEME.textMuted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>New Offer</p>
                                        <p style={{ margin: 0, fontSize: '1rem', color: THEME.textMain, fontWeight: 800 }}>Google Inc.</p>
                                    </div>
                                </GlowSurface>
                            </motion.div>

                        </motion.div>
                    </CinematicScene>
                )}
            </div>
        </div>
    );
};



const FeaturesSection = () => {
    const [isMobile] = useState(window.innerWidth < 768);
    return (
        <div style={{ padding: isMobile ? '4rem 5%' : '10rem 5%', background: '#ffffff', position: 'relative' }}>
            <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
                <CinematicScene>
                    <div style={{ textAlign: 'center', marginBottom: isMobile ? '3rem' : '6rem' }}>
                        <span style={{ color: THEME.accentBlue, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', fontSize: '0.85rem', display: 'block', marginBottom: '1.5rem' }}>
                            Platform Capabilities
                        </span>
                        <h2 className="outfit-font" style={{ fontSize: 'clamp(2rem, 5vw, 4rem)', fontWeight: 900, color: THEME.textMain, margin: 0, lineHeight: 1.1, letterSpacing: '-0.02em' }}>
                            Engineered for <span style={{ color: THEME.accentBlue }}>Excellence.</span>
                        </h2>
                        <p style={{ color: THEME.textMuted, fontSize: isMobile ? '1rem' : '1.2rem', maxWidth: '600px', margin: '1.5rem auto 0', lineHeight: 1.7 }}>
                            A comprehensive suite of tools designed to elevate your academic profile and streamline the recruitment process.
                        </p>
                    </div>
                </CinematicScene>

                <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fit, minmax(${isMobile ? '260px' : '380px'}, 1fr))`, gap: isMobile ? '1rem' : '2rem' }}>
                    {FEATURES_DATA.map((feature, idx) => (
                        <CinematicScene key={feature.id} delay={idx * 0.1}>
                            <GlowSurface style={{ padding: isMobile ? '1.5rem' : '3rem', height: '100%', display: 'flex', flexDirection: 'column', gap: isMobile ? '1rem' : '2rem', border: '1px solid #f1f5f9' }}>
                                <div style={{ width: isMobile ? '56px' : '72px', height: isMobile ? '56px' : '72px', borderRadius: '20px', background: feature.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: feature.color, boxShadow: `inset 0 0 0 1px ${feature.color}20` }}>
                                    {feature.icon}
                                </div>
                                <div>
                                    <h3 className="outfit-font" style={{ fontSize: isMobile ? '1.2rem' : '1.5rem', fontWeight: 800, color: THEME.textMain, margin: '0 0 1rem', letterSpacing: '-0.01em' }}>{feature.title}</h3>
                                    <p style={{ color: THEME.textMuted, fontSize: isMobile ? '0.95rem' : '1.05rem', lineHeight: 1.7, margin: 0 }}>{feature.desc}</p>
                                </div>
                            </GlowSurface>
                        </CinematicScene>
                    ))}
                </div>
            </div>
        </div>
    );
};

const StatsSection = () => {
    const [isMobile] = useState(window.innerWidth < 768);
    return (
        <div style={{ padding: isMobile ? '4rem 5%' : '8rem 5%', background: '#f8fafc', borderTop: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9', position: 'relative', overflow: 'hidden' }}>
            {/* Ambient Background Blur for Stats */}
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '100%', height: '100%', background: 'radial-gradient(circle, rgba(14,165,233,0.03) 0%, transparent 70%)', filter: 'blur(60px)', pointerEvents: 'none' }} />

            <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fit, minmax(250px, 1fr))', gap: isMobile ? '2rem' : '4rem', textAlign: 'center', position: 'relative', zIndex: 1 }}>
                {STATS_DATA.map((stat, idx) => (
                    <CinematicScene key={idx} delay={idx * 0.1}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <span className="outfit-font text-gradient" style={{ fontSize: isMobile ? '2.5rem' : '4.5rem', fontWeight: 900, lineHeight: 1, letterSpacing: '-0.03em' }}>{stat.value}</span>
                            <span style={{ color: THEME.textMuted, fontSize: isMobile ? '0.8rem' : '1.1rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{stat.label}</span>
                        </div>
                    </CinematicScene>
                ))}
            </div>
        </div>
    );
};

const TimelineSection = () => {
    const containerRef = useRef(null);
    const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start center", "end center"] });
    const lineHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);
    const [isMobile] = useState(window.innerWidth < 768);

    return (
        <div ref={containerRef} style={{ padding: isMobile ? '4rem 5%' : '10rem 5%', background: '#ffffff', position: 'relative' }}>
            <div style={{ maxWidth: '1300px', margin: '0 auto', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.2fr 1fr', gap: isMobile ? '2rem' : '8rem', alignItems: 'center' }}>

                <div style={{ position: 'relative' }}>
                    <CinematicScene>
                        <h2 className="outfit-font" style={{ fontSize: 'clamp(3rem, 5vw, 4rem)', fontWeight: 900, color: THEME.textMain, margin: '0 0 4rem', lineHeight: 1.1, letterSpacing: '-0.02em' }}>
                            Your Journey to <br /><span style={{ color: THEME.accentBlue }}>Success.</span>
                        </h2>
                    </CinematicScene>

                    <div style={{ position: 'relative', paddingLeft: '3rem' }}>
                        {/* Dynamic Drawing Line */}
                        <div style={{ position: 'absolute', top: 0, bottom: 0, left: '16px', width: '2px', background: '#f1f5f9', borderRadius: '2px' }} />
                        <motion.div style={{ position: 'absolute', top: 0, left: '16px', width: '2px', height: lineHeight, background: `linear-gradient(to bottom, ${THEME.accentBlue}, ${THEME.accentAzure})`, borderRadius: '2px' }} />

                        {TIMELINE_DATA.map((item, idx) => (
                            <CinematicScene key={idx} delay={0.2}>
                                <div style={{ display: 'flex', gap: '2.5rem', position: 'relative', zIndex: 1, marginBottom: idx === TIMELINE_DATA.length - 1 ? 0 : '4rem' }}>
                                    <div style={{ position: 'absolute', left: '-3rem', transform: 'translateX(-50%)', width: '32px', height: '32px', borderRadius: '50%', background: '#ffffff', border: `3px solid ${THEME.accentBlue}`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 0 6px #ffffff' }}>
                                        <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: THEME.accentBlue }} />
                                    </div>
                                    <div style={{ paddingTop: '0.2rem' }}>
                                        <div style={{ color: THEME.accentBlue, fontWeight: 800, fontSize: '1rem', marginBottom: '0.5rem', letterSpacing: '0.1em' }}>STEP {item.step}</div>
                                        <h3 className="outfit-font" style={{ fontSize: '1.6rem', fontWeight: 800, color: THEME.textMain, margin: '0 0 1rem', letterSpacing: '-0.01em' }}>{item.title}</h3>
                                        <p style={{ color: THEME.textMuted, fontSize: '1.1rem', lineHeight: 1.7, margin: 0 }}>{item.desc}</p>
                                    </div>
                                </div>
                            </CinematicScene>
                        ))}
                    </div>
                </div>

                {/* Right Visual Composition — hidden on mobile */}
                {!isMobile && (
                    <CinematicScene delay={0.3}>
                        <motion.div style={{ position: 'relative' }}>
                            <div style={{ position: 'absolute', inset: '-20px', background: 'linear-gradient(135deg, #e0f2fe, #f8fafc)', borderRadius: '32px', transform: 'rotate(-4deg)', zIndex: 0 }} />
                            <GlowSurface style={{ padding: '0', borderRadius: '24px', zIndex: 1 }}>
                                <img
                                    src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                                    alt="Students collaborating"
                                    style={{ width: '100%', height: 'auto', display: 'block', border: '1px solid rgba(255,255,255,0.4)', borderRadius: '24px' }}
                                />
                            </GlowSurface>

                            {/* Apple-tier Floating Badge */}
                            <motion.div animate={{ y: [0, -15, 0] }} transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }} style={{ position: 'absolute', bottom: '-30px', left: '-30px', zIndex: 2 }}>
                                <GlowSurface depth={2} style={{ padding: '1.5rem 2rem', display: 'flex', alignItems: 'center', gap: '1.25rem', borderRadius: '24px' }}>
                                    <div style={{ background: '#ecfdf5', padding: '1rem', borderRadius: '50%', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)' }}><Award size={32} color="#10b981" /></div>
                                    <div>
                                        <p style={{ margin: 0, fontSize: '0.85rem', color: THEME.textMuted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Highest Rated</p>
                                        <p className="outfit-font" style={{ margin: 0, fontSize: '1.3rem', color: THEME.textMain, fontWeight: 900 }}>Career Platform</p>
                                    </div>
                                </GlowSurface>
                            </motion.div>
                        </motion.div>
                    </CinematicScene>
                )}

            </div>
        </div>
    );
};

const CTASection = () => {
    const [isMobile] = useState(window.innerWidth < 768);
    return (
        <div style={{ padding: isMobile ? '3rem 5%' : '8rem 5%', background: '#ffffff' }}>
            <div style={{ maxWidth: '1300px', margin: '0 auto' }}>
                <CinematicScene>
                    <div style={{ background: 'linear-gradient(135deg, #0f172a, #1e293b)', borderRadius: isMobile ? '24px' : '40px', padding: isMobile ? '3rem 1.5rem' : '6rem 4rem', textAlign: 'center', position: 'relative', overflow: 'hidden', boxShadow: '0 40px 80px -20px rgba(15, 23, 42, 0.5)' }}>
                        <div style={{ position: 'absolute', top: 0, right: 0, width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(14,165,233,0.15) 0%, rgba(0,0,0,0) 70%)', transform: 'translate(30%, -30%)' }} />
                        <div style={{ position: 'absolute', bottom: 0, left: 0, width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(59,130,246,0.1) 0%, rgba(0,0,0,0) 70%)', transform: 'translate(-30%, 30%)' }} />

                        <div style={{ position: 'relative', zIndex: 10 }}>
                            <h2 className="outfit-font" style={{ fontSize: 'clamp(3rem, 6vw, 5rem)', fontWeight: 900, color: '#ffffff', margin: '0 0 1.5rem', lineHeight: 1.05, letterSpacing: '-0.03em' }}>
                                Ready to accelerate <br /> your career trajectory?
                            </h2>
                            <p style={{ color: '#94a3b8', fontSize: '1.25rem', maxWidth: '650px', margin: '0 auto 4rem', lineHeight: 1.7 }}>
                                Join thousands of students who have already transformed their academic efforts into lucrative professional opportunities.
                            </p>

                            <MagneticAction strength={15}>
                                <Link to="/register" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', padding: '1.25rem 3rem', borderRadius: '999px', background: '#ffffff', color: '#0f172a', textDecoration: 'none', fontWeight: 800, fontSize: '1.15rem', transition: 'all 0.3s', boxShadow: '0 20px 40px rgba(255,255,255,0.1)' }}>
                                    Create Free Account <ArrowUpRight size={22} color={THEME.accentBlue} />
                                </Link>
                            </MagneticAction>
                        </div>
                    </div>
                </CinematicScene>
            </div>
        </div>
    );
};

const Footer = () => {
    const [isMobile] = useState(window.innerWidth < 768);
    return (
        <footer style={{ background: '#f8fafc', paddingTop: isMobile ? '3rem' : '6rem', borderTop: '1px solid #f1f5f9' }}>
            <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 5%' }}>
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(280px, 1fr))', gap: isMobile ? '3rem' : '5rem', marginBottom: isMobile ? '2rem' : '5rem' }}>

                    <CinematicScene delay={0.1}>
                        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none', marginBottom: '1.5rem' }}>
                            <div style={{ background: THEME.accentBlue, padding: '0.5rem', borderRadius: '12px', display: 'flex' }}>
                                <Sparkles size={20} color="#ffffff" />
                            </div>
                            <span className="outfit-font" style={{ fontWeight: 800, fontSize: '1.4rem', color: THEME.textMain }}>
                                Student<span style={{ color: THEME.accentBlue }}>Connect</span>
                            </span>
                        </Link>
                        <p style={{ color: THEME.textMuted, fontSize: '1rem', lineHeight: 1.7, marginBottom: '2rem' }}>
                            The definitive platform bridging the gap between exceptional academic talent and industry-leading enterprises globally.
                        </p>
                    </CinematicScene>

                    <CinematicScene delay={0.2}>
                        <h4 className="outfit-font" style={{ color: THEME.textMain, fontWeight: 800, fontSize: '1.2rem', marginBottom: '2rem' }}>Platform</h4>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            {['For Students', 'For Universities', 'For Companies', 'Pricing', 'Success Stories'].map(item => (
                                <li key={item}>
                                    <a href="#" style={{ color: THEME.textMuted, textDecoration: 'none', fontSize: '1rem', fontWeight: 500, transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color = THEME.accentBlue} onMouseLeave={e => e.target.style.color = THEME.textMuted}>{item}</a>
                                </li>
                            ))}
                        </ul>
                    </CinematicScene>

                    <CinematicScene delay={0.3}>
                        <h4 className="outfit-font" style={{ color: THEME.textMain, fontWeight: 800, fontSize: '1.2rem', marginBottom: '2rem' }}>Company</h4>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            {['About Us', 'Careers', 'Blog', 'Press Kit', 'Contact'].map(item => (
                                <li key={item}>
                                    <a href="#" style={{ color: THEME.textMuted, textDecoration: 'none', fontSize: '1rem', fontWeight: 500, transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color = THEME.accentBlue} onMouseLeave={e => e.target.style.color = THEME.textMuted}>{item}</a>
                                </li>
                            ))}
                        </ul>
                    </CinematicScene>

                    <CinematicScene delay={0.4}>
                        <h4 className="outfit-font" style={{ color: THEME.textMain, fontWeight: 800, fontSize: '1.2rem', marginBottom: '2rem' }}>Stay Updated</h4>
                        <p style={{ color: THEME.textMuted, fontSize: '1rem', lineHeight: 1.7, marginBottom: '1.5rem' }}>Subscribe to our newsletter for the latest platform updates and career tips.</p>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <input type="email" placeholder="Enter your email" style={{ flex: 1, padding: '1rem 1.25rem', borderRadius: '12px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '1rem', background: '#ffffff', minWidth: 0 }} />
                            <motion.button whileTap={{ scale: 0.95 }} style={{ padding: '0 1.25rem', background: THEME.textMain, color: '#fff', border: 'none', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <ArrowRight size={20} />
                            </motion.button>
                        </div>
                    </CinematicScene>
                </div>

                <div style={{ padding: isMobile ? '1.5rem 0' : '2.5rem 0', borderTop: '1px solid #e2e8f0', display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', flexWrap: 'wrap', gap: '1rem' }}>
                    <p style={{ color: '#94a3b8', fontSize: isMobile ? '0.8rem' : '0.95rem', margin: 0, fontWeight: 500 }}>&copy; {new Date().getFullYear()} StudentConnect Inc. All rights reserved.</p>
                    <div style={{ display: 'flex', gap: isMobile ? '1rem' : '2rem', flexWrap: 'wrap' }}>
                        {['Privacy Policy', 'Terms of Service', 'Cookie Settings'].map(item => (
                            <a key={item} href="#" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: isMobile ? '0.8rem' : '0.95rem', fontWeight: 500 }} onMouseEnter={e => e.target.style.color = THEME.accentBlue} onMouseLeave={e => e.target.style.color = '#94a3b8'}>{item}</a>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    );
};

// ============================================================================
// 5. MAIN EXPORT COMPONENT
// ============================================================================

const Home = () => {
    useEffect(() => { window.scrollTo(0, 0); }, []);

    return (
        <div style={{ position: 'relative', minHeight: '100vh', backgroundColor: '#ffffff', overflow: 'hidden' }}>
            <style dangerouslySetInnerHTML={{ __html: globalStyles }} />
            <AmbientCanvas />
            <Navbar />
            <HeroSection />

            <FeaturesSection />
            <StatsSection />
            <TimelineSection />
            <CTASection />
            <Footer />
        </div>
    );
};

export default Home;