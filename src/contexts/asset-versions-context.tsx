"use client"

import React, { createContext, useContext, useState, ReactNode } from "react"
import { AssetVersion, AssetVersionGroup, VersionComment, VersionStatus } from "@/types/creative"
import { toast } from "sonner"

interface AssetVersionsContextType {
  // Version groups
  versionGroups: AssetVersionGroup[]
  getVersionGroup: (groupId: string) => AssetVersionGroup | undefined
  getVersionGroupsByTask: (taskId: string) => AssetVersionGroup[]
  
  // Individual versions
  getVersion: (versionId: string) => AssetVersion | undefined
  submitNewVersion: (groupId: string, file: File, notes: string) => Promise<AssetVersion>
  updateVersionStatus: (versionId: string, status: VersionStatus, reason?: string) => Promise<void>
  
  // Comments
  addComment: (versionId: string, content: string, annotation?: {x: number, y: number}) => Promise<VersionComment>
  getCommentsByVersion: (versionId: string) => VersionComment[]
  
  // Comparison
  compareVersions: (versionId1: string, versionId2: string) => {changes: string[], metadata: any}
}

const AssetVersionsContext = createContext<AssetVersionsContextType | undefined>(undefined)

export function AssetVersionsProvider({ children }: { children: ReactNode }) {
  const [versionGroups, setVersionGroups] = useState<AssetVersionGroup[]>([])

  const getVersionGroup = (groupId: string): AssetVersionGroup | undefined => {
    return versionGroups.find(group => group.id === groupId)
  }

  const getVersionGroupsByTask = (taskId: string): AssetVersionGroup[] => {
    return versionGroups.filter(group => group.taskId === taskId)
  }

  const getVersion = (versionId: string): AssetVersion | undefined => {
    for (const group of versionGroups) {
      const version = group.versions.find(v => v.id === versionId)
      if (version) return version
    }
    return undefined
  }

  const submitNewVersion = async (
    groupId: string,
    file: File,
    notes: string
  ): Promise<AssetVersion> => {
    const group = getVersionGroup(groupId)
    if (!group) {
      throw new Error("Version group not found")
    }

    // Create new version
    const newVersion: AssetVersion = {
      id: `version-${Date.now()}`,
      versionNumber: group.totalVersions + 1,
      parentAssetId: groupId,
      taskId: group.taskId,
      name: file.name,
      fileUrl: URL.createObjectURL(file),
      thumbnailUrl: URL.createObjectURL(file),
      fileType: "image",
      contentType: "original",
      fileSize: file.size,
      mimeType: file.type,
      status: "submitted",
      uploadedAt: new Date(),
      uploadedById: "current-user",
      uploadedByName: "Current User",
      uploadedByRole: "Content Creator",
      submittedAt: new Date(),
      changeNotes: notes,
      previousVersionId: group.latestVersionId,
      commentsCount: 0,
      comments: [],
    }

    // Update version group
    const updatedGroup: AssetVersionGroup = {
      ...group,
      versions: [...group.versions, newVersion],
      latestVersionId: newVersion.id,
      totalVersions: group.totalVersions + 1,
      currentVersionNumber: newVersion.versionNumber,
      updatedAt: new Date(),
    }

    setVersionGroups(prev => 
      prev.map(g => g.id === groupId ? updatedGroup : g)
    )

    toast.success(`Version ${newVersion.versionNumber} submitted successfully`)
    return newVersion
  }

  const updateVersionStatus = async (
    versionId: string,
    status: VersionStatus,
    reason?: string
  ): Promise<void> => {
    const version = getVersion(versionId)
    if (!version) {
      throw new Error("Version not found")
    }

    const now = new Date()
    const updates: Partial<AssetVersion> = { status }

    // Update timestamp fields based on status
    switch (status) {
      case "submitted":
        updates.submittedAt = now
        break
      case "client_approved":
        updates.clientReviewedAt = now
        updates.clientReviewedBy = "current-user"
        break
      case "approved":
        updates.adminApprovedAt = now
        updates.adminApprovedBy = "current-user"
        break
      case "rejected":
        updates.rejectedAt = now
        updates.rejectedBy = "current-user"
        updates.rejectionReason = reason
        break
    }

    // Update version in the appropriate group
    setVersionGroups(prev =>
      prev.map(group => ({
        ...group,
        versions: group.versions.map(v =>
          v.id === versionId ? { ...v, ...updates } : v
        ),
      }))
    )

    toast.success(`Version status updated to ${status}`)
  }

  const addComment = async (
    versionId: string,
    content: string,
    annotation?: {x: number, y: number}
  ): Promise<VersionComment> => {
    const comment: VersionComment = {
      id: `comment-${Date.now()}`,
      versionId,
      content,
      authorId: "current-user",
      authorName: "Current User",
      authorRole: "Content Creator",
      createdAt: new Date(),
      ...(annotation && {
        annotationX: annotation.x,
        annotationY: annotation.y,
      }),
    }

    // Update version with new comment
    setVersionGroups(prev =>
      prev.map(group => ({
        ...group,
        versions: group.versions.map(v =>
          v.id === versionId
            ? {
                ...v,
                comments: [...v.comments, comment],
                commentsCount: v.commentsCount + 1,
              }
            : v
        ),
      }))
    )

    toast.success("Comment added")
    return comment
  }

  const getCommentsByVersion = (versionId: string): VersionComment[] => {
    const version = getVersion(versionId)
    return version?.comments || []
  }

  const compareVersions = (
    versionId1: string,
    versionId2: string
  ): {changes: string[], metadata: any} => {
    const v1 = getVersion(versionId1)
    const v2 = getVersion(versionId2)

    if (!v1 || !v2) {
      return { changes: [], metadata: {} }
    }

    const changes: string[] = []
    
    if (v1.fileSize !== v2.fileSize) {
      changes.push(`File size: ${v1.fileSize} → ${v2.fileSize}`)
    }
    if (v1.dimensions?.width !== v2.dimensions?.width || 
        v1.dimensions?.height !== v2.dimensions?.height) {
      changes.push(`Dimensions: ${v1.dimensions?.width}x${v1.dimensions?.height} → ${v2.dimensions?.width}x${v2.dimensions?.height}`)
    }
    if (v1.contentType !== v2.contentType) {
      changes.push(`Content type: ${v1.contentType} → ${v2.contentType}`)
    }

    return {
      changes,
      metadata: {
        version1: v1.versionNumber,
        version2: v2.versionNumber,
        timeDiff: v2.uploadedAt.getTime() - v1.uploadedAt.getTime(),
      },
    }
  }

  const value: AssetVersionsContextType = {
    versionGroups,
    getVersionGroup,
    getVersionGroupsByTask,
    getVersion,
    submitNewVersion,
    updateVersionStatus,
    addComment,
    getCommentsByVersion,
    compareVersions,
  }

  return (
    <AssetVersionsContext.Provider value={value}>
      {children}
    </AssetVersionsContext.Provider>
  )
}

export function useAssetVersions() {
  const context = useContext(AssetVersionsContext)
  if (!context) {
    throw new Error("useAssetVersions must be used within AssetVersionsProvider")
  }
  return context
}
