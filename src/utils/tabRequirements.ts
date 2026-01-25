import type { CreationMethod, TabId, TabRequirement } from '@/types/mediaManager'

/**
 * Get requirements for each tab based on creation method
 */
export function getTabRequirements(creationMethod: CreationMethod): Record<TabId, TabRequirement> {
  switch (creationMethod) {
    case 'human-made':
      return {
        assets: {
          required: true,
          disabled: false,
          tooltip: 'Required: Upload or link assets created by humans'
        },
        prompts: {
          required: false,
          disabled: false,
          tooltip: 'Optional: Add prompts if you used AI assistance in any part of the creative process'
        },
        training: {
          required: false,
          disabled: false,
          tooltip: 'Not typically used: Training data is usually only needed for AI-generated content'
        },
        references: {
          required: false,
          disabled: false,
          tooltip: 'Optional: Add reference materials, mood boards, or inspiration'
        },
        'creator-dna': {
          required: true,
          disabled: false,
          tooltip: 'Required: Assign creators/personas represented in this content'
        }
      }
    
    case 'ai-generated':
      return {
        assets: {
          required: false,
          disabled: false,
          tooltip: 'Not typically used: AI-generated content usually doesn\'t start with existing assets'
        },
        prompts: {
          required: true,
          disabled: false,
          tooltip: 'Required: Provide the prompts used to generate this content'
        },
        training: {
          required: true,
          disabled: false,
          tooltip: 'Required: Link training datasets used to train or fine-tune the AI model'
        },
        references: {
          required: false,
          disabled: false,
          tooltip: 'Optional: Add reference materials that influenced the prompts or style'
        },
        'creator-dna': {
          required: true,
          disabled: false,
          tooltip: 'Required: Assign personas whose likeness or voice is being used'
        }
      }
    
    case 'ai-enhanced':
      return {
        assets: {
          required: true,
          disabled: false,
          tooltip: 'Required: Upload or link the original assets that were AI-enhanced'
        },
        prompts: {
          required: true,
          disabled: false,
          tooltip: 'Required: Describe the AI enhancements or modifications applied'
        },
        training: {
          required: false,
          disabled: false,
          tooltip: 'Not typically used: Training data is usually only needed for fully AI-generated content'
        },
        references: {
          required: false,
          disabled: false,
          tooltip: 'Optional: Add reference materials that guided the enhancement'
        },
        'creator-dna': {
          required: true,
          disabled: false,
          tooltip: 'Required: Assign creators/personas for the original and enhanced content'
        }
      }
    
    default:
      // Fallback - all optional
      return {
        assets: {
          required: false,
          disabled: false,
          tooltip: 'Optional: Add any relevant assets'
        },
        prompts: {
          required: false,
          disabled: false,
          tooltip: 'Optional: Add prompts if applicable'
        },
        training: {
          required: false,
          disabled: false,
          tooltip: 'Optional: Add training data if applicable'
        },
        references: {
          required: false,
          disabled: false,
          tooltip: 'Optional: Add reference materials'
        },
        'creator-dna': {
          required: false,
          disabled: false,
          tooltip: 'Optional: Assign creators/personas'
        }
      }
  }
}

/**
 * Check if a specific tab is required for the creation method
 */
export function isTabRequired(tabId: TabId, creationMethod: CreationMethod): boolean {
  const requirements = getTabRequirements(creationMethod)
  return requirements[tabId].required
}

/**
 * Get list of all required tabs for creation method
 */
export function getRequiredTabs(creationMethod: CreationMethod): TabId[] {
  const requirements = getTabRequirements(creationMethod)
  return (Object.keys(requirements) as TabId[]).filter(tabId => requirements[tabId].required)
}

/**
 * Get user-friendly label for tab requirement status
 */
export function getTabStatusLabel(tabId: TabId, creationMethod: CreationMethod): string {
  const requirements = getTabRequirements(creationMethod)
  const requirement = requirements[tabId]
  
  if (requirement.required) return 'Required'
  if (requirement.disabled) return 'Not applicable'
  return 'Optional'
}

/**
 * Get CSS class for tab status badge
 */
export function getTabStatusClass(tabId: TabId, creationMethod: CreationMethod): string {
  const requirements = getTabRequirements(creationMethod)
  const requirement = requirements[tabId]
  
  if (requirement.required) return 'text-red-600 dark:text-red-400 font-semibold'
  if (requirement.disabled) return 'text-gray-400 dark:text-gray-600'
  return 'text-gray-600 dark:text-gray-400'
}
