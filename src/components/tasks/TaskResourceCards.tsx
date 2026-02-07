'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  Image as ImageIcon, 
  Users, 
  Database, 
  Link2, 
  Plus, 
  ChevronDown, 
  ChevronUp,
  Upload,
  ExternalLink,
  Shield,
  Check,
  AlertTriangle,
  XCircle,
  Clock,
  FileText,
  Video,
  File,
  Eye
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { isApprovalApproved, isApprovalRejected, isApprovalPending } from '@/lib/approval-utils'
import { VersionStatusBadge } from '@/components/assets'
import { formatFileSize } from '@/lib/format-utils'
import Link from 'next/link'
import type { AssetVersionGroup } from '@/types/creative'
import type { AssignedCreator, LinkedAsset, ReferenceItem } from '@/types/mediaManager'
import { CopyrightCheckReview } from '@/components/creative/copyright-check-review'
import { mockAssets } from '@/lib/mock-data/creative'
import { toast } from 'sonner'

// =============================================================================
// 1. DELIVERABLE VERSIONS CARD
// =============================================================================

interface DeliverableVersionsCardProps {
  taskId: string
  versionGroups: AssetVersionGroup[]
  onUpload: () => void
}

export function DeliverableVersionsCard({ taskId, versionGroups, onUpload }: DeliverableVersionsCardProps) {
  const [expanded, setExpanded] = useState(false)
  const [reviewAsset, setReviewAsset] = useState<any | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  // Get asset approval status
  const getAssetApprovalStatus = (versionGroupId: string) => {
    const asset = mockAssets.find(a => a.id === versionGroupId)
    return {
      approvalStatus: asset?.approvalStatus,
      copyrightCheckData: asset?.copyrightCheckData,
      approvedBy: asset?.approvedBy,
      approvedAt: asset?.approvedAt,
      rejectionReason: asset?.rejectionReason
    }
  }

  // Handle approve
  const handleApprove = async (versionGroupId: string, e?: React.MouseEvent) => {
    e?.preventDefault()
    e?.stopPropagation()
    setIsProcessing(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      toast.success('Asset approved')
      // In real implementation, update asset status via API
    } catch (error) {
      toast.error('Failed to approve asset')
    } finally {
      setIsProcessing(false)
    }
  }

  // Handle reject
  const handleReject = async (versionGroupId: string, reason: string) => {
    setIsProcessing(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      toast.success('Asset rejected')
      setReviewAsset(null)
      // In real implementation, update asset status via API
    } catch (error) {
      toast.error('Failed to reject asset')
    } finally {
      setIsProcessing(false)
    }
  }

  // Handle review click
  const handleReview = (versionGroupId: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const asset = mockAssets.find(a => a.id === versionGroupId)
    if (asset) {
      setReviewAsset(asset)
    }
  }
  
  if (versionGroups.length === 0) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-base">Deliverables & Versions</CardTitle>
            </div>
            <Button variant="outline" size="sm" onClick={onUpload}>
              <Upload className="mr-2 h-4 w-4" />
              Upload
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center border-2 border-dashed rounded-lg">
            <ImageIcon className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">No deliverables yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              Upload your first version to get started
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const displayGroups = expanded ? versionGroups : versionGroups.slice(0, 3)
  const hasMore = versionGroups.length > 3

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ImageIcon className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-base">Deliverables & Versions</CardTitle>
            <Badge variant="secondary" className="text-xs">
              {versionGroups.length}
            </Badge>
          </div>
          <Button variant="outline" size="sm" onClick={onUpload}>
            <Upload className="mr-2 h-4 w-4" />
            Upload
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {displayGroups.map((group) => {
          const latestVersion = group.versions[group.versions.length - 1]
          const approvalInfo = getAssetApprovalStatus(group.id)
          const isPending = isApprovalPending(approvalInfo.approvalStatus)
          const isApproved = isApprovalApproved(approvalInfo.approvalStatus)
          const isRejected = isApprovalRejected(approvalInfo.approvalStatus)
          
          return (
            <div 
              key={group.id}
              className="flex flex-col gap-2 p-3 rounded-lg border hover:bg-accent transition-colors"
            >
              <div className="flex items-start gap-3">
                {latestVersion.thumbnailUrl && (
                  <img
                    src={latestVersion.thumbnailUrl}
                    alt={group.name}
                    className="w-16 h-16 object-cover rounded"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Link 
                      href={`/creative/assets/${group.id}`}
                      className="text-sm font-medium truncate hover:text-blue-600"
                    >
                      {group.name}
                    </Link>
                    <Badge variant="outline" className="text-[10px] font-mono px-1.5 py-0.5">
                      v{group.currentVersionNumber}
                    </Badge>
                    <VersionStatusBadge 
                      status={latestVersion.status}
                      className="text-[10px] px-1.5 py-0"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {group.totalVersions} {group.totalVersions === 1 ? 'version' : 'versions'} • {latestVersion.uploadedByName}
                  </p>

                  {/* Approval Status Indicators */}
                  {isPending && approvalInfo.copyrightCheckData && (
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                        <Clock className="w-3.5 h-3.5" />
                        <span className="text-xs font-medium">Pending Approval</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        Similarity: {approvalInfo.copyrightCheckData.similarityScore}%
                      </span>
                      <Badge 
                        variant="outline" 
                        className={cn(
                          "text-[10px] px-1.5 py-0",
                          approvalInfo.copyrightCheckData.riskBreakdown.riskLevel === 'high' && "border-red-500 text-red-600",
                          approvalInfo.copyrightCheckData.riskBreakdown.riskLevel === 'medium' && "border-amber-500 text-amber-600",
                          approvalInfo.copyrightCheckData.riskBreakdown.riskLevel === 'low' && "border-green-500 text-green-600"
                        )}
                      >
                        {approvalInfo.copyrightCheckData.riskBreakdown.riskLevel.toUpperCase()} RISK
                      </Badge>
                    </div>
                  )}

                  {isApproved && (
                    <div className="flex items-center gap-1.5 mt-2 text-green-600 dark:text-green-400">
                      <Check className="w-3.5 h-3.5" />
                      <span className="text-xs font-medium">Approved</span>
                      {approvalInfo.approvedAt && (
                        <span className="text-xs text-muted-foreground">
                          • {new Date(approvalInfo.approvedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  )}

                  {isRejected && (
                    <div className="flex flex-col gap-1 mt-2">
                      <div className="flex items-center gap-1.5 text-red-600 dark:text-red-400">
                        <XCircle className="w-3.5 h-3.5" />
                        <span className="text-xs font-medium">Rejected</span>
                      </div>
                      {approvalInfo.rejectionReason && (
                        <p className="text-xs text-muted-foreground">
                          {approvalInfo.rejectionReason}
                        </p>
                      )}
                    </div>
                  )}
                </div>
                
                <Link 
                  href={`/creative/assets/${group.id}`}
                  className="text-muted-foreground hover:text-foreground shrink-0"
                >
                  <ExternalLink className="h-4 w-4" />
                </Link>
              </div>

              {/* Approval Actions for Pending Assets */}
              {isPending && approvalInfo.copyrightCheckData && (
                <div className="flex items-center gap-2 pt-2 border-t">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs border-amber-500 text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-900/20"
                    onClick={(e) => handleReview(group.id, e)}
                    disabled={isProcessing}
                  >
                    <Eye className="w-3 h-3 mr-1" />
                    Review Details
                  </Button>
                  <Button
                    size="sm"
                    className="h-7 text-xs bg-green-600 hover:bg-green-700 text-white"
                    onClick={(e) => handleApprove(group.id, e)}
                    disabled={isProcessing}
                  >
                    <Check className="w-3 h-3 mr-1" />
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7 p-0 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      const asset = mockAssets.find(a => a.id === group.id)
                      if (asset) setReviewAsset(asset)
                    }}
                    disabled={isProcessing}
                    title="Reject"
                  >
                    <XCircle className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          )
        })}
        
        {hasMore && (
          <Button
            variant="ghost"
            size="sm"
            className="w-full"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? (
              <>
                <ChevronUp className="mr-2 h-4 w-4" />
                Show Less
              </>
            ) : (
              <>
                <ChevronDown className="mr-2 h-4 w-4" />
                Show {versionGroups.length - 3} More
              </>
            )}
          </Button>
        )}
      </CardContent>

      {/* Copyright Check Review Modal */}
      {reviewAsset && (
        <CopyrightCheckReview
          open={!!reviewAsset}
          onOpenChange={(open) => !open && setReviewAsset(null)}
          asset={reviewAsset}
          onApprove={() => handleApprove(reviewAsset.id)}
          onReject={handleReject}
        />
      )}
    </Card>
  )
}

// =============================================================================
// 2. CREATOR DNA CARD
// =============================================================================

interface CreatorDNACardProps {
  creators: AssignedCreator[]
  onManage: () => void
}

export function CreatorDNACard({ creators, onManage }: CreatorDNACardProps) {
  const [expanded, setExpanded] = useState(false)

  if (creators.length === 0) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-base">Talent Rights</CardTitle>
            </div>
            <Button variant="outline" size="sm" onClick={onManage}>
              <Plus className="mr-2 h-4 w-4" />
              Assign
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center border-2 border-dashed rounded-lg">
            <Users className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">No Talent Rights assigned</p>
            <p className="text-xs text-muted-foreground mt-1">
              Assign talent rights for AI generation
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const getStatusIcon = (status: AssignedCreator['authorizationStatus']) => {
    switch (status) {
      case 'authorized':
        return <Check className="h-3 w-3 text-green-600" />
      case 'expires-soon':
        return <AlertTriangle className="h-3 w-3 text-yellow-600" />
      case 'expired':
        return <XCircle className="h-3 w-3 text-red-600" />
      case 'pending':
        return <Clock className="h-3 w-3 text-gray-600" />
    }
  }

  const getStatusColor = (status: AssignedCreator['authorizationStatus']) => {
    switch (status) {
      case 'authorized':
        return 'bg-green-100 dark:bg-green-900/20 border-green-200 dark:border-green-800'
      case 'expires-soon':
        return 'bg-yellow-100 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
      case 'expired':
        return 'bg-red-100 dark:bg-red-900/20 border-red-200 dark:border-red-800'
      case 'pending':
        return 'bg-gray-100 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800'
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-base">Talent Rights</CardTitle>
            <Badge variant="secondary" className="text-xs">
              {creators.length}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
            <Button variant="outline" size="sm" onClick={onManage}>
              Manage
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {!expanded ? (
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {creators.slice(0, 4).map((creator) => (
                <Avatar key={creator.id} className="w-8 h-8 border-2 border-background">
                  <AvatarImage src={creator.avatarUrl} alt={creator.name} />
                  <AvatarFallback className="text-xs">
                    {creator.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              {creators.length} {creators.length === 1 ? 'creator' : 'creators'} assigned
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {creators.map((creator) => (
              <div
                key={creator.id}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg border",
                  getStatusColor(creator.authorizationStatus)
                )}
              >
                <Avatar className="w-10 h-10">
                  <AvatarImage src={creator.avatarUrl} alt={creator.name} />
                  <AvatarFallback>
                    {creator.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">{creator.name}</p>
                    {getStatusIcon(creator.authorizationStatus)}
                  </div>
                  <p className="text-xs text-muted-foreground">{creator.nilpId}</p>
                  {creator.role && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {creator.role}
                    </p>
                  )}
                  <div className="flex gap-1 mt-1">
                    {creator.nilpComponents.name && (
                      <Badge variant="outline" className="text-[10px] px-1 py-0">N</Badge>
                    )}
                    {creator.nilpComponents.image && (
                      <Badge variant="outline" className="text-[10px] px-1 py-0">I</Badge>
                    )}
                    {creator.nilpComponents.likeness && (
                      <Badge variant="outline" className="text-[10px] px-1 py-0">L</Badge>
                    )}
                    {creator.nilpComponents.personality && (
                      <Badge variant="outline" className="text-[10px] px-1 py-0">P</Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// =============================================================================
// 3. TRAINING DATA CARD
// =============================================================================

interface TrainingDataCardProps {
  datasets: LinkedAsset[]
  onManage: () => void
}

export function TrainingDataCard({ datasets, onManage }: TrainingDataCardProps) {
  const [expanded, setExpanded] = useState(false)

  if (datasets.length === 0) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-base">Training Data</CardTitle>
            </div>
            <Button variant="outline" size="sm" onClick={onManage}>
              <Plus className="mr-2 h-4 w-4" />
              Link
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center border-2 border-dashed rounded-lg">
            <Database className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">No training data linked</p>
            <p className="text-xs text-muted-foreground mt-1">
              Link datasets for AI model training
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const totalSize = datasets.reduce((acc, ds) => acc + ds.fileSize, 0)

  const getClearanceIcon = (status: 'cleared' | 'pending' | 'uncleared') => {
    switch (status) {
      case 'cleared':
        return <Shield className="h-3 w-3 text-green-600" />
      case 'pending':
        return <Shield className="h-3 w-3 text-gray-600" />
      case 'uncleared':
        return <Shield className="h-3 w-3 text-red-600" />
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-base">Training Data</CardTitle>
            <Badge variant="secondary" className="text-xs">
              {datasets.length}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
            <Button variant="outline" size="sm" onClick={onManage}>
              Manage
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {!expanded ? (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              {datasets.length} {datasets.length === 1 ? 'dataset' : 'datasets'} linked
            </p>
            <p className="text-xs text-muted-foreground">
              {formatFileSize(totalSize)} total
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {datasets.map((dataset) => (
              <div
                key={dataset.id}
                className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent transition-colors"
              >
                <Database className="h-4 w-4 text-muted-foreground shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium truncate">{dataset.filename}</p>
                    {getClearanceIcon(dataset.clearanceStatus)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(dataset.fileSize)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// =============================================================================
// 4. REFERENCES CARD
// =============================================================================

interface ReferencesCardProps {
  references: ReferenceItem[]
  onManage: () => void
}

export function ReferencesCard({ references, onManage }: ReferencesCardProps) {
  const [expanded, setExpanded] = useState(false)

  if (references.length === 0) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Link2 className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-base">References</CardTitle>
            </div>
            <Button variant="outline" size="sm" onClick={onManage}>
              <Plus className="mr-2 h-4 w-4" />
              Add
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center border-2 border-dashed rounded-lg">
            <Link2 className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">No references added</p>
            <p className="text-xs text-muted-foreground mt-1">
              Add reference materials and inspiration
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const displayRefs = expanded ? references : references.slice(0, 4)
  const hasMore = references.length > 4

  const getFileIcon = (type: string) => {
    if (type === 'url') return <Link2 className="h-4 w-4" />
    if (type === 'upload') {
      return <FileText className="h-4 w-4" />
    }
    return <File className="h-4 w-4" />
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link2 className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-base">References</CardTitle>
            <Badge variant="secondary" className="text-xs">
              {references.length}
            </Badge>
          </div>
          <Button variant="outline" size="sm" onClick={onManage}>
            <Plus className="mr-2 h-4 w-4" />
            Add
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {displayRefs.map((ref) => (
            <div
              key={ref.id}
              className="relative group"
              title={ref.filename || ref.url || 'Reference'}
            >
              {ref.thumbnailUrl ? (
                <div className="aspect-video rounded-lg overflow-hidden border bg-muted">
                  <img
                    src={ref.thumbnailUrl}
                    alt={ref.filename || 'Reference'}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="aspect-video rounded-lg border bg-muted flex items-center justify-center">
                  {getFileIcon(ref.type)}
                </div>
              )}
              <p className="text-xs truncate mt-1">
                {ref.filename || ref.url || 'Reference'}
              </p>
            </div>
          ))}
        </div>
        
        {hasMore && !expanded && (
          <Button
            variant="ghost"
            size="sm"
            className="w-full mt-3"
            onClick={() => setExpanded(true)}
          >
            <ChevronDown className="mr-2 h-4 w-4" />
            Show {references.length - 4} More
          </Button>
        )}
        
        {expanded && hasMore && (
          <Button
            variant="ghost"
            size="sm"
            className="w-full mt-3"
            onClick={() => setExpanded(false)}
          >
            <ChevronUp className="mr-2 h-4 w-4" />
            Show Less
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
