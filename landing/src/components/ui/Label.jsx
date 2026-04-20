import { cn } from "@/lib/utils";

export function Label({ className, ...props }) {
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
