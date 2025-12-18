/**
 * Creator Utility Functions
 * 
 * Helper functions for creator management, rights calculation, and formatting.
 */

import type { Creator, RightsStatus, CreatorInvitation } from "@/types/creators";

// ==============================================
// Creator Rights ID Generation
// ==============================================

/**
 * Generate a Creator Rights ID in format: CR-YYYY-#####
 * Example: CR-2024-00123
 */
export function generateCreatorRightsID(year?: number): string {
  const currentYear = year || new Date().getFullYear();
  // In a real implementation, this would query the database for the last number
  // For MVP, we'll use a timestamp-based approach
  const timestamp = Date.now();
  const sequence = (timestamp % 100000).toString().padStart(5, "0");
  return `CR-${currentYear}-${sequence}`;
}

// ==============================================
// Rights Status Calculation
// ==============================================

const DEFAULT_EXPIRATION_THRESHOLD_DAYS = 30;

/**
 * Calculate rights status from expiration date
 */
export function calculateRightsStatus(
  validThrough: Date,
  thresholdDays: number = DEFAULT_EXPIRATION_THRESHOLD_DAYS
): RightsStatus {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const expirationDate = new Date(validThrough);
  expirationDate.setHours(0, 0, 0, 0);
  
  const daysUntilExpiration = Math.ceil(
    (expirationDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );
  
  if (daysUntilExpiration < 0) {
    return "Expired";
  } else if (daysUntilExpiration <= thresholdDays) {
    return "Expiring Soon";
  } else {
    return "Authorized";
  }
}

/**
 * Calculate risk level from rights expiration
 */
export function calculateCreatorRiskLevel(validThrough: Date): "Low" | "Medium" | "High" {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const expirationDate = new Date(validThrough);
  expirationDate.setHours(0, 0, 0, 0);
  
  const daysUntilExpiration = Math.ceil(
    (expirationDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );
  
  if (daysUntilExpiration < 0) {
    return "High"; // Expired
  } else if (daysUntilExpiration <= 60) {
    return "Medium"; // Expiring within 60 days
  } else {
    return "Low"; // Valid for more than 60 days
  }
}

// ==============================================
// Formatting Functions
// ==============================================

/**
 * Format expiration date for display
 */
export function formatCreatorExpiration(validThrough: Date): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const expirationDate = new Date(validThrough);
  expirationDate.setHours(0, 0, 0, 0);
  
  const daysUntilExpiration = Math.ceil(
    (expirationDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );
  
  if (daysUntilExpiration < 0) {
    return `Expired ${Math.abs(daysUntilExpiration)} day${Math.abs(daysUntilExpiration) !== 1 ? "s" : ""} ago`;
  } else if (daysUntilExpiration === 0) {
    return "Expires today";
  } else if (daysUntilExpiration === 1) {
    return "Expires tomorrow";
  } else if (daysUntilExpiration <= 30) {
    return `Expires in ${daysUntilExpiration} days`;
  } else {
    return expirationDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }
}

/**
 * Get color class for rights status badge
 */
export function getRightsStatusColor(status: RightsStatus): string {
  switch (status) {
    case "Authorized":
      return "text-green-500";
    case "Expiring Soon":
      return "text-amber-500";
    case "Expired":
      return "text-red-500";
    default:
      return "text-muted-foreground";
  }
}

/**
 * Get badge variant for rights status
 */
export function getRightsStatusVariant(status: RightsStatus): "default" | "secondary" | "destructive" {
  switch (status) {
    case "Authorized":
      return "default";
    case "Expiring Soon":
      return "secondary";
    case "Expired":
      return "destructive";
    default:
      return "secondary";
  }
}

// ==============================================
// Profile Completion Calculation
// ==============================================

/**
 * Calculate profile completion percentage
 */
export function calculateProfileCompletion(creator: Creator): number {
  let completedFields = 0;
  const totalFields = 8; // Total number of required/important fields
  
  // Required fields
  if (creator.fullName) completedFields++;
  if (creator.creatorType) completedFields++;
  if (creator.validFrom) completedFields++;
  if (creator.validThrough) completedFields++;
  
  // Important optional fields
  if (creator.rightsAgreementUrl) completedFields++;
  if (creator.referenceMaterials.length > 0) completedFields++;
  if (creator.notes) completedFields++;
  if (creator.contactInformation) completedFields++;
  
  return Math.round((completedFields / totalFields) * 100);
}

// ==============================================
// Invitation Helpers
// ==============================================

/**
 * Check if invitation is expired
 */
export function isInvitationExpired(invitation: CreatorInvitation): boolean {
  return new Date() > new Date(invitation.expiresAt);
}

/**
 * Get days until invitation expires
 */
export function getDaysUntilInvitationExpires(invitation: CreatorInvitation): number {
  const today = new Date();
  const expirationDate = new Date(invitation.expiresAt);
  const diffTime = expirationDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}

// ==============================================
// Validation Helpers
// ==============================================

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate that Valid From is before Valid Through
 */
export function validateRightsDates(validFrom: Date, validThrough: Date): boolean {
  return new Date(validFrom) < new Date(validThrough);
}

