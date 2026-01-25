import type { MediaManagerData } from '@/types/mediaManager'

/**
 * Get total count of media items across all tabs
 */
export function getMediaCount(mediaData: MediaManagerData | null): number {
  if (!mediaData) return 0
  
  return (
    mediaData.assets.length +
    (mediaData.prompts.text.trim().length > 0 ? 1 : 0) +
    mediaData.training.length +
    mediaData.references.length +
    mediaData.creatorDNA.length
  )
}

/**
 * Get a summary of media data for display
 */
export function getMediaSummary(mediaData: MediaManagerData | null): string {
  if (!mediaData) return 'No media attached'
  
  const parts: string[] = []
  
  if (mediaData.assets.length > 0) {
    parts.push(`${mediaData.assets.length} Asset${mediaData.assets.length !== 1 ? 's' : ''}`)
  }
  
  if (mediaData.prompts.text.trim().length > 0) {
    parts.push('1 Prompt')
  }
  
  if (mediaData.training.length > 0) {
    parts.push(`${mediaData.training.length} Training Dataset${mediaData.training.length !== 1 ? 's' : ''}`)
  }
  
  if (mediaData.references.length > 0) {
    parts.push(`${mediaData.references.length} Reference${mediaData.references.length !== 1 ? 's' : ''}`)
  }
  
  if (mediaData.creatorDNA.length > 0) {
    parts.push(`${mediaData.creatorDNA.length} Creator${mediaData.creatorDNA.length !== 1 ? 's' : ''}`)
  }
  
  return parts.length > 0 ? parts.join(', ') : 'No media attached'
}

/**
 * Get media data warnings for display
 */
export function getMediaWarnings(mediaData: MediaManagerData | null): string[] {
  if (!mediaData) return []
  
  const warnings: string[] = []
  
  // Check for expiring creator authorizations
  const expiringSoonCreators = mediaData.creatorDNA.filter(
    c => c.authorizationStatus === 'expires-soon'
  )
  if (expiringSoonCreators.length > 0) {
    warnings.push(
      `${expiringSoonCreators.length} creator authorization${expiringSoonCreators.length !== 1 ? 's' : ''} expire${expiringSoonCreators.length === 1 ? 's' : ''} soon`
    )
  }
  
  // Check for pending creator authorizations
  const pendingCreators = mediaData.creatorDNA.filter(
    c => c.authorizationStatus === 'pending'
  )
  if (pendingCreators.length > 0) {
    warnings.push(
      `${pendingCreators.length} creator authorization${pendingCreators.length !== 1 ? 's are' : ' is'} pending`
    )
  }
  
  // Check for pending asset clearances
  const pendingAssets = mediaData.assets.filter(
    a => a.clearanceStatus === 'pending'
  )
  if (pendingAssets.length > 0) {
    warnings.push(
      `${pendingAssets.length} asset${pendingAssets.length !== 1 ? 's' : ''} pending clearance review`
    )
  }
  
  return warnings
}

/**
 * Check if media data has any content
 */
export function hasMediaData(mediaData: MediaManagerData | null): boolean {
  return getMediaCount(mediaData) > 0
}

/**
 * Get empty media data structure
 */
export function getEmptyMediaData(): MediaManagerData {
  return {
    assets: [],
    prompts: {
      text: '',
      saveToLibrary: false,
      title: undefined,
      tags: undefined,
      isPrivate: true
    },
    training: [],
    references: [],
    creatorDNA: []
  }
}
