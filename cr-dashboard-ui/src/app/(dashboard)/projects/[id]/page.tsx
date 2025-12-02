"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState, AddAssetDialog } from "@/components/cr";
import {
  Download,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  Eye,
  History,
  FolderOpen,
  Trash2,
  MoreHorizontal,
} from "lucide-react";
import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
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
import { useData } from "@/contexts/data-context";
import { notFound, useParams } from "next/navigation";
import { toast } from "sonner";
import { useState } from "react";

export default function ProjectDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { getProjectById, getProjectAssets, deleteAsset } = useData();
  const [deletingAssetId, setDeletingAssetId] = useState<string | null>(null);
  const [addAssetDialogOpen, setAddAssetDialogOpen] = useState(false);
  
  const project = getProjectById(id);
  const assets = getProjectAssets(id);

  if (!project) {
    notFound();
  }

  const handleDeleteAsset = async (assetId: string, assetName: string) => {
    if (!confirm(`Are you sure you want to delete "${assetName}"?`)) {
      return;
    }

    setDeletingAssetId(assetId);
    try {
      await deleteAsset(id, assetId);
      toast.success(`Asset "${assetName}" deleted successfully`);
    } catch (err) {
      console.error("Failed to delete asset:", err);
      toast.error("Failed to delete asset");
    } finally {
      setDeletingAssetId(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Breadcrumb Navigation */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/projects">Projects</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{project.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{project.name}</h1>
            <Badge variant={getStatusVariant(project.status)}>{project.status}</Badge>
          </div>
          <p className="text-muted-foreground text-sm sm:text-base">
            {project.description}
          </p>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-3 text-xs sm:text-sm text-muted-foreground">
            <span>Created: {project.createdDate}</span>
            <span className="hidden sm:inline">•</span>
            <span>Updated: {project.updated}</span>
            <span className="hidden sm:inline">•</span>
            <span>Owner: {project.owner}</span>
          </div>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button 
            variant="outline"
            onClick={() => toast.info("Export project data feature coming soon")}
            className="flex-1 sm:flex-none"
          >
            <Download className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Export</span>
            <span className="sm:hidden">Export</span>
          </Button>
          <Button 
            variant="outline"
            onClick={() => toast.success("Legal record package generated")}
            className="flex-1 sm:flex-none"
          >
            <FileText className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Legal Record</span>
            <span className="sm:hidden">Legal</span>
          </Button>
        </div>
      </div>

      {/* Project Stats */}
      <div className="grid gap-3 sm:gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{assets.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getComplianceColor(project.compliance)}`}>
              {project.compliance}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Risk Level</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant={getRiskVariant(project.risk)}>{project.risk}</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {assets.filter(a => a.status === "Approved").length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {assets.filter(a => a.status === "Review" || a.status === "Draft").length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabbed Content */}
      <Tabs defaultValue="assets" className="space-y-4">
        <TabsList className="w-full justify-start overflow-x-auto flex-nowrap">
          <TabsTrigger value="assets" className="whitespace-nowrap">Assets</TabsTrigger>
          <TabsTrigger value="workflow" className="whitespace-nowrap">Workflow</TabsTrigger>
          <TabsTrigger value="audit" className="whitespace-nowrap">Audit Trail</TabsTrigger>
          <TabsTrigger value="ai-metadata" className="whitespace-nowrap">AI Metadata</TabsTrigger>
        </TabsList>

        <TabsContent value="assets" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row items-start gap-4 sm:items-center sm:justify-between">
                <div>
                  <CardTitle>Project Assets</CardTitle>
                  <CardDescription>
                    All AI-generated and augmented assets in this project
                  </CardDescription>
                </div>
                <Button onClick={() => setAddAssetDialogOpen(true)} className="w-full sm:w-auto">
                  <FileText className="mr-2 h-4 w-4" />
                  Add Asset
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {assets.length === 0 ? (
                <EmptyState
                  icon={FolderOpen}
                  title="No Assets Yet"
                  description="This project doesn't have any assets yet. Upload your first AI-generated content to get started with provenance tracking."
                />
              ) : (
                <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Asset Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>AI Method</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Risk</TableHead>
                      <TableHead>Updated</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {assets.map((asset) => (
                      <TableRow key={asset.id}>
                        <TableCell className="font-medium">{asset.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{asset.type}</Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {asset.aiMethod}
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusVariant(asset.status)}>
                            {asset.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getRiskVariant(asset.risk)}>
                            {asset.risk}
                          </Badge>
                        </TableCell>
                      <TableCell className="text-muted-foreground">
                        {asset.updated}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" disabled={deletingAssetId === asset.id}>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/projects/${id}/assets/${asset.id}`} className="cursor-pointer">
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDeleteAsset(asset.id, asset.name)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete Asset
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="workflow" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Workflow Status</CardTitle>
              <CardDescription>
                Current approval workflow state
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {workflowSteps.map((step, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                      step.completed ? 'bg-green-500/10 text-green-500' : 'bg-muted text-muted-foreground'
                    }`}>
                      {step.completed ? (
                        <CheckCircle2 className="h-5 w-5" />
                      ) : step.active ? (
                        <Clock className="h-5 w-5" />
                      ) : (
                        <AlertCircle className="h-5 w-5" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{step.title}</h4>
                      <p className="text-sm text-muted-foreground">{step.description}</p>
                      {step.date && (
                        <p className="text-xs text-muted-foreground mt-1">{step.date}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Audit Trail</CardTitle>
              <CardDescription>
                Complete history of all project changes and approvals
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {auditLogs.map((log, index) => (
                  <div key={index} className="flex items-start gap-3 pb-4 border-b last:border-0">
                    <History className="h-4 w-4 mt-1 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{log.action}</p>
                      <p className="text-xs text-muted-foreground">{log.user} • {log.timestamp}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai-metadata" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AI Tools & Metadata</CardTitle>
              <CardDescription>
                AI tools used and generation metadata
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">AI Tools Used</h4>
                    <div className="flex flex-wrap gap-2">
                      <Badge>Midjourney</Badge>
                      <Badge>ChatGPT</Badge>
                      <Badge>ElevenLabs</Badge>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Content Types</h4>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline">Images</Badge>
                      <Badge variant="outline">Text</Badge>
                      <Badge variant="outline">Audio</Badge>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Prompt Logs</h4>
                  <p className="text-sm text-muted-foreground">
                    142 prompts logged across all assets
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => toast.info("View All Prompts feature coming soon")}
                  >
                    View All Prompts
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Asset Dialog */}
      <AddAssetDialog
        open={addAssetDialogOpen}
        onOpenChange={setAddAssetDialogOpen}
        projectId={id}
      />
    </div>
  );
}

// Workflow mock data
const workflowSteps = [
  {
    title: "Draft",
    description: "Asset created and uploaded",
    completed: true,
    active: false,
    date: "June 15, 2024 at 10:30 AM",
  },
  {
    title: "Review",
    description: "Legal and compliance review in progress",
    completed: true,
    active: false,
    date: "June 18, 2024 at 2:15 PM",
  },
  {
    title: "Approved",
    description: "Assets cleared for production use",
    completed: false,
    active: true,
    date: null,
  },
];

const auditLogs = [
  {
    action: "Asset approved: hero-image-final.jpg",
    user: "Legal Team",
    timestamp: "2 hours ago",
  },
  {
    action: "Compliance percentage updated to 92%",
    user: "System",
    timestamp: "5 hours ago",
  },
  {
    action: "New asset added: voice-over-v2.mp3",
    user: "Sarah Johnson",
    timestamp: "1 day ago",
  },
  {
    action: "Project status changed to Active",
    user: "Project Manager",
    timestamp: "3 days ago",
  },
];

function getStatusVariant(status: string) {
  switch (status) {
    case "Approved":
      return "default";
    case "Review":
      return "secondary";
    case "Draft":
      return "outline";
    default:
      return "secondary";
  }
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

function getComplianceColor(score: number) {
  if (score >= 90) return "text-green-500";
  if (score >= 70) return "text-amber-500";
  return "text-destructive";
}

