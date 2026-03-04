import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
    motion, 
    AnimatePresence, 
    useMotionValue, 
    useSpring, 
    useTransform 
} from 'framer-motion';
import { X, AlertCircle, CheckCircle, Info, RefreshCw } from 'lucide-react';

// ============================================================================
// MOTION PHYSICS & DESIGN TOKENS (Antigravity System)
// ============================================================================
const PHYSICS = {
    springPrimary: { type: 'spring', stiffness: 400, damping: 30, mass: 0.8 },
    springSnappy: { type: 'spring', stiffness: 500, damping: 25, mass: 0.5 },
    springFluid: { type: 'spring', stiffness: 200, damping: 20, mass: 1 },
    easeCinematic: { type: 'tween', ease: [0.16, 1, 0.3, 1], duration: 0.6 }
};

const THEME = {
    error: { 
        bg: 'rgba(254, 242, 242, 0.75)', border: 'rgba(254, 202, 202, 0.8)', 
        text: '#991B1B', icon: '#EF4444', glow: 'rgba(239, 68, 68, 0.15)',
        gradient: 'linear-gradient(135deg, #F87171, #EF4444)'
    },
    success: { 
        bg: 'rgba(236, 253, 245, 0.75)', border: 'rgba(167, 243, 208, 0.8)', 
        text: '#065F46', icon: '#10B981', glow: 'rgba(16, 185, 129, 0.15)',
        gradient: 'linear-gradient(135deg, #34D399, #10B981)'
    },
    info: { 
        bg: 'rgba(239, 246, 255, 0.75)', border: 'rgba(191, 219, 254, 0.8)', 
        text: '#1E40AF', icon: '#2563EB', glow: 'rgba(37, 99, 235, 0.15)',
        gradient: 'linear-gradient(135deg, #60A5FA, #2563EB)'
    },
};

const ICONS = {
    error: AlertCircle,
    success: CheckCircle,
    info: Info,
};

// ============================================================================
// CORE ABSTRACTIONS & REUSABLE MOTION COMPONENTS
// ============================================================================

const MagneticAction = ({ children, onClick, style }) => {
    const ref = useRef(null);
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const springX = useSpring(x, PHYSICS.springSnappy);
    const springY = useSpring(y, PHYSICS.springSnappy);

    const handleMouseMove = (e) => {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        x.set((e.clientX - centerX) * 0.3); // Magnetic pull strength
        y.set((e.clientY - centerY) * 0.3);
    };

    const handleMouseLeave = () => { x.set(0); y.set(0); };

    return (
        <motion.button
            ref={ref}
            onClick={onClick}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            style={{ ...style, x: springX, y: springY, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer', padding: '4px', borderRadius: '50%' }}
        >
            {children}
        </motion.button>
    );
};

const DynamicIcon = ({ type, color }) => {
    const Icon = ICONS[type] || Info;
    
    return (
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px' }}>
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                style={{ position: 'absolute', inset: 0, border: `1px dashed ${color}60`, borderRadius: '50%' }}
            />
            <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                style={{ position: 'absolute', inset: '4px', background: `${color}20`, borderRadius: '50%', filter: 'blur(2px)' }}
            />
            <motion.div initial={{ scale: 0, rotate: -45 }} animate={{ scale: 1, rotate: 0 }} transition={{ ...PHYSICS.springSnappy, delay: 0.1 }}>
                <Icon size={18} color={color} strokeWidth={2.5} style={{ position: 'relative', zIndex: 1 }} />
            </motion.div>
        </div>
    );
};

const LifespanProgress = ({ duration, color }) => {
    return (
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '3px', background: 'rgba(0,0,0,0.05)', overflow: 'hidden' }}>
            <motion.div
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: duration / 1000, ease: "linear" }}
                style={{ height: '100%', background: color, boxShadow: `0 0 8px ${color}` }}
            />
        </div>
    );
};

// ============================================================================
// PRESERVED BUSINESS LOGIC & STATE MANAGEMENT
// ============================================================================

let toastId = 0;
let addToastFn = null;

export const toast = {
    success: (message, options) => addToastFn?.({ message, type: 'success', ...options }),
    error: (message, options) => addToastFn?.({ message, type: 'error', ...options }),
    info: (message, options) => addToastFn?.({ message, type: 'info', ...options }),
};

// ============================================================================
// DOMAIN COMPONENTS (Antigravity Render Layer)
// ============================================================================

const ToastItem = ({ toast: t, onDismiss, index, total }) => {
    const theme = THEME[t.type] || THEME.info;
    const duration = t.duration || 4000;

    // Preserved Auto-dismiss Logic
    useEffect(() => {
        const timer = setTimeout(() => onDismiss(t.id), duration);
        return () => clearTimeout(timer);
    }, [t.id, duration, onDismiss]);

    // Spatial Stacking Calculation (Optional visual enhancement)
    const isNewest = index === total - 1;

    return (
        <motion.div
            layout="position"
            initial={{ opacity: 0, y: 40, scale: 0.9, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, x: 100, scale: 0.9, filter: 'blur(10px)' }}
            transition={PHYSICS.springPrimary}
            
            // Swipe-to-dismiss physics
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.7}
            onDragEnd={(e, { offset, velocity }) => {
                if (offset.x > 100 || velocity.x > 500) onDismiss(t.id);
            }}

            style={{ position: 'relative', width: '100%', maxWidth: '420px', display: 'flex', justifyContent: 'flex-end', pointerEvents: 'auto', touchAction: 'none' }}
        >
            {/* Ambient Shadow/Glow */}
            <div style={{ position: 'absolute', inset: '10px', background: theme.glow, filter: 'blur(20px)', zIndex: 0, borderRadius: '24px' }} />

            {/* Glassmorphic Substrate */}
            <motion.div
                style={{
                    position: 'relative', zIndex: 1, width: '100%', overflow: 'hidden',
                    background: theme.bg, backdropFilter: 'blur(24px) saturate(150%)', WebkitBackdropFilter: 'blur(24px)',
                    border: `1px solid ${theme.border}`, borderRadius: '20px',
                    boxShadow: '0 20px 40px -10px rgba(0,0,0,0.08), inset 0 2px 4px rgba(255,255,255,0.4)',
                    display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.25rem',
                }}
            >
                {/* Initial Mount Sweep Reflection */}
                <motion.div
                    initial={{ x: '-100%', opacity: 0.5 }}
                    animate={{ x: '200%', opacity: 0 }}
                    transition={{ duration: 1.5, ease: "easeInOut" }}
                    style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent)', transform: 'skewX(-20deg)', zIndex: 0, pointerEvents: 'none' }}
                />

                <DynamicIcon type={t.type} color={theme.icon} />

                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', zIndex: 1 }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: 600, color: theme.text, lineHeight: 1.4, letterSpacing: '-0.01em', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                        {t.message}
                    </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', zIndex: 1 }}>
                    {t.onRetry && (
                        <MagneticAction onClick={(e) => { e.stopPropagation(); t.onRetry(); }} style={{ background: `${theme.icon}15` }}>
                            <RefreshCw size={14} color={theme.icon} strokeWidth={2.5} />
                        </MagneticAction>
                    )}
                    
                    <div style={{ width: '1px', height: '24px', background: `${theme.border}`, margin: '0 0.25rem' }} />

                    <MagneticAction onClick={(e) => { e.stopPropagation(); onDismiss(t.id); }}>
                        <X size={16} color={theme.text} strokeWidth={2.5} style={{ opacity: 0.6 }} />
                    </MagneticAction>
                </div>

                {/* Duration Indicator */}
                <LifespanProgress duration={duration} color={theme.gradient} />
            </motion.div>
        </motion.div>
    );
};

const ToastContainer = () => {
    // Preserved Logic 
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((config) => {
        const id = ++toastId;
        setToasts(prev => [...prev.slice(-4), { ...config, id }]);
    }, []);

    const dismiss = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    useEffect(() => {
        addToastFn = addToast;
        return () => { addToastFn = null; };
    }, [addToast]);

    // Antigravity Render Array
    return (
        <div style={{
            position: 'fixed',
            bottom: 'clamp(1.5rem, 4vw, 3rem)',
            right: 'clamp(1.5rem, 4vw, 3rem)',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            alignItems: 'flex-end',
            pointerEvents: 'none', // Allows clicking through the container
            perspective: '1000px'
        }}>
            <AnimatePresence mode="popLayout">
                {toasts.map((t, index) => (
                    <ToastItem 
                        key={t.id} 
                        toast={t} 
                        onDismiss={dismiss} 
                        index={index}
                        total={toasts.length}
                    />
                ))}
            </AnimatePresence>
        </div>
    );
};

export default ToastContainer;