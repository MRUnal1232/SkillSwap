import { cn } from "@/lib/utils";

const variantClasses = {
  error: "border-border bg-secondary/60 text-foreground",
  success: "border-border/70 bg-secondary/40 text-foreground",
  info: "border-border/60 bg-secondary/30 text-foreground",
};

export function Alert({ className, variant = "info", ...props }) {
  return (
    <div
      className={cn(
        "w-full rounded-lg border px-4 py-3 text-sm",
        variantClasses[variant],
        className
      )}
      {...props}
    />
  );
}
