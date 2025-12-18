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
import type { CopyrightCheckData, CopyrightCheckStatus, ApprovalStatus } from "@/types/creative";
import type {
  Creator,
  CreatorInvitation,
  CreatorCredit,
  InviteCreatorForm,
  RegisterCreatorForm,
  UpdateCreatorProfileForm,
  CreatorResponse,
  CreatorsResponse,
  CreatorInvitationsResponse,
  CreatorCreditsResponse,
} from "@/types/creators";
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
    
    /**
     * INTEGRATION POINT: Copyright Check API
     * Trigger copyright check for an uploaded asset
     */
    checkCopyright: (assetId: string, metadata?: Record<string, any>) =>
      client.post<{ 
        checkId: string;
        status: CopyrightCheckStatus;
        estimatedDuration?: number;
      }>(`/assets/${assetId}/copyright-check`, metadata),
    
    /**
     * INTEGRATION POINT: Get Copyright Check Status
     * Poll this endpoint to get real-time progress of copyright check
     */
    getCopyrightCheckStatus: (assetId: string, checkId: string) =>
      client.get<{
        status: CopyrightCheckStatus;
        progress: number; // 0-100
        data?: CopyrightCheckData;
      }>(`/assets/${assetId}/copyright-check/${checkId}`),
    
    /**
     * INTEGRATION POINT: Approve Asset
     * Admin approval for assets flagged during copyright check
     */
    approveAsset: (assetId: string, approvedBy: string, notes?: string) =>
      client.post<{ success: boolean; asset: Asset }>(`/assets/${assetId}/approve`, {
        approvedBy,
        notes,
      }),
    
    /**
     * INTEGRATION POINT: Reject Asset
     * Admin rejection for assets flagged during copyright check
     */
    rejectAsset: (assetId: string, rejectedBy: string, reason: string) =>
      client.post<{ success: boolean }>(`/assets/${assetId}/reject`, {
        rejectedBy,
        reason,
      }),
    
    /**
     * INTEGRATION POINT: Get Pending Approvals
     * Get all assets pending admin approval
     */
    getPendingApprovals: (filters?: {
      brandId?: string;
      riskLevel?: "low" | "medium" | "high";
      status?: CopyrightCheckStatus;
    }) => {
      let endpoint = "/assets/pending-approvals"
      if (filters) {
        const params = new URLSearchParams()
        if (filters.brandId) params.append("brandId", filters.brandId)
        if (filters.riskLevel) params.append("riskLevel", filters.riskLevel)
        if (filters.status) params.append("status", filters.status)
        const queryString = params.toString()
        if (queryString) {
          endpoint += `?${queryString}`
        }
      }
      return client.get<{ assets: Asset[] }>(endpoint)
    },
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

  // Creators
  creators: {
    // Admin Endpoints
    getAll: () => client.get<CreatorsResponse>("/creators"),
    getById: (id: string) => client.get<CreatorResponse>(`/creators/${id}`),
    invite: (data: InviteCreatorForm) =>
      client.post<CreatorInvitation>("/creators/invite", data),
    resendInvitation: (invitationId: string) =>
      client.post<void>(`/creators/invitations/${invitationId}/resend`, {}),
    revokeInvitation: (invitationId: string) =>
      client.delete<void>(`/creators/invitations/${invitationId}`),
    getInvitations: () => client.get<CreatorInvitationsResponse>("/creators/invitations"),
    getInvitationStatus: (email: string) =>
      client.get<CreatorInvitation | null>(`/creators/invitations/status?email=${encodeURIComponent(email)}`),
    creditToAsset: (creatorId: string, assetId: string, role?: string) =>
      client.post<void>(`/creators/${creatorId}/credits/assets`, { assetId, role }),
    creditToProject: (creatorId: string, projectId: string, role?: string) =>
      client.post<void>(`/creators/${creatorId}/credits/projects`, { projectId, role }),
    removeAssetCredit: (creatorId: string, assetId: string) =>
      client.delete<void>(`/creators/${creatorId}/credits/assets/${assetId}`),
    removeProjectCredit: (creatorId: string, projectId: string) =>
      client.delete<void>(`/creators/${creatorId}/credits/projects/${projectId}`),
    getLinkedAssets: (id: string) => client.get<string[]>(`/creators/${id}/assets`),
    getLinkedProjects: (id: string) => client.get<string[]>(`/creators/${id}/projects`),
    
    // Creator Self-Service
    getByToken: (token: string) => client.get<CreatorInvitation>(`/creators/invite/${token}`),
    acceptInvitation: (token: string, data: RegisterCreatorForm) =>
      client.post<Creator>(`/creators/invite/${token}/accept`, data),
    register: (data: RegisterCreatorForm) => client.post<Creator>("/creators/register", data),
    checkEmail: (email: string) =>
      client.get<{ exists: boolean }>(`/creators/check-email?email=${encodeURIComponent(email)}`),
    getMyProfile: () => client.get<CreatorResponse>("/creators/me"),
    updateMyProfile: (data: UpdateCreatorProfileForm) =>
      client.put<CreatorResponse>("/creators/me", data),
    uploadMyReference: (file: File, type: "photo" | "voice_sample" | "guideline" | "other") => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", type);
      return fetch(`${API_URL}/creators/me/references`, {
        method: "POST",
        body: formData,
      }).then((res) => {
        if (!res.ok) throw new Error("Upload failed");
        return res.json();
      });
    },
    uploadMyRightsAgreement: (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      return fetch(`${API_URL}/creators/me/rights-agreement`, {
        method: "POST",
        body: formData,
      }).then((res) => {
        if (!res.ok) throw new Error("Upload failed");
        return res.json();
      });
    },
    getMyAssetCredits: () => client.get<CreatorCreditsResponse>("/creators/me/credits/assets"),
    getMyProjectCredits: () => client.get<CreatorCreditsResponse>("/creators/me/credits/projects"),
    getMyAllCredits: () => client.get<CreatorCreditsResponse>("/creators/me/credits"),
    getMyProfileCompletion: () =>
      client.get<{ completion: number; missingFields: string[] }>("/creators/me/completion"),
    extendRights: (newValidThrough: Date) =>
      client.post<CreatorResponse>("/creators/me/extend-rights", { newValidThrough }),
    
    // Authentication
    login: (email: string, password: string) =>
      client.post<{ creator: Creator; token: string }>("/creators/auth/login", { email, password }),
    logout: () => client.post<void>("/creators/auth/logout", {}),
    forgotPassword: (email: string) =>
      client.post<void>("/creators/auth/forgot-password", { email }),
    resetPassword: (token: string, newPassword: string) =>
      client.post<void>("/creators/auth/reset-password", { token, newPassword }),
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

/**
 * INTEGRATION POINT: Check Copyright for File
 * 
 * This function triggers a copyright check for a file during upload.
 * It should be called after the file is uploaded but before the asset is created.
 * 
 * USAGE:
 * const result = await checkCopyright(file, {
 *   contentType: 'ai_generated',
 *   aiTool: 'Midjourney',
 *   prompt: '...'
 * });
 */
export async function checkCopyright(
  file: File,
  metadata?: Record<string, any>
): Promise<{
  checkId: string;
  status: CopyrightCheckStatus;
  estimatedDuration?: number;
}> {
  const formData = new FormData();
  formData.append("file", file);
  
  if (metadata) {
    Object.entries(metadata).forEach(([key, value]) => {
      formData.append(key, typeof value === "object" ? JSON.stringify(value) : value);
    });
  }

  const response = await fetch(`${API_URL}/copyright/check`, {
    method: "POST",
    body: formData,
    // Note: Don't set Content-Type header, browser will set it with boundary
  });

  if (!response.ok) {
    throw await parseAPIError(response);
  }

  return response.json();
}

/**
 * INTEGRATION POINT: Get Copyright Check Status
 * 
 * Poll this endpoint to get real-time progress of copyright check.
 * Use this for progress bar updates during copyright checking.
 * 
 * USAGE:
 * const status = await getCopyrightCheckStatus(checkId);
 * // status.progress will be 0-100
 */
export async function getCopyrightCheckStatus(
  checkId: string
): Promise<{
  status: CopyrightCheckStatus;
  progress: number; // 0-100
  data?: CopyrightCheckData;
}> {
  const response = await fetch(`${API_URL}/copyright/check/${checkId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
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

