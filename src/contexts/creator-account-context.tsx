/**
 * Creator Account Context - Self-Service Operations
 * 
 * This Context provides state management for creator self-service operations.
 * Used when a creator is logged in to manage their own profile.
 * 
 * INTEGRATION GUIDE:
 * ------------------
 * 1. Replace setTimeout() simulations with actual API calls from src/lib/api.ts
 * 2. Add authentication token handling
 * 3. Add error handling for network failures
 * 
 * USAGE:
 * ------
 * import { useCreatorAccount } from '@/contexts/creator-account-context';
 * 
 * const { currentCreator, updateMyProfile, getMyCredits } = useCreatorAccount();
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
  CreatorCredit,
  CreatorReferenceMaterial,
  RegisterCreatorForm,
  UpdateCreatorProfileForm,
} from "@/types/creators";
import { mockCreators } from "@/lib/mock-data/creators";
import {
  calculateRightsStatus,
  calculateCreatorRiskLevel,
  calculateProfileCompletion,
  validateRightsDates,
} from "@/lib/creator-utils";

interface CreatorAccountContextType {
  // State
  currentCreator: Creator | null;
  isAuthenticated: boolean;
  
  // Authentication
  registerCreator: (form: RegisterCreatorForm) => Promise<Creator>;
  login: (email: string, password: string) => Promise<Creator>;
  logout: () => void;
  isCreatorAccount: () => boolean;
  
  // Profile management
  updateMyProfile: (updates: UpdateCreatorProfileForm) => Promise<void>;
  uploadMyReference: (file: File, type: CreatorReferenceMaterial["type"]) => Promise<CreatorReferenceMaterial>;
  uploadMyRightsAgreement: (file: File) => Promise<void>;
  getProfileCompletionStatus: () => number;
  
  // Credits (read-only for creator)
  getMyLinkedAssets: () => string[]; // Returns asset IDs
  getMyLinkedProjects: () => string[]; // Returns project IDs
  getMyCredits: () => CreatorCredit[];
  
  // Rights management
  extendRights: (newValidThrough: Date) => Promise<void>;
  
  // Password reset
  requestPasswordReset: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
}

const CreatorAccountContext = createContext<CreatorAccountContextType | undefined>(undefined);

export function CreatorAccountProvider({ children }: { children: React.ReactNode }) {
  const [currentCreator, setCurrentCreator] = useState<Creator | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Register new creator (self-registration)
  const registerCreator = useCallback(async (form: RegisterCreatorForm): Promise<Creator> => {
    // Validate password match
    if (form.password !== form.confirmPassword) {
      throw new Error("Passwords do not match");
    }

    // Validate password strength (basic)
    if (form.password.length < 8) {
      throw new Error("Password must be at least 8 characters");
    }

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    const now = new Date();
    const validFrom = now;
    const validThrough = new Date(now);
    validThrough.setFullYear(validThrough.getFullYear() + 1); // Default 1 year

    const newCreator: Creator = {
      id: `creator-${Date.now()}`,
      email: form.email,
      fullName: form.fullName,
      creatorRightsId: `CR-${new Date().getFullYear()}-${String(Date.now()).slice(-5)}`,
      creatorType: form.creatorType,
      validFrom,
      validThrough,
      rightsStatus: calculateRightsStatus(validThrough),
      riskLevel: calculateCreatorRiskLevel(validThrough),
      referenceMaterials: [],
      registrationSource: "self_registered",
      linkedAssetsCount: 0,
      linkedProjectsCount: 0,
      profileCompletion: calculateProfileCompletion({
        id: "",
        email: form.email,
        fullName: form.fullName,
        creatorRightsId: "",
        creatorType: form.creatorType,
        validFrom,
        validThrough,
        rightsStatus: "Authorized",
        riskLevel: "Low",
        referenceMaterials: [],
        registrationSource: "self_registered",
        linkedAssetsCount: 0,
        linkedProjectsCount: 0,
        profileCompletion: 0,
        createdAt: now,
        updatedAt: now,
      }),
      createdAt: now,
      updatedAt: now,
    };

    // In real app, this would be handled by the API
    // For MVP, we'll just set it as current creator
    setCurrentCreator(newCreator);
    setIsAuthenticated(true);

    toast.success("Account created successfully!");
    
    // INTEGRATION POINT: Register creator
    // const response = await api.creators.register(form);
    // setCurrentCreator(response.creator);

    return newCreator;
  }, []);

  // Login
  const login = useCallback(async (email: string, password: string): Promise<Creator> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Find creator by email (mock - in real app, this would be API call)
    const creator = mockCreators.find((c) => c.email === email);
    
    if (!creator) {
      throw new Error("Invalid email or password");
    }

    // In real app, password would be verified on server
    // For MVP, we'll just check if creator exists
    if (password.length < 8) {
      throw new Error("Invalid email or password");
    }

    setCurrentCreator(creator);
    setIsAuthenticated(true);

    toast.success(`Welcome back, ${creator.fullName}!`);
    
    // INTEGRATION POINT: Login
    // const response = await api.creators.login(email, password);
    // setCurrentCreator(response.creator);

    return creator;
  }, []);

  // Logout
  const logout = useCallback(() => {
    setCurrentCreator(null);
    setIsAuthenticated(false);
    toast.success("Logged out successfully");
    
    // INTEGRATION POINT: Logout
    // await api.creators.logout();
  }, []);

  // Check if current user is a creator account
  const isCreatorAccount = useCallback((): boolean => {
    return isAuthenticated && currentCreator !== null;
  }, [isAuthenticated, currentCreator]);

  // Update my profile
  const updateMyProfile = useCallback(
    async (updates: UpdateCreatorProfileForm): Promise<void> => {
      if (!currentCreator) {
        throw new Error("Not authenticated");
      }

      // Validate rights dates if both are provided
      if (updates.validFrom && updates.validThrough) {
        if (!validateRightsDates(updates.validFrom, updates.validThrough)) {
          throw new Error("Valid From date must be before Valid Through date");
        }
      }

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      const updatedCreator: Creator = {
        ...currentCreator,
        ...updates,
        validFrom: updates.validFrom || currentCreator.validFrom,
        validThrough: updates.validThrough || currentCreator.validThrough,
        rightsStatus: calculateRightsStatus(
          updates.validThrough || currentCreator.validThrough
        ),
        riskLevel: calculateCreatorRiskLevel(
          updates.validThrough || currentCreator.validThrough
        ),
        profileCompletion: calculateProfileCompletion({
          ...currentCreator,
          ...updates,
        }),
        updatedAt: new Date(),
      };

      setCurrentCreator(updatedCreator);
      toast.success("Profile updated successfully");
      
      // INTEGRATION POINT: Update profile
      // await api.creators.updateMyProfile(updates);
    },
    [currentCreator]
  );

  // Upload reference material
  const uploadMyReference = useCallback(
    async (
      file: File,
      type: CreatorReferenceMaterial["type"]
    ): Promise<CreatorReferenceMaterial> => {
      if (!currentCreator) {
        throw new Error("Not authenticated");
      }

      // Simulate upload delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const newReference: CreatorReferenceMaterial = {
        id: `ref-${Date.now()}`,
        type,
        name: file.name,
        url: URL.createObjectURL(file), // In real app, this would be uploaded to server
        fileName: file.name,
        fileSize: file.size,
        uploadedAt: new Date(),
        uploadedBy: currentCreator.id,
      };

      const updatedCreator: Creator = {
        ...currentCreator,
        referenceMaterials: [...currentCreator.referenceMaterials, newReference],
        profileCompletion: calculateProfileCompletion({
          ...currentCreator,
          referenceMaterials: [...currentCreator.referenceMaterials, newReference],
        }),
        updatedAt: new Date(),
      };

      setCurrentCreator(updatedCreator);
      toast.success("Reference material uploaded");
      
      // INTEGRATION POINT: Upload reference
      // const response = await api.creators.uploadMyReference(file, type);
      // return response.reference;

      return newReference;
    },
    [currentCreator]
  );

  // Upload rights agreement
  const uploadMyRightsAgreement = useCallback(
    async (file: File): Promise<void> => {
      if (!currentCreator) {
        throw new Error("Not authenticated");
      }

      // Validate file type (PDF only)
      if (file.type !== "application/pdf" && !file.name.endsWith(".pdf")) {
        throw new Error("Rights agreement must be a PDF file");
      }

      // Simulate upload delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const updatedCreator: Creator = {
        ...currentCreator,
        rightsAgreementUrl: URL.createObjectURL(file), // In real app, uploaded to server
        rightsAgreementFileName: file.name,
        profileCompletion: calculateProfileCompletion({
          ...currentCreator,
          rightsAgreementUrl: URL.createObjectURL(file),
          rightsAgreementFileName: file.name,
        }),
        updatedAt: new Date(),
      };

      setCurrentCreator(updatedCreator);
      toast.success("Rights agreement uploaded");
      
      // INTEGRATION POINT: Upload rights agreement
      // await api.creators.uploadMyRightsAgreement(file);
    },
    [currentCreator]
  );

  // Get profile completion status
  const getProfileCompletionStatus = useCallback((): number => {
    if (!currentCreator) return 0;
    return currentCreator.profileCompletion;
  }, [currentCreator]);

  // Get my linked assets (read-only)
  const getMyLinkedAssets = useCallback((): string[] => {
    // In real app, this would fetch from API
    // For MVP, return empty array
    return [];
  }, []);

  // Get my linked projects (read-only)
  const getMyLinkedProjects = useCallback((): string[] => {
    // In real app, this would fetch from API
    // For MVP, return empty array
    return [];
  }, []);

  // Get my credits (read-only)
  const getMyCredits = useCallback((): CreatorCredit[] => {
    // In real app, this would fetch from API
    // For MVP, return empty array
    return [];
  }, []);

  // Extend rights (renew expiration date)
  const extendRights = useCallback(async (newValidThrough: Date): Promise<void> => {
    if (!currentCreator) {
      throw new Error("Not authenticated");
    }

    // Validate new date is in the future
    if (newValidThrough <= new Date()) {
      throw new Error("New expiration date must be in the future");
    }

    // Validate new date is after current expiration
    if (newValidThrough <= currentCreator.validThrough) {
      throw new Error("New expiration date must be after current expiration date");
    }

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    const updatedCreator: Creator = {
      ...currentCreator,
      validThrough: newValidThrough,
      rightsStatus: calculateRightsStatus(newValidThrough),
      riskLevel: calculateCreatorRiskLevel(newValidThrough),
      updatedAt: new Date(),
    };

    setCurrentCreator(updatedCreator);
    toast.success("Rights extended successfully");
    
    // INTEGRATION POINT: Extend rights
    // await api.creators.extendRights(newValidThrough);
  }, [currentCreator]);

  // Request password reset
  const requestPasswordReset = useCallback(async (email: string): Promise<void> => {
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error("Invalid email format");
    }

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // INTEGRATION POINT: Request password reset
    // await api.creators.forgotPassword(email);
    
    // In real app, this would send an email
    // For MVP, we'll just show success
    toast.success("Password reset email sent! Check your inbox.");
  }, []);

  // Reset password with token
  const resetPassword = useCallback(async (token: string, newPassword: string): Promise<void> => {
    if (!token) {
      throw new Error("Reset token is required");
    }

    if (newPassword.length < 8) {
      throw new Error("Password must be at least 8 characters");
    }

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // INTEGRATION POINT: Reset password
    // await api.creators.resetPassword(token, newPassword);
    
    toast.success("Password reset successfully!");
  }, []);

  const value: CreatorAccountContextType = {
    currentCreator,
    isAuthenticated,
    registerCreator,
    login,
    logout,
    isCreatorAccount,
    updateMyProfile,
    uploadMyReference,
    uploadMyRightsAgreement,
    getProfileCompletionStatus,
    getMyLinkedAssets,
    getMyLinkedProjects,
    getMyCredits,
    extendRights,
    requestPasswordReset,
    resetPassword,
  };

  return (
    <CreatorAccountContext.Provider value={value}>
      {children}
    </CreatorAccountContext.Provider>
  );
}

export function useCreatorAccount() {
  const context = useContext(CreatorAccountContext);
  if (!context) {
    throw new Error("useCreatorAccount must be used within CreatorAccountProvider");
  }
  return context;
}

