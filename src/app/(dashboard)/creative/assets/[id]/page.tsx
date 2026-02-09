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
  ExternalLink,
  Users,
  GitBranch,
  Info,
} from "lucide-react"
import { getWorkflowTemplateById } from "@/lib/mock-data/workflows"
import { STEP_TYPE_CONFIG } from "@/lib/workflow-step-config"
import Image from "next/image"
import Link from "next/link"
import { InlineEditField, ScoreBadge } from "@/components/creative"
import { useCreators } from "@/contexts/creators-context"
import { useContracts } from "@/contexts/contracts-context"
import { CreatorAvatarBadge } from "@/components/creators"
import { ContractCard } from "@/components/talent-rights"
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { VersionHistoryPanel, SubmitVersionDialog, VersionStatusBadge, AIComplianceWorkflow } from "@/components/assets"
import { AssetTimeline } from "@/components/assets/AssetTimeline"
import { VersionSelector } from "@/components/assets/VersionSelector"
import { TaskComments, type TaskComment, type TeamMember as TaskTeamMember } from "@/components/task/TaskComments"
import type { AssetVersion, MatchedSource, AssetReviewData, VersionComment } from "@/types/creative"
import { useCopyrightCredits } from "@/lib/contexts/copyright-credits-context"
import { useData } from "@/contexts/data-context"
import { calculateAssetDistributionRisk } from "@/lib/distribution-compliance"
import { LinearBreadcrumb } from "@/components/navigation/LinearBreadcrumb"

// Team members for @mentions (match task page)
const ASSET_TEAM_MEMBERS: TaskTeamMember[] = [
  { id: "user-1", name: "Sarah Chen", initials: "SC", avatarColor: "#3b82f6" },
  { id: "user-2", name: "Mike Johnson", initials: "MJ", avatarColor: "#8b5cf6" },
  { id: "user-3", name: "Emma Wilson", initials: "EW", avatarColor: "#10b981" },
  { id: "user-4", name: "Alex Kim", initials: "AK", avatarColor: "#f59e0b" },
  { id: "user-5", name: "Jordan Lee", initials: "JL", avatarColor: "#ef4444" },
]

function getPromptVersionDiff(prev: string, curr: string): { added: number; removed: number } {
  const prevWords = prev.trim().split(/\s+/).filter(Boolean)
  const currWords = curr.trim().split(/\s+/).filter(Boolean)
  const prevSet = new Set(prevWords)
  const currSet = new Set(currWords)
  const added = [...currSet].filter((w) => !prevSet.has(w)).length
  const removed = [...prevSet].filter((w) => !currSet.has(w)).length
  return { added, removed }
}

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
  const [activeTab, setActiveTab] = useState<"overview" | "ai-workflow" | "quality" | "talent-rights" | "timeline">("overview")
  const [isRunningCheck, setIsRunningCheck] = useState(false)
  const { canRunCheck, useCredit, getTotalAvailable } = useCopyrightCredits()
  
  // Local asset state for optimistic updates
  const [localAsset, setLocalAsset] = useState<any>(null)
  const topRef = useRef<HTMLDivElement>(null)
  // Defer Radix Tabs (and other client-only UI) until after mount to avoid server/client ID hydration mismatch
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])

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

  // Mock: which workflow step produced this asset
  const workflowContext = useMemo(() => {
    if (assetId === "vg-1" || (versionGroup && versionGroup.id === "vg-1")) {
      const template = getWorkflowTemplateById("wf-social-images")
      if (template) {
        return {
          template,
          stepIndex: 0,
          step: template.steps[0],
          taskId: "task-1",
          taskTitle: "Design hero image",
          projectId: "1",
          projectName: "Summer Campaign 2024",
          toolUsed: "Midjourney",
          sessionId: "ext-sid-a8f3c2",
          capturedAt: new Date().toISOString(),
          promptsCount: 3,
          generationsCount: 8,
          downloadsCount: 2,
        }
      }
    }
    return null
  }, [assetId, versionGroup])

  const { getProjectById } = useData()
  const projectId = asset?.projectId ?? versionGroup?.projectId ?? "1"
  const project = getProjectById(projectId)
  const distributionRisk = useMemo(() => {
    if (!project?.distribution || !asset) return null
    return calculateAssetDistributionRisk(
      {
        contentType: asset.contentType,
        creatorIds: asset.creatorIds,
        talentRightsVerified: (asset as { talentRightsVerified?: boolean }).talentRightsVerified,
      },
      project.distribution
    )
  }, [project?.distribution, asset])

  // Initialize local asset on mount
  useEffect(() => {
    if (baseAsset && !localAsset) {
      setLocalAsset(baseAsset)
    }
  }, [baseAsset, localAsset])
  
  // When saving, merge resolved brand name/color so the brand area under the title updates (standalone and version-group).
  // For version groups, also persist to the group and version list.
  const handleAssetUpdate = useCallback((updated: any) => {
    const merged = { ...updated }
    if (updated?.brandId !== undefined) {
      const brand = mockBrands.find((b) => b.id === updated.brandId)
      if (brand) {
        merged.brandName = brand.name
        const primaryColor = brand.colors?.find((c) => c.type === "primary") ?? brand.colors?.[0]
        merged.brandColor = primaryColor?.hex
      }
    }
    setLocalAsset(merged)
    if (!versionGroup || !updated?.id) return
    // Persist brand/design to version group so header (top-left) and Brand & Design sidebar use the same source
    if (updated.brandId !== undefined) {
      const brand = mockBrands.find((b) => b.id === updated.brandId)
      if (brand) {
        versionGroup.brandId = brand.id
        versionGroup.brandName = brand.name
        const primaryColor = brand.colors?.find((c) => c.type === "primary") ?? brand.colors?.[0]
        versionGroup.brandColor = primaryColor?.hex
      }
    }
    if (updated.designType !== undefined) {
      versionGroup.designType = updated.designType
    }
    const versionIndex = versionGroup.versions.findIndex(v => v.id === updated.id)
    if (versionIndex === -1) return
    const prev = versionGroup.versions[versionIndex]
    const brandForVersion = updated.brandId !== undefined ? mockBrands.find((b) => b.id === updated.brandId) : null
    const primaryForVersion = brandForVersion?.colors?.find((c) => c.type === "primary") ?? brandForVersion?.colors?.[0]
    const nextVersion = {
      ...prev,
      ...(updated.status !== undefined && { status: updated.status }),
      ...(updated.approvalStatus !== undefined && { approvalStatus: updated.approvalStatus }),
      ...(updated.brandId !== undefined && {
        brandId: updated.brandId,
        brandName: brandForVersion?.name ?? prev.brandName,
        brandColor: primaryForVersion?.hex ?? prev.brandColor,
      }),
      ...(updated.designType !== undefined && { designType: updated.designType }),
    }
    versionGroup.versions = [
      ...versionGroup.versions.slice(0, versionIndex),
      nextVersion,
      ...versionGroup.versions.slice(versionIndex + 1),
    ]
  }, [versionGroup])
  
  // Auto-save hook (use saveImmediately so inline edits like Intended Uses checkboxes save right away and stay clickable)
  const { saveImmediately, isSaving, lastSaved } = useAssetAutoSave(assetId, asset, {
    onUpdate: handleAssetUpdate
  })
  
  // Handle field save
  const handleFieldSave = useCallback(async (fieldPath: string, newValue: any) => {
    await saveImmediately(fieldPath, newValue)
  }, [saveImmediately])
  
  const { getCreatorsByAsset, getAllCreditsByCreator } = useCreators()
  const { getContractsByTalent } = useContracts()

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

  // Get contracts for all credited talent on this asset
  const talentContracts = useMemo(() => {
    return creditedCreators.flatMap(creator => getContractsByTalent(creator.id))
  }, [creditedCreators, getContractsByTalent])

  // Rights summary counts
  const rightsSummary = useMemo(() => {
    const authorized = creditedCreators.filter(c => c.rightsStatus === "Authorized").length
    const expiringSoon = creditedCreators.filter(c => c.rightsStatus === "Expiring Soon").length
    const expired = creditedCreators.filter(c => c.rightsStatus === "Expired").length
    return { authorized, expiringSoon, expired, total: creditedCreators.length }
  }, [creditedCreators])

  // Get display properties (from asset or version group)
  const displayBrandId = versionGroup ? versionGroup.brandId : (asset && 'brandId' in asset ? asset.brandId : undefined)
  const displayBrandName = versionGroup ? versionGroup.brandName : (asset && 'brandName' in asset ? asset.brandName : undefined)
  const displayBrandColor = versionGroup ? versionGroup.brandColor : (asset && 'brandColor' in asset ? asset.brandColor : undefined)
  const displayDesignType = versionGroup ? versionGroup.designType : (asset && 'designType' in asset ? asset.designType : undefined)
  const displayCreatedAt = (asset && 'createdAt' in asset && asset.createdAt) ? asset.createdAt : (asset && 'uploadedAt' in asset ? asset.uploadedAt : new Date())
  // For version groups, use version.status so header/sidebar match the version dropdown; otherwise use approvalStatus
  const displayApprovalStatus = (versionGroup && asset && 'status' in asset && asset.status)
    ? asset.status
    : (asset?.approvalStatus ?? "draft")
  
  const contentTypeConfig = asset && 'contentType' in asset && asset.contentType ? ASSET_CONTENT_TYPE_CONFIG[asset.contentType as keyof typeof ASSET_CONTENT_TYPE_CONFIG] : null
  const designTypeConfig = displayDesignType ? DESIGN_TYPE_CONFIG[displayDesignType as keyof typeof DESIGN_TYPE_CONFIG] : null
  const isAIGenerated = asset && 'contentType' in asset && asset.contentType === "ai_generated"

  // Single format label from fileType + mimeType (e.g. "Image (PNG)") to avoid redundant Type / File Type / MIME Type
  const fileFormatLabel = useMemo(() => {
    if (!asset || !('fileType' in asset) || !('mimeType' in asset)) return '—'
    const kind = String((asset as { fileType?: string }).fileType || '').toLowerCase()
    const mime = String((asset as { mimeType?: string }).mimeType || '')
    const kindLabel = kind ? kind.charAt(0).toUpperCase() + kind.slice(1) : ''
    const rawSubtype = mime.includes('/') ? (mime.split('/')[1] ?? '') : ''
    const subtypeLabel = rawSubtype.toUpperCase().replace(/\+XML$/i, '').replace(/^X-/, '') || ''
    if (kind === 'pdf' || mime === 'application/pdf') return 'PDF'
    return subtypeLabel ? `${kindLabel} (${subtypeLabel})` : kindLabel || mime || '—'
  }, [asset])
  
  // When contentType is edited away from ai_generated, leave Workflow tab to avoid blank pane
  useEffect(() => {
    if (!isAIGenerated && activeTab === "ai-workflow") {
      setActiveTab("overview")
    }
  }, [isAIGenerated, activeTab])
  
  // Reusable Activity (comments) section — same style as task page, bottom of every tab
  const assetCommentsRaw = ('comments' in asset && Array.isArray(asset.comments)) ? asset.comments : []
  const activityComments: TaskComment[] = useMemo(() => {
    const getInitials = (name: string) =>
      name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    return assetCommentsRaw.map((c: VersionComment) => ({
      id: c.id,
      content: c.content,
      authorId: c.authorId,
      authorName: c.authorName,
      authorInitials: getInitials(c.authorName),
      createdAt: c.createdAt,
      reactions: [],
    }))
  }, [assetCommentsRaw])
  const currentUserId = "user-1"
  const currentUserInitials = "SC"
  const handleActivityAddComment = useCallback((content: string, _mentions: string[], _visibility: "internal" | "client") => {
    toast.success("Comment added")
  }, [])
  const handleActivityAddReaction = useCallback((_commentId: string, _emoji: string) => {
    toast.info("Reaction added")
  }, [])
  const handleActivityRemoveReaction = useCallback((_commentId: string, _emoji: string) => {}, [])
  const commentsSection = (
    <Card className="border-0 shadow-none mt-3">
      <CardContent className="p-6">
        <TaskComments
          comments={activityComments}
          currentUserId={currentUserId}
          currentUserInitials={currentUserInitials}
          teamMembers={ASSET_TEAM_MEMBERS}
          onAddComment={handleActivityAddComment}
          onAddReaction={handleActivityAddReaction}
          onRemoveReaction={handleActivityRemoveReaction}
        />
      </CardContent>
    </Card>
  )
  
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

  // After all hooks: defer full UI until client mount to avoid Radix ID hydration mismatch
  if (!mounted) {
    return (
      <PageContainer className="space-y-0">
        <div className="min-h-[60vh] flex items-center justify-center">
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </PageContainer>
    )
  }

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
            {/* Status badge - matches version workflow (VersionSelector labels) */}
            {(() => {
              const status = displayApprovalStatus
              const statusConfig: Record<string, { label: string; className: string }> = {
                draft: { label: "Draft", className: "bg-muted text-muted-foreground border-muted-foreground/30" },
                submitted: { label: "Submitted", className: "bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-950/50 dark:text-blue-200 dark:border-blue-800" },
                client_review: { label: "Client Review", className: "bg-purple-50 text-purple-800 border-purple-200 dark:bg-purple-950/50 dark:text-purple-200 dark:border-purple-800" },
                client_approved: { label: "Client OK", className: "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-200 dark:border-emerald-800" },
                admin_review: { label: "Admin Review", className: "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/50 dark:text-amber-200 dark:border-amber-800" },
                approved: { label: "Approved", className: "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-200 dark:border-emerald-800" },
                rejected: { label: "Rejected", className: "bg-red-50 text-red-800 border-red-200 dark:bg-red-950/50 dark:text-red-200 dark:border-red-800" },
                pending: { label: "Pending", className: "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/50 dark:text-amber-200 dark:border-amber-800" },
              }
              const config = statusConfig[status] ?? statusConfig.draft
              return (
                <Badge variant="outline" className={cn("font-medium text-xs px-2 py-0.5 capitalize", config.className)}>
                  {config.label}
                </Badge>
              )
            })()}
            {versionGroup && selectedVersionId === versionGroup.currentVersionId && (
              <Badge variant="secondary" className="text-xs font-normal text-muted-foreground">
                Current Version
              </Badge>
            )}
            {isAIGenerated && (
              <Badge variant="secondary" className="gap-1 px-1.5 py-0.5">
                <Sparkles className="h-3 w-3" />
                <span className="text-[10px]">AI</span>
              </Badge>
            )}
          </div>

          {/* Inline Stats - brand, type, size, etc. (single brand dot only) */}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
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
          
          {/* Uploaded By */}
          {asset.uploadedByName && (
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Uploaded By:</span>
              <span className="text-sm">{asset.uploadedByName}</span>
            </div>
          )}
          
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
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
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
                    Workflow
                  </TabsTrigger>
                )}
                <TabsTrigger 
                  value="talent-rights"
                  className="rounded-none border-0 border-b-2 border-transparent bg-transparent shadow-none px-2.5 py-1.5 text-xs text-muted-foreground data-[state=active]:border-0 data-[state=active]:border-b-2 data-[state=active]:border-b-primary data-[state=active]:text-foreground data-[state=active]:font-medium"
                >
                  Talent Rights
                  {creditedCreators.length > 0 && (
                    <Badge variant="secondary" className="ml-1 h-3 px-1 text-[9px]">
                      {creditedCreators.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger
                  value="timeline"
                  className="rounded-none border-0 border-b-2 border-transparent bg-transparent shadow-none px-2.5 py-1.5 text-xs text-muted-foreground data-[state=active]:border-0 data-[state=active]:border-b-2 data-[state=active]:border-b-primary data-[state=active]:text-foreground data-[state=active]:font-medium"
                >
                  Timeline
                </TabsTrigger>
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

                {/* Activity (comments) - left column to match other boxes */}
                {commentsSection}
              </div>

              {/* Right Column - Metadata Sidebar */}
              <div className="space-y-4 sticky top-4">
                {/* Sidebar card - sections only, no "Properties" header */}
                <div className="border border-border/80 rounded-md bg-card">
                  {/* Content - all sections inside */}
                  <div className="divide-y divide-border">
                    {/* Approval & Status */}
                    {statusField && (
                      <div className="px-3 py-2 space-y-1.5">
                        <p className="text-xs font-semibold text-foreground pb-2 border-b border-border -mx-3 px-3">Approval & Status</p>
                        <InlineEditField
                          field={statusField}
                          value={displayApprovalStatus}
                          onSave={(newValue) => handleFieldSave(versionGroup ? "status" : "approvalStatus", newValue)}
                          showLabel={false}
                        />
                      </div>
                    )}
                    
                    {/* Brand & Design */}
                    <div className="px-3 py-2 space-y-2">
                      <p className="text-xs font-semibold text-foreground pb-2 border-b border-border -mx-3 px-3">Brand & Design</p>
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
                    
                    {/* File Properties */}
                    <div className="px-3 py-2 space-y-2">
                      <p className="text-xs font-semibold text-foreground pb-2 border-b border-border -mx-3 px-3">File Properties</p>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-muted-foreground">Format</span>
                          <span className="text-sm font-medium">{fileFormatLabel}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-muted-foreground">Size</span>
                          <span className="text-sm font-medium">{formatFileSize(asset.fileSize)}</span>
                        </div>
                        {asset.dimensions && (
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-muted-foreground">Dimensions</span>
                            <span className="text-sm font-medium">
                              {asset.dimensions.width} × {asset.dimensions.height}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="space-y-2">
                        {EDITABLE_FIELDS.filter(f => f.category === "files" && f.id === "contentType").map(field => (
                          <InlineEditField
                            key={field.id}
                            field={field}
                            value={asset[field.path as keyof typeof asset]}
                            onSave={(newValue) => handleFieldSave(field.path, newValue)}
                          />
                        ))}
                      </div>
                    </div>
                    
                    {/* Basic Information */}
                    <div className="px-3 py-2 space-y-2">
                      <p className="text-xs font-semibold text-foreground pb-2 border-b border-border -mx-3 px-3">Basic Information</p>
                      
                      {/* Uploaded By */}
                      {asset.uploadedByName && (
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">Uploaded By</p>
                          <p className="text-sm font-medium">{asset.uploadedByName}</p>
                        </div>
                      )}

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
                    </div>
                    
                    {/* Copyright & Legal */}
                    {asset.copyrightCheckStatus && asset.copyrightCheckData && (
                      <div className="px-3 py-2 space-y-1.5">
                        <div className="flex items-center justify-between pb-2 border-b border-border -mx-3 px-3">
                          <p className="text-xs font-semibold text-foreground">Copyright & Legal</p>
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
                    {/* Distribution Compliance - only when project has distribution */}
                    {project?.distribution && distributionRisk && (
                      <div className="px-3 py-2 space-y-2">
                        <div className="flex items-center justify-between pb-2 border-b border-border -mx-3 px-3">
                          <p className="text-xs font-semibold text-foreground">Distribution Compliance</p>
                          <Link
                            href={`/compliance/distribution-risk?project=${projectId}`}
                            className="text-xs text-primary hover:underline"
                          >
                            View Full Risk Report
                          </Link>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-[10px]",
                              distributionRisk.status === "clear" && "border-emerald-300 text-emerald-700 bg-emerald-50 dark:border-emerald-700 dark:text-emerald-300 dark:bg-emerald-950/30",
                              distributionRisk.status === "needs_review" && "border-amber-400 text-amber-800 bg-amber-50 dark:border-amber-600 dark:text-amber-200 dark:bg-amber-950/30",
                              distributionRisk.status === "blocked" && "border-red-400 text-red-800 bg-red-50 dark:border-red-600 dark:text-red-200 dark:bg-red-950/30"
                            )}
                          >
                            {distributionRisk.status === "clear" && "Clear"}
                            {distributionRisk.status === "needs_review" && "Needs Review"}
                            {distributionRisk.status === "blocked" && "Blocked"}
                          </Badge>
                        </div>
                        {distributionRisk.marketIssues.length > 0 && (
                          <ul className="space-y-1.5 text-[11px] text-muted-foreground">
                            {distributionRisk.marketIssues.map((issue) => (
                              <li key={issue.market} className="flex flex-col gap-0.5">
                                <span className="font-medium text-foreground">{issue.market}</span>
                                <span className="text-muted-foreground">{issue.needed}</span>
                                <Badge variant="secondary" className="w-fit text-[9px] h-4">
                                  {issue.riskLevel}
                                </Badge>
                              </li>
                            ))}
                          </ul>
                        )}
                        {distributionRisk.totalPenaltyExposure > 0 && (
                          <p className="text-[11px] text-muted-foreground">
                            Est. penalty exposure:{" "}
                            <span className="font-medium text-foreground">
                              ${distributionRisk.totalPenaltyExposure.toLocaleString()}
                            </span>
                          </p>
                        )}
                        <Button variant="outline" size="sm" className="w-full mt-1 h-8 text-xs" asChild>
                          <Link href={`/compliance/distribution-risk?project=${projectId}`}>
                            View Full Risk Report
                            <ChevronRight className="h-3 w-3 ml-1" />
                          </Link>
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
        </div>
      </TabsContent>

          {/* Quality Tab Content */}
          <TabsContent value="quality" className="mt-2">
            <div className="grid lg:grid-cols-3 gap-3">
              <div className="lg:col-span-2 space-y-3">
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
                {commentsSection}
              </div>
              </div>
              <div className="space-y-4 sticky top-4" aria-hidden="true" />
            </div>
          </TabsContent>

          {/* Workflow Tab Content */}
          {isAIGenerated && (
            <TabsContent value="ai-workflow" className="mt-2">
              <div className="space-y-6">
                {/* SECTION 1: PROVENANCE */}
                <Card>
                  <CardContent className="p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="h-7 w-7 rounded-lg bg-blue-500/10 flex items-center justify-center">
                        <GitBranch className="h-4 w-4 text-blue-500" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold">Workflow Provenance</h3>
                        <p className="text-[10px] text-muted-foreground">How this asset was created</p>
                      </div>
                    </div>
                    {/* Risk Assessment summary */}
                    {(() => {
                      const isComplianceComplete = asset.copyrightCheckStatus === "completed"
                      const promptChangeCount = asset.promptHistory?.messages?.filter((m: { role: string }) => m.role === "user")?.length ?? 0
                      const lastModified = asset.updatedAt ?? asset.createdAt ?? new Date()
                      return (
                        <div className="rounded-lg border border-amber-200/60 bg-amber-50/50 dark:bg-amber-950/20 dark:border-amber-800/50 p-4 mb-4">
                          <h4 className="text-xs font-semibold text-foreground mb-3">Risk Assessment</h4>
                          <div className="space-y-2.5 text-xs">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-muted-foreground">Compliance Status</span>
                              <Badge
                                variant="outline"
                                className={cn(
                                  "text-[10px]",
                                  isComplianceComplete
                                    ? "border-emerald-300 text-emerald-700 bg-emerald-50 dark:border-emerald-700 dark:text-emerald-300 dark:bg-emerald-950/30"
                                    : "border-amber-400 text-amber-800 bg-amber-100 dark:border-amber-600 dark:text-amber-200 dark:bg-amber-900/30"
                                )}
                              >
                                {isComplianceComplete ? "7/7 Verified" : "6/7 Verified"}
                              </Badge>
                            </div>
                            {!isComplianceComplete && (
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-muted-foreground">Outstanding Verification</span>
                                <span className="flex items-center gap-2">
                                  <span className="font-medium text-foreground">Copyright Check</span>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-7 text-[10px] border-amber-300 text-amber-800 hover:bg-amber-100 dark:border-amber-600 dark:text-amber-200 dark:hover:bg-amber-900/40"
                                    onClick={() => setActiveTab("quality")}
                                  >
                                    Run Check
                                  </Button>
                                </span>
                              </div>
                            )}
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-muted-foreground">Last Modified</span>
                              <span className="font-medium">{format(new Date(lastModified), "MMM d, yyyy 'at' h:mm a")}</span>
                            </div>
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-muted-foreground">Modification Count</span>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <span className="flex items-center gap-1 font-medium">
                                      {promptChangeCount} prompt change{promptChangeCount !== 1 ? "s" : ""}
                                      <Info className="h-3.5 w-3.5 text-muted-foreground" />
                                    </span>
                                  </TooltipTrigger>
                                  <TooltipContent side="left" className="max-w-[240px]">
                                    <p className="text-xs">
                                      Multiple prompt edits can affect reproducibility and compliance. This count helps auditors trace how the final asset was derived.
                                    </p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          </div>
                        </div>
                      )
                    })()}
                    {workflowContext ? (
                      <div className="space-y-6">
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/50">
                          <span className="text-2xl">{workflowContext.template.icon}</span>
                          <div className="flex-1 min-w-0">
                            <Link href={`/workflows/${workflowContext.template.id}`} className="text-sm font-medium hover:underline">
                              {workflowContext.template.name}
                            </Link>
                            <p className="text-[10px] text-muted-foreground">
                              Step {workflowContext.stepIndex + 1} of {workflowContext.template.steps.length}: {workflowContext.step.name}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <Link
                                href={`/projects/${workflowContext.projectId}/tasks/${workflowContext.taskId}`}
                                className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline"
                              >
                                {workflowContext.taskTitle}
                              </Link>
                              <span className="text-[10px] text-muted-foreground">in {workflowContext.projectName}</span>
                            </div>
                          </div>
                          {(() => {
                            const config = STEP_TYPE_CONFIG[workflowContext.step.stepType]
                            const StepIcon = config.icon
                            return (
                              <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center border shrink-0", config.lightBg, config.borderColor)}>
                                <StepIcon className={cn("h-5 w-5", config.textColor)} />
                              </div>
                            )
                          })()}
                        </div>
                        {asset.copyrightCheckStatus !== "completed" && (
                          <div className="rounded-lg border border-amber-300 bg-amber-50 dark:border-amber-600 dark:bg-amber-950/30 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
                            <p className="text-sm text-amber-900 dark:text-amber-100">
                              ⚠️ Copyright verification required before policy issuance — Run copyright check to complete compliance chain
                            </p>
                            <Button
                              variant="outline"
                              size="sm"
                              className="shrink-0 border-amber-400 text-amber-800 hover:bg-amber-100 dark:border-amber-500 dark:text-amber-200 dark:hover:bg-amber-900/50"
                              onClick={() => setActiveTab("quality")}
                            >
                              Run Copyright Check
                            </Button>
                          </div>
                        )}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          <div className="p-3 rounded-lg border bg-card">
                            <p className="text-[10px] text-muted-foreground mb-0.5">AI Tool</p>
                            <p className="text-sm font-medium">🎨 {workflowContext.toolUsed}</p>
                            <p className="text-[10px] text-muted-foreground">Full Tracking</p>
                          </div>
                          <div className="p-3 rounded-lg border bg-card">
                            <p className="text-[10px] text-muted-foreground mb-0.5">Model</p>
                            <p className="text-sm font-medium">Midjourney v6</p>
                            <p className="text-[10px] text-muted-foreground">Latest version</p>
                          </div>
                          <div className="p-3 rounded-lg border bg-card">
                            <p className="text-[10px] text-muted-foreground mb-0.5">Generated</p>
                            <p className="text-sm font-medium">{format(new Date(workflowContext.capturedAt), "MMM d, yyyy")}</p>
                            <p className="text-[10px] text-muted-foreground">{format(new Date(workflowContext.capturedAt), "h:mm a")}</p>
                          </div>
                          <div className="p-3 rounded-lg border bg-card">
                            <p className="text-[10px] text-muted-foreground mb-0.5">Session</p>
                            <p className="text-sm font-mono font-medium">{workflowContext.sessionId.slice(0, 12)}</p>
                            <p className="text-[10px] text-muted-foreground">Browser Extension</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-6 py-2">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-help">
                                  <div className="h-6 w-6 rounded-md bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center shrink-0">
                                    <AlertTriangle className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                                  </div>
                                  <span><strong className="text-foreground">{workflowContext.promptsCount}</strong> Prompt Modifications</span>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="text-xs">Multiple prompt changes may indicate content refinement or risk evolution</p>
                              </TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-help">
                                  <div className="h-6 w-6 rounded-md bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center shrink-0">
                                    <Info className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                                  </div>
                                  <span><strong className="text-foreground">{workflowContext.generationsCount}</strong> Generation Attempts</span>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="text-xs">Number of times AI was invoked</p>
                              </TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-help">
                                  <div className="h-6 w-6 rounded-md bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center shrink-0">
                                    <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                                  </div>
                                  <span><strong className="text-foreground">{workflowContext.downloadsCount}</strong> Asset Downloads</span>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="text-xs">Tracked file exports</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        {/* Compliance Timeline */}
                        <Collapsible>
                          <CollapsibleTrigger className="flex items-center justify-between w-full px-3 py-2.5 rounded-lg bg-muted/40 border border-border/50 hover:bg-muted/60 transition-colors text-left group">
                            <span className="text-xs font-medium text-muted-foreground">Compliance Timeline</span>
                            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0 transition-transform group-data-[state=open]:rotate-180" />
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <div className="mt-3 pl-4 border-l-2 border-muted space-y-0">
                              {[
                                { label: "Creator verified", time: workflowContext.capturedAt, method: "Session identity", meta: "Browser extension" },
                                { label: "Tool verified", time: new Date(new Date(workflowContext.capturedAt).getTime() + 1000), method: "Tool capture", meta: workflowContext.toolUsed },
                                { label: "Model verified", time: new Date(new Date(workflowContext.capturedAt).getTime() + 2000), method: "Model reported", meta: "Midjourney v6" },
                                { label: "Training verified", time: new Date(new Date(workflowContext.capturedAt).getTime() + 3000), method: "Training data disclosure", meta: "Vendor documentation" },
                              ].map((item, i) => (
                                <div key={i} className="relative flex gap-3 pb-4">
                                  <div className="absolute -left-[1.125rem] h-5 w-5 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center border-2 border-background shrink-0">
                                    <Check className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                                  </div>
                                  <div className="flex-1 min-w-0 pt-0.5">
                                    <p className="text-xs font-medium text-foreground">{item.label}</p>
                                    <p className="text-[10px] text-muted-foreground mt-0.5">{format(new Date(item.time), "MMM d, yyyy 'at' h:mm a")}</p>
                                    <p className="text-[10px] text-muted-foreground mt-0.5"><span className="font-medium">Method:</span> {item.method}</p>
                                    {item.meta && <p className="text-[10px] text-muted-foreground"><span className="font-medium">Metadata:</span> {item.meta}</p>}
                                  </div>
                                </div>
                              ))}
                              {/* Talent step (optional) - after Training, before Prompt */}
                              {(() => {
                                const hasIdentifiableTalent = (asset.creatorIds?.length ?? 0) > 0
                                const talentRightsVerified = (asset as { talentRightsVerified?: boolean }).talentRightsVerified === true
                                const talentTime = new Date(new Date(workflowContext.capturedAt).getTime() + 4000)
                                if (!hasIdentifiableTalent) {
                                  return (
                                    <div className="relative flex gap-3 pb-4">
                                      <div className="absolute -left-[1.125rem] h-5 w-5 rounded-full bg-muted flex items-center justify-center border-2 border-background shrink-0">
                                        <Check className="h-3 w-3 text-muted-foreground" />
                                      </div>
                                      <div className="flex-1 min-w-0 pt-0.5">
                                        <p className="text-xs font-medium text-foreground">Talent (N/A)</p>
                                        <p className="text-[10px] text-muted-foreground mt-0.5">{format(talentTime, "MMM d, yyyy 'at' h:mm a")}</p>
                                        <p className="text-[10px] text-muted-foreground mt-0.5"><span className="font-medium">Method:</span> No identifiable individuals detected</p>
                                        <p className="text-[10px] text-muted-foreground"><span className="font-medium">Metadata:</span> Optional step — skipped</p>
                                      </div>
                                    </div>
                                  )
                                }
                                if (talentRightsVerified) {
                                  return (
                                    <div className="relative flex gap-3 pb-4">
                                      <div className="absolute -left-[1.125rem] h-5 w-5 rounded-full bg-teal-100 dark:bg-teal-900/50 flex items-center justify-center border-2 border-background shrink-0">
                                        <Check className="h-3 w-3 text-teal-600 dark:text-teal-400" />
                                      </div>
                                      <div className="flex-1 min-w-0 pt-0.5">
                                        <p className="text-xs font-medium text-foreground">Talent verified</p>
                                        <p className="text-[10px] text-muted-foreground mt-0.5">{format(talentTime, "MMM d, yyyy 'at' h:mm a")}</p>
                                        <p className="text-[10px] text-muted-foreground mt-0.5"><span className="font-medium">Method:</span> NILP rights confirmed</p>
                                        <p className="text-[10px] text-muted-foreground"><span className="font-medium">Metadata:</span> Name, image, likeness, personality</p>
                                      </div>
                                    </div>
                                  )
                                }
                                return (
                                  <div className="relative flex gap-3 pb-4">
                                    <div className="absolute -left-[1.125rem] h-5 w-5 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center border-2 border-background shrink-0">
                                      <AlertTriangle className="h-3 w-3 text-amber-600 dark:text-amber-400" />
                                    </div>
                                    <div className="flex-1 min-w-0 pt-0.5">
                                      <p className="text-xs font-medium text-foreground">Talent pending verification</p>
                                      <p className="text-[10px] text-muted-foreground mt-0.5">{format(talentTime, "MMM d, yyyy 'at' h:mm a")}</p>
                                      <p className="text-[10px] text-muted-foreground mt-0.5"><span className="font-medium">Method:</span> —</p>
                                      <p className="text-[10px] text-muted-foreground"><span className="font-medium">Metadata:</span> Identifiable individuals detected — verify NILP rights</p>
                                    </div>
                                  </div>
                                )
                              })()}
                              {[
                                { label: "Prompt verified", time: new Date(new Date(workflowContext.capturedAt).getTime() + 5000), method: "Prompt captured", meta: `${workflowContext.promptsCount} prompt(s)` },
                                { label: "Output verified", time: new Date(new Date(workflowContext.capturedAt).getTime() + 6000), method: "Output recorded", meta: `${workflowContext.downloadsCount} download(s)` },
                              ].map((item, i) => (
                                <div key={i} className="relative flex gap-3 pb-4">
                                  <div className="absolute -left-[1.125rem] h-5 w-5 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center border-2 border-background shrink-0">
                                    <Check className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                                  </div>
                                  <div className="flex-1 min-w-0 pt-0.5">
                                    <p className="text-xs font-medium text-foreground">{item.label}</p>
                                    <p className="text-[10px] text-muted-foreground mt-0.5">{format(new Date(item.time), "MMM d, yyyy 'at' h:mm a")}</p>
                                    <p className="text-[10px] text-muted-foreground mt-0.5"><span className="font-medium">Method:</span> {item.method}</p>
                                    {item.meta && <p className="text-[10px] text-muted-foreground"><span className="font-medium">Metadata:</span> {item.meta}</p>}
                                  </div>
                                </div>
                              ))}
                              {/* Copyright step */}
                              <div className="relative flex gap-3 pb-0">
                                {asset.copyrightCheckStatus === "completed" && asset.copyrightCheckData?.checkedAt ? (
                                  <>
                                    <div className="absolute -left-[1.125rem] h-5 w-5 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center border-2 border-background shrink-0">
                                      <Check className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                                    </div>
                                    <div className="flex-1 min-w-0 pt-0.5">
                                      <p className="text-xs font-medium text-foreground">Copyright verified</p>
                                      <p className="text-[10px] text-muted-foreground mt-0.5">{format(new Date(asset.copyrightCheckData.checkedAt), "MMM d, yyyy 'at' h:mm a")}</p>
                                      <p className="text-[10px] text-muted-foreground mt-0.5"><span className="font-medium">Method:</span> AI similarity scan</p>
                                      {asset.copyrightCheckData.similarityScore != null && <p className="text-[10px] text-muted-foreground"><span className="font-medium">Metadata:</span> Similarity {asset.copyrightCheckData.similarityScore}%</p>}
                                    </div>
                                  </>
                                ) : (
                                  <>
                                    <div className="absolute -left-[1.125rem] h-5 w-5 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center border-2 border-background shrink-0">
                                      <AlertTriangle className="h-3 w-3 text-amber-600 dark:text-amber-400" />
                                    </div>
                                    <div className="flex-1 min-w-0 pt-0.5">
                                      <p className="text-xs font-medium text-foreground">Copyright check pending</p>
                                      <p className="text-[10px] text-muted-foreground mt-0.5">Not yet run</p>
                                      <p className="text-[10px] text-muted-foreground mt-0.5"><span className="font-medium">Method:</span> —</p>
                                      <Button variant="outline" size="sm" className="mt-2 h-7 text-[10px] border-amber-300 text-amber-800 hover:bg-amber-100 dark:border-amber-600 dark:text-amber-200 dark:hover:bg-amber-900/40" onClick={() => setActiveTab("quality")}>
                                        Run Check
                                      </Button>
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>
                          </CollapsibleContent>
                        </Collapsible>
                        {(() => {
                          const promptVersions = asset.promptHistory?.messages?.filter((m: { role: string }) => m.role === "user") ?? []
                          const lastPrompt = promptVersions[promptVersions.length - 1]
                          if (promptVersions.length === 0) return null
                          return (
                            <div className="space-y-4">
                              <Collapsible>
                                <CollapsibleTrigger className="flex items-center justify-between w-full px-3 py-2.5 rounded-lg bg-muted/40 border border-border/50 hover:bg-muted/60 transition-colors text-left group">
                                  <span className="text-xs font-medium text-muted-foreground">View {promptVersions.length} prompt version{promptVersions.length !== 1 ? "s" : ""}</span>
                                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0 transition-transform group-data-[state=open]:rotate-180" />
                                </CollapsibleTrigger>
                                <CollapsibleContent>
                                  <div className="mt-2 space-y-3 rounded-lg border border-border/50 bg-muted/20 p-3">
                                    {promptVersions.map((msg: { id: string; content: string; timestamp: Date }, i: number) => (
                                      <div key={msg.id} className="rounded-md bg-background/80 p-3 border">
                                        <div className="flex items-center justify-between gap-2 mb-1.5">
                                          <span className="text-[10px] font-medium text-muted-foreground uppercase">Version {i + 1}</span>
                                          <span className="text-[10px] text-muted-foreground">{format(new Date(msg.timestamp), "MMM d, h:mm a")}</span>
                                        </div>
                                        <p className="text-xs font-mono whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                                        {i > 0 &&
                                          (() => {
                                            const d = getPromptVersionDiff(promptVersions[i - 1].content, msg.content)
                                            if (d.added === 0 && d.removed === 0) return <p className="text-[10px] text-muted-foreground mt-1.5">No text changes</p>
                                            return (
                                              <p className="text-[10px] text-muted-foreground mt-1.5">
                                                Diff: +{d.added} words, −{d.removed} words
                                              </p>
                                            )
                                          })()}
                                      </div>
                                    ))}
                                  </div>
                                </CollapsibleContent>
                              </Collapsible>
                              <div>
                                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-1.5">Final AI Instructions</p>
                                <div className="bg-muted/50 rounded-lg p-3 border border-border/50">
                                  <p className="text-xs font-mono leading-relaxed text-foreground/80 whitespace-pre-wrap">{lastPrompt.content}</p>
                                </div>
                              </div>
                            </div>
                          )
                        })()}
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {(() => {
                          const promptVersions = asset.promptHistory?.messages?.filter((m: { role: string }) => m.role === "user") ?? []
                          const lastPrompt = promptVersions[promptVersions.length - 1]
                          if (promptVersions.length === 0) return null
                          return (
                            <div className="space-y-4">
                              <Collapsible>
                                <CollapsibleTrigger className="flex items-center justify-between w-full px-3 py-2.5 rounded-lg bg-muted/40 border border-border/50 hover:bg-muted/60 transition-colors text-left group">
                                  <span className="text-xs font-medium text-muted-foreground">View {promptVersions.length} prompt version{promptVersions.length !== 1 ? "s" : ""}</span>
                                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0 transition-transform group-data-[state=open]:rotate-180" />
                                </CollapsibleTrigger>
                                <CollapsibleContent>
                                  <div className="mt-2 space-y-3 rounded-lg border border-border/50 bg-muted/20 p-3">
                                    {promptVersions.map((msg: { id: string; content: string; timestamp: Date }, i: number) => (
                                      <div key={msg.id} className="rounded-md bg-background/80 p-3 border">
                                        <div className="flex items-center justify-between gap-2 mb-1.5">
                                          <span className="text-[10px] font-medium text-muted-foreground uppercase">Version {i + 1}</span>
                                          <span className="text-[10px] text-muted-foreground">{format(new Date(msg.timestamp), "MMM d, h:mm a")}</span>
                                        </div>
                                        <p className="text-xs font-mono whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                                        {i > 0 &&
                                          (() => {
                                            const d = getPromptVersionDiff(promptVersions[i - 1].content, msg.content)
                                            if (d.added === 0 && d.removed === 0) return <p className="text-[10px] text-muted-foreground mt-1.5">No text changes</p>
                                            return (
                                              <p className="text-[10px] text-muted-foreground mt-1.5">
                                                Diff: +{d.added} words, −{d.removed} words
                                              </p>
                                            )
                                          })()}
                                      </div>
                                    ))}
                                  </div>
                                </CollapsibleContent>
                              </Collapsible>
                              <div>
                                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-1.5">Final AI Instructions</p>
                                <div className="bg-muted/50 rounded-lg p-3 border border-border/50">
                                  <p className="text-xs font-mono leading-relaxed text-foreground/80 whitespace-pre-wrap">{lastPrompt.content}</p>
                                </div>
                              </div>
                            </div>
                          )
                        })()}
                        {!workflowContext && (
                        <div>
                          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-1.5">Technical Details</p>
                          <div className="grid md:grid-cols-2 gap-x-6 gap-y-2">
                            {EDITABLE_FIELDS.filter(f => f.category === "ai").map(field => (
                              <InlineEditField
                                key={field.id}
                                field={field}
                                value={field.path.includes(".")
                                  ? field.path.split(".").reduce((obj: any, key) => obj?.[key], asset)
                                  : asset[field.path as keyof typeof asset]}
                                onSave={(newValue) => handleFieldSave(field.path, newValue)}
                              />
                            ))}
                          </div>
                        </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
                {/* SECTION 2: COMPLIANCE PROVENANCE */}
                <Card>
                  <CardContent className="p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="h-7 w-7 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                        <Shield className="h-4 w-4 text-emerald-500" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold">Compliance Chain</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">8-point provenance verification for insurance (1 optional)</p>
                      </div>
                    </div>
                    {(() => {
                      const copyrightComplete = asset.copyrightCheckStatus === "completed"
                      const hasIdentifiableTalent = (asset.creatorIds?.length ?? 0) > 0
                      const talentRightsVerified = (asset as { talentRightsVerified?: boolean }).talentRightsVerified === true
                      const talentStepStatus: "not_applicable" | "pending" | "verified" =
                        !hasIdentifiableTalent ? "not_applicable" : talentRightsVerified ? "verified" : "pending"
                      const talentComplete = talentStepStatus === "not_applicable" || talentStepStatus === "verified"
                      const completedRequired = 6 + (copyrightComplete ? 1 : 0)
                      const completedOptional = talentComplete ? 1 : 0
                      const completedTotal = completedRequired + completedOptional
                      const totalSteps = 8
                      const optionalPending = hasIdentifiableTalent && !talentRightsVerified && copyrightComplete
                      const progressPct = (completedTotal / totalSteps) * 100
                      return (
                        <>
                          <AIComplianceWorkflow
                            assetId={asset.id}
                            copyrightCheckStatus={asset.copyrightCheckStatus}
                            talentStepStatus={talentStepStatus}
                          />
                          <div className="mt-3 flex items-center gap-3">
                            <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden min-w-0">
                              <div
                                className={cn(
                                  "h-full rounded-full transition-all",
                                  completedTotal === totalSteps ? "bg-emerald-500" : optionalPending ? "bg-amber-500" : "bg-amber-500"
                                )}
                                style={{ width: `${progressPct}%` }}
                              />
                            </div>
                            <Badge variant="outline" className="text-[10px] shrink-0">
                              {optionalPending
                                ? "7/8 Complete (1 optional pending)"
                                : copyrightComplete
                                  ? "7/7 Complete"
                                  : "6/7 Complete"}
                            </Badge>
                            <Badge variant="outline" className="text-[10px] shrink-0">
                              Risk Level: Medium
                            </Badge>
                          </div>
                        </>
                      )
                    })()}
                    {asset.copyrightCheckData ? (
                      <div className="mt-4 p-3 rounded-lg border bg-muted/20">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs text-muted-foreground">Risk Level:</span>
                              <Badge variant={asset.copyrightCheckData.riskBreakdown.riskLevel === "low" ? "default" : "destructive"} className="text-[10px]">
                                {asset.copyrightCheckData.riskBreakdown.riskLevel}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs text-muted-foreground">Similarity:</span>
                              <span className="text-xs font-medium">{asset.copyrightCheckData.similarityScore}%</span>
                            </div>
                          </div>
                          <Link
                            href="#"
                            onClick={(e) => { e.preventDefault(); setActiveTab("quality") }}
                            className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                          >
                            Full report <ChevronRight className="h-3 w-3" />
                          </Link>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-4 p-3 rounded-lg border border-dashed bg-muted/10 text-center">
                        <p className="text-xs text-muted-foreground">Copyright check not yet run</p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-2 text-xs h-7"
                          onClick={() => setActiveTab("quality")}
                        >
                          Run Copyright Check
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
                {/* SECTION 3: ACTIVITY */}
                {commentsSection}
              </div>
            </TabsContent>
          )}

          {/* Talent Rights Tab Content */}
          <TabsContent value="talent-rights" className="mt-2">
            <div className="grid lg:grid-cols-3 gap-3">
              <div className="lg:col-span-2 space-y-3">

                {/* Assign Talent */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Assign Talent</CardTitle>
                    <CardDescription>Select talent credited in this asset</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {(() => {
                      const creatorIdsField = EDITABLE_FIELDS.find(f => f.id === "creatorIds")
                      return creatorIdsField && (
                        <InlineEditField
                          field={creatorIdsField}
                          value={asset.creatorIds || []}
                          onSave={(newValue) => handleFieldSave("creatorIds", newValue)}
                          label="Assign Talent"
                          showLabel={false}
                        />
                      )
                    })()}
                  </CardContent>
                </Card>

                {/* Credited Talent */}
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm">Credited Talent</CardTitle>
                      {creditedCreators.length > 0 && (
                        <Badge variant="secondary" className="text-[10px]">{creditedCreators.length}</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    {creditedCreators.length === 0 ? (
                      <div className="px-4 pb-4 text-center py-6">
                        <Users className="h-8 w-8 mx-auto text-muted-foreground/40 mb-2" />
                        <p className="text-sm text-muted-foreground">No talent credited yet</p>
                        <p className="text-xs text-muted-foreground/70 mt-1">Use the picker above to assign talent to this asset</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-border">
                        {assetCreditsWithRoles.map(({ creator, role }) => {
                          const nilpParts: string[] = []
                          if (creator.nilpCategories?.name) nilpParts.push("N")
                          if (creator.nilpCategories?.image) nilpParts.push("I")
                          if (creator.nilpCategories?.likeness) nilpParts.push("L")
                          if (creator.nilpCategories?.persona) nilpParts.push("P")
                          const nilpIndicator = nilpParts.join(" ")
                          const expirationDate = creator.validThrough ? new Date(creator.validThrough).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : null
                          const statusColor = creator.rightsStatus === "Authorized" 
                            ? "text-green-600 bg-green-50 dark:bg-green-900/20" 
                            : creator.rightsStatus === "Expiring Soon" 
                            ? "text-orange-600 bg-orange-50 dark:bg-orange-900/20" 
                            : "text-red-600 bg-red-50 dark:bg-red-900/20"

                          return (
                            <div key={creator.id} className="py-3 px-4 hover:bg-muted/50 transition-colors">
                              <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-3 min-w-0">
                                  <CreatorAvatarBadge creator={creator} size="sm" />
                                  <div className="min-w-0">
                                    <span className="text-sm font-medium">{creator.fullName}</span>
                                    <div className="flex items-center gap-2 mt-0.5">
                                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">{creator.talentType}</Badge>
                                      {role && <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4">{role}</Badge>}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3 flex-shrink-0">
                                  {nilpIndicator && (
                                    <span className="font-mono text-xs text-muted-foreground tracking-wider">{nilpIndicator}</span>
                                  )}
                                  <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0 h-4 border-0", statusColor)}>
                                    {creator.rightsStatus}
                                  </Badge>
                                  {expirationDate && (
                                    <span className="text-xs text-muted-foreground whitespace-nowrap">{expirationDate}</span>
                                  )}
                                  <Link href={`/creative/talent-rights/${creator.id}`} className="text-muted-foreground hover:text-foreground transition-colors">
                                    <ExternalLink className="h-3.5 w-3.5" />
                                  </Link>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Agreements */}
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm">Agreements</CardTitle>
                      {talentContracts.length > 0 && (
                        <Badge variant="secondary" className="text-[10px]">{talentContracts.length}</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    {talentContracts.length === 0 ? (
                      <div className="px-4 pb-4 text-center py-6">
                        <FileText className="h-8 w-8 mx-auto text-muted-foreground/40 mb-2" />
                        <p className="text-sm text-muted-foreground">No agreements found</p>
                        <p className="text-xs text-muted-foreground/70 mt-1">Contracts linked to credited talent will appear here</p>
                      </div>
                    ) : (
                      <div>
                        {talentContracts.map(contract => (
                          <ContractCard key={contract.id} contract={contract} compact />
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

              </div>

              {/* Rights Summary Sidebar */}
              <div className="space-y-4 sticky top-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Rights Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Total Credited</span>
                      <span className="text-sm font-medium">{rightsSummary.total}</span>
                    </div>
                    {rightsSummary.authorized > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Authorized</span>
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 border-0 text-green-600 bg-green-50 dark:bg-green-900/20">{rightsSummary.authorized}</Badge>
                      </div>
                    )}
                    {rightsSummary.expiringSoon > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Expiring Soon</span>
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 border-0 text-orange-600 bg-orange-50 dark:bg-orange-900/20">{rightsSummary.expiringSoon}</Badge>
                      </div>
                    )}
                    {rightsSummary.expired > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Expired</span>
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 border-0 text-red-600 bg-red-50 dark:bg-red-900/20">{rightsSummary.expired}</Badge>
                      </div>
                    )}
                    {(rightsSummary.expiringSoon > 0 || rightsSummary.expired > 0) && (
                      <div className="pt-2 border-t">
                        <div className="flex items-center gap-1.5 text-xs text-amber-600">
                          <AlertTriangle className="h-3 w-3" />
                          <span>Rights attention needed</span>
                        </div>
                      </div>
                    )}
                    <div className="pt-2 border-t">
                      <Link 
                        href="/creative/talent-rights"
                        className="text-xs text-primary hover:underline flex items-center gap-1"
                      >
                        Manage all talent rights
                        <ChevronRight className="h-3 w-3" />
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Timeline Tab Content */}
          <TabsContent value="timeline" className="mt-3">
            <AssetTimeline asset={asset} versionGroup={versionGroup}>
              {commentsSection}
            </AssetTimeline>
          </TabsContent>

          </Tabs>
        </div>
      ) : (
        <div className="mt-3">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
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
                    Workflow
                  </TabsTrigger>
                )}
                <TabsTrigger 
                  value="talent-rights"
                  className="rounded-none border-0 border-b-2 border-transparent bg-transparent shadow-none px-2.5 py-1.5 text-xs text-muted-foreground data-[state=active]:border-0 data-[state=active]:border-b-2 data-[state=active]:border-b-primary data-[state=active]:text-foreground data-[state=active]:font-medium"
                >
                  Talent Rights
                  {creditedCreators.length > 0 && (
                    <Badge variant="secondary" className="ml-1 h-3 px-1 text-[9px]">
                      {creditedCreators.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger
                  value="timeline"
                  className="rounded-none border-0 border-b-2 border-transparent bg-transparent shadow-none px-2.5 py-1.5 text-xs text-muted-foreground data-[state=active]:border-0 data-[state=active]:border-b-2 data-[state=active]:border-b-primary data-[state=active]:text-foreground data-[state=active]:font-medium"
                >
                  Timeline
                </TabsTrigger>
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

            {/* Activity (comments) - left column to match other boxes */}
            {commentsSection}
          </div>

          {/* Right Column - Metadata Sidebar */}
          <div className="space-y-4 sticky top-4">
            {/* Sidebar card - sections only, no "Properties" header */}
            <div className="border border-border/80 rounded-md bg-card">
              {/* Content - all sections inside */}
              <div className="divide-y divide-border">
                {/* Approval & Status */}
                {statusField && (
                  <div className="px-3 py-2 space-y-1.5">
                    <p className="text-xs font-semibold text-foreground pb-2 border-b border-border -mx-3 px-3">Approval & Status</p>
                    <InlineEditField
                      field={statusField}
                      value={displayApprovalStatus}
                      onSave={(newValue) => handleFieldSave(versionGroup ? "status" : "approvalStatus", newValue)}
                      showLabel={false}
                    />
                  </div>
                )}
                
                {/* Brand & Design */}
                <div className="px-3 py-2 space-y-2">
                  <p className="text-xs font-semibold text-foreground pb-2 border-b border-border -mx-3 px-3">Brand & Design</p>
                  {brandField && (
                    <div className="space-y-1.5">
                      <InlineEditField
                        field={brandField}
                        value={displayBrandId}
                        onSave={(newValue) => handleFieldSave("brandId", newValue)}
                      />
                    </div>
                  )}
                  {designTypeField && (
                    <div className="space-y-1.5">
                      <InlineEditField
                        field={designTypeField}
                        value={displayDesignType}
                        onSave={(newValue) => handleFieldSave("designType", newValue)}
                      />
                    </div>
                  )}
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
                
                {/* File Properties */}
                <div className="px-3 py-2 space-y-2">
                  <p className="text-xs font-semibold text-foreground pb-2 border-b border-border -mx-3 px-3">File Properties</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">Format</span>
                      <span className="text-sm font-medium">{fileFormatLabel}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">Size</span>
                      <span className="text-sm font-medium">{formatFileSize(asset.fileSize)}</span>
                    </div>
                    {asset.dimensions && (
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">Dimensions</span>
                        <span className="text-sm font-medium">
                          {asset.dimensions.width} × {asset.dimensions.height}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    {EDITABLE_FIELDS.filter(f => f.category === "files" && f.id === "contentType").map(field => (
                      <InlineEditField
                        key={field.id}
                        field={field}
                        value={asset[field.path as keyof typeof asset]}
                        onSave={(newValue) => handleFieldSave(field.path, newValue)}
                      />
                    ))}
                  </div>
                </div>
                
                {/* Basic Information */}
                <div className="px-3 py-2 space-y-2">
                  <p className="text-xs font-semibold text-foreground pb-2 border-b border-border -mx-3 px-3">Basic Information</p>
                  
                  {/* Uploaded By */}
                  {asset.uploadedByName && (
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Uploaded By</p>
                      <p className="text-sm font-medium">{asset.uploadedByName}</p>
                    </div>
                  )}

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
                </div>
                
                {/* Copyright & Legal */}
                {asset.copyrightCheckStatus && asset.copyrightCheckData && (
                  <div className="px-3 py-2 space-y-1.5">
                    <div className="flex items-center justify-between pb-2 border-b border-border -mx-3 px-3">
                      <p className="text-xs font-semibold text-foreground">Copyright & Legal</p>
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
                {/* Distribution Compliance - only when project has distribution */}
                {project?.distribution && distributionRisk && (
                  <div className="px-3 py-2 space-y-2">
                    <div className="flex items-center justify-between pb-2 border-b border-border -mx-3 px-3">
                      <p className="text-xs font-semibold text-foreground">Distribution Compliance</p>
                      <Link
                        href={`/compliance/distribution-risk?project=${projectId}`}
                        className="text-xs text-primary hover:underline"
                      >
                        View Full Risk Report
                      </Link>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[10px]",
                          distributionRisk.status === "clear" && "border-emerald-300 text-emerald-700 bg-emerald-50 dark:border-emerald-700 dark:text-emerald-300 dark:bg-emerald-950/30",
                          distributionRisk.status === "needs_review" && "border-amber-400 text-amber-800 bg-amber-50 dark:border-amber-600 dark:text-amber-200 dark:bg-amber-950/30",
                          distributionRisk.status === "blocked" && "border-red-400 text-red-800 bg-red-50 dark:border-red-600 dark:text-red-200 dark:bg-red-950/30"
                        )}
                      >
                        {distributionRisk.status === "clear" && "Clear"}
                        {distributionRisk.status === "needs_review" && "Needs Review"}
                        {distributionRisk.status === "blocked" && "Blocked"}
                      </Badge>
                    </div>
                    {distributionRisk.marketIssues.length > 0 && (
                      <ul className="space-y-1.5 text-[11px] text-muted-foreground">
                        {distributionRisk.marketIssues.map((issue) => (
                          <li key={issue.market} className="flex flex-col gap-0.5">
                            <span className="font-medium text-foreground">{issue.market}</span>
                            <span className="text-muted-foreground">{issue.needed}</span>
                            <Badge variant="secondary" className="w-fit text-[9px] h-4">
                              {issue.riskLevel}
                            </Badge>
                          </li>
                        ))}
                      </ul>
                    )}
                    {distributionRisk.totalPenaltyExposure > 0 && (
                      <p className="text-[11px] text-muted-foreground">
                        Est. penalty exposure:{" "}
                        <span className="font-medium text-foreground">
                          ${distributionRisk.totalPenaltyExposure.toLocaleString()}
                        </span>
                      </p>
                    )}
                    <Button variant="outline" size="sm" className="w-full mt-1 h-8 text-xs" asChild>
                      <Link href={`/compliance/distribution-risk?project=${projectId}`}>
                        View Full Risk Report
                        <ChevronRight className="h-3 w-3 ml-1" />
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
          </TabsContent>

          {/* Quality Tab Content */}
          <TabsContent value="quality" className="mt-2">
            <div className="grid lg:grid-cols-3 gap-3">
              <div className="lg:col-span-2 space-y-3">
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
                {commentsSection}
              </div>
              </div>
              <div className="space-y-4 sticky top-4" aria-hidden="true" />
            </div>
          </TabsContent>

          {/* Workflow Tab Content */}
          {isAIGenerated && (
            <TabsContent value="ai-workflow" className="mt-2">
              <div className="space-y-6">
                {/* SECTION 1: PROVENANCE */}
                <Card>
                  <CardContent className="p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="h-7 w-7 rounded-lg bg-blue-500/10 flex items-center justify-center">
                        <GitBranch className="h-4 w-4 text-blue-500" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold">Workflow Provenance</h3>
                        <p className="text-[10px] text-muted-foreground">How this asset was created</p>
                      </div>
                    </div>
                    {/* Risk Assessment summary */}
                    {(() => {
                      const isComplianceComplete = asset.copyrightCheckStatus === "completed"
                      const promptChangeCount = asset.promptHistory?.messages?.filter((m: { role: string }) => m.role === "user")?.length ?? 0
                      const lastModified = asset.updatedAt ?? asset.createdAt ?? new Date()
                      return (
                        <div className="rounded-lg border border-amber-200/60 bg-amber-50/50 dark:bg-amber-950/20 dark:border-amber-800/50 p-4 mb-4">
                          <h4 className="text-xs font-semibold text-foreground mb-3">Risk Assessment</h4>
                          <div className="space-y-2.5 text-xs">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-muted-foreground">Compliance Status</span>
                              <Badge
                                variant="outline"
                                className={cn(
                                  "text-[10px]",
                                  isComplianceComplete
                                    ? "border-emerald-300 text-emerald-700 bg-emerald-50 dark:border-emerald-700 dark:text-emerald-300 dark:bg-emerald-950/30"
                                    : "border-amber-400 text-amber-800 bg-amber-100 dark:border-amber-600 dark:text-amber-200 dark:bg-amber-900/30"
                                )}
                              >
                                {isComplianceComplete ? "7/7 Verified" : "6/7 Verified"}
                              </Badge>
                            </div>
                            {!isComplianceComplete && (
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-muted-foreground">Outstanding Verification</span>
                                <span className="flex items-center gap-2">
                                  <span className="font-medium text-foreground">Copyright Check</span>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-7 text-[10px] border-amber-300 text-amber-800 hover:bg-amber-100 dark:border-amber-600 dark:text-amber-200 dark:hover:bg-amber-900/40"
                                    onClick={() => setActiveTab("quality")}
                                  >
                                    Run Check
                                  </Button>
                                </span>
                              </div>
                            )}
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-muted-foreground">Last Modified</span>
                              <span className="font-medium">{format(new Date(lastModified), "MMM d, yyyy 'at' h:mm a")}</span>
                            </div>
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-muted-foreground">Modification Count</span>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <span className="flex items-center gap-1 font-medium">
                                      {promptChangeCount} prompt change{promptChangeCount !== 1 ? "s" : ""}
                                      <Info className="h-3.5 w-3.5 text-muted-foreground" />
                                    </span>
                                  </TooltipTrigger>
                                  <TooltipContent side="left" className="max-w-[240px]">
                                    <p className="text-xs">
                                      Multiple prompt edits can affect reproducibility and compliance. This count helps auditors trace how the final asset was derived.
                                    </p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          </div>
                        </div>
                      )
                    })()}
                    {workflowContext ? (
                      <div className="space-y-6">
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/50">
                          <span className="text-2xl">{workflowContext.template.icon}</span>
                          <div className="flex-1 min-w-0">
                            <Link href={`/workflows/${workflowContext.template.id}`} className="text-sm font-medium hover:underline">
                              {workflowContext.template.name}
                            </Link>
                            <p className="text-[10px] text-muted-foreground">
                              Step {workflowContext.stepIndex + 1} of {workflowContext.template.steps.length}: {workflowContext.step.name}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <Link
                                href={`/projects/${workflowContext.projectId}/tasks/${workflowContext.taskId}`}
                                className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline"
                              >
                                {workflowContext.taskTitle}
                              </Link>
                              <span className="text-[10px] text-muted-foreground">in {workflowContext.projectName}</span>
                            </div>
                          </div>
                          {(() => {
                            const config = STEP_TYPE_CONFIG[workflowContext.step.stepType]
                            const StepIcon = config.icon
                            return (
                              <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center border shrink-0", config.lightBg, config.borderColor)}>
                                <StepIcon className={cn("h-5 w-5", config.textColor)} />
                              </div>
                            )
                          })()}
                        </div>
                        {asset.copyrightCheckStatus !== "completed" && (
                          <div className="rounded-lg border border-amber-300 bg-amber-50 dark:border-amber-600 dark:bg-amber-950/30 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
                            <p className="text-sm text-amber-900 dark:text-amber-100">
                              ⚠️ Copyright verification required before policy issuance — Run copyright check to complete compliance chain
                            </p>
                            <Button
                              variant="outline"
                              size="sm"
                              className="shrink-0 border-amber-400 text-amber-800 hover:bg-amber-100 dark:border-amber-500 dark:text-amber-200 dark:hover:bg-amber-900/50"
                              onClick={() => setActiveTab("quality")}
                            >
                              Run Copyright Check
                            </Button>
                          </div>
                        )}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          <div className="p-3 rounded-lg border bg-card">
                            <p className="text-[10px] text-muted-foreground mb-0.5">AI Tool</p>
                            <p className="text-sm font-medium">🎨 {workflowContext.toolUsed}</p>
                            <p className="text-[10px] text-muted-foreground">Full Tracking</p>
                          </div>
                          <div className="p-3 rounded-lg border bg-card">
                            <p className="text-[10px] text-muted-foreground mb-0.5">Model</p>
                            <p className="text-sm font-medium">Midjourney v6</p>
                            <p className="text-[10px] text-muted-foreground">Latest version</p>
                          </div>
                          <div className="p-3 rounded-lg border bg-card">
                            <p className="text-[10px] text-muted-foreground mb-0.5">Generated</p>
                            <p className="text-sm font-medium">{format(new Date(workflowContext.capturedAt), "MMM d, yyyy")}</p>
                            <p className="text-[10px] text-muted-foreground">{format(new Date(workflowContext.capturedAt), "h:mm a")}</p>
                          </div>
                          <div className="p-3 rounded-lg border bg-card">
                            <p className="text-[10px] text-muted-foreground mb-0.5">Session</p>
                            <p className="text-sm font-mono font-medium">{workflowContext.sessionId.slice(0, 12)}</p>
                            <p className="text-[10px] text-muted-foreground">Browser Extension</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-6 py-2">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-help">
                                  <div className="h-6 w-6 rounded-md bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center shrink-0">
                                    <AlertTriangle className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                                  </div>
                                  <span><strong className="text-foreground">{workflowContext.promptsCount}</strong> Prompt Modifications</span>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="text-xs">Multiple prompt changes may indicate content refinement or risk evolution</p>
                              </TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-help">
                                  <div className="h-6 w-6 rounded-md bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center shrink-0">
                                    <Info className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                                  </div>
                                  <span><strong className="text-foreground">{workflowContext.generationsCount}</strong> Generation Attempts</span>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="text-xs">Number of times AI was invoked</p>
                              </TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-help">
                                  <div className="h-6 w-6 rounded-md bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center shrink-0">
                                    <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                                  </div>
                                  <span><strong className="text-foreground">{workflowContext.downloadsCount}</strong> Asset Downloads</span>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="text-xs">Tracked file exports</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        {/* Compliance Timeline */}
                        <Collapsible>
                          <CollapsibleTrigger className="flex items-center justify-between w-full px-3 py-2.5 rounded-lg bg-muted/40 border border-border/50 hover:bg-muted/60 transition-colors text-left group">
                            <span className="text-xs font-medium text-muted-foreground">Compliance Timeline</span>
                            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0 transition-transform group-data-[state=open]:rotate-180" />
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <div className="mt-3 pl-4 border-l-2 border-muted space-y-0">
                              {[
                                { label: "Creator verified", time: workflowContext.capturedAt, method: "Session identity", meta: "Browser extension" },
                                { label: "Tool verified", time: new Date(new Date(workflowContext.capturedAt).getTime() + 1000), method: "Tool capture", meta: workflowContext.toolUsed },
                                { label: "Model verified", time: new Date(new Date(workflowContext.capturedAt).getTime() + 2000), method: "Model reported", meta: "Midjourney v6" },
                                { label: "Training verified", time: new Date(new Date(workflowContext.capturedAt).getTime() + 3000), method: "Training data disclosure", meta: "Vendor documentation" },
                              ].map((item, i) => (
                                <div key={i} className="relative flex gap-3 pb-4">
                                  <div className="absolute -left-[1.125rem] h-5 w-5 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center border-2 border-background shrink-0">
                                    <Check className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                                  </div>
                                  <div className="flex-1 min-w-0 pt-0.5">
                                    <p className="text-xs font-medium text-foreground">{item.label}</p>
                                    <p className="text-[10px] text-muted-foreground mt-0.5">{format(new Date(item.time), "MMM d, yyyy 'at' h:mm a")}</p>
                                    <p className="text-[10px] text-muted-foreground mt-0.5"><span className="font-medium">Method:</span> {item.method}</p>
                                    {item.meta && <p className="text-[10px] text-muted-foreground"><span className="font-medium">Metadata:</span> {item.meta}</p>}
                                  </div>
                                </div>
                              ))}
                              {/* Talent step (optional) - after Training, before Prompt */}
                              {(() => {
                                const hasIdentifiableTalent = (asset.creatorIds?.length ?? 0) > 0
                                const talentRightsVerified = (asset as { talentRightsVerified?: boolean }).talentRightsVerified === true
                                const talentTime = new Date(new Date(workflowContext.capturedAt).getTime() + 4000)
                                if (!hasIdentifiableTalent) {
                                  return (
                                    <div className="relative flex gap-3 pb-4">
                                      <div className="absolute -left-[1.125rem] h-5 w-5 rounded-full bg-muted flex items-center justify-center border-2 border-background shrink-0">
                                        <Check className="h-3 w-3 text-muted-foreground" />
                                      </div>
                                      <div className="flex-1 min-w-0 pt-0.5">
                                        <p className="text-xs font-medium text-foreground">Talent (N/A)</p>
                                        <p className="text-[10px] text-muted-foreground mt-0.5">{format(talentTime, "MMM d, yyyy 'at' h:mm a")}</p>
                                        <p className="text-[10px] text-muted-foreground mt-0.5"><span className="font-medium">Method:</span> No identifiable individuals detected</p>
                                        <p className="text-[10px] text-muted-foreground"><span className="font-medium">Metadata:</span> Optional step — skipped</p>
                                      </div>
                                    </div>
                                  )
                                }
                                if (talentRightsVerified) {
                                  return (
                                    <div className="relative flex gap-3 pb-4">
                                      <div className="absolute -left-[1.125rem] h-5 w-5 rounded-full bg-teal-100 dark:bg-teal-900/50 flex items-center justify-center border-2 border-background shrink-0">
                                        <Check className="h-3 w-3 text-teal-600 dark:text-teal-400" />
                                      </div>
                                      <div className="flex-1 min-w-0 pt-0.5">
                                        <p className="text-xs font-medium text-foreground">Talent verified</p>
                                        <p className="text-[10px] text-muted-foreground mt-0.5">{format(talentTime, "MMM d, yyyy 'at' h:mm a")}</p>
                                        <p className="text-[10px] text-muted-foreground mt-0.5"><span className="font-medium">Method:</span> NILP rights confirmed</p>
                                        <p className="text-[10px] text-muted-foreground"><span className="font-medium">Metadata:</span> Name, image, likeness, personality</p>
                                      </div>
                                    </div>
                                  )
                                }
                                return (
                                  <div className="relative flex gap-3 pb-4">
                                    <div className="absolute -left-[1.125rem] h-5 w-5 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center border-2 border-background shrink-0">
                                      <AlertTriangle className="h-3 w-3 text-amber-600 dark:text-amber-400" />
                                    </div>
                                    <div className="flex-1 min-w-0 pt-0.5">
                                      <p className="text-xs font-medium text-foreground">Talent pending verification</p>
                                      <p className="text-[10px] text-muted-foreground mt-0.5">{format(talentTime, "MMM d, yyyy 'at' h:mm a")}</p>
                                      <p className="text-[10px] text-muted-foreground mt-0.5"><span className="font-medium">Method:</span> —</p>
                                      <p className="text-[10px] text-muted-foreground"><span className="font-medium">Metadata:</span> Identifiable individuals detected — verify NILP rights</p>
                                    </div>
                                  </div>
                                )
                              })()}
                              {[
                                { label: "Prompt verified", time: new Date(new Date(workflowContext.capturedAt).getTime() + 5000), method: "Prompt captured", meta: `${workflowContext.promptsCount} prompt(s)` },
                                { label: "Output verified", time: new Date(new Date(workflowContext.capturedAt).getTime() + 6000), method: "Output recorded", meta: `${workflowContext.downloadsCount} download(s)` },
                              ].map((item, i) => (
                                <div key={i} className="relative flex gap-3 pb-4">
                                  <div className="absolute -left-[1.125rem] h-5 w-5 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center border-2 border-background shrink-0">
                                    <Check className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                                  </div>
                                  <div className="flex-1 min-w-0 pt-0.5">
                                    <p className="text-xs font-medium text-foreground">{item.label}</p>
                                    <p className="text-[10px] text-muted-foreground mt-0.5">{format(new Date(item.time), "MMM d, yyyy 'at' h:mm a")}</p>
                                    <p className="text-[10px] text-muted-foreground mt-0.5"><span className="font-medium">Method:</span> {item.method}</p>
                                    {item.meta && <p className="text-[10px] text-muted-foreground"><span className="font-medium">Metadata:</span> {item.meta}</p>}
                                  </div>
                                </div>
                              ))}
                              {/* Copyright step */}
                              <div className="relative flex gap-3 pb-0">
                                {asset.copyrightCheckStatus === "completed" && asset.copyrightCheckData?.checkedAt ? (
                                  <>
                                    <div className="absolute -left-[1.125rem] h-5 w-5 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center border-2 border-background shrink-0">
                                      <Check className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                                    </div>
                                    <div className="flex-1 min-w-0 pt-0.5">
                                      <p className="text-xs font-medium text-foreground">Copyright verified</p>
                                      <p className="text-[10px] text-muted-foreground mt-0.5">{format(new Date(asset.copyrightCheckData.checkedAt), "MMM d, yyyy 'at' h:mm a")}</p>
                                      <p className="text-[10px] text-muted-foreground mt-0.5"><span className="font-medium">Method:</span> AI similarity scan</p>
                                      {asset.copyrightCheckData.similarityScore != null && <p className="text-[10px] text-muted-foreground"><span className="font-medium">Metadata:</span> Similarity {asset.copyrightCheckData.similarityScore}%</p>}
                                    </div>
                                  </>
                                ) : (
                                  <>
                                    <div className="absolute -left-[1.125rem] h-5 w-5 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center border-2 border-background shrink-0">
                                      <AlertTriangle className="h-3 w-3 text-amber-600 dark:text-amber-400" />
                                    </div>
                                    <div className="flex-1 min-w-0 pt-0.5">
                                      <p className="text-xs font-medium text-foreground">Copyright check pending</p>
                                      <p className="text-[10px] text-muted-foreground mt-0.5">Not yet run</p>
                                      <p className="text-[10px] text-muted-foreground mt-0.5"><span className="font-medium">Method:</span> —</p>
                                      <Button variant="outline" size="sm" className="mt-2 h-7 text-[10px] border-amber-300 text-amber-800 hover:bg-amber-100 dark:border-amber-600 dark:text-amber-200 dark:hover:bg-amber-900/40" onClick={() => setActiveTab("quality")}>
                                        Run Check
                                      </Button>
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>
                          </CollapsibleContent>
                        </Collapsible>
                        {(() => {
                          const promptVersions = asset.promptHistory?.messages?.filter((m: { role: string }) => m.role === "user") ?? []
                          const lastPrompt = promptVersions[promptVersions.length - 1]
                          if (promptVersions.length === 0) return null
                          return (
                            <div className="space-y-4">
                              <Collapsible>
                                <CollapsibleTrigger className="flex items-center justify-between w-full px-3 py-2.5 rounded-lg bg-muted/40 border border-border/50 hover:bg-muted/60 transition-colors text-left group">
                                  <span className="text-xs font-medium text-muted-foreground">View {promptVersions.length} prompt version{promptVersions.length !== 1 ? "s" : ""}</span>
                                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0 transition-transform group-data-[state=open]:rotate-180" />
                                </CollapsibleTrigger>
                                <CollapsibleContent>
                                  <div className="mt-2 space-y-3 rounded-lg border border-border/50 bg-muted/20 p-3">
                                    {promptVersions.map((msg: { id: string; content: string; timestamp: Date }, i: number) => (
                                      <div key={msg.id} className="rounded-md bg-background/80 p-3 border">
                                        <div className="flex items-center justify-between gap-2 mb-1.5">
                                          <span className="text-[10px] font-medium text-muted-foreground uppercase">Version {i + 1}</span>
                                          <span className="text-[10px] text-muted-foreground">{format(new Date(msg.timestamp), "MMM d, h:mm a")}</span>
                                        </div>
                                        <p className="text-xs font-mono whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                                        {i > 0 &&
                                          (() => {
                                            const d = getPromptVersionDiff(promptVersions[i - 1].content, msg.content)
                                            if (d.added === 0 && d.removed === 0) return <p className="text-[10px] text-muted-foreground mt-1.5">No text changes</p>
                                            return (
                                              <p className="text-[10px] text-muted-foreground mt-1.5">
                                                Diff: +{d.added} words, −{d.removed} words
                                              </p>
                                            )
                                          })()}
                                      </div>
                                    ))}
                                  </div>
                                </CollapsibleContent>
                              </Collapsible>
                              <div>
                                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-1.5">Final AI Instructions</p>
                                <div className="bg-muted/50 rounded-lg p-3 border border-border/50">
                                  <p className="text-xs font-mono leading-relaxed text-foreground/80 whitespace-pre-wrap">{lastPrompt.content}</p>
                                </div>
                              </div>
                            </div>
                          )
                        })()}
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {(() => {
                          const promptVersions = asset.promptHistory?.messages?.filter((m: { role: string }) => m.role === "user") ?? []
                          const lastPrompt = promptVersions[promptVersions.length - 1]
                          if (promptVersions.length === 0) return null
                          return (
                            <div className="space-y-4">
                              <Collapsible>
                                <CollapsibleTrigger className="flex items-center justify-between w-full px-3 py-2.5 rounded-lg bg-muted/40 border border-border/50 hover:bg-muted/60 transition-colors text-left group">
                                  <span className="text-xs font-medium text-muted-foreground">View {promptVersions.length} prompt version{promptVersions.length !== 1 ? "s" : ""}</span>
                                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0 transition-transform group-data-[state=open]:rotate-180" />
                                </CollapsibleTrigger>
                                <CollapsibleContent>
                                  <div className="mt-2 space-y-3 rounded-lg border border-border/50 bg-muted/20 p-3">
                                    {promptVersions.map((msg: { id: string; content: string; timestamp: Date }, i: number) => (
                                      <div key={msg.id} className="rounded-md bg-background/80 p-3 border">
                                        <div className="flex items-center justify-between gap-2 mb-1.5">
                                          <span className="text-[10px] font-medium text-muted-foreground uppercase">Version {i + 1}</span>
                                          <span className="text-[10px] text-muted-foreground">{format(new Date(msg.timestamp), "MMM d, h:mm a")}</span>
                                        </div>
                                        <p className="text-xs font-mono whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                                        {i > 0 &&
                                          (() => {
                                            const d = getPromptVersionDiff(promptVersions[i - 1].content, msg.content)
                                            if (d.added === 0 && d.removed === 0) return <p className="text-[10px] text-muted-foreground mt-1.5">No text changes</p>
                                            return (
                                              <p className="text-[10px] text-muted-foreground mt-1.5">
                                                Diff: +{d.added} words, −{d.removed} words
                                              </p>
                                            )
                                          })()}
                                      </div>
                                    ))}
                                  </div>
                                </CollapsibleContent>
                              </Collapsible>
                              <div>
                                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-1.5">Final AI Instructions</p>
                                <div className="bg-muted/50 rounded-lg p-3 border border-border/50">
                                  <p className="text-xs font-mono leading-relaxed text-foreground/80 whitespace-pre-wrap">{lastPrompt.content}</p>
                                </div>
                              </div>
                            </div>
                          )
                        })()}
                        {!workflowContext && (
                        <div>
                          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-1.5">Technical Details</p>
                          <div className="grid md:grid-cols-2 gap-x-6 gap-y-2">
                            {EDITABLE_FIELDS.filter(f => f.category === "ai").map(field => (
                              <InlineEditField
                                key={field.id}
                                field={field}
                                value={field.path.includes(".")
                                  ? field.path.split(".").reduce((obj: any, key) => obj?.[key], asset)
                                  : asset[field.path as keyof typeof asset]}
                                onSave={(newValue) => handleFieldSave(field.path, newValue)}
                              />
                            ))}
                          </div>
                        </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
                {/* SECTION 2: COMPLIANCE PROVENANCE */}
                <Card>
                  <CardContent className="p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="h-7 w-7 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                        <Shield className="h-4 w-4 text-emerald-500" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold">Compliance Chain</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">8-point provenance verification for insurance (1 optional)</p>
                      </div>
                    </div>
                    {(() => {
                      const copyrightComplete = asset.copyrightCheckStatus === "completed"
                      const hasIdentifiableTalent = (asset.creatorIds?.length ?? 0) > 0
                      const talentRightsVerified = (asset as { talentRightsVerified?: boolean }).talentRightsVerified === true
                      const talentStepStatus: "not_applicable" | "pending" | "verified" =
                        !hasIdentifiableTalent ? "not_applicable" : talentRightsVerified ? "verified" : "pending"
                      const talentComplete = talentStepStatus === "not_applicable" || talentStepStatus === "verified"
                      const completedRequired = 6 + (copyrightComplete ? 1 : 0)
                      const completedOptional = talentComplete ? 1 : 0
                      const completedTotal = completedRequired + completedOptional
                      const totalSteps = 8
                      const optionalPending = hasIdentifiableTalent && !talentRightsVerified && copyrightComplete
                      const progressPct = (completedTotal / totalSteps) * 100
                      return (
                        <>
                          <AIComplianceWorkflow
                            assetId={asset.id}
                            copyrightCheckStatus={asset.copyrightCheckStatus}
                            talentStepStatus={talentStepStatus}
                          />
                          <div className="mt-3 flex items-center gap-3">
                            <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden min-w-0">
                              <div
                                className={cn(
                                  "h-full rounded-full transition-all",
                                  completedTotal === totalSteps ? "bg-emerald-500" : optionalPending ? "bg-amber-500" : "bg-amber-500"
                                )}
                                style={{ width: `${progressPct}%` }}
                              />
                            </div>
                            <Badge variant="outline" className="text-[10px] shrink-0">
                              {optionalPending
                                ? "7/8 Complete (1 optional pending)"
                                : copyrightComplete
                                  ? "7/7 Complete"
                                  : "6/7 Complete"}
                            </Badge>
                            <Badge variant="outline" className="text-[10px] shrink-0">
                              Risk Level: Medium
                            </Badge>
                          </div>
                        </>
                      )
                    })()}
                    {asset.copyrightCheckData ? (
                      <div className="mt-4 p-3 rounded-lg border bg-muted/20">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs text-muted-foreground">Risk Level:</span>
                              <Badge variant={asset.copyrightCheckData.riskBreakdown.riskLevel === "low" ? "default" : "destructive"} className="text-[10px]">
                                {asset.copyrightCheckData.riskBreakdown.riskLevel}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs text-muted-foreground">Similarity:</span>
                              <span className="text-xs font-medium">{asset.copyrightCheckData.similarityScore}%</span>
                            </div>
                          </div>
                          <Link
                            href="#"
                            onClick={(e) => { e.preventDefault(); setActiveTab("quality") }}
                            className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                          >
                            Full report <ChevronRight className="h-3 w-3" />
                          </Link>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-4 p-3 rounded-lg border border-dashed bg-muted/10 text-center">
                        <p className="text-xs text-muted-foreground">Copyright check not yet run</p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-2 text-xs h-7"
                          onClick={() => setActiveTab("quality")}
                        >
                          Run Copyright Check
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
                {/* SECTION 3: ACTIVITY */}
                {commentsSection}
              </div>
            </TabsContent>
          )}

          {/* Talent Rights Tab Content */}
          <TabsContent value="talent-rights" className="mt-2">
            <div className="grid lg:grid-cols-3 gap-3">
              <div className="lg:col-span-2 space-y-3">

                {/* Assign Talent */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Assign Talent</CardTitle>
                    <CardDescription>Select talent credited in this asset</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {(() => {
                      const creatorIdsField = EDITABLE_FIELDS.find(f => f.id === "creatorIds")
                      return creatorIdsField && (
                        <InlineEditField
                          field={creatorIdsField}
                          value={asset.creatorIds || []}
                          onSave={(newValue) => handleFieldSave("creatorIds", newValue)}
                          label="Assign Talent"
                          showLabel={false}
                        />
                      )
                    })()}
                  </CardContent>
                </Card>

                {/* Credited Talent */}
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm">Credited Talent</CardTitle>
                      {creditedCreators.length > 0 && (
                        <Badge variant="secondary" className="text-[10px]">{creditedCreators.length}</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    {creditedCreators.length === 0 ? (
                      <div className="px-4 pb-4 text-center py-6">
                        <Users className="h-8 w-8 mx-auto text-muted-foreground/40 mb-2" />
                        <p className="text-sm text-muted-foreground">No talent credited yet</p>
                        <p className="text-xs text-muted-foreground/70 mt-1">Use the picker above to assign talent to this asset</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-border">
                        {assetCreditsWithRoles.map(({ creator, role }) => {
                          const nilpParts: string[] = []
                          if (creator.nilpCategories?.name) nilpParts.push("N")
                          if (creator.nilpCategories?.image) nilpParts.push("I")
                          if (creator.nilpCategories?.likeness) nilpParts.push("L")
                          if (creator.nilpCategories?.persona) nilpParts.push("P")
                          const nilpIndicator = nilpParts.join(" ")
                          const expirationDate = creator.validThrough ? new Date(creator.validThrough).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : null
                          const statusColor = creator.rightsStatus === "Authorized" 
                            ? "text-green-600 bg-green-50 dark:bg-green-900/20" 
                            : creator.rightsStatus === "Expiring Soon" 
                            ? "text-orange-600 bg-orange-50 dark:bg-orange-900/20" 
                            : "text-red-600 bg-red-50 dark:bg-red-900/20"

                          return (
                            <div key={creator.id} className="py-3 px-4 hover:bg-muted/50 transition-colors">
                              <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-3 min-w-0">
                                  <CreatorAvatarBadge creator={creator} size="sm" />
                                  <div className="min-w-0">
                                    <span className="text-sm font-medium">{creator.fullName}</span>
                                    <div className="flex items-center gap-2 mt-0.5">
                                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">{creator.talentType}</Badge>
                                      {role && <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4">{role}</Badge>}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3 flex-shrink-0">
                                  {nilpIndicator && (
                                    <span className="font-mono text-xs text-muted-foreground tracking-wider">{nilpIndicator}</span>
                                  )}
                                  <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0 h-4 border-0", statusColor)}>
                                    {creator.rightsStatus}
                                  </Badge>
                                  {expirationDate && (
                                    <span className="text-xs text-muted-foreground whitespace-nowrap">{expirationDate}</span>
                                  )}
                                  <Link href={`/creative/talent-rights/${creator.id}`} className="text-muted-foreground hover:text-foreground transition-colors">
                                    <ExternalLink className="h-3.5 w-3.5" />
                                  </Link>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Agreements */}
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm">Agreements</CardTitle>
                      {talentContracts.length > 0 && (
                        <Badge variant="secondary" className="text-[10px]">{talentContracts.length}</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    {talentContracts.length === 0 ? (
                      <div className="px-4 pb-4 text-center py-6">
                        <FileText className="h-8 w-8 mx-auto text-muted-foreground/40 mb-2" />
                        <p className="text-sm text-muted-foreground">No agreements found</p>
                        <p className="text-xs text-muted-foreground/70 mt-1">Contracts linked to credited talent will appear here</p>
                      </div>
                    ) : (
                      <div>
                        {talentContracts.map(contract => (
                          <ContractCard key={contract.id} contract={contract} compact />
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

              </div>

              {/* Rights Summary Sidebar */}
              <div className="space-y-4 sticky top-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Rights Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Total Credited</span>
                      <span className="text-sm font-medium">{rightsSummary.total}</span>
                    </div>
                    {rightsSummary.authorized > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Authorized</span>
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 border-0 text-green-600 bg-green-50 dark:bg-green-900/20">{rightsSummary.authorized}</Badge>
                      </div>
                    )}
                    {rightsSummary.expiringSoon > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Expiring Soon</span>
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 border-0 text-orange-600 bg-orange-50 dark:bg-orange-900/20">{rightsSummary.expiringSoon}</Badge>
                      </div>
                    )}
                    {rightsSummary.expired > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Expired</span>
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 border-0 text-red-600 bg-red-50 dark:bg-red-900/20">{rightsSummary.expired}</Badge>
                      </div>
                    )}
                    {(rightsSummary.expiringSoon > 0 || rightsSummary.expired > 0) && (
                      <div className="pt-2 border-t">
                        <div className="flex items-center gap-1.5 text-xs text-amber-600">
                          <AlertTriangle className="h-3 w-3" />
                          <span>Rights attention needed</span>
                        </div>
                      </div>
                    )}
                    <div className="pt-2 border-t">
                      <Link 
                        href="/creative/talent-rights"
                        className="text-xs text-primary hover:underline flex items-center gap-1"
                      >
                        Manage all talent rights
                        <ChevronRight className="h-3 w-3" />
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Timeline Tab Content */}
          <TabsContent value="timeline" className="mt-3">
            <AssetTimeline asset={asset}>
              {commentsSection}
            </AssetTimeline>
          </TabsContent>

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
