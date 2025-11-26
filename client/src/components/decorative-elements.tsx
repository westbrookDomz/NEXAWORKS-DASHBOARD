import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface DecorativeShapeProps {
  className?: string;
  delay?: number;
  variant?: "circle" | "square" | "pill";
  color?: "primary" | "secondary" | "accent";
}

export function DecorativeShape({ className, delay = 0, variant = "circle", color = "primary" }: DecorativeShapeProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1, delay, ease: "easeOut" }}
      className={cn(
        "absolute pointer-events-none z-0 blur-3xl opacity-20",
        variant === "circle" && "rounded-full",
        variant === "square" && "rounded-3xl rotate-12",
        variant === "pill" && "rounded-full w-32 h-12",
        color === "primary" && "bg-primary",
        color === "secondary" && "bg-purple-500",
        color === "accent" && "bg-blue-500",
        className
      )}
    />
  );
}

export function GridPattern({ className }: { className?: string }) {
  return (
    <div className={cn("absolute inset-0 z-0 opacity-[0.03] pointer-events-none", className)}
      style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--foreground)) 1px, transparent 0)`,
        backgroundSize: '40px 40px'
      }}
    />
  );
}
