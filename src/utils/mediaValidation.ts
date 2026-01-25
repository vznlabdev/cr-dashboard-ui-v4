import type { 
  LinkedAsset, 
  PromptData, 
  AssignedCreator, 
  MediaManagerData,
  CreationMethod,
  ValidationResult 
} from '@/types/mediaManager'

/**
 * Validate assets based on creation method
 */
export function validateAssets(
  assets: LinkedAsset[], 
  creationMethod: CreationMethod
): ValidationResult {
  const errors: string[] = []
  
  // Assets are required for Human-Made and AI-Enhanced
  if ((creationMethod === 'human-made' || creationMethod === 'ai-enhanced') && assets.length === 0) {
    errors.push('At least one asset is required for this creation method')
  }
  
  // Check for uncleared assets
  const unclearedAssets = assets.filter(a => a.clearanceStatus === 'uncleared')
  if (unclearedAssets.length > 0) {
    errors.push(`${unclearedAssets.length} asset(s) have failed clearance and cannot be used`)
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Validate prompts based on creation method
 */
export function validatePrompts(
  prompts: PromptData, 
  creationMethod: CreationMethod
): ValidationResult {
  const errors: string[] = []
  
  // Prompts are required for AI-Generated and AI-Enhanced
  if ((creationMethod === 'ai-generated' || creationMethod === 'ai-enhanced') && !prompts.text.trim()) {
    errors.push('Prompt text is required for AI-Generated and AI-Enhanced tasks')
  }
  
  // If saving to library, validate required fields
  if (prompts.saveToLibrary) {
    if (!prompts.title || prompts.title.trim() === '') {
      errors.push('Prompt title is required when saving to library')
    }
    if (!prompts.tags || prompts.tags.length === 0) {
      errors.push('At least one tag is required when saving to library')
    }
  }
  
  // Warn about very short prompts for AI tasks
  const warnings: string[] = []
  if ((creationMethod === 'ai-generated' || creationMethod === 'ai-enhanced') && 
      prompts.text.trim().length > 0 && 
      prompts.text.trim().length < 20) {
    warnings.push('Prompt is very short. Consider adding more detail for better results')
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  }
}

/**
 * Validate training data based on creation method
 */
export function validateTraining(
  training: LinkedAsset[], 
  creationMethod: CreationMethod
): ValidationResult {
  const errors: string[] = []
  
  // Training data is required for AI-Generated
  if (creationMethod === 'ai-generated' && training.length === 0) {
    errors.push('Training data is required for AI-Generated tasks')
  }
  
  // All training data must be cleared
  const unclearedTraining = training.filter(t => t.clearanceStatus !== 'cleared')
  if (unclearedTraining.length > 0) {
    errors.push('All training data must have cleared clearance status')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Validate Creator DNA with authorization checks
 */
export function validateCreatorDNA(
  creators: AssignedCreator[], 
  intendedUse?: string[]
): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []
  
  // Creator DNA is always required
  if (creators.length === 0) {
    errors.push('At least one creator/persona must be assigned')
  }
  
  // Check for authorization issues
  const expiredCreators = creators.filter(c => c.authorizationStatus === 'expired')
  const pendingCreators = creators.filter(c => c.authorizationStatus === 'pending')
  const expiringSoonCreators = creators.filter(c => c.authorizationStatus === 'expires-soon')
  
  if (expiredCreators.length > 0) {
    errors.push(`${expiredCreators.length} creator(s) have expired authorizations`)
  }
  
  // For advertising use, pending authorizations are errors
  const isAdvertising = intendedUse?.some(use => 
    use.toLowerCase().includes('advertising') || use.toLowerCase().includes('campaign')
  )
  
  if (isAdvertising && pendingCreators.length > 0) {
    errors.push(`Advertising use requires valid authorizations. ${pendingCreators.length} creator(s) have pending authorizations`)
  } else if (pendingCreators.length > 0) {
    warnings.push(`${pendingCreators.length} creator(s) have pending authorizations`)
  }
  
  if (expiringSoonCreators.length > 0) {
    warnings.push(`${expiringSoonCreators.length} creator(s) have authorizations expiring soon`)
  }
  
  // Check that at least one NILP component is selected for each creator
  creators.forEach(creator => {
    const hasAnyComponent = Object.values(creator.nilpComponents).some(v => v === true)
    if (!hasAnyComponent) {
      errors.push(`Creator "${creator.name}" must have at least one NILP component selected`)
    }
  })
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  }
}

/**
 * Validate all tabs together
 */
export function validateAllTabs(
  mediaData: MediaManagerData,
  creationMethod: CreationMethod,
  intendedUse?: string[]
): {
  isValid: boolean
  assets: ValidationResult
  prompts: ValidationResult
  training: ValidationResult
  creatorDNA: ValidationResult
  allErrors: string[]
  allWarnings: string[]
} {
  const assetsValidation = validateAssets(mediaData.assets, creationMethod)
  const promptsValidation = validatePrompts(mediaData.prompts, creationMethod)
  const trainingValidation = validateTraining(mediaData.training, creationMethod)
  const creatorDNAValidation = validateCreatorDNA(mediaData.creatorDNA, intendedUse)
  
  const allErrors = [
    ...assetsValidation.errors,
    ...promptsValidation.errors,
    ...trainingValidation.errors,
    ...creatorDNAValidation.errors
  ]
  
  const allWarnings = [
    ...(promptsValidation.warnings || []),
    ...(creatorDNAValidation.warnings || [])
  ]
  
  return {
    isValid: allErrors.length === 0,
    assets: assetsValidation,
    prompts: promptsValidation,
    training: trainingValidation,
    creatorDNA: creatorDNAValidation,
    allErrors,
    allWarnings
  }
}

/**
 * Check if media data has any content
 */
export function hasMediaContent(mediaData: MediaManagerData): boolean {
  return (
    mediaData.assets.length > 0 ||
    mediaData.prompts.text.trim().length > 0 ||
    mediaData.training.length > 0 ||
    mediaData.references.length > 0 ||
    mediaData.creatorDNA.length > 0
  )
}

/**
 * Count total media items
 */
export function countMediaItems(mediaData: MediaManagerData): number {
  return (
    mediaData.assets.length +
    (mediaData.prompts.text.trim().length > 0 ? 1 : 0) +
    mediaData.training.length +
    mediaData.references.length +
    mediaData.creatorDNA.length
  )
}
