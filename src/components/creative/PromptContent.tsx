"use client"

import { PromptHistory as PromptHistoryType } from "@/types/creative"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { format } from "date-fns"
import { Copy, Check, Settings, Sparkles, Calendar } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

interface PromptContentProps {
  history: PromptHistoryType
  className?: string
}

export function PromptContent({ history, className }: PromptContentProps) {
  const [copied, setCopied] = useState(false)

  // Get the last user prompt and its parameters
  const lastUserPrompt = history.messages
    ?.filter((msg) => msg.role === "user")
    .slice(-1)[0]

  // Get parameters from the last assistant message (usually contains generation params)
  const lastAssistantMessage = history.messages
    ?.filter((msg) => msg.role === "assistant")
    .slice(-1)[0]

  const parameters = lastAssistantMessage?.parameters || {}

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      toast.success("Copied to clipboard")
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      toast.error("Failed to copy")
    }
  }

  if (!lastUserPrompt) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Generation Details</CardTitle>
          <CardDescription>AI generation information for this asset</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>No generation details available for this asset.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Generation Details</CardTitle>
        <CardDescription>AI generation information for this asset</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Prompt Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Prompt</label>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2"
              onClick={() => handleCopy(lastUserPrompt.content)}
            >
              {copied ? (
                <>
                  <Check className="h-3 w-3 mr-1" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3 mr-1" />
                  Copy
                </>
              )}
            </Button>
          </div>
          <div className="rounded-lg border bg-muted/30 p-4">
            <p className="text-sm whitespace-pre-wrap leading-relaxed">
              {lastUserPrompt.content}
            </p>
          </div>
        </div>

        {/* Generation Parameters */}
        {Object.keys(parameters).length > 0 && (
          <>
            <Separator />
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4 text-muted-foreground" />
                <label className="text-sm font-medium">Generation Settings</label>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {Object.entries(parameters).map(([key, value]) => (
                  <div key={key} className="space-y-1">
                    <div className="text-xs font-medium text-muted-foreground capitalize">
                      {key.replace(/_/g, " ")}
                    </div>
                    <div className="text-sm">
                      {Array.isArray(value) ? (
                        <div className="flex flex-wrap gap-1">
                          {value.map((item, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {String(item)}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <span className="font-medium">{String(value)}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Metadata */}
        <Separator />
        <div className="grid gap-4 sm:grid-cols-2">
          {history.aiTool && (
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <Sparkles className="h-3 w-3" />
                AI Tool
              </div>
              <div className="text-sm font-medium">
                {history.aiTool}
                {history.modelVersion && (
                  <Badge variant="outline" className="ml-2 text-xs">
                    v{history.modelVersion}
                  </Badge>
                )}
              </div>
            </div>
          )}
          {history.generationDate && (
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <Calendar className="h-3 w-3" />
                Generated
              </div>
              <div className="text-sm font-medium">
                {format(history.generationDate, "MMM d, yyyy 'at' h:mm a")}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

