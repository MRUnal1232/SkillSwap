import { motion } from "framer-motion";
import {
  BookOpen,
  GraduationCap,
  Lightbulb,
  Code2,
  Palette,
  Music,
  Globe,
  Camera,
  PenTool,
  Calculator,
  Mic,
  Sparkles,
  Compass,
  Rocket,
  Brain,
  Feather,
  Target,
  Puzzle,
} from "lucide-react";

const icons = [
  { Icon: BookOpen,       top: "8%",  left: "6%",  size: 40, duration: 11, delay: 0.0, drift: 22, opacity: 0.18 },
  { Icon: GraduationCap,  top: "14%", left: "86%", size: 48, duration: 13, delay: 1.2, drift: -28, opacity: 0.22 },
  { Icon: Lightbulb,      top: "72%", left: "10%", size: 36, duration: 12, delay: 0.5, drift: 24, opacity: 0.2 },
  { Icon: Code2,          top: "78%", left: "82%", size: 44, duration: 14, delay: 2.0, drift: -20, opacity: 0.18 },
  { Icon: Palette,        top: "26%", left: "32%", size: 30, duration: 10, delay: 0.8, drift: 16, opacity: 0.14 },
  { Icon: Music,          top: "84%", left: "46%", size: 30, duration: 11, delay: 1.6, drift: -18, opacity: 0.15 },
  { Icon: Globe,          top: "52%", left: "4%",  size: 42, duration: 13, delay: 0.3, drift: 20, opacity: 0.2 },
  { Icon: Camera,         top: "50%", left: "92%", size: 38, duration: 12, delay: 1.4, drift: -16, opacity: 0.18 },
  { Icon: PenTool,        top: "38%", left: "18%", size: 26, duration: 9,  delay: 1.8, drift: 14, opacity: 0.12 },
  { Icon: Calculator,     top: "64%", left: "72%", size: 30, duration: 10, delay: 0.9, drift: -12, opacity: 0.14 },
  { Icon: Mic,            top: "18%", left: "58%", size: 28, duration: 11, delay: 2.2, drift: 15, opacity: 0.15 },
  { Icon: Sparkles,       top: "66%", left: "34%", size: 28, duration: 9.5, delay: 1.1, drift: -11, opacity: 0.14 },
  { Icon: Compass,        top: "40%", left: "78%", size: 32, duration: 11, delay: 0.6, drift: 14, opacity: 0.16 },
  { Icon: Rocket,         top: "88%", left: "66%", size: 34, duration: 12.5, delay: 1.9, drift: -14, opacity: 0.17 },
  { Icon: Brain,          top: "30%", left: "68%", size: 36, duration: 12, delay: 0.4, drift: 18, opacity: 0.18 },
  { Icon: Feather,        top: "60%", left: "56%", size: 26, duration: 10, delay: 1.3, drift: -10, opacity: 0.12 },
  { Icon: Target,         top: "12%", left: "40%", size: 32, duration: 11.5, delay: 0.7, drift: 13, opacity: 0.16 },
  { Icon: Puzzle,         top: "76%", left: "22%", size: 32, duration: 10.8, delay: 1.5, drift: -13, opacity: 0.16 },
];

function FloatingLearningIcons() {
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden>
      {icons.map(({ Icon, top, left, size, duration, delay, drift, opacity }, i) => (
        <motion.div
          key={i}
          className="absolute text-foreground"
          style={{ top, left }}
          initial={{ y: 0, opacity: opacity * 0.5, rotate: 0 }}
          animate={{
            y: [0, drift, 0, -drift, 0],
            opacity: [opacity * 0.5, opacity, opacity * 0.5],
            rotate: [0, drift > 0 ? 8 : -8, 0],
          }}
          transition={{ duration, delay, repeat: Infinity, ease: "easeInOut" }}
        >
          <Icon size={size} strokeWidth={1.2} />
        </motion.div>
      ))}
    </div>
  );
}

function OrbitRings() {
  const rings = [
    { size: 380, duration: 48, reverse: false, opacity: 0.22 },
    { size: 560, duration: 62, reverse: true,  opacity: 0.16 },
    { size: 760, duration: 80, reverse: false, opacity: 0.1 },
    { size: 980, duration: 100, reverse: true, opacity: 0.06 },
  ];

  return (
    <div
      className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
      aria-hidden
    >
      {rings.map(({ size, duration, reverse, opacity }, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full border border-foreground"
          style={{
            width: size,
            height: size,
            top: -size / 2,
            left: -size / 2,
            opacity,
          }}
          animate={{ rotate: reverse ? -360 : 360 }}
          transition={{ duration, repeat: Infinity, ease: "linear" }}
        >
          {[0, 72, 144, 216, 288].map((deg) => (
            <span
              key={deg}
              className="absolute w-1.5 h-1.5 rounded-full bg-foreground"
              style={{
                top: "50%",
                left: "50%",
                transform: `rotate(${deg}deg) translate(${size / 2}px) translate(-50%, -50%)`,
                transformOrigin: "0 0",
              }}
            />
          ))}
        </motion.div>
      ))}

      <motion.div
        animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="w-6 h-6 rounded-full bg-foreground blur-[2px]"
      />
      <motion.div
        animate={{ scale: [1, 1.6, 1], opacity: [0.15, 0, 0.15] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeOut" }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-foreground/20 blur-xl"
      />
    </div>
  );
}

export function HeroBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden bg-background">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(0_0%_12%)_0%,hsl(var(--background))_65%)]" />

      <div
        className="absolute inset-0 opacity-[0.18]"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(255,255,255,0.6) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
          maskImage:
            "radial-gradient(ellipse at center, black 30%, transparent 80%)",
          WebkitMaskImage:
            "radial-gradient(ellipse at center, black 30%, transparent 80%)",
        }}
      />

      <motion.div
        aria-hidden
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,0.9) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.9) 1px, transparent 1px)",
          backgroundSize: "120px 120px",
        }}
        animate={{ backgroundPosition: ["0px 0px", "120px 120px"] }}
        transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
      />

      <OrbitRings />
      <FloatingLearningIcons />

      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-background to-transparent pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-background to-transparent pointer-events-none" />
    </div>
  );
}
