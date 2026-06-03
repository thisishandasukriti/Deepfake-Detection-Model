import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useDropzone } from "react-dropzone";
import {
  Box,
  Button,
  Typography,
  CircularProgress,
  Paper,
  Fade,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import ShieldIcon from "@mui/icons-material/Shield";
import PsychologyIcon from "@mui/icons-material/Psychology";
import BoltIcon from "@mui/icons-material/Bolt";
import { motion, useMotionValue, useSpring, AnimatePresence } from "framer-motion";
import NeuralSpiral from "./components/NeuralSpiral";
import { useNavigate } from "react-router-dom";

// ─── Animated Counter ────────────────────────────────────────────────────────
const AnimatedCounter = ({ target, suffix = "" }: { target: number; suffix?: string }) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          let start = 0;
          const step = target / 60;
          const timer = setInterval(() => {
            start += step;
            if (start >= target) {
              setCount(target);
              clearInterval(timer);
            } else {
              setCount(Math.floor(start));
            }
          }, 16);
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return <span ref={ref}>{count}{suffix}</span>;
};

// ─── Particle Background ─────────────────────────────────────────────────────
const ParticleField = () => {
  const particles = Array.from({ length: 28 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 2 + 1,
    duration: Math.random() * 12 + 8,
    delay: Math.random() * 6,
    opacity: Math.random() * 0.4 + 0.1,
  }));

  return (
    <Box sx={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
      {particles.map((p) => (
        <motion.div
          key={p.id}
          style={{
            position: "absolute",
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            borderRadius: "50%",
            background: p.id % 3 === 0
              ? "rgba(0,240,255,0.7)"
              : p.id % 3 === 1
              ? "rgba(160,80,255,0.7)"
              : "rgba(255,255,255,0.5)",
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [p.opacity, p.opacity * 0.3, p.opacity],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </Box>
  );
};

// ─── Grid Overlay ─────────────────────────────────────────────────────────────
const GridOverlay = () => (
  <Box
    sx={{
      position: "absolute",
      inset: 0,
      pointerEvents: "none",
      backgroundImage: `
        linear-gradient(rgba(0,240,255,0.03) 1px, transparent 1px),
        linear-gradient(90deg, rgba(0,240,255,0.03) 1px, transparent 1px)
      `,
      backgroundSize: "60px 60px",
      zIndex: 0,
    }}
  />
);

// ─── Glow Badge ───────────────────────────────────────────────────────────────
const GlowBadge = ({ text }: { text: string }) => (
  <Box
    sx={{
      display: "inline-flex",
      alignItems: "center",
      gap: 1,
      px: 2,
      py: 0.7,
      borderRadius: "999px",
      background: "rgba(0,240,255,0.08)",
      border: "1px solid rgba(0,240,255,0.35)",
      boxShadow: "0 0 18px rgba(0,240,255,0.2)",
      mb: 2.5,
    }}
  >
    <Box
      sx={{
        width: 7,
        height: 7,
        borderRadius: "50%",
        background: "#00f0ff",
        boxShadow: "0 0 8px #00f0ff",
        animation: "pulse 2s infinite",
        "@keyframes pulse": {
          "0%,100%": { opacity: 1 },
          "50%": { opacity: 0.3 },
        },
      }}
    />
    <Typography sx={{ fontSize: "0.72rem", color: "#00f0ff", letterSpacing: 1.5, fontFamily: "'Courier New', monospace", fontWeight: 600 }}>
      {text}
    </Typography>
  </Box>
);

// ─── Feature Card ─────────────────────────────────────────────────────────────
const FeatureCard = ({
  icon,
  title,
  desc,
  delay,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  delay: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.6, delay }}
    whileHover={{ y: -6, scale: 1.02 }}
  >
    <Box
      sx={{
        p: 3.5,
        borderRadius: 4,
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.1)",
        backdropFilter: "blur(16px)",
        boxShadow: "0 4px 30px rgba(0,0,0,0.3)",
        height: "100%",
        transition: "border-color 0.3s, box-shadow 0.3s",
        "&:hover": {
          borderColor: "rgba(0,240,255,0.35)",
          boxShadow: "0 8px 40px rgba(0,240,255,0.12)",
        },
      }}
    >
      <Box
        sx={{
          width: 48,
          height: 48,
          borderRadius: 2.5,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "rgba(0,240,255,0.1)",
          border: "1px solid rgba(0,240,255,0.25)",
          mb: 2,
          boxShadow: "0 0 16px rgba(0,240,255,0.15)",
        }}
      >
        {icon}
      </Box>
      <Typography sx={{ fontWeight: 700, color: "#fff", mb: 1, fontSize: "1rem", fontFamily: "'Syne', sans-serif" }}>
        {title}
      </Typography>
      <Typography sx={{ color: "rgba(255,255,255,0.5)", fontSize: "0.82rem", lineHeight: 1.7 }}>
        {desc}
      </Typography>
    </Box>
  </motion.div>
);

// ─── Step Card ────────────────────────────────────────────────────────────────
const StepCard = ({
  num,
  title,
  desc,
  delay,
}: {
  num: string;
  title: string;
  desc: string;
  delay: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 24 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.55, delay }}
  >
    <Box sx={{ display: "flex", gap: 2.5, alignItems: "flex-start" }}>
      <Box
        sx={{
          minWidth: 44,
          height: 44,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #00f0ff22, #a050ff22)",
          border: "1px solid rgba(0,240,255,0.4)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "'Courier New', monospace",
          fontSize: "0.75rem",
          fontWeight: 700,
          color: "#00f0ff",
          boxShadow: "0 0 14px rgba(0,240,255,0.2)",
          flexShrink: 0,
        }}
      >
        {num}
      </Box>
      <Box>
        <Typography sx={{ fontWeight: 700, color: "#fff", fontSize: "0.95rem", mb: 0.5, fontFamily: "'Syne', sans-serif" }}>
          {title}
        </Typography>
        <Typography sx={{ color: "rgba(255,255,255,0.45)", fontSize: "0.8rem", lineHeight: 1.7 }}>
          {desc}
        </Typography>
      </Box>
    </Box>
  </motion.div>
);

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({
  value,
  suffix,
  label,
  delay,
}: {
  value: number;
  suffix?: string;
  label: string;
  delay: number;
}) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    whileInView={{ opacity: 1, scale: 1 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay }}
    whileHover={{ scale: 1.05 }}
  >
    <Box
      sx={{
        p: 3,
        borderRadius: 4,
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(0,240,255,0.15)",
        textAlign: "center",
        boxShadow: "0 0 24px rgba(0,240,255,0.07)",
        backdropFilter: "blur(12px)",
        "&:hover": {
          borderColor: "rgba(0,240,255,0.4)",
          boxShadow: "0 0 32px rgba(0,240,255,0.18)",
        },
        transition: "all 0.3s",
      }}
    >
      <Typography
        sx={{
          fontFamily: "'Syne', sans-serif",
          fontSize: "2.2rem",
          fontWeight: 800,
          background: "linear-gradient(135deg, #00f0ff, #a050ff)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          lineHeight: 1,
          mb: 0.5,
        }}
      >
        <AnimatedCounter target={value} suffix={suffix ?? ""} />
      </Typography>
      <Typography sx={{ color: "rgba(255,255,255,0.45)", fontSize: "0.75rem", letterSpacing: 1.2, textTransform: "uppercase", fontFamily: "'Courier New', monospace" }}>
        {label}
      </Typography>
    </Box>
  </motion.div>
);

// ─── Main AppPage ─────────────────────────────────────────────────────────────
const AppPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [prediction, setPrediction] = useState<{ label: string; confidence: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // ── Auth
  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    navigate("/");
  };

  // ── Dropzone
  const onDrop = (acceptedFiles: File[]) => {
    if (loading) return;
    setFile(acceptedFiles[0]);
    setPrediction(null);
  };
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, disabled: loading });

  // ── Upload & Predict
  const handleUpload = async () => {
    if (!file) { alert("Please select a video first!"); return; }
    const formData = new FormData();
    formData.append("file", file);
    try {
      setLoading(true);
      const response = await axios.post("http://127.0.0.1:8000/predict", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const data = response.data;
      if (data.error) {
        alert(data.error);
        setPrediction(null);
      } else {
        setPrediction({ label: data.label, confidence: data.confidence });
      }
    } catch (err) {
      console.error(err);
      alert("Error connecting to backend");
    } finally {
      setLoading(false);
    }
  };

  // ── Background motion
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothX = useSpring(mouseX, { stiffness: 50, damping: 20 });
  const smoothY = useSpring(mouseY, { stiffness: 50, damping: 20 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set((e.clientX - window.innerWidth / 2) * 0.05);
      mouseY.set((e.clientY - window.innerHeight / 2) * 0.05);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Scroll to upload card
  const scrollToUpload = () => {
    document.getElementById("upload-section")?.scrollIntoView({ behavior: "smooth" });
  };

  const isFake = prediction?.label === "FAKE";

  return (
    <>
      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500&display=swap');
        * { box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        body { margin: 0; background: #050812; }
      `}</style>

      <Box sx={{ minHeight: "100vh", background: "#050812", position: "relative", overflowX: "hidden", fontFamily: "'DM Sans', sans-serif" }}>

        {/* ── FIXED BACKGROUND ── */}
        <Box sx={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}>
          <Box sx={{
            position: "absolute", inset: 0,
            background: `
              radial-gradient(ellipse 80% 60% at 10% 20%, rgba(0,200,255,0.09) 0%, transparent 60%),
              radial-gradient(ellipse 60% 50% at 90% 80%, rgba(120,0,255,0.12) 0%, transparent 55%),
              radial-gradient(ellipse 50% 40% at 50% 50%, rgba(0,0,80,0.3) 0%, transparent 70%),
              linear-gradient(160deg, #050812 0%, #080d20 50%, #050812 100%)
            `,
          }} />
          <ParticleField />
          <Box sx={{ position: "absolute", inset: 0, display: { xs: "none", md: "flex" }, alignItems: "center", justifyContent: "center", opacity: 0.5 }}>
            <NeuralSpiral x={smoothX} y={smoothY} />
          </Box>
        </Box>

        {/* ════════════════════════════════════════════════
            NAVBAR
        ════════════════════════════════════════════════ */}
        <Box
          component={motion.nav}
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            zIndex: 100,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: { xs: 3, md: 6 },
            py: 2,
            background: "rgba(5,8,18,0.7)",
            backdropFilter: "blur(20px)",
            borderBottom: "1px solid rgba(0,240,255,0.08)",
          }}
        >
          {/* Logo */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
            <Box sx={{
              width: 34, height: 34, borderRadius: 2,
              background: "linear-gradient(135deg, #00f0ff30, #a050ff30)",
              border: "1px solid rgba(0,240,255,0.4)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 0 12px rgba(0,240,255,0.25)",
            }}>
              <Typography sx={{ fontSize: "1rem" }}>🎥</Typography>
            </Box>
            <Box>
              <Typography sx={{
                fontFamily: "'Syne', sans-serif", fontWeight: 800,
                fontSize: "0.95rem", color: "#fff", letterSpacing: 0.3, lineHeight: 1,
              }}>
                DeepDetect
              </Typography>
              <Typography sx={{ fontSize: "0.6rem", color: "rgba(0,240,255,0.6)", letterSpacing: 1.5, fontFamily: "'Courier New', monospace" }}>
                AI PLATFORM
              </Typography>
            </Box>
          </Box>

          {/* Nav links (desktop) */}
          <Box sx={{ display: { xs: "none", md: "flex" }, gap: 4 }}>
            {["Features", "How It Works", "Stats"].map((item) => (
              <Typography
                key={item}
                component="a"
                href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
                sx={{
                  color: "rgba(255,255,255,0.5)", fontSize: "0.82rem",
                  textDecoration: "none", letterSpacing: 0.5,
                  "&:hover": { color: "#00f0ff" }, transition: "color 0.2s",
                }}
              >
                {item}
              </Typography>
            ))}
          </Box>

          {/* Logout */}
          <Button
            onClick={handleLogout}
            size="small"
            sx={{
              color: "rgba(255,255,255,0.7)",
              border: "1px solid rgba(255,255,255,0.15)",
              fontSize: "0.78rem", px: 2.5, py: 0.7, borderRadius: 2,
              textTransform: "none", fontFamily: "'DM Sans', sans-serif",
              "&:hover": { background: "rgba(255,255,255,0.07)", borderColor: "rgba(0,240,255,0.4)", color: "#fff" },
              transition: "all 0.2s",
            }}
          >
            Logout
          </Button>
        </Box>

        {/* ════════════════════════════════════════════════
            HERO + UPLOAD SECTION
        ════════════════════════════════════════════════ */}
        <Box
          id="upload-section"
          sx={{
            position: "relative", zIndex: 2,
            minHeight: "100vh",
            display: "flex", alignItems: "center",
            pt: { xs: 12, md: 10 },
            pb: { xs: 8, md: 10 },
            px: { xs: 3, sm: 4, md: 8, lg: 12 },
          }}
        >
          <Box sx={{
            display: "flex",
            alignItems: "center",
            gap: { xs: 6, md: 8 },
            flexDirection: { xs: "column", lg: "row" },
            width: "100%",
            maxWidth: 1280,
            mx: "auto",
          }}>

            {/* ── LEFT: Hero Copy ── */}
            <Box sx={{ flex: 1, textAlign: { xs: "center", lg: "left" } }}>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                <GlowBadge text="AI-POWERED MEDIA AUTHENTICATION" />
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }}>
                <Typography
                  sx={{
                    fontFamily: "'Syne', sans-serif",
                    fontWeight: 800,
                    fontSize: { xs: "2.4rem", sm: "3rem", md: "3.6rem", lg: "4rem" },
                    lineHeight: 1.08,
                    color: "#fff",
                    mb: 2.5,
                    letterSpacing: "-0.02em",
                  }}
                >
                  Deepfake{" "}
                  <Box
                    component="span"
                    sx={{
                      background: "linear-gradient(90deg, #00f0ff, #a050ff)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    Detection
                  </Box>
                  <br />
                  Using Deep Learning
                </Typography>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }}>
                <Typography
                  sx={{
                    color: "rgba(255,255,255,0.5)",
                    fontSize: { xs: "0.9rem", md: "1rem" },
                    lineHeight: 1.8,
                    mb: 4,
                    maxWidth: 480,
                    mx: { xs: "auto", lg: 0 },
                  }}
                >
                  Detecting facial inconsistencies in video using ResNet18 and MTCNN.
                  Upload any video and our AI model analyses frame-by-frame to determine
                  authenticity with high confidence.
                </Typography>
              </motion.div>

              {/* CTA Buttons */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.3 }}>
                <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", justifyContent: { xs: "center", lg: "flex-start" }, mb: 4.5 }}>
                  <Button
                    onClick={scrollToUpload}
                    variant="contained"
                    sx={{
                      background: "linear-gradient(135deg, #00c8ff, #7040ff)",
                      color: "#fff",
                      fontFamily: "'DM Sans', sans-serif",
                      fontWeight: 600,
                      fontSize: "0.9rem",
                      px: 3.5, py: 1.3,
                      borderRadius: 2.5,
                      textTransform: "none",
                      boxShadow: "0 0 28px rgba(0,200,255,0.3)",
                      "&:hover": { boxShadow: "0 0 40px rgba(0,200,255,0.5)", transform: "translateY(-1px)" },
                      transition: "all 0.25s",
                    }}
                  >
                    Upload Video ↑
                  </Button>
                  <Button
                    variant="outlined"
                    component="a"
                    href="#features"
                    sx={{
                      color: "rgba(255,255,255,0.7)",
                      borderColor: "rgba(255,255,255,0.2)",
                      fontFamily: "'DM Sans', sans-serif",
                      fontWeight: 500,
                      fontSize: "0.9rem",
                      px: 3.5, py: 1.3,
                      borderRadius: 2.5,
                      textTransform: "none",
                      "&:hover": { borderColor: "rgba(0,240,255,0.5)", color: "#fff", background: "rgba(0,240,255,0.05)" },
                      transition: "all 0.25s",
                    }}
                  >
                    Learn More
                  </Button>
                </Box>
              </motion.div>

              {/* Trust Indicators */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.45 }}>
                <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap", justifyContent: { xs: "center", lg: "flex-start" } }}>
                  {["CNN + ResNet18", "Facial Frame Analysis", "Real-Time Prediction"].map((item) => (
                    <Box key={item} sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
                      <Box sx={{ width: 6, height: 6, borderRadius: "50%", background: "#00f0ff", boxShadow: "0 0 6px #00f0ff" }} />
                      <Typography sx={{ color: "rgba(255,255,255,0.45)", fontSize: "0.78rem", fontFamily: "'Courier New', monospace" }}>
                        {item}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </motion.div>
            </Box>

            {/* ── RIGHT: Upload Detector Card ── */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              style={{ flex: "0 0 auto", width: "100%", maxWidth: 500 }}
            >
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 3.5, md: 4.5 },
                  borderRadius: 5,
                  background: "rgba(255,255,255,0.04)",
                  backdropFilter: "blur(28px)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  boxShadow: `
                    0 0 0 1px rgba(0,240,255,0.06),
                    0 20px 60px rgba(0,0,0,0.5),
                    inset 0 1px 0 rgba(255,255,255,0.08)
                  `,
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {/* Card glow */}
                <Box sx={{ position: "absolute", top: -60, right: -60, width: 180, height: 180, borderRadius: "50%", background: "rgba(0,240,255,0.06)", filter: "blur(40px)", pointerEvents: "none" }} />
                <Box sx={{ position: "absolute", bottom: -60, left: -40, width: 150, height: 150, borderRadius: "50%", background: "rgba(160,80,255,0.08)", filter: "blur(40px)", pointerEvents: "none" }} />

                {/* Loading Overlay */}
                <AnimatePresence>
                  {loading && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      style={{
                        position: "absolute", inset: 0,
                        background: "rgba(5,8,18,0.82)",
                        backdropFilter: "blur(8px)",
                        zIndex: 10,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: 20,
                        gap: 16,
                      }}
                    >
                      <Box sx={{ position: "relative", width: 60, height: 60, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <CircularProgress size={60} thickness={1.5} sx={{ color: "#00f0ff", position: "absolute" }} />
                        <CircularProgress size={44} thickness={2} sx={{ color: "rgba(160,80,255,0.6)", position: "absolute" }} variant="determinate" value={75} />
                        <Typography sx={{ fontSize: "0.65rem", color: "#00f0ff", fontFamily: "'Courier New', monospace" }}>AI</Typography>
                      </Box>
                      <Typography sx={{ color: "#fff", fontSize: "0.88rem", opacity: 0.85, textAlign: "center", lineHeight: 1.6 }}>
                        Analyzing video securely…
                        <br />
                        <span style={{ fontSize: "0.75rem", opacity: 0.55 }}>Don't refresh or navigate away.</span>
                      </Typography>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Card Header */}
                <Box sx={{ mb: 3, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <Box>
                    <Typography sx={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: "1.2rem", color: "#fff" }}>
                      Deepfake Detector
                    </Typography>
                    <Typography sx={{ fontSize: "0.72rem", color: "rgba(0,240,255,0.6)", fontFamily: "'Courier New', monospace", letterSpacing: 1 }}>
                      POWERED BY RESNET18
                    </Typography>
                  </Box>
                  <Box sx={{
                    px: 1.5, py: 0.5, borderRadius: 2,
                    background: "rgba(0,240,255,0.08)", border: "1px solid rgba(0,240,255,0.2)",
                    display: "flex", alignItems: "center", gap: 0.7,
                  }}>
                    <Box sx={{ width: 5, height: 5, borderRadius: "50%", background: "#00f0ff", boxShadow: "0 0 5px #00f0ff", animation: "pulse 2s infinite", "@keyframes pulse": { "0%,100%": { opacity: 1 }, "50%": { opacity: 0.2 } } }} />
                    <Typography sx={{ fontSize: "0.65rem", color: "#00f0ff", fontFamily: "'Courier New', monospace" }}>ONLINE</Typography>
                  </Box>
                </Box>

                {/* Format note */}
                <Typography sx={{ fontSize: "0.73rem", color: "rgba(255,255,255,0.3)", mb: 2, letterSpacing: 0.3 }}>
                  MP4 / WebM &nbsp;·&nbsp; Max 50 MB &nbsp;·&nbsp; Duration ≤ 2 min
                </Typography>

                {/* Drag & Drop Zone */}
                <Box
                  {...(!loading ? getRootProps() : {})}
                  sx={{
                    border: `2px dashed ${isDragActive ? "rgba(0,240,255,0.7)" : "rgba(0,240,255,0.25)"}`,
                    borderRadius: 3.5,
                    p: { xs: 3, md: 4 },
                    background: isDragActive
                      ? "rgba(0,240,255,0.06)"
                      : "rgba(255,255,255,0.02)",
                    cursor: loading ? "not-allowed" : "pointer",
                    mb: 2.5,
                    opacity: loading ? 0.4 : 1,
                    pointerEvents: loading ? "none" : "auto",
                    textAlign: "center",
                    transition: "all 0.25s",
                    "&:hover": {
                      borderColor: "rgba(0,240,255,0.5)",
                      background: "rgba(0,240,255,0.04)",
                      boxShadow: "0 0 20px rgba(0,240,255,0.08)",
                    },
                  }}
                >
                  <input {...getInputProps()} disabled={loading} />
                  <motion.div animate={isDragActive ? { scale: 1.1 } : { scale: 1 }} transition={{ duration: 0.2 }}>
                    <CloudUploadIcon sx={{ fontSize: 38, color: isDragActive ? "#00f0ff" : "rgba(0,240,255,0.5)", mb: 1.5, display: "block", mx: "auto", filter: isDragActive ? "drop-shadow(0 0 8px #00f0ff)" : "none", transition: "all 0.25s" }} />
                  </motion.div>
                  <Typography sx={{ color: file ? "#fff" : "rgba(255,255,255,0.4)", fontSize: "0.85rem", fontWeight: file ? 500 : 400 }}>
                    {file ? `📎 ${file.name}` : isDragActive ? "Drop the video here…" : "Drag & drop a video, or click to select"}
                  </Typography>
                  {file && (
                    <Typography sx={{ fontSize: "0.7rem", color: "rgba(0,240,255,0.5)", mt: 0.5 }}>
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </Typography>
                  )}
                </Box>

                {/* Upload Button */}
                <Button
                  variant="contained"
                  fullWidth
                  onClick={handleUpload}
                  disabled={loading || !file}
                  sx={{
                    background: "linear-gradient(135deg, #00b8d9, #6030cc)",
                    color: "#fff",
                    fontFamily: "'DM Sans', sans-serif",
                    fontWeight: 700,
                    fontSize: "0.92rem",
                    py: 1.4,
                    borderRadius: 2.5,
                    textTransform: "none",
                    boxShadow: "0 0 20px rgba(0,184,217,0.25)",
                    "&:hover:not(:disabled)": { boxShadow: "0 0 32px rgba(0,184,217,0.45)", transform: "translateY(-1px)" },
                    "&:disabled": { background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.25)" },
                    transition: "all 0.25s",
                  }}
                >
                  {loading ? "Analyzing…" : "Upload & Detect"}
                </Button>

                {/* ── PREDICTION RESULT ── */}
                <AnimatePresence>
                  {prediction && !loading && (
                    <motion.div
                      initial={{ opacity: 0, y: 16, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.96 }}
                      transition={{ duration: 0.4 }}
                    >
                      <Box
                        sx={{
                          mt: 3,
                          p: 2.5,
                          borderRadius: 3,
                          background: isFake
                            ? "rgba(248,113,113,0.07)"
                            : "rgba(52,211,153,0.07)",
                          border: `1px solid ${isFake ? "rgba(248,113,113,0.3)" : "rgba(52,211,153,0.3)"}`,
                        }}
                      >
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
                          {isFake
                            ? <ErrorOutlineIcon sx={{ color: "#f87171", fontSize: 28 }} />
                            : <CheckCircleOutlineIcon sx={{ color: "#34d399", fontSize: 28 }} />
                          }
                          <Box>
                            <Typography sx={{ fontWeight: 800, fontFamily: "'Syne', sans-serif", fontSize: "1.05rem", color: isFake ? "#f87171" : "#34d399", lineHeight: 1 }}>
                              {prediction.label}
                            </Typography>
                            <Typography sx={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.4)", fontFamily: "'Courier New', monospace" }}>
                              PREDICTION RESULT
                            </Typography>
                          </Box>
                          <Box sx={{ ml: "auto", textAlign: "right" }}>
                            <Typography sx={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: "1.1rem", color: "#fff" }}>
                              {(prediction.confidence * 100).toFixed(1)}%
                            </Typography>
                            <Typography sx={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.35)", fontFamily: "'Courier New', monospace" }}>CONFIDENCE</Typography>
                          </Box>
                        </Box>

                        {/* Confidence Bar */}
                        <Box sx={{ mb: 0.8 }}>
                          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                            <Typography sx={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.35)", fontFamily: "'Courier New', monospace" }}>CONFIDENCE SCORE</Typography>
                            <Typography sx={{ fontSize: "0.65rem", color: isFake ? "#f87171" : "#34d399", fontFamily: "'Courier New', monospace" }}>
                              {(prediction.confidence * 100).toFixed(2)}%
                            </Typography>
                          </Box>
                          <Box sx={{ height: 6, background: "rgba(255,255,255,0.07)", borderRadius: 3, overflow: "hidden" }}>
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${prediction.confidence * 100}%` }}
                              transition={{ duration: 0.8, ease: "easeOut" }}
                              style={{
                                height: "100%",
                                borderRadius: 3,
                                background: isFake
                                  ? "linear-gradient(90deg, #f87171, #ef4444)"
                                  : "linear-gradient(90deg, #34d399, #10b981)",
                                boxShadow: isFake ? "0 0 8px rgba(248,113,113,0.5)" : "0 0 8px rgba(52,211,153,0.5)",
                              }}
                            />
                          </Box>
                        </Box>
                      </Box>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Paper>
            </motion.div>
          </Box>
        </Box>

        {/* ════════════════════════════════════════════════
            FEATURES SECTION
        ════════════════════════════════════════════════ */}
        <Box
          id="features"
          sx={{
            position: "relative", zIndex: 2,
            py: { xs: 10, md: 14 },
            px: { xs: 3, md: 8, lg: 12 },
          }}
        >
          <Box sx={{ maxWidth: 1280, mx: "auto" }}>
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
              <Box sx={{ textAlign: "center", mb: 8 }}>
                <GlowBadge text="CORE CAPABILITIES" />
                <Typography sx={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: { xs: "2rem", md: "2.6rem" }, color: "#fff", mt: 1 }}>
                  Built for Precision
                </Typography>
                <Typography sx={{ color: "rgba(255,255,255,0.4)", fontSize: "0.9rem", mt: 1.5, maxWidth: 480, mx: "auto" }}>
                  Every component engineered to detect manipulation with maximum accuracy.
                </Typography>
              </Box>
            </motion.div>

            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "1fr 1fr 1fr" }, gap: 3 }}>
              <FeatureCard
                icon={<ShieldIcon sx={{ color: "#00f0ff", fontSize: 22 }} />}
                title="Secure Upload"
                desc="End-to-end secure video transmission to the backend. No data is stored post-analysis — privacy by design."
                delay={0}
              />
              <FeatureCard
                icon={<PsychologyIcon sx={{ color: "#a050ff", fontSize: 22 }} />}
                title="AI Facial Analysis"
                desc="MTCNN detects and crops facial regions per frame, feeding them into a fine-tuned ResNet18 classifier."
                delay={0.12}
              />
              <FeatureCard
                icon={<BoltIcon sx={{ color: "#00f0ff", fontSize: 22 }} />}
                title="Fast Deepfake Detection"
                desc="Multi-frame aggregation produces a final REAL/FAKE verdict with confidence score in seconds."
                delay={0.24}
              />
            </Box>
          </Box>
        </Box>

        {/* ════════════════════════════════════════════════
            HOW IT WORKS
        ════════════════════════════════════════════════ */}
        <Box
          id="how-it-works"
          sx={{
            position: "relative", zIndex: 2,
            py: { xs: 10, md: 14 },
            px: { xs: 3, md: 8, lg: 12 },
          }}
        >
          <Box sx={{ maxWidth: 1280, mx: "auto" }}>
            <Box sx={{ display: "flex", flexDirection: { xs: "column", lg: "row" }, gap: { xs: 8, lg: 12 }, alignItems: { lg: "center" } }}>
              {/* Left: label */}
              <Box sx={{ flex: "0 0 auto", maxWidth: { lg: 340 } }}>
                <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
                  <GlowBadge text="PIPELINE" />
                  <Typography sx={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: { xs: "2rem", md: "2.6rem" }, color: "#fff", mt: 1, mb: 1.5 }}>
                    How It Works
                  </Typography>
                  <Typography sx={{ color: "rgba(255,255,255,0.4)", fontSize: "0.88rem", lineHeight: 1.8 }}>
                    A four-stage deep learning pipeline processes every upload from raw video to a final verdict.
                  </Typography>
                </motion.div>
              </Box>

              {/* Right: Steps */}
              <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 3.5 }}>
                {[
                  { num: "01", title: "Upload Video", desc: "Select or drag-and-drop your MP4/WebM file. Securely transmitted to the FastAPI backend." },
                  { num: "02", title: "Extract Frames", desc: "The server samples frames at regular intervals to build a representative temporal snapshot." },
                  { num: "03", title: "Analyse Facial Patterns", desc: "MTCNN locates faces in each frame. ResNet18 classifies subtle GAN artefacts and inconsistencies." },
                  { num: "04", title: "Predict Fake or Real", desc: "Frame-level predictions are aggregated. A confidence-weighted verdict is returned to the UI." },
                ].map((step, i) => (
                  <StepCard key={step.num} {...step} delay={i * 0.1} />
                ))}
              </Box>
            </Box>
          </Box>
        </Box>

        
        {/* ════════════════════════════════════════════════
            FOOTER
        ════════════════════════════════════════════════ */}
        <Box
          component="footer"
          sx={{
            position: "relative", zIndex: 2,
            borderTop: "1px solid rgba(255,255,255,0.06)",
            py: 4,
            px: { xs: 3, md: 8 },
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box sx={{ width: 24, height: 24, borderRadius: 1, background: "linear-gradient(135deg, #00f0ff20, #a050ff20)", border: "1px solid rgba(0,240,255,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Typography sx={{ fontSize: "0.65rem" }}>🎥</Typography>
            </Box>
            <Typography sx={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "0.8rem", color: "rgba(255,255,255,0.5)" }}>
              DeepDetect
            </Typography>
          </Box>
          <Typography sx={{ color: "rgba(255,255,255,0.25)", fontSize: "0.73rem", fontFamily: "'Courier New', monospace", textAlign: "center" }}>
            Built using React · PyTorch · ResNet18 · MTCNN · FastAPI
          </Typography>
          <Typography sx={{ color: "rgba(255,255,255,0.2)", fontSize: "0.7rem", fontFamily: "'Courier New', monospace" }}>
            © {new Date().getFullYear()}
          </Typography>
        </Box>

      </Box>
    </>
  );
};

export default AppPage;