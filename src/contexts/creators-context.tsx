/**
 * Creators Context - Admin Operations
 * 
 * This Context provides state management for creator invitation and management operations.
 * Used by admins to invite creators, view creators, and credit them to assets/projects.
 * 
 * INTEGRATION GUIDE:
 * ------------------
 * 1. Replace setTimeout() simulations with actual API calls from src/lib/api.ts
 * 2. Add error handling for network failures
 * 3. Consider adding optimistic updates for better UX
 * 
 * USAGE:
 * ------
 * import { useCreators } from '@/contexts/creators-context';
 * 
 * const { creators, inviteCreator, creditCreatorToAsset } = useCreators();
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
  Creator,
  CreatorInvitation,
  CreatorCredit,
  InviteCreatorForm,
} from "@/types/creators";
import type { InsuranceIssue, IssueSeverity } from "@/types";
import { mockCreators, mockInvitations } from "@/lib/mock-data/creators";
import {
  generateCreatorRightsID,
  calculateRightsStatus,
  calculateCreatorRiskLevel,
  isValidEmail,
} from "@/lib/creator-utils";

interface CreatorsContextType {
  // State
  creators: Creator[];
  invitations: CreatorInvitation[];
  
  // Invitation methods
  inviteCreator: (form: InviteCreatorForm) => Promise<CreatorInvitation>;
  resendInvitation: (invitationId: string) => Promise<void>;
  revokeInvitation: (invitationId: string) => Promise<void>;
  getInvitationStatus: (email: string) => CreatorInvitation | undefined;
  checkDuplicateInvitation: (email: string) => boolean;
  checkEmailExists: (email: string) => boolean;
  
  // Creator retrieval
  getCreatorById: (id: string) => Creator | undefined;
  getCreatorByToken: (token: string) => CreatorInvitation | undefined;
  
  // Credit/Attribution methods
  creditCreatorToAsset: (creatorId: string, assetId: string, role?: string) => Promise<void>;
  creditCreatorToProject: (creatorId: string, projectId: string, role?: string) => Promise<void>;
  removeAssetCredit: (creatorId: string, assetId: string) => Promise<void>;
  removeProjectCredit: (creatorId: string, projectId: string) => Promise<void>;
  getCreatorsByAsset: (assetId: string) => Creator[];
  getCreatorsByProject: (projectId: string) => Creator[];
  getAssetsByCreator: (creatorId: string) => string[]; // Returns asset IDs
  getProjectsByCreator: (creatorId: string) => string[]; // Returns project IDs
  getAllCreditsByCreator: (creatorId: string) => CreatorCredit[];
  
  // Rights monitoring
  getExpiringCreators: () => Creator[];
  getExpiredCreators: () => Creator[];
  checkExpiringRights: () => void;
  generateCreatorRightsAlerts: () => InsuranceIssue[];
}

const CreatorsContext = createContext<CreatorsContextType | undefined>(undefined);

// Mock credits storage (in real app, this would be in database)
const mockCredits: CreatorCredit[] = [
  // Creator 1 (Sarah Johnson) - Voice Actor credits
  {
    id: "credit-1",
    creatorId: "creator-1",
    assetId: "3",
    projectId: "1", // voice-over-v2.mp3 in Summer Campaign 2024
    role: "Voice Actor",
    creditedAt: new Date("2024-06-22"),
    creditedBy: "admin-1",
  },
  {
    id: "credit-2",
    creatorId: "creator-1",
    assetId: "4",
    projectId: "1", // promotional-video.mp4 in Summer Campaign 2024
    role: "Voice Actor",
    creditedAt: new Date("2024-06-23"),
    creditedBy: "admin-1",
  },
  {
    id: "credit-3",
    creatorId: "creator-1",
    projectId: "1", // Summer Campaign 2024
    role: "Voice Actor",
    creditedAt: new Date("2024-06-15"),
    creditedBy: "admin-1",
  },
  {
    id: "credit-4",
    creatorId: "creator-1",
    projectId: "2", // Product Launch Video
    role: "Voice Actor",
    creditedAt: new Date("2024-07-08"),
    creditedBy: "admin-1",
  },
  {
    id: "credit-5",
    creatorId: "creator-1",
    projectId: "5", // Podcast Series AI Voices
    role: "Voice Actor",
    creditedAt: new Date("2024-10-12"),
    creditedBy: "admin-1",
  },
  {
    id: "credit-6",
    creatorId: "creator-1",
    assetId: "1",
    projectId: "2", // main-video-edit.mp4 in Product Launch Video
    role: "Voice Actor",
    creditedAt: new Date("2024-07-10"),
    creditedBy: "admin-1",
  },
  
  // Creator 2 (Brandy the Bear) - Brand Mascot credits
  {
    id: "credit-7",
    creatorId: "creator-2",
    assetId: "1",
    projectId: "1", // hero-image-final.jpg in Summer Campaign 2024
    role: "Brand Mascot",
    creditedAt: new Date("2024-06-20"),
    creditedBy: "admin-1",
  },
  {
    id: "credit-8",
    creatorId: "creator-2",
    assetId: "4",
    projectId: "1", // promotional-video.mp4 in Summer Campaign 2024
    role: "Brand Mascot",
    creditedAt: new Date("2024-06-23"),
    creditedBy: "admin-1",
  },
  {
    id: "credit-9",
    creatorId: "creator-2",
    assetId: "1",
    projectId: "3", // logo-redesign.svg in Brand Refresh Assets
    role: "Brand Mascot",
    creditedAt: new Date("2024-08-25"),
    creditedBy: "admin-1",
  },
  {
    id: "credit-10",
    creatorId: "creator-2",
    projectId: "1", // Summer Campaign 2024
    role: "Brand Mascot",
    creditedAt: new Date("2024-06-15"),
    creditedBy: "admin-1",
  },
  {
    id: "credit-11",
    creatorId: "creator-2",
    projectId: "3", // Brand Refresh Assets
    role: "Brand Mascot",
    creditedAt: new Date("2024-08-22"),
    creditedBy: "admin-1",
  },
  
  // Creator 3 (Alex the Adventurer) - Character credits
  {
    id: "credit-12",
    creatorId: "creator-3",
    projectId: "1", // Summer Campaign 2024
    role: "Character",
    creditedAt: new Date("2024-06-15"),
    creditedBy: "admin-1",
  },
  
  // Creative Workspace Assets - Sample credits for asset modal
  {
    id: "credit-13",
    creatorId: "creator-1",
    assetId: "asset-1", // Homepage Banner - Holiday Sale.png
    role: "Voice Actor",
    creditedAt: new Date("2025-11-28"),
    creditedBy: "admin-1",
  },
  {
    id: "credit-14",
    creatorId: "creator-2",
    assetId: "asset-1", // Homepage Banner - Holiday Sale.png
    role: "Brand Mascot",
    creditedAt: new Date("2025-11-28"),
    creditedBy: "admin-1",
  },
  {
    id: "credit-15",
    creatorId: "creator-1",
    assetId: "asset-19", // Web Banner - Summer Campaign.png
    role: "Voice Actor",
    creditedAt: new Date("2025-11-25"),
    creditedBy: "admin-1",
  },
  {
    id: "credit-17",
    creatorId: "creator-2",
    assetId: "asset-19", // Web Banner - Summer Campaign.png
    role: "Brand Mascot",
    creditedAt: new Date("2025-11-25"),
    creditedBy: "admin-1",
  },
  {
    id: "credit-16",
    creatorId: "creator-2",
    assetId: "asset-4", // Logo - Primary.svg
    role: "Brand Mascot",
    creditedAt: new Date("2025-12-02"),
    creditedBy: "admin-1",
  },
];

export function CreatorsProvider({ children }: { children: React.ReactNode }) {
  const [creators, setCreators] = useState<Creator[]>(mockCreators);
  const [invitations, setInvitations] = useState<CreatorInvitation[]>(mockInvitations);
  const [credits, setCredits] = useState<CreatorCredit[]>(mockCredits);

  // Generate cryptographically secure token (simplified for MVP)
  const generateInvitationToken = (): string => {
    return `inv-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
  };

  // Invite creator
  const inviteCreator = useCallback(async (form: InviteCreatorForm): Promise<CreatorInvitation> => {
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

    const newInvitation: CreatorInvitation = {
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
    // await api.creators.invite(form);

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
    // await api.creators.resendInvitation(invitationId);
  }, [invitations]);

  // Revoke invitation
  const revokeInvitation = useCallback(async (invitationId: string): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, 300));

    setInvitations((prev) => prev.filter((inv) => inv.id !== invitationId));
    toast.success("Invitation revoked");
    
    // INTEGRATION POINT: Revoke invitation
    // await api.creators.revokeInvitation(invitationId);
  }, []);

  // Get invitation status
  const getInvitationStatus = useCallback(
    (email: string): CreatorInvitation | undefined => {
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
      return creators.some((creator) => creator.email === email);
    },
    [creators]
  );

  // Get creator by ID
  const getCreatorById = useCallback(
    (id: string): Creator | undefined => {
      return creators.find((c) => c.id === id);
    },
    [creators]
  );

  // Get creator by invitation token
  const getCreatorByToken = useCallback(
    (token: string): CreatorInvitation | undefined => {
      return invitations.find((inv) => inv.token === token);
    },
    [invitations]
  );

  // Credit creator to asset
  const creditCreatorToAsset = useCallback(
    async (creatorId: string, assetId: string, role?: string): Promise<void> => {
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Check if credit already exists
      const existingCredit = credits.find(
        (c) => c.creatorId === creatorId && c.assetId === assetId
      );
      if (existingCredit) {
        throw new Error("Creator is already credited on this asset");
      }

      const newCredit: CreatorCredit = {
        id: `credit-${Date.now()}`,
        creatorId,
        assetId,
        role,
        creditedAt: new Date(),
        creditedBy: "admin-1",
      };

      setCredits((prev) => [...prev, newCredit]);

      // Update creator linked assets count
      setCreators((prev) =>
        prev.map((c) =>
          c.id === creatorId
            ? { ...c, linkedAssetsCount: c.linkedAssetsCount + 1 }
            : c
        )
      );

      toast.success("Creator credited to asset");
      
      // INTEGRATION POINT: Credit creator to asset
      // await api.creators.creditToAsset(creatorId, assetId, role);
    },
    [credits]
  );

  // Credit creator to project
  const creditCreatorToProject = useCallback(
    async (creatorId: string, projectId: string, role?: string): Promise<void> => {
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Check if credit already exists
      const existingCredit = credits.find(
        (c) => c.creatorId === creatorId && c.projectId === projectId
      );
      if (existingCredit) {
        throw new Error("Creator is already credited on this project");
      }

      const newCredit: CreatorCredit = {
        id: `credit-${Date.now()}`,
        creatorId,
        projectId,
        role,
        creditedAt: new Date(),
        creditedBy: "admin-1",
      };

      setCredits((prev) => [...prev, newCredit]);

      // Update creator linked projects count
      setCreators((prev) =>
        prev.map((c) =>
          c.id === creatorId
            ? { ...c, linkedProjectsCount: c.linkedProjectsCount + 1 }
            : c
        )
      );

      toast.success("Creator credited to project");
      
      // INTEGRATION POINT: Credit creator to project
      // await api.creators.creditToProject(creatorId, projectId, role);
    },
    [credits]
  );

  // Remove asset credit
  const removeAssetCredit = useCallback(
    async (creatorId: string, assetId: string): Promise<void> => {
      await new Promise((resolve) => setTimeout(resolve, 300));

      setCredits((prev) =>
        prev.filter((c) => !(c.creatorId === creatorId && c.assetId === assetId))
      );

      // Update creator linked assets count
      setCreators((prev) =>
        prev.map((c) =>
          c.id === creatorId
            ? { ...c, linkedAssetsCount: Math.max(0, c.linkedAssetsCount - 1) }
            : c
        )
      );

      toast.success("Credit removed");
      
      // INTEGRATION POINT: Remove asset credit
      // await api.creators.removeAssetCredit(creatorId, assetId);
    },
    []
  );

  // Remove project credit
  const removeProjectCredit = useCallback(
    async (creatorId: string, projectId: string): Promise<void> => {
      await new Promise((resolve) => setTimeout(resolve, 300));

      setCredits((prev) =>
        prev.filter((c) => !(c.creatorId === creatorId && c.projectId === projectId))
      );

      // Update creator linked projects count
      setCreators((prev) =>
        prev.map((c) =>
          c.id === creatorId
            ? { ...c, linkedProjectsCount: Math.max(0, c.linkedProjectsCount - 1) }
            : c
        )
      );

      toast.success("Credit removed");
      
      // INTEGRATION POINT: Remove project credit
      // await api.creators.removeProjectCredit(creatorId, projectId);
    },
    []
  );

  // Get creators by asset
  const getCreatorsByAsset = useCallback(
    (assetId: string): Creator[] => {
      const assetCredits = credits.filter((c) => c.assetId === assetId);
      const creatorIds = assetCredits.map((c) => c.creatorId);
      return creators.filter((c) => creatorIds.includes(c.id));
    },
    [creators, credits]
  );

  // Get creators by project
  const getCreatorsByProject = useCallback(
    (projectId: string): Creator[] => {
      const projectCredits = credits.filter((c) => c.projectId === projectId);
      const creatorIds = projectCredits.map((c) => c.creatorId);
      return creators.filter((c) => creatorIds.includes(c.id));
    },
    [creators, credits]
  );

  // Get assets by creator
  const getAssetsByCreator = useCallback(
    (creatorId: string): string[] => {
      return credits
        .filter((c) => c.creatorId === creatorId && c.assetId)
        .map((c) => c.assetId!);
    },
    [credits]
  );

  // Get projects by creator
  const getProjectsByCreator = useCallback(
    (creatorId: string): string[] => {
      return credits
        .filter((c) => c.creatorId === creatorId && c.projectId)
        .map((c) => c.projectId!);
    },
    [credits]
  );

  // Get all credits by creator
  const getAllCreditsByCreator = useCallback(
    (creatorId: string): CreatorCredit[] => {
      return credits.filter((c) => c.creatorId === creatorId);
    },
    [credits]
  );

  // Get expiring creators
  const getExpiringCreators = useCallback((): Creator[] => {
    return creators.filter((c) => c.rightsStatus === "Expiring Soon");
  }, [creators]);

  // Get expired creators
  const getExpiredCreators = useCallback((): Creator[] => {
    return creators.filter((c) => c.rightsStatus === "Expired");
  }, [creators]);

  // Check expiring rights (updates creator statuses)
  const checkExpiringRights = useCallback((): void => {
    setCreators((prev) =>
      prev.map((creator) => {
        const rightsStatus = calculateRightsStatus(creator.validThrough);
        const riskLevel = calculateCreatorRiskLevel(creator.validThrough);
        return {
          ...creator,
          rightsStatus,
          riskLevel,
        };
      })
    );
  }, []);

  // Generate alerts for creator rights issues
  const generateCreatorRightsAlerts = useCallback((): InsuranceIssue[] => {
    const alerts: InsuranceIssue[] = [];
    const now = new Date();

    creators.forEach((creator) => {
      const expirationDate = new Date(creator.validThrough);
      const daysUntilExpiration = Math.ceil(
        (expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );

      // Generate alert for expired rights
      if (daysUntilExpiration < 0) {
        alerts.push({
          id: `creator-expired-${creator.id}`,
          title: `Creator Rights Expired: ${creator.fullName}`,
          description: `Creator rights for ${creator.fullName} (${creator.creatorRightsId}) expired ${Math.abs(daysUntilExpiration)} day${Math.abs(daysUntilExpiration) !== 1 ? "s" : ""} ago. Immediate action required.`,
          severity: "Critical" as IssueSeverity,
          category: "creator-rights",
          creatorId: creator.id,
          dueDate: expirationDate,
          createdAt: now,
          resolved: false,
        });
      }
      // Generate alert for expiring soon (within 30 days)
      else if (daysUntilExpiration <= 30 && daysUntilExpiration > 0) {
        alerts.push({
          id: `creator-expiring-${creator.id}`,
          title: `Creator Rights Expiring Soon: ${creator.fullName}`,
          description: `Creator rights for ${creator.fullName} (${creator.creatorRightsId}) will expire in ${daysUntilExpiration} day${daysUntilExpiration !== 1 ? "s" : ""}. Please renew or extend the rights agreement.`,
          severity: "Urgent" as IssueSeverity,
          category: "creator-rights",
          creatorId: creator.id,
          dueDate: expirationDate,
          createdAt: now,
          resolved: false,
        });
      }
    });

    return alerts;
  }, [creators]);

  const value: CreatorsContextType = {
    creators,
    invitations,
    inviteCreator,
    resendInvitation,
    revokeInvitation,
    getInvitationStatus,
    checkDuplicateInvitation,
    checkEmailExists,
    getCreatorById,
    getCreatorByToken,
    creditCreatorToAsset,
    creditCreatorToProject,
    removeAssetCredit,
    removeProjectCredit,
    getCreatorsByAsset,
    getCreatorsByProject,
    getAssetsByCreator,
    getProjectsByCreator,
    getAllCreditsByCreator,
    getExpiringCreators,
    getExpiredCreators,
    checkExpiringRights,
    generateCreatorRightsAlerts,
  };

  return (
    <CreatorsContext.Provider value={value}>
      {children}
    </CreatorsContext.Provider>
  );
}

export function useCreators() {
  const context = useContext(CreatorsContext);
  if (!context) {
    throw new Error("useCreators must be used within CreatorsProvider");
  }
  return context;
}

