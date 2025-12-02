"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Download,
  FileText,
  Eye,
  History,
  CheckCircle2,
  GitBranch,
} from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useData } from "@/contexts/data-context";
import { notFound, useParams } from "next/navigation";
import { toast } from "sonner";

export default function AssetDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const assetId = params.assetId as string;
  const { getProjectById, getAssetById } = useData();
  
  const project = getProjectById(id);
  const asset = getAssetById(id, assetId);

  if (!project || !asset) {
    notFound();
  }

  const handleDownload = () => {
    toast.success(`Downloading ${asset.name}...`);
  };

  const handleExportLegalRecord = () => {
    toast.success("Legal record exported successfully");
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
            <BreadcrumbLink href={`/projects/${id}`}>
              {project.name}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{asset.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight break-all">{asset.name}</h1>
            <Badge variant={getStatusVariant(asset.status)}>{asset.status}</Badge>
            <Badge variant="outline">{asset.type}</Badge>
          </div>
          <p className="text-muted-foreground text-sm sm:text-base">
            {asset.aiMethod} content for {project.name.toLowerCase()}
          </p>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-3 text-xs sm:text-sm text-muted-foreground">
            <span>Created: {asset.createdDate}</span>
            <span className="hidden sm:inline">•</span>
            <span>Updated: {asset.updated}</span>
            <span className="hidden sm:inline">•</span>
            <span>Creator: {asset.creator}</span>
          </div>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" onClick={handleDownload} className="flex-1 sm:flex-none">
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
          <Button variant="outline" onClick={handleExportLegalRecord} className="flex-1 sm:flex-none">
            <FileText className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Legal Record</span>
            <span className="sm:hidden">Legal</span>
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-3 sm:gap-4 grid-cols-2 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance Percentage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getComplianceColor(asset.compliance)}`}>
              {asset.compliance}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Risk Level</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant={getRiskVariant(asset.risk)}>{asset.risk}</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Method</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm font-medium">{asset.aiMethod}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Type</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{asset.type}</p>
          </CardContent>
        </Card>
      </div>

      {/* Asset Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Asset Preview</CardTitle>
          <CardDescription>
            Visual representation of the asset
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="aspect-video rounded-lg bg-muted flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <Eye className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p>Asset preview would display here</p>
              <p className="text-sm mt-2">hero-image-final.jpg</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabbed Content */}
      <Tabs defaultValue="lineage" className="space-y-4">
        <TabsList className="w-full justify-start overflow-x-auto flex-nowrap">
          <TabsTrigger value="lineage" className="whitespace-nowrap">Lineage</TabsTrigger>
          <TabsTrigger value="ai-metadata" className="whitespace-nowrap">AI Metadata</TabsTrigger>
          <TabsTrigger value="rights" className="whitespace-nowrap">Rights & Licensing</TabsTrigger>
          <TabsTrigger value="conflicts" className="whitespace-nowrap">Conflict Checks</TabsTrigger>
          <TabsTrigger value="versions" className="whitespace-nowrap">Version History</TabsTrigger>
        </TabsList>

        <TabsContent value="lineage" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Asset Lineage</CardTitle>
              <CardDescription>
                Complete input → output provenance chain
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="border-l-2 border-primary pl-6 space-y-6">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <GitBranch className="h-4 w-4 text-primary" />
                      <h4 className="font-medium">Input Materials</h4>
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm p-3 rounded-lg bg-muted">
                        <p className="font-medium">Reference Images (3)</p>
                        <p className="text-muted-foreground text-xs mt-1">
                          beach-sunset-1.jpg, tropical-vibes.jpg, summer-color-palette.png
                        </p>
                      </div>
                      <div className="text-sm p-3 rounded-lg bg-muted">
                        <p className="font-medium">Text Prompt</p>
                        <p className="text-muted-foreground text-xs mt-1">
                          &quot;Vibrant summer beach scene with sunset, tropical colors...&quot;
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <GitBranch className="h-4 w-4 text-primary" />
                      <h4 className="font-medium">AI Processing</h4>
                    </div>
                    <div className="text-sm p-3 rounded-lg bg-muted">
                      <p className="font-medium">Midjourney v6</p>
                      <p className="text-muted-foreground text-xs mt-1">
                        Generated on June 20, 2024 at 3:42 PM
                      </p>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <GitBranch className="h-4 w-4 text-primary" />
                      <h4 className="font-medium">Output Asset</h4>
                    </div>
                    <div className="text-sm p-3 rounded-lg bg-primary/10 border border-primary/20">
                      <p className="font-medium">hero-image-final.jpg</p>
                      <p className="text-muted-foreground text-xs mt-1">
                        2048x1152px, 1.2MB, JPEG
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai-metadata" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AI Model Metadata</CardTitle>
              <CardDescription>
                Complete AI generation details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">AI Tool</h4>
                  <p className="font-medium">Midjourney</p>
                </div>
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">Model Version</h4>
                  <p className="font-medium">v6.0</p>
                </div>
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">Generation Date</h4>
                  <p className="font-medium">June 20, 2024 at 3:42 PM</p>
                </div>
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">Human vs AI</h4>
                  <p className="font-medium">5% Human / 95% AI</p>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">Full Prompt</h4>
                <div className="p-4 rounded-lg bg-muted">
                  <code className="text-sm">
                    &quot;Vibrant summer beach scene with sunset, tropical colors, palm trees swaying, 
                    warm golden light, cinematic composition, professional photography style --ar 16:9 
                    --style raw --v 6&quot;
                  </code>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">Generation Parameters</h4>
                <div className="grid gap-2 md:grid-cols-3">
                  <div className="p-3 rounded-lg bg-muted">
                    <p className="text-xs text-muted-foreground">Aspect Ratio</p>
                    <p className="font-medium">16:9</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted">
                    <p className="text-xs text-muted-foreground">Style</p>
                    <p className="font-medium">Raw</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted">
                    <p className="text-xs text-muted-foreground">Quality</p>
                    <p className="font-medium">High</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rights" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Rights & Licensing</CardTitle>
              <CardDescription>
                License validation and distribution rights
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3 p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <h4 className="font-medium text-green-500">All Rights Validated</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Asset has clear licensing and usage rights
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-sm font-medium">Usage License</span>
                  <Badge>Commercial Use Approved</Badge>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-sm font-medium">Distribution Territory</span>
                  <Badge variant="secondary">Global</Badge>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-sm font-medium">Third-party IP</span>
                  <Badge variant="secondary">None Detected</Badge>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm font-medium">Likeness Rights</span>
                  <Badge variant="secondary">Not Applicable</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="conflicts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Copyright Conflict Checks</CardTitle>
              <CardDescription>
                Automated and manual copyright validation results
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-3 p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <h4 className="font-medium text-green-500">No Conflicts Detected</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Last scanned: 2 hours ago
                  </p>
                  <Button variant="outline" size="sm" className="mt-3">
                    Run New Scan
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="versions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Version History</CardTitle>
              <CardDescription>
                All versions and iterations of this asset
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {versions.map((version, index) => (
                  <div key={index} className="flex items-start gap-4 pb-4 border-b last:border-0">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                      version.current ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                    }`}>
                      <History className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{version.name}</h4>
                        {version.current && <Badge variant="default">Current</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground">{version.changes}</p>
                      <p className="text-xs text-muted-foreground mt-1">{version.date}</p>
                    </div>
                    <Button variant="ghost" size="sm">
                      View
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Mock data
const versions = [
  {
    name: "Version 3 (Final)",
    changes: "Adjusted color grading and added copyright watermark",
    date: "June 22, 2024 at 4:15 PM",
    current: true,
  },
  {
    name: "Version 2",
    changes: "Refined composition based on legal team feedback",
    date: "June 21, 2024 at 2:30 PM",
    current: false,
  },
  {
    name: "Version 1 (Initial)",
    changes: "First AI generation from Midjourney",
    date: "June 20, 2024 at 3:42 PM",
    current: false,
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
    case "Rejected":
      return "destructive";
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

