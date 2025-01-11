export type Size = "sm" | "md" | "lg" | "xl";
export type Variant = "primary" | "secondary" | "outline" | "ghost";
export type Intent = "info" | "success" | "warning" | "error";

export interface BaseProps {
  size?: Size;
  variant?: Variant;
  intent?: Intent;
  className?: string;
}
