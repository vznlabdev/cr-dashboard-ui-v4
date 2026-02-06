"use client"

import { User, Sparkles, Settings, Database, FileText, Image as ImageIcon, Shield, ChevronRight, Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface AIComplianceWorkflowProps {
  assetId: string
  copyrightCheckStatus?: string
}

const WORKFLOW_STEPS = [
  { id: 1, name: "Creator", icon: User },
  { id: 2, name: "Tool", icon: Sparkles },
  { id: 3, name: "Model", icon: Settings },
  { id: 4, name: "Training", icon: Database },
  { id: 5, name: "Prompt", icon: FileText },
  { id: 6, name: "Output", icon: ImageIcon },
  { id: 7, name: "Copyright", icon: Shield },
]

export function AIComplianceWorkflow({ assetId, copyrightCheckStatus }: AIComplianceWorkflowProps) {
  return (
    <div className="flex items-center gap-2">
      {WORKFLOW_STEPS.map((step, index) => {
        const Icon = step.icon
        // For now, all steps except copyright are completed
        // Copyright depends on copyrightCheckStatus
        const isCompleted = step.id === 7 
          ? copyrightCheckStatus === "completed"
          : true
        
        return (
          <div key={step.id} className="flex items-center gap-2">
            <div className={cn(
              "flex items-center gap-1.5 px-2 py-1.5 rounded-md border text-xs font-medium whitespace-nowrap",
              isCompleted 
                ? "bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/30 dark:border-emerald-800 dark:text-emerald-300" 
                : "bg-muted border-border text-muted-foreground"
            )}>
              <Icon className="h-3 w-3 flex-shrink-0" />
              <span>{step.name}</span>
              {isCompleted && <Check className="h-3 w-3 flex-shrink-0" />}
            </div>
            {index < WORKFLOW_STEPS.length - 1 && (
              <ChevronRight className="h-3 w-3 text-muted-foreground flex-shrink-0" />
            )}
          </div>
        )
      })}
    </div>
  )
}
