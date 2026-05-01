import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/core/lib/utils";

type ButtonVariant = "primary" | "outline" | "light";
type ButtonSize = "sm" | "md" | "lg";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
};

const baseStyles =
  "inline-flex items-center justify-center gap-2 rounded-full text-sm font-semibold transition-colors";

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-4 py-2 text-xs",
  md: "px-6 py-3 text-sm",
  lg: "px-7 py-3.5 text-base",
};

const variantStyles: Record<ButtonVariant, string> = {
  primary: "bg-primary text-primary-foreground shadow-lg shadow-indigo-500/30",
  outline: "border border-white/15 text-foreground",
  light: "bg-white text-black",
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  type = "button",
  startIcon,
  endIcon,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(baseStyles, sizeStyles[size], variantStyles[variant], className)}
      {...props}
    >
      {startIcon ? <span className="text-[1.1em]">{startIcon}</span> : null}
      <span>{props.children}</span>
      {endIcon ? <span className="text-[1.1em]">{endIcon}</span> : null}
    </button>
  );
}
