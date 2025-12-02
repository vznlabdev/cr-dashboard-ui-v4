/**
 * API Error Handling Utilities
 * 
 * Centralized error handling for API requests with user-friendly messages.
 * 
 * USAGE:
 * import { handleAPIError, APIError } from '@/lib/api-errors';
 * 
 * try {
 *   await api.projects.create(data);
 * } catch (error) {
 *   const message = handleAPIError(error);
 *   toast.error(message);
 * }
 */

import { toast } from "sonner";

// ==============================================
// Error Types
// ==============================================

export class APIError extends Error {
  statusCode: number;
  code?: string;
  details?: any;

  constructor(message: string, statusCode: number, code?: string, details?: any) {
    super(message);
    this.name = "APIError";
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

export class NetworkError extends Error {
  constructor(message = "Network error. Please check your connection.") {
    super(message);
    this.name = "NetworkError";
  }
}

export class AuthenticationError extends APIError {
  constructor(message = "Authentication required. Please log in.") {
    super(message, 401, "AUTH_REQUIRED");
    this.name = "AuthenticationError";
  }
}

export class ValidationError extends APIError {
  constructor(message: string, details?: any) {
    super(message, 400, "VALIDATION_ERROR", details);
    this.name = "ValidationError";
  }
}

// ==============================================
// Error Handling Functions
// ==============================================

/**
 * Convert API errors to user-friendly messages
 */
export function handleAPIError(error: unknown): string {
  // Network errors
  if (error instanceof NetworkError) {
    return error.message;
  }

  // API errors
  if (error instanceof APIError) {
    switch (error.statusCode) {
      case 400:
        return error.message || "Invalid request. Please check your input.";
      case 401:
        return "You need to log in to access this resource.";
      case 403:
        return "You don't have permission to perform this action.";
      case 404:
        return "The requested resource was not found.";
      case 409:
        return error.message || "This resource already exists.";
      case 422:
        return error.message || "Validation failed. Please check your input.";
      case 429:
        return "Too many requests. Please try again later.";
      case 500:
        return "Server error. Please try again later.";
      case 503:
        return "Service temporarily unavailable. Please try again later.";
      default:
        return error.message || "An unexpected error occurred.";
    }
  }

  // Standard errors
  if (error instanceof Error) {
    return error.message;
  }

  // Unknown errors
  return "An unexpected error occurred.";
}

/**
 * Show error toast with appropriate message
 */
export function showErrorToast(error: unknown, customMessage?: string) {
  const message = customMessage || handleAPIError(error);
  toast.error(message);
}

/**
 * Parse API error response
 */
export async function parseAPIError(response: Response): Promise<APIError> {
  let errorData: any = {};

  try {
    errorData = await response.json();
  } catch {
    // Response might not be JSON
    errorData = { message: response.statusText };
  }

  return new APIError(
    errorData.message || errorData.error || "API request failed",
    response.status,
    errorData.code,
    errorData.details
  );
}

/**
 * Check if error is a network error
 */
export function isNetworkError(error: unknown): boolean {
  return (
    error instanceof TypeError &&
    (error.message.includes("fetch") || error.message.includes("network"))
  );
}

/**
 * Check if error is authentication-related
 */
export function isAuthError(error: unknown): boolean {
  if (error instanceof APIError) {
    return error.statusCode === 401 || error.statusCode === 403;
  }
  return false;
}

/**
 * Retry logic for failed requests
 */
export async function retryRequest<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  delay = 1000
): Promise<T> {
  let lastError: Error;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      // Don't retry on auth errors or validation errors
      if (error instanceof APIError && (error.statusCode === 401 || error.statusCode === 400)) {
        throw error;
      }

      // Wait before retrying
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
      }
    }
  }

  throw lastError!;
}

// ==============================================
// Error Messages Map
// ==============================================

export const ERROR_MESSAGES = {
  // Network
  NETWORK_ERROR: "Unable to connect. Please check your internet connection.",
  TIMEOUT: "Request timed out. Please try again.",
  
  // Authentication
  UNAUTHORIZED: "Please log in to continue.",
  FORBIDDEN: "You don't have permission to access this resource.",
  SESSION_EXPIRED: "Your session has expired. Please log in again.",
  
  // Validation
  VALIDATION_FAILED: "Please check your input and try again.",
  REQUIRED_FIELD: "This field is required.",
  INVALID_EMAIL: "Please enter a valid email address.",
  
  // CRUD Operations
  CREATE_FAILED: "Failed to create. Please try again.",
  UPDATE_FAILED: "Failed to save changes. Please try again.",
  DELETE_FAILED: "Failed to delete. Please try again.",
  FETCH_FAILED: "Failed to load data. Please refresh the page.",
  
  // File Upload
  FILE_TOO_LARGE: "File is too large. Maximum size is 10MB.",
  INVALID_FILE_TYPE: "Invalid file type. Please upload a supported format.",
  UPLOAD_FAILED: "File upload failed. Please try again.",
  
  // General
  UNKNOWN_ERROR: "Something went wrong. Please try again.",
  SERVER_ERROR: "Server error. Our team has been notified.",
} as const;

// ==============================================
// Usage Examples
// ==============================================

/**
 * Example 1: Basic error handling
 * 
 * try {
 *   await api.projects.create(data);
 *   toast.success("Project created!");
 * } catch (error) {
 *   showErrorToast(error);
 * }
 */

/**
 * Example 2: Custom error messages
 * 
 * try {
 *   await api.projects.delete(id);
 * } catch (error) {
 *   if (isAuthError(error)) {
 *     showErrorToast(error, ERROR_MESSAGES.SESSION_EXPIRED);
 *     router.push('/login');
 *   } else {
 *     showErrorToast(error, ERROR_MESSAGES.DELETE_FAILED);
 *   }
 * }
 */

/**
 * Example 3: With retry logic
 * 
 * try {
 *   const data = await retryRequest(() => api.projects.getAll(), 3);
 *   setProjects(data.projects);
 * } catch (error) {
 *   showErrorToast(error, ERROR_MESSAGES.FETCH_FAILED);
 * }
 */

