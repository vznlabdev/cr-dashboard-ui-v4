"use client"

import { Asset, ASSET_CONTENT_TYPE_CONFIG, DESIGN_TYPE_CONFIG } from "@/types/creative"
import { formatFileSize, formatDateLong } from "@/lib/format-utils"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
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
} from "lucide-react"
import { getDesignTypeIcon } from "@/lib/design-icons"
import Image from "next/image"
import Link from "next/link"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PromptContent } from "./PromptContent"
import { useState } from "react"

interface AssetPreviewModalProps {
  asset: Asset | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AssetPreviewModal({
  asset,
  open,
  onOpenChange,
}: AssetPreviewModalProps) {
  const [activeTab, setActiveTab] = useState("preview")
  
  if (!asset) return null

  const contentTypeConfig = ASSET_CONTENT_TYPE_CONFIG[asset.contentType]
  const designTypeConfig = DESIGN_TYPE_CONFIG[asset.designType]
  const DesignIcon = getDesignTypeIcon(designTypeConfig.iconName)
  const isAIGenerated = asset.contentType === "ai_generated"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[1600px] sm:max-w-[1600px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="shrink-0">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <DialogTitle className="text-xl">{asset.name}</DialogTitle>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {isAIGenerated && (
                  <>
                    <div className="bg-yellow-400 rounded p-1">
                      <Sparkles className="h-4 w-4 text-black" />
                    </div>
                    <span>•</span>
                  </>
                )}
                <span>{formatFileSize(asset.fileSize)}</span>
                {asset.dimensions && (
                  <>
                    <span>•</span>
                    <span>{asset.dimensions.width} × {asset.dimensions.height}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="shrink-0">
            <TabsTrigger value="preview">Preview</TabsTrigger>
          {asset.promptHistory && (
            <TabsTrigger value="prompt-history">Prompt</TabsTrigger>
          )}
          </TabsList>

          <TabsContent value="preview" className="flex-1 overflow-auto mt-4 scrollbar-thin">
            <div className="grid lg:grid-cols-3 gap-6">
            {/* Preview */}
            <div className="lg:col-span-2">
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

              {/* Description */}
              {asset.description && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-1">Description</h4>
                  <p className="text-sm text-muted-foreground">
                    {asset.description}
                  </p>
                </div>
              )}

              {/* Tags */}
              {asset.tags.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-2">Tags</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {asset.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        <Tag className="h-3 w-3 mr-1" />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Details Sidebar */}
            <div className="space-y-4">
              {/* Download Button */}
              <Button className="w-full" asChild>
                <a href={asset.fileUrl} download>
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </a>
              </Button>

              <Separator />

              {/* Metadata */}
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Palette className="h-4 w-4 mt-0.5 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Brand</p>
                    <Link
                      href={`/creative/brands/${asset.brandId}`}
                      className="text-sm font-medium hover:underline flex items-center gap-2"
                    >
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: asset.brandColor || "#666" }}
                      />
                      {asset.brandName}
                    </Link>
                  </div>
                </div>

                {asset.ticketId && asset.ticketTitle && (
                  <div className="flex items-start gap-3">
                    <Ticket className="h-4 w-4 mt-0.5 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">From Ticket</p>
                      <Link
                        href={`/creative/tickets/${asset.ticketId}`}
                        className="text-sm font-medium hover:underline"
                      >
                        {asset.ticketTitle}
                      </Link>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <FileImage className="h-4 w-4 mt-0.5 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Design Type</p>
                    <p className="text-sm font-medium flex items-center gap-1.5">
                      <DesignIcon className="h-4 w-4" />
                      {designTypeConfig.label}
                    </p>
                  </div>
                </div>

                {isAIGenerated && (
                  <div className="flex items-start gap-3">
                    <div className="bg-yellow-400 rounded p-1 mt-0.5">
                      <Sparkles className="h-4 w-4 text-black" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Content Type</p>
                      <p className="text-sm font-medium flex items-center gap-1.5">
                        {contentTypeConfig.label}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <User className="h-4 w-4 mt-0.5 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Uploaded By</p>
                    <p className="text-sm font-medium">{asset.uploadedByName}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="h-4 w-4 mt-0.5 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Date</p>
                    <p className="text-sm font-medium">
                      {formatDateLong(asset.createdAt)}
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* File Info */}
              <div className="space-y-2 text-sm">
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
              </div>
            </div>
          </div>
          </TabsContent>

          {asset.promptHistory && (
            <TabsContent value="prompt-history" className="flex-1 overflow-auto mt-4 scrollbar-thin">
              <PromptContent history={asset.promptHistory} />
            </TabsContent>
          )}
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

