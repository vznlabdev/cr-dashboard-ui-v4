/**
 * Mock Creators Data
 * 
 * Sample data for development and testing.
 * Will be replaced by API calls in production.
 */

import type { Creator, CreatorInvitation } from "@/types/creators";
import { generateCreatorRightsID, calculateRightsStatus, calculateCreatorRiskLevel } from "@/lib/creator-utils";

// ==============================================
// Mock Creators
// ==============================================

const now = new Date();
const oneMonthFromNow = new Date(now);
oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1);

const twoMonthsFromNow = new Date(now);
twoMonthsFromNow.setMonth(twoMonthsFromNow.getMonth() + 2);

const threeMonthsAgo = new Date(now);
threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

const oneWeekFromNow = new Date(now);
oneWeekFromNow.setDate(oneWeekFromNow.getDate() + 7);

export const mockCreators: Creator[] = [
  {
    id: "creator-1",
    email: "sarah.voice@example.com",
    fullName: "Sarah Johnson",
    creatorRightsId: generateCreatorRightsID(2024),
    creatorType: "Real Person",
    avatarUrl: "https://i.pravatar.cc/150?u=sarah.voice",
    validFrom: threeMonthsAgo,
    validThrough: twoMonthsFromNow,
    rightsStatus: calculateRightsStatus(twoMonthsFromNow),
    riskLevel: calculateCreatorRiskLevel(twoMonthsFromNow),
    rightsAgreementUrl: "/documents/rights-agreement-sarah.pdf",
    rightsAgreementFileName: "rights-agreement-sarah.pdf",
    referenceMaterials: [
      {
        id: "ref-1",
        type: "voice_sample",
        name: "Sarah Voice Sample 1",
        url: "/audio/sarah-voice-1.mp3",
        fileName: "sarah-voice-1.mp3",
        fileSize: 2048000,
        uploadedAt: threeMonthsAgo,
        uploadedBy: "creator-1",
      },
    ],
    registrationSource: "invited",
    invitationId: "inv-1",
    linkedAssetsCount: 5,
    linkedProjectsCount: 2,
    profileCompletion: 87,
    lastVerified: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    createdAt: threeMonthsAgo,
    updatedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    notes: "Professional voice actor specializing in commercial work.",
    contactInformation: "sarah.voice@example.com",
  },
  {
    id: "creator-2",
    email: "mascot@brandco.com",
    fullName: "Brandy the Bear",
    creatorRightsId: generateCreatorRightsID(2024),
    creatorType: "Brand Mascot",
    avatarUrl: "https://i.pravatar.cc/150?u=brandy.bear",
    validFrom: new Date(now.getTime() - 6 * 30 * 24 * 60 * 60 * 1000), // 6 months ago
    validThrough: oneWeekFromNow,
    rightsStatus: calculateRightsStatus(oneWeekFromNow),
    riskLevel: calculateCreatorRiskLevel(oneWeekFromNow),
    rightsAgreementUrl: "/documents/rights-agreement-brandy.pdf",
    rightsAgreementFileName: "rights-agreement-brandy.pdf",
    referenceMaterials: [
      {
        id: "ref-2",
        type: "photo",
        name: "Brandy Character Sheet",
        url: "/images/brandy-character-sheet.pdf",
        fileName: "brandy-character-sheet.pdf",
        fileSize: 1536000,
        uploadedAt: new Date(now.getTime() - 5 * 30 * 24 * 60 * 60 * 1000),
        uploadedBy: "creator-2",
      },
      {
        id: "ref-3",
        type: "guideline",
        name: "Brandy Usage Guidelines",
        url: "/documents/brandy-guidelines.pdf",
        fileName: "brandy-guidelines.pdf",
        fileSize: 1024000,
        uploadedAt: new Date(now.getTime() - 5 * 30 * 24 * 60 * 60 * 1000),
        uploadedBy: "creator-2",
      },
    ],
    registrationSource: "invited",
    invitationId: "inv-2",
    linkedAssetsCount: 12,
    linkedProjectsCount: 3,
    profileCompletion: 100,
    lastVerified: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
    createdAt: new Date(now.getTime() - 6 * 30 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    notes: "Official brand mascot for BrandCo. Must follow brand guidelines.",
  },
  {
    id: "creator-3",
    email: "alex.character@example.com",
    fullName: "Alex the Adventurer",
    creatorRightsId: generateCreatorRightsID(2024),
    creatorType: "Character",
    avatarUrl: "https://i.pravatar.cc/150?u=alex.adventurer",
    validFrom: new Date(now.getTime() - 2 * 30 * 24 * 60 * 60 * 1000), // 2 months ago
    validThrough: threeMonthsAgo, // Expired
    rightsStatus: calculateRightsStatus(threeMonthsAgo),
    riskLevel: calculateCreatorRiskLevel(threeMonthsAgo),
    referenceMaterials: [],
    registrationSource: "self_registered",
    linkedAssetsCount: 3,
    linkedProjectsCount: 1,
    profileCompletion: 62,
    createdAt: new Date(now.getTime() - 2 * 30 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    notes: "Animated character for children's content.",
  },
  {
    id: "creator-4",
    email: "michael.actor@example.com",
    fullName: "Michael Chen",
    creatorRightsId: generateCreatorRightsID(2024),
    creatorType: "Real Person",
    avatarUrl: "https://i.pravatar.cc/150?u=michael.actor",
    validFrom: new Date(now.getTime() - 1 * 30 * 24 * 60 * 60 * 1000), // 1 month ago
    validThrough: oneMonthFromNow,
    rightsStatus: calculateRightsStatus(oneMonthFromNow),
    riskLevel: calculateCreatorRiskLevel(oneMonthFromNow),
    rightsAgreementUrl: "/documents/rights-agreement-michael.pdf",
    rightsAgreementFileName: "rights-agreement-michael.pdf",
    referenceMaterials: [
      {
        id: "ref-4",
        type: "photo",
        name: "Michael Headshots",
        url: "/images/michael-headshots.zip",
        fileName: "michael-headshots.zip",
        fileSize: 5120000,
        uploadedAt: new Date(now.getTime() - 1 * 30 * 24 * 60 * 60 * 1000),
        uploadedBy: "creator-4",
      },
    ],
    registrationSource: "self_registered",
    linkedAssetsCount: 8,
    linkedProjectsCount: 2,
    profileCompletion: 75,
    lastVerified: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    createdAt: new Date(now.getTime() - 1 * 30 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    contactInformation: "michael.actor@example.com",
  },
  {
    id: "creator-5",
    email: "emma.mascot@example.com",
    fullName: "Emma the Elephant",
    creatorRightsId: generateCreatorRightsID(2024),
    creatorType: "Brand Mascot",
    avatarUrl: "https://i.pravatar.cc/150?u=emma.elephant",
    validFrom: new Date(now.getTime() - 4 * 30 * 24 * 60 * 60 * 1000), // 4 months ago
    validThrough: new Date(now.getTime() + 20 * 24 * 60 * 60 * 1000), // 20 days from now
    rightsStatus: calculateRightsStatus(new Date(now.getTime() + 20 * 24 * 60 * 60 * 1000)),
    riskLevel: calculateCreatorRiskLevel(new Date(now.getTime() + 20 * 24 * 60 * 60 * 1000)),
    rightsAgreementUrl: "/documents/rights-agreement-emma.pdf",
    rightsAgreementFileName: "rights-agreement-emma.pdf",
    referenceMaterials: [
      {
        id: "ref-5",
        type: "guideline",
        name: "Emma Style Guide",
        url: "/documents/emma-style-guide.pdf",
        fileName: "emma-style-guide.pdf",
        fileSize: 3072000,
        uploadedAt: new Date(now.getTime() - 4 * 30 * 24 * 60 * 60 * 1000),
        uploadedBy: "creator-5",
      },
    ],
    registrationSource: "invited",
    invitationId: "inv-3",
    linkedAssetsCount: 15,
    linkedProjectsCount: 4,
    profileCompletion: 100,
    lastVerified: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    createdAt: new Date(now.getTime() - 4 * 30 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    notes: "Friendly elephant mascot for children's brand.",
  },
];

// ==============================================
// Mock Invitations
// ==============================================

const sevenDaysFromNow = new Date(now);
sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

const threeDaysAgo = new Date(now);
threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

export const mockInvitations: CreatorInvitation[] = [
  {
    id: "inv-4",
    email: "new.creator@example.com",
    name: "New Creator",
    token: "inv-token-abc123xyz",
    status: "pending",
    expiresAt: sevenDaysFromNow,
    createdAt: threeDaysAgo,
    invitedBy: "admin-1",
  },
  {
    id: "inv-5",
    email: "another@example.com",
    name: "Another Creator",
    token: "inv-token-def456uvw",
    status: "pending",
    expiresAt: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
    createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    invitedBy: "admin-1",
  },
];

