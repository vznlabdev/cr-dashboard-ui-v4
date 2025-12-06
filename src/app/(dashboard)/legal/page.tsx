"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Scale,
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileText,
  Download,
  XCircle,
} from "lucide-react";
import { ComplianceScoreGauge } from "@/components/cr";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ActionDialog, type ActionType } from "@/components/cr/action-dialog";
import { useState } from "react";
import { toast } from "sonner";
import { useChartTheme } from "@/components/cr/themed-chart-wrapper";
import { EmptyState, TableSkeleton } from "@/components/cr";
import { downloadCSV, prepareLegalIssuesForExport } from "@/lib/export-utils";
import { PageContainer } from "@/components/layout/PageContainer";

export default function LegalPage() {
  const chartTheme = useChartTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [actionDialog, setActionDialog] = useState<{
    open: boolean;
    type: ActionType;
    itemName: string;
  }>({
    open: false,
    type: "approve",
    itemName: "",
  });

  const handleExportLegalPackage = () => {
    const exportData = prepareLegalIssuesForExport(mockIssues);
    downloadCSV(exportData, `legal-issues-${new Date().toISOString().split('T')[0]}`);
    toast.success(`Exported ${mockIssues.length} legal issues to CSV`);
  };

  const handleAction = (type: ActionType, itemName: string) => {
    setActionDialog({
      open: true,
      type,
      itemName,
    });
  };

  const handleConfirmAction = () => {
    const actions = {
      approve: "approved",
      reject: "rejected",
      flag: "flagged for review",
    };
    
    toast.success(`Asset ${actions[actionDialog.type]}`, {
      description: actionDialog.itemName,
    });
  };
  return (
    <PageContainer className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Legal Review Dashboard</h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            Compliance monitoring and IP conflict detection
          </p>
        </div>
        <Button 
          className="w-full sm:w-auto"
          onClick={handleExportLegalPackage}
        >
          <Download className="mr-2 h-4 w-4" />
          <span className="hidden sm:inline">Export Legal Package</span>
          <span className="sm:hidden">Export</span>
        </Button>
      </div>

      {/* Compliance Percentage Card */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-primary/20 bg-primary/5 min-w-0">
          <CardHeader>
            <CardTitle className="text-2xl">Compliance Percentage</CardTitle>
            <CardDescription className="mt-1">
              Overall legal compliance rating
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center pt-4 pb-6">
            <ComplianceScoreGauge score={87} size="lg" showTrend trend={5} />
          </CardContent>
        </Card>

        <Card className="min-w-0">
          <CardHeader>
            <CardTitle>Compliance Trend</CardTitle>
            <CardDescription>
              Score progression over the last 6 months
            </CardDescription>
          </CardHeader>
          <CardContent className="min-w-0 overflow-hidden">
            <div className="w-full">
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={complianceTrendData}>
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
                  formatter={(value: number) => `${value}%`}
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  name="Compliance Percentage"
                  stroke="#3ECF8E"
                  strokeWidth={2}
                  dot={{ fill: '#3ECF8E' }}
                />
              </LineChart>
            </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-3 sm:gap-4 grid-cols-2 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Issues
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              3 critical, 9 warnings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Clearance Queue
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">
              Assets pending review
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Cleared Assets
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">234</div>
            <p className="text-xs text-muted-foreground">
              Approved this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              IP Conflicts
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">
              Require attention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabbed Content */}
      <Tabs defaultValue="issues" className="space-y-4">
        <TabsList className="w-full justify-start overflow-x-auto flex-nowrap">
          <TabsTrigger value="issues" className="whitespace-nowrap">Flagged Issues</TabsTrigger>
          <TabsTrigger value="queue" className="whitespace-nowrap">Clearance Queue</TabsTrigger>
          <TabsTrigger value="conflicts" className="whitespace-nowrap">IP Conflicts</TabsTrigger>
          <TabsTrigger value="audit" className="whitespace-nowrap">Audit Log</TabsTrigger>
        </TabsList>

        <TabsContent value="issues" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Flagged Issues</CardTitle>
              <CardDescription>
                Legal issues requiring review and action
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Asset</TableHead>
                    <TableHead>Issue Type</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Project</TableHead>
                    <TableHead>Flagged</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableSkeleton rows={5} columns={6} />
                  ) : (
                    mockIssues.map((issue) => (
                    <TableRow key={issue.id}>
                      <TableCell className="font-medium">{issue.asset}</TableCell>
                      <TableCell>{issue.type}</TableCell>
                      <TableCell>
                        <Badge variant={getSeverityVariant(issue.severity)}>
                          {issue.severity}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{issue.project}</TableCell>
                      <TableCell className="text-muted-foreground">{issue.flagged}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              Actions
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleAction("approve", issue.asset)}
                            >
                              <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                              Approve
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleAction("flag", issue.asset)}
                            >
                              <AlertTriangle className="mr-2 h-4 w-4 text-amber-500" />
                              Flag
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleAction("reject", issue.asset)}
                              className="text-destructive"
                            >
                              <XCircle className="mr-2 h-4 w-4" />
                              Reject
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="queue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Clearance Queue</CardTitle>
              <CardDescription>
                Assets awaiting legal approval
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EmptyState
                icon={Clock}
                title="8 Assets in Queue"
                description="Assets are waiting for legal clearance before production use"
                action={{
                  label: "Review Queue",
                  onClick: () => toast.info("Queue review feature coming soon"),
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="conflicts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>IP Conflicts</CardTitle>
              <CardDescription>
                Detected copyright and intellectual property conflicts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EmptyState
                icon={AlertTriangle}
                title="3 IP Conflicts Detected"
                description="Copyright and trademark conflicts need immediate attention"
                action={{
                  label: "Review Conflicts",
                  onClick: () => toast.warning("IP conflict review coming soon"),
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Audit Log</CardTitle>
              <CardDescription>
                Complete audit trail of legal reviews and approvals
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EmptyState
                icon={FileText}
                title="View Audit History"
                description="Access complete timeline of all legal reviews and approvals"
                action={{
                  label: "Open Audit Log",
                  onClick: () => toast.info("Full audit log feature coming soon"),
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Action Dialog */}
      <ActionDialog
        open={actionDialog.open}
        onOpenChange={(open) => setActionDialog({ ...actionDialog, open })}
        actionType={actionDialog.type}
        itemName={actionDialog.itemName}
        onConfirm={handleConfirmAction}
      />
    </PageContainer>
  );
}

// Mock data
const mockIssues = [
  {
    id: 1,
    asset: "hero-image-v3.jpg",
    type: "Copyright Conflict",
    severity: "Critical",
    project: "Summer Campaign 2024",
    flagged: "2 hours ago",
  },
  {
    id: 2,
    asset: "voice-over-clip.mp3",
    type: "Likeness Rights",
    severity: "High",
    project: "Podcast Series",
    flagged: "5 hours ago",
  },
  {
    id: 3,
    asset: "background-music.wav",
    type: "License Validation",
    severity: "Medium",
    project: "Product Launch Video",
    flagged: "1 day ago",
  },
  {
    id: 4,
    asset: "generated-scene.mp4",
    type: "Territory Rights",
    severity: "Medium",
    project: "Brand Refresh",
    flagged: "2 days ago",
  },
];

function getSeverityVariant(severity: string) {
  switch (severity) {
    case "Critical":
      return "destructive";
    case "High":
      return "destructive";
    case "Medium":
      return "secondary";
    case "Low":
      return "outline";
    default:
      return "secondary";
  }
}

// Mock data for compliance trend
const complianceTrendData = [
  { month: "Jun", score: 75 },
  { month: "Jul", score: 78 },
  { month: "Aug", score: 82 },
  { month: "Sep", score: 80 },
  { month: "Oct", score: 84 },
  { month: "Nov", score: 87 },
];

