import { motion } from "framer-motion";
import { fadeUp } from "@/lib/utils";

const SOLUTION_VIDEO =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260325_125119_8e5ae31c-0021-4396-bc08-f7aebeb877a2.mp4";

const features = [
  {
    title: "Curated Mentors",
    description:
      "Hand-picked teachers across disciplines — vetted by the community, not by ad spend.",
  },
  {
    title: "Booking Tools",
    description:
      "Open your calendar, set your rate, and run sessions without wrestling a scheduler.",
  },
  {
    title: "Community",
    description:
      "Trade skills with people who show up — peers who share the work, not just the post.",
  },
  {
    title: "Distribution",
    description:
      "Build an audience as you teach. Every session you run grows your reach.",
  },
];

export function Solution() {
  return (
    <section className="py-32 md:py-44 border-t border-border/30 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.p
          {...fadeUp(0)}
          className="text-xs tracking-[3px] uppercase text-muted-foreground text-center mb-6"
        >
          SOLUTION
        </motion.p>

        <motion.h2
          {...fadeUp(0.1)}
          className="text-4xl md:text-6xl font-medium tracking-[-1px] text-center max-w-4xl mx-auto leading-[1.1]"
        >
          The platform for{" "}
          <span className="font-serif italic font-normal">meaningful</span>{" "}
          skill exchange
        </motion.h2>

        <motion.div
          {...fadeUp(0.2)}
          className="mt-16 md:mt-20 rounded-2xl overflow-hidden aspect-[3/1]"
        >
          <video
            className="w-full h-full object-cover"
            src={SOLUTION_VIDEO}
            autoPlay
            loop
            muted
            playsInline
          />
        </motion.div>

        <div className="grid md:grid-cols-4 gap-8 mt-16 md:mt-20">
          {features.map((f, i) => (
            <motion.div key={f.title} {...fadeUp(0.1 + i * 0.08)}>
              <h3 className="font-semibold text-base mb-2">{f.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {f.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
