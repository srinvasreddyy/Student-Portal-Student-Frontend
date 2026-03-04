import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { createPortal } from 'react-dom';
import { projectApi } from '../../services/api';
import { toast } from '../../components/Toast';
import {
    Search, Filter, Briefcase, Code, Users, Clock, Building2,
    GraduationCap, Send, CheckCircle, X, ChevronLeft, ChevronRight,
    FileText, Link as LinkIcon, Download, ArrowRight, Sparkles, Activity, Layers, Play
} from 'lucide-react';

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
    shadowElevated: "0 32px 64px rgba(14, 165, 233, 0.08), 0 0 0 1px rgba(255,255,255,0.5) inset",
    textPrimary: "#0f172a",
    textSecondary: "#64748b",
    textMuted: "#94a3b8",
    accentSoft: "#f0f9ff",
    accentStrong: "#0ea5e9"
};

/* ─────────── Ambient Environment ─────────── */
const AmbientBackground = () => (
    <div style={{ position: "fixed", inset: 0, zIndex: -1, overflow: "hidden", pointerEvents: "none", background: "#f8fafc" }}>
        <motion.div
            animate={{ y: [0, -30, 0], opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
            style={{ position: "absolute", top: "-15%", left: "5%", width: "50vw", height: "50vw", borderRadius: "50%", background: "radial-gradient(circle, rgba(14,165,233,0.08) 0%, transparent 70%)", filter: "blur(80px)" }}
        />
        <motion.div
            animate={{ y: [0, 40, 0], x: [0, -20, 0], opacity: [0.15, 0.3, 0.15] }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            style={{ position: "absolute", bottom: "-10%", right: "-5%", width: "60vw", height: "60vw", borderRadius: "50%", background: "radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 70%)", filter: "blur(100px)" }}
        />
    </div>
);

const ShimmerSkeleton = ({ height = "100%", borderRadius = "24px" }) => (
    <div style={{ position: "relative", width: "100%", height, borderRadius, overflow: "hidden", background: "rgba(255,255,255,0.5)", border: `1px solid ${theme.glassBorder}` }}>
        <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: "200%" }}
            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
            style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.8) 50%, transparent 100%)", width: "50%" }}
        />
    </div>
);

/* ─────────── Cinematic Detail Viewer ─────────── */
const ProjectDetail = ({ project, onClose, onApply, applying }) => {
    if (!project) return null;

    const videoUrl = project.video?.url || project.videoUrl;
    const postedByType = project.postedByModel === 'Company' ? 'Company' : 'University';
    const PostedByIcon = project.postedByModel === 'Company' ? Building2 : GraduationCap;
    const hasApplied = project._hasApplied;
    const isAccepted = project._isAccepted;

    const stagger = { show: { transition: { staggerChildren: 0.05, delayChildren: 0.1 } } };
    const fadeUp = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0, transition: physics.spring } };

    return createPortal(
        <motion.div
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
            animate={{ opacity: 1, backdropFilter: "blur(24px)" }}
            exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
            transition={physics.smooth}
            onClick={onClose}
            style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(15, 23, 42, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', overflowY: 'auto' }}
        >
            <motion.div
                initial={{ scale: 0.95, y: 40, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.95, y: 20, opacity: 0 }}
                transition={physics.spring}
                onClick={e => e.stopPropagation()}
                style={{ width: '100%', maxWidth: '720px', maxHeight: '90vh', overflowY: 'auto', background: theme.glassDeep, backdropFilter: 'blur(40px)', borderRadius: 'clamp(20px, 4vw, 32px)', border: `1px solid ${theme.glassBorder}`, boxShadow: '0 60px 120px rgba(0,0,0,0.2), 0 0 0 1px rgba(255,255,255,0.5) inset', padding: 'clamp(1.5rem, 5vw, 3rem)', position: 'relative' }}
            >
                <motion.button whileHover={{ scale: 1.1, backgroundColor: "rgba(0,0,0,0.05)" }} whileTap={{ scale: 0.9 }} onClick={onClose} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'transparent', border: 'none', cursor: 'pointer', padding: '8px', borderRadius: '50%', display: 'flex', color: theme.textSecondary, transition: 'background 0.2s' }}>
                    <X size={20} />
                </motion.button>

                <motion.div variants={stagger} initial="hidden" animate="show" style={{ position: "relative", zIndex: 1 }}>
                    <motion.div variants={fadeUp} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 1rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '100px', marginBottom: '1.5rem' }}>
                        <PostedByIcon size={14} color={theme.accentStrong} />
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: theme.textSecondary, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{postedByType} Initiative</span>
                    </motion.div>

                    <motion.h2 variants={fadeUp} style={{ fontSize: 'clamp(1.5rem, 5vw, 2.2rem)', fontWeight: 800, color: theme.textPrimary, marginBottom: '1rem', lineHeight: 1.2, letterSpacing: '-0.02em' }}>
                        {project.title}
                    </motion.h2>

                    <motion.p variants={fadeUp} style={{ fontSize: '1.05rem', color: theme.textSecondary, lineHeight: 1.7, marginBottom: '2rem', fontWeight: 400 }}>
                        {project.description}
                    </motion.p>

                    <motion.div variants={fadeUp} style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '2.5rem', paddingBottom: '2.5rem', borderBottom: '1px solid #e2e8f0' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.2rem', background: '#f0f9ff', color: '#0284c7', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 600 }}>
                            <Users size={16} /> {project.availableSlots || (project.maxStudentsRequired - (project.acceptedStudents?.length || 0))} Slots Active
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.2rem', background: '#f8fafc', color: theme.textSecondary, borderRadius: '12px', fontSize: '0.85rem', fontWeight: 600, border: '1px solid #e2e8f0' }}>
                            <Clock size={16} /> {project.durationInWeeks} Weeks Lifecycle
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', padding: '0.6rem 1.2rem', background: project.status === 'open' ? '#ecfdf5' : '#fef2f2', color: project.status === 'open' ? '#059669' : '#ef4444', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            <Activity size={16} style={{ marginRight: '0.5rem' }} /> {project.status?.replace('_', ' ')}
                        </div>
                    </motion.div>

                    {project.roles?.length > 0 && (
                        <motion.div variants={fadeUp} style={{ marginBottom: '2rem' }}>
                            <h4 style={{ fontSize: '0.8rem', color: theme.textMuted, textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Briefcase size={14} /> Requisite Roles</h4>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                {project.roles.map((r, i) => <span key={i} style={{ padding: '0.5rem 1rem', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '100px', fontSize: '0.85rem', fontWeight: 600, color: theme.textPrimary, boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>{r}</span>)}
                            </div>
                        </motion.div>
                    )}

                    {project.techStack?.length > 0 && (
                        <motion.div variants={fadeUp} style={{ marginBottom: '2.5rem' }}>
                            <h4 style={{ fontSize: '0.8rem', color: theme.textMuted, textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Code size={14} /> Architecture Stack</h4>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                {project.techStack.map((t, i) => <span key={i} style={{ padding: '0.5rem 1rem', background: '#f8fafc', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600, color: theme.accentStrong, border: '1px solid #e0f2fe' }}>{t}</span>)}
                            </div>
                        </motion.div>
                    )}

                    <motion.div variants={fadeUp} style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '2.5rem' }}>
                        {videoUrl && (
                            <motion.a whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} href={videoUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.25rem', background: '#fef2f2', color: '#dc2626', borderRadius: '16px', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem' }}>
                                <Play size={16} /> Cinematic Overview
                            </motion.a>
                        )}
                        {project.projectDocuments?.length > 0 && project.projectDocuments.map((doc, i) => (
                            <motion.div key={i} whileHover={{ scale: 1.02 }} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1.25rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '16px' }}>
                                <FileText size={16} color={theme.textSecondary} />
                                <span style={{ fontSize: '0.9rem', fontWeight: 500, color: theme.textPrimary }}>{doc.tag || `Document ${i + 1}`}</span>
                                {doc.url ? (
                                    <a href={doc.url} target="_blank" rel="noopener noreferrer" style={{ color: theme.accentStrong, display: 'flex' }}><LinkIcon size={14} /></a>
                                ) : doc.fileId ? (
                                    <button onClick={async () => {
                                        try {
                                            const res = await projectApi.downloadDocument(doc.fileId);
                                            const url = URL.createObjectURL(res.data);
                                            const a = document.createElement('a');
                                            a.href = url; a.download = doc.fileName || 'document';
                                            a.click(); URL.revokeObjectURL(url);
                                        } catch { toast.error('Download failed'); }
                                    }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: theme.accentStrong, display: 'flex' }}>
                                        <Download size={14} />
                                    </button>
                                ) : null}
                            </motion.div>
                        ))}
                    </motion.div>

                    {project.status === 'open' && (
                        <motion.div variants={fadeUp} style={{ paddingTop: '1.5rem', borderTop: '1px solid #e2e8f0' }}>
                            <motion.button
                                style={{ width: '100%', padding: '1.25rem', background: (hasApplied || isAccepted) ? '#f8fafc' : theme.textPrimary, color: (hasApplied || isAccepted) ? theme.textSecondary : '#fff', border: (hasApplied || isAccepted) ? '1px solid #e2e8f0' : 'none', borderRadius: '16px', fontSize: '1.1rem', fontWeight: 700, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.75rem', cursor: (hasApplied || isAccepted || applying) ? 'not-allowed' : 'pointer', transition: 'all 0.3s' }}
                                disabled={hasApplied || isAccepted || applying}
                                whileHover={!(hasApplied || isAccepted || applying) ? { scale: 1.01, boxShadow: '0 20px 40px rgba(15,23,42,0.15)' } : {}}
                                whileTap={!(hasApplied || isAccepted || applying) ? { scale: 0.98 } : {}}
                                onClick={() => !(hasApplied || isAccepted) && onApply(project._id)}
                            >
                                {applying ? (
                                    <div style={{ width: '20px', height: '20px', border: '3px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                                ) : isAccepted ? (
                                    <><CheckCircle size={20} color="#10B981" /> Proposal Accepted</>
                                ) : hasApplied ? (
                                    <><CheckCircle size={20} /> Application Registered</>
                                ) : (
                                    <><Send size={20} /> Initialize Application</>
                                )}
                            </motion.button>
                        </motion.div>
                    )}
                </motion.div>
            </motion.div>
        </motion.div>
        , document.body);
};

/* ─────────── Glass Project Card ─────────── */
const ProjectCard = ({ project, onClick }) => {
    const postedByModel = project.postedByModel;
    const Icon = postedByModel === 'Company' ? Building2 : GraduationCap;
    const slotsLeft = project.availableSlots ?? (project.maxStudentsRequired - (project.acceptedStudents?.length || 0));

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            whileHover="hover"
            onClick={onClick}
            style={{ background: theme.glass, backdropFilter: "blur(24px)", borderRadius: "24px", border: `1px solid ${theme.glassBorder}`, boxShadow: theme.shadowAmbient, padding: "2rem", cursor: "pointer", display: "flex", flexDirection: "column", position: "relative", overflow: "hidden", height: "100%" }}
        >
            <motion.div variants={{ hover: { opacity: 1 } }} initial={{ opacity: 0 }} transition={{ duration: 0.4 }} style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(14,165,233,0.05) 0%, transparent 100%)", zIndex: 0 }} />

            <div style={{ position: "relative", zIndex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.35rem 0.8rem', background: '#f8fafc', borderRadius: '100px', border: '1px solid #e2e8f0' }}>
                        <Icon size={14} color={theme.accentStrong} />
                        <span style={{ fontSize: '0.7rem', fontWeight: 700, color: theme.textSecondary, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{postedByModel}</span>
                    </div>
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', padding: '0.35rem 0.8rem', borderRadius: '100px', background: project.status === 'open' ? '#ecfdf5' : '#fef2f2', color: project.status === 'open' ? '#059669' : '#ef4444' }}>
                        {project.status}
                    </span>
                </div>

                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: theme.textPrimary, marginBottom: '0.75rem', lineHeight: 1.3 }}>{project.title}</h3>
                <p style={{ fontSize: '0.9rem', color: theme.textSecondary, lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', marginBottom: '1.5rem' }}>
                    {project.description}
                </p>

                {project.techStack?.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1.5rem' }}>
                        {project.techStack.slice(0, 3).map((t, j) => (
                            <span key={j} style={{ padding: '0.3rem 0.6rem', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.7rem', fontWeight: 600, color: theme.textSecondary }}>{t}</span>
                        ))}
                        {project.techStack.length > 3 && <span style={{ padding: '0.3rem 0.6rem', background: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: '8px', fontSize: '0.7rem', fontWeight: 600, color: theme.textMuted }}>+{project.techStack.length - 3}</span>}
                    </div>
                )}

                <div style={{ flexGrow: 1 }} />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1.25rem', borderTop: '1px solid #f1f5f9' }}>
                    <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', fontWeight: 600, color: theme.textSecondary }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Users size={14} color={theme.textMuted} /> {slotsLeft} Spots</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Clock size={14} color={theme.textMuted} /> {project.durationInWeeks}w</span>
                    </div>
                    {project._isAccepted ? (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', fontWeight: 700, color: '#10B981', background: '#ecfdf5', padding: '0.3rem 0.6rem', borderRadius: '8px' }}><CheckCircle size={12} /> Accepted</span>
                    ) : project._hasApplied ? (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', fontWeight: 700, color: theme.accentStrong, background: '#f0f9ff', padding: '0.3rem 0.6rem', borderRadius: '8px' }}><CheckCircle size={12} /> Applied</span>
                    ) : (
                        <motion.div variants={{ hover: { x: 4 } }} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.85rem', fontWeight: 700, color: theme.textPrimary }}>
                            Inspect <ArrowRight size={14} />
                        </motion.div>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

/* ═══════════ MAIN ARCHITECTURE ENGINE ═══════════ */
const Projects = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [techFilter, setTechFilter] = useState('');
    const [authorFilter, setAuthorFilter] = useState('');
    const [selectedProject, setSelectedProject] = useState(null);
    const [applying, setApplying] = useState(false);
    const [myApplications, setMyApplications] = useState(new Set());

    useEffect(() => {
        const fetchMyApps = async () => {
            try { await projectApi.getMyProjects(); } catch { /* ignore */ }
        };
        fetchMyApps();
    }, []);

    const fetchProjects = useCallback(async (pg = 1) => {
        setLoading(true);
        try {
            const params = { page: pg, limit: 12 };
            if (search.trim()) params.q = search.trim();
            if (techFilter.trim()) params.techStack = techFilter.trim();
            if (authorFilter) params.authorType = authorFilter;

            const res = await projectApi.list(params);
            const data = res.data.data || [];

            const userStr = localStorage.getItem('user');
            const userId = userStr ? JSON.parse(userStr).id : null;
            const enriched = data.map(p => ({
                ...p,
                _hasApplied: userId ? (p.appliedStudents || []).some(a => (a.studentRef?._id || a.studentRef) === userId) : false,
                _isAccepted: userId ? (p.acceptedStudents || []).some(a => (a.studentRef?._id || a.studentRef) === userId) : false,
            }));

            setProjects(enriched);
            setTotal(res.data.total || 0);
            setPage(pg);
        } catch {
            toast.error('Failed to load architecture index');
        }
        setLoading(false);
    }, [search, techFilter, authorFilter]);

    useEffect(() => { fetchProjects(); }, [fetchProjects]);

    const handleApply = async (projectId) => {
        setApplying(true);
        try {
            await projectApi.apply(projectId);
            toast.success('Application sequence initialized! 🎉');
            setProjects(prev => prev.map(p => p._id === projectId ? { ...p, _hasApplied: true } : p));
            setMyApplications(prev => new Set([...prev, projectId]));
            if (selectedProject?._id === projectId) {
                setSelectedProject(prev => ({ ...prev, _hasApplied: true }));
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Application sequence failed');
        }
        setApplying(false);
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchProjects(1);
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } }
    };

    const InputWrapStyle = { padding: '0.85rem 1rem', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '0.9rem', color: theme.textPrimary, outline: 'none', width: '100%', transition: 'all 0.2s' };

    return (
        <div style={{ minHeight: '100vh', position: 'relative', padding: 'clamp(1rem, 3vw, 2rem) clamp(0.75rem, 3vw, 1.5rem) 6rem', maxWidth: '1600px', margin: '0 auto' }}>
            <AmbientBackground />

            {/* Cinematic Header Orchestration */}
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={physics.smooth} style={{ marginBottom: '3rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                    <div style={{ background: 'linear-gradient(135deg, #0ea5e9, #3b82f6)', padding: '0.75rem', borderRadius: '16px', color: '#fff', boxShadow: '0 10px 20px rgba(14,165,233,0.2)' }}>
                        <Layers size={24} />
                    </div>
                    <span style={{ fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '2px', color: theme.accentStrong }}>Discovery Engine</span>
                </div>
                <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: 900, color: theme.textPrimary, margin: '0 0 0.5rem', lineHeight: 1.1, letterSpacing: '-0.04em' }}>
                    Project Matrix
                </h1>
                <p style={{ fontSize: '1.1rem', color: theme.textSecondary, margin: 0, maxWidth: '600px' }}>
                    Identify and interface with high-impact initiatives. {total > 0 && <span style={{ fontWeight: 700, color: theme.textPrimary }}>Tracking {total} nodes.</span>}
                </p>
            </motion.div>

            {/* Floating Filter Dock */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ ...physics.spring, delay: 0.1 }} style={{ marginBottom: '3rem', position: 'sticky', top: '1rem', zIndex: 50 }}>
                <div style={{ background: theme.glass, backdropFilter: "blur(24px)", borderRadius: "24px", border: `1px solid ${theme.glassBorder}`, boxShadow: theme.shadowElevated, padding: "1rem" }}>
                    <form onSubmit={handleSearch} style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
                        <div style={{ flex: '3 1 200px', position: 'relative' }}>
                            <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: theme.textMuted }} />
                            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Query database..." style={{ ...InputWrapStyle, paddingLeft: '2.8rem' }} onFocus={(e) => { e.target.style.borderColor = theme.accentStrong; e.target.style.boxShadow = '0 0 0 3px rgba(14,165,233,0.1)'; }} onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }} />
                        </div>
                        <div style={{ flex: '1 1 120px' }}>
                            <input value={techFilter} onChange={e => setTechFilter(e.target.value)} placeholder="Tech parameters..." style={InputWrapStyle} onFocus={(e) => { e.target.style.borderColor = theme.accentStrong; e.target.style.boxShadow = '0 0 0 3px rgba(14,165,233,0.1)'; }} onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }} />
                        </div>
                        <div style={{ flex: '1 1 120px' }}>
                            <select value={authorFilter} onChange={e => setAuthorFilter(e.target.value)} style={{ ...InputWrapStyle, cursor: 'pointer', appearance: 'none', background: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e") no-repeat right 1rem center / 1em`, paddingRight: '2.5rem' }}>
                                <option value="">Global Network</option>
                                <option value="company">Enterprise Only</option>
                                <option value="university">Academic Only</option>
                            </select>
                        </div>
                        <motion.button type="submit" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} style={{ flex: '0 0 auto', padding: '0.85rem 1.5rem', background: theme.textPrimary, color: '#fff', border: 'none', borderRadius: '12px', fontSize: '0.9rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                            <Filter size={16} /> Execute
                        </motion.button>
                    </form>
                </div>
            </motion.div>

            {/* Structural Grid */}
            {loading ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(340px, 100%), 1fr))', gap: '1.5rem' }}>
                    {[1, 2, 3, 4, 5, 6].map(i => <ShimmerSkeleton key={i} height="280px" />)}
                </div>
            ) : projects.length === 0 ? (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={physics.smooth} style={{ background: theme.glass, backdropFilter: "blur(20px)", borderRadius: "32px", border: "1px dashed #cbd5e1", padding: "6rem 2rem", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <div style={{ width: "80px", height: "80px", background: "#f1f5f9", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1.5rem" }}>
                        <Search size={32} color={theme.textMuted} />
                    </div>
                    <h3 style={{ fontSize: "1.5rem", fontWeight: 800, color: theme.textPrimary, margin: "0 0 0.5rem" }}>Zero Configurations Found</h3>
                    <p style={{ color: theme.textSecondary, maxWidth: "400px", margin: 0 }}>Adjust your parameters to locate available nodes within the ecosystem.</p>
                </motion.div>
            ) : (
                <motion.div variants={containerVariants} initial="hidden" animate="show" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(340px, 100%), 1fr))', gap: '1.5rem' }}>
                    <AnimatePresence>
                        {projects.map((project) => (
                            <ProjectCard key={project._id} project={project} onClick={() => setSelectedProject(project)} />
                        ))}
                    </AnimatePresence>
                </motion.div>
            )}

            {/* Orchestrated Pagination */}
            {total > 12 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '4rem' }}>
                    <motion.button whileHover={page > 1 ? { scale: 1.05 } : {}} whileTap={page > 1 ? { scale: 0.95 } : {}} disabled={page <= 1} onClick={() => fetchProjects(page - 1)} style={{ padding: '0.75rem 1.5rem', background: page <= 1 ? 'transparent' : '#fff', color: page <= 1 ? theme.textMuted : theme.textPrimary, border: `1px solid ${page <= 1 ? '#e2e8f0' : '#cbd5e1'}`, borderRadius: '100px', fontWeight: 700, cursor: page <= 1 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: page <= 1 ? 'none' : '0 4px 12px rgba(0,0,0,0.05)' }}>
                        <ChevronLeft size={16} /> Regression
                    </motion.button>
                    <span style={{ fontSize: '0.9rem', fontWeight: 600, color: theme.textSecondary, padding: '0 1rem', background: 'rgba(255,255,255,0.5)', backdropFilter: 'blur(10px)', borderRadius: '100px', height: '40px', display: 'flex', alignItems: 'center' }}>
                        Epoch {page} / {Math.ceil(total / 12)}
                    </span>
                    <motion.button whileHover={projects.length >= 12 ? { scale: 1.05 } : {}} whileTap={projects.length >= 12 ? { scale: 0.95 } : {}} disabled={projects.length < 12} onClick={() => fetchProjects(page + 1)} style={{ padding: '0.75rem 1.5rem', background: projects.length < 12 ? 'transparent' : theme.textPrimary, color: projects.length < 12 ? theme.textMuted : '#fff', border: `1px solid ${projects.length < 12 ? '#e2e8f0' : theme.textPrimary}`, borderRadius: '100px', fontWeight: 700, cursor: projects.length < 12 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: projects.length < 12 ? 'none' : '0 10px 20px rgba(15,23,42,0.15)' }}>
                        Progression <ChevronRight size={16} />
                    </motion.button>
                </motion.div>
            )}

            {/* Spatial Overlay */}
            <AnimatePresence>
                {selectedProject && (
                    <ProjectDetail project={selectedProject} onClose={() => setSelectedProject(null)} onApply={handleApply} applying={applying} />
                )}
            </AnimatePresence>
        </div>
    );
};

export default Projects;