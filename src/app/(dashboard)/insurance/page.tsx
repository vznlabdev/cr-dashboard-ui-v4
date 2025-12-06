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
} from "lucide-react";
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
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

export default function InsurancePage() {
  const chartTheme = useChartTheme();
  
  const handleExportRiskReport = () => {
    const riskData = prepareRiskDataForExport({
      riskIndex: "A",
      provenanceScore: 94.2,
      totalAssets: 2847,
      compliancePercentage: 87,
    });
    downloadJSON(riskData, `risk-report-${new Date().toISOString().split('T')[0]}`);
    toast.success("Risk report exported successfully");
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

      {/* Risk Index Card */}
      <Card className="border-green-500/20 bg-green-500/5">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Portfolio Risk Index</CardTitle>
              <CardDescription className="mt-1">
                Overall risk assessment grade
              </CardDescription>
            </div>
            <div className="text-center">
              <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-green-500 bg-green-500/10">
                <span className="text-4xl font-bold text-green-500">A</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">Low Risk</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-sm">
            <TrendingUp className="h-4 w-4 text-green-500" />
            <span className="text-green-500 font-medium">Improved from B+</span>
            <span className="text-muted-foreground">last quarter</span>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid gap-3 sm:gap-4 grid-cols-2 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Provenance Score
            </CardTitle>
            <FileCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94.2</div>
            <p className="text-xs text-muted-foreground">
              +2.1 from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Liability Estimate
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$12.4K</div>
            <p className="text-xs text-muted-foreground">
              Potential exposure
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
            <Shield className="h-4 w-4 text-muted-foreground" />
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
                  <stop offset="5%" stopColor="#3ECF8E" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3ECF8E" stopOpacity={0}/>
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
                  borderRadius: '6px',
                  color: chartTheme.tooltipText,
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
                stroke="#3ECF8E"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorRisk)"
              />
            </AreaChart>
          </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Risk Breakdown */}
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
                    borderRadius: '6px',
                    color: chartTheme.tooltipText,
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
                <span className="text-sm font-bold">1,247</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b">
                <span className="text-sm font-medium">Avg. Compliance Percentage</span>
                <span className="text-sm font-bold">87%</span>
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
                <span className="text-sm font-bold">Nov 28, 2025</span>
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

