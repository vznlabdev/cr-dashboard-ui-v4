/**
 * Creation Rights Storyboard module — type system.
 * Covers frames, acts, storyboards, timeline view state, and export options.
 */

// --- Frame Types ---

/** Kind of frame in the storyboard sequence (visual, title, transition, etc.). */
export type FrameType =
  | "scene" // standard visual frame
  | "title_card" // text-only title/intro card
  | "transition" // transition between scenes (fade, cut, wipe)
  | "audio_only" // voiceover/music-only beat (no visual change)
  | "b_roll"; // supplementary footage notation

/** Camera shot type (wide, medium, close-up, etc.). */
export type ShotType =
  | "wide" // establishing/wide shot
  | "medium" // medium shot
  | "close_up" // close-up
  | "extreme_close_up"
  | "over_shoulder"
  | "pov" // point of view
  | "aerial" // drone/overhead
  | "tracking" // camera follows subject
  | "static" // locked-off camera
  | "custom";

/** Camera movement for the shot. */
export type CameraMovement =
  | "static"
  | "pan_left"
  | "pan_right"
  | "tilt_up"
  | "tilt_down"
  | "zoom_in"
  | "zoom_out"
  | "dolly_in"
  | "dolly_out"
  | "crane_up"
  | "crane_down"
  | "handheld"
  | "orbit"
  | "tracking"
  | "none";

// --- Frame ---

/** A single storyboard frame (atomic unit in the sequence). */
export interface StoryboardFrame {
  id: string;
  storyboardId: string;
  /** Position in sequence (0-based). */
  order: number;
  frameType: FrameType;

  // Visual
  /** Sketch, reference image, or AI-generated preview URL. */
  thumbnailUrl?: string;
  /** Linked asset ID if thumbnail came from asset library. */
  thumbnailAssetId?: string;
  /** Text description of what the viewer sees. */
  visualDescription: string;
  shotType?: ShotType;
  cameraMovement?: CameraMovement;
  /** Hex color for simple frames / mood. */
  backgroundColor?: string;

  // Script & Audio
  /** Character dialogue for this frame. */
  dialogue?: string;
  /** VO narration text. */
  voiceoverText?: string;
  /** SFX notes. */
  soundEffects?: string;
  /** Background music/mood description. */
  musicNotes?: string;
  /** Who is speaking (character name or "VO"). */
  speaker?: string;

  // Timing
  /** How long this frame lasts (default 3). */
  durationSeconds: number;
  /** Computed: cumulative start time in sequence. */
  startTimeSeconds?: number;
  /** e.g. "cut", "fade", "dissolve", "wipe". */
  transitionIn?: string;
  transitionOut?: string;

  // Production Links
  /** Task that produces this frame's content. */
  linkedTaskId?: string;
  /** Workflow template for this frame's production. */
  linkedWorkflowId?: string;
  /** Final assets attached to this frame. */
  linkedAssetIds: string[];
  /** Brand guidelines reference. */
  linkedBrandId?: string;

  // AI Generation Context
  /** Suggested prompt based on visual description. */
  aiPromptSuggestion?: string;
  /** Recommended tool (from whitelist). */
  aiToolRecommendation?: string;
  generationStatus?: "not_started" | "in_progress" | "generated" | "approved";

  // Collaboration
  /** Internal production notes. */
  notes?: string;
  commentCount: number;
  approvalStatus: "draft" | "pending_review" | "approved" | "needs_revision";
  approvedBy?: string;
  approvedAt?: string;

  // Metadata
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  /** Frame version for history tracking. */
  version: number;
}

/** A comment on a storyboard frame (threaded, one level deep via parentId). */
export interface FrameComment {
  id: string;
  frameId: string;
  text: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  createdAt: string;
  isResolved: boolean;
  resolvedBy?: string;
  resolvedAt?: string;
  /** For threaded replies (one level deep). */
  parentId?: string;
}

// --- Act / Scene Group ---

/** Optional grouping of frames (e.g. Act 1, Act 2). */
export interface StoryboardAct {
  id: string;
  /** e.g. "Act 1: Hook", "Act 2: Problem". */
  name: string;
  description?: string;
  order: number;
  /** Ordered frame IDs in this act. */
  frameIds: string[];
  /** Accent color for timeline grouping. */
  color?: string;
}

// --- Full Storyboard ---

/** Lifecycle status of the storyboard. */
export type StoryboardStatus =
  | "draft"
  | "in_review"
  | "approved"
  | "in_production"
  | "completed"
  | "archived";

/** Intended format/length of the storyboard. */
export type StoryboardFormat =
  | "short_form" // TikTok, Reels, Shorts (< 60s)
  | "social_video" // Social media video (1-3 min)
  | "commercial" // TV/digital ad (15s, 30s, 60s)
  | "explainer" // Explainer/tutorial (2-10 min)
  | "brand_film" // Brand story / documentary style
  | "music_video" // Music video
  | "presentation" // Animated presentation / pitch
  | "custom";

/** Full storyboard document (frames, acts, metadata). */
export interface Storyboard {
  id: string;
  title: string;
  description?: string;
  format: StoryboardFormat;
  status: StoryboardStatus;

  // Structure
  /** Optional grouping (can be single act). */
  acts: StoryboardAct[];
  /** All frames, ordered. */
  frames: StoryboardFrame[];
  /** Computed from frame durations. */
  totalDurationSeconds: number;

  // Project Integration
  /** Optional — storyboards can exist standalone. */
  projectId?: string;
  projectName?: string;
  brandId?: string;
  brandName?: string;

  // Script
  /** Complete script text (syncs with frame dialogue). */
  fullScript?: string;
  scriptVersion?: number;

  // Format Settings
  aspectRatio: "16:9" | "9:16" | "1:1" | "4:5" | "4:3" | "21:9";
  /** Intended total length in seconds. */
  targetDurationSeconds?: number;
  /** e.g. "TikTok", "YouTube", "Instagram", "TV". */
  targetPlatform?: string;

  // Collaboration
  collaborators: StoryboardCollaborator[];
  commentCount: number;

  // Provenance
  /** Track all changes for insurance. */
  provenanceEnabled: boolean;
  /** Connected to ACLAR compliance chain. */
  aclarLinked: boolean;

  // Metadata
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  /** First frame thumbnail or custom cover. */
  thumbnail?: string;
  tags?: string[];
  version: number;
}

/** Collaborator on a storyboard. */
export interface StoryboardCollaborator {
  userId: string;
  name: string;
  role: "owner" | "editor" | "reviewer" | "viewer";
  addedAt: string;
}

// --- Timeline View State ---

/** UI state for the timeline/filmstrip view. */
export interface TimelineViewState {
  /** 1 = default, 0.5 = zoomed out, 2 = zoomed in. */
  zoom: number;
  /** Horizontal scroll offset. */
  scrollPosition: number;
  selectedFrameId: string | null;
  /** Seconds (for animatic preview). */
  playbackPosition: number;
  isPlaying: boolean;
  /** Toggle script panel. */
  showScript: boolean;
  /** Toggle audio notes lane. */
  showAudioTrack: boolean;
  /** Timeline, grid, or list view. */
  viewMode: "timeline" | "grid" | "list";
}

// --- Export ---

/** Supported export formats. */
export type ExportFormat = "pdf" | "animatic_mp4" | "json" | "csv" | "fcpxml" | "edl";

/** Options for exporting a storyboard. */
export interface StoryboardExport {
  format: ExportFormat;
  includeScript: boolean;
  includeNotes: boolean;
  includeTiming: boolean;
  includeAssetLinks: boolean;
  /** For PDF layout. */
  frameSize?: "small" | "medium" | "large";
  /** For PDF grid layout. */
  framesPerRow?: number;
}
