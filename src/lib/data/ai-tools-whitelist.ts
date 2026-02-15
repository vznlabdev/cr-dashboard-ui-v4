/**
 * Enterprise AI tools whitelist for Creation Rights.
 * Defines all AI tools an organization has evaluated and their approval status.
 * Powers tool selection in the workflow builder — creators can only use tools their org has approved.
 */

import type { ToolWhitelistConfig, WhitelistedTool } from "@/types/workflow-builder";

export const MOCK_TOOL_WHITELIST: WhitelistedTool[] = [
  // --- Image Generation (approved) ---
  {
    id: "midjourney",
    name: "Midjourney",
    icon: "🎨",
    category: "image_generation",
    approvalStatus: "approved",
    licenseTier: "enterprise",
    indemnified: true,
  },
  {
    id: "dall-e-3",
    name: "DALL-E 3",
    icon: "🖼️",
    category: "image_generation",
    approvalStatus: "approved",
    licenseTier: "enterprise",
    indemnified: true,
  },
  {
    id: "adobe-firefly",
    name: "Adobe Firefly",
    icon: "✨",
    category: "image_generation",
    approvalStatus: "approved",
    licenseTier: "enterprise",
    indemnified: true,
    internalAlias: "Firefly Enterprise",
  },
  {
    id: "stable-diffusion-xl",
    name: "Stable Diffusion XL",
    icon: "🔲",
    category: "image_generation",
    approvalStatus: "approved",
    licenseTier: "team",
    indemnified: false,
    complianceNotes: "Requires additional IP review",
  },
  // --- Image Generation (pending_review) ---
  {
    id: "ideogram",
    name: "Ideogram",
    icon: "🅰️",
    category: "image_generation",
    approvalStatus: "pending_review",
    licenseTier: "team",
  },
  // --- Video Generation (approved) ---
  {
    id: "runway-gen-3",
    name: "Runway Gen-3",
    icon: "🎬",
    category: "video_generation",
    approvalStatus: "approved",
    licenseTier: "enterprise",
    indemnified: true,
  },
  {
    id: "heygen",
    name: "HeyGen",
    icon: "👤",
    category: "video_generation",
    approvalStatus: "approved",
    licenseTier: "enterprise",
  },
  {
    id: "pika",
    name: "Pika",
    icon: "🎥",
    category: "video_generation",
    approvalStatus: "approved",
    licenseTier: "team",
  },
  // --- Video Generation (restricted) ---
  {
    id: "sora",
    name: "Sora",
    icon: "🌊",
    category: "video_generation",
    approvalStatus: "restricted",
    complianceNotes: "Awaiting legal review of OpenAI enterprise terms",
  },
  // --- Voice & Audio (approved) ---
  {
    id: "elevenlabs",
    name: "ElevenLabs",
    icon: "🔊",
    category: "voice_audio",
    approvalStatus: "approved",
    licenseTier: "enterprise",
    indemnified: true,
  },
  {
    id: "murf-ai",
    name: "Murf AI",
    icon: "🎙️",
    category: "voice_audio",
    approvalStatus: "approved",
    licenseTier: "team",
  },
  // --- Text & Script (approved) ---
  {
    id: "chatgpt-enterprise",
    name: "ChatGPT Enterprise",
    icon: "💬",
    category: "text_script",
    approvalStatus: "approved",
    licenseTier: "enterprise",
    indemnified: true,
  },
  {
    id: "claude",
    name: "Claude",
    icon: "🧠",
    category: "text_script",
    approvalStatus: "approved",
    licenseTier: "enterprise",
    indemnified: true,
  },
  {
    id: "jasper",
    name: "Jasper",
    icon: "✍️",
    category: "text_script",
    approvalStatus: "approved",
    licenseTier: "team",
  },
  // --- Enhancement (approved) ---
  {
    id: "topaz-ai",
    name: "Topaz AI",
    icon: "🔍",
    category: "enhancement",
    approvalStatus: "approved",
    licenseTier: "enterprise",
  },
  {
    id: "luminar-neo",
    name: "Luminar Neo",
    icon: "🌅",
    category: "enhancement",
    approvalStatus: "approved",
    licenseTier: "team",
  },
];

/** Default tool IDs per step type (approved tools only). */
const defaultToolsByStepType = {
  image_generation: ["midjourney", "adobe-firefly", "dall-e-3", "stable-diffusion-xl"],
  video_generation: ["runway-gen-3", "heygen", "pika"],
  voice_audio: ["elevenlabs", "murf-ai"],
  text_script: ["chatgpt-enterprise", "claude", "jasper"],
  enhancement: ["topaz-ai", "luminar-neo"],
  review_approval: [],
  custom: [],
} as const;

export const MOCK_WHITELIST_CONFIG: ToolWhitelistConfig = {
  orgId: "org-1",
  tools: MOCK_TOOL_WHITELIST,
  defaultToolsByStepType: { ...defaultToolsByStepType },
  allowToolRequests: true,
  requireApprovalForNewTools: true,
};

