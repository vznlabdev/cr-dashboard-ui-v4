"use client";

import { useState } from "react";
import { MessageCircle, Send, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { FrameComment as FrameCommentType } from "@/types/storyboard";

function relativeTime(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffM = Math.floor(diffMs / 60000);
  const diffH = Math.floor(diffMs / 3600000);
  const diffD = Math.floor(diffMs / 86400000);
  if (diffM < 1) return "Just now";
  if (diffM < 60) return `${diffM}m ago`;
  if (diffH < 24) return `${diffH}h ago`;
  if (diffD === 1) return "Yesterday";
  if (diffD < 7) return `${diffD}d ago`;
  return d.toLocaleDateString();
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .map((s) => s[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export interface FrameCommentsProps {
  storyboardId: string;
  frameId: string;
  frameNumber: number;
  comments: FrameCommentType[];
  onAddComment: (text: string, frameId: string, parentId?: string) => void;
  onResolve: (commentId: string) => void;
}

export function FrameComments({
  frameId,
  frameNumber,
  comments,
  onAddComment,
  onResolve,
}: FrameCommentsProps) {
  const [newText, setNewText] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  const rootComments = comments.filter((c) => !c.parentId);
  const getReplies = (parentId: string) =>
    comments.filter((c) => c.parentId === parentId);

  const handleSend = () => {
    const t = newText.trim();
    if (t) {
      onAddComment(t, frameId);
      setNewText("");
    }
  };

  const handleSendReply = () => {
    const t = replyText.trim();
    if (t && replyingTo) {
      onAddComment(t, frameId, replyingTo);
      setReplyText("");
      setReplyingTo(null);
    }
  };

  return (
    <div className="flex flex-col h-full max-h-[400px] min-w-[320px]">
      <div className="shrink-0 flex items-center gap-2 px-4 py-3 border-b border-border">
        <MessageCircle className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">Comments · Frame {frameNumber}</span>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {rootComments.length === 0 && (
          <p className="text-sm text-muted-foreground py-4">No comments yet.</p>
        )}
        {rootComments.map((comment) => {
          const replies = getReplies(comment.id);
          return (
            <CommentBlock
              key={comment.id}
              comment={comment}
              replies={replies}
              onResolve={onResolve}
              onReply={() => setReplyingTo(comment.id)}
              replyingTo={replyingTo === comment.id}
              replyText={replyText}
              setReplyText={setReplyText}
              onSendReply={handleSendReply}
              onCancelReply={() => {
                setReplyingTo(null);
                setReplyText("");
              }}
            />
          );
        })}
      </div>

      <div className="shrink-0 border-t border-border px-4 py-3 space-y-2">
        <Textarea
          placeholder="Type a comment... @mention a collaborator"
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          className="min-h-[72px] resize-none"
        />
        <Button size="sm" onClick={handleSend} disabled={!newText.trim()}>
          <Send className="h-4 w-4 mr-1" /> Send
        </Button>
      </div>
    </div>
  );
}

function CommentBlock({
  comment,
  replies,
  onResolve,
  onReply,
  replyingTo,
  replyText,
  setReplyText,
  onSendReply,
  onCancelReply,
}: {
  comment: FrameCommentType;
  replies: FrameCommentType[];
  onResolve: (commentId: string) => void;
  onReply: () => void;
  replyingTo: boolean;
  replyText: string;
  setReplyText: (v: string) => void;
  onSendReply: () => void;
  onCancelReply: () => void;
}) {
  return (
    <div className={cn("space-y-1", comment.isResolved && "opacity-80")}>
      {comment.isResolved && (
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <Check className="h-3.5 w-3.5 text-emerald-600" /> Resolved
        </p>
      )}
      <div className="flex gap-2">
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarImage src={comment.authorAvatar} />
          <AvatarFallback className="text-[10px]">
            {initials(comment.authorName)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="text-xs text-muted-foreground">
            {comment.authorName} · {relativeTime(comment.createdAt)}
          </p>
          <p className="text-sm mt-0.5 whitespace-pre-wrap">{comment.text}</p>
          {comment.isResolved && comment.resolvedBy && (
            <p className="text-[10px] text-muted-foreground mt-1">
              Resolved by {comment.resolvedBy}
              {comment.resolvedAt && ` · ${relativeTime(comment.resolvedAt)}`}
            </p>
          )}
          {!comment.isResolved && (
            <div className="flex gap-2 mt-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={onReply}
              >
                Reply
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={() => onResolve(comment.id)}
              >
                Resolve
              </Button>
            </div>
          )}
        </div>
      </div>

      {replies.map((reply) => (
        <div key={reply.id} className="pl-10 flex gap-2 border-l-2 border-muted ml-4">
          <Avatar className="h-6 w-6 shrink-0">
            <AvatarImage src={reply.authorAvatar} />
            <AvatarFallback className="text-[9px]">
              {initials(reply.authorName)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="text-xs text-muted-foreground">
              {reply.authorName} · {relativeTime(reply.createdAt)}
            </p>
            <p className="text-sm mt-0.5 whitespace-pre-wrap">{reply.text}</p>
          </div>
        </div>
      ))}

      {replyingTo && (
        <div className="pl-10 mt-2 space-y-1">
          <Textarea
            placeholder="Write a reply..."
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            className="min-h-[60px] resize-none text-sm"
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={onSendReply} disabled={!replyText.trim()}>
              Send
            </Button>
            <Button size="sm" variant="ghost" onClick={onCancelReply}>
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
