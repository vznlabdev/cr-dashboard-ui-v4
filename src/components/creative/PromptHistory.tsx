"use client"

import { PromptHistory as PromptHistoryType, PromptMessage } from "@/types/creative"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { User, Bot, Copy, Check } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface PromptHistoryProps {
  history: PromptHistoryType
  className?: string
}

export function PromptHistory({ history, className }: PromptHistoryProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const handleCopy = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedId(id)
      toast.success("Copied to clipboard")
      setTimeout(() => setCopiedId(null), 2000)
    } catch (err) {
      toast.error("Failed to copy")
    }
  }

  if (!history.messages || history.messages.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Prompt History</CardTitle>
          <CardDescription>AI generation conversation history</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>No prompt history available for this asset.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Prompt History</CardTitle>
            <CardDescription>AI generation conversation history</CardDescription>
          </div>
          {history.aiTool && (
            <Badge variant="outline">
              {history.aiTool} {history.modelVersion && `v${history.modelVersion}`}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Generation Info */}
          {(history.aiTool || history.generationDate) && (
            <div className="flex flex-wrap gap-4 pb-4 border-b text-sm text-muted-foreground">
              {history.aiTool && (
                <div>
                  <span className="font-medium">AI Tool:</span> {history.aiTool}
                  {history.modelVersion && ` ${history.modelVersion}`}
                </div>
              )}
              {history.generationDate && (
                <div>
                  <span className="font-medium">Generated:</span>{" "}
                  {format(history.generationDate, "MMM d, yyyy 'at' h:mm a")}
                </div>
              )}
            </div>
          )}

          {/* Messages */}
          <div className="space-y-4 max-h-[600px] overflow-y-auto">
            {history.messages.map((message) => (
              <MessageBubble key={message.id} message={message} onCopy={handleCopy} copiedId={copiedId} />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface MessageBubbleProps {
  message: PromptMessage
  onCopy: (text: string, id: string) => void
  copiedId: string | null
}

function MessageBubble({ message, onCopy, copiedId }: MessageBubbleProps) {
  const isUser = message.role === "user"
  const isSystem = message.role === "system"

  return (
    <div
      className={cn(
        "flex gap-3",
        isUser ? "flex-row-reverse" : "flex-row",
        isSystem && "justify-center"
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          "h-8 w-8 rounded-full flex items-center justify-center shrink-0",
          isUser
            ? "bg-primary text-primary-foreground"
            : isSystem
              ? "bg-muted text-muted-foreground"
              : "bg-secondary text-secondary-foreground"
        )}
      >
        {isUser ? (
          <User className="h-4 w-4" />
        ) : isSystem ? (
          <Bot className="h-4 w-4" />
        ) : (
          <Bot className="h-4 w-4" />
        )}
      </div>

      {/* Message Content */}
      <div className={cn("flex-1 max-w-[80%]", isSystem && "max-w-full")}>
        <div
          className={cn(
            "rounded-lg p-4",
            isUser
              ? "bg-primary text-primary-foreground"
              : isSystem
                ? "bg-muted/50 border"
                : "bg-muted"
          )}
        >
          {/* Message Header */}
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium opacity-80">
                {isUser ? "You" : isSystem ? "System" : "AI Assistant"}
              </span>
              {message.model && (
                <Badge variant="outline" className="text-xs">
                  {message.model}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs opacity-70">
                {format(message.timestamp, "h:mm a")}
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 opacity-70 hover:opacity-100"
                onClick={() => onCopy(message.content, message.id)}
              >
                {copiedId === message.id ? (
                  <Check className="h-3 w-3" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </Button>
            </div>
          </div>

          {/* Message Text */}
          <div className={cn("text-sm whitespace-pre-wrap", isUser && "text-primary-foreground")}>
            {message.content}
          </div>

          {/* Parameters */}
          {message.parameters && Object.keys(message.parameters).length > 0 && (
            <div className="mt-3 pt-3 border-t border-opacity-20">
              <div className="text-xs opacity-70 space-y-1">
                {Object.entries(message.parameters).map(([key, value]) => (
                  <div key={key} className="flex gap-2">
                    <span className="font-medium">{key}:</span>
                    <span>{String(value)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

