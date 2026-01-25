"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ToolTemplate {
  id: string;
  name: string;
  icon: string;
  baseUrl: string;
  category: string;
  trackingLevel: "Full" | "Good" | "Basic";
  description: string;
}

const TOOL_TEMPLATES: ToolTemplate[] = [
  {
    id: "midjourney",
    name: "Midjourney",
    icon: "🎨",
    baseUrl: "https://midjourney.com",
    category: "Image Generation",
    trackingLevel: "Full",
    description: "AI-powered image generation tool creating stunning visuals from text prompts",
  },
  {
    id: "dalle3",
    name: "DALL-E 3",
    icon: "🖼️",
    baseUrl: "https://chat.openai.com",
    category: "Image Generation",
    trackingLevel: "Full",
    description: "OpenAI's latest image generation model with improved accuracy and prompt following",
  },
  {
    id: "runway",
    name: "Runway",
    icon: "🎬",
    baseUrl: "https://runwayml.com",
    category: "Video Generation",
    trackingLevel: "Good",
    description: "AI video generation and editing platform for creative professionals",
  },
  {
    id: "chatgpt",
    name: "ChatGPT",
    icon: "💬",
    baseUrl: "https://chat.openai.com",
    category: "Text Generation",
    trackingLevel: "Good",
    description: "OpenAI's conversational AI for text generation, analysis, and assistance",
  },
  {
    id: "claude",
    name: "Claude",
    icon: "🤖",
    baseUrl: "https://claude.ai",
    category: "Text Generation",
    trackingLevel: "Good",
    description: "Anthropic's AI assistant focused on helpful, harmless, and honest interactions",
  },
  {
    id: "stablediffusion",
    name: "Stable Diffusion",
    icon: "🎭",
    baseUrl: "https://stability.ai",
    category: "Image Generation",
    trackingLevel: "Full",
    description: "Open-source image generation model for high-quality AI art creation",
  },
  {
    id: "elevenlabs",
    name: "ElevenLabs",
    icon: "🎙️",
    baseUrl: "https://elevenlabs.io",
    category: "Audio Generation",
    trackingLevel: "Good",
    description: "AI voice synthesis and cloning for realistic audio generation",
  },
  {
    id: "pika",
    name: "Pika",
    icon: "🎥",
    baseUrl: "https://pika.art",
    category: "Video Generation",
    trackingLevel: "Good",
    description: "AI-powered video generation tool for creating animations from text and images",
  },
];

interface ImportToolTemplatesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (template: ToolTemplate) => void;
}

export function ImportToolTemplatesModal({ 
  open, 
  onOpenChange,
  onImport,
}: ImportToolTemplatesModalProps) {
  const handleImport = (template: ToolTemplate) => {
    onImport(template);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto !bg-white dark:!bg-gray-950 !backdrop-blur-none [backdrop-filter:none!important] [-webkit-backdrop-filter:none!important]">
        <DialogHeader>
          <DialogTitle>Import Tool Template</DialogTitle>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Select a pre-configured tool template to quickly add popular AI tools
          </p>
        </DialogHeader>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 py-4">
          {TOOL_TEMPLATES.map((template) => (
            <div
              key={template.id}
              className="group relative p-4 rounded-lg border border-gray-200 dark:border-gray-800 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md transition-all duration-200"
            >
              {/* Tool Icon */}
              <div className="flex items-center justify-center w-12 h-12 mb-3 text-3xl bg-gray-50 dark:bg-gray-900 rounded-lg group-hover:scale-110 transition-transform">
                {template.icon}
              </div>

              {/* Tool Name */}
              <h3 className="font-semibold text-base mb-1 text-gray-900 dark:text-white">
                {template.name}
              </h3>

              {/* Category */}
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                {template.category}
              </p>

              {/* Description */}
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 line-clamp-2 min-h-[2.5rem]">
                {template.description}
              </p>

              {/* Tracking Level Badge */}
              <div className="mb-3">
                <span
                  className={cn(
                    "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium",
                    template.trackingLevel === "Full" &&
                      "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400",
                    template.trackingLevel === "Good" &&
                      "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400",
                    template.trackingLevel === "Basic" &&
                      "bg-gray-50 dark:bg-gray-900/20 text-gray-700 dark:text-gray-400"
                  )}
                >
                  {template.trackingLevel} Tracking
                </span>
              </div>

              {/* Import Button */}
              <Button
                onClick={() => handleImport(template)}
                className="w-full"
                size="sm"
              >
                Import
              </Button>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
