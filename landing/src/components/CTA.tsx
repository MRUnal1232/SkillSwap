import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Hls from "hls.js";
import { fadeUp } from "@/lib/utils";
import { Logo } from "./Logo";

const CTA_HLS =
  "https://stream.mux.com/8wrHPCX2dC3msyYU9ObwqNdm00u3ViXvOSHUMRYSEe5Q.m3u8";

export function CTA() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let hls: Hls | undefined;

    if (Hls.isSupported()) {
      hls = new Hls();
      hls.loadSource(CTA_HLS);
      hls.attachMedia(video);
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = CTA_HLS;
    }

    return () => {
      hls?.destroy();
    };
  }, []);

  return (
    <section className="relative py-32 md:py-44 border-t border-border/30 overflow-hidden">
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover z-0"
        autoPlay
        loop
        muted
        playsInline
      />
      <div className="absolute inset-0 bg-background/45 z-[1]" />

      <div className="relative z-10 flex flex-col items-center text-center px-6">
        <motion.div {...fadeUp(0)} className="mb-8">
          <Logo outerClassName="w-10 h-10" innerClassName="w-5 h-5" />
        </motion.div>

        <motion.h2
          {...fadeUp(0.1)}
          className="text-5xl md:text-7xl font-medium tracking-[-1px] max-w-4xl leading-[1.05]"
        >
          Start Your{" "}
          <span className="font-serif italic font-normal">Journey</span>
        </motion.h2>

        <motion.p
          {...fadeUp(0.2)}
          className="text-muted-foreground text-lg max-w-2xl mt-6"
        >
          Whether you're here to learn something new or teach what you know —
          SkillSwap meets you where you are and takes you further.
        </motion.p>

        <motion.div
          {...fadeUp(0.3)}
          className="flex flex-col sm:flex-row gap-3 mt-10"
        >
          <Link to="/register">
            <motion.span
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className="inline-block bg-foreground text-background rounded-lg px-8 py-3.5 text-sm font-semibold tracking-wide"
            >
              Join SkillSwap
            </motion.span>
          </Link>
          <Link to="/register">
            <motion.span
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className="inline-block liquid-glass rounded-lg px-8 py-3.5 text-sm font-semibold tracking-wide text-foreground"
            >
              Start Teaching
            </motion.span>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
