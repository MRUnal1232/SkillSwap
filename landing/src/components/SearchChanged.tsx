import { motion } from "framer-motion";
import { MessageSquare, Search, Sparkles } from "lucide-react";
import { fadeUp } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import { AmbientIcons } from "./AmbientIcons";

interface Platform {
  name: string;
  description: string;
  Icon: LucideIcon;
}

const platforms: Platform[] = [
  {
    name: "ChatGPT",
    description:
      "Great for surface answers, blind to context, and never held you accountable for showing up.",
    Icon: MessageSquare,
  },
  {
    name: "Perplexity",
    description:
      "Summaries in seconds, but no one across the table to question your assumptions.",
    Icon: Search,
  },
  {
    name: "Google AI",
    description:
      "Endless information, zero relationship — and relationships are where skills actually stick.",
    Icon: Sparkles,
  },
];

export function SearchChanged() {
  return (
    <section className="relative pt-52 md:pt-64 pb-6 md:pb-9 px-6 overflow-hidden">
      <AmbientIcons opacityBase={0.04} opacityPeak={0.12} />
      <div className="relative z-10 max-w-6xl mx-auto text-center">
        <motion.h2
          {...fadeUp(0)}
          className="text-5xl md:text-7xl lg:text-8xl font-medium tracking-[-2px] leading-[1.05]"
        >
          Learning has{" "}
          <span className="font-serif italic font-normal">changed.</span> Have
          you?
        </motion.h2>

        <motion.p
          {...fadeUp(0.1)}
          className="text-muted-foreground text-lg max-w-2xl mx-auto mt-8 mb-24"
        >
          AI can answer questions in milliseconds — but it can't replace a real
          teacher, the nuance of a mentor, or the momentum of learning with
          someone else.
        </motion.p>

        <div className="grid md:grid-cols-3 gap-12 md:gap-8 mb-20">
          {platforms.map((p, i) => (
            <motion.div
              key={p.name}
              {...fadeUp(0.1 + i * 0.1)}
              className="flex flex-col items-center text-center group"
            >
              <motion.div
                whileHover={{ y: -6, rotate: -2 }}
                transition={{ type: "spring", stiffness: 200, damping: 18 }}
                className="w-[200px] h-[200px] liquid-glass rounded-3xl flex items-center justify-center mb-8 relative overflow-hidden"
              >
                <motion.div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.08),transparent_70%)]"
                />
                <motion.div
                  animate={{ rotate: [0, 4, 0, -4, 0] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                  className="group-hover:scale-110 transition-transform duration-500"
                >
                  <p.Icon
                    className="w-20 h-20 text-foreground/85"
                    strokeWidth={1.2}
                  />
                </motion.div>
              </motion.div>
              <h3 className="font-semibold text-base mb-2">{p.name}</h3>
              <p className="text-muted-foreground text-sm max-w-xs">
                {p.description}
              </p>
            </motion.div>
          ))}
        </div>

        <motion.p
          {...fadeUp(0.4)}
          className="text-muted-foreground text-sm text-center"
        >
          If you don't share what you know, someone else will.
        </motion.p>
      </div>
    </section>
  );
}
