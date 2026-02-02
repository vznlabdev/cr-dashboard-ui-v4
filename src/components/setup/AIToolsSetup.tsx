"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Sparkles, Eye, EyeOff, ExternalLink } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface AITool {
  id: string
  name: string
  description: string
  category: "generation" | "analysis" | "automation"
  requiresApiKey: boolean
  enabled: boolean
  apiKey?: string
  usageLimit?: number
}

interface AIToolsSetupProps {
  onSave: (tools: AITool[]) => void
  onSkip?: () => void
}

const AVAILABLE_AI_TOOLS: Omit<AITool, "enabled" | "apiKey" | "usageLimit">[] = [
  {
    id: "openai-gpt",
    name: "OpenAI GPT-4",
    description: "Advanced language model for content generation and analysis",
    category: "generation",
    requiresApiKey: true,
  },
  {
    id: "dall-e",
    name: "DALL-E 3",
    description: "Generate images from text descriptions",
    category: "generation",
    requiresApiKey: true,
  },
  {
    id: "midjourney",
    name: "Midjourney",
    description: "AI art generation for creative assets",
    category: "generation",
    requiresApiKey: true,
  },
  {
    id: "content-analyzer",
    name: "Content Analyzer",
    description: "Analyze content for compliance and quality",
    category: "analysis",
    requiresApiKey: false,
  },
  {
    id: "auto-tagger",
    name: "Auto-Tagger",
    description: "Automatically tag and categorize assets",
    category: "automation",
    requiresApiKey: false,
  },
  {
    id: "sentiment-analysis",
    name: "Sentiment Analysis",
    description: "Analyze content sentiment and tone",
    category: "analysis",
    requiresApiKey: false,
  },
]

export function AIToolsSetup({ onSave, onSkip }: AIToolsSetupProps) {
  const [tools, setTools] = useState<AITool[]>(
    AVAILABLE_AI_TOOLS.map((tool) => ({
      ...tool,
      enabled: false,
    }))
  )
  const [configTool, setConfigTool] = useState<AITool | null>(null)
  const [showApiKey, setShowApiKey] = useState(false)
  const [tempApiKey, setTempApiKey] = useState("")
  const [tempUsageLimit, setTempUsageLimit] = useState<number | undefined>()

  const handleToggleTool = (id: string, enabled: boolean) => {
    const tool = tools.find((t) => t.id === id)
    if (tool?.requiresApiKey && enabled) {
      // Open config dialog if API key is required
      setConfigTool(tool)
      setTempApiKey(tool.apiKey || "")
      setTempUsageLimit(tool.usageLimit)
    } else {
      setTools((prev) =>
        prev.map((tool) => (tool.id === id ? { ...tool, enabled } : tool))
      )
    }
  }

  const handleSaveConfig = () => {
    if (configTool) {
      setTools((prev) =>
        prev.map((tool) =>
          tool.id === configTool.id
            ? {
                ...tool,
                enabled: true,
                apiKey: tempApiKey,
                usageLimit: tempUsageLimit,
              }
            : tool
        )
      )
      setConfigTool(null)
      setTempApiKey("")
      setTempUsageLimit(undefined)
      setShowApiKey(false)
    }
  }

  const handleSaveAll = () => {
    onSave(tools.filter((tool) => tool.enabled))
  }

  const getCategoryBadge = (category: string) => {
    const colors = {
      generation: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
      analysis: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
      automation: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    }
    return colors[category as keyof typeof colors] || ""
  }

  const enabledCount = tools.filter((t) => t.enabled).length

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            AI Tools & Integrations
          </CardTitle>
          <CardDescription>
            Enable AI-powered tools to enhance your creative workflow
            {enabledCount > 0 && ` (${enabledCount} enabled)`}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {tools.map((tool) => (
            <div
              key={tool.id}
              className="flex items-start justify-between p-4 border rounded-lg hover:bg-muted/30 transition-colors"
            >
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium">{tool.name}</h4>
                  <Badge
                    variant="outline"
                    className={`text-xs ${getCategoryBadge(tool.category)}`}
                  >
                    {tool.category}
                  </Badge>
                  {tool.requiresApiKey && (
                    <Badge variant="secondary" className="text-xs">
                      API Key Required
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{tool.description}</p>
                {tool.enabled && tool.apiKey && (
                  <p className="text-xs text-green-600 dark:text-green-400">
                    Configured {tool.usageLimit && `• ${tool.usageLimit} requests/month`}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2 ml-4">
                {tool.enabled && tool.requiresApiKey && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setConfigTool(tool)
                      setTempApiKey(tool.apiKey || "")
                      setTempUsageLimit(tool.usageLimit)
                    }}
                  >
                    Configure
                  </Button>
                )}
                <Switch
                  checked={tool.enabled}
                  onCheckedChange={(checked) => handleToggleTool(tool.id, checked)}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Configuration Dialog */}
      <Dialog open={!!configTool} onOpenChange={(open) => !open && setConfigTool(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Configure {configTool?.name}</DialogTitle>
            <DialogDescription>{configTool?.description}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* API Key */}
            <div className="space-y-2">
              <Label htmlFor="apiKey">
                API Key <span className="text-destructive">*</span>
              </Label>
              <div className="flex gap-2">
                <Input
                  id="apiKey"
                  type={showApiKey ? "text" : "password"}
                  value={tempApiKey}
                  onChange={(e) => setTempApiKey(e.target.value)}
                  placeholder="sk-..."
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setShowApiKey(!showApiKey)}
                >
                  {showApiKey ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Get your API key from the provider's dashboard
              </p>
            </div>

            {/* Usage Limit */}
            <div className="space-y-2">
              <Label htmlFor="usageLimit">Monthly Usage Limit (optional)</Label>
              <Input
                id="usageLimit"
                type="number"
                value={tempUsageLimit || ""}
                onChange={(e) =>
                  setTempUsageLimit(parseInt(e.target.value) || undefined)
                }
                placeholder="e.g., 1000"
              />
              <p className="text-xs text-muted-foreground">
                Set a limit to control API costs. Leave empty for unlimited.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setConfigTool(null)}>
              Cancel
            </Button>
            <Button onClick={handleSaveConfig} disabled={!tempApiKey.trim()}>
              Save Configuration
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Actions */}
      <div className="flex justify-between pt-4">
        {onSkip && (
          <Button type="button" variant="ghost" onClick={onSkip}>
            Skip for now
          </Button>
        )}
        <Button onClick={handleSaveAll} className="ml-auto">
          {enabledCount > 0
            ? `Save ${enabledCount} AI Tool${enabledCount > 1 ? "s" : ""}`
            : "Continue Without AI Tools"}
        </Button>
      </div>
    </div>
  )
}
