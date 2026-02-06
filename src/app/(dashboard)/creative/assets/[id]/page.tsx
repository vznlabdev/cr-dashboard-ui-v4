"use client"

import { useState, useMemo, useCallback, useEffect, useRef } from "react"
import { useRouter, useParams } from "next/navigation"
import { mockAssets, mockVersionGroups, getVersionGroupById, mockBrands } from "@/lib/mock-data/creative"
import { formatFileSize, formatDateLong } from "@/lib/format-utils"
import { useAssetAutoSave } from "@/lib/asset-auto-save"
import { PageContainer } from "@/components/layout/PageContainer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
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
  ShieldAlert,
  Database,
  FileText,
  Settings,
  ChevronRight,
  Check,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { PromptContent } from "@/components/creative/PromptContent"
import { InlineEditField, ScoreBadge } from "@/components/creative"
import { useCreators } from "@/contexts/creators-context"
import { CreatorAvatarBadge } from "@/components/creators"
import { ASSET_CONTENT_TYPE_CONFIG, DESIGN_TYPE_CONFIG } from "@/types/creative"
import { EDITABLE_FIELDS } from "@/config/bulk-edit-fields"
import { formatDistanceToNow, format } from "date-fns"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import { VersionHistoryPanel, SubmitVersionDialog, VersionComments, VersionStatusBadge, AIComplianceWorkflow } from "@/components/assets"
import { VersionSelector } from "@/components/assets/VersionSelector"
import type { AssetVersion, MatchedSource, AssetReviewData } from "@/types/creative"
import { useCopyrightCredits } from "@/lib/contexts/copyright-credits-context"
import { LinearBreadcrumb } from "@/components/navigation/LinearBreadcrumb"

export default function AssetDetailPage() {
  const router = useRouter()
  const params = useParams()
  const assetId = params.id as string
  const versionNumber = params.versionNumber ? parseInt(params.versionNumber as string) : null
  
  // Check if this is a version group first
  const versionGroup = getVersionGroupById(assetId)
  
  // Track if we're redirecting to prevent hydration mismatch
  const [isRedirecting, setIsRedirecting] = useState(false)
  
  // Redirect logic: if version group and no version number in URL, redirect to latest version
  useEffect(() => {
    if (!versionGroup || versionNumber) return

    setIsRedirecting(true)
    router.replace(`/creative/assets/${assetId}/v/${versionGroup.currentVersionNumber}`)

    // If redirect fails or is cancelled, reset after timeout so user doesn't see a blank page
    const fallbackTimer = setTimeout(() => {
      setIsRedirecting(false)
    }, 3000)
    return () => clearTimeout(fallbackTimer)
  }, [versionGroup, versionNumber, assetId, router])
  
  // Determine which version to display
  const selectedVersionId = versionGroup && versionNumber
    ? versionGroup.versions.find(v => v.versionNumber === versionNumber)?.id || versionGroup.currentVersionId
    : versionGroup?.currentVersionId || ""
  
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<"overview" | "ai-workflow" | "quality">("overview")
  const [isRunningCheck, setIsRunningCheck] = useState(false)
  const { canRunCheck, useCredit, getTotalAvailable } = useCopyrightCredits()
  
  // Local asset state for optimistic updates
  const [localAsset, setLocalAsset] = useState<any>(null)
  const topRef = useRef<HTMLDivElement>(null)

  // Scroll main content to top when entering page or changing asset (fixes load/back scroll position)
  useEffect(() => {
    const scrollContainer = document.getElementById("main-scroll-container")
    const scrollToTop = () => {
      if (scrollContainer) scrollContainer.scrollTop = 0
      topRef.current?.scrollIntoView({ behavior: "auto", block: "start" })
    }
    scrollToTop()
    const raf = requestAnimationFrame(scrollToTop)
    const t1 = setTimeout(scrollToTop, 0)
    const t2 = setTimeout(scrollToTop, 50)
    const t3 = setTimeout(scrollToTop, 100)
    const t4 = setTimeout(scrollToTop, 150)
    return () => {
      cancelAnimationFrame(raf)
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
      clearTimeout(t4)
    }
  }, [assetId, versionNumber])
  
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
          score: copyrightScore,
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

  // Don't render during redirect to prevent hydration mismatch
  if (isRedirecting) {
    return null
  }

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
  
  // When contentType is edited away from ai_generated, leave AI Workflow tab to avoid blank pane
  useEffect(() => {
    if (!isAIGenerated && activeTab === "ai-workflow") {
      setActiveTab("overview")
    }
  }, [isAIGenerated, activeTab])
  
  // Get editable field configurations
  const nameField = useMemo(() => EDITABLE_FIELDS.find(f => f.id === "name"), [])
  const descriptionField = useMemo(() => EDITABLE_FIELDS.find(f => f.id === "description"), [])
  const tagsField = useMemo(() => EDITABLE_FIELDS.find(f => f.id === "tags"), [])
  const intendedUsesField = useMemo(() => EDITABLE_FIELDS.find(f => f.id === "intendedUses"), [])
  const statusField = useMemo(() => EDITABLE_FIELDS.find(f => f.id === "approvalStatus"), [])
  const brandField = useMemo(() => {
    const base = EDITABLE_FIELDS.find(f => f.id === "brandId")
    if (!base) return undefined
    return {
      ...base,
      options: mockBrands.map((brand) => ({ value: brand.id, label: brand.name })),
    }
  }, [])
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
    <PageContainer className="space-y-0 animate-fade-in">
      <div ref={topRef} className="h-0 overflow-hidden pointer-events-none" aria-hidden />
      {/* Breadcrumb */}
      <LinearBreadcrumb
        backHref="/creative/assets"
        segments={[
          { label: "Assets", href: "/creative/assets" },
          versionGroup && versionNumber 
            ? { label: `${versionGroup.name} (v${versionNumber})` }
            : { label: asset.name }
        ]}
        className="mb-3"
      />
      
      {/* Header Section with Save Status */}
      <div className="flex items-start justify-between">
        <div className="space-y-0.5">
          {/* Title with Version Selector */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {versionGroup ? (
              <VersionSelector
                versionGroup={versionGroup}
                currentVersionId={selectedVersionId}
                onVersionChange={(versionId) => {
                  const version = versionGroup.versions.find(v => v.id === versionId)
                  if (version) {
                    router.push(`/creative/assets/${assetId}/v/${version.versionNumber}`)
                  }
                }}
              />
            ) : (
              <h1 className="text-xl font-semibold">{asset.name}</h1>
            )}
            {/* Status badge - color-coded at top for quick scan */}
            {(() => {
              const status: "draft" | "pending" | "approved" | "rejected" = (asset.approvalStatus ?? "draft") as "draft" | "pending" | "approved" | "rejected"
              const statusConfig = {
                draft: { label: "Draft", className: "bg-muted text-muted-foreground border-muted-foreground/30" },
                pending: { label: "Pending", className: "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/50 dark:text-amber-200 dark:border-amber-800" },
                approved: { label: "Approved", className: "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-200 dark:border-emerald-800" },
                rejected: { label: "Rejected", className: "bg-red-50 text-red-800 border-red-200 dark:bg-red-950/50 dark:text-red-200 dark:border-red-800" },
              } as const
              const config = statusConfig[status] ?? statusConfig.draft
              return (
                <Badge variant="outline" className={cn("font-medium text-xs px-2 py-0.5 capitalize", config.className)}>
                  {config.label}
                </Badge>
              )
            })()}
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

          {/* Inline Stats - status dot + brand, type, size, etc. */}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
            {/* Status dot (color-coded) */}
            {(() => {
              const status: "draft" | "pending" | "approved" | "rejected" = (asset.approvalStatus ?? "draft") as "draft" | "pending" | "approved" | "rejected"
              const dotClass = {
                draft: "bg-muted-foreground/60",
                pending: "bg-amber-500",
                approved: "bg-emerald-500",
                rejected: "bg-red-500",
              }[status] ?? "bg-muted-foreground/60"
              return <div className={cn("w-2 h-2 rounded-full shrink-0", dotClass)} title={status} aria-hidden />
            })()}
            {displayBrandId && (
              <Link 
                href={`/creative/brands/${displayBrandId}`}
                className="hover:text-foreground transition-colors flex items-center gap-1"
              >
                {displayBrandColor && (
                  <div
                    className="w-1.5 h-1.5 rounded-full shrink-0"
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
          <Button size="sm" asChild>
            <a href={asset.fileUrl} download>
              <Download className="mr-2 h-4 w-4" />
              Download
            </a>
          </Button>

          {/* Secondary actions in dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
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

      {/* Horizontal Properties Bar - Ultra Compact */}
      <div className="border rounded-lg p-3 bg-card mt-4">
        <div className="flex items-center gap-6 flex-wrap">
          {/* File Type */}
          <div className="flex items-center gap-2">
            <FileImage className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Type:</span>
            <Badge variant="outline">{asset.fileType.toUpperCase()}</Badge>
          </div>
          
          {/* Content Type (AI/Original) */}
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Content:</span>
            <Badge variant={asset.contentType === "ai_generated" ? "default" : "outline"}>
              {asset.contentType === "ai_generated" ? "AI Generated" : "Original"}
            </Badge>
          </div>
          
          {/* Intended Uses */}
          {asset && 'intendedUses' in asset && asset.intendedUses && (asset.intendedUses as string[]).length > 0 && (
            <div className="flex items-center gap-2">
              <ListTodo className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Uses:</span>
              <div className="flex items-center gap-1 flex-wrap">
                {(asset.intendedUses as string[]).map((use) => (
                  <Badge key={use} variant="secondary" className="text-xs px-2 py-0.5">
                    {use}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          {/* Uploaded */}
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Uploaded:</span>
            <span className="text-sm">{formatDateLong(displayCreatedAt)}</span>
          </div>
        </div>
      </div>

      {/* Tabs - tight under properties bar so image is above fold */}
      {versionGroup ? (
        <div className="mt-3">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "overview" | "ai-workflow" | "quality")}>
            {/* Tab strip - compact Linear style */}
            <div className="border-b border-border">
              <TabsList className="h-auto bg-transparent p-0 gap-0 border-0">
                <TabsTrigger 
                  value="overview"
                  className="rounded-none border-0 border-b-2 border-transparent bg-transparent shadow-none px-2.5 py-1.5 text-xs text-muted-foreground data-[state=active]:border-0 data-[state=active]:border-b-2 data-[state=active]:border-b-primary data-[state=active]:text-foreground data-[state=active]:font-medium"
                >
                  Overview
                </TabsTrigger>
                <TabsTrigger 
                  value="quality"
                  className="rounded-none border-0 border-b-2 border-transparent bg-transparent shadow-none px-2.5 py-1.5 text-xs text-muted-foreground data-[state=active]:border-0 data-[state=active]:border-b-2 data-[state=active]:border-b-primary data-[state=active]:text-foreground data-[state=active]:font-medium"
                >
                  Quality
                  {asset.copyrightCheckStatus === "completed" && (
                    <Badge variant="secondary" className="ml-1 h-3 px-1 text-[9px]">
                      Checked
                    </Badge>
                  )}
                </TabsTrigger>
                {isAIGenerated && (
                  <TabsTrigger 
                    value="ai-workflow"
                    className="rounded-none border-0 border-b-2 border-transparent bg-transparent shadow-none px-2.5 py-1.5 text-xs text-muted-foreground data-[state=active]:border-0 data-[state=active]:border-b-2 data-[state=active]:border-b-primary data-[state=active]:text-foreground data-[state=active]:font-medium"
                  >
                    AI Workflow
                  </TabsTrigger>
                )}
              </TabsList>
            </div>

          {/* Overview Tab Content - minimal gap so image above fold */}
          <TabsContent value="overview" className="mt-1">
            <div className="grid lg:grid-cols-3 gap-3">
              {/* Left Column - Main Content */}
              <div className="lg:col-span-2 space-y-2">
                {/* Media first - above the fold */}
                <div className="rounded-md border border-border/80 bg-muted/30 overflow-hidden">
                  <div className="relative aspect-[4/3] bg-muted">
                    {asset && 'fileType' in asset && asset.fileType === "image" && asset.thumbnailUrl ? (
                      <Image
                        src={asset.thumbnailUrl}
                        alt={asset.name}
                        fill
                        className="object-contain"
                      />
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <FileImage className="h-12 w-12 text-muted-foreground/50 mb-1" />
                        <p className="text-xs text-muted-foreground">Preview not available</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Title & Description - below image */}
                {nameField && descriptionField && (
                  <div className="rounded-md border border-border/80 bg-card px-3 py-2 space-y-1.5">
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
                  </div>
                )}

                {/* File Properties Section */}
                <Collapsible>
                  <CollapsibleTrigger className="flex items-center justify-between w-full px-2.5 py-2 border border-border/80 rounded-md hover:bg-accent/30 transition-colors group">
                    <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">File Properties</h3>
                    <ChevronDown className="h-3 w-3 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pt-1.5">
                    <Card className="mt-1.5 border-l-2 border-l-accent">
                      <CardContent className="pt-3 pb-3 space-y-2">
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
                
                {/* Version Comments Section (version groups only) */}
                {versionGroup && asset && 'comments' in asset && (
                  <Collapsible defaultOpen={false}>
                    <CollapsibleTrigger className="flex items-center justify-between w-full px-2.5 py-2 border border-border/80 rounded-md hover:bg-accent/30 transition-colors group">
                      <div className="flex items-center gap-2">
                        <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                          Comments & Feedback
                        </h3>
                        <Badge variant="secondary" className="h-4 px-1.5 text-[10px]">
                          {asset.commentsCount || 0}
                        </Badge>
                      </div>
                      <ChevronDown className="h-3 w-3 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pt-2">
                      <Card className="mt-2 border-l-2 border-l-blue-500">
                        <CardContent className="pt-4">
                          <VersionComments
                            comments={asset.comments}
                            onAddComment={async (content) => {
                              toast.success("Comment added")
                            }}
                          />
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
              <div className="space-y-4 sticky top-4">
                {/* Single Properties Card */}
                <div className="border border-border/80 rounded-md bg-card">
                  {/* Header */}
                  <div className="px-3 py-2 border-b border-border flex items-center justify-between">
                    <h2 className="text-sm font-semibold">Properties</h2>
                  </div>
                  
                  {/* Content - all sections inside */}
                  <div className="divide-y divide-border">
                    {/* Status Section */}
                    {statusField && (
                      <div className="px-3 py-2 space-y-1.5">
                        <Label className="text-xs text-muted-foreground">Status</Label>
                        <Select 
                          value={asset.approvalStatus} 
                          onValueChange={(value) => handleFieldSave("approvalStatus", value)}
                        >
                          <SelectTrigger className="h-9">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {statusField.options?.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                    
                    {/* Organization Section */}
                    <div className="px-3 py-2 space-y-2">
                      <Label className="text-xs text-muted-foreground font-medium">Organization</Label>
                      
                      {/* Brand */}
                      {brandField && (
                        <div className="space-y-1.5">
                          <Label className="text-xs text-muted-foreground">{brandField.label}</Label>
                          <Select 
                            value={displayBrandId} 
                            onValueChange={(value) => handleFieldSave("brandId", value)}
                          >
                            <SelectTrigger className="h-9">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {brandField.options?.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                      
                      {/* Design Type */}
                      {designTypeField && (
                        <div className="space-y-1.5">
                          <Label className="text-xs text-muted-foreground">{designTypeField.label}</Label>
                          <Select 
                            value={displayDesignType} 
                            onValueChange={(value) => handleFieldSave("designType", value)}
                          >
                            <SelectTrigger className="h-9">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {designTypeField.options?.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                      
                      {/* Tags */}
                      {tagsField && asset && 'tags' in asset && (
                        <div className="space-y-1.5">
                          <InlineEditField
                            field={tagsField}
                            value={asset.tags}
                            onSave={(newValue) => handleFieldSave("tags", newValue)}
                          />
                        </div>
                      )}
                      
                      {/* Intended Uses */}
                      {intendedUsesField && (
                        <div className="space-y-1.5">
                          <InlineEditField
                            field={intendedUsesField}
                            value={asset.intendedUses || []}
                            onSave={(newValue) => handleFieldSave("intendedUses", newValue)}
                          />
                        </div>
                      )}
                    </div>
                    
                    {/* File Info Section */}
                    <div className="px-3 py-2 space-y-1.5">
                      <Label className="text-xs text-muted-foreground font-medium">File Information</Label>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Size</span>
                          <span className="text-sm font-medium">{formatFileSize(asset.fileSize)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Type</span>
                          <span className="text-sm font-medium">{asset.mimeType}</span>
                        </div>
                        {asset.dimensions && (
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Dimensions</span>
                            <span className="text-sm font-medium">
                              {asset.dimensions.width} × {asset.dimensions.height}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Details Section */}
                    <div className="px-3 py-2 space-y-2">
                      <Label className="text-xs text-muted-foreground font-medium">Details</Label>
                      
                      {/* Uploaded By */}
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Uploaded By</p>
                        <p className="text-sm font-medium">{asset.uploadedByName}</p>
                      </div>

                      {/* Date */}
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Date</p>
                        <p className="text-sm font-medium">{formatDateLong(displayCreatedAt)}</p>
                      </div>
                      
                      {/* Task */}
                      {asset.ticketId && asset.ticketTitle && (
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">From Task</p>
                          <Link href={`/tasks`} className="text-sm font-medium hover:underline">
                            {asset.ticketTitle}
                          </Link>
                        </div>
                      )}
                    </div>
                    
                    {/* Talent Rights Section */}
                    <div className="px-3 py-2 space-y-2">
                      <Label className="text-xs text-muted-foreground font-medium">Talent Rights (NILP)</Label>
                      
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
                        <div className="space-y-2 mt-3">
                          <p className="text-xs font-medium text-muted-foreground">Credited Creators</p>
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
                      )}
                    </div>
                    
                    {/* Copyright Status Section */}
                    {asset.copyrightCheckStatus && asset.copyrightCheckData && (
                      <div className="px-3 py-2 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <Label className="text-xs text-muted-foreground font-medium">Copyright Status</Label>
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
                            score={asset.reviewData?.copyright?.data?.score ?? (asset.reviewData?.copyright?.data ? (100 - asset.reviewData.copyright.data.similarityScore) : undefined)} 
                            size="sm"
                          />
                          <span className="text-xs text-muted-foreground">
                            {asset.copyrightCheckData.riskBreakdown.riskLevel} risk
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
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
                        <Button size="sm" onClick={handleRunCheck} disabled={isRunningCheck}>
                          <Shield className="mr-2 h-4 w-4" />
                          {isRunningCheck ? "Checking..." : "Run Check (1 credit)"}
                        </Button>
                      )}
                      {asset.copyrightCheckStatus === "completed" && (
                        <Button variant="outline" size="sm" onClick={handleRerunCheck} disabled={isRunningCheck}>
                          <RotateCcw className="mr-2 h-4 w-4" />
                          {isRunningCheck ? "Checking..." : "Re-run"}
                        </Button>
                      )}
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/creative/assets/${assetId}/review`}>
                          <FileBarChart className="mr-2 h-4 w-4" />
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
                      score={asset.reviewData?.copyright?.data?.score ?? (asset.reviewData?.copyright?.data ? (100 - asset.reviewData.copyright.data.similarityScore) : undefined)}
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

          {/* AI Workflow Tab Content */}
          {isAIGenerated && (
            <TabsContent value="ai-workflow" className="mt-2">
              <div className="space-y-3">
                {/* Generation Details - Compact Grid */}
                <div className="grid md:grid-cols-2 gap-3">
                  {/* Prompt Card */}
                  {asset.promptHistory?.messages && (
                    <PromptContent history={asset.promptHistory} />
                  )}

                  {/* Technical Details Card */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Technical Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
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
                    </CardContent>
                  </Card>
                </div>

                {/* Compliance Workflow - Linear Progress */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Compliance Workflow</CardTitle>
                    <CardDescription>7-step AI asset compliance tracking</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <AIComplianceWorkflow 
                      assetId={asset.id}
                      copyrightCheckStatus={asset.copyrightCheckStatus}
                    />
                  </CardContent>
                </Card>

                {/* Copyright & Legal Status */}
                {asset.copyrightCheckData && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Copyright & Legal</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {/* Compact status indicators */}
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Risk Level</span>
                        <Badge variant={asset.copyrightCheckData.riskBreakdown.riskLevel === "low" ? "default" : "destructive"}>
                          {asset.copyrightCheckData.riskBreakdown.riskLevel}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Similarity</span>
                        <span className="text-sm font-medium">{asset.copyrightCheckData.similarityScore}%</span>
                      </div>
                      {asset.copyrightCheckData.matchedSources && asset.copyrightCheckData.matchedSources.length > 0 && (
                        <div className="pt-2">
                          <Link 
                            href="#"
                            onClick={(e) => {
                              e.preventDefault()
                              setActiveTab("quality")
                            }}
                            className="text-xs text-primary hover:underline flex items-center gap-1"
                          >
                            View full copyright report
                            <ChevronRight className="h-3 w-3" />
                          </Link>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
          )}

          </Tabs>
        </div>
      ) : (
        <div className="mt-3">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "overview" | "ai-workflow" | "quality")}>
            <div className="border-b border-border">
              <TabsList className="h-auto bg-transparent p-0 gap-0 border-0">
                <TabsTrigger 
                  value="overview"
                  className="rounded-none border-0 border-b-2 border-transparent bg-transparent shadow-none px-2.5 py-1.5 text-xs text-muted-foreground data-[state=active]:border-0 data-[state=active]:border-b-2 data-[state=active]:border-b-primary data-[state=active]:text-foreground data-[state=active]:font-medium"
                >
                  Overview
                </TabsTrigger>
                <TabsTrigger 
                  value="quality"
                  className="rounded-none border-0 border-b-2 border-transparent bg-transparent shadow-none px-2.5 py-1.5 text-xs text-muted-foreground data-[state=active]:border-0 data-[state=active]:border-b-2 data-[state=active]:border-b-primary data-[state=active]:text-foreground data-[state=active]:font-medium"
                >
                  Quality
                  {asset.copyrightCheckStatus === "completed" && (
                    <Badge variant="secondary" className="ml-1 h-3 px-1 text-[9px]">
                      Checked
                    </Badge>
                  )}
                </TabsTrigger>
                {isAIGenerated && (
                  <TabsTrigger 
                    value="ai-workflow"
                    className="rounded-none border-0 border-b-2 border-transparent bg-transparent shadow-none px-2.5 py-1.5 text-xs text-muted-foreground data-[state=active]:border-0 data-[state=active]:border-b-2 data-[state=active]:border-b-primary data-[state=active]:text-foreground data-[state=active]:font-medium"
                  >
                    AI Workflow
                  </TabsTrigger>
                )}
              </TabsList>
            </div>

          {/* Overview Tab Content - minimal gap so image above fold */}
          <TabsContent value="overview" className="mt-1">
            <div className="grid lg:grid-cols-3 gap-3">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-2">
            {/* Media first - above the fold */}
            <div className="rounded-md border border-border/80 bg-muted/30 overflow-hidden">
              <div className="relative aspect-[4/3] bg-muted">
                {asset && 'fileType' in asset && asset.fileType === "image" && asset.thumbnailUrl ? (
                  <Image
                    src={asset.thumbnailUrl}
                    alt={asset.name}
                    fill
                    className="object-contain"
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <FileImage className="h-12 w-12 text-muted-foreground/50 mb-1" />
                    <p className="text-xs text-muted-foreground">Preview not available</p>
                  </div>
                )}
              </div>
            </div>

            {/* Title & Description - below image */}
            {nameField && descriptionField && (
              <div className="rounded-md border border-border/80 bg-card px-3 py-2 space-y-1.5">
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
              </div>
            )}

            {/* File Properties Section */}
            <Collapsible>
              <CollapsibleTrigger className="flex items-center justify-between w-full px-2.5 py-2 border border-border/80 rounded-md hover:bg-accent/30 transition-colors group">
                <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">File Properties</h3>
                <ChevronDown className="h-3 w-3 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-1.5">
                <Card className="mt-1.5 border-l-2 border-l-accent">
                  <CardContent className="pt-3 pb-3 space-y-2">
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
          </div>

          {/* Right Column - Metadata Sidebar */}
          <div className="space-y-4 sticky top-4">
            {/* Single Properties Card */}
            <div className="border border-border/80 rounded-md bg-card">
              {/* Header */}
              <div className="px-3 py-2 border-b border-border flex items-center justify-between">
                <h2 className="text-sm font-semibold">Properties</h2>
              </div>
              
              {/* Content - all sections inside */}
              <div className="divide-y divide-border">
                {/* Status Section */}
                {statusField && (
                  <div className="px-3 py-2 space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Status</Label>
                    <InlineEditField
                      field={statusField}
                      value={asset.approvalStatus}
                      onSave={(newValue) => handleFieldSave("approvalStatus", newValue)}
                      showLabel={false}
                    />
                  </div>
                )}
                
                {/* Organization Section */}
                <div className="px-3 py-2 space-y-2">
                  <Label className="text-xs text-muted-foreground font-medium">Organization</Label>
                  
                  {/* Brand */}
                  {brandField && (
                    <div className="space-y-1.5">
                      <InlineEditField
                        field={brandField}
                        value={displayBrandId}
                        onSave={(newValue) => handleFieldSave("brandId", newValue)}
                      />
                    </div>
                  )}
                  
                  {/* Design Type */}
                  {designTypeField && (
                    <div className="space-y-1.5">
                      <InlineEditField
                        field={designTypeField}
                        value={displayDesignType}
                        onSave={(newValue) => handleFieldSave("designType", newValue)}
                      />
                    </div>
                  )}
                  
                  {/* Tags */}
                  {tagsField && asset && 'tags' in asset && (
                    <div className="space-y-1.5">
                      <InlineEditField
                        field={tagsField}
                        value={asset.tags}
                        onSave={(newValue) => handleFieldSave("tags", newValue)}
                      />
                    </div>
                  )}
                  
                  {/* Intended Uses */}
                  {intendedUsesField && (
                    <div className="space-y-1.5">
                      <InlineEditField
                        field={intendedUsesField}
                        value={asset.intendedUses || []}
                        onSave={(newValue) => handleFieldSave("intendedUses", newValue)}
                      />
                    </div>
                  )}
                </div>
                
                {/* File Info Section */}
                <div className="px-3 py-2 space-y-1.5">
                  <Label className="text-xs text-muted-foreground font-medium">File Information</Label>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Size</span>
                      <span className="text-sm font-medium">{formatFileSize(asset.fileSize)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Type</span>
                      <span className="text-sm font-medium">{asset.mimeType}</span>
                    </div>
                    {asset.dimensions && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Dimensions</span>
                        <span className="text-sm font-medium">
                          {asset.dimensions.width} × {asset.dimensions.height}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Details Section */}
                <div className="px-3 py-2 space-y-2">
                  <Label className="text-xs text-muted-foreground font-medium">Details</Label>
                  
                  {/* Uploaded By */}
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Uploaded By</p>
                    <p className="text-sm font-medium">{asset.uploadedByName}</p>
                  </div>

                  {/* Date */}
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Date</p>
                    <p className="text-sm font-medium">{formatDateLong(displayCreatedAt)}</p>
                  </div>
                  
                  {/* Task */}
                  {asset.ticketId && asset.ticketTitle && (
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">From Task</p>
                      <Link href={`/tasks`} className="text-sm font-medium hover:underline">
                        {asset.ticketTitle}
                      </Link>
                    </div>
                  )}
                </div>
                
                {/* Talent Rights Section */}
                <div className="px-3 py-2 space-y-2">
                  <Label className="text-xs text-muted-foreground font-medium">Talent Rights (NILP)</Label>
                  
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
                    <div className="space-y-2 mt-3">
                      <p className="text-xs font-medium text-muted-foreground">Credited Creators</p>
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
                  )}
                </div>
                
                {/* Copyright Status Section */}
                {asset.copyrightCheckStatus && asset.copyrightCheckData && (
                  <div className="px-3 py-2 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs text-muted-foreground font-medium">Copyright Status</Label>
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
                        score={asset.reviewData?.copyright?.data?.score ?? (asset.reviewData?.copyright?.data ? (100 - asset.reviewData.copyright.data.similarityScore) : undefined)} 
                        size="sm"
                      />
                      <span className="text-xs text-muted-foreground">
                        {asset.copyrightCheckData.riskBreakdown.riskLevel} risk
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
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
                        <Button size="sm" onClick={handleRunCheck} disabled={isRunningCheck}>
                          <Shield className="mr-2 h-4 w-4" />
                          {isRunningCheck ? "Checking..." : "Run Check (1 credit)"}
                        </Button>
                      )}
                      {asset.copyrightCheckStatus === "completed" && (
                        <Button variant="outline" size="sm" onClick={handleRerunCheck} disabled={isRunningCheck}>
                          <RotateCcw className="mr-2 h-4 w-4" />
                          {isRunningCheck ? "Checking..." : "Re-run"}
                        </Button>
                      )}
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/creative/assets/${assetId}/review`}>
                          <FileBarChart className="mr-2 h-4 w-4" />
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
                      score={asset.reviewData?.copyright?.data?.score ?? (asset.reviewData?.copyright?.data ? (100 - asset.reviewData.copyright.data.similarityScore) : undefined)}
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

          {/* AI Workflow Tab Content */}
          {isAIGenerated && (
            <TabsContent value="ai-workflow" className="mt-2">
              <div className="space-y-3">
                {/* Generation Details - Compact Grid */}
                <div className="grid md:grid-cols-2 gap-3">
                  {/* Prompt Card */}
                  {asset.promptHistory?.messages && (
                    <PromptContent history={asset.promptHistory} />
                  )}

                  {/* Technical Details Card */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Technical Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
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
                    </CardContent>
                  </Card>
                </div>

                {/* Compliance Workflow - Linear Progress */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Compliance Workflow</CardTitle>
                    <CardDescription>7-step AI asset compliance tracking</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <AIComplianceWorkflow 
                      assetId={asset.id}
                      copyrightCheckStatus={asset.copyrightCheckStatus}
                    />
                  </CardContent>
                </Card>

                {/* Copyright & Legal Status */}
                {asset.copyrightCheckData && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Copyright & Legal</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {/* Compact status indicators */}
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Risk Level</span>
                        <Badge variant={asset.copyrightCheckData.riskBreakdown.riskLevel === "low" ? "default" : "destructive"}>
                          {asset.copyrightCheckData.riskBreakdown.riskLevel}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Similarity</span>
                        <span className="text-sm font-medium">{asset.copyrightCheckData.similarityScore}%</span>
                      </div>
                      {asset.copyrightCheckData.matchedSources && asset.copyrightCheckData.matchedSources.length > 0 && (
                        <div className="pt-2">
                          <Link 
                            href="#"
                            onClick={(e) => {
                              e.preventDefault()
                              setActiveTab("quality")
                            }}
                            className="text-xs text-primary hover:underline flex items-center gap-1"
                          >
                            View full copyright report
                            <ChevronRight className="h-3 w-3" />
                          </Link>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
          )}

        </Tabs>
        </div>
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
