"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ProjectToolRestrictionsModal } from "@/components/ProjectToolRestrictionsModal";
import { useState } from "react";
import { SettingsPageHeader } from "@/components/settings/SettingsPageHeader";

// Mock project tool restrictions data
const projectToolRestrictions = [
  {
    id: "1",
    name: "Brand Refresh Campaign",
    toolRestriction: "all" as const,
    allowedTools: [],
    description: "All tools (default)",
  },
  {
    id: "2",
    name: "Q1 Social Campaign",
    toolRestriction: "restricted" as const,
    allowedTools: ["1", "5"], // Midjourney, DALL-E
    description: "Midjourney, DALL-E only",
  },
  {
    id: "3",
    name: "Legal Documents",
    toolRestriction: "restricted" as const,
    allowedTools: ["2"], // ChatGPT
    description: "ChatGPT only",
  },
  {
    id: "4",
    name: "Product Launch Q1",
    toolRestriction: "all" as const,
    allowedTools: [],
    description: "All tools (default)",
  },
  {
    id: "5",
    name: "Website Redesign",
    toolRestriction: "restricted" as const,
    allowedTools: ["1", "4", "5"], // Midjourney, Runway, DALL-E
    description: "Midjourney, Runway, DALL-E",
  },
];

const availableTools = [
  { id: "1", name: "Midjourney", icon: "🎨" },
  { id: "2", name: "ChatGPT", icon: "💬" },
  { id: "3", name: "ElevenLabs", icon: "🎙️" },
  { id: "4", name: "Runway", icon: "🎬" },
  { id: "5", name: "DALL-E", icon: "🖼️" },
];

export default function ProjectRestrictionsPage() {
  const [projectRestrictionsOpen, setProjectRestrictionsOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<typeof projectToolRestrictions[0] | null>(null);

  return (
    <div className="space-y-6 animate-fade-in">
      <SettingsPageHeader
        title="Project Restrictions"
        description="Configure which AI tools are available for specific projects"
      />

      <Card>
        <CardHeader>
          <CardTitle>Project Tool Restrictions</CardTitle>
          <CardDescription>
            Configure which AI tools are available for specific projects
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-800">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Project Name
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Allowed Tools
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {projectToolRestrictions.map((project) => (
                  <tr 
                    key={project.id}
                    className="border-b border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {project.name}
                      </p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {project.description}
                      </p>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedProject(project);
                          setProjectRestrictionsOpen(true);
                        }}
                      >
                        Edit
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
            <p className="text-xs text-blue-800 dark:text-blue-200">
              <strong>Default behavior:</strong> New projects inherit &quot;all approved tools&quot; unless restricted here. Tool restrictions help enforce compliance and control costs per project.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Project Tool Restrictions Modal */}
      {selectedProject && (
        <ProjectToolRestrictionsModal
          open={projectRestrictionsOpen}
          onOpenChange={setProjectRestrictionsOpen}
          project={selectedProject}
          availableTools={availableTools}
        />
      )}
    </div>
  );
}
