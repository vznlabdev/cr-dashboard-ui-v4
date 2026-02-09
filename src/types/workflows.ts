export type WorkflowStepType = 'image_generation' | 'video_generation' | 'voice_audio' | 'text_script' | 'enhancement' | 'review_approval' | 'custom'

export interface WorkflowStepConfig {
  id: string
  name: string
  description?: string
  stepType: WorkflowStepType
  order: number
  required: boolean
  toolCategory?: string
  recommendedToolIds?: string[]
  promptTemplate?: string
  tips?: string[]
  acceptanceCriteria?: string[]
  estimatedMinutes?: number
}

export interface WorkflowTemplate {
  id: string
  name: string
  description?: string
  category: 'video' | 'image' | 'audio' | 'mixed' | 'custom'
  icon: string
  steps: WorkflowStepConfig[]
  createdBy: string
  createdAt: string
  updatedAt: string
  isSystem: boolean
  isPublished: boolean
  tags?: string[]
  estimatedTotalMinutes?: number
  usageCount?: number
}

export interface WorkflowInstance {
  id: string
  templateId: string
  templateName: string
  taskId: string
  projectId: string
  currentStepIndex: number
  stepStatuses: WorkflowStepStatus[]
  startedAt?: string
  completedAt?: string
  status: 'not_started' | 'in_progress' | 'paused' | 'completed'
}

export interface WorkflowStepStatus {
  stepId: string
  status: 'locked' | 'ready' | 'active' | 'completed' | 'skipped'
  startedAt?: string
  completedAt?: string
  toolUsed?: string
  notes?: string
}
