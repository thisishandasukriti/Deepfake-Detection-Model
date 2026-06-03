import { motion, useTransform } from "framer-motion";

export default function NeuralSpiral({ x, y }: any) {
  // Sensitivity factor — controls how dramatic the movement is
  const sensitivity = 2;

  // Cursor-based rotation and vertical wave bending
  const rotateY = useTransform(x, [-200, 200], [-10 * sensitivity, 10 * sensitivity]);
  const rotateX = useTransform(y, [-200, 200], [5 * sensitivity, -5 * sensitivity]);
  const waveAmp = useTransform(y, [-200, 200], [-40 * sensitivity, 40 * sensitivity]);

  // Subtle pulse offsets for circles (makes them move with cursor)
  const pulseOffsetY = useTransform(y, [-200, 200], [-8 * sensitivity, 8 * sensitivity]);
  const pulseOffsetX = useTransform(x, [-200, 200], [-10 * sensitivity, 10 * sensitivity]);

  return (
    <motion.svg
      width="100%"
      height="100%"
      viewBox="0 0 1200 300"
      style={{
        position: "absolute",
        left: 0,
        top: "50%",
        transform: "translateY(-50%)",
        pointerEvents: "none",
      }}
    >
      {/* === Neural Signal Group (primary + helices) === */}
      <motion.g
        style={{
          translateY: waveAmp,
          rotateX: rotateX,
          rotateY: rotateY,
          transformStyle: "preserve-3d",
        }}
      >
        {/* Primary Neural Signal Line */}
        <motion.path
          d="
            M 0 150
            C 150 90, 300 210, 450 150
            S 750 90, 900 150
            S 1050 210, 1200 150
          "
          fill="none"
          stroke="url(#signalGradient)"
          strokeWidth="2.2"
          strokeLinecap="round"
          style={{ filter: "drop-shadow(0 0 12px #00F0FF)" }}
        />

        {/* DNA Helix (Top) */}
        <motion.path
          d="
            M 0 130
            C 150 110, 300 160, 450 130
            S 750 110, 900 130
            S 1050 160, 1200 130
          "
          fill="none"
          stroke="#9D00FF"
          strokeWidth="2"
          opacity="0.7"
          animate={{ opacity: [0.2, 0.4, 0.2] }}
          transition={{ repeat: Infinity, duration: 8 }}
        />

        {/* DNA Helix (Bottom) */}
        <motion.path
          d="
            M 0 170
            C 150 190, 300 140, 450 170
            S 750 190, 900 170
            S 1050 140, 1200 170
          "
          fill="none"
          stroke="#FF00D6"
          strokeWidth="2"
          opacity="0.7"
          animate={{ opacity: [0.4, 0.2, 0.4] }}
          transition={{ repeat: Infinity, duration: 8 }}
        />
      </motion.g>

      {/* === Neural Pulses (Circles) === */}
      {[0, 1, 2].map((i) => (
        <motion.circle
        key={i}
        r="4"
        fill="#00F0FF"
        animate={{
          cx: [0, 1200],
          cy: [150, 150 + (i % 2 === 0 ? 10 : -10)],
          opacity: [0, 1, 0],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          delay: i * 2,
          ease: "linear",
        }}
        style={{
          translateY: pulseOffsetY,
          translateX: pulseOffsetX,
          filter: "drop-shadow(0 0 8px #00F0FF)",
        }}
      />
      ))}

      {/* === Gradient Definition === */}
      <defs>
        <linearGradient id="signalGradient" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#9D00FF" />
          <stop offset="50%" stopColor="#00F0FF" />
          <stop offset="100%" stopColor="#FF00D6" />
        </linearGradient>
      </defs>
    </motion.svg>
  );
}
