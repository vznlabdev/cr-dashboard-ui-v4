"use client"

import { Asset, DESIGN_TYPE_CONFIG } from "@/types/creative"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { formatFileSize } from "@/lib/format-utils"
import { format } from "date-fns"
import {
  Download,
  ExternalLink,
  Sparkles,
  CheckCircle2,
  XCircle,
} from "lucide-react"
import Image from "next/image"

interface AssetCardProps {
  asset: Asset
  variant?: "grid" | "list"
  selected?: boolean
  onSelect?: (id: string, selected: boolean) => void
  onClick?: (asset: Asset) => void
  className?: string
}

export function AssetCard({
  asset,
  variant = "grid",
  selected = false,
  onSelect,
  onClick,
  className,
}: AssetCardProps) {
  const designTypeConfig = DESIGN_TYPE_CONFIG[asset.designType]
  const isAIGenerated = asset.contentType === "ai_generated"
  const copyrightStatus = asset.copyrightCheckStatus
  const approvalStatus = asset.approvalStatus
  const needsApproval = approvalStatus === "pending"
  const isApproved = approvalStatus === "approved"
  const isRejected = approvalStatus === "rejected"

  const handleClick = (e: React.MouseEvent) => {
    // Don't trigger onClick if clicking on checkbox
    if ((e.target as HTMLElement).closest('[role="checkbox"]')) return
    onClick?.(asset)
  }

  const handleCheckboxChange = (checked: boolean) => {
    onSelect?.(asset.id, checked)
  }

  if (variant === "list") {
    return (
      <Card
        className={cn(
          "group cursor-pointer hover:shadow-md transition-all py-0",
          selected && "ring-2 ring-primary",
          className
        )}
        onClick={handleClick}
      >
        <CardContent className="p-5">
          <div className="flex items-center gap-4">
            {/* Checkbox */}
            {onSelect && (
              <Checkbox
                checked={selected}
                onCheckedChange={handleCheckboxChange}
                className="shrink-0"
              />
            )}

            {/* Thumbnail */}
            <div className="relative h-12 w-12 rounded overflow-hidden bg-muted shrink-0">
              <Image
                src={asset.thumbnailUrl}
                alt={asset.name}
                fill
                className="object-cover"
              />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{asset.name}</p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>{formatFileSize(asset.fileSize)}</span>
                <span>•</span>
                <span>{format(asset.createdAt, "MMM d, yyyy")}</span>
              </div>
            </div>

            {/* Brand */}
            <div className="flex items-center gap-2">
              <div
                className="h-3 w-3 rounded-full shrink-0"
                style={{ backgroundColor: asset.brandColor || "#666" }}
              />
              <span className="text-sm text-muted-foreground truncate max-w-[100px]">
                {asset.brandName}
              </span>
            </div>

            {/* Content Type Icon */}
            {isAIGenerated && (
              <div className="flex items-center gap-1.5 shrink-0">
                <div className="bg-yellow-400 rounded p-1">
                  <Sparkles className="h-4 w-4 text-black" />
                </div>
              </div>
            )}

            {/* Copyright check status */}
            {copyrightStatus === "completed" && (
              <div className="flex items-center gap-1 shrink-0">
                {asset.copyrightCheckData?.similarityScore !== undefined &&
                asset.copyrightCheckData.similarityScore < 30 ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-amber-500" />
                )}
                {needsApproval && (
                  <Badge variant="outline" className="text-xs text-amber-600 border-amber-500">
                    Review
                  </Badge>
                )}
              </div>
            )}

            {/* Approval status */}
            {isApproved && (
              <Badge variant="default" className="bg-green-500 hover:bg-green-600 text-xs">
                Approved
              </Badge>
            )}
            {isRejected && (
              <Badge variant="destructive" className="text-xs">
                Rejected
              </Badge>
            )}

            {/* Actions */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <a
                href={asset.fileUrl}
                download
                onClick={(e) => e.stopPropagation()}
                className="p-2 hover:bg-muted rounded-md"
              >
                <Download className="h-4 w-4" />
              </a>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onClick?.(asset)
                }}
                className="p-2 hover:bg-muted rounded-md"
              >
                <ExternalLink className="h-4 w-4" />
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Grid variant (default)
  return (
    <Card
      className={cn(
        "group cursor-pointer overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1 py-0",
        selected && "ring-2 ring-primary",
        className
      )}
      onClick={handleClick}
    >
      {/* Thumbnail */}
      <div className="relative aspect-[4/3] bg-muted">
        <Image
          src={asset.thumbnailUrl}
          alt={asset.name}
          fill
          className="object-cover transition-transform group-hover:scale-105"
        />
        
        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <a
            href={asset.fileUrl}
            download
            onClick={(e) => e.stopPropagation()}
            className="p-2 bg-white/20 hover:bg-white/30 rounded-full backdrop-blur-sm"
          >
            <Download className="h-5 w-5 text-white" />
          </a>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onClick?.(asset)
            }}
            className="p-2 bg-white/20 hover:bg-white/30 rounded-full backdrop-blur-sm"
          >
            <ExternalLink className="h-5 w-5 text-white" />
          </button>
        </div>

        {/* Checkbox */}
        {onSelect && (
          <div className="absolute top-2 left-2">
            <Checkbox
              checked={selected}
              onCheckedChange={handleCheckboxChange}
              className="bg-white/80 backdrop-blur-sm"
            />
          </div>
        )}

            {/* Content type icon */}
            {isAIGenerated && (
              <div className="absolute top-2 right-2 bg-yellow-400 rounded p-1.5">
                <Sparkles className="h-4 w-4 text-black" />
              </div>
            )}

            {/* Copyright check status */}
            {copyrightStatus === "completed" && (
              <div className="absolute top-2 left-2 flex items-center gap-1 bg-white/90 backdrop-blur-sm rounded px-1.5 py-0.5">
                {asset.copyrightCheckData?.similarityScore !== undefined &&
                asset.copyrightCheckData.similarityScore < 30 ? (
                  <CheckCircle2 className="h-3 w-3 text-green-500" />
                ) : (
                  <XCircle className="h-3 w-3 text-amber-500" />
                )}
                {needsApproval && (
                  <span className="text-xs font-medium text-amber-600">Review</span>
                )}
              </div>
            )}

            {/* Approval status badge */}
            {isApproved && (
              <div className="absolute bottom-2 right-2 bg-green-500 text-white rounded px-2 py-0.5 text-xs font-medium">
                Approved
              </div>
            )}
            {isRejected && (
              <div className="absolute bottom-2 right-2 bg-red-500 text-white rounded px-2 py-0.5 text-xs font-medium">
                Rejected
              </div>
            )}

        {/* Brand color bar */}
        <div
          className="absolute bottom-0 left-0 right-0 h-1"
          style={{ backgroundColor: asset.brandColor || "#666" }}
        />
      </div>

      <CardContent className="p-5">
        {/* Name */}
        <h3 className="font-medium text-sm truncate mb-1" title={asset.name}>
          {asset.name}
        </h3>

        {/* Meta */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="truncate flex-1" title={asset.brandName}>
            {asset.brandName}
          </span>
          <span className="shrink-0 ml-2">{formatFileSize(asset.fileSize)}</span>
        </div>

        {/* Design type */}
        <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
          <span>{designTypeConfig.iconName}</span>
          <span className="truncate">{designTypeConfig.label}</span>
        </div>
      </CardContent>
    </Card>
  )
}

