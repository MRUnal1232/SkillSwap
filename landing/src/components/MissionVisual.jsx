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

const rings = [
  {
    radius: 120,
    duration: 34,
    reverse: false,
    iconSize: 20,
    iconOpacity: 0.9,
    items: [
      { Icon: BookOpen, angle: 0 },
      { Icon: Lightbulb, angle: 90 },
      { Icon: PenTool, angle: 180 },
      { Icon: Sparkles, angle: 270 },
    ],
  },
  {
    radius: 210,
    duration: 52,
    reverse: true,
    iconSize: 22,
    iconOpacity: 0.7,
    items: [
      { Icon: GraduationCap, angle: 30 },
      { Icon: Code2, angle: 100 },
      { Icon: Palette, angle: 175 },
      { Icon: Music, angle: 240 },
      { Icon: Globe, angle: 310 },
    ],
  },
  {
    radius: 310,
    duration: 74,
    reverse: false,
    iconSize: 26,
    iconOpacity: 0.5,
    items: [
      { Icon: Camera, angle: 10 },
      { Icon: Calculator, angle: 70 },
      { Icon: Mic, angle: 130 },
      { Icon: Compass, angle: 190 },
      { Icon: Rocket, angle: 250 },
      { Icon: Brain, angle: 310 },
    ],
  },
  {
    radius: 380,
    duration: 96,
    reverse: true,
    iconSize: 24,
    iconOpacity: 0.35,
    items: [
      { Icon: Feather, angle: 45 },
      { Icon: Target, angle: 135 },
      { Icon: Puzzle, angle: 225 },
      { Icon: Sparkles, angle: 315 },
    ],
  },
];

function Orbit({ ring }) {
  const d = ring.radius * 2;
  return (
    <motion.div
      className="absolute top-1/2 left-1/2 rounded-full border border-foreground/10"
      style={{
        width: d,
        height: d,
        top: `calc(50% - ${ring.radius}px)`,
        left: `calc(50% - ${ring.radius}px)`,
      }}
      animate={{ rotate: ring.reverse ? -360 : 360 }}
      transition={{ duration: ring.duration, repeat: Infinity, ease: "linear" }}
    >
      {ring.items.map(({ Icon, angle }, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{
            top: "50%",
            left: "50%",
            transform: `rotate(${angle}deg) translate(${ring.radius}px) rotate(-${angle}deg) translate(-50%, -50%)`,
            transformOrigin: "0 0",
            opacity: ring.iconOpacity,
          }}
        >
          <motion.div
            animate={{ rotate: ring.reverse ? 360 : -360 }}
            transition={{
              duration: ring.duration,
              repeat: Infinity,
              ease: "linear",
            }}
            className="flex items-center justify-center"
          >
            <div className="w-10 h-10 rounded-full liquid-glass flex items-center justify-center">
              <Icon
                size={ring.iconSize}
                strokeWidth={1.3}
                className="text-foreground"
              />
            </div>
          </motion.div>
        </motion.div>
      ))}
    </motion.div>
  );
}

export function MissionVisual() {
  return (
    <div className="relative w-full max-w-[800px] aspect-square rounded-3xl overflow-hidden border border-border/40 bg-[radial-gradient(ellipse_at_center,hsl(0_0%_13%)_0%,hsl(var(--background))_70%)]">
      <div
        className="absolute inset-0 opacity-[0.18]"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(255,255,255,0.6) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          maskImage:
            "radial-gradient(ellipse at center, black 20%, transparent 75%)",
          WebkitMaskImage:
            "radial-gradient(ellipse at center, black 20%, transparent 75%)",
        }}
      />

      <motion.div
        aria-hidden
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,0.9) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.9) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
        }}
        animate={{ backgroundPosition: ["0 0", "80px 80px"] }}
        transition={{ duration: 36, repeat: Infinity, ease: "linear" }}
      />

      {rings.map((r, i) => (
        <Orbit key={i} ring={r} />
      ))}

      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          animate={{ scale: [1, 1.5, 1], opacity: [0.15, 0, 0.15] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeOut" }}
          className="absolute w-40 h-40 rounded-full bg-foreground/20 blur-2xl"
        />
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.6, 0.9, 0.6] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
          className="relative w-14 h-14 rounded-full liquid-glass flex items-center justify-center"
        >
          <Lightbulb className="w-6 h-6 text-foreground" strokeWidth={1.5} />
        </motion.div>
      </div>

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,hsl(var(--background))_95%)]" />
    </div>
  );
}
