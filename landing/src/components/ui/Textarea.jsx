import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export const Textarea = forwardRef(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "w-full min-h-[96px] px-4 py-3 rounded-lg bg-input/60 border border-border/60 text-foreground placeholder:text-muted-foreground text-sm",
      "outline-none focus:border-foreground/50 focus:ring-2 focus:ring-ring/40 transition-colors resize-y",
      className
    )}
    {...props}
  />
));
Textarea.displayName = "Textarea";
