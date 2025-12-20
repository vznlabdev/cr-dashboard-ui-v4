"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Shield,
  TrendingUp,
  DollarSign,
  FileCheck,
  Download,
  AlertTriangle,
  Info,
  Users,
} from "lucide-react";
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
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
import { downloadJSON, prepareRiskDataForExport } from "@/lib/export-utils";
import { PageContainer } from "@/components/layout/PageContainer";
import { WorkflowTracker, RiskScoresPanel, IssuesAlertsPanel } from "@/components/cr";
import { useCreators } from "@/contexts/creators-context";
import {
  calculateRiskScore,
  getRiskGrade,
  calculateTIV,
  calculateEAL,
  calculateLiability,
  formatLargeCurrency,
  calculateAIUsagePercentage,
  isAIUsageExcessive,
} from "@/lib/insurance-utils";
import type {
  RiskScores,
  WorkflowStep,
  InsuranceIssue,
  PortfolioMix,
  ClientConcentration,
  RiskGrade,
} from "@/types";
import { useMemo } from "react";
import { useRouter } from "next/navigation";

export default function InsurancePage() {
  const chartTheme = useChartTheme();
  const router = useRouter();
  const { generateCreatorRightsAlerts } = useCreators();
  
  // Calculate risk metrics from mock data
  const riskScores: RiskScores = {
    documentation: 88, // (6/7) * 100 = 85.7, rounded to 88
    toolSafety: 92,
    copyrightCheck: 96,
    aiModelTrust: 82,
    trainingDataQuality: 78,
  };

  const riskScore = calculateRiskScore(riskScores);
  const riskGrade: RiskGrade = getRiskGrade(riskScore);
  
  // Financial calculations
  const totalAssetValue = 2_450_000; // Base value
  const avgRiskMultiplier = 2.0; // Average from portfolio mix
  const avgDistributionMultiplier = 2.5; // National distribution
  const tiv = calculateTIV(totalAssetValue, avgRiskMultiplier, avgDistributionMultiplier);
  const eal = calculateEAL(tiv, riskScores.documentation);
  const liability = calculateLiability(eal);

  // Portfolio mix data
  const portfolioMix: PortfolioMix[] = [
    { type: "Pure Human", count: 245, percentage: 20, riskMultiplier: 1.0, totalValue: 245_000 },
    { type: "AI-Assisted", count: 490, percentage: 40, riskMultiplier: 1.5, totalValue: 735_000 },
    { type: "Hybrid", count: 245, percentage: 20, riskMultiplier: 2.0, totalValue: 490_000 },
    { type: "AI-Generated", count: 245, percentage: 20, riskMultiplier: 3.0, totalValue: 735_000 },
  ];

  const aiUsagePercentage = calculateAIUsagePercentage(portfolioMix);
  const aiUsageExcessive = isAIUsageExcessive(aiUsagePercentage, 60);

  // Client concentration data
  const clientConcentration: ClientConcentration[] = [
    { clientId: "1", clientName: "Acme Corp", insuredValue: 980_000, percentageOfPortfolio: 40, riskFlagged: true, assetCount: 392 },
    { clientId: "2", clientName: "TechStart Inc", insuredValue: 490_000, percentageOfPortfolio: 20, riskFlagged: false, assetCount: 196 },
    { clientId: "3", clientName: "Global Media", insuredValue: 367_500, percentageOfPortfolio: 15, riskFlagged: false, assetCount: 147 },
    { clientId: "4", clientName: "Digital Solutions", insuredValue: 245_000, percentageOfPortfolio: 10, riskFlagged: false, assetCount: 98 },
    { clientId: "5", clientName: "Creative Agency", insuredValue: 367_500, percentageOfPortfolio: 15, riskFlagged: false, assetCount: 147 },
  ];

  // Workflow steps for portfolio
  const portfolioWorkflowSteps: WorkflowStep[] = [
    { id: 1, name: "Task Assignment", status: "completed", completedAt: new Date("2024-11-01") },
    { id: 2, name: "Approved Tool Used", status: "completed", completedAt: new Date("2024-11-02") },
    { id: 3, name: "Model Documented", status: "completed", completedAt: new Date("2024-11-03") },
    { id: 4, name: "Training Data Verified", status: "completed", completedAt: new Date("2024-11-04") },
    { id: 5, name: "Prompt Saved", status: "completed", completedAt: new Date("2024-11-05") },
    { id: 6, name: "Output Documented", status: "completed", completedAt: new Date("2024-11-06") },
    { id: 7, name: "Copyright Check Passed", status: "pending" },
  ];

  // Base issues & alerts
  const baseIssues: InsuranceIssue[] = [
    {
      id: "1",
      title: "Failed Copyright Scan",
      description: "Asset #1234 failed similarity scan with 45% match",
      severity: "Critical",
      category: "copyright",
      assetId: "1234",
      createdAt: new Date("2024-11-25"),
      resolved: false,
    },
    {
      id: "2",
      title: "Unapproved AI Tool Detected",
      description: "Midjourney v6 used without approval",
      severity: "Critical",
      category: "tool",
      assetId: "5678",
      createdAt: new Date("2024-11-24"),
      resolved: false,
    },
    {
      id: "3",
      title: "Missing Copyright Check",
      description: "12 assets missing copyright verification",
      severity: "Urgent",
      category: "copyright",
      dueDate: new Date("2024-12-25"),
      createdAt: new Date("2024-11-20"),
      resolved: false,
    },
    {
      id: "4",
      title: "License Expiring",
      description: "Adobe Stock license expires in 25 days",
      severity: "Urgent",
      category: "license",
      dueDate: new Date("2024-12-20"),
      createdAt: new Date("2024-11-15"),
      resolved: false,
    },
    {
      id: "5",
      title: "Incomplete Workflows",
      description: "8 assets with incomplete 7-step workflow",
      severity: "Important",
      category: "workflow",
      createdAt: new Date("2024-11-10"),
      resolved: false,
    },
  ];

  // Get creator rights alerts
  const creatorAlerts = useMemo(() => generateCreatorRightsAlerts(), [generateCreatorRightsAlerts]);

  // Combine all issues
  const issues = useMemo(() => [...baseIssues, ...creatorAlerts], [baseIssues, creatorAlerts]);

  const handleExportRiskReport = () => {
    const riskData = prepareRiskDataForExport({
      riskIndex: riskGrade,
      provenanceScore: riskScore,
      totalAssets: 1225,
      compliancePercentage: riskScores.documentation,
    });
    downloadJSON(riskData, `risk-report-${new Date().toISOString().split('T')[0]}`);
    toast.success("Risk report exported successfully");
  };

  const handleIssueClick = (issue: InsuranceIssue) => {
    // Navigate to creator detail page if it's a creator-rights issue
    if (issue.category === "creator-rights" && issue.creatorId) {
      router.push(`/creative/creators/${issue.creatorId}`);
      return;
    }
    
    if (issue.assetId) {
      toast.info(`Navigating to asset ${issue.assetId}`);
      // Navigate to asset detail page
    }
  };

  const getRiskGradeColor = (grade: RiskGrade) => {
    switch (grade) {
      case "A":
        return "text-green-500 border-green-500";
      case "B":
        return "text-blue-500 border-blue-500";
      case "C":
        return "text-yellow-500 border-yellow-500";
      case "D":
        return "text-orange-500 border-orange-500";
      case "E":
        return "text-red-500 border-red-500";
      case "F":
        return "text-red-700 border-red-700";
      default:
        return "text-muted-foreground border-muted";
    }
  };

  const getRiskGradeBgColor = (grade: RiskGrade) => {
    switch (grade) {
      case "A":
        return "bg-green-500/10 border-green-500/20";
      case "B":
        return "bg-blue-500/10 border-blue-500/20";
      case "C":
        return "bg-yellow-500/10 border-yellow-500/20";
      case "D":
        return "bg-orange-500/10 border-orange-500/20";
      case "E":
        return "bg-red-500/10 border-red-500/20";
      case "F":
        return "bg-red-700/10 border-red-700/20";
      default:
        return "bg-muted border-muted";
    }
  };
  
  return (
    <PageContainer className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Insurance Risk Dashboard</h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            AI content risk assessment and underwriting intelligence
          </p>
        </div>
        <Button 
          className="w-full sm:w-auto sm:shrink-0"
          onClick={handleExportRiskReport}
        >
          <Download className="mr-2 h-4 w-4" />
          <span className="hidden sm:inline">Export Risk Report</span>
          <span className="sm:hidden">Export</span>
        </Button>
      </div>

      {/* Portfolio Snapshot - Risk Grade, Risk Score, TIV */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className={`border-2 ${getRiskGradeBgColor(riskGrade)}`}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Risk Grade</CardTitle>
                <CardDescription>Portfolio assessment</CardDescription>
              </div>
              <div className={`text-4xl font-bold ${getRiskGradeColor(riskGrade)}`}>
                {riskGrade}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className="text-green-500 font-medium">Improved from B</span>
              <span className="text-muted-foreground">last quarter</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Risk Score</CardTitle>
                <CardDescription>Weighted from 5 metrics</CardDescription>
              </div>
              <div className="text-4xl font-bold">{riskScore}</div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm">
              <Info className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">0-100 scale</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Total Insured Value</CardTitle>
                <CardDescription>TIV calculation</CardDescription>
              </div>
              <div className="text-2xl font-bold">{formatLargeCurrency(tiv)}</div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-1 text-xs text-muted-foreground">
              <p>Asset Value × Risk × Distribution</p>
              <p className="font-mono">
                ${(totalAssetValue / 1000).toFixed(0)}K × {avgRiskMultiplier}× × {avgDistributionMultiplier}×
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Financial Metrics Grid */}
      <div className="grid gap-3 sm:gap-4 grid-cols-2 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Expected Annual Loss
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatLargeCurrency(eal)}</div>
            <p className="text-xs text-muted-foreground">
              TIV × Probability × (1 - Doc Score)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Liability Estimate
            </CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatLargeCurrency(liability)}</div>
            <p className="text-xs text-muted-foreground">
              EAL × 1.5 safety buffer
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              High-Risk Assets
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">7</div>
            <p className="text-xs text-muted-foreground">
              Require attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Claims Evidence
            </CardTitle>
            <FileCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">847</div>
            <p className="text-xs text-muted-foreground">
              Records available
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Risk Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Risk Trend Analysis</CardTitle>
          <CardDescription>
            Portfolio risk over the last 6 months
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-hidden">
          <div className="w-full overflow-x-auto">
          <ResponsiveContainer width="100%" height={300} minWidth={280}>
            <AreaChart data={riskTrendData}>
              <defs>
                <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={chartTheme.chart1} stopOpacity={0.4}/>
                  <stop offset="95%" stopColor={chartTheme.chart1} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke={chartTheme.gridColor}
                opacity={0.3}
              />
              <XAxis 
                dataKey="month" 
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
                domain={[0, 100]}
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
              <Area
                type="monotone"
                dataKey="score"
                name="Risk Score"
                stroke={chartTheme.chart1}
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorRisk)"
              />
            </AreaChart>
          </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Five Key Risk Scores */}
      <RiskScoresPanel scores={riskScores} />

      {/* Portfolio Mix & Workflow */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Portfolio Mix with Risk Multipliers */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Portfolio Mix & Risk Multipliers</CardTitle>
                <CardDescription>
                  Content type distribution with risk multipliers
                </CardDescription>
              </div>
              {aiUsageExcessive && (
                <Badge variant="destructive">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  AI Usage {aiUsagePercentage}%
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="overflow-hidden">
            <div className="w-full overflow-x-auto">
              <ResponsiveContainer width="100%" height={300} minWidth={280}>
                <BarChart data={portfolioMix}>
                  <CartesianGrid 
                    strokeDasharray="3 3" 
                    stroke={chartTheme.gridColor}
                    opacity={0.3}
                  />
                  <XAxis 
                    dataKey="type" 
                    tick={{ 
                      fill: chartTheme.textColor,
                      fontSize: 11
                    }}
                    stroke={chartTheme.gridColor}
                    angle={-45}
                    textAnchor="end"
                    height={80}
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
                  <Bar dataKey="count" fill={chartTheme.chart1} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 mt-4">
              {portfolioMix.map((item) => (
                <div key={item.type} className="flex items-center justify-between p-2 rounded-md border bg-card">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{item.type}</span>
                    <Badge variant="outline" className="text-xs">
                      {item.riskMultiplier}×
                    </Badge>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold">{item.count} assets</div>
                    <div className="text-xs text-muted-foreground">{item.percentage}%</div>
                  </div>
                </div>
              ))}
              <div className="pt-2 border-t">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">AI Usage</span>
                  <span className={aiUsageExcessive ? "font-bold text-destructive" : "font-bold"}>
                    {aiUsagePercentage}%
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 7-Step Workflow Tracker */}
        <WorkflowTracker steps={portfolioWorkflowSteps} />
      </div>

      {/* Issues & Alerts & Client Concentration */}
      <div className="grid gap-4 md:grid-cols-2">
        <IssuesAlertsPanel issues={issues} onIssueClick={handleIssueClick} />

        {/* Client Concentration Risk */}
        <Card>
          <CardHeader>
            <CardTitle>Client Concentration Risk</CardTitle>
            <CardDescription>
              Top 5 clients by insured value
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {clientConcentration.map((client) => (
                <div
                  key={client.clientId}
                  className={`p-3 rounded-md border ${
                    client.riskFlagged
                      ? "border-red-500/20 bg-red-500/5"
                      : "bg-card"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{client.clientName}</span>
                      {client.riskFlagged && (
                        <Badge variant="destructive" className="text-xs">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Risk
                        </Badge>
                      )}
                    </div>
                    <span className="text-sm font-bold">
                      {formatLargeCurrency(client.insuredValue)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{client.percentageOfPortfolio}% of portfolio</span>
                    <span>{client.assetCount} assets</span>
                  </div>
                  {client.riskFlagged && (
                    <div className="mt-2 text-xs text-red-500">
                      ⚠️ Exceeds 30% threshold - concentration risk
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Risk Breakdown - Original Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="min-w-0">
          <CardHeader>
            <CardTitle>Risk by Content Type</CardTitle>
            <CardDescription>
              Distribution of risk across content categories
            </CardDescription>
          </CardHeader>
          <CardContent className="overflow-hidden">
            <div className="w-full overflow-x-auto">
            <ResponsiveContainer width="100%" height={300} minWidth={280}>
              <PieChart>
                <Pie
                  data={contentTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(props) => {
                    const { name, percent, cx, cy, midAngle, innerRadius, outerRadius } = props
                    const RADIAN = Math.PI / 180
                    const radius = (innerRadius || 0) + ((outerRadius || 0) - (innerRadius || 0)) * 0.5
                    const x = (cx || 0) + (radius || 0) * Math.cos(-(midAngle || 0) * RADIAN)
                    const y = (cy || 0) + (radius || 0) * Math.sin(-(midAngle || 0) * RADIAN)
                    
                    return (
                      <text 
                        x={x} 
                        y={y} 
                        fill={chartTheme.textColor}
                        textAnchor={x > (cx || 0) ? 'start' : 'end'} 
                        dominantBaseline="central"
                        fontSize={12}
                        fontWeight={500}
                      >
                        {`${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                      </text>
                    )
                  }}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {contentTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
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
              </PieChart>
            </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {contentTypeData.map((item, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <div 
                    className="h-3 w-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-muted-foreground">{item.name}</span>
                  <Badge variant="secondary" className="ml-auto">{item.risk}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="min-w-0">
          <CardHeader>
            <CardTitle>Underwriting Intelligence</CardTitle>
            <CardDescription>
              Key metrics for insurance underwriting
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b">
                <span className="text-sm font-medium">Total Assets Insured</span>
                <span className="text-sm font-bold">1,225</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b">
                <span className="text-sm font-medium">Avg. Compliance Percentage</span>
                <span className="text-sm font-bold">{riskScores.documentation}%</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b">
                <span className="text-sm font-medium">Full Provenance Records</span>
                <span className="text-sm font-bold">1,175</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b">
                <span className="text-sm font-medium">Active AI Tools</span>
                <span className="text-sm font-bold">6</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b">
                <span className="text-sm font-medium">Policy Violations</span>
                <span className="text-sm font-bold text-destructive">3</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Last Audit Date</span>
                <span className="text-sm font-bold">Nov 28, 2024</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Export Options */}
      <Card>
        <CardHeader>
          <CardTitle>Risk Package Export</CardTitle>
          <CardDescription>
            Generate comprehensive risk reports for underwriters
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button variant="outline" className="w-full sm:w-auto">
              <Download className="mr-2 h-4 w-4" />
              PDF Report
            </Button>
            <Button variant="outline" className="w-full sm:w-auto">
              <Download className="mr-2 h-4 w-4" />
              JSON Data
            </Button>
            <Button variant="outline" className="w-full sm:w-auto">
              <Download className="mr-2 h-4 w-4" />
              Claims Evidence Package
            </Button>
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  );
}

// Mock data for risk trend chart
const riskTrendData = [
  { month: "Jun", score: 78 },
  { month: "Jul", score: 82 },
  { month: "Aug", score: 85 },
  { month: "Sep", score: 88 },
  { month: "Oct", score: 91 },
  { month: "Nov", score: 94 },
];

// Mock data for content type breakdown
const contentTypeData = [
  { name: "Video", value: 347, risk: "Low", color: "#3ECF8E" }, // Green
  { name: "Images", value: 423, risk: "Low", color: "#60a5fa" }, // Blue
  { name: "Audio", value: 189, risk: "Medium", color: "#fbbf24" }, // Amber
  { name: "Text", value: 288, risk: "Low", color: "#a78bfa" }, // Purple
];

