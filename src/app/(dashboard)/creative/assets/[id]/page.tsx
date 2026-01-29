"use client"

import { useRouter, useParams } from "next/navigation"
import { mockAssets } from "@/lib/mock-data/creative"
import { formatFileSize, formatDateLong } from "@/lib/format-utils"
import { PageContainer } from "@/components/layout/PageContainer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Download,
  Calendar,
  User,
  Palette,
  Ticket,
  Tag,
  FileImage,
  Sparkles,
  Shield,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ChevronLeft,
  MoreHorizontal,
  Trash2,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { PromptContent } from "@/components/creative/PromptContent"
import { useCreators } from "@/contexts/creators-context"
import { CreatorAvatarBadge } from "@/components/creators"
import { useMemo } from "react"
import { ASSET_CONTENT_TYPE_CONFIG, DESIGN_TYPE_CONFIG } from "@/types/creative"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"

export default function AssetDetailPage() {
  const router = useRouter()
  const params = useParams()
  const assetId = params.id as string
  const asset = mockAssets.find((a) => a.id === assetId)
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
  const creditedCreators = getCreatorsByAsset(asset.id)

  // Get credits with roles for this asset
  const assetCreditsWithRoles = useMemo(() => {
    return creditedCreators.map((creator) => {
      const creatorCredits = getAllCreditsByCreator(creator.id)
      const assetCredit = creatorCredits.find((credit) => credit.assetId === asset.id)
      return {
        creator,
        role: assetCredit?.role,
      }
    })
  }, [creditedCreators, asset.id, getAllCreditsByCreator])

  const contentTypeConfig = ASSET_CONTENT_TYPE_CONFIG[asset.contentType]
  const designTypeConfig = DESIGN_TYPE_CONFIG[asset.designType]
  const isAIGenerated = asset.contentType === "ai_generated"

  return (
    <PageContainer className="space-y-6 animate-fade-in">
      {/* Header Section */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Link href="/creative/assets" className="hover:text-foreground transition-colors">
              Assets
            </Link>
            <span>/</span>
            <span className="text-foreground">{asset.name}</span>
          </div>

          {/* Title */}
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold">{asset.name}</h1>
            {isAIGenerated && (
              <div className="bg-yellow-400 rounded p-1">
                <Sparkles className="h-4 w-4 text-black" />
              </div>
            )}
          </div>

          {/* Inline Stats */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link 
              href={`/creative/brands/${asset.brandId}`}
              className="hover:text-foreground transition-colors flex items-center gap-1.5"
            >
              {asset.brandColor && (
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: asset.brandColor }}
                />
              )}
              {asset.brandName}
            </Link>
            <span>•</span>
            <span>{designTypeConfig.label}</span>
            <span>•</span>
            <span>{formatFileSize(asset.fileSize)}</span>
            {asset.dimensions && (
              <>
                <span>•</span>
                <span>{asset.dimensions.width} × {asset.dimensions.height}</span>
              </>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/creative/assets">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>
          <Button size="sm" asChild>
            <a href={asset.fileUrl} download>
              <Download className="mr-2 h-4 w-4" />
              Download
            </a>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => toast.success("Edit feature coming soon!")}>
                Edit Details
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => toast.success("Delete feature coming soon!")}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Asset
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Main Content - Two Column Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Preview & Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Preview Image */}
          <Card>
            <CardContent className="p-0">
              <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                {asset.fileType === "image" ? (
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
              <CardHeader>
                <CardTitle className="text-base">Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {asset.description}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Tags */}
          {asset.tags.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Tags</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {asset.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
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
        <div className="space-y-4">
          {/* Brand Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Palette className="h-4 w-4 text-muted-foreground" />
                Brand
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Link
                href={`/creative/brands/${asset.brandId}`}
                className="flex items-center gap-2 hover:underline"
              >
                {asset.brandColor && (
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: asset.brandColor }}
                  />
                )}
                <span className="text-sm font-medium">{asset.brandName}</span>
              </Link>
            </CardContent>
          </Card>

          {/* Ticket Card (if applicable) */}
          {asset.ticketId && asset.ticketTitle && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Ticket className="h-4 w-4 text-muted-foreground" />
                  From Ticket
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Link
                  href={`/creative/tickets/${asset.ticketId}`}
                  className="text-sm font-medium hover:underline"
                >
                  {asset.ticketTitle}
                </Link>
              </CardContent>
            </Card>
          )}

          {/* Details Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-xs text-muted-foreground">Design Type</p>
                <p className="text-sm font-medium">{designTypeConfig.label}</p>
              </div>

              {isAIGenerated && (
                <div>
                  <p className="text-xs text-muted-foreground">Content Type</p>
                  <div className="flex items-center gap-1.5">
                    <div className="bg-yellow-400 rounded p-1">
                      <Sparkles className="h-3 w-3 text-black" />
                    </div>
                    <p className="text-sm font-medium">{contentTypeConfig.label}</p>
                  </div>
                </div>
              )}

              <Separator />

              <div>
                <p className="text-xs text-muted-foreground">Uploaded By</p>
                <p className="text-sm font-medium">{asset.uploadedByName}</p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">Date</p>
                <p className="text-sm font-medium">{formatDateLong(asset.createdAt)}</p>
              </div>
            </CardContent>
          </Card>

          {/* File Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">File Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">File Size</span>
                <span className="font-medium">{formatFileSize(asset.fileSize)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Type</span>
                <span className="font-medium">{asset.mimeType}</span>
              </div>
              {asset.dimensions && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Dimensions</span>
                  <span className="font-medium">
                    {asset.dimensions.width} × {asset.dimensions.height}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Copyright Check Card */}
          {asset.copyrightCheckStatus && asset.copyrightCheckData && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  Copyright Check
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Similarity Score</span>
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
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Risk Level</span>
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
                  <div>
                    <span className="text-xs text-muted-foreground">
                      {asset.copyrightCheckData.matchedSources.length} match
                      {asset.copyrightCheckData.matchedSources.length !== 1 ? "es" : ""} found
                    </span>
                  </div>
                )}

                {asset.approvalStatus && (
                  <>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Approval Status</span>
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

          {/* Credited Creators Card */}
          {creditedCreators.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  Credited Creators
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  {assetCreditsWithRoles.map(({ creator, role }) => (
                    <div key={creator.id} className="flex flex-col items-center gap-1">
                      <CreatorAvatarBadge creator={creator} size="sm" />
                      {role && (
                        <Badge variant="secondary" className="text-xs px-1.5 py-0">
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
    </PageContainer>
  )
}
