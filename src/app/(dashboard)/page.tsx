"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Scale, 
  Shield, 
  FileCheck, 
  Plug, 
  ArrowUpRight,
  Plus,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
  User,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { ComplianceScoreGauge, RiskIndexBadge, NewProjectDialog } from "@/components/cr";
import { useState, useMemo } from "react";
import { useCreators } from "@/contexts/creators-context";
import {
  calculateTIV,
  calculateEAL,
  formatLargeCurrency,
  calculateRiskScore,
  getRiskGrade,
} from "@/lib/insurance-utils";
import type { RiskScores } from "@/types";
import { DollarSign, TrendingDown } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useChartTheme } from "@/components/cr/themed-chart-wrapper";
import { toast } from "sonner";
import { PageContainer } from "@/components/layout/PageContainer";

export default function DashboardPage() {
  const chartTheme = useChartTheme();
  const [newProjectDialogOpen, setNewProjectDialogOpen] = useState(false);
  const { creators, getExpiringCreators, generateCreatorRightsAlerts } = useCreators();
  
  // Calculate portfolio insurance metrics
  const portfolioRiskScores: RiskScores = useMemo(() => ({
    documentation: 88,
    toolSafety: 92,
    copyrightCheck: 96,
    aiModelTrust: 82,
    trainingDataQuality: 78,
  }), []);

  const portfolioRiskScore = useMemo(() => {
    return calculateRiskScore(portfolioRiskScores);
  }, [portfolioRiskScores]);

  const portfolioTIV = useMemo(() => {
    // Calculate from all projects (simplified for demo)
    const totalAssetValue = 2_450_000;
    const avgRiskMultiplier = 2.0;
    const avgDistributionMultiplier = 2.5; // National
    return calculateTIV(totalAssetValue, avgRiskMultiplier, avgDistributionMultiplier);
  }, []);

  const portfolioEAL = useMemo(() => {
    return calculateEAL(portfolioTIV, portfolioRiskScores.documentation);
  }, [portfolioTIV, portfolioRiskScores.documentation]);

  const criticalIssuesCount: number = 2; // From insurance dashboard issues
  
  // Creator stats
  const creatorCount = creators.length;
  const expiringCreators = getExpiringCreators();
  const expiringRightsCount = expiringCreators.length;
  
  // Generate creator rights alerts
  const creatorAlerts = useMemo(() => generateCreatorRightsAlerts(), [generateCreatorRightsAlerts]);
  
  // Combine static alerts with creator alerts
  const allAlerts = useMemo(() => {
    const staticAlerts = [
      {
        icon: AlertTriangle,
        title: "3 Legal Issues Pending",
        description: "Copyright conflicts require immediate attention",
        bgColor: "bg-destructive/10",
        iconColor: "text-destructive",
      },
      {
        icon: Clock,
        title: "8 Assets in Clearance Queue",
        description: "Awaiting legal approval for production use",
        bgColor: "bg-amber-500/10",
        iconColor: "text-amber-500",
      },
      {
        icon: Shield,
        title: "Risk Assessment Due",
        description: "Quarterly insurance report needs review",
        bgColor: "bg-blue-500/10",
        iconColor: "text-blue-500",
      },
      {
        icon: Plug,
        title: "2 AI Tools Not Connected",
        description: "Complete setup for full provenance tracking",
        bgColor: "bg-purple-500/10",
        iconColor: "text-purple-500",
      },
    ];
    
    // Add creator alerts (only show critical/urgent ones)
    const creatorAlertItems = creatorAlerts
      .filter(alert => alert.severity === "Critical" || alert.severity === "Urgent")
      .slice(0, 2) // Limit to 2 most important
      .map(alert => ({
        icon: alert.severity === "Critical" ? AlertTriangle : Clock,
        title: alert.title,
        description: alert.description,
        bgColor: alert.severity === "Critical" ? "bg-destructive/10" : "bg-amber-500/10",
        iconColor: alert.severity === "Critical" ? "text-destructive" : "text-amber-500",
        href: alert.creatorId ? `/creative/creators/${alert.creatorId}` : undefined,
      }));
    
    return [...creatorAlertItems, ...staticAlerts];
  }, [creatorAlerts]);
  
  return (
    <PageContainer className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Creation Rights Dashboard</h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            AI Content Provenance & Governance Overview
          </p>
        </div>
        <Button 
          className="w-full sm:w-auto"
          onClick={() => setNewProjectDialogOpen(true)}
        >
          <Plus className="mr-2 h-4 w-4" />
          New Project
        </Button>
      </div>

      {/* Key Metrics with Visual Gauges */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Link href="/legal" className="block">
          <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-transparent transition-all hover:shadow-colored hover:-translate-y-1 cursor-pointer relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-medium">
                Compliance Percentage
              </CardTitle>
              <Scale className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent className="flex flex-col items-center pt-4 pb-6 relative z-10">
              <ComplianceScoreGauge score={87} size="md" showTrend trend={5} />
            </CardContent>
          </Card>
        </Link>

        <Link href="/insurance" className="block">
          <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-transparent transition-all hover:shadow-colored hover:-translate-y-1 cursor-pointer relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-medium">
                Risk Index
              </CardTitle>
              <Shield className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent className="flex flex-col items-center pt-4 pb-6 relative z-10">
              <RiskIndexBadge grade="A" size="md" />
            </CardContent>
          </Card>
        </Link>

        <Card className="transition-all hover:shadow-modern-lg hover:-translate-y-0.5 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium">
              Provenance Score
            </CardTitle>
            <FileCheck className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-2xl font-bold gradient-text">94.2</div>
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              <TrendingUp className="mr-1 h-3 w-3 text-primary" />
              <span className="text-primary font-medium">+2.1</span>
              <span className="ml-1">from last month</span>
            </div>
          </CardContent>
        </Card>

        <Link href="/integrations" className="block">
          <Card className="transition-all hover:shadow-modern-lg hover:-translate-y-1 cursor-pointer relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-medium">
                AI Tools Connected
              </CardTitle>
              <Plug className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-2xl font-bold">4/6</div>
              <p className="text-xs text-muted-foreground mt-1">
                Active integrations
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/creative/creators" className="block">
          <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-transparent transition-all hover:shadow-colored hover:-translate-y-1 cursor-pointer relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-medium">
                Creators
              </CardTitle>
              <User className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-2xl font-bold">{creatorCount}</div>
              <div className="flex items-center text-xs text-muted-foreground mt-1">
                {expiringRightsCount > 0 ? (
                  <>
                    <AlertTriangle className="mr-1 h-3 w-3 text-amber-500" />
                    <span className="text-amber-500">{expiringRightsCount} expiring soon</span>
                  </>
                ) : (
                  <span>All rights active</span>
                )}
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Insurance Summary */}
      <Link href="/insurance" className="block">
        <Card className="border-primary/30 bg-gradient-to-br from-primary/8 via-primary/5 to-transparent transition-all hover:shadow-colored hover:-translate-y-1 cursor-pointer relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <CardHeader className="relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg sm:text-xl">Insurance & Risk Summary</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Portfolio-level insurance metrics and risk assessment
                </CardDescription>
              </div>
              <ArrowUpRight className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <DollarSign className="h-4 w-4" />
                  <span>Total Insured Value</span>
                </div>
                <p className="text-2xl font-bold">{formatLargeCurrency(portfolioTIV)}</p>
                <p className="text-xs text-muted-foreground">Portfolio TIV</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Shield className="h-4 w-4" />
                  <span>Expected Annual Loss</span>
                </div>
                <p className="text-2xl font-bold">{formatLargeCurrency(portfolioEAL)}</p>
                <div className="flex items-center text-xs text-muted-foreground">
                  <TrendingDown className="mr-1 h-3 w-3 text-green-500" />
                  <span className="text-green-500">Low risk exposure</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <AlertTriangle className="h-4 w-4" />
                  <span>Critical Issues</span>
                </div>
                <p className="text-2xl font-bold">{criticalIssuesCount}</p>
                <p className="text-xs text-muted-foreground">
                  {criticalIssuesCount === 0 ? "All clear" : "Require attention"}
                </p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Portfolio Risk Score</p>
                  <p className="text-xs text-muted-foreground">Weighted from 5 key metrics</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">{portfolioRiskScore}</p>
                  <Badge variant="default" className="mt-1">
                    {getRiskGrade(portfolioRiskScore)} Grade
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>

      {/* Activity Trends Chart */}
      <Card className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/3 to-transparent opacity-50" />
        <CardHeader className="relative z-10">
          <CardTitle className="text-lg sm:text-xl">Activity Trends</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Asset approvals and compliance reviews over the last 7 days
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto relative z-10">
          <ResponsiveContainer width="100%" height={300} minWidth={300}>
            <BarChart data={activityTrendData}>
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke={chartTheme.gridColor}
                opacity={0.3}
              />
              <XAxis 
                dataKey="day" 
                tick={{ 
                  fill: chartTheme.textColor,
                  fontSize: 12
                }}
                stroke={chartTheme.gridColor}
              />
              <YAxis 
                tick={{ 
                  fill: chartTheme.textColor,
                  fontSize: 12
                }}
                stroke={chartTheme.gridColor}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: chartTheme.tooltipBg,
                  border: `1px solid ${chartTheme.tooltipBorder}`,
                  borderRadius: '8px',
                  color: chartTheme.tooltipText,
                  backdropFilter: 'blur(12px) saturate(180%)',
                  WebkitBackdropFilter: 'blur(12px) saturate(180%)',
                  boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.12)',
                }}
                labelStyle={{ 
                  color: chartTheme.tooltipText
                }}
              />
              <Legend 
                wrapperStyle={{
                  color: chartTheme.textColor,
                  fontSize: '12px'
                }}
              />
              <Bar 
                dataKey="approved" 
                name="Approved Assets" 
                fill={chartTheme.chart1}
                radius={[4, 4, 0, 0]}
              />
              <Bar 
                dataKey="reviewed" 
                name="Legal Reviews" 
                fill={chartTheme.chart2}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Recent Activity & Quick Actions */}
      <div className="grid gap-6 lg:grid-cols-7">
        {/* Recent Activity */}
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest compliance, legal, and approval updates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div className={`rounded-full p-2 ${activity.bgColor}`}>
                    <activity.icon className={`h-4 w-4 ${activity.iconColor}`} />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {activity.title}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {activity.description}
                    </p>
                  </div>
                  <div className="text-xs text-muted-foreground whitespace-nowrap">
                    {activity.time}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common tasks and shortcuts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button 
              className="w-full justify-start" 
              variant="outline"
              onClick={() => setNewProjectDialogOpen(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Create New Project
            </Button>
            <Separator />
            <Link href="/legal">
              <Button className="w-full justify-start" variant="outline">
                <Scale className="mr-2 h-4 w-4" />
                Review Legal Issues
              </Button>
            </Link>
            <Separator />
            <Link href="/insurance">
              <Button className="w-full justify-start" variant="outline">
                <Shield className="mr-2 h-4 w-4" />
                View Risk Report
              </Button>
            </Link>
            <Separator />
            <Link href="/integrations">
              <Button className="w-full justify-start" variant="outline">
                <Plug className="mr-2 h-4 w-4" />
                Connect AI Tools
              </Button>
            </Link>
            <Separator className="my-4" />
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Resources</h4>
              <div className="space-y-1">
                <a 
                  href="https://c2pa.org/specifications/specifications/1.0/specs/C2PA_Specification.html" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ArrowUpRight className="mr-2 h-3 w-3" />
                  C2PA Standards Guide
                </a>
                <a 
                  href="https://c2pa.org/" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ArrowUpRight className="mr-2 h-3 w-3" />
                  AI Provenance Best Practices
                </a>
                <Button
                  variant="link"
                  className="h-auto p-0 text-sm text-muted-foreground hover:text-foreground"
                  onClick={() => toast.info("Checklist coming soon!")}
                >
                  <ArrowUpRight className="mr-2 h-3 w-3" />
                  Legal Compliance Checklist
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Projects & Alerts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Active Projects */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Active Projects</CardTitle>
                <CardDescription>
                  Projects requiring attention
                </CardDescription>
              </div>
              <Link href="/projects">
                <Button variant="ghost" size="sm">
                  View All
                  <ArrowUpRight className="ml-1 h-3 w-3" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activeProjects.map((project, index) => (
                <div key={index} className="flex items-start justify-between pb-3 border-b last:border-0">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{project.name}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">{project.assets} assets</span>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className={`text-xs font-medium ${getComplianceColor(project.compliance)}`}>
                        {project.compliance}% compliance
                      </span>
                    </div>
                  </div>
                  <Badge variant={getRiskVariant(project.risk)}>
                    {project.risk}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Alerts & Notifications */}
        <Card>
          <CardHeader>
            <CardTitle>Alerts & Notifications</CardTitle>
            <CardDescription>
              Items requiring immediate attention
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {allAlerts.map((alert, index) => (
                <div key={index} className="flex items-start gap-3 pb-3 border-b last:border-0">
                  <div className={`rounded-full p-2 ${alert.bgColor}`}>
                    <alert.icon className={`h-4 w-4 ${alert.iconColor}`} />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">{alert.title}</p>
                    <p className="text-xs text-muted-foreground">{alert.description}</p>
                  </div>
                  {"href" in alert && alert.href ? (
                    <Link href={alert.href}>
                      <Button variant="ghost" size="sm">
                        Review
                      </Button>
                    </Link>
                  ) : (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => {
                        toast.info(`Reviewing: ${alert.title}`);
                      }}
                    >
                      Review
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* New Project Dialog */}
      <NewProjectDialog
        open={newProjectDialogOpen}
        onOpenChange={setNewProjectDialogOpen}
      />
    </PageContainer>
  );
}

function getComplianceColor(score: number) {
  if (score >= 90) return "text-green-500";
  if (score >= 70) return "text-amber-500";
  return "text-destructive";
}

function getRiskVariant(risk: string) {
  switch (risk) {
    case "Low":
      return "default";
    case "Medium":
      return "secondary";
    case "High":
      return "destructive";
    default:
      return "secondary";
  }
}

const recentActivity = [
  {
    icon: CheckCircle2,
    title: "Asset Approved",
    description: "hero-image-final.jpg cleared for production use",
    time: "2 min ago",
    bgColor: "bg-green-500/10",
    iconColor: "text-green-500",
  },
  {
    icon: Scale,
    title: "Legal Review Completed",
    description: "Summer Campaign 2024 - Compliance percentage: 92%",
    time: "15 min ago",
    bgColor: "bg-blue-500/10",
    iconColor: "text-blue-500",
  },
  {
    icon: AlertTriangle,
    title: "Copyright Conflict Detected",
    description: "voice-over-clip.mp3 requires manual review",
    time: "1 hour ago",
    bgColor: "bg-amber-500/10",
    iconColor: "text-amber-500",
  },
  {
    icon: Plug,
    title: "AI Tool Connected",
    description: "Midjourney integration successfully connected",
    time: "3 hours ago",
    bgColor: "bg-purple-500/10",
    iconColor: "text-purple-500",
  },
  {
    icon: FileCheck,
    title: "Provenance Record Updated",
    description: "C2PA metadata added to 12 new assets",
    time: "5 hours ago",
    bgColor: "bg-green-500/10",
    iconColor: "text-green-500",
  },
];

const activeProjects = [
  {
    name: "Summer Campaign 2024",
    assets: 45,
    compliance: 92,
    risk: "Low",
  },
  {
    name: "Product Launch Video",
    assets: 23,
    compliance: 78,
    risk: "Medium",
  },
  {
    name: "Podcast Series AI Voices",
    assets: 34,
    compliance: 85,
    risk: "Medium",
  },
  {
    name: "Brand Refresh Assets",
    assets: 12,
    compliance: 45,
    risk: "High",
  },
];


// Mock data for activity trends chart
const activityTrendData = [
  { day: "Mon", approved: 12, reviewed: 18 },
  { day: "Tue", approved: 15, reviewed: 22 },
  { day: "Wed", approved: 18, reviewed: 19 },
  { day: "Thu", approved: 14, reviewed: 25 },
  { day: "Fri", approved: 20, reviewed: 28 },
  { day: "Sat", approved: 8, reviewed: 12 },
  { day: "Sun", approved: 5, reviewed: 8 },
];

