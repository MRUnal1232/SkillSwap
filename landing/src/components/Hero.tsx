import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { fadeUp } from "@/lib/utils";
import { HeroBackground } from "./HeroBackground";

const avatars = [
  "https://api.dicebear.com/7.x/notionists/svg?seed=Alex&backgroundColor=1a1a1a",
  "https://api.dicebear.com/7.x/notionists/svg?seed=Jordan&backgroundColor=1a1a1a",
  "https://api.dicebear.com/7.x/notionists/svg?seed=Sam&backgroundColor=1a1a1a",
];

export function Hero() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const q = email ? `?email=${encodeURIComponent(email)}` : "";
    navigate(`/register${q}`);
  };

  return (
    <section className="relative min-h-screen w-full overflow-hidden">
      <HeroBackground />

      <div className="relative z-10 flex flex-col items-center text-center px-6 pt-28 md:pt-32 pb-32">
        <motion.div
          {...fadeUp(0)}
          className="flex items-center gap-3 mb-8"
        >
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
          Swap{" "}
          <span className="font-serif italic font-normal">Skills</span>, Grow
          Together
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

        <motion.form
          {...fadeUp(0.3)}
          onSubmit={handleSubmit}
          className="liquid-glass rounded-full p-2 mt-10 w-full max-w-lg flex items-center gap-2"
        >
          <input
            type="email"
            required
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 bg-transparent outline-none px-5 py-3 text-foreground placeholder:text-muted-foreground text-sm"
          />
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="bg-foreground text-background rounded-full px-8 py-3 text-sm font-semibold tracking-wide"
          >
            JOIN FREE
          </motion.button>
        </motion.form>
      </div>
    </section>
  );
}
