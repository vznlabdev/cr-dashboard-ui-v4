"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { ArrowRight, CheckCircle2, Clock, XCircle } from "lucide-react"

interface ApprovalStage {
  id: string
  name: string
  approverRole: string
  required: boolean
  autoEscalateHours?: number
}

interface ApprovalWorkflowConfigProps {
  onSave: (workflow: ApprovalWorkflow) => void
  onSkip?: () => void
}

export interface ApprovalWorkflow {
  stages: ApprovalStage[]
  parallelApproval: boolean
  autoApproveAfterDays?: number
}

const DEFAULT_STAGES: ApprovalStage[] = [
  {
    id: "draft",
    name: "Draft",
    approverRole: "Content Creator",
    required: true,
  },
  {
    id: "review",
    name: "Review",
    approverRole: "Legal Reviewer",
    required: true,
  },
  {
    id: "approved",
    name: "Approved",
    approverRole: "Company Admin",
    required: true,
  },
]

const AVAILABLE_ROLES = [
  "Content Creator",
  "Legal Reviewer",
  "Insurance Analyst",
  "Company Admin",
  "Creative Director",
  "Marketing Manager",
]

export function ApprovalWorkflowConfig({ onSave, onSkip }: ApprovalWorkflowConfigProps) {
  const [stages, setStages] = useState<ApprovalStage[]>(DEFAULT_STAGES)
  const [parallelApproval, setParallelApproval] = useState(false)
  const [enableAutoApprove, setEnableAutoApprove] = useState(false)
  const [autoApproveDays, setAutoApproveDays] = useState(7)

  const handleStageChange = (id: string, field: keyof ApprovalStage, value: any) => {
    setStages((prev) =>
      prev.map((stage) =>
        stage.id === id ? { ...stage, [field]: value } : stage
      )
    )
  }

  const handleSave = () => {
    const workflow: ApprovalWorkflow = {
      stages,
      parallelApproval,
      autoApproveAfterDays: enableAutoApprove ? autoApproveDays : undefined,
    }
    onSave(workflow)
  }

  return (
    <div className="space-y-6">
      {/* Workflow Visualization */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Approval Workflow</CardTitle>
          <CardDescription>
            Define the stages and approvers for your content approval process
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Visual Flow */}
          <div className="flex items-center justify-between mb-6 p-4 bg-muted/30 rounded-lg">
            {stages.map((stage, index) => (
              <div key={stage.id} className="flex items-center">
                <div className="text-center">
                  <div className="h-12 w-12 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center mb-2 mx-auto">
                    {stage.id === "draft" && <Clock className="h-5 w-5 text-primary" />}
                    {stage.id === "review" && <CheckCircle2 className="h-5 w-5 text-primary" />}
                    {stage.id === "approved" && <CheckCircle2 className="h-5 w-5 text-green-600" />}
                  </div>
                  <p className="text-xs font-medium">{stage.name}</p>
                  <p className="text-xs text-muted-foreground">{stage.approverRole}</p>
                </div>
                {index < stages.length - 1 && (
                  <ArrowRight className="h-5 w-5 text-muted-foreground mx-4" />
                )}
              </div>
            ))}
          </div>

          {/* Stage Configuration */}
          <div className="space-y-4">
            {stages.map((stage, index) => (
              <div key={stage.id} className="p-4 border rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">Stage {index + 1}:</span>
                    <Input
                      value={stage.name}
                      onChange={(e) => handleStageChange(stage.id, "name", e.target.value)}
                      className="h-8 w-32"
                    />
                    {stage.required && (
                      <Badge variant="secondary" className="text-xs">
                        Required
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs">Approver Role</Label>
                    <Select
                      value={stage.approverRole}
                      onValueChange={(value) => handleStageChange(stage.id, "approverRole", value)}
                    >
                      <SelectTrigger className="h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {AVAILABLE_ROLES.map((role) => (
                          <SelectItem key={role} value={role}>
                            {role}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs">Auto-escalate after (hours)</Label>
                    <Input
                      type="number"
                      value={stage.autoEscalateHours || ""}
                      onChange={(e) =>
                        handleStageChange(
                          stage.id,
                          "autoEscalateHours",
                          parseInt(e.target.value) || undefined
                        )
                      }
                      placeholder="Optional"
                      className="h-8"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Advanced Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Advanced Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Parallel Approval */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Parallel Approval</Label>
              <p className="text-xs text-muted-foreground">
                Allow multiple stages to be approved simultaneously
              </p>
            </div>
            <Switch checked={parallelApproval} onCheckedChange={setParallelApproval} />
          </div>

          {/* Auto-Approve */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Auto-Approve</Label>
                <p className="text-xs text-muted-foreground">
                  Automatically approve after a certain number of days
                </p>
              </div>
              <Switch checked={enableAutoApprove} onCheckedChange={setEnableAutoApprove} />
            </div>
            {enableAutoApprove && (
              <div className="pl-4">
                <Label className="text-xs">Days until auto-approval</Label>
                <Input
                  type="number"
                  value={autoApproveDays}
                  onChange={(e) => setAutoApproveDays(parseInt(e.target.value) || 7)}
                  min={1}
                  max={30}
                  className="h-8 w-32 mt-1"
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-between pt-4">
        {onSkip && (
          <Button type="button" variant="ghost" onClick={onSkip}>
            Use default workflow
          </Button>
        )}
        <Button onClick={handleSave} className="ml-auto">
          Save Workflow Configuration
        </Button>
      </div>
    </div>
  )
}
