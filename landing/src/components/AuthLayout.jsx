import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Logo } from "./Logo";

export function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center px-6 py-16 relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 opacity-[0.04]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,white,transparent_55%)]" />
      </div>

      <Link
        to="/"
        className="absolute top-8 left-8 md:top-10 md:left-12 flex items-center gap-2.5 text-foreground hover:opacity-80 transition-opacity"
      >
        <Logo />
        <span className="font-bold text-lg tracking-tight">SkillSwap</span>
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md relative z-10"
      >
        <div className="liquid-glass rounded-3xl p-8 md:p-10">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-medium tracking-[-0.5px] leading-tight">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-2 text-muted-foreground text-sm">{subtitle}</p>
            )}
          </div>
          {children}
        </div>
        {footer && (
          <div className="mt-6 text-center text-sm text-muted-foreground">
            {footer}
          </div>
        )}
      </motion.div>
    </div>
  );
}
