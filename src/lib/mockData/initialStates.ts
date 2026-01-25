/**
 * Initial State Generators for Media Manager
 * Functions to generate empty or pre-populated states for testing and development
 */

import type { MediaManagerData, CreationMethod, LinkedAsset, AssignedCreator } from '@/types/mediaManager'
import type { Task } from '@/types'
import { getRandomAssets, getPersonasByStatus, getTopRatedPrompts } from './helpers'
import { MOCK_TRAINING_DATASETS } from './trainingDatasets'
import { MOCK_REFERENCES } from './referenceMaterials'

/**
 * Get empty MediaManagerData structure
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

/**
 * Get sample MediaManagerData pre-populated based on creation method
 */
export function getSampleMediaData(creationMethod: CreationMethod): MediaManagerData {
  switch (creationMethod) {
    case 'human-made':
      return getSampleHumanMadeMedia()
    case 'ai-generated':
      return getSampleAIGeneratedMedia()
    case 'ai-enhanced':
      return getSampleAIEnhancedMedia()
    default:
      return getEmptyMediaData()
  }
}

/**
 * Sample media data for Human-Made creation
 */
function getSampleHumanMadeMedia(): MediaManagerData {
  const assets = getRandomAssets(3).filter(a => a.clearanceStatus === 'cleared')
  const personas = getPersonasByStatus('authorized').slice(0, 1)
  const references = MOCK_REFERENCES.slice(0, 2)
  
  return {
    assets: assets,
    prompts: {
      text: '', // Not typically used for human-made
      saveToLibrary: false,
      isPrivate: true
    },
    training: [], // Not typically used for human-made
    references: references,
    creatorDNA: personas
  }
}

/**
 * Sample media data for AI-Generated creation
 */
function getSampleAIGeneratedMedia(): MediaManagerData {
  const topPrompt = getTopRatedPrompts(1)[0]
  const trainingDatasets = MOCK_TRAINING_DATASETS.slice(0, 2).map(dataset => ({
    id: dataset.id,
    filename: dataset.name,
    fileType: 'application/dataset',
    fileSize: parseInt(dataset.totalSize.replace(/[^0-9]/g, '')) * 1024 * 1024,
    thumbnailUrl: '/placeholder.svg',
    clearanceStatus: 'cleared' as const,
    source: 'library' as const,
    uploadedAt: dataset.createdAt
  }))
  const personas = getPersonasByStatus('authorized').slice(0, 1)
  const references = MOCK_REFERENCES.filter(r => r.type === 'url').slice(0, 1)
  
  return {
    assets: [], // Not typically used for AI-generated
    prompts: {
      text: topPrompt.promptText,
      saveToLibrary: true,
      title: topPrompt.title,
      tags: topPrompt.tags.slice(0, 3),
      isPrivate: false
    },
    training: trainingDatasets,
    references: references,
    creatorDNA: personas
  }
}

/**
 * Sample media data for AI-Enhanced creation
 */
function getSampleAIEnhancedMedia(): MediaManagerData {
  const assets = getRandomAssets(2).filter(a => a.clearanceStatus === 'cleared')
  const topPrompt = getTopRatedPrompts(1)[0]
  const personas = getPersonasByStatus('authorized').slice(0, 1)
  const references = MOCK_REFERENCES.slice(0, 2)
  
  return {
    assets: assets,
    prompts: {
      text: 'Enhance the image by adjusting contrast, improving clarity, and adding subtle color grading for a more professional look. Maintain the original composition while optimizing for social media engagement.',
      saveToLibrary: false,
      isPrivate: true
    },
    training: [], // Not typically used for AI-enhanced
    references: references,
    creatorDNA: personas
  }
}

/**
 * Get a complete mock task with media
 */
export function getTaskWithMedia(creationMethod: CreationMethod = 'human-made'): Task & { media: MediaManagerData } {
  const now = new Date()
  const taskId = `task-mock-${Date.now()}`
  
  return {
    id: taskId,
    taskGroupId: 'group-001',
    projectId: 'project-001',
    workstream: 'creator',
    title: `Sample ${creationMethod} Task with Media`,
    description: `This is a sample task demonstrating the ${creationMethod} creation method with fully populated media manager data.`,
    status: 'submitted',
    assignee: 'Sarah Johnson',
    dueDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days from now
    createdDate: now.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }),
    updatedAt: now.toISOString(),
    media: getSampleMediaData(creationMethod)
  }
}

/**
 * Generate minimal valid media data for testing validation
 */
export function getMinimalValidMedia(creationMethod: CreationMethod): MediaManagerData {
  // Creator DNA is always required
  const personas = getPersonasByStatus('authorized').slice(0, 1)
  
  const base: MediaManagerData = {
    assets: [],
    prompts: {
      text: '',
      saveToLibrary: false,
      isPrivate: true
    },
    training: [],
    references: [],
    creatorDNA: personas
  }
  
  // Add required fields based on creation method
  switch (creationMethod) {
    case 'human-made':
      // Requires: assets, creator DNA
      base.assets = getRandomAssets(1).filter(a => a.clearanceStatus === 'cleared')
      break
      
    case 'ai-generated':
      // Requires: prompts, training, creator DNA
      base.prompts.text = 'This is a minimal valid prompt for AI generation.'
      base.training = MOCK_TRAINING_DATASETS.slice(0, 1).map(dataset => ({
        id: dataset.id,
        filename: dataset.name,
        fileType: 'application/dataset',
        fileSize: 1024 * 1024, // 1 MB
        thumbnailUrl: '/placeholder.svg',
        clearanceStatus: 'cleared' as const,
        source: 'library' as const,
        uploadedAt: new Date()
      }))
      break
      
    case 'ai-enhanced':
      // Requires: assets, prompts, creator DNA
      base.assets = getRandomAssets(1).filter(a => a.clearanceStatus === 'cleared')
      base.prompts.text = 'Enhance this asset with improved lighting and color balance.'
      break
  }
  
  return base
}

/**
 * Generate media data with validation errors for testing
 */
export function getInvalidMediaData(creationMethod: CreationMethod): MediaManagerData {
  const base = getEmptyMediaData()
  
  // Intentionally missing required creator DNA
  // This will fail validation
  
  switch (creationMethod) {
    case 'human-made':
      // Missing required assets
      break
      
    case 'ai-generated':
      // Missing required prompts and training
      break
      
    case 'ai-enhanced':
      // Missing required assets and prompts
      break
  }
  
  return base
}

/**
 * Generate media data with warnings (valid but with issues)
 */
export function getMediaDataWithWarnings(): MediaManagerData {
  const assets = getRandomAssets(2)
  // Use personas with expiring authorizations
  const expiringPersonas = getPersonasByStatus('expires-soon').slice(0, 1)
  
  return {
    assets: assets,
    prompts: {
      text: 'Sample prompt text',
      saveToLibrary: false,
      isPrivate: true
    },
    training: [],
    references: [],
    creatorDNA: expiringPersonas // Will trigger warning
  }
}

/**
 * Get media data for specific test scenarios
 */
export function getTestScenarioMedia(scenario: 
  'empty' | 
  'minimal' | 
  'full' | 
  'invalid' | 
  'warnings' | 
  'advertising-use'
): MediaManagerData {
  switch (scenario) {
    case 'empty':
      return getEmptyMediaData()
      
    case 'minimal':
      return getMinimalValidMedia('human-made')
      
    case 'full':
      return getSampleMediaData('ai-enhanced')
      
    case 'invalid':
      return getInvalidMediaData('ai-generated')
      
    case 'warnings':
      return getMediaDataWithWarnings()
      
    case 'advertising-use':
      // Test scenario for advertising with pending authorization
      const pendingPersonas = getPersonasByStatus('pending').slice(0, 1)
      return {
        ...getMinimalValidMedia('human-made'),
        creatorDNA: pendingPersonas // Will fail validation for advertising
      }
      
    default:
      return getEmptyMediaData()
  }
}

/**
 * Generate multiple sample tasks for testing list views
 */
export function generateSampleTasks(count: number = 5): Array<Task & { media?: MediaManagerData }> {
  const creationMethods: CreationMethod[] = ['human-made', 'ai-generated', 'ai-enhanced']
  const tasks: Array<Task & { media?: MediaManagerData }> = []
  
  for (let i = 0; i < count; i++) {
    const method = creationMethods[i % creationMethods.length]
    const hasMedia = i % 2 === 0 // 50% have media
    
    const task = getTaskWithMedia(method)
    if (!hasMedia) {
      delete task.media
    }
    
    tasks.push(task)
  }
  
  return tasks
}

/**
 * Get default NILP components based on role
 */
export function getDefaultNilpComponents(role?: string): AssignedCreator['nilpComponents'] {
  switch (role?.toLowerCase()) {
    case 'voice actor':
    case 'narrator':
      return {
        name: true,
        image: false,
        likeness: false,
        personality: true
      }
      
    case 'model':
      return {
        name: true,
        image: true,
        likeness: true,
        personality: false
      }
      
    case 'brand ambassador':
    case 'influencer':
    case 'actor':
      return {
        name: true,
        image: true,
        likeness: true,
        personality: true
      }
      
    default:
      return {
        name: true,
        image: true,
        likeness: true,
        personality: true
      }
  }
}

/**
 * Simulate loading delay for realistic API behavior
 */
export function simulateApiDelay(ms: number = 500): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Generate realistic error responses for testing error handling
 */
export function generateMockError(type: 'network' | 'validation' | 'authorization' | 'not-found'): Error {
  switch (type) {
    case 'network':
      return new Error('Network request failed. Please check your connection.')
      
    case 'validation':
      return new Error('Validation failed: Required fields are missing.')
      
    case 'authorization':
      return new Error('Authorization expired. Please renew creator authorization.')
      
    case 'not-found':
      return new Error('Resource not found. The requested item may have been deleted.')
      
    default:
      return new Error('An unexpected error occurred.')
  }
}

/**
 * Export all mock data in a single object for easy import
 */
export * from './assetLibrary'
export * from './personaLibrary'
export * from './promptLibrary'
export * from './trainingDatasets'
export * from './referenceMaterials'
export * from './helpers'
