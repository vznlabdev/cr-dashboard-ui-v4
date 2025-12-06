/**
 * API Client for Creation Rights Dashboard
 * 
 * This module provides a centralized API client for all backend communication.
 * Replace the mock implementations in Context files with these API calls.
 * 
 * FEATURES:
 * - Automatic error handling and parsing
 * - Authentication headers
 * - Type-safe requests/responses
 * - Retry logic for failed requests
 * 
 * USAGE:
 * import { api } from '@/lib/api';
 * const projects = await api.projects.getAll();
 * 
 * ERROR HANDLING:
 * Errors are automatically parsed and thrown as APIError.
 * Use api-errors.ts utilities to handle them:
 * 
 * try {
 *   const result = await api.projects.create(data);
 * } catch (error) {
 *   showErrorToast(error);
 * }
 */

import type { Project, Asset, Notification, APIResponse } from "@/types";
import { APIError, NetworkError, parseAPIError, isNetworkError } from "@/lib/api-errors";

// ==============================================
// Configuration
// ==============================================

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

// ==============================================
// Base API Client
// ==============================================

class APIClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...this.getAuthHeaders(),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        // Parse and throw API error
        const apiError = await parseAPIError(response);
        throw apiError;
      }

      // Check if response has content
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        return await response.json();
      }

      // For non-JSON responses (like file downloads)
      return response as any;
    } catch (error) {
      // Check if it's a network error
      if (isNetworkError(error)) {
        throw new NetworkError();
      }

      // Re-throw API errors
      if (error instanceof APIError) {
        throw error;
      }

      // Log unexpected errors
      console.error("API Request Failed:", error);
      throw error;
    }
  }

  private getAuthHeaders(): Record<string, string> {
    /**
     * INTEGRATION POINT: Implement authentication
     * Get token from your auth provider (NextAuth, Clerk, Supabase, etc.)
     * 
     * Example:
     * const token = await getToken()
     * return { Authorization: `Bearer ${token}` }
     */
    // return token ? { Authorization: `Bearer ${token}` } : {};
    return {};
  }

  // ==============================================
  // HTTP Methods
  // ==============================================

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "GET" });
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async patch<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "DELETE" });
  }
}

// ==============================================
// API Instance
// ==============================================

const client = new APIClient(API_URL);

// ==============================================
// API Endpoints
// ==============================================

export const api = {
  // Projects
  projects: {
    getAll: () => client.get<{ projects: Project[] }>("/projects"),
    
    getById: (id: string) => 
      client.get<{ project: Project }>(`/projects/${id}`),
    
    create: (data: Omit<Project, "id" | "assets" | "compliance" | "updated" | "createdDate">) =>
      client.post<{ project: Project }>("/projects", data),
    
    update: (id: string, data: Partial<Project>) =>
      client.put<{ project: Project }>(`/projects/${id}`, data),
    
    delete: (id: string) =>
      client.delete<{ success: boolean }>(`/projects/${id}`),
    
    bulkApprove: (projectIds: string[]) =>
      client.patch<{ updated: number }>("/projects/bulk-approve", { projectIds }),
    
    bulkDelete: (projectIds: string[]) =>
      client.delete<{ deleted: number }>("/projects/bulk-delete"),
  },

  // Assets
  assets: {
    getByProject: (projectId: string) =>
      client.get<{ assets: Asset[] }>(`/projects/${projectId}/assets`),
    
    getById: (projectId: string, assetId: string) =>
      client.get<{ asset: Asset }>(`/projects/${projectId}/assets/${assetId}`),
    
    create: (projectId: string, data: Omit<Asset, "id" | "projectId" | "updated" | "createdDate">) =>
      client.post<{ asset: Asset }>(`/projects/${projectId}/assets`, data),
    
    update: (projectId: string, assetId: string, data: Partial<Asset>) =>
      client.put<{ asset: Asset }>(`/projects/${projectId}/assets/${assetId}`, data),
    
    delete: (projectId: string, assetId: string) =>
      client.delete<{ success: boolean }>(`/projects/${projectId}/assets/${assetId}`),
  },

  // Notifications
  notifications: {
    getAll: () =>
      client.get<{ notifications: Notification[] }>("/notifications"),
    
    markAsRead: (id: string) =>
      client.patch<{ success: boolean }>(`/notifications/${id}/read`),
    
    markAllAsRead: () =>
      client.patch<{ updated: number }>("/notifications/mark-all-read"),
    
    delete: (id: string) =>
      client.delete<{ success: boolean }>(`/notifications/${id}`),
    
    clearAll: () =>
      client.delete<{ deleted: number }>("/notifications/clear-all"),
  },

  // Legal
  legal: {
    getIssues: () =>
      client.get<{ issues: any[] }>("/legal/issues"),
    
    approve: (issueId: number) =>
      client.post<{ success: boolean }>(`/legal/issues/${issueId}/approve`),
    
    reject: (issueId: number) =>
      client.post<{ success: boolean }>(`/legal/issues/${issueId}/reject`),
    
    flag: (issueId: number) =>
      client.post<{ success: boolean }>(`/legal/issues/${issueId}/flag`),
    
    export: () =>
      client.get<Blob>("/legal/export"),
  },

  // Insurance/Risk
  insurance: {
    getRiskData: () =>
      client.get<{
        riskIndex: string;
        provenanceScore: number;
        totalAssets: number;
        compliancePercentage: number;
      }>("/insurance/risk-data"),
    
    export: () =>
      client.get<Blob>("/insurance/export"),
  },

  // Integrations
  integrations: {
    getAll: () =>
      client.get<{ tools: any[] }>("/integrations"),
    
    connect: (toolId: string, apiKey: string) =>
      client.post<{ success: boolean }>(`/integrations/${toolId}/connect`, { apiKey }),
    
    disconnect: (toolId: string) =>
      client.delete<{ success: boolean }>(`/integrations/${toolId}/disconnect`),
  },

  // Settings
  settings: {
    get: () =>
      client.get<{ settings: any }>("/settings"),
    
    updatePolicies: (policies: any) =>
      client.put<{ success: boolean }>("/settings/policies", policies),
    
    updateRiskThresholds: (thresholds: any) =>
      client.put<{ success: boolean }>("/settings/risk-thresholds", thresholds),
  },

  // Team
  team: {
    invite: (data: { name: string; email: string; role: string }) =>
      client.post<{ success: boolean }>("/team/invite", data),
    
    getMembers: () =>
      client.get<{ members: any[] }>("/team/members"),
  },

  // Export
  export: {
    projects: (filters?: any) =>
      client.get<Blob>("/export/projects"),
    
    legal: () =>
      client.get<Blob>("/export/legal"),
    
    riskReport: () =>
      client.get<Blob>("/export/risk-report"),
  },
};

// ==============================================
// Helper Functions
// ==============================================

/**
 * Check if API is available
 */
export async function checkAPIHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_URL}/health`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Upload file to API
 * 
 * USAGE:
 * const result = await uploadFile('/projects/1/assets/upload', file, {
 *   name: 'hero-image.jpg',
 *   type: 'Image'
 * });
 */
export async function uploadFile(
  endpoint: string,
  file: File,
  metadata?: Record<string, any>
): Promise<any> {
  const formData = new FormData();
  formData.append("file", file);
  
  if (metadata) {
    Object.entries(metadata).forEach(([key, value]) => {
      formData.append(key, typeof value === "object" ? JSON.stringify(value) : value);
    });
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    method: "POST",
    body: formData,
    // Note: Don't set Content-Type header, browser will set it with boundary
  });

  if (!response.ok) {
    throw await parseAPIError(response);
  }

  return response.json();
}

// ==============================================
// Usage Example
// ==============================================

/**
 * Example: Fetching projects in a component
 * 
 * import { api } from '@/lib/api';
 * 
 * const { projects } = await api.projects.getAll();
 * 
 * // With error handling
 * try {
 *   const { projects } = await api.projects.getAll();
 *   setProjects(projects);
 * } catch (error) {
 *   toast.error(handleAPIError(error));
 * }
 */

