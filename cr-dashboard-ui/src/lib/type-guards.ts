/**
 * Type Guards & Runtime Validators
 * 
 * Type guards provide runtime type checking for TypeScript.
 * Use these to validate API responses and user input.
 * 
 * USAGE:
 * import { isProject, validateProject } from '@/lib/type-guards';
 * 
 * if (isProject(data)) {
 *   // data is now typed as Project
 *   console.log(data.name);
 * }
 * 
 * // Or throw error if invalid
 * const project = validateProject(data); // throws if invalid
 */

import type { 
  Project, 
  Asset, 
  Notification, 
  ProjectStatus, 
  AssetStatus,
  RiskLevel,
  ContentType,
  AIMethod,
  NotificationType,
} from "@/types";
import { 
  PROJECT_STATUSES, 
  ASSET_STATUSES, 
  RISK_LEVELS, 
  CONTENT_TYPES, 
  AI_METHODS,
  NOTIFICATION_TYPES,
} from "@/lib/constants";

// ==============================================
// Basic Type Guards
// ==============================================

export function isString(value: unknown): value is string {
  return typeof value === "string";
}

export function isNumber(value: unknown): value is number {
  return typeof value === "number" && !isNaN(value);
}

export function isBoolean(value: unknown): value is boolean {
  return typeof value === "boolean";
}

export function isObject(value: unknown): value is Record<string, any> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function isArray(value: unknown): value is any[] {
  return Array.isArray(value);
}

// ==============================================
// Enum Type Guards
// ==============================================

export function isProjectStatus(value: unknown): value is ProjectStatus {
  return isString(value) && PROJECT_STATUSES.includes(value as any);
}

export function isAssetStatus(value: unknown): value is AssetStatus {
  return isString(value) && ASSET_STATUSES.includes(value as any);
}

export function isRiskLevel(value: unknown): value is RiskLevel {
  return isString(value) && RISK_LEVELS.includes(value as any);
}

export function isContentType(value: unknown): value is ContentType {
  return isString(value) && CONTENT_TYPES.includes(value as any);
}

export function isAIMethod(value: unknown): value is AIMethod {
  return isString(value) && AI_METHODS.includes(value as any);
}

export function isNotificationType(value: unknown): value is NotificationType {
  return isString(value) && NOTIFICATION_TYPES.includes(value as any);
}

// ==============================================
// Domain Type Guards
// ==============================================

/**
 * Check if value is a valid Project
 */
export function isProject(value: unknown): value is Project {
  if (!isObject(value)) return false;

  return (
    isString(value.id) &&
    isString(value.name) &&
    isString(value.description) &&
    isProjectStatus(value.status) &&
    isNumber(value.assets) &&
    isNumber(value.compliance) &&
    isRiskLevel(value.risk) &&
    isString(value.updated) &&
    isString(value.createdDate) &&
    isString(value.owner)
  );
}

/**
 * Check if value is a valid Asset
 */
export function isAsset(value: unknown): value is Asset {
  if (!isObject(value)) return false;

  return (
    isString(value.id) &&
    isString(value.projectId) &&
    isString(value.name) &&
    isContentType(value.type) &&
    isAIMethod(value.aiMethod) &&
    isAssetStatus(value.status) &&
    isRiskLevel(value.risk) &&
    isNumber(value.compliance) &&
    isString(value.updated) &&
    isString(value.createdDate) &&
    isString(value.creator)
  );
}

/**
 * Check if value is a valid Notification
 */
export function isNotification(value: unknown): value is Notification {
  if (!isObject(value)) return false;

  return (
    isString(value.id) &&
    isString(value.title) &&
    isString(value.message) &&
    isNotificationType(value.type) &&
    value.timestamp instanceof Date &&
    isBoolean(value.read)
  );
}

// ==============================================
// Validators (Throw Errors)
// ==============================================

/**
 * Validate project or throw error
 */
export function validateProject(value: unknown): Project {
  if (!isProject(value)) {
    throw new Error("Invalid project data");
  }
  return value;
}

/**
 * Validate asset or throw error
 */
export function validateAsset(value: unknown): Asset {
  if (!isAsset(value)) {
    throw new Error("Invalid asset data");
  }
  return value;
}

/**
 * Validate array of projects
 */
export function validateProjects(value: unknown): Project[] {
  if (!isArray(value)) {
    throw new Error("Expected array of projects");
  }
  return value.map(validateProject);
}

/**
 * Validate array of assets
 */
export function validateAssets(value: unknown): Asset[] {
  if (!isArray(value)) {
    throw new Error("Expected array of assets");
  }
  return value.map(validateAsset);
}

// ==============================================
// Form Validation Helpers
// ==============================================

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate URL format
 */
export function isValidURL(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate compliance percentage (0-100)
 */
export function isValidComplianceScore(score: number): boolean {
  return isNumber(score) && score >= 0 && score <= 100;
}

/**
 * Validate project name
 */
export function isValidProjectName(name: string): boolean {
  return isString(name) && name.trim().length >= 3 && name.trim().length <= 100;
}

/**
 * Validate asset name
 */
export function isValidAssetName(name: string): boolean {
  return isString(name) && name.trim().length >= 1 && name.trim().length <= 255;
}

// ==============================================
// API Response Validators
// ==============================================

/**
 * Validate API response has expected structure
 */
export function isValidAPIResponse<T>(
  value: unknown,
  dataValidator: (data: unknown) => data is T
): value is { data: T } {
  if (!isObject(value)) return false;
  return "data" in value && dataValidator(value.data);
}

/**
 * Validate paginated response
 */
export function isValidPaginatedResponse<T>(
  value: unknown,
  itemValidator: (item: unknown) => item is T
): boolean {
  if (!isObject(value)) return false;

  return (
    isArray(value.data) &&
    value.data.every(itemValidator) &&
    isObject(value.pagination) &&
    isNumber(value.pagination.page) &&
    isNumber(value.pagination.pageSize) &&
    isNumber(value.pagination.total)
  );
}

// ==============================================
// Utility Validators
// ==============================================

/**
 * Check if value is non-empty string
 */
export function isNonEmptyString(value: unknown): value is string {
  return isString(value) && value.trim().length > 0;
}

/**
 * Check if value is positive number
 */
export function isPositiveNumber(value: unknown): value is number {
  return isNumber(value) && value > 0;
}

/**
 * Check if value is valid date string
 */
export function isValidDateString(value: unknown): value is string {
  if (!isString(value)) return false;
  const date = new Date(value);
  return !isNaN(date.getTime());
}

// ==============================================
// Usage Examples
// ==============================================

/**
 * Example 1: Validating API response
 * 
 * const response = await fetch('/api/projects');
 * const data = await response.json();
 * 
 * if (isValidAPIResponse(data, isProject)) {
 *   // data.data is typed as Project
 *   console.log(data.data.name);
 * }
 */

/**
 * Example 2: Validating form input
 * 
 * const handleSubmit = (formData) => {
 *   if (!isValidProjectName(formData.name)) {
 *     toast.error("Project name must be 3-100 characters");
 *     return;
 *   }
 *   
 *   if (!isValidEmail(formData.ownerEmail)) {
 *     toast.error("Please enter a valid email");
 *     return;
 *   }
 *   
 *   // Proceed with submission
 * };
 */

/**
 * Example 3: Validating API data before setting state
 * 
 * const { data } = await api.projects.getAll();
 * 
 * try {
 *   const validProjects = validateProjects(data.projects);
 *   setProjects(validProjects);
 * } catch (error) {
 *   console.error("Invalid project data:", error);
 *   toast.error("Received invalid data from server");
 * }
 */

