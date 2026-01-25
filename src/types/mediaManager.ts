export interface MediaManagerData {
  assets: LinkedAsset[]
  prompts: PromptData
  training: LinkedAsset[]
  references: ReferenceItem[]
  creatorDNA: AssignedCreator[]
}

export interface LinkedAsset {
  id: string
  filename: string
  fileType: string
  fileSize: number
  thumbnailUrl: string
  clearanceStatus: 'cleared' | 'pending' | 'uncleared'
  source: 'library' | 'upload'
  uploadedAt: Date
}

export interface PromptData {
  text: string
  saveToLibrary: boolean
  title?: string
  tags?: string[]
  isPrivate: boolean
}

export interface ReferenceItem {
  id: string
  type: 'asset' | 'upload' | 'url'
  filename?: string
  url?: string
  thumbnailUrl?: string
  fileSize?: number
  notes?: string
  order: number
}

export interface AssignedCreator {
  id: string
  name: string
  nilpId: string
  avatarUrl?: string
  authorizationStatus: 'authorized' | 'expires-soon' | 'expired' | 'pending'
  expirationDate?: Date
  role?: string
  nilpComponents: {
    name: boolean
    image: boolean
    likeness: boolean
    personality: boolean
  }
}

export type CreationMethod = 'human-made' | 'ai-generated' | 'ai-enhanced'
export type TabId = 'assets' | 'prompts' | 'training' | 'references' | 'creator-dna'

export interface TabRequirement {
  required: boolean
  disabled: boolean
  tooltip: string
}

export interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings?: string[]
}

export interface MediaManagerSaveData {
  taskId?: string
  linkedAssetIds: string[]
  prompt: {
    text: string
    saveToLibrary: boolean
    title?: string
    tags?: string[]
    visibility?: string
  }
  trainingDataIds: string[]
  references: Array<{
    id: string
    name: string
    type: string
    source: string
    url?: string
    note?: string
    order: number
  }>
  creatorDna: Array<{
    personaId: string
    role?: string
    nilpComponents: {
      name: boolean
      image: boolean
      likeness: boolean
      personality: boolean
    }
  }>
}
