/**
 * Helper Functions for Mock Data
 * Utility functions for filtering, searching, and manipulating mock data
 */

import { MOCK_ASSET_LIBRARY } from './assetLibrary'
import { MOCK_PERSONA_LIBRARY } from './personaLibrary'
import { MOCK_PROMPT_LIBRARY, type PromptLibraryItem } from './promptLibrary'
import { MOCK_TRAINING_DATASETS, type TrainingDataset } from './trainingDatasets'
import type { LinkedAsset, AssignedCreator } from '@/types/mediaManager'

// ========== ASSET HELPERS ==========

/**
 * Filter assets by clearance status
 */
export function getAssetsByStatus(
  status: 'cleared' | 'pending' | 'uncleared'
): LinkedAsset[] {
  return MOCK_ASSET_LIBRARY.filter(asset => asset.clearanceStatus === status)
}

/**
 * Filter assets by file type (extension)
 */
export function getAssetsByType(fileExtension: string): LinkedAsset[] {
  const ext = fileExtension.toLowerCase().replace('.', '')
  return MOCK_ASSET_LIBRARY.filter(asset => {
    const assetExt = asset.filename.split('.').pop()?.toLowerCase()
    return assetExt === ext
  })
}

/**
 * Search assets by filename or tags
 */
export function searchAssets(query: string): LinkedAsset[] {
  const lowerQuery = query.toLowerCase()
  return MOCK_ASSET_LIBRARY.filter(asset => {
    const filenameMatch = asset.filename.toLowerCase().includes(lowerQuery)
    const tagsMatch = asset.metadata?.tags?.some(tag => 
      tag.toLowerCase().includes(lowerQuery)
    )
    return filenameMatch || tagsMatch
  })
}

/**
 * Get random assets for testing
 */
export function getRandomAssets(count: number): LinkedAsset[] {
  const shuffled = [...MOCK_ASSET_LIBRARY].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, Math.min(count, MOCK_ASSET_LIBRARY.length))
}

/**
 * Get assets by uploader
 */
export function getAssetsByUploader(uploaderName: string): LinkedAsset[] {
  return MOCK_ASSET_LIBRARY.filter(asset => 
    asset.metadata?.uploader === uploaderName
  )
}

/**
 * Get recently uploaded assets (within days)
 */
export function getRecentAssets(days: number = 7): LinkedAsset[] {
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - days)
  
  return MOCK_ASSET_LIBRARY.filter(asset => 
    asset.uploadedAt >= cutoffDate
  ).sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime())
}

/**
 * Get assets by tag
 */
export function getAssetsByTag(tag: string): LinkedAsset[] {
  const lowerTag = tag.toLowerCase()
  return MOCK_ASSET_LIBRARY.filter(asset =>
    asset.metadata?.tags?.some(t => t.toLowerCase().includes(lowerTag))
  )
}

// ========== PERSONA HELPERS ==========

/**
 * Filter personas by authorization status
 */
export function getPersonasByStatus(
  status: 'authorized' | 'expires-soon' | 'expired' | 'pending'
): AssignedCreator[] {
  return MOCK_PERSONA_LIBRARY.filter(persona => 
    persona.authorizationStatus === status
  )
}

/**
 * Get personas expiring within X days
 */
export function getExpiringPersonas(days: number = 30): AssignedCreator[] {
  const now = new Date()
  const futureDate = new Date()
  futureDate.setDate(futureDate.getDate() + days)
  
  return MOCK_PERSONA_LIBRARY.filter(persona => {
    if (!persona.expirationDate) return false
    return persona.expirationDate <= futureDate && persona.expirationDate >= now
  })
}

/**
 * Search personas by name or NILP ID
 */
export function searchPersonas(query: string): AssignedCreator[] {
  const lowerQuery = query.toLowerCase()
  return MOCK_PERSONA_LIBRARY.filter(persona => 
    persona.name.toLowerCase().includes(lowerQuery) ||
    persona.nilpId.toLowerCase().includes(lowerQuery)
  )
}

/**
 * Get personas by role
 */
export function getPersonasByRole(role: string): AssignedCreator[] {
  return MOCK_PERSONA_LIBRARY.filter(persona => 
    persona.role?.toLowerCase() === role.toLowerCase()
  )
}

/**
 * Check if persona has specific NILP component
 */
export function getPersonasWithComponent(
  component: 'name' | 'image' | 'likeness' | 'personality'
): AssignedCreator[] {
  return MOCK_PERSONA_LIBRARY.filter(persona => 
    persona.nilpComponents[component] === true
  )
}

/**
 * Get personas that need attention (expired or expiring soon)
 */
export function getPersonasNeedingAttention(): AssignedCreator[] {
  return MOCK_PERSONA_LIBRARY.filter(persona => 
    persona.authorizationStatus === 'expired' ||
    persona.authorizationStatus === 'expires-soon' ||
    persona.authorizationStatus === 'pending'
  )
}

// ========== PROMPT HELPERS ==========

/**
 * Filter prompts by tag
 */
export function getPromptsByTag(tag: string): PromptLibraryItem[] {
  const lowerTag = tag.toLowerCase()
  return MOCK_PROMPT_LIBRARY.filter(prompt =>
    prompt.tags.some(t => t.toLowerCase().includes(lowerTag))
  )
}

/**
 * Get top-rated prompts
 */
export function getTopRatedPrompts(count: number = 10): PromptLibraryItem[] {
  return [...MOCK_PROMPT_LIBRARY]
    .sort((a, b) => b.effectivenessRating - a.effectivenessRating)
    .slice(0, count)
}

/**
 * Get prompts by category
 */
export function getPromptsByCategory(
  category: PromptLibraryItem['category']
): PromptLibraryItem[] {
  return MOCK_PROMPT_LIBRARY.filter(prompt => prompt.category === category)
}

/**
 * Get most used prompts
 */
export function getMostUsedPrompts(count: number = 10): PromptLibraryItem[] {
  return [...MOCK_PROMPT_LIBRARY]
    .sort((a, b) => b.usageCount - a.usageCount)
    .slice(0, count)
}

/**
 * Get prompts by success rate threshold
 */
export function getPromptsBySuccessRate(minRate: number): PromptLibraryItem[] {
  return MOCK_PROMPT_LIBRARY.filter(prompt => 
    (prompt.successfulOutputs / prompt.usageCount) * 100 >= minRate
  )
}

/**
 * Search prompts by title or text content
 */
export function searchPrompts(query: string): PromptLibraryItem[] {
  const lowerQuery = query.toLowerCase()
  return MOCK_PROMPT_LIBRARY.filter(prompt =>
    prompt.title.toLowerCase().includes(lowerQuery) ||
    prompt.promptText.toLowerCase().includes(lowerQuery) ||
    prompt.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  )
}

/**
 * Get recently used prompts
 */
export function getRecentlyUsedPrompts(days: number = 7): PromptLibraryItem[] {
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - days)
  
  return MOCK_PROMPT_LIBRARY.filter(prompt => 
    prompt.lastUsedDate >= cutoffDate
  ).sort((a, b) => b.lastUsedDate.getTime() - a.lastUsedDate.getTime())
}

// ========== TRAINING DATASET HELPERS ==========

/**
 * Search training datasets
 */
export function searchTrainingDatasets(query: string): TrainingDataset[] {
  const lowerQuery = query.toLowerCase()
  return MOCK_TRAINING_DATASETS.filter(dataset =>
    dataset.name.toLowerCase().includes(lowerQuery) ||
    dataset.description.toLowerCase().includes(lowerQuery) ||
    dataset.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  )
}

/**
 * Get datasets by category
 */
export function getDatasetsByCategory(
  category: TrainingDataset['category']
): TrainingDataset[] {
  return MOCK_TRAINING_DATASETS.filter(dataset => 
    dataset.category === category
  )
}

/**
 * Get datasets by minimum asset count
 */
export function getLargeDatasets(minAssets: number = 200): TrainingDataset[] {
  return MOCK_TRAINING_DATASETS.filter(dataset => 
    dataset.assetCount >= minAssets
  )
}

// ========== STATISTICS & ANALYTICS ==========

/**
 * Get asset library statistics
 */
export function getAssetLibraryStats() {
  return {
    total: MOCK_ASSET_LIBRARY.length,
    cleared: getAssetsByStatus('cleared').length,
    pending: getAssetsByStatus('pending').length,
    uncleared: getAssetsByStatus('uncleared').length,
    totalSize: MOCK_ASSET_LIBRARY.reduce((sum, asset) => sum + asset.fileSize, 0),
    averageSize: MOCK_ASSET_LIBRARY.reduce((sum, asset) => sum + asset.fileSize, 0) / MOCK_ASSET_LIBRARY.length,
    byType: {
      images: MOCK_ASSET_LIBRARY.filter(a => a.fileType.startsWith('image/')).length,
      videos: MOCK_ASSET_LIBRARY.filter(a => a.fileType.startsWith('video/')).length,
      documents: MOCK_ASSET_LIBRARY.filter(a => a.fileType.includes('pdf') || a.fileType.includes('document')).length,
      other: MOCK_ASSET_LIBRARY.filter(a => 
        !a.fileType.startsWith('image/') && 
        !a.fileType.startsWith('video/') && 
        !a.fileType.includes('pdf')
      ).length
    }
  }
}

/**
 * Get persona library statistics
 */
export function getPersonaLibraryStats() {
  return {
    total: MOCK_PERSONA_LIBRARY.length,
    authorized: getPersonasByStatus('authorized').length,
    expiresSoon: getPersonasByStatus('expires-soon').length,
    expired: getPersonasByStatus('expired').length,
    pending: getPersonasByStatus('pending').length,
    needingAttention: getPersonasNeedingAttention().length,
    byRole: {
      'Brand Ambassador': getPersonasByRole('Brand Ambassador').length,
      'Voice Actor': getPersonasByRole('Voice Actor').length,
      'Model': getPersonasByRole('Model').length,
      'Actor': getPersonasByRole('Actor').length,
      'Influencer': getPersonasByRole('Influencer').length
    }
  }
}

/**
 * Get prompt library statistics
 */
export function getPromptLibraryStats() {
  return {
    total: MOCK_PROMPT_LIBRARY.length,
    averageRating: MOCK_PROMPT_LIBRARY.reduce((sum, p) => sum + p.effectivenessRating, 0) / MOCK_PROMPT_LIBRARY.length,
    averageSuccessRate: MOCK_PROMPT_LIBRARY.reduce((sum, p) => sum + (p.successfulOutputs / p.usageCount) * 100, 0) / MOCK_PROMPT_LIBRARY.length,
    totalUsage: MOCK_PROMPT_LIBRARY.reduce((sum, p) => sum + p.usageCount, 0),
    private: MOCK_PROMPT_LIBRARY.filter(p => p.isPrivate).length,
    public: MOCK_PROMPT_LIBRARY.filter(p => !p.isPrivate).length,
    byCategory: {
      'product-photography': getPromptsByCategory('product-photography').length,
      'social-media': getPromptsByCategory('social-media').length,
      'video': getPromptsByCategory('video').length,
      'copywriting': getPromptsByCategory('copywriting').length,
      'design': getPromptsByCategory('design').length,
      'audio': getPromptsByCategory('audio').length
    }
  }
}

/**
 * Get training dataset statistics
 */
export function getTrainingDatasetStats() {
  return {
    total: MOCK_TRAINING_DATASETS.length,
    totalAssets: MOCK_TRAINING_DATASETS.reduce((sum, d) => sum + d.assetCount, 0),
    averageAssetCount: MOCK_TRAINING_DATASETS.reduce((sum, d) => sum + d.assetCount, 0) / MOCK_TRAINING_DATASETS.length,
    totalUsage: MOCK_TRAINING_DATASETS.reduce((sum, d) => sum + d.usageCount, 0),
    byCategory: {
      visual: getDatasetsByCategory('visual').length,
      text: getDatasetsByCategory('text').length,
      audio: getDatasetsByCategory('audio').length,
      mixed: getDatasetsByCategory('mixed').length
    }
  }
}

// ========== BULK OPERATIONS ==========

/**
 * Get complete mock data summary
 */
export function getAllMockDataStats() {
  return {
    assets: getAssetLibraryStats(),
    personas: getPersonaLibraryStats(),
    prompts: getPromptLibraryStats(),
    datasets: getTrainingDatasetStats(),
    timestamp: new Date().toISOString()
  }
}

/**
 * Validate mock data integrity
 */
export function validateMockData() {
  const issues: string[] = []
  
  // Check assets
  if (MOCK_ASSET_LIBRARY.length !== 30) {
    issues.push(`Expected 30 assets, found ${MOCK_ASSET_LIBRARY.length}`)
  }
  
  // Check personas
  if (MOCK_PERSONA_LIBRARY.length !== 12) {
    issues.push(`Expected 12 personas, found ${MOCK_PERSONA_LIBRARY.length}`)
  }
  
  // Check prompts
  if (MOCK_PROMPT_LIBRARY.length !== 20) {
    issues.push(`Expected 20 prompts, found ${MOCK_PROMPT_LIBRARY.length}`)
  }
  
  // Check datasets
  if (MOCK_TRAINING_DATASETS.length !== 8) {
    issues.push(`Expected 8 datasets, found ${MOCK_TRAINING_DATASETS.length}`)
  }
  
  // Check for duplicate IDs
  const assetIds = new Set(MOCK_ASSET_LIBRARY.map(a => a.id))
  if (assetIds.size !== MOCK_ASSET_LIBRARY.length) {
    issues.push('Duplicate asset IDs found')
  }
  
  const personaIds = new Set(MOCK_PERSONA_LIBRARY.map(p => p.id))
  if (personaIds.size !== MOCK_PERSONA_LIBRARY.length) {
    issues.push('Duplicate persona IDs found')
  }
  
  return {
    isValid: issues.length === 0,
    issues
  }
}
