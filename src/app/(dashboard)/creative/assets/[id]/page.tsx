"use client"

import { useState, useMemo } from "react"
import { useRouter, useParams } from "next/navigation"
import { mockAssets, mockVersionGroups, getVersionGroupById } from "@/lib/mock-data/creative"
import { formatFileSize, formatDateLong } from "@/lib/format-utils"
import { PageContainer } from "@/components/layout/PageContainer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Download,
  Calendar,
  User,
  Palette,
  ListTodo,
  Tag,
  FileImage,
  Sparkles,
  Shield,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  MoreHorizontal,
  Trash2,
  Plus,
  RotateCcw,
  FileBarChart,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { PromptContent } from "@/components/creative/PromptContent"
import { useCreators } from "@/contexts/creators-context"
import { CreatorAvatarBadge } from "@/components/creators"
import { ASSET_CONTENT_TYPE_CONFIG, DESIGN_TYPE_CONFIG } from "@/types/creative"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import { VersionHistoryPanel, SubmitVersionDialog, VersionComments, VersionStatusBadge } from "@/components/assets"
import type { AssetVersion } from "@/types/creative"
import { useCopyrightCredits } from "@/lib/contexts/copyright-credits-context"

export default function AssetDetailPage() {
  const router = useRouter()
  const params = useParams()
  const assetId = params.id as string
  
  // Check if this is a version group first
  const versionGroup = getVersionGroupById(assetId)
  const [selectedVersionId, setSelectedVersionId] = useState(versionGroup?.currentVersionId || "")
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<"overview" | "versions">("overview")
  const [isRunningCheck, setIsRunningCheck] = useState(false)
  const { canRunCheck, useCredit, getTotalAvailable } = useCopyrightCredits()
  
  // Copyright check handlers
  const handleRunCheck = async () => {
    if (!canRunCheck()) {
      toast.error("No copyright check credits available")
      return
    }
    setIsRunningCheck(true)
    try {
      await useCredit()
      await new Promise(resolve => setTimeout(resolve, 2000))
      toast.success("Copyright check completed")
    } catch (error) {
      toast.error("Failed to run copyright check")
    } finally {
      setIsRunningCheck(false)
    }
  }

  const handleRerunCheck = async () => {
    if (!canRunCheck()) {
      toast.error("No copyright check credits available")
      return
    }
    setIsRunningCheck(true)
    try {
      await useCredit()
      await new Promise(resolve => setTimeout(resolve, 2000))
      toast.success("Copyright check re-run completed")
    } catch (error) {
      toast.error("Failed to re-run copyright check")
    } finally {
      setIsRunningCheck(false)
    }
  }

  const handleDelete = () => {
    toast.success("Delete feature coming soon!")
  }
  
  // Fallback to regular asset if not a version group
  const asset = versionGroup 
    ? versionGroup.versions.find(v => v.id === selectedVersionId)
    : mockAssets.find((a) => a.id === assetId)
  
  const { getCreatorsByAsset, getAllCreditsByCreator } = useCreators()

  if (!asset) {
    return (
      <PageContainer className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-semibold">Asset Not Found</h1>
          <p className="text-muted-foreground">The asset you're looking for doesn't exist.</p>
          <Button onClick={() => router.push("/creative/assets")}>
            Back to Assets
          </Button>
        </div>
      </PageContainer>
    )
  }

  // Get creators for this asset
  const creditedCreators = asset?.id ? getCreatorsByAsset(asset.id) : []

  // Get credits with roles for this asset
  const assetCreditsWithRoles = useMemo(() => {
    if (!asset) return []
    return creditedCreators.map((creator) => {
      const creatorCredits = getAllCreditsByCreator(creator.id)
      const assetCredit = creatorCredits.find((credit) => credit.assetId === asset.id)
      return {
        creator,
        role: assetCredit?.role,
      }
    })
  }, [creditedCreators, asset, getAllCreditsByCreator])

  // Get display properties (from asset or version group)
  const displayBrandId = versionGroup ? versionGroup.brandId : (asset && 'brandId' in asset ? asset.brandId : undefined)
  const displayBrandName = versionGroup ? versionGroup.brandName : (asset && 'brandName' in asset ? asset.brandName : undefined)
  const displayBrandColor = versionGroup ? versionGroup.brandColor : (asset && 'brandColor' in asset ? asset.brandColor : undefined)
  const displayDesignType = versionGroup ? versionGroup.designType : (asset && 'designType' in asset ? asset.designType : undefined)
  const displayCreatedAt = (asset && 'createdAt' in asset && asset.createdAt) ? asset.createdAt : (asset && 'uploadedAt' in asset ? asset.uploadedAt : new Date())
  
  const contentTypeConfig = asset && 'contentType' in asset ? ASSET_CONTENT_TYPE_CONFIG[asset.contentType] : null
  const designTypeConfig = displayDesignType ? DESIGN_TYPE_CONFIG[displayDesignType] : null
  const isAIGenerated = asset && 'contentType' in asset && asset.contentType === "ai_generated"

  return (
    <PageContainer className="space-y-2 animate-fade-in">
      {/* Header Section */}
      <div className="flex items-start justify-between">
        <div className="space-y-0.5">
          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
            <Link href="/creative/assets" className="hover:text-foreground transition-colors">
              Assets
            </Link>
            <span>/</span>
            <span className="text-foreground">{asset.name}</span>
          </div>

          {/* Title */}
          <div className="flex items-center gap-1.5">
            <h1 className="text-xl font-semibold">{asset.name}</h1>
            {versionGroup && (
              <Badge variant="outline" className="font-mono text-xs px-1.5 py-0">
                v{(asset as AssetVersion).versionNumber}
              </Badge>
            )}
            {isAIGenerated && (
              <Badge variant="secondary" className="gap-1 px-1.5 py-0.5">
                <Sparkles className="h-3 w-3" />
                <span className="text-[10px]">AI</span>
              </Badge>
            )}
          </div>

          {/* Inline Stats */}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
            {displayBrandId && (
              <Link 
                href={`/creative/brands/${displayBrandId}`}
                className="hover:text-foreground transition-colors flex items-center gap-1"
              >
                {displayBrandColor && (
                  <div
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: displayBrandColor }}
                  />
                )}
                {displayBrandName}
              </Link>
            )}
            {designTypeConfig && (
              <>
                <span>•</span>
                <span>{designTypeConfig.label}</span>
              </>
            )}
            <span>•</span>
            <span>{formatFileSize(asset.fileSize)}</span>
            {asset.dimensions && (
              <>
                <span>•</span>
                <span>{asset.dimensions.width} × {asset.dimensions.height}</span>
              </>
            )}
            {versionGroup && (
              <>
                <span>•</span>
                <span>{versionGroup.totalVersions} {versionGroup.totalVersions === 1 ? 'version' : 'versions'}</span>
              </>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Primary action */}
          <Button size="sm" className="h-8" asChild>
            <a href={asset.fileUrl} download>
              <Download className="mr-2 h-4 w-4" />
              Download
            </a>
          </Button>

          {/* Secondary actions in dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 px-3">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {versionGroup && (
                <DropdownMenuItem onClick={() => setSubmitDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  New Version
                </DropdownMenuItem>
              )}
              <DropdownMenuItem asChild>
                <Link href={`/creative/assets/${asset.id}/review`}>
                  <FileBarChart className="mr-2 h-4 w-4" />
                  Full Review
                </Link>
              </DropdownMenuItem>
              {(!asset.copyrightCheckStatus || asset.copyrightCheckStatus === "pending") && (
                <DropdownMenuItem onClick={handleRunCheck} disabled={isRunningCheck}>
                  <Shield className="mr-2 h-4 w-4" />
                  {isRunningCheck ? "Checking..." : "Run Check (1 credit)"}
                </DropdownMenuItem>
              )}
              {asset.copyrightCheckStatus === "completed" && (
                <DropdownMenuItem onClick={handleRerunCheck} disabled={isRunningCheck}>
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Re-run Check (1 credit)
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => toast.success("Edit feature coming soon!")}>
                Edit Details
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive" onClick={handleDelete}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Asset
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Tabs for Version Groups */}
      {versionGroup ? (
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "overview" | "versions")}>
          {/* Tab Navigation - Linear Style */}
          <div className="border-b border-border/50">
            <TabsList className="h-auto bg-transparent p-0 gap-0">
              <TabsTrigger 
                value="overview"
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-foreground rounded-none px-2 pb-1.5 text-sm"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger 
                value="versions"
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-foreground rounded-none px-2 pb-1.5 text-sm"
              >
                Versions ({versionGroup.totalVersions})
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Overview Tab Content */}
          <TabsContent value="overview" className="mt-2">
            <div className="grid lg:grid-cols-3 gap-3">
              {/* Left Column - Preview & Content */}
              <div className="lg:col-span-2 space-y-2">
                {/* Preview Image */}
                <Card>
            <CardContent className="p-0">
              <div className="relative aspect-[4/3] bg-muted rounded-lg overflow-hidden">
                {asset && 'fileType' in asset && asset.fileType === "image" && asset.thumbnailUrl ? (
                  <Image
                    src={asset.thumbnailUrl}
                    alt={asset.name}
                    fill
                    className="object-contain"
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <FileImage className="h-16 w-16 text-muted-foreground/50 mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Preview not available for this file type
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Description */}
          {asset.description && (
            <Card>
              <CardContent className="pt-4">
                <p className="text-xs font-medium text-muted-foreground mb-2">Description</p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {asset.description}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Tags */}
          {asset && 'tags' in asset && asset.tags && asset.tags.length > 0 && (
            <Card>
              <CardContent className="pt-4">
                <p className="text-xs font-medium text-muted-foreground mb-2">Tags</p>
                <div className="flex flex-wrap gap-1.5">
                  {asset.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs px-2 py-0.5">
                      <Tag className="h-3 w-3 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

                {/* Prompt History (AI Generated Only) */}
                {isAIGenerated && asset.promptHistory && (
                  <PromptContent history={asset.promptHistory} />
                )}
              </div>

              {/* Right Column - Metadata Sidebar */}
              <div className="space-y-2">
          {/* Metadata Card - Consolidated */}
          <Card>
            <CardContent className="pt-4 space-y-3 text-sm">
              {/* Brand */}
              {displayBrandId && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1.5">Brand</p>
                  <Link
                    href={`/creative/brands/${displayBrandId}`}
                    className="flex items-center gap-1.5 hover:underline"
                  >
                    {displayBrandColor && (
                      <div
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: displayBrandColor }}
                      />
                    )}
                    <span className="font-medium">{displayBrandName}</span>
                  </Link>
                </div>
              )}

              {/* Task */}
              {asset.ticketId && asset.ticketTitle && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1.5">From Task</p>
                  <Link href={`/tasks`} className="font-medium hover:underline">
                    {asset.ticketTitle}
                  </Link>
                </div>
              )}

              <Separator />

              {/* Design Type */}
              {designTypeConfig && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1.5">Design Type</p>
                  <p className="font-medium">{designTypeConfig.label}</p>
                </div>
              )}

              {/* Content Type - Remove duplicate AI badge, just show label */}
              {contentTypeConfig && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1.5">Content Type</p>
                  <p className="font-medium">{contentTypeConfig.label}</p>
                </div>
              )}

              <Separator />

              {/* Uploaded By */}
              <div>
                <p className="text-xs text-muted-foreground mb-1.5">Uploaded By</p>
                <p className="font-medium">{asset.uploadedByName}</p>
              </div>

              {/* Date */}
              <div>
                <p className="text-xs text-muted-foreground mb-1.5">Date</p>
                <p className="font-medium">{formatDateLong(displayCreatedAt)}</p>
              </div>
            </CardContent>
          </Card>

          {/* File Information */}
          <Card>
            <CardContent className="pt-4">
              <p className="text-xs font-medium text-muted-foreground mb-2">File Information</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Size</span>
                  <span className="font-medium">{formatFileSize(asset.fileSize)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Type</span>
                  <span className="font-medium">{asset.mimeType}</span>
                </div>
                {asset.dimensions && (
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Dimensions</span>
                    <span className="font-medium">
                      {asset.dimensions.width} × {asset.dimensions.height}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Copyright Check */}
          {asset.copyrightCheckStatus && asset.copyrightCheckData && (
            <Card>
              <CardContent className="pt-4 space-y-2.5">
                <p className="text-xs font-medium text-muted-foreground mb-2">Copyright Check</p>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Similarity</span>
                  <Badge
                    variant={
                      asset.copyrightCheckData.similarityScore < 30
                        ? "default"
                        : "destructive"
                    }
                    className={
                      asset.copyrightCheckData.similarityScore < 30
                        ? "bg-green-500 hover:bg-green-600"
                        : ""
                    }
                  >
                    {asset.copyrightCheckData.similarityScore}%
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Risk Level</span>
                  <Badge
                    variant={
                      asset.copyrightCheckData.riskBreakdown.riskLevel === "low"
                        ? "default"
                        : asset.copyrightCheckData.riskBreakdown.riskLevel === "medium"
                        ? "secondary"
                        : "destructive"
                    }
                  >
                    {asset.copyrightCheckData.riskBreakdown.riskLevel.toUpperCase()}
                  </Badge>
                </div>
                
                {asset.copyrightCheckData.matchedSources.length > 0 && (
                  <div className="text-xs text-muted-foreground">
                    {asset.copyrightCheckData.matchedSources.length} match
                    {asset.copyrightCheckData.matchedSources.length !== 1 ? "es" : ""} found
                  </div>
                )}

                {asset.approvalStatus && (
                  <>
                    <Separator />
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Approval</span>
                      <Badge
                        variant={
                          asset.approvalStatus === "approved"
                            ? "default"
                            : asset.approvalStatus === "rejected"
                            ? "destructive"
                            : "outline"
                        }
                        className={
                          asset.approvalStatus === "approved"
                            ? "bg-green-500 hover:bg-green-600"
                            : asset.approvalStatus === "pending"
                            ? "text-amber-600 border-amber-500"
                            : ""
                        }
                      >
                        {asset.approvalStatus === "approved" && (
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                        )}
                        {asset.approvalStatus === "rejected" && (
                          <XCircle className="h-3 w-3 mr-1" />
                        )}
                        {asset.approvalStatus === "pending" && (
                          <AlertTriangle className="h-3 w-3 mr-1" />
                        )}
                        {asset.approvalStatus.charAt(0).toUpperCase() +
                          asset.approvalStatus.slice(1)}
                      </Badge>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {/* Credited Creators */}
          {creditedCreators.length > 0 && (
            <Card>
              <CardContent className="pt-4">
                <p className="text-xs font-medium text-muted-foreground mb-2">Credited Creators</p>
                <div className="space-y-2">
                  {assetCreditsWithRoles.map(({ creator, role }) => (
                    <div key={creator.id} className="flex items-center justify-between">
                      <CreatorAvatarBadge creator={creator} size="sm" />
                      {role && (
                        <Badge variant="secondary" className="text-xs px-2 py-0.5">
                          {role}
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
          </div>
        </div>
      </TabsContent>

      {/* Versions Tab Content */}
      <TabsContent value="versions" className="mt-2">
            <div className="space-y-3">
              {/* Full-width version history with inline comments */}
              {versionGroup.versions.sort((a, b) => b.versionNumber - a.versionNumber).map((version, index) => {
                const isCurrent = version.id === selectedVersionId
                const isLast = index === versionGroup.versions.length - 1

                return (
                  <Card key={version.id} className={isCurrent ? "border-blue-500 border-2" : ""}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="font-mono">
                              v{version.versionNumber}
                            </Badge>
                            {isCurrent && (
                              <Badge className="bg-blue-500">Current</Badge>
                            )}
                            <VersionStatusBadge status={version.status} />
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedVersionId(version.id)}
                          >
                            View
                          </Button>
                          {!isCurrent && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => toast.success("Version comparison coming soon!")}
                            >
                              Compare
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Version Thumbnail */}
                      {version.thumbnailUrl && (
                        <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-muted">
                          <Image
                            src={version.thumbnailUrl}
                            alt={version.name}
                            fill
                            className="object-contain"
                          />
                        </div>
                      )}

                      {/* Version Metadata */}
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>by {version.uploadedByName}</span>
                        <span>•</span>
                        <span>{formatDateLong(version.uploadedAt)}</span>
                        {version.fileSize && (
                          <>
                            <span>•</span>
                            <span>{formatFileSize(version.fileSize)}</span>
                          </>
                        )}
                      </div>

                      {/* Change Notes */}
                      {version.changeNotes && (
                        <div className="text-sm">
                          <span className="font-medium">Changes: </span>
                          <span className="text-muted-foreground">{version.changeNotes}</span>
                        </div>
                      )}

                      {/* Rejection Reason */}
                      {version.status === "rejected" && version.rejectionReason && (
                        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800">
                          <p className="text-sm font-medium text-red-900 dark:text-red-100">Rejection Reason:</p>
                          <p className="text-sm text-red-800 dark:text-red-200 mt-1">{version.rejectionReason}</p>
                        </div>
                      )}

                      {/* Version Comments */}
                      {version.comments.length > 0 && (
                        <div className="pt-4 border-t">
                          <h4 className="text-sm font-medium mb-3">Comments ({version.commentsCount})</h4>
                          <VersionComments
                            comments={version.comments}
                            onAddComment={async (content) => {
                              toast.success("Comment added")
                            }}
                          />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>
        </Tabs>
      ) : (
        <>
        {/* Regular Asset - Two Column Grid */}
        <div className="grid lg:grid-cols-3 gap-3">
          {/* Left Column - Preview & Content */}
          <div className="lg:col-span-2 space-y-2">
            {/* Preview Image */}
            <Card>
              <CardContent className="p-0">
                <div className="relative aspect-[4/3] bg-muted rounded-lg overflow-hidden">
                  {asset && 'fileType' in asset && asset.fileType === "image" && asset.thumbnailUrl ? (
                    <Image
                      src={asset.thumbnailUrl}
                      alt={asset.name}
                      fill
                      className="object-contain"
                    />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <FileImage className="h-16 w-16 text-muted-foreground/50 mb-2" />
                      <p className="text-sm text-muted-foreground">
                        Preview not available for this file type
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Description */}
            {asset.description && (
              <Card>
                <CardContent className="pt-4">
                  <p className="text-xs font-medium text-muted-foreground mb-2">Description</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {asset.description}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Tags */}
            {asset && 'tags' in asset && asset.tags && asset.tags.length > 0 && (
              <Card>
                <CardContent className="pt-4">
                  <p className="text-xs font-medium text-muted-foreground mb-2">Tags</p>
                  <div className="flex flex-wrap gap-1.5">
                    {asset.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs px-2 py-0.5">
                        <Tag className="h-3 w-3 mr-1" />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Prompt History (AI Generated Only) */}
            {isAIGenerated && asset.promptHistory && (
              <PromptContent history={asset.promptHistory} />
            )}
          </div>

          {/* Right Column - Metadata Sidebar - Same as in tabs */}
          <div className="space-y-2">
            {/* Metadata Card - Consolidated */}
            <Card>
              <CardContent className="pt-4 space-y-3 text-sm">
                {/* Brand */}
                {displayBrandId && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1.5">Brand</p>
                    <Link
                      href={`/creative/brands/${displayBrandId}`}
                      className="flex items-center gap-1.5 hover:underline"
                    >
                      {displayBrandColor && (
                        <div
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: displayBrandColor }}
                        />
                      )}
                      <span className="font-medium">{displayBrandName}</span>
                    </Link>
                  </div>
                )}

                {/* Task */}
                {asset.ticketId && asset.ticketTitle && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1.5">From Task</p>
                    <Link href={`/tasks`} className="font-medium hover:underline">
                      {asset.ticketTitle}
                    </Link>
                  </div>
                )}

                <Separator />

                {/* Design Type */}
                {designTypeConfig && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1.5">Design Type</p>
                    <p className="font-medium">{designTypeConfig.label}</p>
                  </div>
                )}

                {/* Content Type - Remove duplicate AI badge, just show label */}
                {contentTypeConfig && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1.5">Content Type</p>
                    <p className="font-medium">{contentTypeConfig.label}</p>
                  </div>
                )}

                <Separator />

                {/* Uploaded By */}
                <div>
                  <p className="text-xs text-muted-foreground mb-1.5">Uploaded By</p>
                  <p className="font-medium">{asset.uploadedByName}</p>
                </div>

                {/* Date */}
                <div>
                  <p className="text-xs text-muted-foreground mb-1.5">Date</p>
                  <p className="font-medium">{formatDateLong(displayCreatedAt)}</p>
                </div>
              </CardContent>
            </Card>

            {/* File Information */}
            <Card>
              <CardContent className="pt-4">
                <p className="text-xs font-medium text-muted-foreground mb-2">File Information</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Size</span>
                    <span className="font-medium">{formatFileSize(asset.fileSize)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Type</span>
                    <span className="font-medium">{asset.mimeType}</span>
                  </div>
                  {asset.dimensions && (
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Dimensions</span>
                      <span className="font-medium">
                        {asset.dimensions.width} × {asset.dimensions.height}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Copyright Check */}
            {asset.copyrightCheckStatus && asset.copyrightCheckData && (
              <Card>
                <CardContent className="pt-4 space-y-2.5">
                  <p className="text-xs font-medium text-muted-foreground mb-2">Copyright Check</p>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Similarity</span>
                    <Badge
                      variant={
                        asset.copyrightCheckData.similarityScore < 30
                          ? "default"
                          : "destructive"
                      }
                      className={
                        asset.copyrightCheckData.similarityScore < 30
                          ? "bg-green-500 hover:bg-green-600"
                          : ""
                      }
                    >
                      {asset.copyrightCheckData.similarityScore}%
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Risk Level</span>
                    <Badge
                      variant={
                        asset.copyrightCheckData.riskBreakdown.riskLevel === "low"
                          ? "default"
                          : asset.copyrightCheckData.riskBreakdown.riskLevel === "medium"
                          ? "secondary"
                          : "destructive"
                      }
                    >
                      {asset.copyrightCheckData.riskBreakdown.riskLevel.toUpperCase()}
                    </Badge>
                  </div>
                  
                  {asset.copyrightCheckData.matchedSources.length > 0 && (
                    <div className="text-xs text-muted-foreground">
                      {asset.copyrightCheckData.matchedSources.length} match
                      {asset.copyrightCheckData.matchedSources.length !== 1 ? "es" : ""} found
                    </div>
                  )}

                  {asset.approvalStatus && (
                    <>
                      <Separator />
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Approval</span>
                        <Badge
                          variant={
                            asset.approvalStatus === "approved"
                              ? "default"
                              : asset.approvalStatus === "rejected"
                              ? "destructive"
                              : "outline"
                          }
                          className={
                            asset.approvalStatus === "approved"
                              ? "bg-green-500 hover:bg-green-600"
                              : asset.approvalStatus === "pending"
                              ? "text-amber-600 border-amber-500"
                              : ""
                          }
                        >
                          {asset.approvalStatus === "approved" && (
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                          )}
                          {asset.approvalStatus === "rejected" && (
                            <XCircle className="h-3 w-3 mr-1" />
                          )}
                          {asset.approvalStatus === "pending" && (
                            <AlertTriangle className="h-3 w-3 mr-1" />
                          )}
                          {asset.approvalStatus.charAt(0).toUpperCase() +
                            asset.approvalStatus.slice(1)}
                        </Badge>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Credited Creators */}
            {creditedCreators.length > 0 && (
              <Card>
                <CardContent className="pt-4">
                  <p className="text-xs font-medium text-muted-foreground mb-2">Credited Creators</p>
                  <div className="space-y-2">
                    {assetCreditsWithRoles.map(({ creator, role }) => (
                      <div key={creator.id} className="flex items-center justify-between">
                        <CreatorAvatarBadge creator={creator} size="sm" />
                        {role && (
                          <Badge variant="secondary" className="text-xs px-2 py-0.5">
                            {role}
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
        </>
      )}

      {/* Submit Version Dialog */}
      {versionGroup && (
        <SubmitVersionDialog
          open={submitDialogOpen}
          onOpenChange={setSubmitDialogOpen}
          onSubmit={async (file, notes) => {
            toast.success("New version submitted for review")
          }}
          currentVersion={versionGroup.currentVersionNumber}
        />
      )}
    </PageContainer>
  )
}
