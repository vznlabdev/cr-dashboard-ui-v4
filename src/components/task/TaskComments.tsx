"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { MessageSquare, Send, Smile, X } from "lucide-react"
import { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

// Enhanced Comment interface with mentions and reactions
export interface TaskComment {
  id: string
  content: string
  authorId: string
  authorName: string
  authorInitials?: string
  createdAt: Date
  mentions?: string[] // Array of mentioned user IDs
  reactions?: CommentReaction[]
  // Clearance system comment fields
  isSystemComment?: boolean
  clearanceType?: 'admin' | 'legal' | 'qa'
  clearanceReason?: string
  linkedAsset?: string
  linkedAssetId?: string
}

export interface CommentReaction {
  emoji: string
  userId: string
  userName: string
}

export interface TeamMember {
  id: string
  name: string
  initials: string
  avatarColor?: string
}

interface TaskCommentsProps {
  comments: TaskComment[]
  currentUserId: string
  currentUserInitials: string
  teamMembers: TeamMember[]
  onAddComment: (content: string, mentions: string[]) => void
  onAddReaction: (commentId: string, emoji: string) => void
  onRemoveReaction: (commentId: string, emoji: string) => void
}

// Common reaction emojis
const QUICK_REACTIONS = ['👍', '🎉', '❤️', '😄', '🚀', '👀', '🔥', '✅']

export function TaskComments({
  comments,
  currentUserId,
  currentUserInitials,
  teamMembers,
  onAddComment,
  onAddReaction,
  onRemoveReaction,
}: TaskCommentsProps) {
  const [newComment, setNewComment] = useState("")
  const [showMentions, setShowMentions] = useState(false)
  const [mentionSearch, setMentionSearch] = useState("")
  const [mentionPosition, setMentionPosition] = useState({ top: 0, left: 0 })
  const [selectedMentionIndex, setSelectedMentionIndex] = useState(0)
  const [selectedMentions, setSelectedMentions] = useState<string[]>([])
  const [showReactionPicker, setShowReactionPicker] = useState<string | null>(null)
  
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const mentionDropdownRef = useRef<HTMLDivElement>(null)

  // Format date/time (Linear style)
  const formatDateTime = (date: Date) => {
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
    
    if (diffInSeconds < 60) return 'just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  // Get initials from name
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  // Filter team members based on mention search
  const filteredMembers = teamMembers.filter(member =>
    member.name.toLowerCase().includes(mentionSearch.toLowerCase())
  )

  // Handle textarea input for @mentions
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    setNewComment(value)

    // Check for @ mention trigger
    const cursorPosition = e.target.selectionStart
    const textBeforeCursor = value.slice(0, cursorPosition)
    const words = textBeforeCursor.split(/\s/)
    const currentWord = words[words.length - 1]

    if (currentWord.startsWith('@')) {
      const search = currentWord.slice(1)
      setMentionSearch(search)
      setShowMentions(true)
      setSelectedMentionIndex(0)

      // Calculate dropdown position
      if (textareaRef.current) {
        const coords = getCaretCoordinates(textareaRef.current, cursorPosition)
        setMentionPosition({
          top: coords.top + 20,
          left: coords.left
        })
      }
    } else {
      setShowMentions(false)
    }
  }

  // Simple caret position calculation
  const getCaretCoordinates = (element: HTMLTextAreaElement, position: number) => {
    return { top: 0, left: 0 } // Simplified for now
  }

  // Insert mention
  const insertMention = (member: TeamMember) => {
    const cursorPosition = textareaRef.current?.selectionStart || 0
    const textBeforeCursor = newComment.slice(0, cursorPosition)
    const textAfterCursor = newComment.slice(cursorPosition)
    
    // Replace the @search with @name
    const words = textBeforeCursor.split(/\s/)
    words[words.length - 1] = `@${member.name}`
    const newText = words.join(' ') + ' ' + textAfterCursor
    
    setNewComment(newText)
    setShowMentions(false)
    setSelectedMentions([...selectedMentions, member.id])
    
    // Refocus textarea
    textareaRef.current?.focus()
  }

  // Handle keyboard navigation in mention dropdown
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!showMentions) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedMentionIndex((prev) =>
        prev < filteredMembers.length - 1 ? prev + 1 : prev
      )
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedMentionIndex((prev) => (prev > 0 ? prev - 1 : 0))
    } else if (e.key === 'Enter' && filteredMembers.length > 0) {
      e.preventDefault()
      insertMention(filteredMembers[selectedMentionIndex])
    } else if (e.key === 'Escape') {
      setShowMentions(false)
    }
  }

  // Handle add comment
  const handleAddComment = () => {
    if (!newComment.trim()) return
    
    onAddComment(newComment, selectedMentions)
    setNewComment("")
    setSelectedMentions([])
    toast.success("Comment added")
  }

  // Handle reaction toggle
  const handleReactionClick = (commentId: string, emoji: string) => {
    const comment = comments.find(c => c.id === commentId)
    const userReaction = comment?.reactions?.find(
      r => r.emoji === emoji && r.userId === currentUserId
    )

    if (userReaction) {
      onRemoveReaction(commentId, emoji)
    } else {
      onAddReaction(commentId, emoji)
    }
    setShowReactionPicker(null)
  }

  // Group reactions by emoji
  const groupReactions = (reactions?: CommentReaction[]) => {
    if (!reactions) return []
    
    const grouped = reactions.reduce((acc, reaction) => {
      const existing = acc.find(r => r.emoji === reaction.emoji)
      if (existing) {
        existing.count++
        existing.users.push(reaction.userName)
        existing.hasCurrentUser = existing.hasCurrentUser || reaction.userId === currentUserId
      } else {
        acc.push({
          emoji: reaction.emoji,
          count: 1,
          users: [reaction.userName],
          hasCurrentUser: reaction.userId === currentUserId
        })
      }
      return acc
    }, [] as Array<{ emoji: string; count: number; users: string[]; hasCurrentUser: boolean }>)
    
    return grouped
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <MessageSquare className="h-4 w-4 text-muted-foreground" />
        <h3 className="text-sm font-semibold">Activity</h3>
        <span className="text-xs text-muted-foreground">
          {comments.length} {comments.length === 1 ? 'comment' : 'comments'}
        </span>
      </div>

      {/* Comment List */}
      <div className="space-y-6">
        {comments.map((comment) => {
          const groupedReactions = groupReactions(comment.reactions)
          
          return (
            <div key={comment.id} className="group">
              <div className="flex gap-3">
                {/* Avatar */}
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarFallback className="text-xs bg-accent text-foreground">
                    {comment.authorInitials || getInitials(comment.authorName)}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  {/* Header */}
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium">{comment.authorName}</span>
                    <span className="text-xs text-muted-foreground">
                      {formatDateTime(comment.createdAt)}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                    {comment.content}
                  </div>

                  {/* Reactions */}
                  {groupedReactions.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 mt-2">
                      {groupedReactions.map((reaction) => (
                        <button
                          key={reaction.emoji}
                          onClick={() => handleReactionClick(comment.id, reaction.emoji)}
                          className={cn(
                            "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs transition-colors",
                            reaction.hasCurrentUser
                              ? "bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800"
                              : "bg-accent hover:bg-accent/80 border border-transparent"
                          )}
                          title={reaction.users.join(', ')}
                        >
                          <span>{reaction.emoji}</span>
                          <span className={cn(
                            "font-medium",
                            reaction.hasCurrentUser ? "text-blue-700 dark:text-blue-400" : "text-muted-foreground"
                          )}>
                            {reaction.count}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Reaction Picker */}
                  <div className="flex items-center gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="relative">
                      <button
                        onClick={() => setShowReactionPicker(showReactionPicker === comment.id ? null : comment.id)}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                        title="Add reaction"
                      >
                        <Smile className="h-3.5 w-3.5" />
                      </button>

                      {/* Quick Reactions Dropdown */}
                      {showReactionPicker === comment.id && (
                        <div className="absolute left-0 top-6 z-50 bg-popover border border-border rounded-lg shadow-lg p-2">
                          <div className="flex gap-1">
                            {QUICK_REACTIONS.map((emoji) => (
                              <button
                                key={emoji}
                                onClick={() => handleReactionClick(comment.id, emoji)}
                                className="p-2 hover:bg-accent rounded transition-colors text-lg"
                              >
                                {emoji}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Add Comment - Linear Style */}
      <div className="flex gap-3 pt-2">
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarFallback className="text-xs bg-accent text-foreground">
            {currentUserInitials}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            placeholder="Add a comment... (type @ to mention)"
            value={newComment}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            rows={3}
            className="text-sm resize-none"
          />

          {/* Mention Dropdown */}
          {showMentions && filteredMembers.length > 0 && (
            <div
              ref={mentionDropdownRef}
              className="absolute z-50 mt-1 w-64 bg-popover border border-border rounded-lg shadow-lg overflow-hidden"
              style={{ top: mentionPosition.top, left: mentionPosition.left }}
            >
              {filteredMembers.map((member, index) => (
                <button
                  key={member.id}
                  onClick={() => insertMention(member)}
                  className={cn(
                    "w-full flex items-center gap-2 px-3 py-2 text-left text-sm hover:bg-accent transition-colors",
                    index === selectedMentionIndex && "bg-accent"
                  )}
                >
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-xs bg-accent/50">
                      {member.initials}
                    </AvatarFallback>
                  </Avatar>
                  <span>{member.name}</span>
                </button>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between mt-2">
            <div className="text-xs text-muted-foreground">
              Tip: Type <kbd className="px-1 py-0.5 rounded bg-accent text-xs">@</kbd> to mention someone
            </div>
            <Button
              size="sm"
              onClick={handleAddComment}
              disabled={!newComment.trim()}
              className="gap-2"
            >
              <Send className="h-3.5 w-3.5" />
              Comment
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
