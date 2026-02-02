"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Paperclip, TrendingUp, AlertTriangle, TrendingDown, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Project, ProjectHealth } from "@/types"

interface ProjectUpdateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  project: Project
  onSave: (update: {
    content: string
    healthStatus: ProjectHealth
  }) => void
}

const healthOptions = [
  { 
    value: "on-track" as const, 
    label: "On track", 
    icon: TrendingUp, 
    color: "text-green-600"
  },
  { 
    value: "at-risk" as const, 
    label: "At risk", 
    icon: AlertTriangle, 
    color: "text-yellow-600"
  },
  { 
    value: "off-track" as const, 
    label: "Off track", 
    icon: TrendingDown, 
    color: "text-red-600"
  }
]

export function ProjectUpdateDialog({ 
  open, 
  onOpenChange, 
  project,
  onSave 
}: ProjectUpdateDialogProps) {
  const [content, setContent] = useState("")
  const [healthStatus, setHealthStatus] = useState<ProjectHealth>("on-track")

  const handleSave = () => {
    if (!content.trim()) return
    
    onSave({
      content: content.trim(),
      healthStatus
    })
    
    // Reset form
    setContent("")
    setHealthStatus("on-track")
    onOpenChange(false)
  }

  const handleCancel = () => {
    setContent("")
    setHealthStatus("on-track")
    onOpenChange(false)
  }

  const selectedHealth = healthOptions.find(opt => opt.value === healthStatus)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[600px] p-0">
        <DialogHeader className="px-6 pt-6 pb-0">
          <DialogTitle className="text-base font-semibold">Post project update</DialogTitle>
        </DialogHeader>

        <div className="px-6 py-4 space-y-4">
          {/* Health Status Dropdown */}
          <div>
            <Select value={healthStatus} onValueChange={(value) => setHealthStatus(value as ProjectHealth)}>
              <SelectTrigger className="w-full h-9 bg-background">
                <SelectValue>
                  <div className="flex items-center gap-2">
                    {selectedHealth && <selectedHealth.icon className={cn("h-4 w-4", selectedHealth.color)} />}
                    <span className={selectedHealth?.color}>{selectedHealth?.label}</span>
                  </div>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {healthOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-2">
                      <option.icon className={cn("h-4 w-4", option.color)} />
                      <span>{option.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Update Content */}
          <div>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write a project update..."
              className="min-h-[120px] resize-none text-sm"
            />
          </div>

          {/* Metadata Summary Bar */}
          <div className="border-l-2 border-border pl-4 py-2 space-y-2">
            <div className="flex flex-wrap items-center gap-4 text-xs">
              {/* Status */}
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Status</span>
                <Badge variant="outline" className="text-xs">
                  {project.status}
                </Badge>
                <ArrowRight className="h-3 w-3 text-muted-foreground" />
                <Badge variant="outline" className="text-xs">
                  {project.status}
                </Badge>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs">
              {/* Lead */}
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Lead</span>
                <span className="text-foreground">{project.owner}</span>
                <span className="text-muted-foreground">assigned</span>
              </div>
            </div>

            {/* Target Date */}
            {project.targetDate && (
              <div className="flex items-center gap-2 text-xs">
                <span className="text-muted-foreground">Target date</span>
                <span className="text-foreground">{project.targetDate}</span>
                <ArrowRight className="h-3 w-3 text-muted-foreground" />
                <span className="text-foreground">{project.targetDate}</span>
              </div>
            )}

            {/* Progress */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-muted-foreground">Progress since {project.createdDate}</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-border flex items-center justify-between">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Paperclip className="h-4 w-4 text-muted-foreground" />
          </Button>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleCancel}
            >
              Cancel
            </Button>
            <Button 
              size="sm"
              onClick={handleSave}
              disabled={!content.trim()}
            >
              Post update
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
