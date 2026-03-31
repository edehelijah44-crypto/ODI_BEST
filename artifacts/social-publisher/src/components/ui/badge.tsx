import * as React from "react"
import { cn } from "@/lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline" | "success" | "warning"
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variants = {
    default: "border-transparent bg-primary/20 text-primary-foreground hover:bg-primary/30",
    secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
    destructive: "border-transparent bg-destructive/20 text-destructive-foreground hover:bg-destructive/30",
    outline: "text-foreground border-white/10",
    success: "border-transparent bg-green-500/20 text-green-400 hover:bg-green-500/30",
    warning: "border-transparent bg-orange-500/20 text-orange-400 hover:bg-orange-500/30",
  }

  return (
    <div className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2", variants[variant], className)} {...props} />
  )
}

export { Badge }
