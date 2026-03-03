import React, { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
    ArrowRight, Sparkles, Target, Globe, Users, Code,
    Briefcase, Award, Zap, ChevronRight, PlayCircle,
    CheckCircle2, Star, Quote, ArrowUpRight, ShieldCheck,
    Cpu, LineChart, Layers
} from 'lucide-react';

// ==========================================
// 1. DATA & CONFIGURATION
// ==========================================

const FEATURES_DATA = [
    {
        id: 1,
        title: "Algorithmic Portfolio Matching",
        desc: "Our AI analyzes your uploaded projects and tech stack to instantly match you with universities and companies seeking your specific skill profile.",
        icon: <Cpu size={28} strokeWidth={1.5} />,
        color: "#0ea5e9",
        bg: "rgba(14, 165, 233, 0.05)"
    },
    {
        id: 2,
        title: "Global Visibility Network",
        desc: "Break geographical barriers. Your digital proof-of-work is put directly in front of global recruiters actively scouting for fresh, verified talent.",
        icon: <Globe size={28} strokeWidth={1.5} />,
        color: "#2563eb",
        bg: "rgba(37, 99, 235, 0.05)"
    },
    {
        id: 3,
        title: "Direct Industry Outreach",
        desc: "Skip the generic application queue. Receive direct interview requests and recruitment emails straight from companies who love your portfolio.",
        icon: <Target size={28} strokeWidth={1.5} />,
        color: "#0284c7",
        bg: "rgba(2, 132, 199, 0.05)"
    },
    {
        id: 4,
        title: "Verified Proof of Work",
        desc: "Upload assignments, source code, and live apps. Let your tangible creations speak for your expertise far louder than a traditional paper resume.",
        icon: <Briefcase size={28} strokeWidth={1.5} />,
        color: "#3b82f6",
        bg: "rgba(59, 130, 246, 0.05)"
    },
    {
        id: 5,
        title: "Real-time Skill Analytics",
        desc: "Track how your skills align with current market demands. Get intelligent suggestions on which technologies to learn next to boost your employability.",
        icon: <LineChart size={28} strokeWidth={1.5} />,
        color: "#0369a1",
        bg: "rgba(3, 105, 161, 0.05)"
    },
    {
        id: 6,
        title: "Secure Enterprise Infrastructure",
        desc: "Bank-grade security ensures your intellectual property, personal data, and academic records remain entirely under your control and protected.",
        icon: <ShieldCheck size={28} strokeWidth={1.5} />,
        color: "#0c4a6e",
        bg: "rgba(12, 74, 110, 0.05)"
    }
];

const TIMELINE_DATA = [
    {
        step: "01",
        title: "Create Your Digital Identity",
        desc: "Sign up and build a comprehensive profile detailing your academic journey, preferred roles, and core technical skills."
    },
    {
        step: "02",
        title: "Upload & Showcase",
        desc: "Add your best projects, research papers, and code repositories. Transform your academic work into a professional portfolio."
    },
    {
        step: "03",
        title: "Get Discovered",
        desc: "Our matching engine highlights your profile to universities and companies searching for your exact skill set."
    },
    {
        step: "04",
        title: "Accelerate Your Career",
        desc: "Receive direct messages, interview invites, and acceptance letters straight through your secure dashboard."
    }
];

const STATS_DATA = [
    { value: "50K+", label: "Active Students" },
    { value: "1,200+", label: "Partner Companies" },
    { value: "300+", label: "Top Universities" },
    { value: "94%", label: "Placement Rate" }
];

// ==========================================
// 2. STYLES (Injected via Style Tag)
// ==========================================

const globalStyles = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Outfit:wght@300;400;500;600;700;800;900&display=swap');

    :root {
        --color-bg: #ffffff;
        --color-bg-alt: #f8fafc;
        --color-text-main: #0f172a;
        --color-text-muted: #475569;
        --color-primary: #0ea5e9;
        --color-primary-dark: #0284c7;
        --color-primary-light: #e0f2fe;
        --color-accent: #3b82f6;
        --glass-bg: rgba(255, 255, 255, 0.85);
        --glass-border: rgba(14, 165, 233, 0.1);
        --shadow-soft: 0 20px 40px -15px rgba(14, 165, 233, 0.15);
        --shadow-hover: 0 30px 60px -15px rgba(14, 165, 233, 0.25);
    }

    body {
        margin: 0;
        padding: 0;
        background-color: var(--color-bg);
        color: var(--color-text-main);
        font-family: 'Inter', sans-serif;
        overflow-x: hidden;
    }

    .outfit-font {
        font-family: 'Outfit', sans-serif;
    }

    /* Custom Scrollbar */
    ::-webkit-scrollbar { width: 10px; }
    ::-webkit-scrollbar-track { background: #f1f5f9; }
    ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
    ::-webkit-scrollbar-thumb:hover { background: #94a3b8; }

    /* Animated Gradients */
    .text-gradient {
        background: linear-gradient(135deg, var(--color-primary), var(--color-accent));
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
    }

    .bg-gradient-hover {
        background: linear-gradient(135deg, var(--color-primary), var(--color-accent));
        background-size: 200% auto;
        transition: 0.5s;
    }
    .bg-gradient-hover:hover {
        background-position: right center;
    }

    /* Mesh Backgrounds */
    .mesh-bg {
        background-color: #ffffff;
        background-image: 
            radial-gradient(at 40% 20%, hsla(199,89%,94%,1) 0px, transparent 50%),
            radial-gradient(at 80% 0%, hsla(217,100%,95%,1) 0px, transparent 50%),
            radial-gradient(at 0% 50%, hsla(199,89%,94%,1) 0px, transparent 50%),
            radial-gradient(at 80% 50%, hsla(217,100%,95%,1) 0px, transparent 50%),
            radial-gradient(at 0% 100%, hsla(199,89%,94%,1) 0px, transparent 50%),
            radial-gradient(at 80% 100%, hsla(217,100%,95%,1) 0px, transparent 50%),
            radial-gradient(at 0% 0%, hsla(199,89%,94%,1) 0px, transparent 50%);
    }

    .glass-card {
        background: var(--glass-bg);
        backdrop-filter: blur(16px);
        -webkit-backdrop-filter: blur(16px);
        border: 1px solid var(--glass-border);
        box-shadow: var(--shadow-soft);
        border-radius: 24px;
    }

    /* Image Clip Paths */
    .clip-blob {
        clip-path: polygon(43% 0, 100% 13%, 100% 100%, 0 100%, 0 24%);
    }
`;

// ==========================================
// 3. SUB-COMPONENTS
// ==========================================

// --- Navbar ---
const Navbar = () => {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <motion.nav
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            style={{
                position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
                padding: scrolled ? '1rem 5%' : '1.5rem 5%',
                background: scrolled ? 'rgba(255,255,255,0.9)' : 'transparent',
                backdropFilter: scrolled ? 'blur(12px)' : 'none',
                borderBottom: scrolled ? '1px solid rgba(14, 165, 233, 0.1)' : '1px solid transparent',
                transition: 'all 0.4s ease', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}
        >
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
                <div style={{ background: 'linear-gradient(135deg, #0ea5e9, #3b82f6)', padding: '0.5rem', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Sparkles size={24} color="#ffffff" />
                </div>
                <span className="outfit-font" style={{ fontWeight: 800, fontSize: '1.5rem', color: '#0f172a', letterSpacing: '-0.5px' }}>
                    Student<span style={{ color: '#0ea5e9' }}>Connect</span>
                </span>
            </Link>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <Link to="/login" style={{ color: '#475569', textDecoration: 'none', fontWeight: 600, fontSize: '0.95rem', transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color = '#0ea5e9'} onMouseLeave={e => e.target.style.color = '#475569'}>
                    Sign In
                </Link>
                <Link to="/register" className="bg-gradient-hover" style={{ padding: '0.75rem 1.5rem', borderRadius: '12px', color: '#ffffff', textDecoration: 'none', fontWeight: 600, fontSize: '0.95rem', boxShadow: '0 10px 20px -10px rgba(14, 165, 233, 0.5)' }}>
                    Get Started
                </Link>
            </div>
        </motion.nav>
    );
};

// --- Hero Section ---
const HeroSection = () => {
    return (
        <div className="mesh-bg" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', paddingTop: '80px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 5%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center' }}>

                {/* Left Content */}
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
                    style={{ zIndex: 10 }}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5, duration: 0.5 }}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '50px', marginBottom: '2rem' }}
                    >
                        <Zap size={16} color="#0ea5e9" fill="#0ea5e9" />
                        <span style={{ color: '#0284c7', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>The New Standard for Talent</span>
                    </motion.div>

                    <h1 className="outfit-font" style={{ fontSize: 'clamp(3rem, 5vw, 4.5rem)', fontWeight: 900, lineHeight: 1.1, color: '#0f172a', marginBottom: '1.5rem', letterSpacing: '-1px' }}>
                        Where Academia Meets <br />
                        <span className="text-gradient">Industry Innovation.</span>
                    </h1>

                    <p style={{ fontSize: '1.15rem', color: '#475569', lineHeight: 1.6, marginBottom: '2.5rem', maxWidth: '90%' }}>
                        Transform your academic projects into a verified professional portfolio. StudentConnect intelligently bridges the gap between top-tier students, prestigious universities, and enterprise companies.
                    </p>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
                        <Link to="/register" className="bg-gradient-hover" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '1rem 2rem', borderRadius: '14px', color: '#ffffff', textDecoration: 'none', fontWeight: 600, fontSize: '1.1rem', boxShadow: '0 20px 30px -10px rgba(14, 165, 233, 0.4)' }}>
                            Launch Portfolio <ArrowRight size={20} />
                        </Link>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ display: 'flex', flexDirection: 'row-reverse' }}>
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} style={{ width: '40px', height: '40px', borderRadius: '50%', border: '2px solid #fff', background: '#e2e8f0', marginLeft: '-15px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                                        <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    </div>
                                ))}
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <div style={{ display: 'flex', color: '#fbbf24' }}>
                                    {[1, 2, 3, 4, 5].map(i => <Star key={i} size={14} fill="#fbbf24" />)}
                                </div>
                                <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Loved by 50k+ students</span>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Right Visuals (Abstract UI Representation) */}
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
                    style={{ position: 'relative', height: '600px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                    {/* Abstract Backdrop */}
                    <div style={{ position: 'absolute', width: '100%', height: '100%', background: 'linear-gradient(135deg, #e0f2fe 0%, #f8fafc 100%)', borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%', filter: 'blur(40px)', zIndex: 0, animation: 'morph 15s ease-in-out infinite alternate' }} />

                    {/* Dashboard Mockup Card */}
                    <motion.div
                        whileHover={{ y: -10, rotateY: -5 }}
                        className="glass-card"
                        style={{ position: 'relative', zIndex: 2, width: '100%', maxWidth: '500px', padding: '1.5rem', background: 'rgba(255,255,255,0.6)' }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(14,165,233,0.1)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#0ea5e9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Code size={24} color="#fff" />
                                </div>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#0f172a', fontWeight: 700 }}>Alex Rivera</h3>
                                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>Full Stack Engineer</p>
                                </div>
                            </div>
                            <div style={{ background: '#dcfce7', color: '#166534', padding: '0.3rem 0.8rem', borderRadius: '50px', fontSize: '0.75rem', fontWeight: 700 }}>Available</div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {[
                                { title: 'Machine Learning Model Analysis', tag: 'Python', color: '#f59e0b' },
                                { title: 'E-Commerce Microservices Architecture', tag: 'Node.js', color: '#10b981' },
                                { title: 'Interactive Data Visualization Dashboard', tag: 'React', color: '#0ea5e9' }
                            ].map((item, idx) => (
                                <div key={idx} style={{ padding: '1rem', background: '#ffffff', borderRadius: '12px', border: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                                    <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#334155' }}>{item.title}</span>
                                    <span style={{ fontSize: '0.7rem', fontWeight: 700, color: item.color, background: `${item.color}20`, padding: '0.2rem 0.6rem', borderRadius: '6px' }}>{item.tag}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Floating Elements */}
                    <motion.div
                        animate={{ y: [0, -20, 0] }}
                        transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                        className="glass-card"
                        style={{ position: 'absolute', top: '10%', right: '-5%', padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.8rem', zIndex: 3 }}
                    >
                        <div style={{ background: '#ecfdf5', padding: '0.5rem', borderRadius: '50%' }}><CheckCircle2 size={24} color="#10b981" /></div>
                        <div>
                            <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b', fontWeight: 500 }}>Status</p>
                            <p style={{ margin: 0, fontSize: '0.95rem', color: '#0f172a', fontWeight: 700 }}>Profile Verified</p>
                        </div>
                    </motion.div>

                    <motion.div
                        animate={{ y: [0, 20, 0] }}
                        transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }}
                        className="glass-card"
                        style={{ position: 'absolute', bottom: '15%', left: '-10%', padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.8rem', zIndex: 3 }}
                    >
                        <div style={{ background: '#eff6ff', padding: '0.5rem', borderRadius: '50%' }}><Briefcase size={24} color="#3b82f6" /></div>
                        <div>
                            <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b', fontWeight: 500 }}>New Offer</p>
                            <p style={{ margin: 0, fontSize: '0.95rem', color: '#0f172a', fontWeight: 700 }}>Google Inc.</p>
                        </div>
                    </motion.div>

                </motion.div>
            </div>

            {/* Custom Animation Styles injected for this component */}
            <style>{`
                @keyframes morph {
                    0% { border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%; }
                    50% { border-radius: 70% 30% 30% 70% / 70% 70% 30% 30%; }
                    100% { border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%; }
                }
            `}</style>
        </div>
    );
};

// --- SCROLL BOUND VIDEO SECTION ---
const ScrollVideoSection = () => {
    const sectionRef = useRef(null);
    const videoRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: sectionRef,
        offset: ["start start", "end end"]
    });

    // We use a high-quality abstract technology video from Mixkit
    const videoUrl = "https://assets.mixkit.co/videos/preview/mixkit-abstract-technology-network-connections-loop-27361-large.mp4";

    // Smoothly interpolate the video current time based on scroll
    useEffect(() => {
        let animationFrameId;

        const updateVideoTime = () => {
            if (videoRef.current && videoRef.current.duration) {
                // Determine target time based on scroll progress (0 to 1)
                const targetTime = scrollYProgress.get() * videoRef.current.duration;

                // Scrub the video
                // Note: Standard MP4s might be slightly choppy when scrubbing, 
                // but this implements the requested scroll up/down scrubbing logic accurately.
                videoRef.current.currentTime = targetTime;
            }
            animationFrameId = requestAnimationFrame(updateVideoTime);
        };

        animationFrameId = requestAnimationFrame(updateVideoTime);
        return () => cancelAnimationFrame(animationFrameId);
    }, [scrollYProgress]);

    // Text animations based on scroll progress
    const textOpacity1 = useTransform(scrollYProgress, [0, 0.1, 0.2, 0.3], [0, 1, 1, 0]);
    const textY1 = useTransform(scrollYProgress, [0, 0.1, 0.3], [50, 0, -50]);

    const textOpacity2 = useTransform(scrollYProgress, [0.35, 0.45, 0.55, 0.65], [0, 1, 1, 0]);
    const textY2 = useTransform(scrollYProgress, [0.35, 0.45, 0.65], [50, 0, -50]);

    const textOpacity3 = useTransform(scrollYProgress, [0.7, 0.8, 0.9, 1], [0, 1, 1, 0]);
    const textY3 = useTransform(scrollYProgress, [0.7, 0.8, 1], [50, 0, -50]);

    return (
        // A huge height container to allow significant scrolling
        <div ref={sectionRef} style={{ height: '400vh', position: 'relative', background: '#020617' }}>

            {/* Sticky Container holds the video and text overlays in place while scrolling the tall container */}
            <div style={{ position: 'sticky', top: 0, height: '100vh', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>

                {/* The Video Layer */}
                <video
                    ref={videoRef}
                    src={videoUrl}
                    muted
                    playsInline
                    preload="auto"
                    style={{
                        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                        objectFit: 'cover', opacity: 0.6, zIndex: 1, filter: 'hue-rotate(180deg) brightness(0.8)' // Styling video to fit the elegant blue theme
                    }}
                />

                {/* Dark Overlay for better text readability */}
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(2,6,23,0.8), rgba(2,6,23,0.3), rgba(2,6,23,0.8))', zIndex: 2 }} />

                {/* Animated Text Overlays */}
                <div style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: '1200px', padding: '0 5%', textAlign: 'center', color: '#ffffff' }}>

                    {/* Scene 1 */}
                    <motion.div style={{ position: 'absolute', width: '100%', left: 0, opacity: textOpacity1, y: textY1 }}>
                        <h2 className="outfit-font" style={{ fontSize: 'clamp(3rem, 6vw, 5rem)', fontWeight: 800, margin: '0 0 1rem', textShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
                            Visualize Your <span style={{ color: '#38bdf8' }}>Future.</span>
                        </h2>
                        <p style={{ fontSize: '1.25rem', color: '#cbd5e1', maxWidth: '700px', margin: '0 auto' }}>
                            Scroll down to navigate through the neural pathways of opportunity. Your data and skills construct the roadmap to your career.
                        </p>
                    </motion.div>

                    {/* Scene 2 */}
                    <motion.div style={{ position: 'absolute', width: '100%', left: 0, opacity: textOpacity2, y: textY2 }}>
                        <h2 className="outfit-font" style={{ fontSize: 'clamp(3rem, 6vw, 5rem)', fontWeight: 800, margin: '0 0 1rem', textShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
                            Dynamic <span style={{ color: '#38bdf8' }}>Connections.</span>
                        </h2>
                        <p style={{ fontSize: '1.25rem', color: '#cbd5e1', maxWidth: '700px', margin: '0 auto' }}>
                            Every project you upload builds a node in our network. We instantly connect these nodes to recruiters searching for your exact expertise.
                        </p>
                    </motion.div>

                    {/* Scene 3 */}
                    <motion.div style={{ position: 'absolute', width: '100%', left: 0, opacity: textOpacity3, y: textY3 }}>
                        <h2 className="outfit-font" style={{ fontSize: 'clamp(3rem, 6vw, 5rem)', fontWeight: 800, margin: '0 0 1rem', textShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
                            Seamless <span style={{ color: '#38bdf8' }}>Integration.</span>
                        </h2>
                        <p style={{ fontSize: '1.25rem', color: '#cbd5e1', maxWidth: '700px', margin: '0 auto' }}>
                            From classroom assignment to corporate placement. Experience the frictionless transition into the professional world.
                        </p>
                    </motion.div>

                </div>

                {/* Scroll indicator overlay */}
                <div style={{ position: 'absolute', bottom: '2rem', left: '50%', transform: 'translateX(-50%)', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: 0.6 }}>
                    <span style={{ color: '#fff', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '0.5rem' }}>Scrub Video</span>
                    <div style={{ width: '2px', height: '40px', background: 'rgba(255,255,255,0.2)', overflow: 'hidden' }}>
                        <motion.div
                            animate={{ y: [0, 40] }}
                            transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                            style={{ width: '100%', height: '50%', background: '#38bdf8' }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Features Grid ---
const FeaturesSection = () => {
    return (
        <div style={{ padding: '8rem 5%', background: '#ffffff', position: 'relative' }}>
            <div style={{ maxWidth: '1400px', margin: '0 auto' }}>

                <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
                    <motion.span
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        style={{ color: '#0ea5e9', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', fontSize: '0.9rem', display: 'block', marginBottom: '1rem' }}
                    >
                        Platform Capabilities
                    </motion.span>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="outfit-font"
                        style={{ fontSize: 'clamp(2.5rem, 4vw, 3.5rem)', fontWeight: 800, color: '#0f172a', margin: 0, lineHeight: 1.2 }}
                    >
                        Engineered for <span style={{ color: '#0ea5e9' }}>Excellence.</span>
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        style={{ color: '#475569', fontSize: '1.15rem', maxWidth: '700px', margin: '1.5rem auto 0', lineHeight: 1.6 }}
                    >
                        A comprehensive suite of tools designed to elevate your academic profile and streamline the recruitment process.
                    </motion.p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2.5rem' }}>
                    {FEATURES_DATA.map((feature, idx) => (
                        <motion.div
                            key={feature.id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{ duration: 0.5, delay: idx * 0.1 }}
                            whileHover={{ y: -10, boxShadow: '0 25px 50px -12px rgba(14, 165, 233, 0.15)' }}
                            style={{
                                background: '#ffffff', border: '1px solid #f1f5f9', borderRadius: '24px', padding: '2.5rem',
                                transition: 'all 0.3s ease', display: 'flex', flexDirection: 'column', gap: '1.5rem',
                                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)'
                            }}
                        >
                            <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: feature.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: feature.color }}>
                                {feature.icon}
                            </div>
                            <div>
                                <h3 className="outfit-font" style={{ fontSize: '1.35rem', fontWeight: 700, color: '#0f172a', margin: '0 0 1rem' }}>{feature.title}</h3>
                                <p style={{ color: '#64748b', fontSize: '1rem', lineHeight: 1.6, margin: 0 }}>{feature.desc}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// --- Statistics/Impact Section ---
const StatsSection = () => {
    return (
        <div style={{ padding: '6rem 5%', background: '#f8fafc', borderTop: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9' }}>
            <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '3rem', textAlign: 'center' }}>
                {STATS_DATA.map((stat, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, scale: 0.5 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: idx * 0.1, type: "spring" }}
                        style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}
                    >
                        <span className="outfit-font text-gradient" style={{ fontSize: '3.5rem', fontWeight: 900, lineHeight: 1 }}>{stat.value}</span>
                        <span style={{ color: '#475569', fontSize: '1.1rem', fontWeight: 600 }}>{stat.label}</span>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

// --- How It Works (Timeline) ---
const TimelineSection = () => {
    return (
        <div style={{ padding: '8rem 5%', background: '#ffffff' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6rem', alignItems: 'center' }}>

                {/* Left Side: Text and Timeline */}
                <div>
                    <motion.h2
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="outfit-font"
                        style={{ fontSize: 'clamp(2.5rem, 4vw, 3.5rem)', fontWeight: 800, color: '#0f172a', margin: '0 0 3rem', lineHeight: 1.2 }}
                    >
                        Your Journey to <br /><span style={{ color: '#0ea5e9' }}>Success.</span>
                    </motion.h2>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem', position: 'relative' }}>
                        {/* Connecting Line */}
                        <div style={{ position: 'absolute', top: '10px', bottom: '10px', left: '24px', width: '2px', background: 'linear-gradient(to bottom, #0ea5e9, #f1f5f9)', zIndex: 0 }} />

                        {TIMELINE_DATA.map((item, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.15 }}
                                style={{ display: 'flex', gap: '2rem', position: 'relative', zIndex: 1 }}
                            >
                                <div style={{ flexShrink: 0, width: '50px', height: '50px', borderRadius: '50%', background: '#ffffff', border: '2px solid #0ea5e9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0ea5e9', fontWeight: 800, fontSize: '1.2rem', boxShadow: '0 10px 20px rgba(14,165,233,0.2)' }}>
                                    {item.step}
                                </div>
                                <div style={{ paddingTop: '0.5rem' }}>
                                    <h3 className="outfit-font" style={{ fontSize: '1.4rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.5rem' }}>{item.title}</h3>
                                    <p style={{ color: '#64748b', fontSize: '1rem', lineHeight: 1.6, margin: 0 }}>{item.desc}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Right Side: Image/Visual */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, rotate: 2 }}
                    whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    style={{ position: 'relative' }}
                >
                    <div style={{ position: 'absolute', inset: '-20px', background: 'linear-gradient(135deg, #e0f2fe, #f0fdf4)', borderRadius: '30px', transform: 'rotate(-3deg)', zIndex: 0 }} />
                    <img
                        src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                        alt="Students collaborating"
                        style={{ width: '100%', height: 'auto', borderRadius: '24px', position: 'relative', zIndex: 1, boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)' }}
                    />
                    
                    {/* Floating badge */}
                    <motion.div 
                        animate={{ y: [0, -15, 0] }}
                        transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                        style={{ position: 'absolute', bottom: '-20px', left: '-20px', background: '#ffffff', padding: '1.5rem', borderRadius: '20px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', zIndex: 2, display: 'flex', alignItems: 'center', gap: '1rem' }}
                    >
                        <div style={{ background: '#ecfdf5', padding: '1rem', borderRadius: '50%' }}><Award size={32} color="#10b981" /></div>
                        <div>
                            <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748b', fontWeight: 600 }}>Highest Rated</p>
                            <p className="outfit-font" style={{ margin: 0, fontSize: '1.2rem', color: '#0f172a', fontWeight: 800 }}>Career Platform</p>
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
};

// --- CTA Section ---
const CTASection = () => {
    return (
        <div style={{ padding: '6rem 5%', background: '#ffffff' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    style={{
                        background: 'linear-gradient(135deg, #0f172a, #1e293b)', borderRadius: '32px', padding: '5rem 3rem',
                        textAlign: 'center', position: 'relative', overflow: 'hidden', boxShadow: '0 30px 60px -15px rgba(15, 23, 42, 0.5)'
                    }}
                >
                    {/* Decorative Background Elements */}
                    <div style={{ position: 'absolute', top: 0, right: 0, width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(14,165,233,0.3) 0%, rgba(0,0,0,0) 70%)', transform: 'translate(30%, -30%)' }} />
                    <div style={{ position: 'absolute', bottom: 0, left: 0, width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(56,189,248,0.2) 0%, rgba(0,0,0,0) 70%)', transform: 'translate(-30%, 30%)' }} />

                    <div style={{ position: 'relative', zIndex: 10 }}>
                        <h2 className="outfit-font" style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: 800, color: '#ffffff', margin: '0 0 1.5rem', lineHeight: 1.1 }}>
                            Ready to accelerate <br /> your career trajectory?
                        </h2>
                        <p style={{ color: '#94a3b8', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto 3rem', lineHeight: 1.6 }}>
                            Join thousands of students who have already transformed their academic efforts into lucrative professional opportunities.
                        </p>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
                            <Link to="/register" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '1.2rem 2.5rem', borderRadius: '16px', background: '#0ea5e9', color: '#ffffff', textDecoration: 'none', fontWeight: 700, fontSize: '1.1rem', transition: 'all 0.3s', border: '1px solid #38bdf8', boxShadow: '0 15px 30px rgba(14,165,233,0.3)' }} onMouseEnter={e => { e.currentTarget.style.background = '#0284c7'; e.currentTarget.style.transform = 'translateY(-3px)'; }} onMouseLeave={e => { e.currentTarget.style.background = '#0ea5e9'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                                Create Free Account <ArrowUpRight size={22} />
                            </Link>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

// --- Footer ---
const Footer = () => {
    return (
        <footer style={{ background: '#f8fafc', paddingTop: '5rem', borderTop: '1px solid #e2e8f0' }}>
            <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 5%' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '4rem', marginBottom: '4rem' }}>
                    
                    {/* Brand Col */}
                    <div>
                        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', marginBottom: '1.5rem' }}>
                            <div style={{ background: '#0ea5e9', padding: '0.4rem', borderRadius: '10px', display: 'flex' }}>
                                <Sparkles size={20} color="#ffffff" />
                            </div>
                            <span className="outfit-font" style={{ fontWeight: 800, fontSize: '1.3rem', color: '#0f172a' }}>
                                Student<span style={{ color: '#0ea5e9' }}>Connect</span>
                            </span>
                        </Link>
                        <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '2rem' }}>
                            The definitive platform bridging the gap between exceptional academic talent and industry-leading enterprises globally.
                        </p>
                    </div>

                    {/* Links Col 1 */}
                    <div>
                        <h4 style={{ color: '#0f172a', fontWeight: 700, fontSize: '1.1rem', marginBottom: '1.5rem', fontFamily: 'Outfit, sans-serif' }}>Platform</h4>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {['For Students', 'For Universities', 'For Companies', 'Pricing', 'Success Stories'].map(item => (
                                <li key={item}>
                                    <a href="#" style={{ color: '#64748b', textDecoration: 'none', fontSize: '0.95rem', transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color = '#0ea5e9'} onMouseLeave={e => e.target.style.color = '#64748b'}>{item}</a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Links Col 2 */}
                    <div>
                        <h4 style={{ color: '#0f172a', fontWeight: 700, fontSize: '1.1rem', marginBottom: '1.5rem', fontFamily: 'Outfit, sans-serif' }}>Company</h4>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {['About Us', 'Careers', 'Blog', 'Press Kit', 'Contact'].map(item => (
                                <li key={item}>
                                    <a href="#" style={{ color: '#64748b', textDecoration: 'none', fontSize: '0.95rem', transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color = '#0ea5e9'} onMouseLeave={e => e.target.style.color = '#64748b'}>{item}</a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Newsletter Col */}
                    <div>
                        <h4 style={{ color: '#0f172a', fontWeight: 700, fontSize: '1.1rem', marginBottom: '1.5rem', fontFamily: 'Outfit, sans-serif' }}>Stay Updated</h4>
                        <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '1rem' }}>Subscribe to our newsletter for the latest platform updates and career tips.</p>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <input type="email" placeholder="Enter your email" style={{ flex: 1, padding: '0.8rem 1rem', borderRadius: '10px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '0.95rem' }} />
                            <button style={{ padding: '0.8rem', background: '#0f172a', color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = '#0ea5e9'} onMouseLeave={e => e.currentTarget.style.background = '#0f172a'}>
                                <ArrowRight size={20} />
                            </button>
                        </div>
                    </div>
                </div>

                <div style={{ padding: '2rem 0', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                    <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: 0 }}>&copy; {new Date().getFullYear()} StudentConnect Inc. All rights reserved.</p>
                    <div style={{ display: 'flex', gap: '1.5rem' }}>
                        {['Privacy Policy', 'Terms of Service', 'Cookie Settings'].map(item => (
                            <a key={item} href="#" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '0.9rem' }} onMouseEnter={e => e.target.style.color = '#0ea5e9'} onMouseLeave={e => e.target.style.color = '#94a3b8'}>{item}</a>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    );
};

// ==========================================
// 4. MAIN EXPORT COMPONENT
// ==========================================

const Home = () => {
    // Scroll to top on mount
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div style={{ position: 'relative', minHeight: '100vh', backgroundColor: '#ffffff' }}>
            {/* Inject Global Styles */}
            <style dangerouslySetInnerHTML={{ __html: globalStyles }} />
            
            {/* Navigation */}
            <Navbar />

            {/* Main Content Sections */}
            <HeroSection />
            <ScrollVideoSection />
            <FeaturesSection />
            <StatsSection />
            <TimelineSection />
            <CTASection />

            {/* Footer */}
            <Footer />
        </div>
    );
};

export default Home;