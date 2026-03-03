import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { studentApi, projectApi } from "../../services/api";
import { toast } from "../../components/Toast";
import {
  FolderOpen,
  Plus,
  X,
  Upload,
  Link as LinkIcon,
  Image,
  Video,
  FileText,
  Trash2,
  ExternalLink,
  Download,
  Eye,
  ChevronLeft,
  Tag,
  Code,
  Globe,
  Briefcase,
  Clock,
} from "lucide-react";

/* ─────────── Fallback Cover Images ─────────── */
const DEFAULT_COVERS = [
  "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=800&auto=format&fit=crop", // Code
  "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=800&auto=format&fit=crop", // Laptop
  "https://images.unsplash.com/photo-1504639725590-34d0984388bd?q=80&w=800&auto=format&fit=crop", // Desk setup
  "https://images.unsplash.com/photo-1627398246654-e8f3fb8d43dc?q=80&w=800&auto=format&fit=crop", // Abstract gradient tech
  "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=800&auto=format&fit=crop", // Earth / network
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

/* ─────────── Immersive Viewer ─────────── */
const ImmersiveViewer = ({ item, onClose }) => {
  const [blobUrl, setBlobUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [projectDetails, setProjectDetails] = useState(null);

  useEffect(() => {
    if (!item) return;
    // Fetch full project details for app-completed items
    if (item.source === "app" && item.projectRef) {
      const projId =
        typeof item.projectRef === "object"
          ? item.projectRef._id
          : item.projectRef;
      if (projId) {
        projectApi
          .getOne(projId)
          .then((res) => setProjectDetails(res.data.data || res.data))
          .catch(() => { });
      }
    }
    if (item.url) {
      setLoading(false);
      return;
    }
    if (item.fileId) {
      const load = async () => {
        try {
          const res = await studentApi.downloadPortfolioItem(item._id);
          const url = URL.createObjectURL(res.data);
          setBlobUrl(url);
        } catch {
          toast.error("Failed to load file");
        }
        setLoading(false);
      };
      load();
      return () => {
        if (blobUrl) URL.revokeObjectURL(blobUrl);
      };
    }
    setLoading(false);
  }, [item]);

  if (!item) return null;

  const src = item.url || blobUrl;
  const isImage = item.type === "image" || item.mimeType?.startsWith("image/");
  const isVideo = item.type === "video" || item.mimeType?.startsWith("video/");
  const isAppProject = item.source === "app";
  const hasMedia = src && (isImage || isVideo);

  // Resolve what to show on the left panel
  let MediaContent = null;
  if (loading) {
    MediaContent = (
      <div
        className="spinner"
        style={{ margin: "auto", borderTopColor: "#0ea5e9" }}
      />
    );
  } else if (hasMedia) {
    if (isImage) {
      MediaContent = (
        <img
          src={src}
          alt={item.title}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            background: "#000",
          }}
        />
      );
    } else {
      MediaContent = (
        <video
          src={src}
          controls
          autoPlay
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            background: "#000",
          }}
        />
      );
    }
  } else {
    // Construct valid API URL safely
    const baseApiUrl = (
      import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"
    ).replace(/\/$/, "");
    const fallbackSrc = item.coverImage?.startsWith("/api")
      ? `${baseApiUrl}${item.coverImage}`
      : item.coverImage || getFallbackImage(item._id);
    MediaContent = (
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          overflow: "hidden",
        }}
      >
        <img
          src={fallbackSrc}
          alt="Cover"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            opacity: 0.8,
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to top, rgba(15,23,42,1) 0%, rgba(15,23,42,0.2) 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <FileText
            size={80}
            color="rgba(255,255,255,0.7)"
            style={{ filter: "drop-shadow(0 10px 20px rgba(0,0,0,0.5))" }}
          />
        </div>
      </div>
    );
  }

  // Sidebar animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 300, damping: 24 },
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        background: "rgba(15, 23, 42, 0.7)",
        backdropFilter: "blur(20px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1.5rem",
        cursor: "pointer",
        overflowY: "auto",
      }}
    >
      <motion.div
        initial={{ scale: 0.95, y: 30, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.95, y: 30, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: "1200px",
          maxHeight: "90vh",
          minHeight: "600px",
          background: "#ffffff",
          borderRadius: "24px",
          overflow: "hidden",
          cursor: "default",
          display: "flex",
          flexDirection: window.innerWidth < 768 ? "column" : "row",
          boxShadow:
            "0 40px 100px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.1) inset",
        }}
      >
        {/* Left Panel: Media Showcase */}
        <div
          style={{
            flex: window.innerWidth < 768 ? "none" : "6",
            height: window.innerWidth < 768 ? "300px" : "100%",
            background: "#0f172a",
            display: "flex",
            flexWrap: "wrap",
            position: "relative",
            borderRight: "1px solid #e2e8f0",
          }}
        >
          <button
            onClick={onClose}
            style={{
              position: "absolute",
              top: "1rem",
              left: "1rem",
              zIndex: 10,
              background: "rgba(15,23,42,0.5)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255,255,255,0.1)",
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.transform = "scale(1.1)")
            }
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            <X size={20} />
          </button>
          {MediaContent}
        </div>

        {/* Right Panel: Sleek Sidebar Content */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          style={{
            flex: window.innerWidth < 768 ? "none" : "4",
            padding: "2.5rem",
            display: "flex",
            flexDirection: "column",
            gap: "1.5rem",
            overflowY: "auto",
            background: "#fafafa",
          }}
        >
          <motion.div variants={itemVariants}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.4rem",
                padding: "0.3rem 0.8rem",
                background: item.source === "app" ? "#e0f2fe" : "#f3e8ff",
                color: item.source === "app" ? "#0369a1" : "#7e22ce",
                borderRadius: "20px",
                fontSize: "0.75rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "1px",
                marginBottom: "1rem",
              }}
            >
              {item.source === "app" ? (
                <>
                  <FolderOpen size={14} /> App Project
                </>
              ) : (
                <>
                  <Tag size={14} /> User Uploaded
                </>
              )}
            </div>
            <h2
              style={{
                fontSize: "1.8rem",
                fontWeight: 800,
                color: "#0f172a",
                margin: 0,
                lineHeight: 1.2,
                fontFamily: "Outfit, sans-serif",
              }}
            >
              {item.title}
            </h2>
          </motion.div>
          {item.description && (
            <motion.div variants={itemVariants}>
              <p
                style={{
                  fontSize: "0.95rem",
                  color: "#475569",
                  lineHeight: 1.6,
                  margin: 0,
                }}
              >
                {item.description}
              </p>
            </motion.div>
          )}
          <motion.div
            variants={itemVariants}
            style={{
              height: "1px",
              background: "#e2e8f0",
              width: "100%",
              margin: "0.5rem 0",
            }}
          />
          {/* Tags */}
          {item.tags?.length > 0 && (
            <motion.div variants={itemVariants}>
              <h5
                style={{
                  fontSize: "0.75rem",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                  color: "#94a3b8",
                  margin: "0 0 0.75rem 0",
                  fontWeight: 600,
                }}
              >
                Keywords & Technologies
              </h5>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                {item.tags.map((t) => (
                  <span
                    key={t}
                    style={{
                      padding: "0.4rem 0.8rem",
                      background: "#fff",
                      border: "1px solid #e2e8f0",
                      color: "#334155",
                      borderRadius: "12px",
                      fontSize: "0.8rem",
                      fontWeight: 500,
                      boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
                    }}
                  >
                    {t}
                  </span>
                ))}
              </div>
            </motion.div>
          )}
          {/* App-completed project details */}
          {isAppProject && projectDetails && (
            <motion.div
              variants={itemVariants}
              style={{
                background: "#fff",
                border: "1px solid #e2e8f0",
                borderRadius: "16px",
                padding: "1.5rem",
                boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
              }}
            >
              <h4
                style={{
                  margin: "0 0 1rem",
                  fontSize: "0.9rem",
                  color: "#0f172a",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                <Briefcase size={16} color="#8b5cf6" /> Project Deep Dive
              </h4>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1.25rem",
                }}
              >
                {projectDetails.techStack?.length > 0 && (
                  <div>
                    <div
                      style={{
                        fontSize: "0.7rem",
                        color: "#64748b",
                        textTransform: "uppercase",
                        fontWeight: 600,
                        letterSpacing: "0.5px",
                        marginBottom: "0.5rem",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.3rem",
                      }}
                    >
                      <Code size={12} /> Tech Stack
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "0.3rem",
                      }}
                    >
                      {projectDetails.techStack.map((t, i) => (
                        <span
                          key={i}
                          style={{
                            padding: "0.3rem 0.6rem",
                            background: "#f8fafc",
                            border: "1px solid #f1f5f9",
                            color: "#0ea5e9",
                            borderRadius: "8px",
                            fontSize: "0.75rem",
                            fontWeight: 600,
                          }}
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {projectDetails.roles?.length > 0 && (
                  <div>
                    <div
                      style={{
                        fontSize: "0.7rem",
                        color: "#64748b",
                        textTransform: "uppercase",
                        fontWeight: 600,
                        letterSpacing: "0.5px",
                        marginBottom: "0.5rem",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.3rem",
                      }}
                    >
                      <Briefcase size={12} /> Roles Played
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "0.3rem",
                      }}
                    >
                      {projectDetails.roles.map((r, i) => (
                        <span
                          key={i}
                          style={{
                            padding: "0.3rem 0.6rem",
                            background: "#f8fafc",
                            border: "1px solid #f1f5f9",
                            color: "#d946ef",
                            borderRadius: "8px",
                            fontSize: "0.75rem",
                            fontWeight: 600,
                          }}
                        >
                          {r}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {projectDetails.durationInWeeks && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      fontSize: "0.85rem",
                      color: "#475569",
                      fontWeight: 500,
                      background: "#f8fafc",
                      padding: "0.5rem 0.8rem",
                      borderRadius: "8px",
                      width: "fit-content",
                    }}
                  >
                    <Clock size={16} color="#64748b" />{" "}
                    {projectDetails.durationInWeeks} weeks duration
                  </div>
                )}
              </div>
            </motion.div>
          )}
          <div style={{ flexGrow: 1 }} /> {/* Spacer */}
          {/* Action Area */}
          <motion.div
            variants={itemVariants}
            style={{
              display: "flex",
              gap: "0.75rem",
              marginTop: "1rem",
              flexWrap: "wrap",
            }}
          >
            {item.url && !item.url.startsWith("/") && (
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  flex: 1,
                  minWidth: "150px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                  padding: "0.9rem 1.5rem",
                  background: "#0f172a",
                  color: "#fff",
                  borderRadius: "12px",
                  textDecoration: "none",
                  fontWeight: 600,
                  fontSize: "0.9rem",
                  transition: "all 0.2s",
                  boxShadow: "0 10px 20px rgba(15,23,42,0.15)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow =
                    "0 14px 28px rgba(15,23,42,0.2)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow =
                    "0 10px 20px rgba(15,23,42,0.15)";
                }}
              >
                <ExternalLink size={18} /> Visit Link
              </a>
            )}
            {/* Download button for static files if NOT image/video displayed inline */}
            {item.fileId && !isImage && !isVideo && (
              <a
                href={`${import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"}/students/me/portfolio/${item._id}/download`}
                download
                style={{
                  flex: 1,
                  minWidth: "150px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                  padding: "0.9rem 1.5rem",
                  background: "#eff6ff",
                  color: "#0ea5e9",
                  border: "1px solid #bfdbfe",
                  borderRadius: "12px",
                  textDecoration: "none",
                  fontWeight: 600,
                  fontSize: "0.9rem",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#dbeafe";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#eff6ff";
                }}
              >
                <Download size={18} /> Download
              </a>
            )}
            {isAppProject && projectDetails?.sourceCodeUrl && (
              <a
                href={projectDetails.sourceCodeUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  flex: 1,
                  minWidth: "150px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.4rem",
                  padding: "0.9rem 1.5rem",
                  background: "#f0fdf4",
                  border: "1px solid #bbf7d0",
                  color: "#15803d",
                  borderRadius: "12px",
                  textDecoration: "none",
                  fontSize: "0.9rem",
                  fontWeight: 600,
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#dcfce7";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#f0fdf4";
                }}
              >
                <Code size={16} /> Source Code
              </a>
            )}
            {isAppProject && projectDetails?.productionUrl && (
              <a
                href={projectDetails.productionUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  flex: 1,
                  minWidth: "150px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.4rem",
                  padding: "0.9rem 1.5rem",
                  background: "#f5f3ff",
                  border: "1px solid #ddd6fe",
                  color: "#6d28d9",
                  borderRadius: "12px",
                  textDecoration: "none",
                  fontSize: "0.9rem",
                  fontWeight: 600,
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#ede9fe";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#f5f3ff";
                }}
              >
                <Globe size={16} /> Live Demo
              </a>
            )}
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

/* ─────────── Add Item Modal ─────────── */
const AddItemModal = ({ onClose, onAdded }) => {
  const [mode, setMode] = useState("link"); // link | file
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
        if (!url.trim()) {
          toast.error("Please provide a URL");
          setLoading(false);
          return;
        }
        await studentApi.addPortfolioLink({
          title,
          description,
          url: url.trim(),
          tags: tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
          coverImage: uploadedCoverUrl,
        });
      } else {
        if (!file) {
          toast.error("Please select a file");
          setLoading(false);
          return;
        }
        const fd = new FormData();
        fd.append("title", title);
        fd.append("description", description);
        fd.append("tags", tags);
        if (uploadedCoverUrl) fd.append("coverImage", uploadedCoverUrl);
        // Important: Append file last for stream parser
        fd.append("file", file);
        await studentApi.addPortfolioItem(fd);
      }
      toast.success("Portfolio item added!");
      onAdded();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add item");
    }
    setLoading(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        background: "rgba(15,23,42,0.3)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
      }}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: "500px",
          background: "rgba(255,255,255,0.95)",
          backdropFilter: "blur(24px)",
          borderRadius: "20px",
          border: "1px solid rgba(255,255,255,0.6)",
          boxShadow: "0 24px 60px rgba(37,99,235,0.12)",
          padding: "1.5rem",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1.25rem",
          }}
        >
          <h3 style={{ fontSize: "1.1rem" }}>Add to Portfolio</h3>
          <button
            onClick={onClose}
            style={{
              background: "var(--bg-pearl)",
              border: "none",
              cursor: "pointer",
              padding: "6px",
              borderRadius: "8px",
              display: "flex",
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Mode toggle */}
        <div
          style={{
            display: "flex",
            gap: "0.5rem",
            marginBottom: "1.25rem",
            background: "var(--bg-pearl)",
            borderRadius: "10px",
            padding: "4px",
          }}
        >
          {[
            { key: "link", icon: LinkIcon, label: "Link" },
            { key: "file", icon: Upload, label: "Upload File" },
          ].map((m) => (
            <button
              key={m.key}
              onClick={() => setMode(m.key)}
              style={{
                flex: 1,
                padding: "0.5rem",
                borderRadius: "8px",
                border: "none",
                cursor: "pointer",
                background: mode === m.key ? "#fff" : "transparent",
                boxShadow: mode === m.key ? "var(--shadow-sm)" : "none",
                color:
                  mode === m.key ? "var(--primary)" : "var(--text-secondary)",
                fontWeight: 600,
                fontSize: "0.8rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.4rem",
                transition: "all 0.2s",
              }}
            >
              <m.icon size={14} /> {m.label}
            </button>
          ))}
        </div>

        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}
        >
          <div>
            <label className="input-label">Title *</label>
            <input
              className="input-field"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. My Portfolio Website"
              required
            />
          </div>
          <div>
            <label className="input-label">Description</label>
            <textarea
              className="input-field"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description..."
              rows={2}
            />
          </div>

          {mode === "link" ? (
            <div>
              <label className="input-label">URL *</label>
              <input
                className="input-field"
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://github.com/..."
                required
              />
            </div>
          ) : (
            <div>
              <label className="input-label">File</label>
              <div
                onClick={() => fileRef.current?.click()}
                style={{
                  border: "2px dashed var(--bg-ice)",
                  borderRadius: "12px",
                  padding: "1.5rem",
                  textAlign: "center",
                  cursor: "pointer",
                  background: "var(--bg-pearl)",
                  transition: "all 0.2s",
                }}
              >
                {file ? (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      justifyContent: "center",
                    }}
                  >
                    <FileText size={18} color="var(--primary)" />
                    <span style={{ fontSize: "0.85rem", fontWeight: 500 }}>
                      {file.name}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFile(null);
                      }}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: "#EF4444",
                      }}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <>
                    <Upload
                      size={24}
                      color="var(--text-tertiary)"
                      style={{ margin: "0 auto 0.5rem", display: "block" }}
                    />
                    <p
                      style={{
                        fontSize: "0.85rem",
                        color: "var(--text-secondary)",
                      }}
                    >
                      Click to upload
                    </p>
                    <p
                      style={{
                        fontSize: "0.7rem",
                        color: "var(--text-tertiary)",
                      }}
                    >
                      Images, videos, documents (max 20MB)
                    </p>
                  </>
                )}
              </div>
              <input
                ref={fileRef}
                type="file"
                onChange={(e) => setFile(e.target.files[0])}
                style={{ display: "none" }}
              />
            </div>
          )}

          <div>
            <label className="input-label">Tags (comma separated)</label>
            <input
              className="input-field"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="react, portfolio, web"
            />
          </div>

          <div>
            <label className="input-label">Cover Image (Optional)</label>
            <div
              onClick={() => coverRef.current?.click()}
              style={{
                border: "1px dashed var(--bg-ice)",
                borderRadius: "12px",
                padding: "1rem",
                textAlign: "center",
                cursor: "pointer",
                background: "var(--bg-pearl)",
                transition: "all 0.2s",
              }}
            >
              {coverImageFile ? (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    justifyContent: "center",
                  }}
                >
                  <Image size={16} color="var(--primary)" />
                  <span style={{ fontSize: "0.85rem", fontWeight: 500 }}>
                    {coverImageFile.name}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setCoverImageFile(null);
                    }}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "#EF4444",
                    }}
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <>
                  <Image
                    size={20}
                    color="var(--text-tertiary)"
                    style={{ margin: "0 auto 0.5rem", display: "block" }}
                  />
                  <p
                    style={{
                      fontSize: "0.8rem",
                      color: "var(--text-secondary)",
                    }}
                  >
                    Upload cover photo
                  </p>
                </>
              )}
            </div>
            <input
              ref={coverRef}
              type="file"
              accept="image/*"
              onChange={(e) => setCoverImageFile(e.target.files[0])}
              style={{ display: "none" }}
            />
          </div>

          <motion.button
            type="submit"
            className="btn btn-primary btn-lg"
            disabled={loading}
            whileTap={{ scale: 0.97 }}
            style={{ width: "100%" }}
          >
            {loading ? (
              <div
                className="spinner spinner-sm"
                style={{
                  borderTopColor: "#fff",
                  borderColor: "rgba(255,255,255,0.3)",
                }}
              />
            ) : (
              <>
                <Plus size={18} /> Add Item
              </>
            )}
          </motion.button>
        </form>
      </motion.div>
    </motion.div>
  );
};

/* ─────────── Portfolio Card ─────────── */
const typeIcons = {
  github: LinkIcon,
  website: LinkIcon,
  video: Video,
  document: FileText,
  image: Image,
  project: FolderOpen,
};
const typeColors = {
  github: "#333",
  website: "#2563EB",
  video: "#EF4444",
  document: "#F59E0B",
  image: "#10B981",
  project: "#8B5CF6",
};

const PortfolioCard = ({ item, onView, onDelete }) => {
  const Icon = typeIcons[item.type] || FileText;
  const color = typeColors[item.type] || "#64748B";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -4 }}
      className="glass-card"
      style={{
        padding: 0,
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
      onClick={() => onView(item)}
    >
      {item.coverImage || getFallbackImage(item._id) ? (
        <div
          style={{
            height: "140px",
            width: "100%",
            overflow: "hidden",
            background: `linear-gradient(135deg, ${color}20, ${color}40)`,
          }}
        >
          <img
            src={getCoverUrl(item.coverImage, item._id)}
            alt={item.title}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>
      ) : (
        <div
          style={{
            height: "6px",
            width: "100%",
            background: `linear-gradient(90deg, ${color}, ${color}88)`,
          }}
        />
      )}

      <div
        style={{
          padding: "1.25rem",
          display: "flex",
          flexDirection: "column",
          gap: "0.75rem",
          flex: 1,
        }}
      >
        {/* Type + Source badge */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "10px",
              background: `${color}10`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon size={20} color={color} />
          </div>
          <div
            style={{
              display: "flex",
              gap: "0.3rem",
              flexWrap: "wrap",
              justifyContent: "flex-end",
            }}
          >
            <span
              className="tag tag-neutral"
              style={{ fontSize: "0.65rem", textTransform: "uppercase" }}
            >
              {item.type}
            </span>
            <span
              style={{
                padding: "0.15rem 0.45rem",
                borderRadius: "6px",
                fontSize: "0.6rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.3px",
                background: item.source === "app" ? "#f0f9ff" : "#fdf4ff",
                color: item.source === "app" ? "#0369a1" : "#a21caf",
                border: `1px solid ${item.source === "app" ? "#bae6fd" : "#f0abfc"}`,
              }}
            >
              {item.source === "app" ? "🚀 App" : "📎 Added"}
            </span>
          </div>
        </div>

        <div>
          <h4
            style={{
              fontSize: "0.95rem",
              marginBottom: "0.3rem",
              lineHeight: 1.3,
            }}
          >
            {item.title}
          </h4>
          {item.description && (
            <p
              style={{
                fontSize: "0.8rem",
                color: "var(--text-secondary)",
                lineHeight: 1.5,
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {item.description}
            </p>
          )}
        </div>

        {/* Tags */}
        {item.tags?.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.3rem" }}>
            {item.tags.slice(0, 3).map((tag, i) => (
              <span
                key={i}
                className="tag tag-neutral"
                style={{ fontSize: "0.65rem" }}
              >
                {tag}
              </span>
            ))}
            {item.tags.length > 3 && (
              <span className="tag tag-neutral" style={{ fontSize: "0.65rem" }}>
                +{item.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Actions */}
        <div
          style={{
            display: "flex",
            gap: "0.5rem",
            marginTop: "auto",
            paddingTop: "0.5rem",
            borderTop: "1px solid var(--bg-ice)",
          }}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              onView(item);
            }}
            className="btn btn-ghost btn-sm"
            style={{ flex: 1, fontSize: "0.75rem" }}
          >
            <Eye size={14} /> View
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(item._id);
            }}
            className="btn btn-sm"
            style={{
              background: "#FEF2F2",
              color: "#EF4444",
              border: "none",
              fontSize: "0.75rem",
            }}
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

/* ═══════════ MAIN PORTFOLIO PAGE ═══════════ */
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
      toast.error("Failed to load portfolio");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPortfolio();
  }, []);

  const handleDelete = async (itemId) => {
    if (!window.confirm("Delete this portfolio item?")) return;
    try {
      // Optimistic
      setItems((prev) => prev.filter((i) => i._id !== itemId));
      await studentApi.deletePortfolioItem(itemId);
      toast.success("Item deleted");
    } catch {
      toast.error("Couldn't delete item");
      fetchPortfolio(page);
    }
  };

  return (
    <div className="page-container">
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "1.5rem",
          flexWrap: "wrap",
          gap: "0.75rem",
        }}
      >
        <div className="page-header" style={{ marginBottom: 0 }}>
          <h1>
            <FolderOpen
              size={24}
              style={{ verticalAlign: "middle", marginRight: "0.5rem" }}
            />
            Portfolio
          </h1>
          <p>
            Showcase your best work — {total} item{total !== 1 ? "s" : ""}
          </p>
        </div>
        <motion.button
          className="btn btn-primary"
          onClick={() => setShowAdd(true)}
          whileTap={{ scale: 0.95 }}
        >
          <Plus size={16} /> Add Item
        </motion.button>
      </div>

      {loading ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "1rem",
          }}
        >
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton" style={{ height: "200px" }} />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="empty-state" style={{ marginTop: "3rem" }}>
          <FolderOpen size={48} />
          <h3>Your portfolio is empty</h3>
          <p>
            Add links to your GitHub repos, websites, or upload files to
            showcase your work.
          </p>
          <motion.button
            className="btn btn-primary"
            onClick={() => setShowAdd(true)}
            whileTap={{ scale: 0.95 }}
            style={{ marginTop: "1rem" }}
          >
            <Plus size={16} /> Add Your First Item
          </motion.button>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "1rem",
          }}
        >
          <AnimatePresence>
            {items.map((item) => (
              <PortfolioCard
                key={item._id}
                item={item}
                onView={setViewItem}
                onDelete={handleDelete}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Pagination */}
      {total > 20 && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "0.5rem",
            marginTop: "2rem",
          }}
        >
          <button
            className="btn btn-secondary btn-sm"
            disabled={page <= 1}
            onClick={() => fetchPortfolio(page - 1)}
          >
            Previous
          </button>
          <span
            style={{
              padding: "0.4rem 1rem",
              fontSize: "0.85rem",
              color: "var(--text-secondary)",
            }}
          >
            Page {page}
          </span>
          <button
            className="btn btn-secondary btn-sm"
            disabled={items.length < 20}
            onClick={() => fetchPortfolio(page + 1)}
          >
            Next
          </button>
        </div>
      )}

      {/* Modals */}
      <AnimatePresence>
        {showAdd && (
          <AddItemModal
            onClose={() => setShowAdd(false)}
            onAdded={() => fetchPortfolio(1)}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {viewItem && (
          <ImmersiveViewer item={viewItem} onClose={() => setViewItem(null)} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Portfolio;
