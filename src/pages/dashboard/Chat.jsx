import React, { useState, useEffect, useMemo, useRef } from 'react';
import { StreamChat } from 'stream-chat';
import {
    Chat, Channel, ChannelList, Window, ChannelHeader,
    MessageList, MessageInput, Thread, useChatContext
} from 'stream-chat-react';
import 'stream-chat-react/dist/css/v2/index.css';
import { motion, AnimatePresence } from 'framer-motion';
import { projectApi } from '../../services/api';
import {
    ArrowLeft, Info, X, Briefcase, Code, FileText,
    Link as LinkIcon, Download, Sparkles, Activity, Layers, Play, AlertCircle
} from 'lucide-react';
import { toast } from '../../components/Toast';

const apiKey = import.meta.env.VITE_STREAM_API_KEY;

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
    shadowElevated: "0 32px 64px rgba(14, 165, 233, 0.08), 0 0 0 1px rgba(255,255,255,0.6) inset",
    textPrimary: "#0f172a",
    textSecondary: "#64748b",
    textMuted: "#94a3b8",
    accentSoft: "#f0f9ff",
    accentStrong: "#0ea5e9"
};

/* ─────────── Ambient Environment ─────────── */
const AmbientBackground = () => (
    <div style={{ position: "absolute", inset: 0, zIndex: 0, overflow: "hidden", pointerEvents: "none", background: "#f4f7fb" }}>
        <motion.div
            animate={{ y: [0, -40, 0], x: [0, 20, 0], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
            style={{ position: "absolute", top: "-10%", left: "10%", width: "50vw", height: "50vw", borderRadius: "50%", background: "radial-gradient(circle, rgba(14,165,233,0.06) 0%, transparent 70%)", filter: "blur(80px)" }}
        />
        <motion.div
            animate={{ y: [0, 30, 0], x: [0, -30, 0], opacity: [0.2, 0.5, 0.2] }}
            transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            style={{ position: "absolute", bottom: "-10%", right: "-5%", width: "60vw", height: "60vw", borderRadius: "50%", background: "radial-gradient(circle, rgba(139,92,246,0.05) 0%, transparent 70%)", filter: "blur(100px)" }}
        />
    </div>
);

const CinematicLoader = ({ message }) => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%', width: '100%', position: 'absolute', inset: 0, zIndex: 50, background: theme.glassDeep, backdropFilter: 'blur(20px)' }}>
        <div style={{ position: 'relative', width: '80px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }} style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '2px dashed #cbd5e1', borderTopColor: theme.accentStrong }} />
            <motion.div animate={{ scale: [0.8, 1.1, 0.8], opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}>
                <Layers size={24} color={theme.accentStrong} />
            </motion.div>
        </div>
        <motion.span initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} style={{ marginTop: '1.5rem', fontWeight: 600, fontSize: '0.95rem', color: theme.textSecondary, letterSpacing: '0.5px' }}>
            {message}
        </motion.span>
    </motion.div>
);

/* ─────────── Error Boundary (Cinematic) ─────────── */
class ChatErrorBoundary extends React.Component {
    constructor(props) { super(props); this.state = { hasError: false, error: null }; }
    static getDerivedStateFromError(error) { return { hasError: true, error }; }
    render() {
        if (this.state.hasError) {
            return (
                <div style={{ padding: '2rem', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
                    <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} transition={physics.spring} style={{ background: theme.glassDeep, backdropFilter: 'blur(24px)', border: '1px solid #fecaca', boxShadow: '0 40px 80px rgba(239,68,68,0.1)', borderRadius: '24px', padding: 'clamp(1.5rem, 5vw, 3rem)', maxWidth: '500px', width: '100%', textAlign: 'center' }}>
                        <div style={{ width: '64px', height: '64px', background: '#fef2f2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                            <AlertCircle size={32} color="#ef4444" />
                        </div>
                        <h3 style={{ marginTop: 0, fontSize: '1.5rem', color: theme.textPrimary, marginBottom: '1rem' }}>Communication Subsystem Failure</h3>
                        <p style={{ color: theme.textSecondary, fontSize: '0.95rem', lineHeight: 1.6, background: '#fef2f2', padding: '1rem', borderRadius: '12px', border: '1px solid #fee2e2' }}>
                            {this.state.error?.toString()}
                        </p>
                    </motion.div>
                </div>
            );
        }
        return this.props.children;
    }
}

/* ─────────── Cinematic Project Details Sidebar ─────────── */
const ProjectDetailsSidebar = ({ project, isMobile, onClose }) => {
    if (!project) return null;

    const handleDownload = async (fileId, fileName) => {
        try {
            const res = await projectApi.downloadDocument(fileId);
            const url = URL.createObjectURL(new Blob([res.data]));
            const a = document.createElement('a');
            a.href = url; a.download = fileName || 'document';
            document.body.appendChild(a); a.click(); a.remove();
            URL.revokeObjectURL(url);
        } catch { toast.error('Asset extraction failed'); }
    };

    const videoUrl = project.video?.url || project.videoUrl;
    const stagger = { show: { transition: { staggerChildren: 0.05, delayChildren: 0.1 } } };
    const fadeUp = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0, transition: physics.spring } };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: theme.glassDeep, backdropFilter: 'blur(40px)', borderLeft: isMobile ? 'none' : `1px solid ${theme.glassBorder}` }}>
            <div style={{ padding: '1.5rem', borderBottom: `1px solid ${theme.glassBorder}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.4)' }}>
                <h3 style={{ fontSize: '1.1rem', margin: 0, fontWeight: 800, color: theme.textPrimary, display: 'flex', alignItems: 'center', gap: '0.5rem', letterSpacing: '-0.02em' }}>
                    <Activity size={18} color={theme.accentStrong} /> Project Intelligence
                </h3>
                {isMobile && (
                    <motion.button whileHover={{ scale: 1.1, rotate: 90 }} whileTap={{ scale: 0.9 }} onClick={onClose} style={{ background: '#f1f5f9', border: 'none', cursor: 'pointer', padding: '8px', borderRadius: '50%', display: 'flex', color: theme.textSecondary }}>
                        <X size={16} />
                    </motion.button>
                )}
            </div>

            <motion.div variants={stagger} initial="hidden" animate="show" style={{ padding: '2rem 1.5rem', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <motion.div variants={fadeUp}>
                    <div style={{ display: 'inline-flex', padding: '0.3rem 0.8rem', background: '#f0f9ff', border: '1px solid #e0f2fe', color: '#0284c7', borderRadius: '100px', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '1rem' }}>
                        Active Initiative
                    </div>
                    <h4 style={{ fontSize: '1.4rem', fontWeight: 800, color: theme.textPrimary, marginBottom: '0.75rem', lineHeight: 1.2, letterSpacing: '-0.02em' }}>{project.title}</h4>
                    <p style={{ fontSize: '0.95rem', color: theme.textSecondary, lineHeight: 1.6, background: '#fff', padding: '1.25rem', borderRadius: '16px', border: '1px solid #f1f5f9', boxShadow: '0 4px 12px rgba(0,0,0,0.02)', margin: 0 }}>
                        {project.description}
                    </p>
                </motion.div>

                {project.roles?.length > 0 && (
                    <motion.div variants={fadeUp}>
                        <h5 style={{ fontSize: '0.75rem', color: theme.textMuted, textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <Briefcase size={14} /> Execution Roles
                        </h5>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                            {project.roles.map((r, i) => <span key={i} style={{ padding: '0.4rem 0.8rem', background: '#fff', border: '1px solid #e2e8f0', color: theme.textPrimary, borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600, boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>{r}</span>)}
                        </div>
                    </motion.div>
                )}

                {project.techStack?.length > 0 && (
                    <motion.div variants={fadeUp}>
                        <h5 style={{ fontSize: '0.75rem', color: theme.textMuted, textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <Code size={14} /> Architecture Stack
                        </h5>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                            {project.techStack.map((t, i) => <span key={i} style={{ padding: '0.4rem 0.8rem', background: '#f8fafc', color: theme.accentStrong, borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600, border: '1px solid #e0f2fe' }}>{t}</span>)}
                        </div>
                    </motion.div>
                )}

                {videoUrl && (
                    <motion.div variants={fadeUp}>
                        <motion.a whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} href={videoUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '1rem', background: '#fef2f2', color: '#dc2626', borderRadius: '12px', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem', border: '1px solid #fecaca' }}>
                            <Play size={16} /> Cinematic Overview
                        </motion.a>
                    </motion.div>
                )}

                {project.projectDocuments?.length > 0 && (
                    <motion.div variants={fadeUp}>
                        <h5 style={{ fontSize: '0.75rem', color: theme.textMuted, textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <FileText size={14} /> Artifacts
                        </h5>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {project.projectDocuments.map((doc, i) => (
                                <motion.div key={i} whileHover={{ scale: 1.02, backgroundColor: '#fff' }} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', transition: 'background 0.2s' }}>
                                    <div style={{ background: '#f1f5f9', padding: '0.4rem', borderRadius: '8px' }}>
                                        <FileText size={14} color={theme.textSecondary} />
                                    </div>
                                    <span style={{ fontSize: '0.85rem', fontWeight: 600, flex: 1, color: theme.textPrimary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.tag || `Document ${i + 1}`}</span>
                                    {doc.url ? (
                                        <a href={doc.url} target="_blank" rel="noopener noreferrer" style={{ color: theme.accentStrong, display: 'flex', padding: '0.4rem', background: '#f0f9ff', borderRadius: '8px' }}><LinkIcon size={14} /></a>
                                    ) : doc.fileId ? (
                                        <button onClick={() => handleDownload(doc.fileId, doc.fileName)} style={{ background: '#f0f9ff', border: 'none', cursor: 'pointer', color: theme.accentStrong, display: 'flex', padding: '0.4rem', borderRadius: '8px' }}>
                                            <Download size={14} />
                                        </button>
                                    ) : null}
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </motion.div>
        </div>
    );
};

/* ─────────── Floating Chat Layout ─────────── */
const ChatLayout = ({ projects, userId }) => {
    const { channel, setActiveChannel } = useChatContext();
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [showDetails, setShowDetails] = useState(window.innerWidth >= 1024);

    useEffect(() => {
        if (window.innerWidth < 768) setActiveChannel(null);
    }, []);

    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);
            setShowDetails(window.innerWidth >= 1024);
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const activeProject = useMemo(() => {
        if (!channel || !projects) return null;
        return projects.find(p => p.streamChannelId === channel.id);
    }, [channel, projects]);

    const filters = useMemo(() => {
        if (!userId) return null;
        return { type: 'messaging', members: { $in: [userId] } };
    }, [userId]);

    const showChannelList = !isMobile || (isMobile && !channel);
    const showChannel = !isMobile || (isMobile && channel);

    if (!filters) return null;

    return (
        <div style={{ display: 'flex', width: '100%', height: '100%', padding: isMobile ? '0' : '1.5rem', gap: isMobile ? '0' : '1.5rem', position: 'relative', zIndex: 1, minHeight: 0 }}>

            {/* Cinematic Channel List Island */}
            {showChannelList && (
                <motion.div layout initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={physics.spring} style={{ width: isMobile ? '100%' : '340px', background: isMobile ? '#fff' : theme.glassDeep, backdropFilter: 'blur(40px)', borderRadius: isMobile ? '0' : '24px', border: isMobile ? 'none' : `1px solid ${theme.glassBorder}`, boxShadow: isMobile ? 'none' : theme.shadowAmbient, flexShrink: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    <div style={{ padding: '1.5rem', borderBottom: `1px solid ${theme.glassBorder}`, background: 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ background: theme.accentStrong, padding: '0.5rem', borderRadius: '12px', color: '#fff', boxShadow: '0 4px 12px rgba(14,165,233,0.3)' }}>
                            <Sparkles size={18} />
                        </div>
                        <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: theme.textPrimary, letterSpacing: '-0.02em' }}>Comms Hub</h2>
                    </div>
                    <div style={{ flex: 1, overflowY: 'auto' }} className="antigravity-scroll">
                        <ChannelList filters={filters} sort={{ last_message_at: -1 }} setActiveChannelOnMount={!isMobile} />
                    </div>
                </motion.div>
            )}

            {/* Chat Area Island */}
            {showChannel && (
                <motion.div layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={physics.spring} style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, minHeight: 0, position: 'relative', background: isMobile ? '#fff' : theme.glassDeep, backdropFilter: 'blur(40px)', borderRadius: isMobile ? '0' : '24px', border: isMobile ? 'none' : `1px solid ${theme.glassBorder}`, boxShadow: isMobile ? 'none' : theme.shadowElevated, overflow: 'hidden', height: '100%' }}>
                    <Channel>
                        <Window style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                            <div style={{ display: 'flex', alignItems: 'center', borderBottom: `1px solid ${theme.glassBorder}`, background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(20px)', padding: isMobile ? '0.5rem' : '0', flexShrink: 0 }}>
                                {isMobile && (
                                    <motion.button whileTap={{ scale: 0.9 }} onClick={() => setActiveChannel(null)} style={{ padding: '0.5rem', marginLeft: '0.5rem', color: theme.textPrimary, display: 'flex', background: '#f1f5f9', border: 'none', cursor: 'pointer', borderRadius: '50%' }}>
                                        <ArrowLeft size={20} />
                                    </motion.button>
                                )}
                                <div style={{ flex: 1, minWidth: 0 }} className="cinematic-header">
                                    <ChannelHeader />
                                </div>
                                {activeProject && !isMobile && (
                                    <motion.button
                                        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                        onClick={() => setShowDetails(!showDetails)}
                                        style={{
                                            marginRight: '1.5rem', padding: '0.6rem 1rem', borderRadius: '100px', cursor: 'pointer',
                                            background: showDetails ? theme.textPrimary : '#fff',
                                            border: `1px solid ${showDetails ? theme.textPrimary : '#e2e8f0'}`,
                                            color: showDetails ? '#fff' : theme.textPrimary,
                                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                                            fontWeight: 700, fontSize: '0.8rem', transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                                        }}
                                    >
                                        <Info size={16} /> Intelligence
                                    </motion.button>
                                )}
                            </div>
                            <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                                <MessageList />
                            </div>
                            <div style={{ flexShrink: 0, borderTop: `1px solid ${theme.glassBorder}` }}>
                                <MessageInput />
                            </div>
                        </Window>
                        <Thread />
                    </Channel>

                    {/* Mobile details morphing overlay */}
                    <AnimatePresence>
                        {isMobile && showDetails && activeProject && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'absolute', inset: 0, zIndex: 100, display: 'flex', justifyContent: 'flex-end', background: 'rgba(15,23,42,0.4)', backdropFilter: 'blur(4px)' }}>
                                <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={physics.spring} style={{ width: '85%', maxWidth: '360px', background: '#fff', height: '100%', boxShadow: '-20px 0 40px rgba(0,0,0,0.1)' }}>
                                    <ProjectDetailsSidebar project={activeProject} isMobile onClose={() => setShowDetails(false)} />
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            )}

            {/* Desktop details island */}
            <AnimatePresence>
                {!isMobile && showDetails && activeProject && showChannel && (
                    <motion.div layout initial={{ opacity: 0, x: 20, width: 0 }} animate={{ opacity: 1, x: 0, width: '360px' }} exit={{ opacity: 0, x: 20, width: 0 }} transition={physics.spring} style={{ flexShrink: 0, borderRadius: '24px', overflow: 'hidden', border: `1px solid ${theme.glassBorder}`, boxShadow: theme.shadowAmbient }}>
                        <ProjectDetailsSidebar project={activeProject} isMobile={false} onClose={() => setShowDetails(false)} />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

/* ═══════════ MAIN CHAT ORCHESTRATION ═══════════ */
const StudentChat = () => {
    const [client, setClient] = useState(null);
    const [userId, setUserId] = useState(null);
    const [initError, setInitError] = useState(null);
    const [projects, setProjects] = useState([]);

    useEffect(() => {
        if (!apiKey) {
            setInitError('VITE_STREAM_API_KEY initialization parameter missing.');
            return;
        }

        let isMounted = true;
        const chatClient = StreamChat.getInstance(apiKey);

        const init = async () => {
            try {
                const streamToken = localStorage.getItem('streamToken');
                const userStr = localStorage.getItem('user');

                if (!streamToken || !userStr) {
                    if (isMounted) setInitError('Authentication token missing. Re-initialize session.');
                    return;
                }

                const user = JSON.parse(userStr);
                const id = String(user.id || user._id);
                if (isMounted) setUserId(id);

                try {
                    const projRes = await projectApi.getMyProjects();
                    if (isMounted) setProjects(projRes.data.data || []);
                } catch (e) {
                    console.warn('Ecosystem index failure', e);
                }

                if (chatClient.userID && chatClient.userID !== id) {
                    await chatClient.disconnectUser();
                }

                if (!chatClient.userID) {
                    await chatClient.connectUser(
                        { id, name: user.email || 'Student Identity', role: 'user' },
                        streamToken
                    );
                }

                if (isMounted) setClient(chatClient);
            } catch (err) {
                console.error('Subsystem connection failure:', err);
                if (isMounted) setInitError(err.message || 'Subsystem initialization failed.');
            }
        };

        init();

        return () => {
            isMounted = false;
            if (chatClient) chatClient.disconnectUser();
        };
    }, []);

    if (initError) return <ChatErrorBoundary><div /></ChatErrorBoundary>;

    return (
        <div style={{ height: '100%', width: '100%', position: 'relative', background: '#f4f7fb', overflow: 'hidden', display: 'flex', flexDirection: 'column', minHeight: 0, maxHeight: '100%' }}>
            <AmbientBackground />

            <AnimatePresence>
                {(!client || !userId) && <CinematicLoader message="Establishing secure websocket..." />}
            </AnimatePresence>

            {client && userId && (
                <ChatErrorBoundary>
                    {/* ANTIGRAVITY CSS INJECTION OVERRIDE ENGINE */}
                    <style>{`
                        * {
                            box-sizing: border-box;
                        }
                        
                        body, html {
                            height: 100%;
                            margin: 0;
                            padding: 0;
                        }

                        /* Base Variables */
                        .str-chat {
                            height: 100% !important;
                            width: 100% !important;
                            --str-chat__font-family: 'Outfit', 'Inter', sans-serif !important;
                            --str-chat__primary-color: #0ea5e9 !important;
                            --str-chat__active-primary-color: #0284c7 !important;
                            --str-chat__surface-color: transparent !important;
                            --str-chat__background-color: transparent !important;
                            --str-chat__message-textarea-background-color: rgba(255,255,255,0.8) !important;
                            --str-chat__border-radius: 16px !important;
                        }
                        
                        .str-chat__container {
                            height: 100% !important;
                            display: flex;
                            flex-direction: row;
                        }

                        /* Ensure channel fills height */
                        .str-chat__channel {
                            height: 100% !important;
                            display: flex !important;
                            flex-direction: column !important;
                            min-height: 0 !important;
                        }

                        /* Eradicate Borders & Default Backgrounds */
                        .str-chat__channel-list, 
                        .str-chat__main-panel,
                        .str-chat__header-li {
                            border: none !important;
                            background: transparent !important;
                            height: 100% !important;
                        }
                        
                        .str-chat__main-panel {
                            display: flex;
                            flex-direction: column;
                            flex: 1;
                            min-width: 0;
                            min-height: 0;
                            height: 100% !important;
                        }
                        
                        .str-chat__header {
                            flex-shrink: 0;
                        }
                        
                        .str-chat__message-list-scrollable {
                            flex: 1;
                            overflow-y: auto;
                            min-height: 0;
                        }
                        
                        .str-chat__input-flat-wrapper {
                            flex-shrink: 0;
                        }

                        /* Mobile-specific height fix */
                        @media (max-width: 768px) {
                            .str-chat__main-panel {
                                max-height: 100% !important;
                            }
                            .str-chat__message-list-scroll {
                                max-height: none !important;
                            }
                        }

                        /* Channel List Styling */
                        .str-chat__channel-preview-messenger {
                            margin: 0.5rem 1rem !important;
                            border-radius: 16px !important;
                            padding: 1rem !important;
                            transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1) !important;
                            background: rgba(255,255,255,0.4) !important;
                            border: 1px solid rgba(255,255,255,0.5) !important;
                        }
                        .str-chat__channel-preview-messenger:hover {
                            background: rgba(255,255,255,0.8) !important;
                            transform: translateY(-2px);
                            box-shadow: 0 10px 20px rgba(0,0,0,0.03) !important;
                        }
                        .str-chat__channel-preview-messenger--active {
                            background: #fff !important;
                            box-shadow: 0 10px 25px rgba(14,165,233,0.1) !important;
                            border: 1px solid rgba(14,165,233,0.2) !important;
                        }
                        .str-chat__channel-preview-messenger--title {
                            font-weight: 800 !important;
                            color: #0f172a !important;
                        }

                        /* Header Overrides */
                        .str-chat__header-hamburger { display: none !important; }
                        .cinematic-header .str-chat__header-li {
                            padding: 1.5rem !important;
                        }

                        /* Message Input Area */
                        .str-chat__input-flat-wrapper {
                            padding: 1.5rem !important;
                            background: rgba(255,255,255,0.5) !important;
                            border-top: 1px solid rgba(255,255,255,0.5) !important;
                            backdrop-filter: blur(20px) !important;
                        }
                        .str-chat__input-flat {
                            background: #fff !important;
                            border-radius: 24px !important;
                            border: 1px solid #e2e8f0 !important;
                            box-shadow: 0 10px 30px rgba(0,0,0,0.04) !important;
                            padding: 0.5rem 1rem !important;
                        }
                        .str-chat__textarea textarea {
                            font-family: inherit !important;
                            font-size: 0.95rem !important;
                            color: #0f172a !important;
                        }

                        /* Message Bubbles Architecture */
                        .str-chat__li { margin-bottom: 1rem !important; }
                        
                        .str-chat__message-simple-text-inner,
                        .str-chat__message-text-inner {
                            border-radius: 20px !important;
                            padding: 0.8rem 1.2rem !important;
                            font-size: 0.95rem !important;
                            line-height: 1.5 !important;
                            box-shadow: 0 4px 12px rgba(0,0,0,0.02) !important;
                            backdrop-filter: blur(10px) !important;
                        }
                        
                        /* User's Own Messages */
                        .str-chat__message-simple--me .str-chat__message-simple-text-inner,
                        .str-chat__message-simple--me .str-chat__message-text-inner,
                        .str-chat__message--me .str-chat__message-simple-text-inner,
                        .str-chat__message--me .str-chat__message-text-inner,
                        .str-chat__message-bubble--me {
                            background: linear-gradient(135deg, #0ea5e9, #2563eb) !important;
                            color: #ffffff !important;
                            border-bottom-right-radius: 4px !important;
                            box-shadow: 0 10px 25px rgba(14,165,233,0.2) !important;
                            border: none !important;
                        }

                        /* Target all child elements inside "me" messages to ensure text is white */
                        .str-chat__message-simple--me .str-chat__message-simple-text-inner *,
                        .str-chat__message-simple--me .str-chat__message-text-inner *,
                        .str-chat__message--me .str-chat__message-simple-text-inner *,
                        .str-chat__message--me .str-chat__message-text-inner *,
                        .str-chat__message-bubble--me * {
                            color: #ffffff !important;
                        }

                        /* Others Messages */
                        .str-chat__message-simple--other .str-chat__message-simple-text-inner,
                        .str-chat__message-simple--other .str-chat__message-text-inner,
                        .str-chat__message--other .str-chat__message-simple-text-inner,
                        .str-chat__message--other .str-chat__message-text-inner,
                        .str-chat__message-bubble--other {
                            background: #ffffff !important;
                            color: #0f172a !important;
                            border-bottom-left-radius: 4px !important;
                            border: 1px solid #e2e8f0 !important;
                        }

                        .str-chat__message-simple--other .str-chat__message-simple-text-inner *,
                        .str-chat__message-simple--other .str-chat__message-text-inner *,
                        .str-chat__message--other .str-chat__message-simple-text-inner *,
                        .str-chat__message--other .str-chat__message-text-inner *,
                        .str-chat__message-bubble--other * {
                            color: #0f172a !important;
                        }

                        /* Avatar & Meta */
                        .str-chat__avatar-image { border-radius: 12px !important; }
                        .str-chat__message-simple-name { font-weight: 700 !important; color: #64748b !important; }

                        /* Scrollbar hiding for that clean Apple look */
                        .antigravity-scroll::-webkit-scrollbar { display: none; }
                        .antigravity-scroll { -ms-overflow-style: none; scrollbar-width: none; }
                    `}</style>
                    <Chat client={client} theme="str-chat__theme-light">
                        <ChatLayout projects={projects} userId={userId} />
                    </Chat>
                </ChatErrorBoundary>
            )}
        </div>
    );
};

export default StudentChat;