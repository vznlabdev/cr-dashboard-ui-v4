"use client"

import { useState, useMemo, useCallback, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { mockAssets, mockVersionGroups, getVersionGroupById } from "@/lib/mock-data/creative"
import { formatFileSize, formatDateLong } from "@/lib/format-utils"
import { useAssetAutoSave } from "@/lib/asset-auto-save"
import { PageContainer } from "@/components/layout/PageContainer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible"
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
  ChevronDown,
  Eye,
  Zap,
  ShieldCheck,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { PromptContent } from "@/components/creative/PromptContent"
import { InlineEditField, ScoreBadge } from "@/components/creative"
import { useCreators } from "@/contexts/creators-context"
import { CreatorAvatarBadge } from "@/components/creators"
import { ASSET_CONTENT_TYPE_CONFIG, DESIGN_TYPE_CONFIG } from "@/types/creative"
import { EDITABLE_FIELDS } from "@/config/bulk-edit-fields"
import { formatDistanceToNow } from "date-fns"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import { VersionHistoryPanel, SubmitVersionDialog, VersionComments, VersionStatusBadge } from "@/components/assets"
import type { AssetVersion, MatchedSource, AssetReviewData } from "@/types/creative"
import { useCopyrightCredits } from "@/lib/contexts/copyright-credits-context"

export default function AssetDetailPage() {
  const router = useRouter()
  const params = useParams()
  const assetId = params.id as string
  
  // Check if this is a version group first
  const versionGroup = getVersionGroupById(assetId)
  const [selectedVersionId, setSelectedVersionId] = useState(versionGroup?.currentVersionId || "")
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<"overview" | "quality" | "versions">("overview")
  const [isRunningCheck, setIsRunningCheck] = useState(false)
  const { canRunCheck, useCredit, getTotalAvailable } = useCopyrightCredits()
  
  // Local asset state for optimistic updates
  const [localAsset, setLocalAsset] = useState<any>(null)
  
  // Generate mock review data with realistic scores
  const generateMockReviewData = (): AssetReviewData => {
    const copyrightScore = Math.floor(Math.random() * 30) + 70 // 70-100
    const accessibilityScore = Math.floor(Math.random() * 25) + 75 // 75-100
    const seoScore = Math.floor(Math.random() * 30) + 65 // 65-95
    const performanceScore = Math.floor(Math.random() * 35) + 60 // 60-95
    const securityScore = Math.floor(Math.random() * 20) + 80 // 80-100
    
    const overallScore = Math.round(
      (copyrightScore * 0.3 + accessibilityScore * 0.2 + seoScore * 0.15 + 
       performanceScore * 0.2 + securityScore * 0.15)
    )

    const now = new Date()

    return {
      overallScore,
      checksCompleted: 6,
      totalChecks: 6,
      copyright: {
        status: "completed",
        data: {
          similarityScore: 100 - copyrightScore,
          matchedSources: [],
          riskBreakdown: {
            copyrightRisk: Math.max(0, 100 - copyrightScore - 10),
            trademarkRisk: Math.max(0, 100 - copyrightScore - 20),
            overallRisk: 100 - copyrightScore,
            riskLevel: copyrightScore >= 85 ? "low" : copyrightScore >= 70 ? "medium" : "high",
          },
          recommendations: [
            copyrightScore >= 85 
              ? "Asset passed copyright check with low similarity score."
              : "Some similarities detected, review recommended.",
            copyrightScore >= 85 
              ? "No significant matches found in copyright databases."
              : "Minor matches found, but likely acceptable.",
          ],
          checkedAt: now,
          checkDuration: 4500,
        },
      },
      accessibility: {
        status: "completed",
        data: {
          score: accessibilityScore,
          issues: accessibilityScore < 90 ? [{
            severity: "minor" as const,
            type: "contrast" as const,
            description: "Some text elements could use higher contrast",
            recommendation: "Increase contrast ratio for small text",
          }] : [],
          wcagLevel: accessibilityScore >= 90 ? "AAA" : "AA",
          colorContrast: {
            passed: true,
            ratio: accessibilityScore >= 90 ? 7.1 : 4.8,
            recommendation: accessibilityScore >= 90 
              ? "Excellent contrast ratio" 
              : "Meets WCAG AA standards",
          },
          altText: {
            present: true,
            quality: accessibilityScore >= 90 ? "good" : "fair",
          },
          recommendations: [
            accessibilityScore >= 90 
              ? "Excellent accessibility overall"
              : "Good accessibility with room for improvement",
            "Alt text is present and descriptive",
          ],
          checkedAt: now,
          checkDuration: 1200,
        },
      },
      seo: {
        status: "completed",
        data: {
          score: seoScore,
          imageOptimization: {
            format: seoScore >= 80 ? "optimal" : "acceptable",
            sizeRating: seoScore >= 80 ? "good" : "large",
            compressionPotential: Math.floor((100 - seoScore) / 2),
          },
          metadata: {
            filenameQuality: seoScore >= 80 ? "descriptive" : "generic",
            altTextPresent: true,
            dimensionsOptimal: seoScore >= 75,
          },
          recommendations: [
            seoScore >= 80 
              ? "Good SEO optimization"
              : "SEO could be improved",
            "Consider further optimization opportunities",
          ],
          checkedAt: now,
          checkDuration: 1500,
        },
      },
      brandCompliance: {
        status: "completed",
        data: {
          score: Math.floor(Math.random() * 20) + 80,
          colorCompliance: {
            passed: true,
            brandColorsUsed: [],
            offBrandColors: [],
          },
          logoUsage: {
            passed: true,
            issues: [],
          },
          styleGuideAdherence: Math.floor(Math.random() * 20) + 80,
          recommendations: ["Brand guidelines followed"],
          checkedAt: now,
          checkDuration: 1100,
        },
      },
      performance: {
        status: "completed",
        data: {
          score: performanceScore,
          fileSize: {
            current: 2400000,
            optimal: 2040000,
            savings: Math.floor((100 - performanceScore) * 10000),
          },
          loadTimeEstimate: Math.floor(1500 - (performanceScore * 5)),
          compressionScore: performanceScore,
          formatRecommendation: performanceScore < 80 
            ? "Consider WebP format for better compression"
            : undefined,
          recommendations: [
            performanceScore >= 80 
              ? "Good performance optimization"
              : "Performance could be improved",
            performanceScore < 80 
              ? "Consider file size optimization"
              : "File size is acceptable",
          ],
          checkedAt: now,
          checkDuration: 900,
        },
      },
      security: {
        status: "completed",
        data: {
          score: securityScore,
          threats: [],
          safe: true,
          recommendations: [
            "No security threats detected",
            "File is safe to use",
          ],
          checkedAt: now,
          checkDuration: 2200,
        },
      },
      lastReviewedAt: now,
      reviewedBy: "system",
    }
  }
  
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
      
      // Generate and apply review data
      const reviewData = generateMockReviewData()
      
      // Update local state
      setLocalAsset((prev: any) => ({
        ...prev,
        reviewData,
        copyrightCheckStatus: "completed",
        copyrightCheckData: reviewData.copyright.data
      }))
      
      // Persist to mockAssets for cross-page navigation
      const assetIndex = mockAssets.findIndex(a => a.id === assetId)
      if (assetIndex !== -1) {
        mockAssets[assetIndex].reviewData = reviewData
        mockAssets[assetIndex].copyrightCheckStatus = "completed"
        mockAssets[assetIndex].copyrightCheckData = reviewData.copyright.data
      }
      
      // If version group, update the version
      if (versionGroup && selectedVersionId) {
        const versionIndex = versionGroup.versions.findIndex(v => v.id === selectedVersionId)
        if (versionIndex !== -1) {
          versionGroup.versions[versionIndex].reviewData = reviewData
          versionGroup.versions[versionIndex].copyrightCheckStatus = "completed"
          versionGroup.versions[versionIndex].copyrightCheckData = reviewData.copyright.data
        }
      }
      
      toast.success("Quality check completed - all scores updated")
    } catch (error) {
      toast.error("Failed to run quality check")
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
      
      // Generate fresh review data
      const reviewData = generateMockReviewData()
      
      // Update local state
      setLocalAsset((prev: any) => ({
        ...prev,
        reviewData,
        copyrightCheckStatus: "completed",
        copyrightCheckData: reviewData.copyright.data
      }))
      
      // Persist to mockAssets for cross-page navigation
      const assetIndex = mockAssets.findIndex(a => a.id === assetId)
      if (assetIndex !== -1) {
        mockAssets[assetIndex].reviewData = reviewData
        mockAssets[assetIndex].copyrightCheckStatus = "completed"
        mockAssets[assetIndex].copyrightCheckData = reviewData.copyright.data
      }
      
      // If version group, update the version
      if (versionGroup && selectedVersionId) {
        const versionIndex = versionGroup.versions.findIndex(v => v.id === selectedVersionId)
        if (versionIndex !== -1) {
          versionGroup.versions[versionIndex].reviewData = reviewData
          versionGroup.versions[versionIndex].copyrightCheckStatus = "completed"
          versionGroup.versions[versionIndex].copyrightCheckData = reviewData.copyright.data
        }
      }
      
      toast.success("Quality check re-run completed - all scores updated")
    } catch (error) {
      toast.error("Failed to re-run quality check")
    } finally {
      setIsRunningCheck(false)
    }
  }

  const handleDelete = () => {
    toast.success("Delete feature coming soon!")
  }
  
  // Fallback to regular asset if not a version group
  const baseAsset = versionGroup 
    ? versionGroup.versions.find(v => v.id === selectedVersionId)
    : mockAssets.find((a) => a.id === assetId)
  
  // Use local asset state or base asset
  const asset = localAsset || baseAsset
  
  // Initialize local asset on mount
  useEffect(() => {
    if (baseAsset && !localAsset) {
      setLocalAsset(baseAsset)
    }
  }, [baseAsset, localAsset])
  
  // Auto-save hook
  const { saveField, isSaving, lastSaved } = useAssetAutoSave(assetId, asset, {
    onUpdate: setLocalAsset
  })
  
  // Handle field save
  const handleFieldSave = useCallback(async (fieldPath: string, newValue: any) => {
    await saveField(fieldPath, newValue)
  }, [saveField])
  
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
  
  const contentTypeConfig = asset && 'contentType' in asset && asset.contentType ? ASSET_CONTENT_TYPE_CONFIG[asset.contentType as keyof typeof ASSET_CONTENT_TYPE_CONFIG] : null
  const designTypeConfig = displayDesignType ? DESIGN_TYPE_CONFIG[displayDesignType as keyof typeof DESIGN_TYPE_CONFIG] : null
  const isAIGenerated = asset && 'contentType' in asset && asset.contentType === "ai_generated"
  
  // Get editable field configurations
  const nameField = useMemo(() => EDITABLE_FIELDS.find(f => f.id === "name"), [])
  const descriptionField = useMemo(() => EDITABLE_FIELDS.find(f => f.id === "description"), [])
  const tagsField = useMemo(() => EDITABLE_FIELDS.find(f => f.id === "tags"), [])
  const statusField = useMemo(() => EDITABLE_FIELDS.find(f => f.id === "approvalStatus"), [])
  const brandField = useMemo(() => EDITABLE_FIELDS.find(f => f.id === "brandId"), [])
  const designTypeField = useMemo(() => EDITABLE_FIELDS.find(f => f.id === "designType"), [])
  
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault()
        // Manual save would trigger any pending changes
        toast.success("Changes saved")
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <PageContainer className="space-y-4 animate-fade-in">
      {/* Header Section with Save Status */}
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

        {/* Action Buttons with Save Indicator */}
        <div className="flex items-center gap-3">
          {/* Save Status */}
          <div className="text-xs text-muted-foreground">
            {isSaving && <span>Saving...</span>}
            {!isSaving && lastSaved && (
              <span>Saved {formatDistanceToNow(lastSaved, { addSuffix: true })}</span>
            )}
          </div>
          
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
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "overview" | "quality" | "versions")}>
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
              <TabsTrigger 
                value="quality"
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-foreground rounded-none px-2 pb-1.5 text-sm"
              >
                Quality
                {asset.copyrightCheckStatus === "completed" && (
                  <Badge variant="secondary" className="ml-1.5 h-3.5 px-1 text-[9px]">
                    Checked
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Overview Tab Content */}
          <TabsContent value="overview" className="mt-2">
            <div className="grid lg:grid-cols-3 gap-3">
              {/* Left Column - Main Content */}
              <div className="lg:col-span-2 space-y-3">
                {/* Basic Information Card - Inline Editable */}
                {nameField && descriptionField && (
                  <Card>
                    <CardContent className="pt-4 space-y-3">
                      <InlineEditField
                        field={nameField}
                        value={asset.name}
                        onSave={(newValue) => handleFieldSave("name", newValue)}
                        label="Title"
                      />
                      
                      {descriptionField && (
                        <InlineEditField
                          field={descriptionField}
                          value={asset.description}
                          onSave={(newValue) => handleFieldSave("description", newValue)}
                        />
                      )}
                    </CardContent>
                  </Card>
                )}
                
                {/* Media / Preview Image */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Media</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="relative aspect-[4/3] bg-muted rounded-lg overflow-hidden border">
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

                {/* File Properties Section */}
                <Collapsible>
                  <CollapsibleTrigger className="flex items-center justify-between w-full px-3 py-2.5 border rounded-md hover:bg-accent/30 transition-all duration-150 group">
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">File Properties</h3>
                    <ChevronDown className="h-3.5 w-3.5 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pt-2">
                    <Card className="mt-2 border-l-2 border-l-accent">
                      <CardContent className="pt-4 space-y-3">
                        {EDITABLE_FIELDS.filter(f => f.category === "files").map(field => (
                          <InlineEditField
                            key={field.id}
                            field={field}
                            value={asset[field.path as keyof typeof asset]}
                            onSave={(newValue) => handleFieldSave(field.path, newValue)}
                          />
                        ))}
                      </CardContent>
                    </Card>
                  </CollapsibleContent>
                </Collapsible>
                
                {/* AI Generation Section (for AI-generated assets) */}
                {isAIGenerated && (
                  <Collapsible defaultOpen={true}>
                    <CollapsibleTrigger className="flex items-center justify-between w-full px-3 py-2.5 border rounded-md hover:bg-accent/30 transition-all duration-150 group">
                      <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">AI Generation</h3>
                      <ChevronDown className="h-3.5 w-3.5 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pt-2">
                      <Card className="mt-2 border-l-2 border-l-purple-500">
                        <CardContent className="pt-4 space-y-3">
                          {EDITABLE_FIELDS.filter(f => f.category === "ai").map(field => (
                            <InlineEditField
                              key={field.id}
                              field={field}
                              value={field.path.includes('.') 
                                ? field.path.split('.').reduce((obj: any, key) => obj?.[key], asset)
                                : asset[field.path as keyof typeof asset]
                              }
                              onSave={(newValue) => handleFieldSave(field.path, newValue)}
                            />
                          ))}
                          
                          {/* Keep original PromptContent for full history */}
                          {asset.promptHistory && (
                            <>
                              <Separator />
                              <PromptContent history={asset.promptHistory} />
                            </>
                          )}
                        </CardContent>
                      </Card>
                    </CollapsibleContent>
                  </Collapsible>
                )}
                
                {/* Version Management Section (version groups only) */}
                {versionGroup && (
                  <Collapsible>
                    <CollapsibleTrigger className="flex items-center justify-between w-full px-3 py-2.5 border rounded-md hover:bg-accent/30 transition-all duration-150 group">
                      <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Version Management</h3>
                      <ChevronDown className="h-3.5 w-3.5 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pt-2">
                      <Card className="mt-2 border-l-2 border-l-accent">
                        <CardContent className="pt-4 space-y-3">
                          {EDITABLE_FIELDS.filter(f => f.category === "version").map(field => (
                            <InlineEditField
                              key={field.id}
                              field={field}
                              value={asset[field.path as keyof typeof asset]}
                              onSave={(newValue) => handleFieldSave(field.path, newValue)}
                            />
                          ))}
                        </CardContent>
                      </Card>
                    </CollapsibleContent>
                  </Collapsible>
                )}
              </div>

              {/* Right Column - Metadata Sidebar */}
              <div className="space-y-3">
                {/* Status Card - Shopify Style */}
                {statusField && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <InlineEditField
                        field={statusField}
                        value={asset.approvalStatus}
                        onSave={(newValue) => handleFieldSave("approvalStatus", newValue)}
                        showLabel={false}
                      />
                    </CardContent>
                  </Card>
                )}
                
                {/* Organization Card - Shopify Style */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Organization</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {/* Brand */}
                    {brandField && (
                      <InlineEditField
                        field={brandField}
                        value={displayBrandId}
                        onSave={(newValue) => handleFieldSave("brandId", newValue)}
                      />
                    )}
                    
                    {/* Design Type */}
                    {designTypeField && (
                      <InlineEditField
                        field={designTypeField}
                        value={displayDesignType}
                        onSave={(newValue) => handleFieldSave("designType", newValue)}
                      />
                    )}
                    
                    {/* Tags */}
                    {tagsField && asset && 'tags' in asset && (
                      <InlineEditField
                        field={tagsField}
                        value={asset.tags}
                        onSave={(newValue) => handleFieldSave("tags", newValue)}
                      />
                    )}
                  </CardContent>
                </Card>
                
                {/* Talent Rights Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Talent Rights (NILP)</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {(() => {
                      const creatorIdsField = EDITABLE_FIELDS.find(f => f.id === "creatorIds")
                      return creatorIdsField && (
                        <InlineEditField
                          field={creatorIdsField}
                          value={asset.creatorIds || []}
                          onSave={(newValue) => handleFieldSave("creatorIds", newValue)}
                          label="Assign Talent"
                        />
                      )
                    })()}
                    
                    {creditedCreators.length > 0 && (
                      <>
                        <Separator />
                        <div>
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
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
          
          {/* Metadata Card - Consolidated */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
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

          {/* Copyright Check - Summary */}
          {asset.copyrightCheckStatus && asset.copyrightCheckData && (
            <Card>
              <CardContent className="pt-4 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-muted-foreground">Copyright Status</p>
                  <Button 
                    variant="link" 
                    size="sm" 
                    className="h-auto p-0 text-xs"
                    onClick={() => setActiveTab("quality")}
                  >
                    View Details
                  </Button>
                </div>
                
                <div className="flex items-center gap-2">
                  <ScoreBadge 
                    icon={Shield} 
                    score={asset.copyrightCheckData.overallScore} 
                    size="sm"
                  />
                  <span className="text-xs text-muted-foreground">
                    {asset.copyrightCheckData.riskBreakdown.riskLevel} risk
                  </span>
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

          {/* Quality Tab Content */}
          <TabsContent value="quality" className="mt-2">
            <div className="space-y-3">
              {/* Quality Score Dashboard - Ultra Compact */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">Quality Scores</CardTitle>
                    <div className="flex items-center gap-2">
                      {!asset.copyrightCheckStatus && (
                        <Button size="sm" className="h-7 text-xs" onClick={handleRunCheck} disabled={isRunningCheck}>
                          <Shield className="mr-1.5 h-3 w-3" />
                          {isRunningCheck ? "Checking..." : "Run Check (1 credit)"}
                        </Button>
                      )}
                      {asset.copyrightCheckStatus === "completed" && (
                        <Button variant="outline" size="sm" className="h-7 text-xs" onClick={handleRerunCheck} disabled={isRunningCheck}>
                          <RotateCcw className="mr-1.5 h-3 w-3" />
                          {isRunningCheck ? "Checking..." : "Re-run"}
                        </Button>
                      )}
                      <Button variant="outline" size="sm" className="h-7 text-xs" asChild>
                        <Link href={`/creative/assets/${assetId}/review`}>
                          <FileBarChart className="mr-1.5 h-3 w-3" />
                          Full Review
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Score Badges Row - Compact */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <ScoreBadge 
                      icon={Shield} 
                      score={asset.reviewData?.copyright?.data ? (100 - asset.reviewData.copyright.data.similarityScore) : undefined}
                      label="Copyright"
                      lastChecked={asset.copyrightCheckData?.checkedAt}
                      size="sm"
                    />
                    <ScoreBadge 
                      icon={Eye} 
                      score={asset.reviewData?.accessibility?.data?.score} 
                      label="Accessibility"
                      size="sm"
                    />
                    <ScoreBadge 
                      icon={Zap} 
                      score={asset.reviewData?.performance?.data?.score} 
                      label="Performance"
                      size="sm"
                    />
                    <ScoreBadge 
                      icon={Palette} 
                      score={asset.reviewData?.seo?.data?.score} 
                      label="SEO"
                      size="sm"
                    />
                    <ScoreBadge 
                      icon={ShieldCheck} 
                      score={asset.reviewData?.security?.data?.score} 
                      label="Security"
                      size="sm"
                    />
                  </div>

                  {/* Copyright Check Details */}
                  {asset.copyrightCheckData && (
                    <>
                      <Separator />
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Similarity</span>
                          <Badge
                            variant={asset.copyrightCheckData.similarityScore < 30 ? "default" : "destructive"}
                            className={cn(
                              "h-5 px-2 text-xs",
                              asset.copyrightCheckData.similarityScore < 30 && "bg-green-500 hover:bg-green-600"
                            )}
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
                            className="h-5 px-2 text-xs"
                          >
                            {asset.copyrightCheckData.riskBreakdown.riskLevel.toUpperCase()}
                          </Badge>
                        </div>
                        
                        {asset.copyrightCheckData.matchedSources.length > 0 && (
                          <div className="text-xs text-muted-foreground">
                            {asset.copyrightCheckData.matchedSources.length} potential {asset.copyrightCheckData.matchedSources.length === 1 ? 'match' : 'matches'} found
                          </div>
                        )}
                        
                        {asset.copyrightCheckData.checkedAt && (
                          <div className="text-xs text-muted-foreground">
                            Last checked {formatDateLong(asset.copyrightCheckData.checkedAt)}
                          </div>
                        )}
                      </div>
                    </>
                  )}

                  {/* No Check Yet State */}
                  {!asset.copyrightCheckStatus && (
                    <Alert className="bg-muted/30 border-muted">
                      <Shield className="h-4 w-4" />
                      <AlertDescription className="text-xs">
                        No copyright check has been run yet. Run a check to analyze this asset for potential copyright issues.
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>

              {/* Matched Sources (if any) */}
              {asset.copyrightCheckData?.matchedSources && asset.copyrightCheckData.matchedSources.length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Potential Matches</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {asset.copyrightCheckData.matchedSources.map((source: MatchedSource, index: number) => (
                        <div key={index} className="flex items-start justify-between p-2 rounded-lg border bg-muted/20 text-xs">
                          <div className="flex-1">
                            <p className="font-medium">{source.title}</p>
                            <p className="text-muted-foreground mt-0.5">{source.source}</p>
                          </div>
                          <Badge variant="outline" className="h-5 px-1.5 text-[10px]">
                            {source.similarity}%
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Detailed Quality Review Modules */}
              <div className="space-y-3 mt-6">
                <h3 className="text-sm font-semibold text-muted-foreground mb-2">Detailed Review</h3>
                
                {/* Expandable SEO Section */}
                <Collapsible>
                  <CollapsibleTrigger className="flex items-center justify-between w-full px-3 py-2.5 border rounded-md hover:bg-accent/30 transition-all duration-150 group">
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">SEO & Metadata</h3>
                    <ChevronDown className="h-3.5 w-3.5 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pt-2">
                    <Card className="mt-2 border-l-2 border-l-accent">
                      <CardContent className="pt-4 space-y-3">
                        {EDITABLE_FIELDS.filter(f => f.category === "seo").map(field => (
                          <InlineEditField
                            key={field.id}
                            field={field}
                            value={field.path.includes('.') 
                              ? field.path.split('.').reduce((obj: any, key) => obj?.[key], asset)
                              : asset[field.path as keyof typeof asset]
                            }
                            onSave={(newValue) => handleFieldSave(field.path, newValue)}
                          />
                        ))}
                      </CardContent>
                    </Card>
                  </CollapsibleContent>
                </Collapsible>
                
                {/* Copyright & Legal Section */}
                <Collapsible>
                  <CollapsibleTrigger className="flex items-center justify-between w-full px-3 py-2.5 border rounded-md hover:bg-accent/30 transition-all duration-150 group">
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Copyright & Legal</h3>
                    <ChevronDown className="h-3.5 w-3.5 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pt-2">
                    <Card className="mt-2 border-l-2 border-l-accent">
                      <CardContent className="pt-4 space-y-3">
                        {EDITABLE_FIELDS.filter(f => f.category === "copyright").map(field => (
                          <InlineEditField
                            key={field.id}
                            field={field}
                            value={field.path.includes('.') 
                              ? field.path.split('.').reduce((obj: any, key) => obj?.[key], asset)
                              : asset[field.path as keyof typeof asset]
                            }
                            onSave={(newValue) => handleFieldSave(field.path, newValue)}
                          />
                        ))}
                      </CardContent>
                    </Card>
                  </CollapsibleContent>
                </Collapsible>
                
                {/* Expandable Accessibility Section */}
                <Collapsible>
                  <CollapsibleTrigger className="flex items-center justify-between w-full px-3 py-2.5 border rounded-md hover:bg-accent/30 transition-all duration-150 group">
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Accessibility</h3>
                    <ChevronDown className="h-3.5 w-3.5 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pt-2">
                    <Card className="mt-2 border-l-2 border-l-accent">
                      <CardContent className="pt-4 space-y-3">
                        {EDITABLE_FIELDS.filter(f => f.category === "accessibility").map(field => (
                          <InlineEditField
                            key={field.id}
                            field={field}
                            value={field.path.includes('.') 
                              ? field.path.split('.').reduce((obj: any, key) => obj?.[key], asset)
                              : asset[field.path as keyof typeof asset]
                            }
                            onSave={(newValue) => handleFieldSave(field.path, newValue)}
                          />
                        ))}
                      </CardContent>
                    </Card>
                  </CollapsibleContent>
                </Collapsible>
                
                {/* Performance Section */}
                <Collapsible>
                  <CollapsibleTrigger className="flex items-center justify-between w-full px-3 py-2.5 border rounded-md hover:bg-accent/30 transition-all duration-150 group">
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Performance</h3>
                    <ChevronDown className="h-3.5 w-3.5 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pt-2">
                    <Card className="mt-2 border-l-2 border-l-accent">
                      <CardContent className="pt-4 space-y-3">
                        {EDITABLE_FIELDS.filter(f => f.category === "performance").map(field => (
                          <InlineEditField
                            key={field.id}
                            field={field}
                            value={field.path.includes('.') 
                              ? field.path.split('.').reduce((obj: any, key) => obj?.[key], asset)
                              : asset[field.path as keyof typeof asset]
                            }
                            onSave={(newValue) => handleFieldSave(field.path, newValue)}
                          />
                        ))}
                      </CardContent>
                    </Card>
                  </CollapsibleContent>
                </Collapsible>
                
                {/* Security Section */}
                <Collapsible>
                  <CollapsibleTrigger className="flex items-center justify-between w-full px-3 py-2.5 border rounded-md hover:bg-accent/30 transition-all duration-150 group">
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Security</h3>
                    <ChevronDown className="h-3.5 w-3.5 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pt-2">
                    <Card className="mt-2 border-l-2 border-l-accent">
                      <CardContent className="pt-4 space-y-3">
                        {EDITABLE_FIELDS.filter(f => f.category === "security").map(field => (
                          <InlineEditField
                            key={field.id}
                            field={field}
                            value={field.path.includes('.') 
                              ? field.path.split('.').reduce((obj: any, key) => obj?.[key], asset)
                              : asset[field.path as keyof typeof asset]
                            }
                            onSave={(newValue) => handleFieldSave(field.path, newValue)}
                          />
                        ))}
                      </CardContent>
                    </Card>
                  </CollapsibleContent>
                </Collapsible>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      ) : (
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "overview" | "quality" | "versions")}>
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
                value="quality"
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-foreground rounded-none px-2 pb-1.5 text-sm"
              >
                Quality
                {asset.copyrightCheckStatus === "completed" && (
                  <Badge variant="secondary" className="ml-1.5 h-3.5 px-1 text-[9px]">
                    Checked
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Overview Tab Content */}
          <TabsContent value="overview" className="mt-2">
            {/* Regular Asset - Two Column Grid */}
            <div className="grid lg:grid-cols-3 gap-3">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-3">
            {/* Basic Information Card - Inline Editable */}
            {nameField && descriptionField && (
              <Card>
                <CardContent className="pt-4 space-y-3">
                  <InlineEditField
                    field={nameField}
                    value={asset.name}
                    onSave={(newValue) => handleFieldSave("name", newValue)}
                    label="Title"
                  />
                  
                  {descriptionField && (
                    <InlineEditField
                      field={descriptionField}
                      value={asset.description}
                      onSave={(newValue) => handleFieldSave("description", newValue)}
                    />
                  )}
                </CardContent>
              </Card>
            )}
            
            {/* Media / Preview Image */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Media</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative aspect-[4/3] bg-muted rounded-lg overflow-hidden border">
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
            
            {/* File Properties Section */}
            <Collapsible>
              <CollapsibleTrigger className="flex items-center justify-between w-full px-3 py-2.5 border rounded-md hover:bg-accent/30 transition-all duration-150 group">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">File Properties</h3>
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-2">
                <Card className="mt-2 border-l-2 border-l-accent">
                  <CardContent className="pt-4 space-y-3">
                    {EDITABLE_FIELDS.filter(f => f.category === "files").map(field => (
                      <InlineEditField
                        key={field.id}
                        field={field}
                        value={asset[field.path as keyof typeof asset]}
                        onSave={(newValue) => handleFieldSave(field.path, newValue)}
                      />
                    ))}
                  </CardContent>
                </Card>
              </CollapsibleContent>
            </Collapsible>

            {/* AI Generation Section (for AI-generated assets) */}
            {isAIGenerated && (
              <Collapsible defaultOpen={true}>
                <CollapsibleTrigger className="flex items-center justify-between w-full px-3 py-2.5 border rounded-md hover:bg-accent/30 transition-all duration-150 group">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">AI Generation</h3>
                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-2">
                  <Card className="mt-2 border-l-2 border-l-purple-500">
                    <CardContent className="pt-4 space-y-3">
                      {EDITABLE_FIELDS.filter(f => f.category === "ai").map(field => (
                        <InlineEditField
                          key={field.id}
                          field={field}
                          value={field.path.includes('.') 
                            ? field.path.split('.').reduce((obj: any, key) => obj?.[key], asset)
                            : asset[field.path as keyof typeof asset]
                          }
                          onSave={(newValue) => handleFieldSave(field.path, newValue)}
                        />
                      ))}
                      
                      {/* Keep original PromptContent for full history */}
                      {asset.promptHistory && (
                        <>
                          <Separator />
                          <PromptContent history={asset.promptHistory} />
                        </>
                      )}
                    </CardContent>
                  </Card>
                </CollapsibleContent>
              </Collapsible>
            )}
          </div>

          {/* Right Column - Metadata Sidebar */}
          <div className="space-y-3">
            {/* Status Card - Shopify Style */}
            {statusField && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <InlineEditField
                    field={statusField}
                    value={asset.approvalStatus}
                    onSave={(newValue) => handleFieldSave("approvalStatus", newValue)}
                    showLabel={false}
                  />
                </CardContent>
              </Card>
            )}
            
            {/* Organization Card - Shopify Style */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Organization</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Brand */}
                {brandField && (
                  <InlineEditField
                    field={brandField}
                    value={displayBrandId}
                    onSave={(newValue) => handleFieldSave("brandId", newValue)}
                  />
                )}
                
                {/* Design Type */}
                {designTypeField && (
                  <InlineEditField
                    field={designTypeField}
                    value={displayDesignType}
                    onSave={(newValue) => handleFieldSave("designType", newValue)}
                  />
                )}
                
                {/* Tags */}
                {tagsField && asset && 'tags' in asset && (
                  <InlineEditField
                    field={tagsField}
                    value={asset.tags}
                    onSave={(newValue) => handleFieldSave("tags", newValue)}
                  />
                )}
              </CardContent>
            </Card>
            
            {/* Talent Rights Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Talent Rights (NILP)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {(() => {
                  const creatorIdsField = EDITABLE_FIELDS.find(f => f.id === "creatorIds")
                  return creatorIdsField && (
                    <InlineEditField
                      field={creatorIdsField}
                      value={asset.creatorIds || []}
                      onSave={(newValue) => handleFieldSave("creatorIds", newValue)}
                      label="Assign Talent"
                    />
                  )
                })()}
                
                {creditedCreators.length > 0 && (
                  <>
                    <Separator />
                    <div>
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
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
            
            {/* Metadata Card - Consolidated */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
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

            {/* Copyright Check - Summary */}
            {asset.copyrightCheckStatus && asset.copyrightCheckData && (
              <Card>
                <CardContent className="pt-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium text-muted-foreground">Copyright Status</p>
                    <Button 
                      variant="link" 
                      size="sm" 
                      className="h-auto p-0 text-xs"
                      onClick={() => setActiveTab("quality")}
                    >
                      View Details
                    </Button>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <ScoreBadge 
                      icon={Shield} 
                      score={asset.copyrightCheckData.overallScore} 
                      size="sm"
                    />
                    <span className="text-xs text-muted-foreground">
                      {asset.copyrightCheckData.riskBreakdown.riskLevel} risk
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}

          </div>
        </div>
          </TabsContent>

          {/* Quality Tab Content */}
          <TabsContent value="quality" className="mt-2">
            <div className="space-y-3">
              {/* Quality Score Dashboard - Ultra Compact */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">Quality Scores</CardTitle>
                    <div className="flex items-center gap-2">
                      {!asset.copyrightCheckStatus && (
                        <Button size="sm" className="h-7 text-xs" onClick={handleRunCheck} disabled={isRunningCheck}>
                          <Shield className="mr-1.5 h-3 w-3" />
                          {isRunningCheck ? "Checking..." : "Run Check (1 credit)"}
                        </Button>
                      )}
                      {asset.copyrightCheckStatus === "completed" && (
                        <Button variant="outline" size="sm" className="h-7 text-xs" onClick={handleRerunCheck} disabled={isRunningCheck}>
                          <RotateCcw className="mr-1.5 h-3 w-3" />
                          {isRunningCheck ? "Checking..." : "Re-run"}
                        </Button>
                      )}
                      <Button variant="outline" size="sm" className="h-7 text-xs" asChild>
                        <Link href={`/creative/assets/${assetId}/review`}>
                          <FileBarChart className="mr-1.5 h-3 w-3" />
                          Full Review
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Score Badges Row - Compact */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <ScoreBadge 
                      icon={Shield} 
                      score={asset.reviewData?.copyright?.data ? (100 - asset.reviewData.copyright.data.similarityScore) : undefined}
                      label="Copyright"
                      lastChecked={asset.copyrightCheckData?.checkedAt}
                      size="sm"
                    />
                    <ScoreBadge 
                      icon={Eye} 
                      score={asset.reviewData?.accessibility?.data?.score} 
                      label="Accessibility"
                      size="sm"
                    />
                    <ScoreBadge 
                      icon={Zap} 
                      score={asset.reviewData?.performance?.data?.score} 
                      label="Performance"
                      size="sm"
                    />
                    <ScoreBadge 
                      icon={Palette} 
                      score={asset.reviewData?.seo?.data?.score} 
                      label="SEO"
                      size="sm"
                    />
                    <ScoreBadge 
                      icon={ShieldCheck} 
                      score={asset.reviewData?.security?.data?.score} 
                      label="Security"
                      size="sm"
                    />
                  </div>

                  {/* Copyright Check Details */}
                  {asset.copyrightCheckData && (
                    <>
                      <Separator />
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Similarity</span>
                          <Badge
                            variant={asset.copyrightCheckData.similarityScore < 30 ? "default" : "destructive"}
                            className={cn(
                              "h-5 px-2 text-xs",
                              asset.copyrightCheckData.similarityScore < 30 && "bg-green-500 hover:bg-green-600"
                            )}
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
                            className="h-5 px-2 text-xs"
                          >
                            {asset.copyrightCheckData.riskBreakdown.riskLevel.toUpperCase()}
                          </Badge>
                        </div>
                        
                        {asset.copyrightCheckData.matchedSources.length > 0 && (
                          <div className="text-xs text-muted-foreground">
                            {asset.copyrightCheckData.matchedSources.length} potential {asset.copyrightCheckData.matchedSources.length === 1 ? 'match' : 'matches'} found
                          </div>
                        )}
                        
                        {asset.copyrightCheckData.checkedAt && (
                          <div className="text-xs text-muted-foreground">
                            Last checked {formatDateLong(asset.copyrightCheckData.checkedAt)}
                          </div>
                        )}
                      </div>
                    </>
                  )}

                  {/* No Check Yet State */}
                  {!asset.copyrightCheckStatus && (
                    <Alert className="bg-muted/30 border-muted">
                      <Shield className="h-4 w-4" />
                      <AlertDescription className="text-xs">
                        No copyright check has been run yet. Run a check to analyze this asset for potential copyright issues.
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>

              {/* Matched Sources (if any) */}
              {asset.copyrightCheckData?.matchedSources && asset.copyrightCheckData.matchedSources.length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Potential Matches</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {asset.copyrightCheckData.matchedSources.map((source: MatchedSource, index: number) => (
                        <div key={index} className="flex items-start justify-between p-2 rounded-lg border bg-muted/20 text-xs">
                          <div className="flex-1">
                            <p className="font-medium">{source.title}</p>
                            <p className="text-muted-foreground mt-0.5">{source.source}</p>
                          </div>
                          <Badge variant="outline" className="h-5 px-1.5 text-[10px]">
                            {source.similarity}%
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Detailed Quality Review Modules */}
              <div className="space-y-3 mt-6">
                <h3 className="text-sm font-semibold text-muted-foreground mb-2">Detailed Review</h3>
                
                {/* Expandable SEO Section */}
                <Collapsible>
                  <CollapsibleTrigger className="flex items-center justify-between w-full px-3 py-2.5 border rounded-md hover:bg-accent/30 transition-all duration-150 group">
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">SEO & Metadata</h3>
                    <ChevronDown className="h-3.5 w-3.5 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pt-2">
                    <Card className="mt-2 border-l-2 border-l-accent">
                      <CardContent className="pt-4 space-y-3">
                        {EDITABLE_FIELDS.filter(f => f.category === "seo").map(field => (
                          <InlineEditField
                            key={field.id}
                            field={field}
                            value={field.path.includes('.') 
                              ? field.path.split('.').reduce((obj: any, key) => obj?.[key], asset)
                              : asset[field.path as keyof typeof asset]
                            }
                            onSave={(newValue) => handleFieldSave(field.path, newValue)}
                          />
                        ))}
                      </CardContent>
                    </Card>
                  </CollapsibleContent>
                </Collapsible>
                
                {/* Copyright & Legal Section */}
                <Collapsible>
                  <CollapsibleTrigger className="flex items-center justify-between w-full px-3 py-2.5 border rounded-md hover:bg-accent/30 transition-all duration-150 group">
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Copyright & Legal</h3>
                    <ChevronDown className="h-3.5 w-3.5 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pt-2">
                    <Card className="mt-2 border-l-2 border-l-accent">
                      <CardContent className="pt-4 space-y-3">
                        {EDITABLE_FIELDS.filter(f => f.category === "copyright").map(field => (
                          <InlineEditField
                            key={field.id}
                            field={field}
                            value={field.path.includes('.') 
                              ? field.path.split('.').reduce((obj: any, key) => obj?.[key], asset)
                              : asset[field.path as keyof typeof asset]
                            }
                            onSave={(newValue) => handleFieldSave(field.path, newValue)}
                          />
                        ))}
                      </CardContent>
                    </Card>
                  </CollapsibleContent>
                </Collapsible>
                
                {/* Expandable Accessibility Section */}
                <Collapsible>
                  <CollapsibleTrigger className="flex items-center justify-between w-full px-3 py-2.5 border rounded-md hover:bg-accent/30 transition-all duration-150 group">
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Accessibility</h3>
                    <ChevronDown className="h-3.5 w-3.5 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pt-2">
                    <Card className="mt-2 border-l-2 border-l-accent">
                      <CardContent className="pt-4 space-y-3">
                        {EDITABLE_FIELDS.filter(f => f.category === "accessibility").map(field => (
                          <InlineEditField
                            key={field.id}
                            field={field}
                            value={field.path.includes('.') 
                              ? field.path.split('.').reduce((obj: any, key) => obj?.[key], asset)
                              : asset[field.path as keyof typeof asset]
                            }
                            onSave={(newValue) => handleFieldSave(field.path, newValue)}
                          />
                        ))}
                      </CardContent>
                    </Card>
                  </CollapsibleContent>
                </Collapsible>
                
                {/* Performance Section */}
                <Collapsible>
                  <CollapsibleTrigger className="flex items-center justify-between w-full px-3 py-2.5 border rounded-md hover:bg-accent/30 transition-all duration-150 group">
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Performance</h3>
                    <ChevronDown className="h-3.5 w-3.5 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pt-2">
                    <Card className="mt-2 border-l-2 border-l-accent">
                      <CardContent className="pt-4 space-y-3">
                        {EDITABLE_FIELDS.filter(f => f.category === "performance").map(field => (
                          <InlineEditField
                            key={field.id}
                            field={field}
                            value={field.path.includes('.') 
                              ? field.path.split('.').reduce((obj: any, key) => obj?.[key], asset)
                              : asset[field.path as keyof typeof asset]
                            }
                            onSave={(newValue) => handleFieldSave(field.path, newValue)}
                          />
                        ))}
                      </CardContent>
                    </Card>
                  </CollapsibleContent>
                </Collapsible>
                
                {/* Security Section */}
                <Collapsible>
                  <CollapsibleTrigger className="flex items-center justify-between w-full px-3 py-2.5 border rounded-md hover:bg-accent/30 transition-all duration-150 group">
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Security</h3>
                    <ChevronDown className="h-3.5 w-3.5 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pt-2">
                    <Card className="mt-2 border-l-2 border-l-accent">
                      <CardContent className="pt-4 space-y-3">
                        {EDITABLE_FIELDS.filter(f => f.category === "security").map(field => (
                          <InlineEditField
                            key={field.id}
                            field={field}
                            value={field.path.includes('.') 
                              ? field.path.split('.').reduce((obj: any, key) => obj?.[key], asset)
                              : asset[field.path as keyof typeof asset]
                            }
                            onSave={(newValue) => handleFieldSave(field.path, newValue)}
                          />
                        ))}
                      </CardContent>
                    </Card>
                  </CollapsibleContent>
                </Collapsible>
              </div>
            </div>
          </TabsContent>
        </Tabs>
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
