/**
 * Creators (Creator Rights) Type Definitions
 * 
 * Types for managing creators - people, characters, and mascots
 * whose likeness/identity is used in creative assets.
 */

// ==============================================
// Core Creator Types
// ==============================================

export type CreatorType = "Real Person" | "Character" | "Brand Mascot";

export type RightsStatus = "Authorized" | "Expiring Soon" | "Expired";

export type CreatorInvitationStatus = "pending" | "accepted" | "expired";

export type CreatorRegistrationSource = "invited" | "self_registered";

// ==============================================
// Creator Interface
// ==============================================

export interface Creator {
  id: string;
  email: string;
  fullName: string;
  creatorRightsId: string; // Format: CR-YYYY-#####
  creatorType: CreatorType;
  rightsStatus: RightsStatus;
  validFrom: Date;
  validThrough: Date;
  riskLevel: "Low" | "Medium" | "High";
  
  // Profile
  avatarUrl?: string; // Profile photo URL
  
  // Rights documentation
  rightsAgreementUrl?: string; // PDF document URL
  rightsAgreementFileName?: string;
  
  // Reference materials
  referenceMaterials: CreatorReferenceMaterial[];
  
  // Registration info
  registrationSource: CreatorRegistrationSource;
  invitationId?: string; // If registered via invitation
  
  // Metadata
  linkedAssetsCount: number;
  linkedProjectsCount: number;
  profileCompletion: number; // 0-100
  lastVerified?: Date;
  createdAt: Date;
  updatedAt: Date;
  
  // Optional fields
  notes?: string;
  contactInformation?: string;
}

// ==============================================
// Reference Materials
// ==============================================

export interface CreatorReferenceMaterial {
  id: string;
  type: "photo" | "voice_sample" | "guideline" | "other";
  name: string;
  url: string;
  fileName: string;
  fileSize: number;
  uploadedAt: Date;
  uploadedBy: string; // Creator ID
}

// ==============================================
// Invitation Types
// ==============================================

export interface CreatorInvitation {
  id: string;
  email: string;
  name: string;
  token: string; // Cryptographically secure token
  status: CreatorInvitationStatus;
  expiresAt: Date;
  createdAt: Date;
  acceptedAt?: Date;
  invitedBy: string; // Admin user ID
  creatorId?: string; // Set when invitation is accepted
}

// ==============================================
// Credit/Attribution Types
// ==============================================

export interface CreatorCredit {
  id: string;
  creatorId: string;
  assetId?: string; // If crediting to asset
  projectId?: string; // If crediting to project
  role?: string; // Optional: "Voice Actor", "Character Model", etc.
  creditedAt: Date;
  creditedBy: string; // Admin user ID
}

// ==============================================
// Creator Account (for authentication)
// ==============================================

export interface CreatorAccount {
  id: string;
  creatorId: string;
  email: string;
  passwordHash: string; // Server-side only
  isActive: boolean;
  isEmailVerified: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
}

// ==============================================
// Form Types
// ==============================================

export interface InviteCreatorForm {
  email: string;
  name: string;
  creatorType?: CreatorType; // Optional pre-fill
}

export interface RegisterCreatorForm {
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  creatorType: CreatorType;
  acceptTerms: boolean;
}

export interface UpdateCreatorProfileForm {
  fullName?: string;
  creatorType?: CreatorType;
  validFrom?: Date;
  validThrough?: Date;
  notes?: string;
  contactInformation?: string;
}

// ==============================================
// API Response Types
// ==============================================

export interface CreatorsResponse {
  creators: Creator[];
}

export interface CreatorResponse {
  creator: Creator;
}

export interface CreatorInvitationsResponse {
  invitations: CreatorInvitation[];
}

export interface CreatorCreditsResponse {
  credits: CreatorCredit[];
}

export interface CreatorProfileCompletionResponse {
  completion: number; // 0-100
  missingFields: string[];
}

