import type {
  WorkflowTemplate,
  WorkflowInstance,
  WorkflowStepStatus,
} from "@/types/workflows"

// =============================================================================
// MOCK WORKFLOW TEMPLATES
// =============================================================================

export const MOCK_WORKFLOW_TEMPLATES: WorkflowTemplate[] = [
  // 1. AI Video Production
  {
    id: "wf-video-production",
    name: "AI Video Production",
    description: "End-to-end AI video creation from character design to final render",
    category: "video",
    icon: "🎬",
    isSystem: true,
    isPublished: true,
    usageCount: 24,
    estimatedTotalMinutes: 85,
    tags: ["video", "character", "production"],
    createdBy: "System",
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-01T00:00:00Z",
    steps: [
      {
        id: "step-vp-1",
        name: "Character Design",
        stepType: "image_generation",
        order: 1,
        required: true,
        estimatedMinutes: 15,
        recommendedToolIds: ["1"],
        promptTemplate: "Generate a [character type] character for the project. Style: cinematic, photorealistic. Create 3-4 variations.",
        tips: ["Generate 3-4 variations before selecting", "Test model-type and cinematic styles", "Save all generations for provenance"],
        acceptanceCriteria: ["Character matches brief", "3+ variations generated", "Final selection saved"],
      },
      {
        id: "step-vp-2",
        name: "Enhance Realism",
        stepType: "enhancement",
        order: 2,
        required: true,
        estimatedMinutes: 10,
        promptTemplate: "Enhance photorealism: skin texture, lighting consistency, environment integration.",
        tips: ["Compare before/after", "Check for AI artifacts in skin, hair, eyes"],
        acceptanceCriteria: ["Photorealistic quality", "No visible artifacts"],
      },
      {
        id: "step-vp-3",
        name: "Script & Voice",
        stepType: "voice_audio",
        order: 3,
        required: true,
        estimatedMinutes: 20,
        recommendedToolIds: ["3"],
        promptTemplate: "Generate voiceover for [scene]. Tone: [warm/authoritative/casual]. Duration: [target].",
        tips: ["Test 2-3 voice styles", "Match tone to brand guidelines", "Export highest quality"],
        acceptanceCriteria: ["Voice matches brand", "Audio is clean", "Duration on target"],
      },
      {
        id: "step-vp-4",
        name: "Video Generation",
        stepType: "video_generation",
        order: 4,
        required: true,
        estimatedMinutes: 30,
        recommendedToolIds: ["4"],
        promptTemplate: "Combine character with voiceover. Scene: [description]. Camera: [movement]. Duration: [target].",
        tips: ["Start with short test render", "Check lip sync", "Render at max quality"],
        acceptanceCriteria: ["Video matches brief", "Audio syncs", "No rendering artifacts"],
      },
      {
        id: "step-vp-5",
        name: "Final Review",
        stepType: "review_approval",
        order: 5,
        required: true,
        estimatedMinutes: 10,
        tips: ["Watch full video twice", "Check desktop and mobile", "Verify provenance captured"],
        acceptanceCriteria: ["Meets brief", "Brand compliant", "Audio syncs", "No artifacts", "Provenance complete"],
      },
    ],
  },

  // 2. Social Media Image Pack
  {
    id: "wf-social-images",
    name: "Social Media Image Pack",
    description: "Generate on-brand social media images with variations",
    category: "image",
    icon: "📸",
    isSystem: true,
    isPublished: true,
    usageCount: 42,
    estimatedTotalMinutes: 30,
    tags: ["social", "image", "variations"],
    createdBy: "System",
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-01T00:00:00Z",
    steps: [
      {
        id: "step-si-1",
        name: "Generate Base Images",
        stepType: "image_generation",
        order: 1,
        required: true,
        estimatedMinutes: 15,
        recommendedToolIds: ["1"],
        promptTemplate: "Create on-brand social imagery for [platform]. Style: [brand guidelines]. Include 4-6 base compositions.",
        tips: ["Use brand color palette", "Keep aspect ratios in mind", "Export at 2x for retina"],
        acceptanceCriteria: ["Images match brand", "Correct dimensions", "4+ base images generated"],
      },
      {
        id: "step-si-2",
        name: "Variations & Sizing",
        stepType: "enhancement",
        order: 2,
        required: true,
        estimatedMinutes: 10,
        promptTemplate: "Produce platform-specific sizes and optional variations (A/B) for each base image.",
        tips: ["Check each platform spec", "Maintain quality on crop", "Label variations clearly"],
        acceptanceCriteria: ["All required sizes produced", "No quality loss", "Variations labeled"],
      },
      {
        id: "step-si-3",
        name: "Review & Submit",
        stepType: "review_approval",
        order: 3,
        required: true,
        estimatedMinutes: 5,
        tips: ["Preview on device sizes", "Confirm brand compliance", "Attach provenance before submit"],
        acceptanceCriteria: ["All assets approved", "Provenance attached", "Ready for publish"],
      },
    ],
  },

  // 3. AI Podcast Episode
  {
    id: "wf-podcast",
    name: "AI Podcast Episode",
    description: "Script, voice, and produce a podcast episode with AI",
    category: "audio",
    icon: "🎙️",
    isSystem: true,
    isPublished: true,
    usageCount: 18,
    estimatedTotalMinutes: 60,
    tags: ["podcast", "audio", "script"],
    createdBy: "System",
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-01T00:00:00Z",
    steps: [
      {
        id: "step-pod-1",
        name: "Script Writing",
        stepType: "text_script",
        order: 1,
        required: true,
        estimatedMinutes: 15,
        recommendedToolIds: ["2"],
        promptTemplate: "Write podcast script for episode [topic]. Tone: [conversational/educational]. Target length: [minutes] minutes. Include intro, segments, and outro.",
        tips: ["Define key talking points first", "Keep sentences short for delivery", "Mark pauses and emphasis"],
        acceptanceCriteria: ["Script matches brief", "Word count on target", "Intro/outro included"],
      },
      {
        id: "step-pod-2",
        name: "Voice Generation",
        stepType: "voice_audio",
        order: 2,
        required: true,
        estimatedMinutes: 20,
        recommendedToolIds: ["3"],
        promptTemplate: "Generate voiceover for podcast script. Voice: [style]. Pace: [moderate/slow]. Match tone to script.",
        tips: ["Test 2-3 voice styles", "Listen for natural pacing", "Export in lossless format"],
        acceptanceCriteria: ["Voice matches brand", "Clear pronunciation", "Duration on target"],
      },
      {
        id: "step-pod-3",
        name: "Audio Post-Production",
        stepType: "enhancement",
        order: 3,
        required: true,
        estimatedMinutes: 15,
        promptTemplate: "Apply standard podcast post: noise reduction, leveling, optional music bed and transitions.",
        tips: ["Normalize levels", "Remove mouth clicks", "Keep master under -1 dB peak"],
        acceptanceCriteria: ["Clean audio", "Consistent levels", "No clipping"],
      },
      {
        id: "step-pod-4",
        name: "Review & Publish",
        stepType: "review_approval",
        order: 4,
        required: true,
        estimatedMinutes: 10,
        tips: ["Listen full episode", "Check metadata and artwork", "Confirm rights and provenance"],
        acceptanceCriteria: ["Content approved", "Metadata complete", "Provenance recorded"],
      },
    ],
  },

  // 4. Marketing Campaign Bundle
  {
    id: "wf-campaign-bundle",
    name: "Marketing Campaign Bundle",
    description: "Full campaign package: hero image, supporting visuals, video, and audio",
    category: "mixed",
    icon: "📦",
    isSystem: true,
    isPublished: true,
    usageCount: 8,
    estimatedTotalMinutes: 95,
    tags: ["campaign", "mixed", "hero", "video"],
    createdBy: "System",
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-01T00:00:00Z",
    steps: [
      {
        id: "step-cb-1",
        name: "Creative Brief",
        stepType: "text_script",
        order: 1,
        required: true,
        estimatedMinutes: 10,
        promptTemplate: "Document campaign brief: objective, audience, key message, tone, and deliverables list (hero, supporting, video, audio).",
        tips: ["Align with stakeholder sign-off", "Include reference links", "Define success metrics"],
        acceptanceCriteria: ["Brief complete", "Deliverables listed", "Approved by stakeholder"],
      },
      {
        id: "step-cb-2",
        name: "Hero Image",
        stepType: "image_generation",
        order: 2,
        required: true,
        estimatedMinutes: 15,
        recommendedToolIds: ["1"],
        promptTemplate: "Create hero image for campaign. Brief: [summary]. Style: [brand]. High impact, hero placement.",
        tips: ["Generate 3-4 options", "Check safe zones for text", "Export at max resolution"],
        acceptanceCriteria: ["Hero matches brief", "Brand compliant", "Resolution and format correct"],
      },
      {
        id: "step-cb-3",
        name: "Supporting Visuals",
        stepType: "image_generation",
        order: 3,
        required: true,
        estimatedMinutes: 15,
        promptTemplate: "Create supporting visuals (cards, banners, social) consistent with hero. Same style and palette.",
        tips: ["Keep visual system consistent", "Reuse hero elements where possible", "Label by placement"],
        acceptanceCriteria: ["Consistent with hero", "All sizes delivered", "Named and organized"],
      },
      {
        id: "step-cb-4",
        name: "Video Spot",
        stepType: "video_generation",
        order: 4,
        required: true,
        estimatedMinutes: 30,
        recommendedToolIds: ["4"],
        promptTemplate: "Produce campaign video spot. Duration: [target]. Message: [key message]. Use hero and supporting assets. Include CTA.",
        tips: ["Start with storyboard", "Sync with audio early", "Export multiple formats"],
        acceptanceCriteria: ["Video on brief", "Audio syncs", "Formats delivered"],
      },
      {
        id: "step-cb-5",
        name: "Audio Tag",
        stepType: "voice_audio",
        order: 5,
        required: true,
        estimatedMinutes: 15,
        recommendedToolIds: ["3"],
        promptTemplate: "Generate audio tag / VO for campaign. Script: [copy]. Tone: [brand voice]. Length: [target seconds].",
        tips: ["Match brand voice guide", "Export WAV for video", "Keep alternate takes"],
        acceptanceCriteria: ["Copy approved", "Quality clean", "Duration on target"],
      },
      {
        id: "step-cb-6",
        name: "Campaign Review",
        stepType: "review_approval",
        order: 6,
        required: true,
        estimatedMinutes: 10,
        tips: ["Review all assets together", "Check cross-channel consistency", "Sign off on provenance"],
        acceptanceCriteria: ["All deliverables approved", "Consistent across channel", "Provenance complete"],
      },
    ],
  },

  // 5. Quick Image Generation
  {
    id: "wf-quick-image",
    name: "Quick Image Generation",
    description: "Fast single image generation with review",
    category: "image",
    icon: "⚡",
    isSystem: true,
    isPublished: true,
    usageCount: 67,
    estimatedTotalMinutes: 15,
    tags: ["quick", "image", "single"],
    createdBy: "System",
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-01T00:00:00Z",
    steps: [
      {
        id: "step-qi-1",
        name: "Generate Image",
        stepType: "image_generation",
        order: 1,
        required: true,
        estimatedMinutes: 10,
        recommendedToolIds: ["1"],
        promptTemplate: "Generate image: [description]. Style: [style]. Output: [dimensions or aspect ratio].",
        tips: ["Be specific in prompt", "Generate 2-3 if unsure", "Save provenance"],
        acceptanceCriteria: ["Image matches request", "Resolution correct", "Provenance saved"],
      },
      {
        id: "step-qi-2",
        name: "Review & Submit",
        stepType: "review_approval",
        order: 2,
        required: true,
        estimatedMinutes: 5,
        tips: ["Check quality and brief", "Confirm usage rights", "Submit with metadata"],
        acceptanceCriteria: ["Approved for use", "Metadata complete", "Submitted"],
      },
    ],
  },

  // 6. Our Brand Video Process (user template)
  {
    id: "wf-brand-video",
    name: "Our Brand Video Process",
    description: "Acme Corp's custom video workflow with brand-specific steps",
    category: "video",
    icon: "🎥",
    isSystem: false,
    isPublished: true,
    usageCount: 12,
    estimatedTotalMinutes: 65,
    tags: ["brand", "video", "custom"],
    createdBy: "Jeff Gordon",
    createdAt: "2025-12-15T00:00:00Z",
    updatedAt: "2026-01-10T00:00:00Z",
    steps: [
      {
        id: "step-bv-1",
        name: "Brand Brief Review",
        stepType: "text_script",
        order: 1,
        required: true,
        estimatedMinutes: 10,
        promptTemplate: "Review and lock brand brief: audience, message, tone, and mandatory brand elements (logo, colors, DO/DON'T).",
        tips: ["Use latest brand kit", "Confirm with brand lead", "Document any waivers"],
        acceptanceCriteria: ["Brief signed off", "Brand elements listed", "Waivers documented"],
      },
      {
        id: "step-bv-2",
        name: "Storyboard Generation",
        stepType: "image_generation",
        order: 2,
        required: true,
        estimatedMinutes: 20,
        recommendedToolIds: ["1"],
        promptTemplate: "Create storyboard frames for [concept]. Style: [brand]. Include key frames and transitions. 6-10 panels.",
        tips: ["Match brand look", "Number panels for feedback", "Export for review"],
        acceptanceCriteria: ["Storyboard complete", "Brand compliant", "Approved by stakeholder"],
      },
      {
        id: "step-bv-3",
        name: "Video Production",
        stepType: "video_generation",
        order: 3,
        required: true,
        estimatedMinutes: 25,
        recommendedToolIds: ["4"],
        promptTemplate: "Produce video from approved storyboard. Apply brand guidelines. Duration: [target]. Include logo and CTA.",
        tips: ["Follow storyboard order", "Use brand music/voice if any", "Deliver in requested formats"],
        acceptanceCriteria: ["Video matches storyboard", "Brand compliant", "Formats delivered"],
      },
      {
        id: "step-bv-4",
        name: "Brand Review",
        stepType: "review_approval",
        order: 4,
        required: true,
        estimatedMinutes: 10,
        tips: ["Check against brand checklist", "Legal/rights if needed", "Final sign-off"],
        acceptanceCriteria: ["Brand approved", "Rights cleared", "Ready for distribution"],
      },
    ],
  },

  // Sample custom workflow (for /workflows/wf-custom-1770599271745)
  {
    id: "wf-custom-1770599271745",
    name: "Custom Image Workflow",
    description: "A sample custom workflow for generating and refining images with AI.",
    category: "image",
    icon: "⚡",
    isSystem: false,
    isPublished: false,
    usageCount: 0,
    estimatedTotalMinutes: 30,
    tags: ["custom", "image", "sample"],
    createdBy: "Me",
    createdAt: "2026-02-07T00:00:00Z",
    updatedAt: "2026-02-07T00:00:00Z",
    steps: [
      {
        id: "step-custom-1",
        name: "Generate Base Images",
        stepType: "image_generation",
        order: 1,
        required: true,
        estimatedMinutes: 15,
        recommendedToolIds: ["1"],
        promptTemplate: "Create [subject] in [style]. Include [key elements]. Export at high resolution.",
        tips: ["Use brand colors if applicable", "Generate 2-3 variations", "Save source prompts"],
        acceptanceCriteria: ["At least 2 images generated", "Match brief requirements", "Provenance captured"],
      },
      {
        id: "step-custom-2",
        name: "Refine and Resize",
        stepType: "enhancement",
        order: 2,
        required: true,
        estimatedMinutes: 10,
        promptTemplate: "Refine selected image(s). Adjust [aspect ratio/size]. Preserve quality.",
        tips: ["Check platform specs", "Keep originals", "Label versions clearly"],
        acceptanceCriteria: ["Required sizes produced", "No quality loss", "Files labeled"],
      },
      {
        id: "step-custom-3",
        name: "Review and Submit",
        stepType: "review_approval",
        order: 3,
        required: true,
        estimatedMinutes: 5,
        tips: ["Preview on target platforms", "Confirm brand compliance", "Attach provenance before submit"],
        acceptanceCriteria: ["Assets approved", "Provenance attached", "Ready for use"],
      },
    ],
  },
]

// User-created templates (in-memory; survives until page refresh)
let userWorkflowTemplates: WorkflowTemplate[] = []

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

export function getWorkflowTemplates(): WorkflowTemplate[] {
  return [...MOCK_WORKFLOW_TEMPLATES, ...userWorkflowTemplates]
}

export function getWorkflowTemplateById(id: string): WorkflowTemplate | undefined {
  return (
    MOCK_WORKFLOW_TEMPLATES.find((t) => t.id === id) ??
    userWorkflowTemplates.find((t) => t.id === id)
  )
}

export function addWorkflowTemplate(template: WorkflowTemplate): void {
  const withId = template.id
    ? template
    : { ...template, id: `wf-custom-${Date.now()}` }
  userWorkflowTemplates.push(withId)
}

export function updateWorkflowTemplate(
  id: string,
  template: WorkflowTemplate
): void {
  const idx = userWorkflowTemplates.findIndex((t) => t.id === id)
  if (idx === -1) return
  userWorkflowTemplates[idx] = { ...template, id }
}

export function getWorkflowTemplatesByCategory(category: string): WorkflowTemplate[] {
  return MOCK_WORKFLOW_TEMPLATES.filter((t) => t.category === category)
}

export function getSystemTemplates(): WorkflowTemplate[] {
  return MOCK_WORKFLOW_TEMPLATES.filter((t) => t.isSystem)
}

export function getUserTemplates(): WorkflowTemplate[] {
  return getWorkflowTemplates().filter((t) => !t.isSystem)
}

export function createWorkflowInstance(
  templateId: string,
  taskId: string,
  projectId: string
): WorkflowInstance {
  const template = getWorkflowTemplateById(templateId)
  if (!template) {
    throw new Error(`Workflow template not found: ${templateId}`)
  }
  const stepStatuses: WorkflowStepStatus[] = template.steps.map((step, index) => ({
    stepId: step.id,
    status: index === 0 ? "ready" : "locked",
  }))
  return {
    id: `wi-${Date.now()}`,
    templateId: template.id,
    templateName: template.name,
    taskId,
    projectId,
    currentStepIndex: 0,
    stepStatuses,
    status: "not_started",
  }
}
