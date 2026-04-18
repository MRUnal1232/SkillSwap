import { cn } from "@/lib/utils";

interface LogoProps {
  outerClassName?: string;
  innerClassName?: string;
  className?: string;
}

export function Logo({ outerClassName, innerClassName, className }: LogoProps) {
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
