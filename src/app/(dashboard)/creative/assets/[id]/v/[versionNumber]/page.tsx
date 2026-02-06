"use client"

import { useParams, useRouter } from "next/navigation"
import { useEffect } from "react"
import { getVersionGroupById } from "@/lib/mock-data/creative"

// Import the existing AssetDetailPage component
import AssetDetailPage from "../../page"

export default function VersionDetailPage() {
  const params = useParams()
  const router = useRouter()
  const assetId = params.id as string
  const versionNumber = params.versionNumber ? parseInt(params.versionNumber as string) : null

  const versionGroup = getVersionGroupById(assetId)

  useEffect(() => {
    // If this is a version group and we have a valid version number, all is good
    if (versionGroup && versionNumber) {
      const version = versionGroup.versions.find(v => v.versionNumber === versionNumber)
      if (!version) {
        // Invalid version number, redirect to latest
        router.replace(`/creative/assets/${assetId}/v/${versionGroup.currentVersionNumber}`)
      }
    } else if (!versionGroup) {
      // Not a version group, redirect to base asset page
      router.replace(`/creative/assets/${assetId}`)
    }
  }, [versionGroup, versionNumber, assetId, router])

  // Render the existing AssetDetailPage component
  // It will handle the version-specific rendering based on URL params
  return <AssetDetailPage />
}
