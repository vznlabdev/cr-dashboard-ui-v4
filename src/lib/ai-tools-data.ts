// AI Tools Whitelist Data
export interface AITool {
  id: string;
  name: string;
  icon: string;
  category: string;
  baseUrl: string;
  status: "Approved" | "Under Review" | "Pending Approval" | "Archived";
  statusVariant: "default" | "secondary" | "outline" | "destructive";
  trackingLevel: "Full Tracking" | "Good Tracking" | "Basic Tracking";
  trackingVariant: "default" | "secondary" | "outline";
  approved: boolean;
  active: boolean;
  projectCount?: number;
  taskCount?: number;
  lastUsed?: string;
  createdAt: string;
  createdBy: string;
  description?: string;
  projectAvailability: "all" | "restricted";
  selectedProjects?: string[];
}

export const aiToolsWhitelist: AITool[] = [
  {
    id: "1",
    name: "Midjourney",
    icon: "🎨",
    category: "Image Generation",
    baseUrl: "https://midjourney.com",
    status: "Approved",
    statusVariant: "default",
    trackingLevel: "Full Tracking",
    trackingVariant: "default",
    approved: true,
    active: true,
    projectCount: 24,
    taskCount: 187,
    lastUsed: "2h ago",
    createdAt: "Jan 15, 2026",
    createdBy: "Sarah Chen",
    description: "AI image generation tool",
    projectAvailability: "all",
  },
  {
    id: "2",
    name: "ChatGPT",
    icon: "💬",
    category: "Text Generation",
    baseUrl: "https://chat.openai.com",
    status: "Approved",
    statusVariant: "default",
    trackingLevel: "Full Tracking",
    trackingVariant: "default",
    approved: true,
    active: true,
    projectCount: 18,
    taskCount: 243,
    lastUsed: "1h ago",
    createdAt: "Jan 10, 2026",
    createdBy: "Michael Chen",
    description: "Large language model for text generation",
    projectAvailability: "all",
  },
  {
    id: "3",
    name: "ElevenLabs",
    icon: "🎙️",
    category: "Audio Generation",
    baseUrl: "https://elevenlabs.io",
    status: "Approved",
    statusVariant: "default",
    trackingLevel: "Good Tracking",
    trackingVariant: "secondary",
    approved: true,
    active: true,
    projectCount: 8,
    taskCount: 45,
    lastUsed: "5h ago",
    createdAt: "Jan 8, 2026",
    createdBy: "Emma Davis",
    description: "AI voice synthesis and cloning",
    projectAvailability: "all",
  },
  {
    id: "4",
    name: "Runway",
    icon: "🎬",
    category: "Video Generation",
    baseUrl: "https://runwayml.com",
    status: "Approved",
    statusVariant: "default",
    trackingLevel: "Good Tracking",
    trackingVariant: "secondary",
    approved: true,
    active: true,
    projectCount: 12,
    taskCount: 156,
    lastUsed: "3h ago",
    createdAt: "Dec 28, 2025",
    createdBy: "Sarah Chen",
    description: "AI video generation and editing",
    projectAvailability: "all",
  },
  {
    id: "5",
    name: "DALL-E 3",
    icon: "🖼️",
    category: "Image Generation",
    baseUrl: "https://openai.com/dall-e",
    status: "Approved",
    statusVariant: "default",
    trackingLevel: "Full Tracking",
    trackingVariant: "default",
    approved: true,
    active: true,
    projectCount: 3,
    taskCount: 12,
    lastUsed: "1d ago",
    createdAt: "Jan 20, 2026",
    createdBy: "James Wilson",
    description: "OpenAI image generation model",
    projectAvailability: "all",
  },
  {
    id: "6",
    name: "Stable Diffusion",
    icon: "🎭",
    category: "Image Generation",
    baseUrl: "https://stability.ai",
    status: "Approved",
    statusVariant: "default",
    trackingLevel: "Good Tracking",
    trackingVariant: "secondary",
    approved: true,
    active: true,
    createdAt: "Jan 23, 2026",
    createdBy: "Emma Davis",
    description: "Open-source image generation model",
    projectAvailability: "all",
  },
];

// Get tools available for a specific project
export function getAvailableToolsForProject(projectId: string): AITool[] {
  // Filter to only approved and active tools
  return aiToolsWhitelist.filter(tool => tool.approved && tool.active);
}
