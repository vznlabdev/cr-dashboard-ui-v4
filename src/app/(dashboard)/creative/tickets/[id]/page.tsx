"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  Download, 
  MessageSquare, 
  Paperclip,
  User,
  CheckCircle2,
  XCircle,
  Send,
  Upload,
  MoreHorizontal,
  ExternalLink,
  BarChart3,
  Share2,
  ShoppingCart,
  Mail,
  Palette,
  FileText,
  Presentation,
  Globe,
  Layout,
  Shirt,
  Package,
  Image,
  Store,
  CreditCard,
  Tag,
  Sparkles,
  LucideIcon,
} from "lucide-react"

// Map icon names to Lucide components
const DESIGN_TYPE_ICONS: Record<string, LucideIcon> = {
  BarChart3,
  Share2,
  ShoppingCart,
  Mail,
  Palette,
  FileText,
  Presentation,
  Globe,
  Layout,
  Shirt,
  Package,
  Image,
  Store,
  CreditCard,
  Tag,
  Sparkles,
}
import Link from "next/link"
import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { useWorkspace } from "@/contexts/workspace-context"
import { TicketStatusBadge } from "@/components/creative"
import { getTicketById, getBrandById } from "@/lib/mock-data/creative"
import { DESIGN_TYPE_CONFIG, PRIORITY_CONFIG, Ticket, Comment } from "@/types/creative"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function TicketDetailPage() {
  const { setWorkspace } = useWorkspace()
  const params = useParams()
  const ticketId = params.id as string
  
  const [ticket, setTicket] = useState<Ticket | null>(null)
  const [newComment, setNewComment] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setWorkspace("creative")
  }, [setWorkspace])

  useEffect(() => {
    // Simulate loading ticket data
    const loadTicket = async () => {
      setIsLoading(true)
      await new Promise((resolve) => setTimeout(resolve, 300))
      const foundTicket = getTicketById(ticketId)
      setTicket(foundTicket || null)
      setIsLoading(false)
    }
    loadTicket()
  }, [ticketId])

  const handleAddComment = () => {
    if (!newComment.trim() || !ticket) return

    const comment: Comment = {
      id: `c-${Date.now()}`,
      content: newComment,
      authorId: "current-user",
      authorName: "You",
      createdAt: new Date(),
    }

    setTicket({
      ...ticket,
      comments: [...ticket.comments, comment],
    })
    setNewComment("")
    toast.success("Comment added")
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(date))
  }

  const formatDateTime = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(new Date(date))
  }

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-muted rounded animate-pulse" />
          <div className="space-y-2">
            <div className="w-64 h-6 bg-muted rounded animate-pulse" />
            <div className="w-48 h-4 bg-muted rounded animate-pulse" />
          </div>
        </div>
        <div className="w-full h-96 bg-muted rounded animate-pulse" />
      </div>
    )
  }

  if (!ticket) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <XCircle className="h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-xl font-medium mb-2">Ticket not found</h2>
        <p className="text-muted-foreground mb-4">
          The ticket you're looking for doesn't exist or has been removed.
        </p>
        <Link href="/creative/tickets">
          <Button>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Tickets
          </Button>
        </Link>
      </div>
    )
  }

  const designType = DESIGN_TYPE_CONFIG[ticket.designType]
  const DesignIcon = DESIGN_TYPE_ICONS[designType.iconName] || FileText
  const priority = PRIORITY_CONFIG[ticket.priority]
  const brand = getBrandById(ticket.brandId)
  const isOverdue = ticket.dueDate && new Date(ticket.dueDate) < new Date() && ticket.status !== "delivered"

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <Link href="/creative/tickets">
            <Button variant="ghost" size="icon" className="mt-1">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold tracking-tight">{ticket.title}</h1>
              <TicketStatusBadge status={ticket.status} size="md" />
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <DesignIcon className="h-4 w-4" />
                {designType.label}
              </span>
              {brand && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1.5">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: brand.colors[0]?.hex }}
                    />
                    {brand.name}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 ml-14 sm:ml-0">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => toast.info("Edit coming soon")}>
                Edit Ticket
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => toast.info("Duplicate coming soon")}>
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-destructive"
                onClick={() => toast.info("Delete coming soon")}
              >
                Delete Ticket
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-wrap">{ticket.description}</p>
              
              {ticket.targetAudience && (
                <div className="mt-4 pt-4 border-t">
                  <h4 className="text-sm font-medium mb-1">Target Audience</h4>
                  <p className="text-sm text-muted-foreground">{ticket.targetAudience}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Versions */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Versions</CardTitle>
                <CardDescription>
                  {ticket.versions.length} version{ticket.versions.length !== 1 ? "s" : ""} uploaded
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => toast.info("Upload coming soon")}>
                <Upload className="mr-2 h-4 w-4" />
                Upload
              </Button>
            </CardHeader>
            <CardContent>
              {ticket.versions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center border-2 border-dashed rounded-lg">
                  <Paperclip className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">No versions uploaded yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {ticket.versions.map((version, index) => (
                    <div
                      key={version.id}
                      className={cn(
                        "flex items-center justify-between p-3 rounded-lg border",
                        index === 0 && "bg-primary/5 border-primary/20"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-muted rounded flex items-center justify-center text-sm font-medium">
                          V{version.number}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{version.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDateTime(version.uploadedAt)}
                            {version.notes && ` • ${version.notes}`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {index === 0 && (
                          <Badge variant="secondary" className="text-xs">Latest</Badge>
                        )}
                        <Button variant="ghost" size="icon" onClick={() => toast.info("Download coming soon")}>
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => toast.info("Preview coming soon")}>
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Comments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Comments ({ticket.comments.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Comment List */}
              {ticket.comments.length > 0 && (
                <div className="space-y-4">
                  {ticket.comments.map((comment) => (
                    <div key={comment.id} className="flex gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs bg-primary/10">
                          {getInitials(comment.authorName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium">{comment.authorName}</span>
                          <span className="text-xs text-muted-foreground">
                            {formatDateTime(comment.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm">{comment.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Add Comment */}
              <div className="flex gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs bg-primary/10">JD</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  <Textarea
                    placeholder="Add a comment..."
                    rows={3}
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                  />
                  <div className="flex justify-end">
                    <Button 
                      size="sm" 
                      onClick={handleAddComment}
                      disabled={!newComment.trim()}
                    >
                      <Send className="mr-2 h-4 w-4" />
                      Comment
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Status */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                <TicketStatusBadge status={ticket.status} size="sm" />
              </div>

              {/* Priority */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Priority</span>
                <Badge
                  variant="secondary"
                  className={cn(priority.bgColor, priority.color, "border-0")}
                >
                  {priority.label}
                </Badge>
              </div>

              <Separator />

              {/* Assignee */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Assignee</span>
                {ticket.assigneeName ? (
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-[10px] bg-primary/10">
                        {getInitials(ticket.assigneeName)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{ticket.assigneeName}</span>
                  </div>
                ) : (
                  <span className="text-sm text-muted-foreground">Unassigned</span>
                )}
              </div>

              {/* Due Date */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Due Date</span>
                {ticket.dueDate ? (
                  <span className={cn("text-sm", isOverdue && "text-red-500")}>
                    {formatDate(ticket.dueDate)}
                  </span>
                ) : (
                  <span className="text-sm text-muted-foreground">No due date</span>
                )}
              </div>

              <Separator />

              {/* Time */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Estimated</span>
                <span className="text-sm">
                  {ticket.estimatedHours ? `${ticket.estimatedHours}h` : "Not set"}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Tracked</span>
                <span className="text-sm">{ticket.trackedTime}h</span>
              </div>

              <Separator />

              {/* Created */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Created</span>
                <span className="text-sm">{formatDate(ticket.createdAt)}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">By</span>
                <span className="text-sm">{ticket.createdByName}</span>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {ticket.status === "submitted" && (
                <Button 
                  className="w-full" 
                  variant="outline"
                  onClick={() => toast.info("Start assessment coming soon")}
                >
                  Start Assessment
                </Button>
              )}
              {ticket.status === "assessment" && (
                <Button 
                  className="w-full"
                  onClick={() => toast.info("Assign coming soon")}
                >
                  Assign to Designer
                </Button>
              )}
              {ticket.status === "production" && (
                <Button 
                  className="w-full"
                  onClick={() => toast.info("Submit for QA coming soon")}
                >
                  Submit for QA
                </Button>
              )}
              {ticket.status === "qa_review" && (
                <>
                  <Button 
                    className="w-full"
                    onClick={() => toast.info("Approve coming soon")}
                  >
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Approve & Deliver
                  </Button>
                  <Button 
                    className="w-full" 
                    variant="outline"
                    onClick={() => toast.info("Request revision coming soon")}
                  >
                    Request Revision
                  </Button>
                </>
              )}
              {ticket.status === "delivered" && (
                <div className="text-center py-4">
                  <CheckCircle2 className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">This ticket has been delivered</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Project Tag */}
          {ticket.projectTag && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Project:</span>
                  <Badge variant="outline">{ticket.projectTag}</Badge>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

