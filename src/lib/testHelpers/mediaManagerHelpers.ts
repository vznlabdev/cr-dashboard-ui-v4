/**
 * Media Manager Testing Helpers
 * 
 * Utilities for testing Media Manager functionality.
 * Includes mock data generators, simulation functions, and validation helpers.
 */

import type { MediaManagerData, LinkedAsset, AssignedCreator, ReferenceItem } from '@/types/mediaManager'

/**
 * Create mock media data for testing
 * 
 * @param type - Type of scenario to generate
 * @returns Mock media data
 */
export function createMockMediaData(
  type: 'empty' | 'minimal' | 'complete' | 'with-warnings' | 'with-errors' = 'minimal'
): MediaManagerData {
  switch (type) {
    case 'empty':
      return {
        assets: [],
        prompts: {
          text: '',
          saveToLibrary: false,
          isPrivate: true
        },
        training: [],
        references: [],
        creatorDNA: []
      }
    
    case 'minimal':
      return {
        assets: [createMockAsset('asset-1', 'cleared')],
        prompts: {
          text: 'Test prompt text',
          saveToLibrary: false,
          isPrivate: true
        },
        training: [],
        references: [],
        creatorDNA: [createMockCreator('creator-1', 'authorized')]
      }
    
    case 'complete':
      return {
        assets: [
          createMockAsset('asset-1', 'cleared'),
          createMockAsset('asset-2', 'cleared'),
          createMockAsset('asset-3', 'cleared')
        ],
        prompts: {
          text: 'Complete test prompt with details',
          saveToLibrary: true,
          title: 'Test Prompt',
          tags: ['test', 'product'],
          isPrivate: false
        },
        training: [
          createMockAsset('training-1', 'cleared'),
          createMockAsset('training-2', 'cleared')
        ],
        references: [
          createMockReference('ref-1', 'asset'),
          createMockReference('ref-2', 'url')
        ],
        creatorDNA: [
          createMockCreator('creator-1', 'authorized'),
          createMockCreator('creator-2', 'authorized')
        ]
      }
    
    case 'with-warnings':
      return {
        assets: [
          createMockAsset('asset-1', 'cleared'),
          createMockAsset('asset-2', 'pending') // Warning: pending clearance
        ],
        prompts: {
          text: 'Test prompt',
          saveToLibrary: false,
          isPrivate: true
        },
        training: [],
        references: [],
        creatorDNA: [
          createMockCreator('creator-1', 'expires-soon') // Warning: expires soon
        ]
      }
    
    case 'with-errors':
      return {
        assets: [
          createMockAsset('asset-1', 'uncleared') // Error: uncleared
        ],
        prompts: {
          text: '',
          saveToLibrary: false,
          isPrivate: true
        },
        training: [],
        references: [],
        creatorDNA: [
          createMockCreator('creator-1', 'expired') // Error: expired
        ]
      }
    
    default:
      return createMockMediaData('empty')
  }
}

/**
 * Create a mock asset
 */
export function createMockAsset(
  id: string,
  clearanceStatus: 'cleared' | 'pending' | 'uncleared' = 'cleared',
  filename?: string
): LinkedAsset {
  return {
    id,
    filename: filename || `test-asset-${id}.jpg`,
    fileType: 'image/jpeg',
    fileSize: 2048000, // 2MB
    thumbnailUrl: `https://picsum.photos/200/200?random=${id}`,
    clearanceStatus,
    source: 'library',
    uploadedAt: new Date()
  }
}

/**
 * Create a mock creator
 */
export function createMockCreator(
  id: string,
  authStatus: 'authorized' | 'expires-soon' | 'expired' | 'pending' = 'authorized',
  name?: string
): AssignedCreator {
  const now = new Date()
  let expirationDate: Date | undefined
  
  if (authStatus === 'expires-soon') {
    expirationDate = new Date(now.getTime() + 18 * 24 * 60 * 60 * 1000) // 18 days
  } else if (authStatus === 'expired') {
    expirationDate = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000) // 10 days ago
  } else if (authStatus === 'authorized') {
    expirationDate = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000) // 1 year
  }
  
  return {
    id,
    name: name || `Test Creator ${id}`,
    nilpId: `CR-2025-${String(Math.floor(Math.random() * 10000)).padStart(5, '0')}`,
    avatarUrl: `https://i.pravatar.cc/150?img=${id}`,
    authorizationStatus: authStatus,
    expirationDate,
    role: 'Model',
    nilpComponents: {
      name: true,
      image: true,
      likeness: true,
      personality: false
    }
  }
}

/**
 * Create a mock reference
 */
export function createMockReference(
  id: string,
  type: 'asset' | 'upload' | 'url' = 'asset'
): ReferenceItem {
  if (type === 'url') {
    return {
      id,
      type: 'url',
      url: `https://example.com/reference-${id}`,
      thumbnailUrl: `https://picsum.photos/200/200?random=${id}`,
      notes: 'Test URL reference',
      order: 0
    }
  }
  
  return {
    id,
    type,
    filename: `reference-${id}.pdf`,
    thumbnailUrl: `https://picsum.photos/200/200?random=${id}`,
    fileSize: 1024000, // 1MB
    notes: 'Test reference file',
    order: 0
  }
}

/**
 * Simulate file upload
 * 
 * @param file - File to upload (can be mock)
 * @param onProgress - Progress callback
 * @returns Promise resolving to upload result
 */
export async function simulateAssetUpload(
  file: File,
  onProgress?: (progress: number) => void
): Promise<{ success: boolean; assetId?: string; error?: string }> {
  // Simulate upload progress
  for (let i = 0; i <= 100; i += 10) {
    await new Promise(resolve => setTimeout(resolve, 100))
    onProgress?.(i)
  }
  
  // Simulate random success/failure
  const success = Math.random() > 0.1 // 90% success rate
  
  if (success) {
    return {
      success: true,
      assetId: `asset-${Date.now()}`
    }
  } else {
    return {
      success: false,
      error: 'Upload failed: Network error'
    }
  }
}

/**
 * Simulate clearance check
 * 
 * @param assetId - Asset ID to check
 * @param forceStatus - Force a specific status (for testing)
 * @returns Promise resolving to clearance status
 */
export async function simulateClearanceCheck(
  assetId: string,
  forceStatus?: 'cleared' | 'pending' | 'uncleared'
): Promise<{ status: 'cleared' | 'pending' | 'uncleared'; details?: string }> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500))
  
  if (forceStatus) {
    return { status: forceStatus }
  }
  
  // Random status for testing
  const random = Math.random()
  if (random > 0.8) {
    return { status: 'cleared' }
  } else if (random > 0.3) {
    return { status: 'pending', details: 'Awaiting admin review' }
  } else {
    return { status: 'uncleared', details: 'Failed copyright check' }
  }
}

/**
 * Validate media requirements
 * 
 * @param mediaData - Media data to validate
 * @param creationMethod - Creation method
 * @returns Validation result with errors and warnings
 */
export function validateMediaRequirements(
  mediaData: MediaManagerData,
  creationMethod: 'human-made' | 'ai-generated' | 'ai-enhanced'
): {
  isValid: boolean
  errors: string[]
  warnings: string[]
} {
  const errors: string[] = []
  const warnings: string[] = []
  
  // Check assets
  if ((creationMethod === 'human-made' || creationMethod === 'ai-enhanced') && mediaData.assets.length === 0) {
    errors.push('At least one asset is required')
  }
  
  const unclearedAssets = mediaData.assets.filter(a => a.clearanceStatus === 'uncleared')
  if (unclearedAssets.length > 0) {
    errors.push(`${unclearedAssets.length} asset(s) failed clearance`)
  }
  
  const pendingAssets = mediaData.assets.filter(a => a.clearanceStatus === 'pending')
  if (pendingAssets.length > 0) {
    warnings.push(`${pendingAssets.length} asset(s) pending clearance`)
  }
  
  // Check prompts
  if ((creationMethod === 'ai-generated' || creationMethod === 'ai-enhanced') && !mediaData.prompts.text.trim()) {
    errors.push('Prompt is required for AI tasks')
  }
  
  // Check training data
  if (creationMethod === 'ai-generated' && mediaData.training.length === 0) {
    errors.push('Training data is required for AI-generated tasks')
  }
  
  // Check creator DNA
  if (mediaData.creatorDNA.length === 0) {
    errors.push('At least one creator must be assigned')
  }
  
  const expiredCreators = mediaData.creatorDNA.filter(c => c.authorizationStatus === 'expired')
  if (expiredCreators.length > 0) {
    errors.push(`${expiredCreators.length} creator(s) have expired authorization`)
  }
  
  const expiringSoonCreators = mediaData.creatorDNA.filter(c => c.authorizationStatus === 'expires-soon')
  if (expiringSoonCreators.length > 0) {
    warnings.push(`${expiringSoonCreators.length} creator(s) expire soon`)
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  }
}

/**
 * Get media summary text
 * 
 * @param mediaData - Media data
 * @returns Human-readable summary
 */
export function getMediaSummaryText(mediaData: MediaManagerData): string {
  const parts: string[] = []
  
  if (mediaData.assets.length > 0) {
    parts.push(`${mediaData.assets.length} Asset${mediaData.assets.length > 1 ? 's' : ''}`)
  }
  
  if (mediaData.prompts.text.trim()) {
    parts.push('1 Prompt')
  }
  
  if (mediaData.training.length > 0) {
    parts.push(`${mediaData.training.length} Training Dataset${mediaData.training.length > 1 ? 's' : ''}`)
  }
  
  if (mediaData.references.length > 0) {
    parts.push(`${mediaData.references.length} Reference${mediaData.references.length > 1 ? 's' : ''}`)
  }
  
  if (mediaData.creatorDNA.length > 0) {
    parts.push(`${mediaData.creatorDNA.length} Creator${mediaData.creatorDNA.length > 1 ? 's' : ''}`)
  }
  
  return parts.length > 0 ? parts.join(', ') : 'No media attached'
}

/**
 * Generate random media data (for stress testing)
 */
export function generateRandomMediaData(
  assetCount: number = 5,
  creatorCount: number = 2
): MediaManagerData {
  return {
    assets: Array.from({ length: assetCount }, (_, i) => 
      createMockAsset(`random-asset-${i}`, Math.random() > 0.8 ? 'pending' : 'cleared')
    ),
    prompts: {
      text: `Random test prompt ${Date.now()}`,
      saveToLibrary: Math.random() > 0.5,
      title: 'Random Prompt',
      tags: ['test', 'random'],
      isPrivate: Math.random() > 0.5
    },
    training: Array.from({ length: Math.floor(assetCount / 2) }, (_, i) =>
      createMockAsset(`random-training-${i}`, 'cleared')
    ),
    references: Array.from({ length: 3 }, (_, i) =>
      createMockReference(`random-ref-${i}`, i % 2 === 0 ? 'asset' : 'url')
    ),
    creatorDNA: Array.from({ length: creatorCount }, (_, i) =>
      createMockCreator(`random-creator-${i}`, 'authorized')
    )
  }
}

/**
 * Data test IDs for E2E testing
 */
export const mediaManagerTestIds = {
  modal: 'media-manager-modal',
  header: 'media-manager-header',
  tabs: {
    assets: 'tab-assets',
    prompts: 'tab-prompts',
    training: 'tab-training',
    references: 'tab-references',
    creatorDNA: 'tab-creator-dna'
  },
  buttons: {
    save: 'button-save',
    cancel: 'button-cancel',
    linkAssets: 'button-link-assets',
    uploadAssets: 'button-upload-assets',
    addCreator: 'button-add-creator'
  },
  inputs: {
    promptText: 'input-prompt-text',
    promptTitle: 'input-prompt-title',
    saveToLibrary: 'checkbox-save-to-library'
  },
  lists: {
    assets: 'list-assets',
    training: 'list-training',
    references: 'list-references',
    creators: 'list-creators'
  }
}
