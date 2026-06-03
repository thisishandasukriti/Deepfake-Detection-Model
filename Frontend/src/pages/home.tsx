import {
  Box,
  Button,
  Typography,
  AppBar,
  Toolbar,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import NeuralSpiral from "../components/NeuralSpiral";
import PerformanceGraphs from "../components/PerformanceGraphs";

/* ─── Design tokens ─────────────────────────────────────────── */
const C = {
  bg: "#04050F",
  bgPanel: "rgba(255,255,255,0.028)",
  border: "rgba(255,255,255,0.07)",
  borderBright: "rgba(100,180,255,0.18)",
  cyan: "#38D9FF",
  violet: "#9B6FFF",
  cyanDim: "rgba(56,217,255,0.12)",
  violetDim: "rgba(155,111,255,0.12)",
  text: "#E8EEFF",
  textMuted: "rgba(200,210,255,0.55)",
  white: "#FFFFFF",
};

/* ─── Grain overlay (CSS background) ────────────────────────── */
const grainStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  zIndex: 1,
  pointerEvents: "none",
  opacity: 0.035,
  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
  backgroundRepeat: "repeat",
};

/* ─── Animated gradient orbs ─────────────────────────────────── */
function AmbientOrbs() {
  return (
    <Box sx={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", overflow: "hidden" }}>
      <motion.div
        animate={{ x: [0, 40, -30, 0], y: [0, -50, 20, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        style={{
          position: "absolute",
          top: "10%",
          left: "8%",
          width: 520,
          height: 520,
          borderRadius: "50%",
          background:"radial-gradient(circle, rgba(56,217,255,0.22) 0%, transparent 70%)"
        }}
      />
      <motion.div
        animate={{ x: [0, -60, 30, 0], y: [0, 40, -30, 0] }}
        transition={{ duration: 28, repeat: Infinity, ease: "easeInOut" }}
        style={{
          position: "absolute",
          bottom: "15%",
          right: "5%",
          width: 640,
          height: 640,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(155,111,255,0.11) 0%, transparent 70%)",
        }}
      />
      <motion.div
        animate={{ scale: [1, 1.15, 0.95, 1] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%,-50%)",
          width: 800,
          height: 800,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(155,111,255,0.04) 0%, transparent 65%)",
        }}
      />
    </Box>
  );
}

/* ─── Horizontal divider with glow ──────────────────────────── */
function GlowDivider({ color = C.cyan }: { color?: string }) {
  return (
    <Box sx={{ position: "relative", my: 10, height: 1, maxWidth: 900, mx: "auto" }}>
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
          opacity: 0.35,
        }}
      />
      <Box
        sx={{
          position: "absolute",
          top: -3,
          left: "50%",
          transform: "translateX(-50%)",
          width: 80,
          height: 7,
          borderRadius: 4,
          background: color,
          opacity: 0.55,
          filter: `blur(6px)`,
        }}
      />
    </Box>
  );
}

/* ─── Section wrapper with scroll-reveal ────────────────────── */
function RevealSection({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.75, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

/* ─── Stat pill ──────────────────────────────────────────────── */
function StatPill({ value, label, accent }: { value: string; label: string; accent: string }) {
  return (
    <Box
      sx={{
        flex: "1 1 140px",
        p: "18px 20px",
        borderRadius: "16px",
        border: `1px solid ${C.border}`,
        background: C.bgPanel,
        backdropFilter: "blur(16px)",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "2px",
          background: `linear-gradient(90deg, transparent, ${accent}, transparent)`,
        },
      }}
    >
      <Typography sx={{ fontSize: "1.9rem", fontWeight: 800, color: accent, letterSpacing: -1, lineHeight: 1 }}>
        {value}
      </Typography>
      <Typography sx={{ fontSize: "0.72rem", color: C.textMuted, mt: 0.5, textTransform: "uppercase", letterSpacing: 1.5 }}>
        {label}
      </Typography>
    </Box>
  );
}

/* ─── FAQ Item ───────────────────────────────────────────────── */
function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <Box
      onClick={() => setOpen(!open)}
      sx={{
        cursor: "pointer",
        p: "20px 24px",
        borderRadius: "14px",
        border: `1px solid ${open ? C.borderBright : C.border}`,
        background: open ? "rgba(56,217,255,0.04)" : C.bgPanel,
        backdropFilter: "blur(12px)",
        mb: 2,
        transition: "border-color 0.25s, background 0.25s",
        "&:hover": { borderColor: C.borderBright },
      }}
    >
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 2 }}>
        <Typography sx={{ fontWeight: 600, color: C.text, fontSize: "0.97rem", fontFamily: "'DM Sans', sans-serif" }}>
          {q}
        </Typography>
        <Box
          sx={{
            minWidth: 28,
            height: 28,
            borderRadius: "50%",
            border: `1px solid ${C.borderBright}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: C.cyan,
            fontSize: "1.1rem",
            transition: "transform 0.25s",
            transform: open ? "rotate(45deg)" : "rotate(0deg)",
          }}
        >
          +
        </Box>
      </Box>
      <motion.div
        initial={false}
        animate={{ height: open ? "auto" : 0, opacity: open ? 1 : 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        style={{ overflow: "hidden" }}
      >
        <Typography sx={{ color: C.textMuted, fontSize: "0.92rem", lineHeight: 1.75, mt: 2, fontFamily: "'DM Sans', sans-serif" }}>
          {a}
        </Typography>
      </motion.div>
    </Box>
  );
}

/* ─── Main component ─────────────────────────────────────────── */
export default function Home() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothX = useSpring(mouseX, { stiffness: 45, damping: 22 });
  const smoothY = useSpring(mouseY, { stiffness: 45, damping: 22 });

  useEffect(() => {
    const fn = (e: MouseEvent) => {
      mouseX.set((e.clientX - window.innerWidth / 2) * 0.04);
      mouseY.set((e.clientY - window.innerHeight / 2) * 0.04);
    };
    window.addEventListener("mousemove", fn);
    return () => window.removeEventListener("mousemove", fn);
  }, []);

  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: `
radial-gradient(circle at 10% 20%, rgba(0,229,255,0.12), transparent 30%),
radial-gradient(circle at 90% 80%, rgba(168,85,247,0.15), transparent 35%),
radial-gradient(circle at 50% 50%, rgba(255,255,255,0.03), transparent 40%),
linear-gradient(
  135deg,
  #050816 0%,
  #0A1025 30%,
  #111827 60%,
  #1E1B4B 100%
)
`,
        color: C.text,
        fontFamily: "'DM Sans', 'Inter', sans-serif",
        position: "relative",
        overflowX: "hidden",
      }}
    >
      {/* Google Font */}
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Syne:wght@700;800&display=swap');`}</style>

      {/* Noise grain */}
      <div style={grainStyle} />

      {/* Ambient background orbs */}
      <AmbientOrbs />

      {/* Neural spiral */}
      <Box
        sx={{
          position: "fixed",
          inset: 0,
          zIndex: 0,
          display: { xs: "none", md: "flex" },
          alignItems: "center",
          justifyContent: "center",
          pointerEvents: "none",
          opacity: 0.45,
        }}
      >
        <NeuralSpiral x={smoothX} y={smoothY} />
      </Box>

      {/* ── Navbar ── */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          zIndex: 100,
          background: "rgba(4,5,15,0.65)",
          backdropFilter: "blur(20px)",
          borderBottom: `1px solid ${C.border}`,
        }}
      >
        <Toolbar sx={{ justifyContent: "space-between", px: { xs: 2, md: 5 }, minHeight: "64px !important" }}>
          {/* Logo */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
            <Box
              sx={{
                width: 28,
                height: 28,
                borderRadius: "8px",
                background: `linear-gradient(135deg, ${C.cyan}, ${C.violet})`,
                boxShadow: `0 0 12px rgba(56,217,255,0.5)`,
              }}
            />
            <Typography
              sx={{
                fontFamily: "'Syne', sans-serif",
                fontWeight: 800,
                fontSize: "1rem",
                letterSpacing: 0.5,
                color: C.white,
              }}
            >
              DEEPGUARD
            </Typography>
          </Box>

          {/* Nav links */}
          <Box sx={{ display: "flex", gap: 0.5 }}>
            {[
              { label: "Sign Up", to: "/signup", primary: false },
              { label: "Log In", to: "/login", primary: true },
            ].map(({ label, to, primary }) => (
              <Button
                key={label}
                component={Link}
                to={to}
                sx={{
                  px: 2.5,
                  py: 0.9,
                  borderRadius: "10px",
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: "0.875rem",
                  fontFamily: "'DM Sans', sans-serif",
                  letterSpacing: 0.2,
                  ...(primary
                    ? {
                        background: `linear-gradient(135deg, ${C.cyan}22, ${C.violet}33)`,
                        border: `1px solid ${C.borderBright}`,
                        color: C.cyan,
                        "&:hover": { background: `linear-gradient(135deg, ${C.cyan}33, ${C.violet}44)` },
                      }
                    : {
                        color: C.textMuted,
                        "&:hover": { color: C.text, background: "rgba(255,255,255,0.04)" },
                      }),
                }}
              >
                {label}
              </Button>
            ))}
          </Box>
        </Toolbar>
      </AppBar>

      {/* ── Hero ── */}
      <Box sx={{ position: "relative", zIndex: 2, pt: "64px", minHeight: "100vh", display: "flex", alignItems: "center" }}>
        <Box sx={{ width: "100%", maxWidth: 1160, mx: "auto", px: { xs: 3, md: 6 } }}>
          {/* Badge */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <Box
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 1,
                px: 2,
                py: 0.8,
                borderRadius: "999px",
                border: `1px solid ${C.borderBright}`,
                background: C.cyanDim,
                mb: 4,
              }}
            >
              <Box sx={{ width: 6, height: 6, borderRadius: "50%", background: C.cyan, boxShadow: `0 0 6px ${C.cyan}` }} />
              <Typography sx={{ fontSize: "0.75rem", color: C.cyan, fontWeight: 600, letterSpacing: 1.5, textTransform: "uppercase" }}>
                AI-Powered · Real-time Analysis
              </Typography>
            </Box>
          </motion.div>

          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1.15fr 1fr" }, gap: { xs: 6, md: 8 }, alignItems: "center" }}>
            {/* Left text */}
            <Box>
              <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.75, delay: 0.1 }}>
                <Typography
                  sx={{
                    fontFamily: "'Syne', sans-serif",
                    fontSize: { xs: "2.6rem", md: "3.8rem" },
                    fontWeight: 800,
                    lineHeight: 1.08,
                    letterSpacing: -1.5,
                    mb: 3,
                  }}
                >
                  Detect deepfakes
                  <br />
                  <Box
                    component="span"
                    sx={{
                      background: `linear-gradient(90deg, ${C.cyan}, ${C.violet})`,
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    before they spread.
                  </Box>
                </Typography>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.75, delay: 0.22 }}>
                <Typography sx={{ color: C.textMuted, fontSize: "1.05rem", lineHeight: 1.75, mb: 5, maxWidth: 480 }}>
                  Our system analyzes videos frame-by-frame using advanced deep learning to flag manipulated content — with confidence levels above 95%.
                </Typography>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.35 }}>
                <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                  <Button
                    onClick={() => navigate("/signup")}
                    sx={{
                      px: 4,
                      py: 1.5,
                      fontSize: "0.95rem",
                      fontWeight: 700,
                      borderRadius: "12px",
                      textTransform: "none",
                      fontFamily: "'DM Sans', sans-serif",
                      color: "#04050F",
                      background: `linear-gradient(135deg, ${C.cyan}, ${C.violet})`,
                      boxShadow: `0 4px 24px rgba(56,217,255,0.3)`,
                      "&:hover": {
                        boxShadow: `0 6px 32px rgba(155,111,255,0.45)`,
                        transform: "translateY(-1px)",
                        transition: "all 0.2s",
                      },
                    }}
                  >
                    Start Detecting →
                  </Button>
                  <Button
                    component={Link}
                    to="/login"
                    sx={{
                      px: 3.5,
                      py: 1.5,
                      fontSize: "0.95rem",
                      fontWeight: 600,
                      borderRadius: "12px",
                      textTransform: "none",
                      fontFamily: "'DM Sans', sans-serif",
                      color: C.textMuted,
                      border: `1px solid ${C.border}`,
                      "&:hover": { borderColor: C.borderBright, color: C.text },
                    }}
                  >
                    Log In
                  </Button>
                </Box>
              </motion.div>
            </Box>

            {/* Right visual card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.9, delay: 0.2 }}
              style={{ display: "flex", justifyContent: "center" }}
            >
              <motion.div
                style={{ translateX: smoothX, translateY: smoothY }}
              >
                <Box
                  sx={{
                    position: "relative",
                    width: { xs: 300, md: 380 },
                    height: { xs: 300, md: 380 },
                  }}
                >
                  {/* Glow ring */}
                  <Box
                    sx={{
                      position: "absolute",
                      inset: -20,
                      borderRadius: "50%",
                      background: `conic-gradient(from 0deg, ${C.cyan}44, ${C.violet}44, transparent, ${C.cyan}44)`,
                      filter: "blur(28px)",
                      animation: "spin 8s linear infinite",
                      "@keyframes spin": { "0%": { transform: "rotate(0deg)" }, "100%": { transform: "rotate(360deg)" } },
                    }}
                  />
                  {/* Image */}
                  <Box
                    sx={{
                      position: "relative",
                      zIndex: 2,
                      width: "100%",
                      height: "100%",
                      borderRadius: "28px",
                      backgroundImage: "url('/images/newFR.jpeg')",
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      border: `1px solid ${C.borderBright}`,
                      boxShadow: `0 0 50px rgba(56,217,255,0.2), 0 0 100px rgba(155,111,255,0.12)`,
                      overflow: "hidden",
                      "&::after": {
                        content: '""',
                        position: "absolute",
                        inset: 0,
                        background: `linear-gradient(135deg, rgba(56,217,255,0.06) 0%, transparent 60%, rgba(155,111,255,0.08) 100%)`,
                      },
                    }}
                  />
                  {/* Scan line overlay */}
                  <Box
                    sx={{
                      position: "absolute",
                      zIndex: 3,
                      bottom: 20,
                      left: 20,
                      right: 20,
                      p: "10px 14px",
                      borderRadius: "10px",
                      background: "rgba(4,5,15,0.75)",
                      backdropFilter: "blur(10px)",
                      border: `1px solid ${C.border}`,
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                    }}
                  >
                    <Box sx={{ width: 8, height: 8, borderRadius: "50%", background: "#22D870", boxShadow: "0 0 6px #22D870", animation: "pulse 2s infinite", "@keyframes pulse": { "0%,100%": { opacity: 1 }, "50%": { opacity: 0.4 } } }} />
                    <Typography sx={{ fontSize: "0.72rem", color: C.text, fontFamily: "'DM Sans', sans-serif", fontWeight: 600, letterSpacing: 0.5 }}>
                      ANALYSIS READY · 86.9% ACCURACY
                    </Typography>
                  </Box>
                </Box>
              </motion.div>
            </motion.div>
          </Box>

          {/* Stats row */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.5 }}>
            <Box
              sx={{
                display: "flex",
                gap: 2,
                mt: 10,
                flexWrap: "wrap",
              }}
            >
              <StatPill value="86.9%" label="Model Accuracy" accent={C.cyan} />
              <StatPill value="95%+" label="Frame Confidence" accent={C.violet} />
              <StatPill value="< 5s" label="Avg. Processing" accent={C.cyan} />
              <StatPill value="Free" label="No Cost, No Signup Wall" accent={C.violet} />
            </Box>
          </motion.div>
        </Box>
      </Box>

      {/* ── Scrollable sections ── */}
      <Box sx={{ position: "relative", zIndex: 2, px: { xs: 3, md: 6 }, mt: 8 }}>

        <GlowDivider color={C.cyan} />

        {/* Section 1: What is Deepfake Detection */}
        <RevealSection>
          <Box sx={{ maxWidth: 900, mx: "auto", mb: 4 }}>
            {/* Label */}
            <Typography sx={{ fontSize: "0.7rem", color: C.cyan, fontWeight: 700, letterSpacing: 2.5, textTransform: "uppercase", mb: 2 }}>
              01 — Technology
            </Typography>
            <Box
              sx={{
                p: { xs: 4, md: "52px 56px" },
                borderRadius: "24px",
                background: C.bgPanel,
                backdropFilter: "blur(24px)",
                border: `1px solid ${C.border}`,
                position: "relative",
                overflow: "hidden",
                "&::before": {
                  content: '""',
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: "1px",
                  background: `linear-gradient(90deg, transparent, ${C.cyan}55, transparent)`,
                },
              }}
            >
              <Typography
                sx={{
                  fontFamily: "'Syne', sans-serif",
                  fontSize: { xs: "1.8rem", md: "2.4rem" },
                  fontWeight: 800,
                  letterSpacing: -0.5,
                  mb: 4,
                  color: C.white,
                }}
              >
                What is{" "}
                <Box component="span" sx={{ color: C.cyan }}>
                  deepfake detection?
                </Box>
              </Typography>

              <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, gap: 5, alignItems: "flex-start" }}>
                <Box
                  sx={{
                    flexShrink: 0,
                    width: { xs: "100%", md: 240 },
                    height: 300,
                    borderRadius: "16px",
                    backgroundImage: "url('/images/second.jpg')",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    border: `1px solid ${C.borderBright}`,
                    boxShadow: `0 0 30px rgba(56,217,255,0.15)`,
                  }}
                />
                <Typography sx={{ color: C.textMuted, lineHeight: 1.85, fontSize: "0.97rem" }}>
                  Deepfake detection leverages AI algorithms to analyze videos and images for manipulated content.
                  It examines subtle inconsistencies in facial features, motion, and audio to identify synthetic media
                  with high accuracy.
                  <br /><br />
                  While some deepfakes are made for entertainment, others carry serious risks — spreading misinformation,
                  committing fraud, or damaging reputations. Detection models flag unnatural facial movements,
                  inconsistent blinking, mismatched lighting, and pixel-level artifacts that the human eye misses.
                  <br /><br />
                  Our pipeline extracts and evaluates individual frames, aggregating signals across the entire video
                  for a reliable, high-confidence verdict.
                </Typography>
              </Box>
            </Box>
          </Box>
        </RevealSection>

        <GlowDivider color={C.violet} />

        {/* Section 2: Why us */}
        <RevealSection delay={0.05}>
          <Box sx={{ maxWidth: 900, mx: "auto", mb: 4 }}>
            <Typography sx={{ fontSize: "0.7rem", color: C.violet, fontWeight: 700, letterSpacing: 2.5, textTransform: "uppercase", mb: 2 }}>
              02 — Why Choose Us
            </Typography>
            <Box
              sx={{
                p: { xs: 4, md: "52px 56px" },
                borderRadius: "24px",
                background: C.bgPanel,
                backdropFilter: "blur(24px)",
                border: `1px solid ${C.border}`,
                position: "relative",
                overflow: "hidden",
                "&::before": {
                  content: '""',
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: "1px",
                  background: `linear-gradient(90deg, transparent, ${C.violet}55, transparent)`,
                },
              }}
            >
              <Typography
                sx={{
                  fontFamily: "'Syne', sans-serif",
                  fontSize: { xs: "1.8rem", md: "2.4rem" },
                  fontWeight: 800,
                  letterSpacing: -0.5,
                  mb: 4,
                  color: C.white,
                }}
              >
                Why our detector is{" "}
                <Box component="span" sx={{ color: C.violet }}>
                  the best.
                </Box>
              </Typography>

              {/* Feature grid */}
              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 3, mb: 5 }}>
                {[
                  { icon: "⚡", title: "Blazing Fast", desc: "Results in under 5 seconds — no waiting, no friction." },
                  { icon: "🎯", title: "High Precision", desc: "86.9% accuracy on benchmarks, 95%+ confidence per video." },
                  { icon: "🆓", title: "Completely Free", desc: "No credit card. No hidden fees. Open to everyone." },
                  { icon: "🔒", title: "Privacy-First", desc: "We never store your videos or personal data." },
                ].map(({ icon, title, desc }) => (
                  <Box
                    key={title}
                    sx={{
                      p: "20px 22px",
                      borderRadius: "16px",
                      border: `1px solid ${C.border}`,
                      background: "rgba(255,255,255,0.02)",
                      transition: "border-color 0.25s, background 0.25s",
                      "&:hover": {
                        borderColor: C.borderBright,
                        background: C.violetDim,
                      },
                    }}
                  >
                    <Typography sx={{ fontSize: "1.5rem", mb: 1 }}>{icon}</Typography>
                    <Typography sx={{ fontWeight: 700, color: C.text, mb: 0.5, fontFamily: "'Syne', sans-serif", fontSize: "0.98rem" }}>
                      {title}
                    </Typography>
                    <Typography sx={{ color: C.textMuted, fontSize: "0.87rem", lineHeight: 1.65 }}>{desc}</Typography>
                  </Box>
                ))}
              </Box>

              <Button
                component={Link}
                to="/signup"
                sx={{
                  px: 4,
                  py: 1.4,
                  borderRadius: "12px",
                  textTransform: "none",
                  fontWeight: 700,
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "0.92rem",
                  color: "#04050F",
                  background: `linear-gradient(135deg, ${C.cyan}, ${C.violet})`,
                  boxShadow: `0 4px 20px rgba(155,111,255,0.3)`,
                  "&:hover": { boxShadow: `0 6px 28px rgba(155,111,255,0.5)` },
                }}
              >
                Start Detecting →
              </Button>
            </Box>
          </Box>
        </RevealSection>

        <GlowDivider color={C.cyan} />

        {/* Section 3: Accuracy & Performance */}
        <RevealSection delay={0.05}>
          <Box sx={{ maxWidth: 900, mx: "auto", mb: 4 }}>
            <Typography sx={{ fontSize: "0.7rem", color: C.cyan, fontWeight: 700, letterSpacing: 2.5, textTransform: "uppercase", mb: 2 }}>
              03 — Performance
            </Typography>
            <Box
              sx={{
                p: { xs: 4, md: "52px 56px" },
                borderRadius: "24px",
                background: C.bgPanel,
                backdropFilter: "blur(24px)",
                border: `1px solid ${C.border}`,
                position: "relative",
                overflow: "hidden",
                "&::before": {
                  content: '""',
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: "1px",
                  background: `linear-gradient(90deg, transparent, ${C.cyan}55, transparent)`,
                },
              }}
            >
              <Typography
                sx={{
                  fontFamily: "'Syne', sans-serif",
                  fontSize: { xs: "1.8rem", md: "2.4rem" },
                  fontWeight: 800,
                  letterSpacing: -0.5,
                  mb: 2,
                  color: C.white,
                }}
              >
                Accuracy &{" "}
                <Box component="span" sx={{ color: C.cyan }}>Performance</Box>
              </Typography>
              <Typography sx={{ color: C.textMuted, mb: 5, fontSize: "0.97rem", lineHeight: 1.7 }}>
                Our models maintain strong metrics across accuracy, precision, recall, and F1-score. Visual breakdowns below.
              </Typography>
              <PerformanceGraphs />
            </Box>
          </Box>
        </RevealSection>

        <GlowDivider color={C.violet} />

        {/* Section 4: FAQ */}
        <RevealSection delay={0.05}>
          <Box sx={{ maxWidth: 900, mx: "auto", mb: 16 }}>
            <Typography sx={{ fontSize: "0.7rem", color: C.violet, fontWeight: 700, letterSpacing: 2.5, textTransform: "uppercase", mb: 2 }}>
              04 — FAQ
            </Typography>
            <Box
              sx={{
                p: { xs: 4, md: "52px 56px" },
                borderRadius: "24px",
                background: C.bgPanel,
                backdropFilter: "blur(24px)",
                border: `1px solid ${C.border}`,
                position: "relative",
                overflow: "hidden",
                "&::before": {
                  content: '""',
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: "1px",
                  background: `linear-gradient(90deg, transparent, ${C.violet}55, transparent)`,
                },
              }}
            >
              <Typography
                sx={{
                  fontFamily: "'Syne', sans-serif",
                  fontSize: { xs: "1.8rem", md: "2.4rem" },
                  fontWeight: 800,
                  letterSpacing: -0.5,
                  mb: 5,
                  color: C.white,
                }}
              >
                Frequently asked{" "}
                <Box component="span" sx={{ color: C.violet }}>questions.</Box>
              </Typography>

              <FaqItem
                q="Is the Deepfake Detection system free and easy to use?"
                a="Yes — fully free, no credit card required. The interface is designed so anyone can use it without any technical background."
              />
              <FaqItem
                q="How does the system detect whether a video is real or fake?"
                a="The system extracts frames from your video and passes each through a trained deep learning model that looks for manipulation artifacts in facial regions — unnatural edges, texture mismatches, and motion inconsistencies."
              />
              <FaqItem
                q="How long does it take to generate results?"
                a="Typically under 5 seconds for short clips. Longer videos take a bit more time as each frame is evaluated individually before results are aggregated."
              />
              <FaqItem
                q="Is the system safe and reliable to use?"
                a="Yes. We never store uploaded videos or user data. The model achieves 86.87% benchmark accuracy and performs reliably on real-world unseen content."
              />
            </Box>
          </Box>
        </RevealSection>

      </Box>

      {/* ── Footer ── */}
      <Box
        sx={{
          position: "relative",
          zIndex: 2,
          borderTop: `1px solid ${C.border}`,
          px: { xs: 3, md: 6 },
          py: 4,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
          <Box sx={{ width: 20, height: 20, borderRadius: "6px", background: `linear-gradient(135deg, ${C.cyan}, ${C.violet})` }} />
          <Typography sx={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: "0.85rem", color: C.textMuted }}>
            DEEPGUARD
          </Typography>
        </Box>
        <Typography sx={{ fontSize: "0.78rem", color: C.textMuted }}>
          Built for public safety · No data stored · Always free
        </Typography>
      </Box>
    </Box>
  );
}