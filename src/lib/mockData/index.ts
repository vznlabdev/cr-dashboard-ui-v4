/**
 * Mock Data Index
 * Central export point for all mock data used in Media Manager development
 */

// Export all mock data arrays
export { MOCK_ASSET_LIBRARY } from './assetLibrary'
export { MOCK_PERSONA_LIBRARY } from './personaLibrary'
export { MOCK_PROMPT_LIBRARY } from './promptLibrary'
export { MOCK_TRAINING_DATASETS } from './trainingDatasets'
export { MOCK_REFERENCES } from './referenceMaterials'

// Export all helper functions
export * from './helpers'

// Export initial state generators
export * from './initialStates'

// Export types
export type { PromptLibraryItem } from './promptLibrary'
export type { TrainingDataset } from './trainingDatasets'

// Re-export commonly used functions for convenience
export {
  getAssetsByStatus,
  getAssetsByType,
  searchAssets,
  getRandomAssets,
  getPersonasByStatus,
  getExpiringPersonas,
  searchPersonas,
  getPromptsByTag,
  getTopRatedPrompts,
  getMostUsedPrompts,
  searchPrompts,
  searchTrainingDatasets,
  getAllMockDataStats,
  validateMockData
} from './helpers'

// Note: getEmptyMediaData, getSampleMediaData, getTaskWithMedia, getMinimalValidMedia
// are already exported via 'export * from ./initialStates' above
