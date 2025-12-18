"use client"

import { useParams, notFound } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { useCreators } from "@/contexts/creators-context"
import { useData } from "@/contexts/data-context"
import { PageContainer } from "@/components/layout/PageContainer"
import {
  User,
  FileText,
  Download,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ExternalLink,
  Mail,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  getRightsStatusColor,
  getRightsStatusVariant,
  formatCreatorExpiration,
} from "@/lib/creator-utils"
import { formatDateLong, getInitials } from "@/lib/format-utils"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { EmptyState } from "@/components/cr"

export default function CreatorDetailPage() {
  const params = useParams()
  const id = params.id as string
  const { getCreatorById, getAllCreditsByCreator } = useCreators()
  const { projects, getAssetById } = useData()

  const creator = getCreatorById(id)

  if (!creator) {
    notFound()
  }

  const credits = getAllCreditsByCreator(id)
  const assetCredits = credits.filter((c) => c.assetId)
  const projectCredits = credits.filter((c) => c.projectId)

  // Helper to get asset name
  const getAssetName = (assetId: string, projectId?: string) => {
    if (!projectId) {
      // Try to find asset in any project
      for (const proj of projects) {
        const asset = getAssetById(proj.id, assetId)
        if (asset) return asset.name
      }
      return `Asset ${assetId}`
    }
    const asset = getAssetById(projectId, assetId)
    return asset?.name || `Asset ${assetId}`
  }

  // Helper to get project name
  const getProjectName = (projectId: string) => {
    const project = projects.find((p) => p.id === projectId)
    return project?.name || `Project ${projectId}`
  }

  const getStatusIcon = () => {
    switch (creator.rightsStatus) {
      case "Authorized":
        return <CheckCircle2 className="h-4 w-4" />
      case "Expiring Soon":
        return <Clock className="h-4 w-4" />
      case "Expired":
        return <AlertTriangle className="h-4 w-4" />
      default:
        return null
    }
  }

  return (
    <PageContainer className="space-y-6 animate-fade-in">
      {/* Breadcrumb Navigation */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/creative/creators">Creators</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{creator.fullName}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Page Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-4">
          <Avatar className="h-24 w-24">
            <AvatarImage src={creator.avatarUrl} alt={creator.fullName} />
            <AvatarFallback className="bg-primary/10 text-primary font-semibold text-2xl">
              {getInitials(creator.fullName)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight break-all">
                {creator.fullName}
              </h1>
              <Badge variant="secondary">{creator.creatorType}</Badge>
              <Badge
                variant={getRightsStatusVariant(creator.rightsStatus)}
                className="flex items-center gap-1"
              >
                {getStatusIcon()}
                {creator.rightsStatus}
              </Badge>
              <Badge variant="outline" className="font-mono text-xs">
                {creator.creatorRightsId}
              </Badge>
            </div>
            <p className="text-muted-foreground flex items-center gap-1 text-sm sm:text-base">
              <Mail className="h-4 w-4" />
              {creator.email}
            </p>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-3 text-xs sm:text-sm text-muted-foreground">
              <span>
                Registered: {formatDateLong(creator.createdAt)} (
                {creator.registrationSource === "invited" ? "Invited" : "Self-Registered"})
              </span>
              <span className="hidden sm:inline">•</span>
              <span>Last updated: {formatDateLong(creator.updatedAt)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-3 sm:gap-4 grid-cols-2 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Risk Level</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge
              variant={
                creator.riskLevel === "Low"
                  ? "default"
                  : creator.riskLevel === "Medium"
                  ? "secondary"
                  : "destructive"
              }
            >
              {creator.riskLevel}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Credits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {creator.linkedAssetsCount + creator.linkedProjectsCount}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {creator.linkedAssetsCount} assets, {creator.linkedProjectsCount} projects
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profile Completion</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{creator.profileCompletion}%</div>
            <p className="text-xs text-muted-foreground mt-1">Complete</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expiration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={cn("text-sm font-medium", getRightsStatusColor(creator.rightsStatus))}>
              {formatCreatorExpiration(creator.validThrough)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {formatDateLong(creator.validThrough)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabbed Content */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="w-full justify-start overflow-x-auto flex-nowrap">
          <TabsTrigger value="overview" className="whitespace-nowrap">
            Overview
          </TabsTrigger>
          <TabsTrigger value="rights" className="whitespace-nowrap">
            Rights & Documentation
          </TabsTrigger>
          <TabsTrigger value="references" className="whitespace-nowrap">
            Reference Materials
          </TabsTrigger>
          <TabsTrigger value="credits" className="whitespace-nowrap">
            Credits
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Creator profile details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">Full Name</h4>
                  <p className="font-medium">{creator.fullName}</p>
                </div>
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">Email</h4>
                  <p className="font-medium">{creator.email}</p>
                </div>
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">
                    Creator Rights ID
                  </h4>
                  <p className="font-medium font-mono">{creator.creatorRightsId}</p>
                </div>
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">Creator Type</h4>
                  <Badge variant="secondary">{creator.creatorType}</Badge>
                </div>
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">
                    Registration Source
                  </h4>
                  <Badge variant="outline">
                    {creator.registrationSource === "invited" ? "Invited" : "Self-Registered"}
                  </Badge>
                </div>
                {creator.contactInformation && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-muted-foreground">
                      Contact Information
                    </h4>
                    <p className="font-medium">{creator.contactInformation}</p>
                  </div>
                )}
              </div>
              {creator.notes && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">Notes</h4>
                  <p className="text-sm">{creator.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rights" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Rights Documentation</CardTitle>
              <CardDescription>Rights agreement and validity information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">Rights Status</h4>
                  <Badge
                    variant={getRightsStatusVariant(creator.rightsStatus)}
                    className="flex items-center gap-1 w-fit"
                  >
                    {getStatusIcon()}
                    {creator.rightsStatus}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">Risk Level</h4>
                  <Badge
                    variant={
                      creator.riskLevel === "Low"
                        ? "default"
                        : creator.riskLevel === "Medium"
                        ? "secondary"
                        : "destructive"
                    }
                  >
                    {creator.riskLevel}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">Valid From</h4>
                  <p className="font-medium">{formatDateLong(creator.validFrom)}</p>
                </div>
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">Valid Through</h4>
                  <p className={cn("font-medium", getRightsStatusColor(creator.rightsStatus))}>
                    {formatDateLong(creator.validThrough)}
                  </p>
                </div>
              </div>

              {creator.rightsAgreementUrl && (
                <div className="space-y-2 pt-4 border-t">
                  <h4 className="text-sm font-medium text-muted-foreground">
                    Rights Agreement Document
                  </h4>
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{creator.rightsAgreementFileName}</span>
                    <Button variant="outline" size="sm" asChild>
                      <a href={creator.rightsAgreementUrl} download target="_blank" rel="noopener noreferrer">
                        <Download className="h-3 w-3 mr-1" />
                        Download
                      </a>
                    </Button>
                  </div>
                </div>
              )}

              {creator.lastVerified && (
                <div className="space-y-2 pt-4 border-t">
                  <h4 className="text-sm font-medium text-muted-foreground">Last Verified</h4>
                  <p className="text-sm">{formatDateLong(creator.lastVerified)}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="references" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Reference Materials</CardTitle>
              <CardDescription>
                Supporting evidence and reference files uploaded by the creator
              </CardDescription>
            </CardHeader>
            <CardContent>
              {creator.referenceMaterials.length === 0 ? (
                <EmptyState
                  icon={FileText}
                  title="No reference materials"
                  description="This creator hasn't uploaded any reference materials yet."
                />
              ) : (
                <div className="space-y-2">
                  {creator.referenceMaterials.map((ref) => (
                    <div
                      key={ref.id}
                      className="flex items-center justify-between p-3 rounded-lg border"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium text-sm">{ref.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {ref.type} • {formatDateLong(ref.uploadedAt)}
                          </p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <a href={ref.url} download target="_blank" rel="noopener noreferrer">
                          <Download className="h-3 w-3 mr-1" />
                          Download
                        </a>
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="credits" className="space-y-4">
          {/* Assets Crediting This Creator */}
          <Card>
            <CardHeader>
              <CardTitle>Assets Crediting This Creator</CardTitle>
              <CardDescription>
                All assets where this creator is credited for their work
              </CardDescription>
            </CardHeader>
            <CardContent>
              {assetCredits.length === 0 ? (
                <EmptyState
                  icon={FileText}
                  title="No asset credits"
                  description="This creator hasn't been credited on any assets yet."
                />
              ) : (
                <div className="space-y-2">
                  {assetCredits.map((credit) => {
                    const assetName = credit.projectId 
                      ? getAssetName(credit.assetId!, credit.projectId)
                      : getAssetName(credit.assetId!)
                    const projectName = credit.projectId ? getProjectName(credit.projectId) : null
                    
                    return (
                      <div
                        key={credit.id}
                        className="flex items-center justify-between p-3 rounded-lg border"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-medium text-sm">
                              {assetName}
                            </p>
                            {credit.role && (
                              <Badge variant="outline" className="text-xs">
                                {credit.role}
                              </Badge>
                            )}
                            {projectName && (
                              <Badge variant="secondary" className="text-xs">
                                {projectName}
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            Credited: {formatDateLong(credit.creditedAt)}
                          </p>
                        </div>
                        {credit.projectId && (
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/projects/${credit.projectId}/assets/${credit.assetId}`}>
                              <ExternalLink className="h-3 w-3 mr-1" />
                              View Asset
                            </Link>
                          </Button>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Projects Crediting This Creator */}
          <Card>
            <CardHeader>
              <CardTitle>Projects Crediting This Creator</CardTitle>
              <CardDescription>
                All projects where this creator is credited for their work
              </CardDescription>
            </CardHeader>
            <CardContent>
              {projectCredits.length === 0 ? (
                <EmptyState
                  icon={FileText}
                  title="No project credits"
                  description="This creator hasn't been credited on any projects yet."
                />
              ) : (
                <div className="space-y-2">
                  {projectCredits.map((credit) => {
                    const projectName = getProjectName(credit.projectId!)
                    
                    return (
                      <div
                        key={credit.id}
                        className="flex items-center justify-between p-3 rounded-lg border"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-medium text-sm">
                              {projectName}
                            </p>
                            {credit.role && (
                              <Badge variant="outline" className="text-xs">
                                {credit.role}
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            Credited: {formatDateLong(credit.creditedAt)}
                          </p>
                        </div>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/projects/${credit.projectId}`}>
                            <ExternalLink className="h-3 w-3 mr-1" />
                            View Project
                          </Link>
                        </Button>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageContainer>
  )
}

