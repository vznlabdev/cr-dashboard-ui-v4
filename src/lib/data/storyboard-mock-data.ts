/**
 * Mock storyboard data for Creation Rights Storyboard module.
 * Frontend-only; replace with API calls later.
 */

import type {
  Storyboard,
  StoryboardFrame,
  StoryboardAct,
  StoryboardCollaborator,
} from "@/types/storyboard";

const now = new Date().toISOString();
const createdBy = "Sarah Chen";

// --- Helpers for consistent frame metadata ---
function baseFrame(
  id: string,
  storyboardId: string,
  order: number,
  visualDescription: string,
  durationSeconds: number,
  overrides: Partial<StoryboardFrame> = {}
): StoryboardFrame {
  return {
    id,
    storyboardId,
    order,
    frameType: "scene",
    visualDescription,
    durationSeconds,
    linkedAssetIds: [],
    commentCount: 0,
    approvalStatus: "draft",
    createdAt: now,
    updatedAt: now,
    createdBy,
    version: 1,
    ...overrides,
  };
}

// --- Storyboard 1: Nike Spring Campaign — 30s Spot ---
const nikeFrames: StoryboardFrame[] = [
  baseFrame("nike-f1", "sb-nike", 0, "Alarm clock on bedside table, early morning light through window.", 3, {
    frameType: "scene",
    shotType: "wide",
    cameraMovement: "static",
    voiceoverText: "Every morning is a chance to outrun yesterday.",
    speaker: "VO",
    musicNotes: "Ambient morning sounds, soft",
    transitionIn: "fade",
    linkedAssetIds: ["asset-1"],
    generationStatus: "generated",
    approvalStatus: "approved",
    approvedBy: "David Kim",
    approvedAt: now,
  }),
  baseFrame("nike-f2", "sb-nike", 1, "Athlete stretching in bedroom, silhouette against window.", 4, {
    shotType: "medium",
    cameraMovement: "pan_right",
    musicNotes: "Ambient morning sounds → building beat",
    linkedAssetIds: ["asset-2"],
    generationStatus: "generated",
    approvalStatus: "approved",
  }),
  baseFrame("nike-f3", "sb-nike", 2, "Close-up of hands lacing running shoes.", 3, {
    shotType: "close_up",
    cameraMovement: "static",
    linkedTaskId: "task-1",
    linkedWorkflowId: "wf-social-images",
    linkedAssetIds: ["asset-3"],
    generationStatus: "generated",
    approvalStatus: "approved",
    aiPromptSuggestion: "Extreme close-up of hands tying neon running shoe laces, morning light, shallow depth of field.",
  }),
  baseFrame("nike-f4", "sb-nike", 3, "Wide shot: athlete running down empty city street at dawn.", 5, {
    shotType: "wide",
    cameraMovement: "tracking",
    musicNotes: "Building beat",
    linkedAssetIds: ["asset-4", "asset-5"],
    generationStatus: "generated",
    approvalStatus: "pending_review",
  }),
  baseFrame("nike-f5", "sb-nike", 4, "Medium: runner jumping over obstacle, motion blur.", 3, {
    shotType: "medium",
    cameraMovement: "tracking",
    soundEffects: "Footsteps, breath",
    linkedAssetIds: ["asset-6"],
    generationStatus: "generated",
    approvalStatus: "approved",
  }),
  baseFrame("nike-f6", "sb-nike", 5, "Low angle: runner pushing through final stretch.", 4, {
    shotType: "close_up",
    cameraMovement: "dolly_in",
    musicNotes: "Building beat → triumphant",
    generationStatus: "in_progress",
    approvalStatus: "pending_review",
    aiPromptSuggestion: "Low angle shot of athlete's legs and shoes in motion, golden hour, sweat, determination.",
  }),
  baseFrame("nike-f7", "sb-nike", 6, "Runner crossing finish line, arms raised.", 3, {
    shotType: "wide",
    cameraMovement: "static",
    generationStatus: "not_started",
    approvalStatus: "draft",
    aiPromptSuggestion: "Wide shot of athlete crossing finish line, arms raised, crowd blur in background.",
  }),
  baseFrame("nike-f8", "sb-nike", 7, "Product shot: Nike shoe on podium, hero lighting.", 4, {
    shotType: "close_up",
    cameraMovement: "static",
    transitionIn: "dissolve",
    generationStatus: "not_started",
    approvalStatus: "draft",
    aiPromptSuggestion: "Hero product shot of Nike running shoe, studio lighting, clean background.",
  }),
  baseFrame("nike-f9", "sb-nike", 8, "Logo and tagline on black.", 2, {
    frameType: "title_card",
    shotType: "static",
    cameraMovement: "none",
    backgroundColor: "#000000",
    transitionIn: "fade",
    generationStatus: "not_started",
    approvalStatus: "draft",
  }),
  baseFrame("nike-f10", "sb-nike", 9, "Just Do It. — end card.", 1, {
    frameType: "title_card",
    shotType: "static",
    backgroundColor: "#000000",
    generationStatus: "not_started",
    approvalStatus: "draft",
  }),
];

const nikeActs: StoryboardAct[] = [
  { id: "nike-act1", name: "The Wake Up", description: "Morning routine", order: 0, frameIds: ["nike-f1", "nike-f2", "nike-f3"], color: "#3b82f6" },
  { id: "nike-act2", name: "The Run", description: "Training sequence", order: 1, frameIds: ["nike-f4", "nike-f5", "nike-f6", "nike-f7"], color: "#10b981" },
  { id: "nike-act3", name: "The Payoff", description: "Finish and product", order: 2, frameIds: ["nike-f8", "nike-f9", "nike-f10"], color: "#f59e0b" },
];

const nikeCollaborators: StoryboardCollaborator[] = [
  { userId: "u1", name: "Sarah Chen", role: "owner", addedAt: now },
  { userId: "u2", name: "David Kim", role: "editor", addedAt: now },
  { userId: "u3", name: "Emily Ross", role: "reviewer", addedAt: now },
];

// --- Storyboard 2: Samsung Product Launch — Social Short ---
const samsungFrames: StoryboardFrame[] = [
  baseFrame("samsung-f1", "sb-samsung", 0, "Hook: Person holding phone, surprised expression.", 2, {
    shotType: "medium",
    frameType: "scene",
    musicNotes: "Trending sound",
  }),
  baseFrame("samsung-f2", "sb-samsung", 1, "Product reveal: New Samsung phone in hand.", 2, {
    shotType: "close_up",
    frameType: "scene",
  }),
  baseFrame("samsung-f3", "sb-samsung", 2, "Feature demo: Screen display, fast scroll.", 3, {
    shotType: "close_up",
    frameType: "scene",
  }),
  baseFrame("samsung-f4", "sb-samsung", 3, "Feature demo: Camera zoom sample.", 3, {
    shotType: "close_up",
    frameType: "scene",
  }),
  baseFrame("samsung-f5", "sb-samsung", 4, "CTA: Swipe up to learn more.", 2, {
    frameType: "title_card",
    shotType: "static",
    backgroundColor: "#1428a0",
  }),
  baseFrame("samsung-f6", "sb-samsung", 5, "Samsung logo lockup.", 1, {
    frameType: "title_card",
    shotType: "static",
    backgroundColor: "#000000",
  }),
];

const samsungActs: StoryboardAct[] = [
  { id: "samsung-act1", name: "Full short", order: 0, frameIds: ["samsung-f1", "samsung-f2", "samsung-f3", "samsung-f4", "samsung-f5", "samsung-f6"] },
];

const samsungCollaborators: StoryboardCollaborator[] = [
  { userId: "u4", name: "Michael Torres", role: "owner", addedAt: now },
  { userId: "u5", name: "Jennifer Walsh", role: "editor", addedAt: now },
];

// --- Storyboard 3: Coca-Cola Holiday — Brand Film ---
const cocaFrames: StoryboardFrame[] = Array.from({ length: 20 }, (_, i) => {
  const id = `coca-f${i + 1}`;
  const sceneDescriptions = [
    "Family gathering around holiday table, warm lighting.",
    "Kids opening gifts, Christmas tree in background.",
    "Pouring Coca-Cola into glasses, condensation.",
    "Snow falling outside window.",
    "Grandmother handing drink to grandchild.",
    "Friends toasting with bottles.",
    "Wide: living room decked with decorations.",
    "Close-up: red ribbon and bottle cap.",
    "Montage: different families, same moment.",
    "Fireplace, stockings, Coke on mantel.",
    "Child's face lighting up.",
    "Couple on couch, sharing a bottle.",
    "Kitchen counter, bottles and snacks.",
    "Snowman outside, family waving.",
    "Night shot: house with lights, window glow.",
    "Table centerpiece with bottles.",
    "Hand reaching for ice-cold bottle.",
    "Group photo, everyone holding Coke.",
    "Final wide: house at dusk, warm windows.",
    "Coca-Cola holiday logo, tagline.",
  ];
  const duration = i < 19 ? (i % 3 === 0 ? 8 : 6) : 5;
  return baseFrame(id, "sb-coca", i, sceneDescriptions[i], duration, {
    shotType: i % 4 === 0 ? "wide" : i % 4 === 1 ? "medium" : "close_up",
    cameraMovement: i % 3 === 0 ? "static" : "pan_right",
    linkedAssetIds: i < 18 ? [`coca-asset-${i + 1}`] : [],
    generationStatus: "generated",
    approvalStatus: "approved",
    approvedBy: "Sarah Chen",
    approvedAt: now,
    voiceoverText: i === 0 ? "The holidays are for sharing." : undefined,
    musicNotes: "Heartwarming holiday score throughout",
  });
});

const cocaActs: StoryboardAct[] = [
  { id: "coca-act1", name: "Act 1: Gathering", order: 0, frameIds: cocaFrames.slice(0, 5).map((f) => f.id), color: "#c41e3a" },
  { id: "coca-act2", name: "Act 2: Sharing", order: 1, frameIds: cocaFrames.slice(5, 10).map((f) => f.id), color: "#228b22" },
  { id: "coca-act3", name: "Act 3: Moments", order: 2, frameIds: cocaFrames.slice(10, 15).map((f) => f.id), color: "#1e90ff" },
  { id: "coca-act4", name: "Act 4: Together", order: 3, frameIds: cocaFrames.slice(15, 20).map((f) => f.id), color: "#ffd700" },
];

const cocaCollaborators: StoryboardCollaborator[] = [
  { userId: "u1", name: "Sarah Chen", role: "owner", addedAt: now },
  { userId: "u2", name: "David Kim", role: "editor", addedAt: now },
  { userId: "u6", name: "Alex Rivera", role: "reviewer", addedAt: now },
];

// --- Total durations ---
const nikeTotal = nikeFrames.reduce((s, f) => s + f.durationSeconds, 0);
const samsungTotal = samsungFrames.reduce((s, f) => s + f.durationSeconds, 0);
const cocaTotal = cocaFrames.reduce((s, f) => s + f.durationSeconds, 0);

// --- Export: full storyboard list (deep copy for mutable state) ---
export const MOCK_STORYBOARDS: Storyboard[] = [
  {
    id: "sb-nike",
    title: "Nike Spring Campaign — 30s Spot",
    description: "30-second TV/digital spot: athlete morning routine to finish line.",
    format: "commercial",
    status: "in_production",
    acts: nikeActs,
    frames: nikeFrames,
    totalDurationSeconds: nikeTotal,
    projectId: "1",
    projectName: "Nike Spring Campaign",
    brandId: "brand-nike",
    brandName: "Nike",
    aspectRatio: "16:9",
    targetDurationSeconds: 30,
    targetPlatform: "TV/Digital",
    collaborators: nikeCollaborators,
    commentCount: 4,
    provenanceEnabled: true,
    aclarLinked: true,
    createdAt: now,
    updatedAt: now,
    createdBy,
    tags: ["commercial", "nike", "spring"],
    version: 2,
  },
  {
    id: "sb-samsung",
    title: "Samsung Product Launch — Social Short",
    description: "15-second TikTok/Reels product tease.",
    format: "short_form",
    status: "draft",
    acts: samsungActs,
    frames: samsungFrames,
    totalDurationSeconds: samsungTotal,
    aspectRatio: "9:16",
    targetDurationSeconds: 15,
    targetPlatform: "TikTok/Reels",
    collaborators: samsungCollaborators,
    commentCount: 0,
    provenanceEnabled: false,
    aclarLinked: false,
    createdAt: now,
    updatedAt: now,
    createdBy: "Michael Torres",
    tags: ["short-form", "samsung", "product"],
    version: 1,
  },
  {
    id: "sb-coca",
    title: "Coca-Cola Holiday — Brand Film",
    description: "2-minute holiday brand film: family, sharing, togetherness.",
    format: "brand_film",
    status: "approved",
    acts: cocaActs,
    frames: cocaFrames,
    totalDurationSeconds: cocaTotal,
    projectId: "2",
    projectName: "Holiday Campaign",
    brandId: "brand-coca",
    brandName: "Coca-Cola",
    fullScript: "The holidays are for sharing. [Full script synced with frames.]",
    scriptVersion: 1,
    aspectRatio: "16:9",
    targetDurationSeconds: 120,
    targetPlatform: "YouTube, TV",
    collaborators: cocaCollaborators,
    commentCount: 12,
    provenanceEnabled: true,
    aclarLinked: true,
    createdAt: now,
    updatedAt: now,
    createdBy,
    tags: ["brand-film", "holiday", "coca-cola"],
    version: 3,
  },
];

/** Get a deep clone of mock storyboards (for mutable state in hooks). */
export function getInitialStoryboards(): Storyboard[] {
  return JSON.parse(JSON.stringify(MOCK_STORYBOARDS));
}
