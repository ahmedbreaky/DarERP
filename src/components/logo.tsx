import { cn } from "./ui/cn";

export function Logo({ name, inverted }: { name: string; inverted?: boolean }) {
  return (
    <span className="flex items-center gap-2.5">
      <span
        className={cn(
          "grid size-8 place-items-center rounded-lg text-sm font-bold",
          inverted ? "bg-primary-fg text-primary" : "bg-primary text-primary-fg",
        )}
      >
        D
      </span>
      <span className="text-lg font-semibold tracking-tight">{name}</span>
    </span>
  );
}
