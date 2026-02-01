/**
 * Talent Rights (NILP™) Type Definitions
 * 
 * Types for managing talent rights - people, characters, and mascots
 * whose NILP™ (Name/Image/Likeness/Persona™) is used in creative assets.
 */

// ==============================================
// Core Talent Rights Types
// ==============================================

export type TalentType = "Real Person" | "Character" | "Brand Mascot";

export type RightsStatus = "Authorized" | "Expiring Soon" | "Expired";

export type TalentInvitationStatus = "pending" | "accepted" | "expired";

export type TalentRegistrationSource = "invited" | "self_registered";

// ==============================================
// NILP™ (Name/Image/Likeness/Persona™) Categories
// ==============================================

/**
 * NILP™ Categories for organizing talent rights data
 * NILP™ is a trademark of the organization
 */
export interface NILPCategories {
  name: NameRights;
  image: ImageRights;
  likeness: LikenessRights;
  persona: PersonaTraits;
}

/**
 * Name Rights - Legal and professional name information
 * To be expanded with specific fields based on requirements
 */
export interface NameRights {
  legalName?: string;
  stageName?: string;
  professionalName?: string;
  trademarkStatus?: string;
  usageRestrictions?: string;
  approvalRequired?: boolean;
  notes?: string;
}

/**
 * Image Rights - Visual representation rights
 * To be expanded with specific fields based on requirements
 */
export interface ImageRights {
  approvedImages?: string[]; // URLs to approved images
  imageUsageGuidelines?: string;
  exclusivityRestrictions?: string;
  geographicLimitations?: string;
  timePeriodRestrictions?: string;
  notes?: string;
}

/**
 * Likeness Rights - Physical and audio characteristics
 * To be expanded with specific fields based on requirements
 */
export interface LikenessRights {
  voiceCharacteristics?: string;
  physicalMannerisms?: string;
  signatureTraits?: string;
  impersonationGuidelines?: string;
  digitalLikenessRights?: boolean;
  notes?: string;
}

/**
 * Persona Traits - Personality and brand attributes
 * To be expanded with specific fields based on requirements
 */
export interface PersonaTraits {
  personalityAttributes?: string[];
  brandAssociations?: string[];
  characterTraits?: string[];
  valuesBeliefs?: string;
  behavioralGuidelines?: string;
  notes?: string;
}

// ==============================================
// Talent Rights Interface
// ==============================================

export interface TalentRights {
  id: string;
  email: string;
  fullName: string;
  talentRightsId: string; // Format: TR-YYYY-#####
  talentType: TalentType;
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
  referenceMaterials: TalentReferenceMaterial[];
  
  // NILP™ Categories
  nilpCategories?: NILPCategories;
  
  // Registration info
  registrationSource: TalentRegistrationSource;
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
  
  // Backward compatibility properties (deprecated)
  /** @deprecated Use talentRightsId instead */
  creatorRightsId?: string;
  /** @deprecated Use talentType instead */
  creatorType?: TalentType;
}

// ==============================================
// Reference Materials
// ==============================================

export interface TalentReferenceMaterial {
  id: string;
  type: "photo" | "voice_sample" | "guideline" | "other";
  name: string;
  url: string;
  fileName: string;
  fileSize: number;
  uploadedAt: Date;
  uploadedBy: string; // Talent ID
}

// ==============================================
// Invitation Types
// ==============================================

export interface TalentInvitation {
  id: string;
  email: string;
  name: string;
  token: string; // Cryptographically secure token
  status: TalentInvitationStatus;
  expiresAt: Date;
  createdAt: Date;
  acceptedAt?: Date;
  invitedBy: string; // Admin user ID
  talentId?: string; // Set when invitation is accepted
  
  // Backward compatibility property (deprecated)
  /** @deprecated Use talentId instead */
  creatorId?: string;
}

// ==============================================
// Credit/Attribution Types
// ==============================================

export interface TalentCredit {
  id: string;
  talentId: string;
  assetId?: string; // If crediting to asset
  projectId?: string; // If crediting to project
  role?: string; // Optional: "Voice Actor", "Character Model", etc.
  creditedAt: Date;
  creditedBy: string; // Admin user ID
  
  // Backward compatibility property (deprecated)
  /** @deprecated Use talentId instead */
  creatorId?: string;
}

// ==============================================
// Talent Account (for authentication)
// ==============================================

export interface TalentAccount {
  id: string;
  talentId: string;
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

export interface InviteTalentForm {
  email: string;
  name: string;
  talentType?: TalentType; // Optional pre-fill
}

export interface RegisterTalentForm {
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  talentType: TalentType;
  acceptTerms: boolean;
}

export interface UpdateTalentProfileForm {
  fullName?: string;
  talentType?: TalentType;
  validFrom?: Date;
  validThrough?: Date;
  notes?: string;
  contactInformation?: string;
}

// ==============================================
// API Response Types
// ==============================================

export interface TalentRightsResponse {
  talentRights: TalentRights[];
}

export interface TalentRightsItemResponse {
  talentRights: TalentRights;
}

export interface TalentInvitationsResponse {
  invitations: TalentInvitation[];
}

export interface TalentCreditsResponse {
  credits: TalentCredit[];
}

export interface TalentProfileCompletionResponse {
  completion: number; // 0-100
  missingFields: string[];
}

// ==============================================
// Backward Compatibility Exports (Deprecated)
// ==============================================

/**
 * @deprecated Use TalentRights instead
 */
export type Creator = TalentRights;

/**
 * @deprecated Use TalentType instead
 */
export type CreatorType = TalentType;

/**
 * @deprecated Use TalentInvitation instead
 */
export type CreatorInvitation = TalentInvitation;

/**
 * @deprecated Use TalentCredit instead
 */
export type CreatorCredit = TalentCredit;

/**
 * @deprecated Use TalentInvitationStatus instead
 */
export type CreatorInvitationStatus = TalentInvitationStatus;

/**
 * @deprecated Use TalentRegistrationSource instead
 */
export type CreatorRegistrationSource = TalentRegistrationSource;

/**
 * @deprecated Use TalentReferenceMaterial instead
 */
export type CreatorReferenceMaterial = TalentReferenceMaterial;

/**
 * @deprecated Use TalentAccount instead
 */
export type CreatorAccount = TalentAccount;

/**
 * @deprecated Use InviteTalentForm instead
 */
export type InviteCreatorForm = InviteTalentForm;

/**
 * @deprecated Use RegisterTalentForm instead
 */
export type RegisterCreatorForm = RegisterTalentForm;

/**
 * @deprecated Use UpdateTalentProfileForm instead
 */
export type UpdateCreatorProfileForm = UpdateTalentProfileForm;

/**
 * @deprecated Use TalentRightsResponse instead
 */
export type CreatorsResponse = TalentRightsResponse;

/**
 * @deprecated Use TalentRightsItemResponse instead
 */
export type CreatorResponse = TalentRightsItemResponse;

/**
 * @deprecated Use TalentInvitationsResponse instead
 */
export type CreatorInvitationsResponse = TalentInvitationsResponse;

/**
 * @deprecated Use TalentCreditsResponse instead
 */
export type CreatorCreditsResponse = TalentCreditsResponse;

/**
 * @deprecated Use TalentProfileCompletionResponse instead
 */
export type CreatorProfileCompletionResponse = TalentProfileCompletionResponse;
