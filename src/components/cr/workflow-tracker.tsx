/**
 * 7-Step Workflow Tracker Component
 * 
 * Displays the compliance workflow progress for an asset or portfolio.
 * Based on cr_dashboard_feature_additions_dev_instructions.md
 */

"use client";

import { CheckCircle2, Circle, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { WorkflowStep, RiskLevel } from "@/types";
import { getRiskLevelFromWorkflow } from "@/lib/insurance-utils";
import { cn } from "@/lib/utils";

interface WorkflowTrackerProps {
  steps: WorkflowStep[];
  showRiskLevel?: boolean;
  className?: string;
}

const WORKFLOW_STEP_NAMES = [
  "Task Assignment",
  "Approved Tool Used",
  "Model Documented",
  "Training Data Verified",
  "Prompt Saved",
  "Output Documented",
  "Copyright Check Passed",
];

export function WorkflowTracker({
  steps,
  showRiskLevel = true,
  className,
}: WorkflowTrackerProps) {
  const completedSteps = steps.filter((step) => step.status === "completed").length;
  const totalSteps = steps.length;
  const completionRate = Math.round((completedSteps / totalSteps) * 100);
  const riskLevel = getRiskLevelFromWorkflow(completedSteps, totalSteps);

  const getRiskBadgeVariant = (level: RiskLevel) => {
    switch (level) {
      case "Low":
        return "default";
      case "Medium":
        return "secondary";
      case "High":
        return "destructive";
    }
  };

  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Compliance Workflow</CardTitle>
            <CardDescription>
              {completedSteps} of {totalSteps} steps completed
            </CardDescription>
          </div>
          {showRiskLevel && (
            <Badge variant={getRiskBadgeVariant(riskLevel)}>
              {riskLevel} Risk
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Completion Rate</span>
            <span className="font-semibold">{completionRate}%</span>
          </div>
          <Progress value={completionRate} className="h-2" />
        </div>

        <div className="space-y-3">
          {steps.map((step, index) => {
            const stepName = WORKFLOW_STEP_NAMES[index] || step.name;
            const isCompleted = step.status === "completed";
            const isPending = step.status === "pending";

            return (
              <div
                key={step.id}
                className="flex items-start gap-3 p-2 rounded-md border bg-card"
              >
                <div className="mt-0.5">
                  {isCompleted ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : isPending ? (
                    <AlertCircle className="h-5 w-5 text-amber-500" />
                  ) : (
                    <Circle className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{stepName}</p>
                    {isCompleted && step.completedAt && (
                      <span className="text-xs text-muted-foreground">
                        {new Date(step.completedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  {step.evidence && step.evidence.length > 0 && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {step.evidence.length} evidence file{step.evidence.length !== 1 ? "s" : ""}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

