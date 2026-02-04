"use client"

import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { CheckIcon } from "lucide-react"

import { cn } from "@/lib/utils"

function Checkbox({
  className,
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        // Base styles - stronger border for visibility
        "peer size-4 shrink-0 rounded-[4px] border-2 shadow-xs transition-all outline-none",
        
        // Unchecked state - improved visibility in both modes
        "border-input/60 bg-background",
        "dark:border-input/70 dark:bg-input/20",
        
        // Hover state - subtle feedback
        "hover:border-input/80 dark:hover:border-input/90",
        "hover:bg-accent/20 dark:hover:bg-input/30",
        
        // Checked state - clear indication
        "data-[state=checked]:bg-primary data-[state=checked]:border-primary",
        "data-[state=checked]:text-primary-foreground",
        
        // Focus state
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        
        // Invalid state
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40",
        "aria-invalid:border-destructive",
        
        // Disabled state
        "disabled:cursor-not-allowed disabled:opacity-50",
        
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="grid place-content-center text-current transition-none"
      >
        <CheckIcon className="size-3.5" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

export { Checkbox }
