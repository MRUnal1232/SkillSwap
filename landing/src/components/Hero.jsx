import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { fadeUp } from "@/lib/utils";
import { HeroBackground } from "./HeroBackground";
import { Logo } from "./Logo";
import { useAuth } from "@/context/AuthContext";

const avatars = [
  "https://api.dicebear.com/7.x/notionists/svg?seed=Alex&backgroundColor=1a1a1a",
  "https://api.dicebear.com/7.x/notionists/svg?seed=Jordan&backgroundColor=1a1a1a",
  "https://api.dicebear.com/7.x/notionists/svg?seed=Sam&backgroundColor=1a1a1a",
];

export function Hero() {
  const { user } = useAuth();

  return (
    <section className="relative min-h-screen w-full overflow-hidden">
      <HeroBackground />

      {/* Minimal brand mark in the top-left so people still know what site this is */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="absolute top-6 left-8 md:top-8 md:left-12 z-20 flex items-center gap-2.5"
      >
        <Logo />
        <span className="font-bold text-lg tracking-tight">SkillSwap</span>
      </motion.div>

      <div className="relative z-10 flex flex-col items-center text-center px-6 pt-28 md:pt-32 pb-32">
        <motion.div {...fadeUp(0)} className="flex items-center gap-3 mb-8">
          <div className="flex -space-x-2">
            {avatars.map((src, i) => (
              <img
                key={i}
                src={src}
                alt=""
                className="w-8 h-8 rounded-full border-2 border-background bg-secondary object-cover"
              />
            ))}
          </div>
          <span className="text-muted-foreground text-sm">
            7,000+ learners already trading skills
          </span>
        </motion.div>

        <motion.h1
          {...fadeUp(0.1)}
          className="text-5xl md:text-7xl lg:text-8xl font-medium tracking-[-2px] max-w-5xl leading-[1.05]"
        >
          Swap <span className="font-serif italic font-normal">Skills</span>,
          Grow Together
        </motion.h1>

        <motion.p
          {...fadeUp(0.2)}
          className="mt-8 text-lg max-w-2xl"
          style={{ color: "hsl(var(--hero-subtitle))" }}
        >
          Join a community where every skill has value — book a mentor, share
          yours, and build a learning habit with people who care about growth
          as much as you do.
        </motion.p>

        <motion.div
          {...fadeUp(0.3)}
          className="mt-10 flex flex-col sm:flex-row items-center gap-3"
        >
          {user ? (
            <Link to="/marketplace">
              <motion.span
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center gap-2 bg-foreground text-background rounded-full px-8 py-3.5 text-sm font-semibold tracking-wide"
              >
                Open App <ArrowRight className="w-4 h-4" />
              </motion.span>
            </Link>
          ) : (
            <>
              <Link to="/register">
                <motion.span
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  className="inline-flex items-center gap-2 bg-foreground text-background rounded-full px-8 py-3.5 text-sm font-semibold tracking-wide"
                >
                  Get Started <ArrowRight className="w-4 h-4" />
                </motion.span>
              </Link>
              <Link to="/login">
                <motion.span
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  className="inline-flex items-center gap-2 liquid-glass rounded-full px-8 py-3.5 text-sm font-semibold tracking-wide text-foreground"
                >
                  Sign In
                </motion.span>
              </Link>
            </>
          )}
        </motion.div>
      </div>
    </section>
  );
}
