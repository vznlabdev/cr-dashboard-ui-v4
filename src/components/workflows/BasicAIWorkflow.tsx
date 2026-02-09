"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getAvailableToolsForProject } from "@/lib/ai-tools-data"
import type { Task } from "@/types"
import { ExternalLink, Eye, Check } from "lucide-react"
import { toast } from "sonner"

export interface BasicAIWorkflowProps {
  task: Task
  projectId: string
  taskId: string
  onComplete?: () => void
}

export function BasicAIWorkflow({
  task,
  projectId,
  taskId,
  onComplete,
}: BasicAIWorkflowProps) {
  const tools = getAvailableToolsForProject(projectId)

  function handleMarkComplete() {
    toast.success("Workflow marked complete. Extension will have captured your session.")
    onComplete?.()
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-semibold">Use AI for this task</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Pick a tool, use it for your work. The browser extension will capture prompts, generations, and downloads.
        </p>
      </div>

      <div>
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
          Choose a tool
        </p>
        <div className="grid grid-cols-2 gap-3">
          {tools.map((tool) => (
            <Card
              key={tool.id}
              className="hover:border-blue-400 transition-colors"
            >
              <CardContent className="p-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">{tool.icon}</span>
                  <div>
                    <p className="text-xs font-medium">{tool.name}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {tool.category}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[9px]">
                    {tool.trackingLevel}
                  </Badge>
                  <Button
                    size="sm"
                    className="ml-auto h-6 text-[10px]"
                    onClick={() => {
                      window.open(tool.baseUrl, "_blank")
                      toast.success(
                        `Launched ${tool.name} — extension will track your session`
                      )
                    }}
                  >
                    <ExternalLink className="mr-1 h-3 w-3" /> Launch
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2 p-2.5 rounded-lg bg-muted/50 border border-border/50">
        <Eye className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
        <span className="text-[10px] text-muted-foreground">
          Browser extension will capture prompts, generations, and downloads.
        </span>
      </div>

      <div className="border-t pt-4">
        <Button size="sm" onClick={handleMarkComplete}>
          <Check className="mr-1.5 h-3.5 w-3.5" />
          Mark workflow complete
        </Button>
      </div>
    </div>
  )
}
