/**
 * Five Key Risk Scores Panel
 * 
 * Displays the 5 critical risk scores with targets and status indicators.
 * Based on cr_dashboard_feature_additions_dev_instructions.md
 */

"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import type { RiskScores } from "@/types";
import { cn } from "@/lib/utils";

interface RiskScoresPanelProps {
  scores: RiskScores;
  className?: string;
}

interface RiskScoreConfig {
  key: keyof RiskScores;
  label: string;
  description: string;
  target: number;
  weight: string;
}

const RISK_SCORE_CONFIGS: RiskScoreConfig[] = [
  {
    key: "documentation",
    label: "Documentation Score",
    description: "Workflow completion rate",
    target: 85,
    weight: "15%",
  },
  {
    key: "toolSafety",
    label: "Tool Safety Score",
    description: "% using approved tools",
    target: 90,
    weight: "20%",
  },
  {
    key: "copyrightCheck",
    label: "Copyright Check Score",
    description: "Similarity scan pass rate",
    target: 95,
    weight: "25%",
  },
  {
    key: "aiModelTrust",
    label: "AI Model Trust Score",
    description: "Weighted model trust ratings",
    target: 80,
    weight: "15%",
  },
  {
    key: "trainingDataQuality",
    label: "Training Data Quality",
    description: "Licensed vs scraped data",
    target: 75,
    weight: "25% (Highest)",
  },
];

export function RiskScoresPanel({ scores, className }: RiskScoresPanelProps) {
  const getScoreStatus = (score: number, target: number) => {
    if (score >= target) return "pass";
    if (score >= target * 0.8) return "warning";
    return "fail";
  };

  const getStatusIcon = (status: "pass" | "warning" | "fail") => {
    switch (status) {
      case "pass":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case "fail":
        return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusColor = (status: "pass" | "warning" | "fail") => {
    switch (status) {
      case "pass":
        return "text-green-500";
      case "warning":
        return "text-amber-500";
      case "fail":
        return "text-red-500";
    }
  };

  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <CardTitle>Five Key Risk Scores</CardTitle>
        <CardDescription>
          Critical metrics for insurance underwriting assessment
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {RISK_SCORE_CONFIGS.map((config) => {
          const score = scores[config.key];
          const status = getScoreStatus(score, config.target);
          const gap = score - config.target;

          return (
            <div key={config.key} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getStatusIcon(status)}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{config.label}</span>
                      <Badge variant="outline" className="text-xs">
                        {config.weight}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {config.description}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className={cn("text-lg font-bold", getStatusColor(status))}>
                    {score}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Target: {config.target}
                  </div>
                </div>
              </div>
              <Progress value={score} max={100} className="h-2" />
              {gap < 0 && (
                <p className="text-xs text-muted-foreground">
                  {Math.abs(gap)} points below target
                </p>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

