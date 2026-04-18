import { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";

const MISSION_VIDEO =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260325_132944_a0d124bb-eaa1-4082-aa30-2310efb42b4b.mp4";

const PARAGRAPH_ONE =
  "We're building a space where curiosity meets possibility — where learners find mentors, teachers find students, and every skill becomes a conversation worth having.";

const PARAGRAPH_TWO =
  "A platform where skills, community, and momentum flow together — with less friction, less gatekeeping, and more meaning for everyone involved.";

const HIGHLIGHTED = new Set(["curiosity", "meets", "possibility"]);

function splitWords(text: string) {
  return text.split(/\s+/).filter(Boolean);
}

interface WordProps {
  word: string;
  progress: MotionValue<number>;
  range: [number, number];
  highlighted: boolean;
}

function Word({ word, progress, range, highlighted }: WordProps) {
  const opacity = useTransform(progress, range, [0.15, 1]);
  return (
    <motion.span
      style={{
        opacity,
        color: highlighted
          ? "hsl(var(--foreground))"
          : "hsl(var(--hero-subtitle))",
      }}
      className="inline-block mr-[0.25em]"
    >
      {word}
    </motion.span>
  );
}

export function Mission() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 0.85", "end 0.3"],
  });

  const p1Words = splitWords(PARAGRAPH_ONE);
  const p2Words = splitWords(PARAGRAPH_TWO);
  const total = p1Words.length + p2Words.length;

  return (
    <section ref={containerRef} className="pt-0 pb-32 md:pb-44 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-center mb-20 md:mb-28">
          <video
            className="w-full max-w-[800px] aspect-square object-cover rounded-3xl"
            src={MISSION_VIDEO}
            autoPlay
            loop
            muted
            playsInline
          />
        </div>

        <p className="text-2xl md:text-4xl lg:text-5xl font-medium tracking-[-1px] leading-[1.2] text-center">
          {p1Words.map((w, i) => {
            const cleaned = w.replace(/[^a-zA-Z]/g, "").toLowerCase();
            const start = i / total;
            const end = (i + 1) / total;
            return (
              <Word
                key={`p1-${i}`}
                word={w}
                progress={scrollYProgress}
                range={[start, end]}
                highlighted={HIGHLIGHTED.has(cleaned)}
              />
            );
          })}
        </p>

        <p className="text-xl md:text-2xl lg:text-3xl font-medium mt-10 leading-[1.3] text-center">
          {p2Words.map((w, i) => {
            const idx = p1Words.length + i;
            const start = idx / total;
            const end = (idx + 1) / total;
            return (
              <Word
                key={`p2-${i}`}
                word={w}
                progress={scrollYProgress}
                range={[start, end]}
                highlighted={false}
              />
            );
          })}
        </p>
      </div>
    </section>
  );
}
