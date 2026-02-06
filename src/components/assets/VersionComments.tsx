"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { VersionComment } from "@/types/creative"
import { formatDistanceToNow } from "date-fns"
import { Send, Reply } from "lucide-react"
import { cn } from "@/lib/utils"

interface VersionCommentsProps {
  comments: VersionComment[]
  onAddComment: (content: string, parentId?: string) => Promise<void>
  currentUserId?: string
  compact?: boolean
}

export function VersionComments({
  comments,
  onAddComment,
  currentUserId,
  compact = false,
}: VersionCommentsProps) {
  const [newComment, setNewComment] = useState("")
  const [replyTo, setReplyTo] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Organize comments into threads
  const topLevelComments = comments.filter(c => !c.parentCommentId)
  
  const getReplies = (commentId: string): VersionComment[] => {
    return comments.filter(c => c.parentCommentId === commentId)
  }

  const handleSubmit = async () => {
    if (!newComment.trim()) return

    setIsSubmitting(true)
    try {
      await onAddComment(newComment.trim(), replyTo || undefined)
      setNewComment("")
      setReplyTo(null)
    } catch (error) {
      console.error("Failed to add comment:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const renderComment = (comment: VersionComment, isReply = false) => {
    const replies = getReplies(comment.id)

    return (
      <div key={comment.id} className={isReply ? (compact ? "ml-8" : "ml-12") : ""}>
        <div className={cn("flex", compact ? "gap-2" : "gap-3")}>
          <Avatar className={cn("flex-shrink-0", compact ? "h-6 w-6" : "h-8 w-8")}>
            <AvatarFallback className={compact ? "text-[10px]" : "text-xs"}>
              {getInitials(comment.authorName)}
            </AvatarFallback>
          </Avatar>

          <div className={cn("flex-1", compact ? "space-y-0.5" : "space-y-1")}>
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className={compact ? "text-xs font-medium" : "text-sm font-medium"}>{comment.authorName}</span>
              <span className={compact ? "text-[10px] text-muted-foreground" : "text-xs text-muted-foreground"}>
                {comment.authorRole}
              </span>
              <span className={compact ? "text-[10px] text-muted-foreground" : "text-xs text-muted-foreground"}>
                {formatDistanceToNow(comment.createdAt, { addSuffix: true })}
              </span>
            </div>

            <p className={cn("text-muted-foreground whitespace-pre-wrap", compact ? "text-xs" : "text-sm")}>
              {comment.content}
            </p>

            {comment.annotationX !== undefined && comment.annotationY !== undefined && (
              <div className={cn("inline-flex items-center gap-1 text-muted-foreground bg-muted rounded", compact ? "text-[10px] px-1.5 py-0.5" : "text-xs px-2 py-1")}>
                📍 Annotation at ({Math.round(comment.annotationX)}%, {Math.round(comment.annotationY)}%)
              </div>
            )}

            <div className={cn("flex items-center gap-2", compact ? "pt-0.5" : "pt-1")}>
              <Button
                variant="ghost"
                size="sm"
                className={compact ? "h-6 text-[10px] px-1.5" : "h-7 text-xs"}
                onClick={() => setReplyTo(comment.id)}
              >
                <Reply className={compact ? "h-2.5 w-2.5 mr-0.5" : "h-3 w-3 mr-1"} />
                Reply
              </Button>
            </div>

            {replyTo === comment.id && (
              <div className={compact ? "mt-1.5 space-y-1.5" : "mt-2 space-y-2"}>
                <Textarea
                  placeholder="Write a reply..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  rows={compact ? 1 : 2}
                  className="resize-none text-xs"
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className={compact ? "h-6 text-xs" : ""}
                    onClick={handleSubmit}
                    disabled={!newComment.trim() || isSubmitting}
                  >
                    {isSubmitting ? "Sending..." : "Send Reply"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className={compact ? "h-6 text-xs" : ""}
                    onClick={() => {
                      setReplyTo(null)
                      setNewComment("")
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Render replies */}
        {replies.length > 0 && (
          <div className={compact ? "mt-2 space-y-2" : "mt-4 space-y-4"}>
            {replies.map(reply => renderComment(reply, true))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={compact ? "space-y-3" : "space-y-6"}>
      {/* Comment input */}
      {!replyTo && (
        <div className={compact ? "space-y-2" : "space-y-3"}>
          <Textarea
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            rows={compact ? 2 : 3}
            className={cn("resize-none", compact && "text-xs min-h-[60px]")}
          />
          <Button
            onClick={handleSubmit}
            disabled={!newComment.trim() || isSubmitting}
            size="sm"
            className={compact ? "h-7 text-xs" : ""}
          >
            <Send className={compact ? "h-3 w-3 mr-1.5" : "h-3.5 w-3.5 mr-2"} />
            {isSubmitting ? "Sending..." : "Post Comment"}
          </Button>
        </div>
      )}

      {/* Comments list */}
      <div className={compact ? "space-y-3" : "space-y-6"}>
        {topLevelComments.length === 0 ? (
          <p className={cn("text-muted-foreground text-center", compact ? "text-xs py-4" : "text-sm py-8")}>
            No comments yet. Be the first to comment!
          </p>
        ) : (
          topLevelComments.map(comment => renderComment(comment))
        )}
      </div>
    </div>
  )
}
