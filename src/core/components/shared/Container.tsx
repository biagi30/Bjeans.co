import type { ReactNode } from "react";
import { cn } from "@/core/lib/utils";

type ContainerProps = {
  children: ReactNode;
  className?: string;
};

export function Container({ children, className }: ContainerProps) {
  return (
    <div className={cn("mx-auto w-full max-w-6xl px-6 md:px-10 lg:px-0", className)}>
      {children}
    </div>
  );
}
