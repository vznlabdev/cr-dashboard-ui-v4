/**
 * Centralized Type Definitions for Creation Rights Dashboard
 * 
 * This file contains all shared types used across the application.
 * Import from here rather than duplicating type definitions.
 */

// ==============================================
// Core Domain Types
// ==============================================

export interface Company {
  id: string;
  name: string;
  logo_url?: string;
  branding_colors?: string;
  timezone: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  companyId: string;  // belongs to Company
  name: string;
  description: string;
  status: ProjectStatus;
  assets: number;
  compliance: number;
  risk: RiskLevel;
  updated: string;
  createdDate: string;
  owner: string;
  creatorIds?: string[]; // Creators credited on this project
}

export interface Asset {
  id: string;
  projectId: string;
  name: string;
  type: ContentType;
  aiMethod: AIMethod;
  status: AssetStatus;
  risk: RiskLevel;
  compliance: number;
  updated: string;
  createdDate: string;
  creator: string;
  creatorIds?: string[]; // Creators credited on this asset
}

export interface TaskGroup {
  id: string;
  projectId: string;  // belongs to Project
  name: string;
  description?: string;
  color: string;  // hex color for UI badges and pills
  displayOrder: number;  // for sorting groups in UI
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  taskGroupId: string;  // belongs to Task Group
  projectId: string;    // denormalized for quick queries
  workstream: 'creator' | 'legal' | 'insurance' | 'general';
  title: string;
  status: TaskStatus;
  assignee?: string;
  dueDate?: string;
  createdDate: string;
  updatedAt: string;  // ISO 8601 timestamp
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  timestamp: Date;
  read: boolean;
  action?: NotificationAction;
}

// ==============================================
// Enums & Union Types
// ==============================================

export type ProjectStatus = "Active" | "Review" | "Draft" | "Approved";
export type AssetStatus = "Draft" | "Review" | "Approved" | "Rejected";
export type TaskStatus = "submitted" | "assessment" | "assigned" | "production" | "qa_review" | "delivered";
export type RiskLevel = "Low" | "Medium" | "High";
export type ContentType = "Image" | "Video" | "Audio" | "Text" | "AR/VR";
export type AIMethod = "AI Augmented" | "AI Generative" | "Multimodal";
export type NotificationType = "info" | "success" | "warning" | "error";

export interface NotificationAction {
  label: string;
  href?: string;
  onClick?: () => void;
}

// ==============================================
// User & Team Types
// ==============================================

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export type UserRole = 
  | "Company Admin" 
  | "Legal Reviewer" 
  | "Insurance Analyst" 
  | "Content Creator";

export interface TeamMember {
  name: string;
  email: string;
  initials: string;
  role: string;
  roleVariant: "default" | "secondary" | "outline" | "destructive";
}

// ==============================================
// Legal & Compliance Types
// ==============================================

export interface LegalIssue {
  id: number;
  asset: string;
  type: string;
  severity: "Critical" | "High" | "Medium" | "Low";
  project: string;
  flagged: string;
}

export interface TalentAgreement {
  name: string;
  type: string;
  status: string;
  statusVariant: "default" | "secondary" | "outline" | "destructive";
  expires: string;
}

// ==============================================
// Integration Types
// ==============================================

export interface AITool {
  id: string;
  name: string;
  category: string;
  connected: boolean;
  apiCalls?: number;
  lastSync?: string;
}

export interface AIToolWhitelist {
  name: string;
  icon: string;
  category: string;
  status: string;
  statusVariant: "default" | "secondary" | "outline" | "destructive";
  riskLevel: string;
  approved: boolean;
}

// ==============================================
// API Response Types
// ==============================================

/**
 * Standard API response wrapper
 */
export interface APIResponse<T = any> {
  data?: T;
  error?: APIError;
  message?: string;
  success?: boolean;
}

/**
 * API error structure
 */
export interface APIError {
  code: string;
  message: string;
  details?: any;
  statusCode?: number;
}

/**
 * Paginated response for list endpoints
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

/**
 * Specific API Response Types
 */
export interface ProjectsResponse {
  projects: Project[];
}

export interface ProjectResponse {
  project: Project;
}

export interface AssetsResponse {
  assets: Asset[];
}

export interface AssetResponse {
  asset: Asset;
}

export interface NotificationsResponse {
  notifications: Notification[];
}

export interface DeleteResponse {
  success: boolean;
  message: string;
}

export interface BulkOperationResponse {
  updated?: number;
  deleted?: number;
  success: boolean;
  items: string[];
}

// ==============================================
// Form Types
// ==============================================

export interface CreateProjectForm {
  name: string;
  description: string;
  owner: string;
  status: ProjectStatus;
  risk: RiskLevel;
}

export interface CreateAssetForm {
  name: string;
  type: ContentType;
  aiMethod: AIMethod;
  creator: string;
  status: AssetStatus;
  risk: RiskLevel;
  compliance: number;
}

export interface InviteMemberForm {
  name: string;
  email: string;
  role: UserRole;
}

// ==============================================
// Chart Data Types
// ==============================================

export interface ChartDataPoint {
  day?: string;
  label?: string;
  value: number;
  [key: string]: any;
}

export interface ActivityTrendData {
  day: string;
  approved: number;
  reviewed: number;
}

export interface RiskDistributionData {
  name: string;
  value: number;
}

// ==============================================
// Export Types
// ==============================================

export interface ExportOptions {
  format: "csv" | "json";
  filename?: string;
  includeHeaders?: boolean;
}

// ==============================================
// Utility Types
// ==============================================

export type SortDirection = "asc" | "desc";
export type SortField = "name" | "status" | "assets" | "compliance" | "risk" | "updated";

// ==============================================
// Component Props Types
// ==============================================

export interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string;
}

// ==============================================
// Context Types (Re-exported for convenience)
// ==============================================

export interface DataContextType {
  projects: Project[];
  createProject: (project: Omit<Project, "id" | "assets" | "compliance" | "updated" | "createdDate">) => Promise<Project>;
  updateProject: (id: string, updates: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  getProjectById: (id: string) => Project | undefined;
  
  assets: Record<string, Asset[]>;
  createAsset: (projectId: string, asset: Omit<Asset, "id" | "projectId" | "updated" | "createdDate">) => Promise<Asset>;
  updateAsset: (projectId: string, assetId: string, updates: Partial<Asset>) => Promise<void>;
  deleteAsset: (projectId: string, assetId: string) => Promise<void>;
  getAssetById: (projectId: string, assetId: string) => Asset | undefined;
  getProjectAssets: (projectId: string) => Asset[];
}

export interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, "id" | "timestamp" | "read">) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  clearAll: () => void;
  unreadCount: number;
}

// ==============================================
// Insurance & Risk Types
// ==============================================

export type RiskGrade = "A" | "B" | "C" | "D" | "E" | "F";
export type WorkflowStepStatus = "completed" | "incomplete" | "pending";
export type IssueSeverity = "Critical" | "Urgent" | "Important";
export type DistributionLevel = "Internal" | "Regional" | "National" | "Global";
export type PortfolioMixType = "Pure Human" | "AI-Assisted" | "Hybrid" | "AI-Generated";

/**
 * 7-Step Compliance Workflow
 */
export interface WorkflowStep {
  id: number;
  name: string;
  status: WorkflowStepStatus;
  completedAt?: Date;
  evidence?: WorkflowEvidence[];
}

export interface WorkflowEvidence {
  id: string;
  type: "log" | "file" | "approval" | "certificate";
  name: string;
  url?: string;
  timestamp: Date;
}

/**
 * Workflow completion tracking
 */
export interface WorkflowCompletion {
  completedSteps: number;
  totalSteps: number;
  completionRate: number; // 0-100
  riskLevel: RiskLevel;
  steps: WorkflowStep[];
}

/**
 * Five Key Risk Scores
 */
export interface RiskScores {
  documentation: number; // 0-100, target >85
  toolSafety: number; // 0-100, target >90
  copyrightCheck: number; // 0-100, target >95
  aiModelTrust: number; // 0-100, target >80
  trainingDataQuality: number; // 0-100, target >75 (highest weight)
}

/**
 * Portfolio Risk Metrics
 */
export interface PortfolioRiskMetrics {
  riskGrade: RiskGrade;
  riskScore: number; // 0-100 (weighted from 5 key metrics)
  tiv: number; // Total Insured Value
  eal: number; // Expected Annual Loss
  liability: number; // Liability Estimate
  riskScores: RiskScores;
  workflowCompletion: WorkflowCompletion;
}

/**
 * Portfolio Mix & Risk Multipliers
 */
export interface PortfolioMix {
  type: PortfolioMixType;
  count: number;
  percentage: number;
  riskMultiplier: number; // 1.0x, 1.5x, 2.0x, 3.0x
  totalValue: number;
}

/**
 * Issues & Alerts
 */
export interface InsuranceIssue {
  id: string;
  title: string;
  description: string;
  severity: IssueSeverity;
  category: "copyright" | "tool" | "license" | "workflow" | "training-data" | "creator-rights";
  assetId?: string;
  projectId?: string;
  creatorId?: string;
  dueDate?: Date;
  createdAt: Date;
  resolved: boolean;
}

/**
 * Client Concentration Risk
 */
export interface ClientConcentration {
  clientId: string;
  clientName: string;
  insuredValue: number;
  percentageOfPortfolio: number;
  riskFlagged: boolean; // true if >30%
  assetCount: number;
}

/**
 * Asset Financial Breakdown
 */
export interface AssetFinancialBreakdown {
  baseValue: number;
  riskMultiplier: number;
  distributionMultiplier: number;
  finalInsuredValue: number; // TIV for this asset
}

/**
 * Enhanced Asset with Insurance Data
 */
export interface InsuranceAsset extends Asset {
  workflow: WorkflowCompletion;
  financialBreakdown: AssetFinancialBreakdown;
  riskScores: RiskScores;
  distributionLevel: DistributionLevel;
  approvalStatus: "Approved" | "Blocked";
  similarityScore?: number; // 0-100, <30% = pass
  legalApproval?: boolean;
  toolUsed?: string;
  modelUsed?: string;
  trainingDataSources?: string[];
  promptRecord?: string;
  outputVersions?: string[];
}

