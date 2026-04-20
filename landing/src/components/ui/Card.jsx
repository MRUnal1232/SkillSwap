import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export const Card = forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-2xl border border-border/50 bg-card/60 p-6 backdrop-blur-sm",
      className
    )}
    {...props}
  />
));
Card.displayName = "Card";
