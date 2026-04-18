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
  type LucideIcon,
} from "lucide-react";

interface FloatingIconConfig {
  Icon: LucideIcon;
  top: string;
  left: string;
  size: number;
  duration: number;
  delay: number;
  drift: number;
}

const defaultIcons: FloatingIconConfig[] = [
  { Icon: BookOpen, top: "10%", left: "6%", size: 28, duration: 9, delay: 0, drift: 18 },
  { Icon: GraduationCap, top: "18%", left: "88%", size: 32, duration: 11, delay: 1.2, drift: -22 },
  { Icon: Lightbulb, top: "72%", left: "12%", size: 26, duration: 10, delay: 0.5, drift: 20 },
  { Icon: Code2, top: "80%", left: "84%", size: 30, duration: 12, delay: 2, drift: -16 },
  { Icon: Palette, top: "6%", left: "42%", size: 24, duration: 8, delay: 0.8, drift: 14 },
  { Icon: Music, top: "85%", left: "48%", size: 24, duration: 9.5, delay: 1.6, drift: -18 },
  { Icon: Globe, top: "48%", left: "3%", size: 28, duration: 11, delay: 0.3, drift: 14 },
  { Icon: Camera, top: "50%", left: "95%", size: 26, duration: 10.5, delay: 1.4, drift: -12 },
  { Icon: PenTool, top: "32%", left: "20%", size: 22, duration: 8.5, delay: 1.8, drift: 10 },
  { Icon: Calculator, top: "62%", left: "74%", size: 24, duration: 9.2, delay: 0.9, drift: -11 },
  { Icon: Mic, top: "16%", left: "70%", size: 24, duration: 10.8, delay: 2.2, drift: 13 },
  { Icon: Sparkles, top: "58%", left: "32%", size: 22, duration: 8.8, delay: 1.1, drift: -9 },
  { Icon: Compass, top: "40%", left: "60%", size: 22, duration: 9.4, delay: 0.6, drift: 12 },
  { Icon: Rocket, top: "26%", left: "52%", size: 22, duration: 11.2, delay: 1.9, drift: -10 },
  { Icon: Brain, top: "76%", left: "32%", size: 24, duration: 9.8, delay: 0.4, drift: 16 },
  { Icon: Feather, top: "38%", left: "82%", size: 20, duration: 8.2, delay: 1.3, drift: -8 },
];

interface AmbientIconsProps {
  icons?: FloatingIconConfig[];
  opacityBase?: number;
  opacityPeak?: number;
  className?: string;
}

export function AmbientIcons({
  icons = defaultIcons,
  opacityBase = 0.08,
  opacityPeak = 0.22,
  className = "",
}: AmbientIconsProps) {
  return (
    <div
      className={`pointer-events-none absolute inset-0 z-[1] ${className}`}
      aria-hidden
    >
      {icons.map(({ Icon, top, left, size, duration, delay, drift }, i) => (
        <motion.div
          key={i}
          className="absolute text-foreground"
          style={{ top, left }}
          initial={{ y: 0, opacity: opacityBase, rotate: 0 }}
          animate={{
            y: [0, drift, 0, -drift, 0],
            opacity: [opacityBase, opacityPeak, opacityBase],
            rotate: [0, drift > 0 ? 6 : -6, 0],
          }}
          transition={{
            duration,
            delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <Icon size={size} strokeWidth={1.3} />
        </motion.div>
      ))}
    </div>
  );
}
