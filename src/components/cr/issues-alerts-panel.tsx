/**
 * Issues & Alerts Panel
 * 
 * Displays critical, urgent, and important issues with severity-based categorization.
 * Based on cr_dashboard_feature_additions_dev_instructions.md
 */

"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Clock, Info, ExternalLink, CheckCircle2 } from "lucide-react";
import type { InsuranceIssue } from "@/types";
import { cn } from "@/lib/utils";

interface IssuesAlertsPanelProps {
  issues: InsuranceIssue[];
  onIssueClick?: (issue: InsuranceIssue) => void;
  className?: string;
}

const SEVERITY_CONFIG = {
  Critical: {
    icon: AlertTriangle,
    color: "text-red-500",
    bgColor: "bg-red-500/10",
    borderColor: "border-red-500/20",
    badgeVariant: "destructive" as const,
    timeframe: "Fix Immediately",
  },
  Urgent: {
    icon: Clock,
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/20",
    badgeVariant: "secondary" as const,
    timeframe: "30 Days",
  },
  Important: {
    icon: Info,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/20",
    badgeVariant: "outline" as const,
    timeframe: "90 Days",
  },
};

export function IssuesAlertsPanel({
  issues,
  onIssueClick,
  className,
}: IssuesAlertsPanelProps) {
  const groupedIssues = {
    Critical: issues.filter((issue) => issue.severity === "Critical"),
    Urgent: issues.filter((issue) => issue.severity === "Urgent"),
    Important: issues.filter((issue) => issue.severity === "Important"),
  };

  const totalIssues = issues.length;
  const unresolvedIssues = issues.filter((issue) => !issue.resolved).length;

  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Issues & Alerts</CardTitle>
            <CardDescription>
              {unresolvedIssues} of {totalIssues} issues require attention
            </CardDescription>
          </div>
          {unresolvedIssues > 0 && (
            <Badge variant="destructive">{unresolvedIssues}</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {Object.entries(groupedIssues).map(([severity, severityIssues]) => {
          if (severityIssues.length === 0) return null;

          const config = SEVERITY_CONFIG[severity as keyof typeof SEVERITY_CONFIG];
          const Icon = config.icon;
          const unresolved = severityIssues.filter((issue) => !issue.resolved);

          return (
            <div
              key={severity}
              className={cn(
                "rounded-lg border p-3 space-y-2",
                config.bgColor,
                config.borderColor
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon className={cn("h-4 w-4", config.color)} />
                  <span className="text-sm font-semibold">{severity}</span>
                  <Badge variant={config.badgeVariant} className="text-xs">
                    {unresolved.length}
                  </Badge>
                </div>
                <span className="text-xs text-muted-foreground">
                  {config.timeframe}
                </span>
              </div>

              <div className="space-y-2">
                {severityIssues.slice(0, 3).map((issue) => (
                  <div
                    key={issue.id}
                    className={cn(
                      "flex items-start justify-between p-2 rounded-md bg-background/50",
                      issue.resolved && "opacity-60"
                    )}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">{issue.title}</p>
                        {issue.resolved && (
                          <Badge variant="outline" className="text-xs">
                            Resolved
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {issue.description}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {issue.category}
                        </Badge>
                        {issue.dueDate && (
                          <span className="text-xs text-muted-foreground">
                            Due: {new Date(issue.dueDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                    {onIssueClick && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="ml-2 shrink-0"
                        onClick={() => onIssueClick(issue)}
                      >
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                ))}
                {severityIssues.length > 3 && (
                  <p className="text-xs text-muted-foreground text-center pt-1">
                    +{severityIssues.length - 3} more {severity.toLowerCase()} issues
                  </p>
                )}
              </div>
            </div>
          );
        })}

        {totalIssues === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <CheckCircle2 className="h-12 w-12 mx-auto mb-2 text-green-500" />
            <p className="text-sm font-medium">No issues found</p>
            <p className="text-xs">All systems are operating normally</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

