import type { ReactNode } from "react";

type TagColor =
  | "primary"
  | "success"
  | "warning"
  | "error"
  | "neutral"
  | "info"
  | "accent";

const COLOR_CLASS: Record<TagColor, string> = {
  primary: "border-primary text-primary",
  success: "border-success text-success",
  warning: "border-warning text-warning",
  error: "border-error text-error",
  neutral: "border-neutral text-neutral",
  info: "border-info text-info",
  accent: "border-accent text-accent",
};

type UserGroupTagProps = {
  label: ReactNode;
  color?: TagColor;
  className?: string;
};

export default function UserGroupTag({
  label,
  color = "primary",
  className,
}: UserGroupTagProps) {
  const colorClass = COLOR_CLASS[color];
  return (
    <span
      className={`pointer-events-none inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold ${colorClass} ${className ?? ""}`}
    >
      {label}
    </span>
  );
}
