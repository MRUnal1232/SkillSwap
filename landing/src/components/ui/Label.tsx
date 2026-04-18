import type { LabelHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Label({
  className,
  ...props
}: LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn(
        "block text-xs uppercase tracking-[2px] text-muted-foreground mb-2",
        className
      )}
      {...props}
    />
  );
}
