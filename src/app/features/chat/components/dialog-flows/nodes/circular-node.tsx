import { cn } from "@/lib/utils";

type CircularNodeProps = React.PropsWithChildren<{
  className?: string;
  icon: React.ReactNode;
  label?: string;
}>;

export const DIAMETER = 80 /* size-20 */ + 8; /* white border */
export const RADIUS = DIAMETER / 2;

export default function CircularNode({
  className,
  icon,
  label,
  children,
}: CircularNodeProps) {
  return (
    <div
      className={cn(
        "relative [--bg:theme(colors.neutral.200)] [--text:black]",
        className
      )}
    >
      <div className="p-1 rounded-full z-10 relative bg-white">
        <div className="size-20 rounded-full bg-[var(--bg)] text-[var(--text)] flex items-center justify-center">
          {icon}
        </div>
      </div>

      {label ? (
        <div className="absolute top-full left-0 right-0 text-center text-sm font-medium">
          {label}
        </div>
      ) : null}

      {children}
    </div>
  );
}
