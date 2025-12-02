/**
 * Centralized Type Definitions for Creation Rights Dashboard
 * 
 * This file contains all shared types used across the application.
 * Import from here rather than duplicating type definitions.
 */

// ==============================================
// Core Domain Types
// ==============================================

export interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  assets: number;
  compliance: number;
  risk: RiskLevel;
  updated: string;
  createdDate: string;
  owner: string;
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

