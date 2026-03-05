import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import NotificationDrawer from './NotificationDrawer';
import {
    User, Briefcase, FolderOpen, Search, MessageCircle,
    Bell, LogOut, Menu, X, ChevronRight, Sparkles, Activity
} from 'lucide-react';

/* ─────────── Motion Physics & Theme Engine ─────────── */
const physics = {
    spring: { type: "spring", stiffness: 400, damping: 30, mass: 0.8 },
    float: { type: "spring", stiffness: 150, damping: 20, mass: 1 },
    morph: { type: "spring", stiffness: 350, damping: 25 },
    route: { type: "tween", ease: [0.22, 1, 0.36, 1], duration: 0.4 }
};

const theme = {
    glassSidebar: "rgba(255, 255, 255, 0.75)",
    glassHeader: "rgba(255, 255, 255, 0.65)",
    glassDeep: "rgba(255, 255, 255, 0.9)",
    glassBorder: "rgba(255, 255, 255, 0.5)",
    shadowAmbient: "0 24px 48px rgba(15, 23, 42, 0.04)",
    shadowElevated: "0 12px 36px rgba(37, 99, 235, 0.06), 0 0 0 1px rgba(255,255,255,0.6) inset",
    textPrimary: "#0f172a",
    textSecondary: "#64748b",
    textMuted: "#94a3b8",
    accentSoft: "#eff6ff",
    accentStrong: "#2563eb",
};

const navItems = [
    { path: '/dashboard', label: 'Identity Profile', icon: User, end: true },
    { path: '/dashboard/portfolio', label: 'Portfolio Matrix', icon: FolderOpen },
    { path: '/dashboard/projects', label: 'Ecosystem Discovery', icon: Search },
    { path: '/dashboard/my-projects', label: 'Active Initiatives', icon: Briefcase },
    { path: '/dashboard/chat', label: 'Comms Network', icon: MessageCircle },
];

/* ─────────── Ambient Cinematic Environment ─────────── */
const AmbientEnvironment = () => (
    <div style={{ position: "fixed", inset: 0, zIndex: 0, overflow: "hidden", pointerEvents: "none", background: "linear-gradient(135deg, #F8FAFC 0%, #FFFFFF 50%, #EFF6FF 100%)" }}>
        <motion.div
            animate={{ y: [0, -30, 0], x: [0, 20, 0], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
            style={{ position: "absolute", top: "-10%", left: "-5%", width: "40vw", height: "40vw", borderRadius: "50%", background: "radial-gradient(circle, rgba(37,99,235,0.05) 0%, transparent 70%)", filter: "blur(80px)" }}
        />
        <motion.div
            animate={{ y: [0, 40, 0], x: [0, -20, 0], opacity: [0.2, 0.5, 0.2] }}
            transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            style={{ position: "absolute", bottom: "-15%", right: "-10%", width: "50vw", height: "50vw", borderRadius: "50%", background: "radial-gradient(circle, rgba(139,92,246,0.04) 0%, transparent 70%)", filter: "blur(100px)" }}
        />
    </div>
);

/* ─────────── Dynamic Sidebar Node ─────────── */
const SidebarNode = ({ isOpen, setOpen, user, onLogout }) => {
    return (
        <motion.aside
            initial={false}
            animate={{ x: 0 }}
            className="sidebar-desktop"
            style={{
                width: '280px',
                background: theme.glassSidebar,
                backdropFilter: 'blur(40px)', WebkitBackdropFilter: 'blur(40px)',
                borderRight: `1px solid ${theme.glassBorder}`,
                display: 'flex', flexDirection: 'column',
                position: 'fixed', top: 0, left: 0, bottom: 0,
                zIndex: 50,
                boxShadow: '4px 0 32px rgba(15,23,42,0.03)',
                transform: isOpen ? 'translateX(0)' : undefined,
                overflow: 'hidden'
            }}
        >
            {/* Cinematic Brand Header */}
            <div style={{ padding: '2rem 1.5rem', borderBottom: `1px solid ${theme.glassBorder}`, display: 'flex', alignItems: 'center', gap: '1rem', background: 'rgba(255,255,255,0.3)' }}>
                <motion.div
                    whileHover={{ rotate: 180, scale: 1.05 }} transition={physics.spring}
                    style={{ width: '44px', height: '44px', borderRadius: '14px', background: 'linear-gradient(135deg, #2563EB, #007AFF)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 20px rgba(37,99,235,0.25), inset 0 2px 4px rgba(255,255,255,0.3)' }}
                >
                    <Activity size={22} color="#fff" strokeWidth={2.5} />
                </motion.div>
                <div>
                    <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: theme.textPrimary, lineHeight: 1.1, letterSpacing: '-0.02em', margin: 0 }}>Ecosystem</h2>
                    <span style={{ fontSize: '0.75rem', color: theme.textSecondary, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>Student Node</span>
                </div>

                {/* Mobile Close Trigger */}
                <button
                    onClick={() => setOpen(false)} className="sidebar-close-btn"
                    style={{ marginLeft: 'auto', background: 'rgba(0,0,0,0.05)', border: 'none', cursor: 'pointer', padding: '6px', borderRadius: '50%', display: 'none', color: theme.textSecondary }}
                >
                    <X size={18} />
                </button>
            </div>

            {/* Navigational Architecture */}
            <nav style={{ flex: 1, padding: '1.5rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', overflowY: 'auto' }} className="antigravity-scroll">
                {navItems.map((item) => (
                    <NavLink key={item.path} to={item.path} end={item.end} style={{ textDecoration: 'none', outline: 'none' }}>
                        {({ isActive }) => (
                            <motion.div
                                whileHover={{ scale: isActive ? 1 : 1.02 }} whileTap={{ scale: 0.98 }}
                                style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '0.85rem', padding: '0.85rem 1.25rem', borderRadius: '16px', fontSize: '0.9rem', fontWeight: isActive ? 700 : 500, color: isActive ? theme.accentStrong : theme.textSecondary, transition: 'color 0.2s ease', zIndex: 1 }}
                            >
                                {/* Dynamic Island Active Pill */}
                                {isActive && (
                                    <motion.div
                                        layoutId="activeNavPill"
                                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                        transition={physics.morph}
                                        style={{ position: 'absolute', inset: 0, background: '#ffffff', borderRadius: '16px', boxShadow: '0 4px 12px rgba(37,99,235,0.08), inset 0 2px 4px rgba(255,255,255,0.5)', zIndex: -1, border: `1px solid ${theme.glassBorder}` }}
                                    />
                                )}

                                <item.icon size={18} style={{ position: 'relative', zIndex: 2 }} />
                                <span style={{ position: 'relative', zIndex: 2 }}>{item.label}</span>

                                {isActive && (
                                    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} style={{ marginLeft: 'auto' }}>
                                        <Sparkles size={14} color={theme.accentStrong} />
                                    </motion.div>
                                )}
                            </motion.div>
                        )}
                    </NavLink>
                ))}
            </nav>

            {/* Identity & Session Control Panel */}
            <div style={{ padding: '1.5rem', borderTop: `1px solid ${theme.glassBorder}`, background: 'rgba(255,255,255,0.4)', position: 'relative' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: '#ffffff', padding: '0.75rem', borderRadius: '20px', boxShadow: theme.shadowAmbient, border: `1px solid ${theme.glassBorder}` }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '14px', background: 'linear-gradient(135deg, #DBEAFE, #EFF6FF)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', fontWeight: 800, color: theme.accentStrong, border: '1px solid #BFDBFE' }}>
                        {(user?.email?.[0] || 'S').toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: theme.textPrimary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {user?.email || 'Student Identity'}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: theme.textSecondary, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Authenticated</div>
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.1, backgroundColor: theme.errorBg, color: theme.errorText }} whileTap={{ scale: 0.9 }}
                        onClick={onLogout}
                        style={{ background: '#f8fafc', border: '1px solid #e2e8f0', cursor: 'pointer', padding: '8px', borderRadius: '12px', display: 'flex', color: theme.textSecondary, transition: 'all 0.2s', outline: 'none' }}
                        title="Terminate Session"
                    >
                        <LogOut size={16} />
                    </motion.button>
                </div>
            </div>
        </motion.aside>
    );
};

/* ═══════════ MAIN LAYOUT ORCHESTRATION ═══════════ */
const DashboardLayout = () => {
    // ----------------------------------------------------------------------
    // CORE IMMUTABLE LOGIC
    // ----------------------------------------------------------------------
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [notifOpen, setNotifOpen] = useState(false);
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        setSidebarOpen(false);
    }, [location.pathname]);

    const handleLogout = async () => {
        await logout();
        navigate('/login', { replace: true });
    };

    const isChat = location.pathname === '/dashboard/chat';
    // ----------------------------------------------------------------------

    return (
        <div style={{ display: 'flex', minHeight: '100vh', position: 'relative', background: '#F4F7FB' }}>
            <AmbientEnvironment />

            {/* Mobile Blur Overlay */}
            <AnimatePresence>
                {sidebarOpen && (
                    <motion.div
                        initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
                        animate={{ opacity: 1, backdropFilter: 'blur(8px)' }}
                        exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
                        transition={physics.smooth}
                        onClick={() => setSidebarOpen(false)}
                        style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.4)', zIndex: 40 }}
                    />
                )}
            </AnimatePresence>

            <SidebarNode isOpen={sidebarOpen} setOpen={setSidebarOpen} user={user} onLogout={handleLogout} />

            {/* Main Operational Viewport */}
            <div className="main-content" style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh', position: 'relative', zIndex: 10 }}>

                {/* Floating Header Island */}
                <header style={{
                    height: '70px', padding: '0 clamp(0.75rem, 3vw, 2rem)', position: 'sticky', top: 0, zIndex: 30,
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    background: theme.glassHeader, backdropFilter: 'blur(40px)', WebkitBackdropFilter: 'blur(40px)',
                    borderBottom: `1px solid ${theme.glassBorder}`,
                    boxShadow: '0 10px 30px rgba(15,23,42,0.02)'
                }}>
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setSidebarOpen(true)}
                        className="hamburger-btn"
                        style={{ background: '#ffffff', border: `1px solid ${theme.glassBorder}`, cursor: 'pointer', padding: '10px', borderRadius: '12px', display: 'none', color: theme.textPrimary, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                    >
                        <Menu size={20} />
                    </motion.button>

                    <div style={{ flex: 1 }} />

                    {/* Notification Nexus */}
                    <div style={{ position: 'relative' }}>
                        <motion.button
                            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                            onClick={() => setNotifOpen(!notifOpen)}
                            style={{
                                position: 'relative', background: notifOpen ? '#ffffff' : 'rgba(255,255,255,0.5)',
                                border: `1px solid ${notifOpen ? theme.accentStrong : theme.glassBorder}`,
                                cursor: 'pointer', padding: '10px', borderRadius: '14px',
                                color: notifOpen ? theme.accentStrong : theme.textSecondary,
                                boxShadow: notifOpen ? '0 8px 24px rgba(37,99,235,0.15)' : '0 4px 12px rgba(0,0,0,0.02)',
                                transition: 'all 0.3s ease', outline: 'none'
                            }}
                        >
                            <Bell size={20} />
                            {/* Hypothetical unread indicator dot */}
                            <div style={{ position: 'absolute', top: '8px', right: '10px', width: '8px', height: '8px', background: '#EF4444', borderRadius: '50%', border: '2px solid #fff' }} />
                        </motion.button>
                    </div>
                </header>

                <NotificationDrawer isOpen={notifOpen} onClose={() => setNotifOpen(false)} />

                {/* Cinematic Route Orchestrator */}
                <main style={{ flex: 1, overflow: isChat ? 'hidden' : 'auto', position: 'relative', height: isChat ? 'calc(100vh - 70px)' : 'auto', minHeight: 0 }} className="antigravity-scroll">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={location.pathname}
                            initial={{ opacity: 0, y: 15, scale: 0.99, filter: 'blur(4px)' }}
                            animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
                            exit={{ opacity: 0, y: -15, scale: 0.99, filter: 'blur(4px)' }}
                            transition={physics.route}
                            style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
                        >
                            <Outlet />
                        </motion.div>
                    </AnimatePresence>
                </main>
            </div>

            {/* Global CSS Injection for Structure & Apple-style scrollbars */}
            <style dangerouslySetInnerHTML={{
                __html: `
                .main-content { margin-left: 280px; transition: margin 0.4s cubic-bezier(0.22, 1, 0.36, 1); }
                
                @media (max-width: 1024px) {
                    .sidebar-desktop {
                        transform: ${sidebarOpen ? 'translateX(0)' : 'translateX(-100%)'} !important;
                        transition: transform 0.4s cubic-bezier(0.22, 1, 0.36, 1);
                    }
                    .sidebar-close-btn { display: flex !important; }
                    .hamburger-btn { display: flex !important; }
                    .main-content { margin-left: 0 !important; }
                }

                /* Invisible Scrollbars (Apple style) */
                .antigravity-scroll::-webkit-scrollbar { width: 0px; background: transparent; }
                .antigravity-scroll { -ms-overflow-style: none; scrollbar-width: none; }

                @media (max-width: 480px) {
                    .sidebar-desktop { width: min(280px, 85vw) !important; }
                }
            `}} />
        </div>
    );
};

export default DashboardLayout;