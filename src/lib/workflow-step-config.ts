import { Image, Video, Mic, FileText, Sparkles, CheckCircle2, Settings2 } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { WorkflowStepType } from '@/types/workflows'

export interface WorkflowStepTypeConfig {
  icon: LucideIcon
  label: string
  color: string
  textColor: string
  lightBg: string
  borderColor: string
  defaultEstimate: number
}

export const STEP_TYPE_CONFIG: Record<WorkflowStepType, WorkflowStepTypeConfig> = {
  image_generation:  { icon: Image,        label: "Image Generation",  color: "bg-blue-500",    textColor: "text-blue-600 dark:text-blue-400",      lightBg: "bg-blue-50 dark:bg-blue-900/20",      borderColor: "border-blue-200 dark:border-blue-800",      defaultEstimate: 15 },
  video_generation:  { icon: Video,        label: "Video Generation",  color: "bg-purple-500",  textColor: "text-purple-600 dark:text-purple-400",  lightBg: "bg-purple-50 dark:bg-purple-900/20",  borderColor: "border-purple-200 dark:border-purple-800",  defaultEstimate: 30 },
  voice_audio:       { icon: Mic,          label: "Voice & Audio",     color: "bg-orange-500",  textColor: "text-orange-600 dark:text-orange-400",  lightBg: "bg-orange-50 dark:bg-orange-900/20",  borderColor: "border-orange-200 dark:border-orange-800",  defaultEstimate: 20 },
  text_script:       { icon: FileText,     label: "Text & Script",     color: "bg-green-500",   textColor: "text-green-600 dark:text-green-400",    lightBg: "bg-green-50 dark:bg-green-900/20",    borderColor: "border-green-200 dark:border-green-800",    defaultEstimate: 10 },
  enhancement:       { icon: Sparkles,     label: "Enhancement",       color: "bg-pink-500",    textColor: "text-pink-600 dark:text-pink-400",      lightBg: "bg-pink-50 dark:bg-pink-900/20",      borderColor: "border-pink-200 dark:border-pink-800",      defaultEstimate: 10 },
  review_approval:   { icon: CheckCircle2, label: "Review & Approval", color: "bg-emerald-500", textColor: "text-emerald-600 dark:text-emerald-400", lightBg: "bg-emerald-50 dark:bg-emerald-900/20", borderColor: "border-emerald-200 dark:border-emerald-800", defaultEstimate: 5 },
  custom:            { icon: Settings2,    label: "Custom Step",       color: "bg-slate-500",   textColor: "text-slate-600 dark:text-slate-400",    lightBg: "bg-slate-50 dark:bg-slate-900/20",    borderColor: "border-slate-200 dark:border-slate-800",    defaultEstimate: 15 },
}

export function getStepTypeConfig(type: WorkflowStepType): WorkflowStepTypeConfig {
  return STEP_TYPE_CONFIG[type]
}

export function getStepTypeIcon(type: WorkflowStepType): LucideIcon {
  return STEP_TYPE_CONFIG[type].icon
}

export function getStepTypeLabel(type: WorkflowStepType): string {
  return STEP_TYPE_CONFIG[type].label
}
