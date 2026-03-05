import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import { createPortal } from "react-dom";
import { studentApi, projectApi } from "../../services/api";
import { toast } from "../../components/Toast";
import {
  FolderOpen,
  Plus,
  X,
  Upload,
  Link as LinkIcon,
  Image as ImageIcon,
  Video,
  FileText,
  Trash2,
  ExternalLink,
  Download,
  Eye,
  Tag,
  Code,
  Globe,
  Briefcase,
  Clock,
  Sparkles,
  Layers,
  ChevronRight,
  ArrowRight
} from "lucide-react";

/* ─────────── Motion Physics & Theme ─────────── */
const physics = {
  spring: { type: "spring", stiffness: 400, damping: 30, mass: 0.8 },
  float: { type: "spring", stiffness: 200, damping: 20, mass: 1 },
  morph: { type: "spring", stiffness: 350, damping: 25 },
  smooth: { type: "tween", ease: [0.22, 1, 0.36, 1], duration: 0.6 }
};

const theme = {
  glass: "rgba(255, 255, 255, 0.7)",
  glassBorder: "rgba(255, 255, 255, 0.4)",
  glassHighlight: "rgba(255, 255, 255, 0.8)",
  shadowAmbient: "0 24px 48px rgba(15, 23, 42, 0.04)",
  shadowElevated: "0 32px 64px rgba(14, 165, 233, 0.08), 0 0 0 1px rgba(255,255,255,0.5) inset",
  textPrimary: "#0f172a",
  textSecondary: "#64748b",
  textMuted: "#94a3b8",
  accentSoft: "#f0f9ff",
  accentStrong: "#0ea5e9"
};

/* ─────────── Core Utilities ─────────── */
const DEFAULT_COVERS = [
  "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1504639725590-34d0984388bd?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1627398246654-e8f3fb8d43dc?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=800&auto=format&fit=crop",
];

const getFallbackImage = (id) => {
  if (!id) return DEFAULT_COVERS[0];
  const charCode = id.charCodeAt(id.length - 1);
  return DEFAULT_COVERS[charCode % DEFAULT_COVERS.length];
};

const getCoverUrl = (url, id) => {
  if (!url) return getFallbackImage(id);
  if (url.startsWith("/")) {
    const base = (import.meta.env.VITE_API_BASE_URL || "http://localhost:5000").replace(/\/$/, "");
    const cleanPath = url.replace(/^\/api\//, "/");
    return `${base}${cleanPath}`;
  }
  return url;
};

/* ─────────── UI Primitives ─────────── */
const ShimmerSkeleton = ({ height = "100%", borderRadius = "16px" }) => (
  <div style={{ position: "relative", width: "100%", height, borderRadius, overflow: "hidden", background: "#f8fafc" }}>
    <motion.div
      initial={{ x: "-100%" }}
      animate={{ x: "200%" }}
      transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
      style={{
        position: "absolute",
        inset: 0,
        background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.6) 50%, transparent 100%)",
        width: "50%",
      }}
    />
  </div>
);

const AmbientBackground = () => (
  <div style={{ position: "fixed", inset: 0, zIndex: -1, overflow: "hidden", pointerEvents: "none", background: "#f8fafc" }}>
    <motion.div
      animate={{ y: [0, -20, 0], opacity: [0.3, 0.5, 0.3] }}
      transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      style={{ position: "absolute", top: "-10%", left: "10%", width: "40vw", height: "40vw", borderRadius: "50%", background: "radial-gradient(circle, rgba(14,165,233,0.1) 0%, transparent 70%)", filter: "blur(60px)" }}
    />
    <motion.div
      animate={{ y: [0, 30, 0], x: [0, -20, 0], opacity: [0.2, 0.4, 0.2] }}
      transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      style={{ position: "absolute", bottom: "-10%", right: "-5%", width: "50vw", height: "50vw", borderRadius: "50%", background: "radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)", filter: "blur(80px)" }}
    />
  </div>
);

/* ─────────── Cinematic Viewer (Immersive) ─────────── */
const ImmersiveViewer = ({ item, onClose }) => {
  const [blobUrl, setBlobUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [projectDetails, setProjectDetails] = useState(null);
  const isMobile = window.innerWidth < 768;

  useEffect(() => {
    if (!item) return;
    if (item.source === "app" && item.projectRef) {
      const projId = typeof item.projectRef === "object" ? item.projectRef._id : item.projectRef;
      if (projId) {
        projectApi.getOne(projId).then((res) => setProjectDetails(res.data.data || res.data)).catch(() => { });
      }
    }
    if (item.url) { setLoading(false); return; }
    if (item.fileId) {
      const load = async () => {
        try {
          const res = await studentApi.downloadPortfolioItem(item._id);
          const url = URL.createObjectURL(res.data);
          setBlobUrl(url);
        } catch { toast.error("Failed to load file"); }
        setLoading(false);
      };
      load();
      return () => { if (blobUrl) URL.revokeObjectURL(blobUrl); };
    }
    setLoading(false);
  }, [item]);

  if (!item) return null;

  const src = item.url || blobUrl;
  const isImage = item.type === "image" || item.mimeType?.startsWith("image/");
  const isVideo = item.type === "video" || item.mimeType?.startsWith("video/");
  const isAppProject = item.source === "app";
  const hasMedia = src && (isImage || isVideo);

  let MediaContent = null;
  if (loading) {
    MediaContent = <ShimmerSkeleton height="100%" borderRadius="0" />;
  } else if (hasMedia) {
    if (isImage) {
      MediaContent = (
        <motion.img initial={{ scale: 1.05, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={physics.smooth}
          src={src} alt={item.title}
          style={{ width: "100%", height: "100%", objectFit: "contain", background: "#020617" }}
        />
      );
    } else {
      MediaContent = (
        <motion.video initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={physics.smooth}
          src={src} controls autoPlay
          style={{ width: "100%", height: "100%", objectFit: "contain", background: "#020617" }}
        />
      );
    }
  } else {
    const fallbackSrc = getCoverUrl(item.coverImage, item._id);
    MediaContent = (
      <div style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden", background: "#020617" }}>
        <motion.img initial={{ scale: 1.1 }} animate={{ scale: 1 }} transition={{ duration: 1.5, ease: "easeOut" }}
          src={fallbackSrc} alt="Cover" style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.4, filter: "blur(10px)" }}
        />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(2,6,23,0) 0%, rgba(2,6,23,0.8) 100%)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={physics.float}>
            <FileText size={80} color="rgba(255,255,255,0.9)" style={{ filter: "drop-shadow(0 20px 30px rgba(0,0,0,0.5))" }} />
          </motion.div>
        </div>
      </div>
    );
  }

  const stagger = { show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } } };
  const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: physics.spring } };

  return createPortal(
    <motion.div initial={{ opacity: 0, backdropFilter: "blur(0px)" }} animate={{ opacity: 1, backdropFilter: "blur(40px)" }} exit={{ opacity: 0, backdropFilter: "blur(0px)" }} transition={physics.smooth} onClick={onClose}
      style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(2, 6, 23, 0.6)", display: "flex", alignItems: "center", justifyContent: "center", padding: isMobile ? "1rem" : "3rem", overflowY: "auto" }}
    >
      <motion.div initial={{ scale: 0.96, y: 40, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.98, y: 20, opacity: 0 }} transition={physics.spring} onClick={(e) => e.stopPropagation()}
        style={{ width: "100%", maxWidth: "1400px", maxHeight: isMobile ? "95vh" : "85vh", background: theme.glass, backdropFilter: "blur(40px)", borderRadius: isMobile ? "20px" : "32px", overflow: "hidden", display: "flex", flexDirection: isMobile ? "column" : "row", boxShadow: "0 60px 120px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.2) inset" }}
      >
        {/* Cinematic Media Panel */}
        <div style={{ flex: isMobile ? "none" : "1.4", height: isMobile ? "180px" : "100%", minHeight: isMobile ? "180px" : undefined, background: "#020617", position: "relative", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <motion.button whileHover={{ scale: 1.1, backgroundColor: "rgba(255,255,255,0.2)" }} whileTap={{ scale: 0.95 }} onClick={onClose}
            style={{ position: "absolute", top: "1.5rem", left: "1.5rem", zIndex: 10, background: "rgba(255,255,255,0.1)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.1)", width: "44px", height: "44px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", cursor: "pointer", transition: "background 0.2s" }}
          >
            <X size={20} />
          </motion.button>
          {MediaContent}
        </div>

        {/* Intelligence Context Panel */}
        <motion.div variants={stagger} initial="hidden" animate="show"
          style={{ flex: "1", padding: isMobile ? "1.25rem 1rem" : "3.5rem", display: "flex", flexDirection: "column", background: "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)", overflowY: "auto" }}
        >
          <motion.div variants={fadeUp}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", padding: "0.4rem 1rem", background: isAppProject ? "#f0f9ff" : "#fdf4ff", color: isAppProject ? "#0284c7" : "#c026d3", borderRadius: "100px", fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", marginBottom: isMobile ? "0.75rem" : "1.5rem", border: `1px solid ${isAppProject ? '#e0f2fe' : '#fae8ff'}` }}>
              {isAppProject ? <><Layers size={14} /> Ecosystem Project</> : <><Sparkles size={14} /> Uploaded Asset</>}
            </div>
            <h2 style={{ fontSize: isMobile ? "1.4rem" : "2.5rem", fontWeight: 800, color: theme.textPrimary, margin: isMobile ? "0 0 0.5rem" : "0 0 1rem", lineHeight: 1.1, letterSpacing: "-0.03em" }}>{item.title}</h2>
          </motion.div>

          {item.description && (
            <motion.p variants={fadeUp} style={{ fontSize: "1.1rem", color: theme.textSecondary, lineHeight: 1.7, margin: "0 0 2rem", fontWeight: 400 }}>
              {item.description}
            </motion.p>
          )}

          {item.tags?.length > 0 && (
            <motion.div variants={fadeUp} style={{ marginBottom: isMobile ? "1rem" : "2.5rem" }}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                {item.tags.map((t) => (
                  <span key={t} style={{ padding: "0.5rem 1rem", background: "#fff", border: "1px solid #e2e8f0", color: theme.textSecondary, borderRadius: "12px", fontSize: "0.85rem", fontWeight: 600, boxShadow: "0 2px 4px rgba(0,0,0,0.02)" }}>
                    {t}
                  </span>
                ))}
              </div>
            </motion.div>
          )}

          {isAppProject && projectDetails && (
            <motion.div variants={fadeUp} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "24px", padding: "2rem", boxShadow: theme.shadowAmbient, marginBottom: "2rem" }}>
              <h4 style={{ margin: "0 0 1.5rem", fontSize: "0.85rem", color: theme.textPrimary, display: "flex", alignItems: "center", gap: "0.5rem", textTransform: "uppercase", letterSpacing: "1px", fontWeight: 700 }}>
                <Briefcase size={16} color="#8b5cf6" /> Deep Dive Analytics
              </h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                {projectDetails.techStack?.length > 0 && (
                  <div>
                    <div style={{ fontSize: "0.75rem", color: theme.textMuted, textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.5px", marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                      <Code size={14} /> Core Technologies
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                      {projectDetails.techStack.map((t, i) => (
                        <span key={i} style={{ padding: "0.4rem 0.8rem", background: "#f8fafc", color: "#0ea5e9", borderRadius: "8px", fontSize: "0.8rem", fontWeight: 600, border: "1px solid #e0f2fe" }}>{t}</span>
                      ))}
                    </div>
                  </div>
                )}
                {projectDetails.roles?.length > 0 && (
                  <div>
                    <div style={{ fontSize: "0.75rem", color: theme.textMuted, textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.5px", marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                      <Briefcase size={14} /> Execution Roles
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                      {projectDetails.roles.map((r, i) => (
                        <span key={i} style={{ padding: "0.4rem 0.8rem", background: "#fcf5ff", color: "#d946ef", borderRadius: "8px", fontSize: "0.8rem", fontWeight: 600, border: "1px solid #fae8ff" }}>{r}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          <div style={{ flexGrow: 1 }} />

          <motion.div variants={fadeUp} style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", paddingTop: isMobile ? "1rem" : "2rem", borderTop: "1px solid #e2e8f0" }}>
            {item.url && !item.url.startsWith("/") && (
              <motion.a whileHover={{ y: -2, boxShadow: "0 20px 40px rgba(15,23,42,0.15)" }} whileTap={{ scale: 0.98 }}
                href={item.url} target="_blank" rel="noopener noreferrer"
                style={{ flex: 1, minWidth: "120px", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", padding: isMobile ? "0.75rem 1rem" : "1rem 1.5rem", background: theme.textPrimary, color: "#fff", borderRadius: "16px", textDecoration: "none", fontWeight: 600, fontSize: isMobile ? "0.9rem" : "1rem", transition: "background 0.2s" }}
              >
                <ExternalLink size={isMobile ? 16 : 18} /> View Live Artifact
              </motion.a>
            )}
            {item.fileId && !isImage && !isVideo && (
              <motion.a whileHover={{ y: -2, background: "#e0f2fe" }} whileTap={{ scale: 0.98 }}
                href={`${import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"}/students/me/portfolio/${item._id}/download`} download
                style={{ flex: 1, minWidth: "120px", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", padding: isMobile ? "0.75rem 1rem" : "1rem 1.5rem", background: "#f0f9ff", color: "#0284c7", border: "1px solid #bae6fd", borderRadius: "16px", textDecoration: "none", fontWeight: 600, fontSize: isMobile ? "0.9rem" : "1rem", transition: "background 0.2s" }}
              >
                <Download size={isMobile ? 16 : 18} /> Download Asset
              </motion.a>
            )}
            {isAppProject && projectDetails?.sourceCodeUrl && (
              <motion.a whileHover={{ y: -2, background: "#dcfce7" }} whileTap={{ scale: 0.98 }}
                href={projectDetails.sourceCodeUrl} target="_blank" rel="noopener noreferrer"
                style={{ flex: 1, minWidth: "120px", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", padding: isMobile ? "0.75rem 1rem" : "1rem 1.5rem", background: "#f0fdf4", color: "#166534", border: "1px solid #bbf7d0", borderRadius: "16px", textDecoration: "none", fontWeight: 600, fontSize: isMobile ? "0.9rem" : "1rem" }}
              >
                <Code size={isMobile ? 16 : 18} /> Source Code
              </motion.a>
            )}
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
    , document.body);
};

/* ─────────── Stable Input Wrapper (module-level to prevent focus loss) ─────────── */
const InputWrapper = ({ label, children }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "1.25rem" }}>
    <label style={{ fontSize: "0.85rem", fontWeight: 600, color: theme.textPrimary, letterSpacing: "0.3px" }}>{label}</label>
    {children}
  </div>
);

/* ─────────── Dynamic Morphing Modal (Add Item) ─────────── */
const AddItemModal = ({ onClose, onAdded }) => {
  const [mode, setMode] = useState("link");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [url, setUrl] = useState("");
  const [tags, setTags] = useState("");
  const [file, setFile] = useState(null);
  const [coverImageFile, setCoverImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef(null);
  const coverRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);
    try {
      let uploadedCoverUrl = null;
      if (coverImageFile) {
        const coverFd = new FormData();
        coverFd.append("file", coverImageFile);
        const coverRes = await studentApi.uploadImage(coverFd);
        uploadedCoverUrl = coverRes.data.url;
      }
      if (mode === "link") {
        if (!url.trim()) { toast.error("Please provide a URL"); setLoading(false); return; }
        await studentApi.addPortfolioLink({
          title, description, url: url.trim(), tags: tags.split(",").map((t) => t.trim()).filter(Boolean), coverImage: uploadedCoverUrl,
        });
      } else {
        if (!file) { toast.error("Please select a file"); setLoading(false); return; }
        const fd = new FormData();
        fd.append("title", title); fd.append("description", description); fd.append("tags", tags);
        if (uploadedCoverUrl) fd.append("coverImage", uploadedCoverUrl);
        fd.append("file", file);
        await studentApi.addPortfolioItem(fd);
      }
      toast.success("Portfolio item added!");
      onAdded();
      onClose();
    } catch (err) { toast.error(err.response?.data?.message || "Failed to add item"); }
    setLoading(false);
  };

  const sharedInputStyle = { width: "100%", padding: "0.9rem 1rem", borderRadius: "12px", border: "1px solid #e2e8f0", background: "#f8fafc", fontSize: "0.95rem", color: theme.textPrimary, outline: "none", transition: "all 0.2s ease" };

  return createPortal(
    <motion.div initial={{ opacity: 0, backdropFilter: "blur(0px)" }} animate={{ opacity: 1, backdropFilter: "blur(12px)" }} exit={{ opacity: 0, backdropFilter: "blur(0px)" }} onClick={onClose}
      style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(15,23,42,0.4)", display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "1rem", overflowY: "auto", WebkitOverflowScrolling: "touch" }}
    >
      <motion.div initial={{ scale: 0.9, y: 30, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.95, y: 20, opacity: 0 }} transition={physics.spring} onClick={(e) => e.stopPropagation()}
        style={{ width: "100%", maxWidth: "540px", background: theme.glassHighlight, backdropFilter: "blur(40px)", borderRadius: "32px", border: "1px solid rgba(255,255,255,0.6)", boxShadow: "0 40px 80px rgba(0,0,0,0.1), 0 0 0 1px rgba(255,255,255,0.4) inset", padding: "clamp(1.5rem, 5vw, 2.5rem)", position: "relative", margin: "auto 0", flexShrink: 0 }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
          <div>
            <h3 style={{ fontSize: "1.5rem", fontWeight: 800, color: theme.textPrimary, margin: 0 }}>Add Artifact</h3>
            <p style={{ fontSize: "0.9rem", color: theme.textSecondary, margin: "0.25rem 0 0" }}>Expand your universe of work.</p>
          </div>
          <motion.button whileHover={{ scale: 1.1, rotate: 90 }} whileTap={{ scale: 0.9 }} onClick={onClose}
            style={{ background: "#f1f5f9", border: "none", width: "36px", height: "36px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: theme.textSecondary }}
          >
            <X size={18} />
          </motion.button>
        </div>

        {/* Dynamic Island Morphing Segmented Control */}
        <div style={{ display: "flex", background: "#f1f5f9", borderRadius: "16px", padding: "0.35rem", marginBottom: "2rem", position: "relative" }}>
          {[{ key: "link", icon: LinkIcon, label: "URL Link" }, { key: "file", icon: Upload, label: "Upload Asset" }].map((m) => (
            <button key={m.key} onClick={() => setMode(m.key)}
              style={{ flex: 1, padding: "0.75rem", position: "relative", border: "none", background: "transparent", cursor: "pointer", outline: "none", zIndex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}
            >
              {mode === m.key && (
                <motion.div layoutId="activeTabIndicator" transition={physics.morph}
                  style={{ position: "absolute", inset: 0, background: "#fff", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}
                />
              )}
              <m.icon size={16} color={mode === m.key ? theme.textPrimary : theme.textSecondary} style={{ position: "relative", zIndex: 2 }} />
              <span style={{ position: "relative", zIndex: 2, fontWeight: 700, fontSize: "0.9rem", color: mode === m.key ? theme.textPrimary : theme.textSecondary }}>{m.label}</span>
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          <InputWrapper label="Title Requirement *">
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Next.js Enterprise Architecture" required style={sharedInputStyle} onFocus={(e) => e.target.style.background = "#fff"} onBlur={(e) => e.target.style.background = "#f8fafc"} />
          </InputWrapper>

          <InputWrapper label="Executive Summary">
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="A brief explanation of the impact..." rows={2} style={{ ...sharedInputStyle, resize: "none" }} onFocus={(e) => e.target.style.background = "#fff"} onBlur={(e) => e.target.style.background = "#f8fafc"} />
          </InputWrapper>

          <AnimatePresence mode="wait">
            <motion.div key={mode} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
              {mode === "link" ? (
                <InputWrapper label="Target URL *">
                  <input type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://" required style={sharedInputStyle} onFocus={(e) => e.target.style.background = "#fff"} onBlur={(e) => e.target.style.background = "#f8fafc"} />
                </InputWrapper>
              ) : (
                <InputWrapper label="Digital Asset *">
                  <motion.div whileHover={{ scale: 1.01, borderColor: theme.accentStrong }} onClick={() => fileRef.current?.click()}
                    style={{ border: "2px dashed #cbd5e1", borderRadius: "16px", padding: "2rem", textAlign: "center", cursor: "pointer", background: "#f8fafc", transition: "all 0.2s" }}
                  >
                    {file ? (
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
                        <div style={{ background: "#e0f2fe", padding: "1rem", borderRadius: "50%", color: "#0ea5e9" }}><FileText size={24} /></div>
                        <span style={{ fontSize: "0.9rem", fontWeight: 700, color: theme.textPrimary }}>{file.name}</span>
                        <button type="button" onClick={(e) => { e.stopPropagation(); setFile(null); }} style={{ marginTop: "0.5rem", background: "#fee2e2", color: "#ef4444", border: "none", padding: "0.4rem 1rem", borderRadius: "8px", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer" }}>Remove Selected</button>
                      </div>
                    ) : (
                      <>
                        <Upload size={28} color={theme.textMuted} style={{ margin: "0 auto 1rem", display: "block" }} />
                        <p style={{ fontSize: "0.95rem", fontWeight: 600, color: theme.textPrimary, margin: "0 0 0.25rem" }}>Click or drag to orchestrate</p>
                        <p style={{ fontSize: "0.8rem", color: theme.textSecondary, margin: 0 }}>Support for dense media (Max 20MB)</p>
                      </>
                    )}
                  </motion.div>
                  <input ref={fileRef} type="file" onChange={(e) => setFile(e.target.files[0])} style={{ display: "none" }} />
                </InputWrapper>
              )}
            </motion.div>
          </AnimatePresence>

          <InputWrapper label="Taxonomy (Comma Separated)">
            <input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="react, distributed-systems, UI" style={sharedInputStyle} onFocus={(e) => e.target.style.background = "#fff"} onBlur={(e) => e.target.style.background = "#f8fafc"} />
          </InputWrapper>

          <InputWrapper label="Cinematic Cover (Optional)">
            <motion.div whileHover={{ scale: 1.01, borderColor: theme.accentStrong }} onClick={() => coverRef.current?.click()}
              style={{ border: "1px dashed #cbd5e1", borderRadius: "12px", padding: "1.25rem", textAlign: "center", cursor: "pointer", background: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.75rem" }}
            >
              {coverImageFile ? (
                <>
                  <ImageIcon size={20} color={theme.accentStrong} />
                  <span style={{ fontSize: "0.85rem", fontWeight: 600, color: theme.textPrimary }}>{coverImageFile.name}</span>
                  <button type="button" onClick={(e) => { e.stopPropagation(); setCoverImageFile(null); }} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", display: "flex", alignItems: "center" }}><X size={16} /></button>
                </>
              ) : (
                <>
                  <ImageIcon size={20} color={theme.textMuted} />
                  <span style={{ fontSize: "0.9rem", color: theme.textSecondary, fontWeight: 500 }}>Establish visual identity...</span>
                </>
              )}
            </motion.div>
            <input ref={coverRef} type="file" accept="image/*" onChange={(e) => setCoverImageFile(e.target.files[0])} style={{ display: "none" }} />
          </InputWrapper>

          <motion.button type="submit" disabled={loading} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            style={{ width: "100%", padding: "1rem", background: theme.textPrimary, color: "#fff", border: "none", borderRadius: "16px", fontSize: "1rem", fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", marginTop: "1rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", boxShadow: "0 10px 20px rgba(15,23,42,0.1)" }}
          >
            {loading ? <ShimmerSkeleton height="20px" borderRadius="4px" /> : <><Plus size={18} /> Initialize Artifact</>}
          </motion.button>
        </form>
      </motion.div>
    </motion.div>
    , document.body);
};

/* ─────────── Glassmorphic Layered Card ─────────── */
const PortfolioCard = ({ item, onView, onDelete }) => {
  const typeConfig = {
    github: { icon: LinkIcon, color: "#334155", bg: "#f8fafc" },
    website: { icon: Globe, color: "#2563EB", bg: "#eff6ff" },
    video: { icon: Video, color: "#EF4444", bg: "#fef2f2" },
    document: { icon: FileText, color: "#F59E0B", bg: "#fffbeb" },
    image: { icon: ImageIcon, color: "#10B981", bg: "#ecfdf5" },
    project: { icon: FolderOpen, color: "#8B5CF6", bg: "#f5f3ff" },
  };
  const config = typeConfig[item.type] || typeConfig.document;
  const Icon = config.icon;

  return (
    <motion.div layout initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }} whileHover="hover" onClick={() => onView(item)}
      style={{ position: "relative", cursor: "pointer", background: "#fff", borderRadius: "24px", overflow: "hidden", display: "flex", flexDirection: "column", border: "1px solid rgba(0,0,0,0.05)", boxShadow: "0 10px 30px rgba(0,0,0,0.02)", height: "100%" }}
    >
      {/* Cinematic Hover Glow */}
      <motion.div variants={{ hover: { opacity: 1 } }} initial={{ opacity: 0 }} transition={{ duration: 0.4 }}
        style={{ position: "absolute", inset: "-1px", zIndex: -1, background: `linear-gradient(135deg, ${config.color}40, transparent)`, filter: "blur(20px)" }}
      />

      <div style={{ height: "180px", width: "100%", overflow: "hidden", position: "relative", background: config.bg }}>
        {item.coverImage || getFallbackImage(item._id) ? (
          <motion.img variants={{ hover: { scale: 1.05 } }} transition={physics.smooth}
            src={getCoverUrl(item.coverImage, item._id)} alt={item.title}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: `linear-gradient(135deg, ${config.color}20, transparent)` }}>
            <Icon size={48} color={config.color} opacity={0.5} />
          </div>
        )}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.4) 100%)" }} />

        {/* Floating Badge */}
        <div style={{ position: "absolute", bottom: "1rem", left: "1rem", display: "flex", gap: "0.5rem" }}>
          <div style={{ padding: "0.4rem 0.8rem", background: "rgba(255,255,255,0.2)", backdropFilter: "blur(12px)", borderRadius: "100px", display: "flex", alignItems: "center", gap: "0.4rem", color: "#fff", fontSize: "0.75rem", fontWeight: 700, border: "1px solid rgba(255,255,255,0.3)" }}>
            <Icon size={12} /> <span style={{ textTransform: "uppercase", letterSpacing: "0.5px" }}>{item.type}</span>
          </div>
          {item.source === "app" && (
            <div style={{ padding: "0.4rem 0.8rem", background: "rgba(14,165,233,0.9)", borderRadius: "100px", display: "flex", alignItems: "center", gap: "0.4rem", color: "#fff", fontSize: "0.75rem", fontWeight: 700, boxShadow: "0 4px 12px rgba(14,165,233,0.3)" }}>
              🚀 Native
            </div>
          )}
        </div>
      </div>

      <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", flex: 1, background: "#fff" }}>
        <h4 style={{ fontSize: "1.1rem", fontWeight: 800, color: theme.textPrimary, margin: "0 0 0.5rem", lineHeight: 1.3 }}>{item.title}</h4>
        {item.description && (
          <p style={{ fontSize: "0.85rem", color: theme.textSecondary, lineHeight: 1.6, margin: "0 0 1.5rem", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
            {item.description}
          </p>
        )}
        <div style={{ flexGrow: 1 }} />

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "1rem", borderTop: "1px solid #f1f5f9" }}>
          <motion.div variants={{ hover: { x: 5 } }} style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.8rem", fontWeight: 700, color: theme.accentStrong }}>
            Inspect <ArrowRight size={14} />
          </motion.div>
          <motion.button whileHover={{ scale: 1.1, background: "#fee2e2" }} whileTap={{ scale: 0.9 }} onClick={(e) => { e.stopPropagation(); onDelete(item._id); }}
            style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#f8fafc", border: "none", color: "#ef4444", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "background 0.2s" }}
          >
            <Trash2 size={14} />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

/* ═══════════ MAIN ARCHITECTURE ENGINE ═══════════ */
const Portfolio = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [showAdd, setShowAdd] = useState(false);
  const [viewItem, setViewItem] = useState(null);

  const fetchPortfolio = async (pg = 1) => {
    setLoading(true);
    try {
      const res = await studentApi.listPortfolio(pg, 20);
      setItems(res.data.data || []);
      setTotal(res.data.total || 0);
      setPage(pg);
    } catch {
      toast.error("Failed to load ecosystem");
    }
    setLoading(false);
  };

  useEffect(() => { fetchPortfolio(); }, []);

  const handleDelete = async (itemId) => {
    if (!window.confirm("Disengage this artifact from your ecosystem?")) return;
    try {
      setItems((prev) => prev.filter((i) => i._id !== itemId));
      await studentApi.deletePortfolioItem(itemId);
      toast.success("Artifact purged");
    } catch {
      toast.error("Decoupling failed");
      fetchPortfolio(page);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } }
  };

  return (
    <div style={{ minHeight: "100vh", position: "relative", padding: "clamp(1rem, 3vw, 2rem) clamp(0.75rem, 3vw, 1.5rem) 6rem", maxWidth: "1600px", margin: "0 auto" }}>
      <AmbientBackground />

      {/* Cinematic Header Orchestration */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={physics.smooth}
        style={{ display: "flex", flexDirection: window.innerWidth < 768 ? "column" : "row", alignItems: window.innerWidth < 768 ? "flex-start" : "flex-end", justifyContent: "space-between", marginBottom: "4rem", gap: "2rem" }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
            <div style={{ background: "linear-gradient(135deg, #0ea5e9, #3b82f6)", padding: "0.75rem", borderRadius: "16px", color: "#fff", boxShadow: "0 10px 20px rgba(14,165,233,0.2)" }}>
              <Sparkles size={24} />
            </div>
            <span style={{ fontSize: "0.85rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "2px", color: theme.accentStrong }}>Ecosystem Directory</span>
          </div>
          <h1 style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)", fontWeight: 900, color: theme.textPrimary, margin: "0 0 0.5rem", lineHeight: 1.1, letterSpacing: "-0.04em" }}>
            Portfolio Matrix
          </h1>
          <p style={{ fontSize: "1.1rem", color: theme.textSecondary, margin: 0, maxWidth: "600px" }}>
            A curated spatial layout of your highest impact operational artifacts. {total > 0 && <span style={{ fontWeight: 700, color: theme.textPrimary }}>Tracking {total} nodes.</span>}
          </p>
        </div>

        <motion.button whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(15,23,42,0.15)" }} whileTap={{ scale: 0.95 }} onClick={() => setShowAdd(true)}
          style={{ padding: "1rem 2rem", background: theme.textPrimary, color: "#fff", border: "none", borderRadius: "100px", fontSize: "1rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "0.75rem", cursor: "pointer", boxShadow: "0 10px 20px rgba(15,23,42,0.1)", whiteSpace: "nowrap" }}
        >
          <Plus size={20} /> Initialize Artifact
        </motion.button>
      </motion.div>

      {/* Grid Architecture */}
      {loading ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(320px, 100%), 1fr))", gap: "2rem" }}>
          {[1, 2, 3, 4, 5, 6].map((i) => <ShimmerSkeleton key={i} height="360px" borderRadius="24px" />)}
        </div>
      ) : items.length === 0 ? (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={physics.smooth}
          style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(20px)", borderRadius: "32px", border: "1px dashed rgba(14,165,233,0.3)", padding: "6rem 2rem", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", boxShadow: theme.shadowAmbient }}
        >
          <div style={{ width: "80px", height: "80px", background: "#f0f9ff", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1.5rem" }}>
            <FolderOpen size={40} color={theme.accentStrong} />
          </div>
          <h3 style={{ fontSize: "1.5rem", fontWeight: 800, color: theme.textPrimary, margin: "0 0 0.5rem" }}>No Artifacts Detected</h3>
          <p style={{ color: theme.textSecondary, marginBottom: "2rem", maxWidth: "400px" }}>Your ecosystem is currently a blank slate. Initialize nodes to construct your matrix.</p>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setShowAdd(true)}
            style={{ padding: "0.9rem 2rem", background: "#fff", color: theme.textPrimary, border: "1px solid #e2e8f0", borderRadius: "100px", fontSize: "0.9rem", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: "0.5rem", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}
          >
            <Plus size={16} /> Seed Ecosystem
          </motion.button>
        </motion.div>
      ) : (
        <motion.div variants={containerVariants} initial="hidden" animate="show"
          style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(320px, 100%), 1fr))", gap: "2rem" }}
        >
          <AnimatePresence>
            {items.map((item) => (
              <PortfolioCard key={item._id} item={item} onView={setViewItem} onDelete={handleDelete} />
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Orchestrated Pagination */}
      {total > 20 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
          style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "1rem", marginTop: "4rem" }}
        >
          <motion.button whileHover={page > 1 ? { scale: 1.05 } : {}} whileTap={page > 1 ? { scale: 0.95 } : {}} disabled={page <= 1} onClick={() => fetchPortfolio(page - 1)}
            style={{ padding: "0.75rem 1.5rem", background: page <= 1 ? "transparent" : "#fff", color: page <= 1 ? theme.textMuted : theme.textPrimary, border: `1px solid ${page <= 1 ? '#e2e8f0' : '#cbd5e1'}`, borderRadius: "100px", fontWeight: 700, cursor: page <= 1 ? "not-allowed" : "pointer", boxShadow: page <= 1 ? "none" : "0 4px 12px rgba(0,0,0,0.05)" }}
          >
            Regression
          </motion.button>
          <span style={{ fontSize: "0.9rem", fontWeight: 600, color: theme.textSecondary, padding: "0 1rem", background: "rgba(255,255,255,0.5)", backdropFilter: "blur(10px)", borderRadius: "100px", height: "40px", display: "flex", alignItems: "center" }}>
            Epoch {page}
          </span>
          <motion.button whileHover={items.length >= 20 ? { scale: 1.05 } : {}} whileTap={items.length >= 20 ? { scale: 0.95 } : {}} disabled={items.length < 20} onClick={() => fetchPortfolio(page + 1)}
            style={{ padding: "0.75rem 1.5rem", background: items.length < 20 ? "transparent" : theme.textPrimary, color: items.length < 20 ? theme.textMuted : "#fff", border: `1px solid ${items.length < 20 ? '#e2e8f0' : theme.textPrimary}`, borderRadius: "100px", fontWeight: 700, cursor: items.length < 20 ? "not-allowed" : "pointer", boxShadow: items.length < 20 ? "none" : "0 10px 20px rgba(15,23,42,0.15)" }}
          >
            Progression
          </motion.button>
        </motion.div>
      )}

      {/* Dimensional Modals */}
      <AnimatePresence>
        {showAdd && <AddItemModal onClose={() => setShowAdd(false)} onAdded={() => fetchPortfolio(1)} />}
      </AnimatePresence>
      <AnimatePresence>
        {viewItem && <ImmersiveViewer item={viewItem} onClose={() => setViewItem(null)} />}
      </AnimatePresence>
    </div>
  );
};

export default Portfolio;