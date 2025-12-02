"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Plug,
  CheckCircle2,
  XCircle,
  Settings,
  ExternalLink,
  Key,
} from "lucide-react";
import { toast } from "sonner";

export default function IntegrationsPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI Tool Integrations</h1>
          <p className="text-muted-foreground mt-1">
            Connect and manage AI tool integrations for provenance tracking
          </p>
        </div>
      </div>

      {/* Connection Status */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Connected Tools
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4</div>
            <p className="text-xs text-muted-foreground">
              Active integrations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Setup
            </CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground">
              Require configuration
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total API Calls
            </CardTitle>
            <Plug className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12.4K</div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* AI Tool Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {aiTools.map((tool) => (
          <Card key={tool.id} className={tool.connected ? "border-green-500/30" : ""}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center text-2xl">
                    {tool.icon}
                  </div>
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {tool.name}
                      {tool.connected && (
                        <Badge variant="default" className="gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          Connected
                        </Badge>
                      )}
                      {!tool.connected && (
                        <Badge variant="secondary">
                          Not Connected
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {tool.description}
                    </CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {tool.connected ? (
                <>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status:</span>
                      <span className="font-medium text-green-500">Active</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">API Calls (30d):</span>
                      <span className="font-medium">{tool.apiCalls?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Last Sync:</span>
                      <span className="font-medium">{tool.lastSync}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => toast.info(`Configure ${tool.name} settings`)}
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      Configure
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => toast.info(`Opening ${tool.name} dashboard...`)}
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Open Dashboard
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor={`api-key-${tool.id}`}>API Key</Label>
                      <div className="flex gap-2">
                        <Input
                          id={`api-key-${tool.id}`}
                          type="password"
                          placeholder="Enter your API key"
                        />
                        <Button size="icon" variant="outline">
                          <Key className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  <Button 
                    className="w-full"
                    onClick={() => toast.success(`${tool.name} connected successfully!`)}
                  >
                    <Plug className="mr-2 h-4 w-4" />
                    Connect {tool.name}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// Mock data
const aiTools = [
  {
    id: 1,
    name: "Midjourney",
    icon: "🎨",
    description: "AI image generation",
    connected: true,
    apiCalls: 3420,
    lastSync: "2 minutes ago",
  },
  {
    id: 2,
    name: "Runway",
    icon: "🎬",
    description: "AI video generation and editing",
    connected: true,
    apiCalls: 1256,
    lastSync: "1 hour ago",
  },
  {
    id: 3,
    name: "ElevenLabs",
    icon: "🎙️",
    description: "AI voice synthesis and cloning",
    connected: true,
    apiCalls: 892,
    lastSync: "3 hours ago",
  },
  {
    id: 4,
    name: "Suno",
    icon: "🎵",
    description: "AI music generation",
    connected: false,
  },
  {
    id: 5,
    name: "ChatGPT",
    icon: "💬",
    description: "AI text generation and assistance",
    connected: true,
    apiCalls: 6847,
    lastSync: "5 minutes ago",
  },
  {
    id: 6,
    name: "Luma AI",
    icon: "🎥",
    description: "AI 3D capture and rendering",
    connected: false,
  },
];

