import { cn } from "@/lib/utils";

export function Logo({ outerClassName, innerClassName, className }) {
  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full border-2 border-foreground/60",
        outerClassName ?? "w-7 h-7",
        className
      )}
    >
      <div
        className={cn(
          "rounded-full border border-foreground/60",
          innerClassName ?? "w-3 h-3"
        )}
      />
    </div>
  );
}
