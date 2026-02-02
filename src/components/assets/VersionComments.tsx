"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { VersionComment } from "@/types/creative"
import { formatDistanceToNow } from "date-fns"
import { Send, Reply } from "lucide-react"

interface VersionCommentsProps {
  comments: VersionComment[]
  onAddComment: (content: string, parentId?: string) => Promise<void>
  currentUserId?: string
}

export function VersionComments({
  comments,
  onAddComment,
  currentUserId,
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
      <div key={comment.id} className={isReply ? "ml-12" : ""}>
        <div className="flex gap-3">
          <Avatar className="h-8 w-8 flex-shrink-0">
            <AvatarFallback className="text-xs">
              {getInitials(comment.authorName)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-1">
            <div className="flex items-baseline gap-2">
              <span className="text-sm font-medium">{comment.authorName}</span>
              <span className="text-xs text-muted-foreground">
                {comment.authorRole}
              </span>
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(comment.createdAt, { addSuffix: true })}
              </span>
            </div>

            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {comment.content}
            </p>

            {comment.annotationX !== undefined && comment.annotationY !== undefined && (
              <div className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                📍 Annotation at ({Math.round(comment.annotationX)}%, {Math.round(comment.annotationY)}%)
              </div>
            )}

            <div className="flex items-center gap-2 pt-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={() => setReplyTo(comment.id)}
              >
                <Reply className="h-3 w-3 mr-1" />
                Reply
              </Button>
            </div>

            {replyTo === comment.id && (
              <div className="mt-2 space-y-2">
                <Textarea
                  placeholder="Write a reply..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  rows={2}
                  className="resize-none"
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={handleSubmit}
                    disabled={!newComment.trim() || isSubmitting}
                  >
                    {isSubmitting ? "Sending..." : "Send Reply"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
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
          <div className="mt-4 space-y-4">
            {replies.map(reply => renderComment(reply, true))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Comment input */}
      {!replyTo && (
        <div className="space-y-3">
          <Textarea
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            rows={3}
            className="resize-none"
          />
          <Button
            onClick={handleSubmit}
            disabled={!newComment.trim() || isSubmitting}
            size="sm"
          >
            <Send className="h-3.5 w-3.5 mr-2" />
            {isSubmitting ? "Sending..." : "Post Comment"}
          </Button>
        </div>
      )}

      {/* Comments list */}
      <div className="space-y-6">
        {topLevelComments.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No comments yet. Be the first to comment!
          </p>
        ) : (
          topLevelComments.map(comment => renderComment(comment))
        )}
      </div>
    </div>
  )
}
