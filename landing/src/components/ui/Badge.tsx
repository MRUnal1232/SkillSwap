import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Tone = "default" | "muted" | "outline" | "success" | "danger";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
}

const toneClasses: Record<Tone, string> = {
  default: "bg-foreground text-background",
  muted: "bg-secondary text-secondary-foreground",
  outline: "border border-border/70 text-foreground",
  success: "bg-secondary text-foreground border border-border/60",
  danger: "bg-secondary/40 text-foreground/70 border border-border/40",
};

export function Badge({ className, tone = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium tracking-wide uppercase",
        toneClasses[tone],
        className
      )}
      {...props}
    />
  );
}
