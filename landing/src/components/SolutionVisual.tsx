import { useRef, type MouseEvent } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { AmbientIcons } from "./AmbientIcons";

const rowA = [
  "React",
  "Public Speaking",
  "Python",
  "UI Design",
  "Photography",
  "Spanish",
  "Guitar",
  "Figma",
  "Machine Learning",
  "Writing",
  "Product Strategy",
  "CSS",
];

const rowB = [
  "SQL",
  "Mindful Habits",
  "Cooking",
  "Storytelling",
  "Go",
  "Finance 101",
  "Video Editing",
  "3D Modeling",
  "Yoga",
  "Mandarin",
  "Calligraphy",
  "Pitching",
];

function Chip({ label }: { label: string }) {
  return (
    <motion.span
      whileHover={{
        scale: 1.1,
        backgroundColor: "rgba(255,255,255,0.1)",
        borderColor: "rgba(255,255,255,0.6)",
      }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="shrink-0 mx-2 px-4 py-2 rounded-full text-xs md:text-sm tracking-wide border border-border/60 bg-secondary/40 text-foreground/90 whitespace-nowrap cursor-pointer select-none"
    >
      {label}
    </motion.span>
  );
}

function MarqueeRow({
  items,
  direction = "left",
  duration = 40,
}: {
  items: string[];
  direction?: "left" | "right";
  duration?: number;
}) {
  const doubled = [...items, ...items];
  const animationName = direction === "left" ? "marquee-left" : "marquee-right";
  return (
    <div className="flex w-max">
      <div
        className="flex items-center marquee-track"
        style={{
          animation: `${animationName} ${duration}s linear infinite`,
        }}
      >
        {doubled.map((label, i) => (
          <Chip key={`${label}-${i}`} label={label} />
        ))}
      </div>
    </div>
  );
}

export function SolutionVisual() {
  const containerRef = useRef<HTMLDivElement>(null);

  const mouseX = useMotionValue(-500);
  const mouseY = useMotionValue(-500);
  const springX = useSpring(mouseX, { stiffness: 180, damping: 22 });
  const springY = useSpring(mouseY, { stiffness: 180, damping: 22 });

  const spotlight = useTransform(
    [springX, springY] as const,
    ([x, y]: number[]) =>
      `radial-gradient(340px circle at ${x}px ${y}px, rgba(255,255,255,0.09), transparent 60%)`
  );

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  };

  const handleMouseLeave = () => {
    mouseX.set(-500);
    mouseY.set(-500);
  };

  return (
    <motion.div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileHover={{ scale: 1.005 }}
      transition={{ duration: 0.4 }}
      className="solution-visual group relative w-full aspect-[3/1] rounded-2xl overflow-hidden border border-border/40 bg-[radial-gradient(ellipse_at_center,hsl(var(--card))_0%,hsl(var(--background))_70%)]"
    >
      <div className="pointer-events-none absolute inset-0 opacity-[0.04] bg-[radial-gradient(circle_at_30%_30%,white,transparent_40%),radial-gradient(circle_at_70%_80%,white,transparent_40%)]" />

      <AmbientIcons />

      <motion.div
        className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ background: spotlight }}
      />

      <div className="absolute inset-0 flex flex-col justify-center gap-4 md:gap-6">
        <MarqueeRow items={rowA} direction="left" duration={45} />
        <MarqueeRow items={rowB} direction="right" duration={55} />
      </div>

      <div className="pointer-events-none absolute inset-y-0 left-0 w-24 md:w-40 bg-gradient-to-r from-background to-transparent z-[2]" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-24 md:w-40 bg-gradient-to-l from-background to-transparent z-[2]" />

      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[3]">
        <motion.div
          animate={{ scale: [1, 1.04, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="liquid-glass rounded-full px-5 py-2 text-[10px] md:text-xs uppercase tracking-[3px] text-foreground/80"
        >
          Teach ⇄ Learn
        </motion.div>
      </div>
    </motion.div>
  );
}
