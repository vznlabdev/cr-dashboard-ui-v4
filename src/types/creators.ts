/**
 * @deprecated This file is deprecated. Use @/types/talent-rights instead.
 * 
 * This file remains for backward compatibility only.
 * All creator types have been migrated to talent rights.
 */

// Re-export all types from talent-rights for backward compatibility
export type {
  TalentType as CreatorType,
  RightsStatus,
  TalentInvitationStatus as CreatorInvitationStatus,
  TalentRegistrationSource as CreatorRegistrationSource,
  TalentRights as Creator,
  TalentReferenceMaterial as CreatorReferenceMaterial,
  TalentInvitation as CreatorInvitation,
  TalentCredit as CreatorCredit,
  TalentAccount as CreatorAccount,
  InviteTalentForm as InviteCreatorForm,
  RegisterTalentForm as RegisterCreatorForm,
  UpdateTalentProfileForm as UpdateCreatorProfileForm,
  TalentRightsResponse as CreatorsResponse,
  TalentRightsItemResponse as CreatorResponse,
  TalentInvitationsResponse as CreatorInvitationsResponse,
  TalentCreditsResponse as CreatorCreditsResponse,
  TalentProfileCompletionResponse as CreatorProfileCompletionResponse,
} from './talent-rights';

