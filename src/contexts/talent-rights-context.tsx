/**
 * Talent Rights Context - Admin Operations
 * 
 * This Context provides state management for talent rights invitation and management operations.
 * Used by admins to invite talent, view talent rights, and credit them to assets/projects.
 * 
 * INTEGRATION GUIDE:
 * ------------------
 * 1. Replace setTimeout() simulations with actual API calls from src/lib/api.ts
 * 2. Add error handling for network failures
 * 3. Consider adding optimistic updates for better UX
 * 
 * USAGE:
 * ------
 * import { useTalentRights } from '@/contexts/talent-rights-context';
 * 
 * const { talentRights, inviteTalent, creditTalentToAsset } = useTalentRights();
 * 
 * CURRENT STATE:
 * --------------
 * - All data stored in React state (in-memory)
 * - Data resets on page refresh
 * - Mock delays simulate API latency
 * - Ready for API integration - just replace the method implementations
 */

"use client"

import React, { createContext, useContext, useState, useCallback } from "react";
import { toast } from "sonner";
import type {
  TalentRights,
  TalentInvitation,
  TalentCredit,
  InviteTalentForm,
} from "@/types/talent-rights";
import type { InsuranceIssue, IssueSeverity } from "@/types";
import { mockCreators, mockInvitations } from "@/lib/mock-data/creators";
import {
  generateCreatorRightsID,
  calculateRightsStatus,
  calculateCreatorRiskLevel,
  isValidEmail,
} from "@/lib/creator-utils";

interface TalentRightsContextType {
  // State
  talentRights: TalentRights[];
  invitations: TalentInvitation[];
  
  // Invitation methods
  inviteTalent: (form: InviteTalentForm) => Promise<TalentInvitation>;
  resendInvitation: (invitationId: string) => Promise<void>;
  revokeInvitation: (invitationId: string) => Promise<void>;
  getInvitationStatus: (email: string) => TalentInvitation | undefined;
  checkDuplicateInvitation: (email: string) => boolean;
  checkEmailExists: (email: string) => boolean;
  
  // Talent retrieval
  getTalentById: (id: string) => TalentRights | undefined;
  getTalentByToken: (token: string) => TalentInvitation | undefined;
  
  // Credit/Attribution methods
  creditTalentToAsset: (talentId: string, assetId: string, role?: string) => Promise<void>;
  creditTalentToProject: (talentId: string, projectId: string, role?: string) => Promise<void>;
  removeAssetCredit: (talentId: string, assetId: string) => Promise<void>;
  removeProjectCredit: (talentId: string, projectId: string) => Promise<void>;
  getTalentByAsset: (assetId: string) => TalentRights[];
  getTalentByProject: (projectId: string) => TalentRights[];
  getAssetsByTalent: (talentId: string) => string[]; // Returns asset IDs
  getProjectsByTalent: (talentId: string) => string[]; // Returns project IDs
  getAllCreditsByTalent: (talentId: string) => TalentCredit[];
  
  // Rights monitoring
  getExpiringTalent: () => TalentRights[];
  getExpiredTalent: () => TalentRights[];
  checkExpiringRights: () => void;
  generateTalentRightsAlerts: () => InsuranceIssue[];
  
  // Backward compatibility (deprecated)
  /** @deprecated Use talentRights instead */
  creators: TalentRights[];
  /** @deprecated Use getTalentById instead */
  getCreatorById: (id: string) => TalentRights | undefined;
  /** @deprecated Use inviteTalent instead */
  inviteCreator: (form: InviteTalentForm) => Promise<TalentInvitation>;
  /** @deprecated Use creditTalentToAsset instead */
  creditCreatorToAsset: (talentId: string, assetId: string, role?: string) => Promise<void>;
  /** @deprecated Use creditTalentToProject instead */
  creditCreatorToProject: (talentId: string, projectId: string, role?: string) => Promise<void>;
  /** @deprecated Use getTalentByAsset instead */
  getCreatorsByAsset: (assetId: string) => TalentRights[];
  /** @deprecated Use getTalentByProject instead */
  getCreatorsByProject: (projectId: string) => TalentRights[];
  /** @deprecated Use getAssetsByTalent instead */
  getAssetsByCreator: (talentId: string) => string[];
  /** @deprecated Use getProjectsByTalent instead */
  getProjectsByCreator: (talentId: string) => string[];
  /** @deprecated Use getAllCreditsByTalent instead */
  getAllCreditsByCreator: (talentId: string) => TalentCredit[];
  /** @deprecated Use getCreatorByToken instead */
  getCreatorByToken: (token: string) => TalentInvitation | undefined;
  /** @deprecated Use getExpiringTalent instead */
  getExpiringCreators: () => TalentRights[];
  /** @deprecated Use getExpiredTalent instead */
  getExpiredCreators: () => TalentRights[];
  /** @deprecated Use generateTalentRightsAlerts instead */
  generateCreatorRightsAlerts: () => InsuranceIssue[];
}

const TalentRightsContext = createContext<TalentRightsContextType | undefined>(undefined);

// Mock credits storage (in real app, this would be in database)
const mockCredits: TalentCredit[] = [
  // Talent 1 (Sarah Johnson) - Voice Actor credits
  {
    id: "credit-1",
    talentId: "creator-1",
    assetId: "3",
    projectId: "1", // voice-over-v2.mp3 in Summer Campaign 2024
    role: "Voice Actor",
    creditedAt: new Date("2024-06-22"),
    creditedBy: "admin-1",
  },
  {
    id: "credit-2",
    talentId: "creator-1",
    assetId: "4",
    projectId: "1", // promotional-video.mp4 in Summer Campaign 2024
    role: "Voice Actor",
    creditedAt: new Date("2024-06-23"),
    creditedBy: "admin-1",
  },
  {
    id: "credit-3",
    talentId: "creator-1",
    projectId: "1", // Summer Campaign 2024
    role: "Voice Actor",
    creditedAt: new Date("2024-06-15"),
    creditedBy: "admin-1",
  },
  {
    id: "credit-4",
    talentId: "creator-1",
    projectId: "2", // Product Launch Video
    role: "Voice Actor",
    creditedAt: new Date("2024-07-08"),
    creditedBy: "admin-1",
  },
  {
    id: "credit-5",
    talentId: "creator-1",
    projectId: "5", // Podcast Series AI Voices
    role: "Voice Actor",
    creditedAt: new Date("2024-10-12"),
    creditedBy: "admin-1",
  },
  {
    id: "credit-6",
    talentId: "creator-1",
    assetId: "1",
    projectId: "2", // main-video-edit.mp4 in Product Launch Video
    role: "Voice Actor",
    creditedAt: new Date("2024-07-10"),
    creditedBy: "admin-1",
  },
  
  // Talent 2 (Brandy the Bear) - Brand Mascot credits
  {
    id: "credit-7",
    talentId: "creator-2",
    assetId: "1",
    projectId: "1", // hero-image-final.jpg in Summer Campaign 2024
    role: "Brand Mascot",
    creditedAt: new Date("2024-06-20"),
    creditedBy: "admin-1",
  },
  {
    id: "credit-8",
    talentId: "creator-2",
    assetId: "4",
    projectId: "1", // promotional-video.mp4 in Summer Campaign 2024
    role: "Brand Mascot",
    creditedAt: new Date("2024-06-23"),
    creditedBy: "admin-1",
  },
  {
    id: "credit-9",
    talentId: "creator-2",
    assetId: "1",
    projectId: "3", // logo-redesign.svg in Brand Refresh Assets
    role: "Brand Mascot",
    creditedAt: new Date("2024-08-25"),
    creditedBy: "admin-1",
  },
  {
    id: "credit-10",
    talentId: "creator-2",
    projectId: "1", // Summer Campaign 2024
    role: "Brand Mascot",
    creditedAt: new Date("2024-06-15"),
    creditedBy: "admin-1",
  },
  {
    id: "credit-11",
    talentId: "creator-2",
    projectId: "3", // Brand Refresh Assets
    role: "Brand Mascot",
    creditedAt: new Date("2024-08-22"),
    creditedBy: "admin-1",
  },
  
  // Talent 3 (Alex the Adventurer) - Character credits
  {
    id: "credit-12",
    talentId: "creator-3",
    projectId: "1", // Summer Campaign 2024
    role: "Character",
    creditedAt: new Date("2024-06-15"),
    creditedBy: "admin-1",
  },
  
  // Creative Workspace Assets - Sample credits for asset modal
  {
    id: "credit-13",
    talentId: "creator-1",
    assetId: "asset-1", // Homepage Banner - Holiday Sale.png
    role: "Voice Actor",
    creditedAt: new Date("2025-11-28"),
    creditedBy: "admin-1",
  },
  {
    id: "credit-14",
    talentId: "creator-2",
    assetId: "asset-1", // Homepage Banner - Holiday Sale.png
    role: "Brand Mascot",
    creditedAt: new Date("2025-11-28"),
    creditedBy: "admin-1",
  },
  {
    id: "credit-15",
    talentId: "creator-1",
    assetId: "asset-19", // Web Banner - Summer Campaign.png
    role: "Voice Actor",
    creditedAt: new Date("2025-11-25"),
    creditedBy: "admin-1",
  },
  {
    id: "credit-17",
    talentId: "creator-2",
    assetId: "asset-19", // Web Banner - Summer Campaign.png
    role: "Brand Mascot",
    creditedAt: new Date("2025-11-25"),
    creditedBy: "admin-1",
  },
  {
    id: "credit-16",
    talentId: "creator-2",
    assetId: "asset-4", // Logo - Primary.svg
    role: "Brand Mascot",
    creditedAt: new Date("2025-12-02"),
    creditedBy: "admin-1",
  },
];

export function TalentRightsProvider({ children }: { children: React.ReactNode }) {
  const [talentRights, setTalentRights] = useState<TalentRights[]>(mockCreators as TalentRights[]);
  const [invitations, setInvitations] = useState<TalentInvitation[]>(mockInvitations as TalentInvitation[]);
  const [credits, setCredits] = useState<TalentCredit[]>(mockCredits);

  // Generate cryptographically secure token (simplified for MVP)
  const generateInvitationToken = (): string => {
    return `inv-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
  };

  // Invite talent
  const inviteTalent = useCallback(async (form: InviteTalentForm): Promise<TalentInvitation> => {
    // Validate email
    if (!isValidEmail(form.email)) {
      throw new Error("Invalid email format");
    }

    // Check for duplicates
    if (checkDuplicateInvitation(form.email) || checkEmailExists(form.email)) {
      throw new Error("Email already has a pending invitation or is already registered");
    }

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

    const newInvitation: TalentInvitation = {
      id: `inv-${Date.now()}`,
      email: form.email,
      name: form.name,
      token: generateInvitationToken(),
      status: "pending",
      expiresAt,
      createdAt: new Date(),
      invitedBy: "admin-1", // In real app, get from auth context
    };

    setInvitations((prev) => [...prev, newInvitation]);
    toast.success(`Invitation sent to ${form.email}`);
    
    // INTEGRATION POINT: Send invitation email
    // await api.talentRights.invite(form);

    return newInvitation;
  }, []);

  // Resend invitation
  const resendInvitation = useCallback(async (invitationId: string): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, 300));

    const invitation = invitations.find((inv) => inv.id === invitationId);
    if (!invitation) {
      throw new Error("Invitation not found");
    }

    if (invitation.status !== "pending") {
      throw new Error("Can only resend pending invitations");
    }

    // Update expiration date
    const newExpiresAt = new Date();
    newExpiresAt.setDate(newExpiresAt.getDate() + 7);

    setInvitations((prev) =>
      prev.map((inv) =>
        inv.id === invitationId
          ? { ...inv, expiresAt: newExpiresAt }
          : inv
      )
    );

    toast.success("Invitation resent");
    
    // INTEGRATION POINT: Resend invitation email
    // await api.talentRights.resendInvitation(invitationId);
  }, [invitations]);

  // Revoke invitation
  const revokeInvitation = useCallback(async (invitationId: string): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, 300));

    setInvitations((prev) => prev.filter((inv) => inv.id !== invitationId));
    toast.success("Invitation revoked");
    
    // INTEGRATION POINT: Revoke invitation
    // await api.talentRights.revokeInvitation(invitationId);
  }, []);

  // Get invitation status
  const getInvitationStatus = useCallback(
    (email: string): TalentInvitation | undefined => {
      return invitations.find((inv) => inv.email === email);
    },
    [invitations]
  );

  // Check for duplicate invitation
  const checkDuplicateInvitation = useCallback(
    (email: string): boolean => {
      return invitations.some(
        (inv) => inv.email === email && inv.status === "pending"
      );
    },
    [invitations]
  );

  // Check if email exists
  const checkEmailExists = useCallback(
    (email: string): boolean => {
      return talentRights.some((talent) => talent.email === email);
    },
    [talentRights]
  );

  // Get talent by ID
  const getTalentById = useCallback(
    (id: string): TalentRights | undefined => {
      return talentRights.find((t) => t.id === id);
    },
    [talentRights]
  );

  // Get talent by invitation token
  const getTalentByToken = useCallback(
    (token: string): TalentInvitation | undefined => {
      return invitations.find((inv) => inv.token === token);
    },
    [invitations]
  );

  // Credit talent to asset
  const creditTalentToAsset = useCallback(
    async (talentId: string, assetId: string, role?: string): Promise<void> => {
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Check if credit already exists
      const existingCredit = credits.find(
        (c) => c.talentId === talentId && c.assetId === assetId
      );
      if (existingCredit) {
        throw new Error("Talent is already credited on this asset");
      }

      const newCredit: TalentCredit = {
        id: `credit-${Date.now()}`,
        talentId,
        assetId,
        role,
        creditedAt: new Date(),
        creditedBy: "admin-1",
      };

      setCredits((prev) => [...prev, newCredit]);

      // Update talent linked assets count
      setTalentRights((prev) =>
        prev.map((t) =>
          t.id === talentId
            ? { ...t, linkedAssetsCount: t.linkedAssetsCount + 1 }
            : t
        )
      );

      toast.success("Talent credited to asset");
      
      // INTEGRATION POINT: Credit talent to asset
      // await api.talentRights.creditToAsset(talentId, assetId, role);
    },
    [credits]
  );

  // Credit talent to project
  const creditTalentToProject = useCallback(
    async (talentId: string, projectId: string, role?: string): Promise<void> => {
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Check if credit already exists
      const existingCredit = credits.find(
        (c) => c.talentId === talentId && c.projectId === projectId
      );
      if (existingCredit) {
        throw new Error("Talent is already credited on this project");
      }

      const newCredit: TalentCredit = {
        id: `credit-${Date.now()}`,
        talentId,
        projectId,
        role,
        creditedAt: new Date(),
        creditedBy: "admin-1",
      };

      setCredits((prev) => [...prev, newCredit]);

      // Update talent linked projects count
      setTalentRights((prev) =>
        prev.map((t) =>
          t.id === talentId
            ? { ...t, linkedProjectsCount: t.linkedProjectsCount + 1 }
            : t
        )
      );

      toast.success("Talent credited to project");
      
      // INTEGRATION POINT: Credit talent to project
      // await api.talentRights.creditToProject(talentId, projectId, role);
    },
    [credits]
  );

  // Remove asset credit
  const removeAssetCredit = useCallback(
    async (talentId: string, assetId: string): Promise<void> => {
      await new Promise((resolve) => setTimeout(resolve, 300));

      setCredits((prev) =>
        prev.filter((c) => !(c.talentId === talentId && c.assetId === assetId))
      );

      // Update talent linked assets count
      setTalentRights((prev) =>
        prev.map((t) =>
          t.id === talentId
            ? { ...t, linkedAssetsCount: Math.max(0, t.linkedAssetsCount - 1) }
            : t
        )
      );

      toast.success("Credit removed");
      
      // INTEGRATION POINT: Remove asset credit
      // await api.talentRights.removeAssetCredit(talentId, assetId);
    },
    []
  );

  // Remove project credit
  const removeProjectCredit = useCallback(
    async (talentId: string, projectId: string): Promise<void> => {
      await new Promise((resolve) => setTimeout(resolve, 300));

      setCredits((prev) =>
        prev.filter((c) => !(c.talentId === talentId && c.projectId === projectId))
      );

      // Update talent linked projects count
      setTalentRights((prev) =>
        prev.map((t) =>
          t.id === talentId
            ? { ...t, linkedProjectsCount: Math.max(0, t.linkedProjectsCount - 1) }
            : t
        )
      );

      toast.success("Credit removed");
      
      // INTEGRATION POINT: Remove project credit
      // await api.talentRights.removeProjectCredit(talentId, projectId);
    },
    []
  );

  // Get talent by asset
  const getTalentByAsset = useCallback(
    (assetId: string): TalentRights[] => {
      const assetCredits = credits.filter((c) => c.assetId === assetId);
      const talentIds = assetCredits.map((c) => c.talentId);
      return talentRights.filter((t) => talentIds.includes(t.id));
    },
    [talentRights, credits]
  );

  // Get talent by project
  const getTalentByProject = useCallback(
    (projectId: string): TalentRights[] => {
      const projectCredits = credits.filter((c) => c.projectId === projectId);
      const talentIds = projectCredits.map((c) => c.talentId);
      return talentRights.filter((t) => talentIds.includes(t.id));
    },
    [talentRights, credits]
  );

  // Get assets by talent
  const getAssetsByTalent = useCallback(
    (talentId: string): string[] => {
      return credits
        .filter((c) => c.talentId === talentId && c.assetId)
        .map((c) => c.assetId!);
    },
    [credits]
  );

  // Get projects by talent
  const getProjectsByTalent = useCallback(
    (talentId: string): string[] => {
      return credits
        .filter((c) => c.talentId === talentId && c.projectId)
        .map((c) => c.projectId!);
    },
    [credits]
  );

  // Get all credits by talent
  const getAllCreditsByTalent = useCallback(
    (talentId: string): TalentCredit[] => {
      return credits.filter((c) => c.talentId === talentId);
    },
    [credits]
  );

  // Get expiring talent
  const getExpiringTalent = useCallback((): TalentRights[] => {
    return talentRights.filter((t) => t.rightsStatus === "Expiring Soon");
  }, [talentRights]);

  // Get expired talent
  const getExpiredTalent = useCallback((): TalentRights[] => {
    return talentRights.filter((t) => t.rightsStatus === "Expired");
  }, [talentRights]);

  // Check expiring rights (updates talent statuses)
  const checkExpiringRights = useCallback((): void => {
    setTalentRights((prev) =>
      prev.map((talent) => {
        const rightsStatus = calculateRightsStatus(talent.validThrough);
        const riskLevel = calculateCreatorRiskLevel(talent.validThrough);
        return {
          ...talent,
          rightsStatus,
          riskLevel,
        };
      })
    );
  }, []);

  // Generate alerts for talent rights issues
  const generateTalentRightsAlerts = useCallback((): InsuranceIssue[] => {
    const alerts: InsuranceIssue[] = [];
    const now = new Date();

    talentRights.forEach((talent) => {
      const expirationDate = new Date(talent.validThrough);
      const daysUntilExpiration = Math.ceil(
        (expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );

      // Generate alert for expired rights
      if (daysUntilExpiration < 0) {
        alerts.push({
          id: `talent-expired-${talent.id}`,
          title: `Talent Rights Expired: ${talent.fullName}`,
          description: `Talent rights for ${talent.fullName} (${talent.talentRightsId || talent.creatorRightsId}) expired ${Math.abs(daysUntilExpiration)} day${Math.abs(daysUntilExpiration) !== 1 ? "s" : ""} ago. Immediate action required.`,
          severity: "Critical" as IssueSeverity,
          category: "creator-rights",
          creatorId: talent.id,
          dueDate: expirationDate,
          createdAt: now,
          resolved: false,
        });
      }
      // Generate alert for expiring soon (within 30 days)
      else if (daysUntilExpiration <= 30 && daysUntilExpiration > 0) {
        alerts.push({
          id: `talent-expiring-${talent.id}`,
          title: `Talent Rights Expiring Soon: ${talent.fullName}`,
          description: `Talent rights for ${talent.fullName} (${talent.talentRightsId || talent.creatorRightsId}) will expire in ${daysUntilExpiration} day${daysUntilExpiration !== 1 ? "s" : ""}. Please renew or extend the rights agreement.`,
          severity: "Urgent" as IssueSeverity,
          category: "creator-rights",
          creatorId: talent.id,
          dueDate: expirationDate,
          createdAt: now,
          resolved: false,
        });
      }
    });

    return alerts;
  }, [talentRights]);

  const value: TalentRightsContextType = {
    talentRights,
    invitations,
    inviteTalent,
    resendInvitation,
    revokeInvitation,
    getInvitationStatus,
    checkDuplicateInvitation,
    checkEmailExists,
    getTalentById,
    getTalentByToken,
    creditTalentToAsset,
    creditTalentToProject,
    removeAssetCredit,
    removeProjectCredit,
    getTalentByAsset,
    getTalentByProject,
    getAssetsByTalent,
    getProjectsByTalent,
    getAllCreditsByTalent,
    getExpiringTalent,
    getExpiredTalent,
    checkExpiringRights,
    generateTalentRightsAlerts,
    // Backward compatibility
    creators: talentRights,
    getCreatorById: getTalentById,
    inviteCreator: inviteTalent,
    creditCreatorToAsset: creditTalentToAsset,
    creditCreatorToProject: creditTalentToProject,
    getCreatorsByAsset: getTalentByAsset,
    getCreatorsByProject: getTalentByProject,
    getAssetsByCreator: getAssetsByTalent,
    getProjectsByCreator: getProjectsByTalent,
    getAllCreditsByCreator: getAllCreditsByTalent,
    getCreatorByToken: getTalentByToken,
    getExpiringCreators: getExpiringTalent,
    getExpiredCreators: getExpiredTalent,
    generateCreatorRightsAlerts: generateTalentRightsAlerts,
  };

  return (
    <TalentRightsContext.Provider value={value}>
      {children}
    </TalentRightsContext.Provider>
  );
}

export function useTalentRights() {
  const context = useContext(TalentRightsContext);
  if (!context) {
    throw new Error("useTalentRights must be used within TalentRightsProvider");
  }
  return context;
}

// Backward compatibility export
/** @deprecated Use useTalentRights instead */
export function useCreators() {
  return useTalentRights();
}

// Backward compatibility export
/** @deprecated Use TalentRightsProvider instead */
export const CreatorsProvider = TalentRightsProvider;
