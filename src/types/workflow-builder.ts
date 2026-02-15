/**
 * Workflow Builder Types
 *
 * Type definitions for the redesigned workflow builder — a compact, two-panel
 * workflow creation experience (Google Workspace Studio style) for Creation Rights.
 */

// --- Step Types ---

/** Kind of step in a workflow (image, video, voice, text, enhancement, review, or custom). */
export type WorkflowStepType =
  | "image_generation"
  | "video_generation"
  | "voice_audio"
  | "text_script"
  | "enhancement"
  | "review_approval"
  | "custom";

// --- AI Tool Governance ---

/** Governance status of an AI tool (approved, pending, restricted, or blocked). */
export type ToolApprovalStatus =
  | "approved"
  | "pending_review"
  | "restricted"
  | "blocked";

/**
 * A single tool on the org whitelist with governance and compliance metadata.
 * Used for AI tool governance in the workflow builder.
 */
export interface WhitelistedTool {
  id: string;
  name: string;
  icon?: string;
  category: WorkflowStepType;
  approvalStatus: ToolApprovalStatus;
  approvedBy?: string;
  approvedAt?: string;
  licenseTier?: "enterprise" | "team" | "individual";
  /** Internal alias (e.g. "Adobe Firefly Enterprise" vs "Firefly"). */
  internalAlias?: string;
  complianceNotes?: string;
  maxUsagePerMonth?: number;
  requiresVPN?: boolean;
  /** Data residency (e.g. "EU", "US", "Global"). */
  dataResidency?: string;
  /** Whether the provider offers IP indemnification. */
  indemnified?: boolean;
  /** Tracked model versions for risk assessment. */
  modelVersions?: string[];
}

/**
 * Organization-level whitelist of approved tools and defaults per step type.
 * Controls which tools can be used in workflows and whether new tool requests are allowed.
 */
export interface ToolWhitelistConfig {
  orgId: string;
  tools: WhitelistedTool[];
  /** Default tool IDs to suggest per step type. */
  defaultToolsByStepType: Record<WorkflowStepType, string[]>;
  allowToolRequests: boolean;
  requireApprovalForNewTools: boolean;
}

// --- Workflow Trigger (Workspace Studio style) ---

/** How a workflow can be started (manual, on task, schedule, asset upload, or brief approval). */
export type WorkflowTriggerType =
  | "manual"
  | "on_task_created"
  | "on_schedule"
  | "on_asset_upload"
  | "on_brief_approved";

/**
 * Defines when a workflow runs: manual start, task creation, schedule, asset upload, or brief approval.
 * Optional config holds schedule (cron), project filter, or brief type as needed.
 */
export interface WorkflowTrigger {
  type: WorkflowTriggerType;
  config?: {
    schedule?: string;
    projectFilter?: string;
    briefType?: string;
  };
}

// --- Step Configuration ---

/**
 * Configuration for a single step in a workflow template.
 * Covers tool choice, guidance (prompts, tips, criteria), branching, and provenance requirements.
 */
export interface WorkflowStepConfig {
  id: string;
  name: string;
  description?: string;
  stepType: WorkflowStepType;
  order: number;
  required: boolean;
  estimatedMinutes?: number;
  /** The specific tool chosen for this step. */
  selectedToolId?: string;
  /** Tool IDs from whitelist that are allowed (only approved ones). */
  allowedTools: string[];
  /** Whether the creator can pick a different approved tool. */
  allowCreatorToolChoice: boolean;
  promptTemplate?: string;
  tips?: string[];
  acceptanceCriteria?: string[];
  exampleOutputUrls?: string[];
  trainingDataIds?: string[];
  branching?: {
    condition: string;
    branches: { label: string; nextStepId: string }[];
  };
  /** Whether the browser extension must be active for provenance capture. */
  requireProvenanceCapture: boolean;
  /** Whether the step must log which model version was used. */
  requireModelVersionLog: boolean;
}

// --- Full Workflow Template ---

/**
 * Full workflow template: trigger, ordered steps, metadata, and optional
 * org/department/role restrictions and compliance settings.
 */
export interface WorkflowTemplate {
  id: string;
  name: string;
  description?: string;
  category: "video" | "image" | "audio" | "mixed" | "text" | "custom";
  trigger: WorkflowTrigger;
  steps: WorkflowStepConfig[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  isSystem: boolean;
  tags?: string[];
  estimatedTotalMinutes?: number;
  thumbnail?: string;
  orgId: string;
  /** Limit template to specific departments. */
  departmentRestrictions?: string[];
  /** Limit template to specific roles. */
  roleRestrictions?: string[];
  complianceLevel?: "standard" | "elevated" | "strict";
  /** Whether an active insurance policy is required to use this template. */
  insurancePolicyRequired?: boolean;
}

// --- Builder UI State ---

/**
 * In-memory state for the workflow builder UI: current template draft,
 * active panel, selected step, dirty flag, and validation errors.
 */
export interface WorkflowBuilderState {
  template: Partial<WorkflowTemplate>;
  activePanel: "trigger" | "steps" | "settings";
  selectedStepId: string | null;
  isDirty: boolean;
  validationErrors: Record<string, string[]>;
}
