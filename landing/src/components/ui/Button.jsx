import { forwardRef } from "react";
import { cn } from "@/lib/utils";

const variantClasses = {
  primary:
    "bg-foreground text-background hover:bg-foreground/90 active:bg-foreground/80",
  ghost: "bg-transparent text-foreground hover:bg-secondary/60",
  outline:
    "bg-transparent text-foreground border border-border hover:bg-secondary/40",
  danger:
    "bg-transparent text-foreground border border-border/70 hover:bg-secondary/60",
  glass: "liquid-glass text-foreground hover:bg-white/5",
};

const sizeClasses = {
  sm: "h-9 px-3.5 text-xs",
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-7 text-sm",
};

export const Button = forwardRef(
  ({ className, variant = "primary", size = "md", ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg font-semibold tracking-wide transition-colors disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    />
  )
);
Button.displayName = "Button";
