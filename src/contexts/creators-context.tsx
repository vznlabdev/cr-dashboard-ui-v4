/**
 * @deprecated This file is deprecated. Use @/contexts/talent-rights-context instead.
 * 
 * This file remains for backward compatibility only.
 * All creator context has been migrated to talent rights context.
 */

"use client"

// Re-export everything from talent-rights-context for backward compatibility
export {
  TalentRightsProvider as CreatorsProvider,
  useTalentRights as useCreators,
  useCreators as default,
} from './talent-rights-context';
