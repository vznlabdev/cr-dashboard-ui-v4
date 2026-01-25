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
  FileText,
  LucideIcon,
  Zap,
  Target,
  Check,
  ChevronRight,
  Rocket,
  Edit,
  Users,
  Play,
  Link2,
  Archive,
  Copy,
  AlertCircle,
  Eye,
  SkipForward,
  Lock,
} from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { getTaskById, getTaskGroupById } from "@/lib/mock-data/projects-tasks"
import { useData } from "@/contexts/data-context"
import type { Task } from "@/types"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Simple comment interface for tasks
interface Comment {
  id: string
  content: string
  authorId: string
  authorName: string
  createdAt: Date
  // Clearance system comment fields
  isSystemComment?: boolean
  clearanceType?: 'admin' | 'legal' | 'qa'
  clearanceReason?: string
  linkedAsset?: string
  linkedAssetId?: string
}

// Task status badge component
const TaskStatusBadge = ({ status }: { status: Task['status'] }) => {
  const config = {
    submitted: { label: "Submitted", className: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
    assessment: { label: "Assessment", className: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
    assigned: { label: "Assigned", className: "bg-purple-500/20 text-purple-400 border-purple-500/30" },
    production: { label: "Production", className: "bg-orange-500/20 text-orange-400 border-orange-500/30" },
    qa_review: { label: "QA Review", className: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30" },
    delivered: { label: "Delivered", className: "bg-green-500/20 text-green-400 border-green-500/30" },
  }

  const { label, className } = config[status]

  return (
    <Badge variant="outline" className={cn("border", className)}>
      {label}
    </Badge>
  )
}

export default function TaskDetailPage() {
  const params = useParams()
  const router = useRouter()
  const taskId = params.taskId as string
  const projectId = params.id as string
  
  const { getProjectById } = useData()
  const project = getProjectById(projectId)
  
  const [task, setTask] = useState<Task | null>(null)
  const [taskGroup, setTaskGroup] = useState<any>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Load task data
    const loadTask = async () => {
      setIsLoading(true)
      await new Promise((resolve) => setTimeout(resolve, 300))
      const foundTask = getTaskById(taskId)
      setTask(foundTask || null)
      
      if (foundTask) {
        const group = getTaskGroupById(foundTask.taskGroupId)
        setTaskGroup(group || null)
        
        // Mock comments
        setComments([
          {
            id: "c-clearance-1",
            content: "This output must be updated.",
            authorId: "system",
            authorName: "Admin Review",
            createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
            isSystemComment: true,
            clearanceType: "legal",
            clearanceReason: "Font licensing unclear. Need proof of commercial license for typography used.",
            linkedAsset: "typography_guide_v1.pdf",
            linkedAssetId: "asset-123",
          },
          {
            id: "c-1",
            content: "This looks great! Can we adjust the color palette slightly?",
            authorId: "user-1",
            authorName: "Sarah Johnson",
            createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
          },
        ])
      }
      
      setIsLoading(false)
    }
    loadTask()
  }, [taskId])

  const handleAddComment = () => {
    if (!newComment.trim() || !task) return

    const comment: Comment = {
      id: `c-${Date.now()}`,
      content: newComment,
      authorId: "current-user",
      authorName: "You",
      createdAt: new Date(),
    }

    setComments([...comments, comment])
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

  const formatDate = (dateStr: string) => {
    return dateStr // Already formatted in mock data
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

  if (!task || !project) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <XCircle className="h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-xl font-medium mb-2">Task not found</h2>
        <p className="text-muted-foreground mb-4">
          The task you're looking for doesn't exist or has been removed.
        </p>
        <Link href={`/projects/${projectId}/tasks`}>
          <Button>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Tasks
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Breadcrumb */}
      <div className="flex items-center text-xs text-gray-500">
        <Link href="/projects" className="hover:text-gray-300 transition-colors">
          Projects
        </Link>
        <span className="mx-2">/</span>
        <Link href={`/projects/${projectId}`} className="hover:text-gray-300 transition-colors">
          {project.name}
        </Link>
        <span className="mx-2">/</span>
        <Link href={`/projects/${projectId}/tasks`} className="hover:text-gray-300 transition-colors">
          Tasks
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-300 font-medium">{task.title}</span>
      </div>

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <Link href={`/projects/${projectId}/tasks`}>
            <Button variant="ghost" size="icon" className="mt-1">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <h1 className="text-2xl font-bold tracking-tight">{task.title}</h1>
              <TaskStatusBadge status={task.status} />
              
              {/* Mode Badge */}
              {task.mode && task.mode !== "manual" && (
                <Badge 
                  variant="outline"
                  className={cn(
                    "gap-1",
                    task.mode === "generative" && "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800",
                    task.mode === "assisted" && "bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800"
                  )}
                >
                  <Zap className="h-3 w-3" />
                  {task.mode === "generative" ? "AI Generative" : "AI Assisted"}
                </Badge>
              )}
              
              {/* Deliverable Type Badge */}
              {task.deliverableType && (
                <Badge variant="outline" className="bg-gray-50 dark:bg-gray-900/20 text-gray-700 dark:text-gray-400 border-gray-200 dark:border-gray-800">
                  {task.deliverableType}
                </Badge>
              )}
              
              {/* Priority Badge */}
              <Badge
                variant="outline"
                className={cn(
                  "font-medium",
                  task.status === "delivered" && "bg-gray-50 dark:bg-gray-900/20 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-800",
                  task.workstream === "legal" && "bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800",
                  task.workstream === "insurance" && "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800",
                  task.workstream === "creator" && "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800",
                  task.workstream === "general" && "bg-gray-50 dark:bg-gray-900/20 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-800"
                )}
              >
                {task.workstream === "legal" && "High"}
                {task.workstream === "insurance" && "Med"}
                {task.workstream === "creator" && "Med"}
                {task.workstream === "general" && "Low"}
              </Badge>

              {/* Client Visibility Badge */}
              {task.clientVisibility && task.clientVisibility !== "internal" && (
                <Badge 
                  variant="outline"
                  className={cn(
                    "gap-1",
                    task.clientVisibility === "visible" && "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800",
                    task.clientVisibility === "comment" && "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800"
                  )}
                >
                  <Eye className="h-3 w-3" />
                  Client Visible
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5 capitalize">
                {task.workstream}
              </span>
              {taskGroup && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1.5">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: taskGroup.color }}
                    />
                    {taskGroup.name}
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
                Edit Task
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => toast.info("Duplicate coming soon")}>
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-destructive"
                onClick={() => toast.info("Delete coming soon")}
              >
                Delete Task
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
              <p className="text-sm text-muted-foreground">
                {task.description || 'No description provided'}
              </p>
              
              {taskGroup?.description && (
                <div className="mt-4 pt-4 border-t">
                  <h4 className="text-sm font-medium mb-1">Task Group</h4>
                  <p className="text-sm text-muted-foreground">{taskGroup.description}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Target Audience */}
          <Card className="group">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Target Audience
              </CardTitle>
              <Button 
                variant="ghost" 
                size="icon"
                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => toast.info("Edit coming soon")}
              >
                <Edit className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              {task.targetAudience ? (
                <p className="text-sm text-muted-foreground">
                  {task.targetAudience}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground/60 italic">
                  No target audience specified
                </p>
              )}
            </CardContent>
          </Card>

          {/* AI Workflow Section - only show for AI tasks */}
          {task.mode && task.mode !== "manual" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-blue-500" />
                  AI Workflow
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Current Step */}
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Current Step:</p>
                  <p className="text-base font-medium">
                    {task.aiWorkflowStep}. {
                      task.aiWorkflowStep === 1 ? "Brief & Context" :
                      task.aiWorkflowStep === 2 ? "Select AI Tool" :
                      task.aiWorkflowStep === 3 ? "Create Prompt" :
                      task.aiWorkflowStep === 4 ? "Generate Output" :
                      task.aiWorkflowStep === 5 ? "Upload Output" :
                      task.aiWorkflowStep === 6 ? "Review & Iterate" :
                      task.aiWorkflowStep === 7 ? "Submit for Clearance" :
                      "Unknown"
                    }
                  </p>
                </div>

                {/* Workflow Progress */}
                <div>
                  <p className="text-sm text-muted-foreground mb-3">Workflow Progress:</p>
                  <div className="space-y-2">
                    {[
                      { num: 1, label: "Brief & Context" },
                      { num: 2, label: "Select AI Tool" },
                      { num: 3, label: "Create Prompt" },
                      { num: 4, label: "Generate Output" },
                      { num: 5, label: "Upload Output" },
                      { num: 6, label: "Review & Iterate" },
                      { num: 7, label: "Submit for Clearance" },
                    ].map((step) => {
                      const isCompleted = task.completedSteps?.includes(step.num) || false
                      const isCurrent = task.aiWorkflowStep === step.num
                      const isFuture = !isCompleted && !isCurrent

                      return (
                        <div
                          key={step.num}
                          className={cn(
                            "flex items-center gap-3 py-2 px-3 rounded-lg transition-colors",
                            isCurrent && "bg-blue-50 dark:bg-blue-900/20",
                            isCompleted && "opacity-60"
                          )}
                        >
                          {isCompleted && (
                            <Check className="h-4 w-4 text-green-500 shrink-0" />
                          )}
                          {isCurrent && (
                            <ChevronRight className="h-4 w-4 text-blue-500 shrink-0" />
                          )}
                          {isFuture && (
                            <span className="w-4 h-4 shrink-0" />
                          )}
                          <span
                            className={cn(
                              "text-sm",
                              isCurrent && "font-medium text-foreground",
                              isCompleted && "text-muted-foreground",
                              isFuture && "text-muted-foreground/60"
                            )}
                          >
                            {step.num}. {step.label}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* AI Tool Info */}
                {task.aiTool && (
                  <div className="space-y-3 pt-4 border-t">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Selected AI Tool</span>
                      <span className="text-sm font-medium">{task.aiTool}</span>
                    </div>
                    {task.aiTrackingLevel && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Tracking Level</span>
                        <Badge
                          variant="outline"
                          className={cn(
                            "capitalize",
                            task.aiTrackingLevel === "full" && "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800",
                            task.aiTrackingLevel === "partial" && "bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800",
                            task.aiTrackingLevel === "none" && "bg-gray-50 dark:bg-gray-900/20 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-800"
                          )}
                        >
                          {task.aiTrackingLevel}
                        </Badge>
                      </div>
                    )}
                  </div>
                )}

                {/* Launch Button */}
                {task.aiTool && (
                  <Button 
                    className="w-full"
                    size="lg"
                    disabled={!task.aiTool}
                    onClick={() => toast.info(`Launching ${task.aiTool} with tracking...`)}
                  >
                    <Rocket className="mr-2 h-4 w-4" />
                    Launch {task.aiTool} with Tracking
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {/* Attachments/Versions Placeholder */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Attachments</CardTitle>
                <CardDescription>
                  Files and deliverables for this task
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => toast.info("Upload coming soon")}>
                <Upload className="mr-2 h-4 w-4" />
                Upload
              </Button>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-8 text-center border-2 border-dashed rounded-lg">
                <Paperclip className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">No attachments yet</p>
              </div>
            </CardContent>
          </Card>

          {/* Comments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Comments ({comments.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Comment List */}
              {comments.length > 0 && (
                <div className="space-y-4">
                  {comments.map((comment) => {
                    // System/Clearance comment
                    if (comment.isSystemComment) {
                      return (
                        <div 
                          key={comment.id} 
                          className="border-2 border-orange-200 dark:border-orange-800 rounded-lg bg-orange-50 dark:bg-orange-900/20 p-4"
                        >
                          {/* Header */}
                          <div className="flex items-start gap-3 mb-3">
                            <div className="text-2xl">🚨</div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-sm font-bold text-orange-700 dark:text-orange-400">
                                  NEEDS CHANGES
                                </span>
                                <span className="text-sm font-medium text-orange-600 dark:text-orange-500">
                                  - {comment.clearanceType === "legal" ? "Legal Review" : comment.clearanceType === "admin" ? "Admin Review" : "QA Review"}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <span>{comment.authorName}</span>
                                <span>•</span>
                                <span>{formatDateTime(comment.createdAt)}</span>
                              </div>
                            </div>
                          </div>

                          {/* Content */}
                          <div className="space-y-3 pl-11">
                            <p className="text-sm font-medium">{comment.content}</p>

                            {/* Clearance Reason */}
                            {comment.clearanceReason && (
                              <div className="bg-white dark:bg-slate-900 rounded-md p-3 border border-orange-200 dark:border-orange-800">
                                <p className="text-sm font-medium text-muted-foreground mb-1">
                                  {comment.clearanceType === "legal" ? "Legal team" : comment.clearanceType === "admin" ? "Admin" : "QA team"} rejected:
                                </p>
                                <p className="text-sm italic">"{comment.clearanceReason}"</p>
                              </div>
                            )}

                            {/* Linked Asset */}
                            {comment.linkedAsset && (
                              <div className="space-y-2">
                                <p className="text-xs text-muted-foreground font-medium">
                                  Asset: {comment.linkedAsset}
                                </p>
                                <div className="flex gap-2">
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => toast.info("View asset coming soon")}
                                  >
                                    <FileText className="mr-1 h-3 w-3" />
                                    View Asset
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => toast.info("View clearance details coming soon")}
                                  >
                                    <ExternalLink className="mr-1 h-3 w-3" />
                                    View Clearance Details
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    }

                    // Regular comment
                    return (
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
                    )
                  })}
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
                <TaskStatusBadge status={task.status} />
              </div>

              {/* Mode */}
              {task.mode && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Mode</span>
                  {task.mode === "manual" ? (
                    <Badge variant="outline" className="capitalize">
                      Manual
                    </Badge>
                  ) : (
                    <Badge 
                      variant="outline"
                      className={cn(
                        "gap-1 capitalize",
                        task.mode === "generative" && "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800",
                        task.mode === "assisted" && "bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800"
                      )}
                    >
                      <Zap className="h-3 w-3" />
                      {task.mode === "generative" ? "AI Generative" : "AI Assisted"}
                    </Badge>
                  )}
                </div>
              )}

              {/* Deliverable Type */}
              {task.deliverableType && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Type</span>
                  <Badge variant="outline">
                    {task.deliverableType}
                  </Badge>
                </div>
              )}

              {/* Intended Uses */}
              {task.intendedUses && task.intendedUses.length > 0 && (
                <div className="flex flex-col gap-2">
                  <span className="text-sm text-muted-foreground">Intended Uses</span>
                  <div className="flex flex-col gap-2">
                    {task.intendedUses.map((use) => (
                      <div key={use} className="flex items-center gap-2 text-sm">
                        <Target className="h-3.5 w-3.5 text-muted-foreground" />
                        <span>{use}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Client Visibility */}
              {task.clientVisibility && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Client Visibility</span>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant="outline"
                      className={cn(
                        "gap-1",
                        task.clientVisibility === "internal" && "bg-gray-50 dark:bg-gray-900/20 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-800",
                        task.clientVisibility === "visible" && "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800",
                        task.clientVisibility === "comment" && "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800"
                      )}
                    >
                      <Eye className="h-3 w-3" />
                      {task.clientVisibility === "internal" && "Internal only"}
                      {task.clientVisibility === "visible" && "Visible to client"}
                      {task.clientVisibility === "comment" && "Client can comment"}
                    </Badge>
                    <Lock className="h-3 w-3 text-muted-foreground" />
                  </div>
                </div>
              )}

              {/* Workstream */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Workstream</span>
                <Badge variant="secondary" className="capitalize">
                  {task.workstream}
                </Badge>
              </div>

              {/* Assignee */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Assignee</span>
                {task.assignee ? (
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-[10px] bg-primary/10">
                        {getInitials(task.assignee)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{task.assignee}</span>
                  </div>
                ) : (
                  <span className="text-sm text-muted-foreground">Unassigned</span>
                )}
              </div>

              {/* Priority */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Priority</span>
                <Badge
                  variant="outline"
                  className={cn(
                    "font-medium capitalize",
                    task.workstream === "legal" && "bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800",
                    task.workstream === "insurance" && "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800",
                    task.workstream === "creator" && "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800",
                    task.workstream === "general" && "bg-gray-50 dark:bg-gray-900/20 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-800"
                  )}
                >
                  {task.workstream === "legal" && "High"}
                  {task.workstream === "insurance" && "Medium"}
                  {task.workstream === "creator" && "Medium"}
                  {task.workstream === "general" && "Low"}
                </Badge>
              </div>

              {/* Due Date */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Due Date</span>
                {task.dueDate ? (
                  <span className="text-sm">
                    {formatDate(task.dueDate)}
                  </span>
                ) : (
                  <span className="text-sm text-muted-foreground">No due date</span>
                )}
              </div>

              {/* Task Group */}
              {taskGroup && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Group</span>
                  <div className="flex items-center gap-1.5">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: taskGroup.color }}
                    />
                    <span className="text-sm">{taskGroup.name}</span>
                  </div>
                </div>
              )}

              {/* Budget */}
              <div className="flex flex-col gap-2">
                <span className="text-sm text-muted-foreground">Budget</span>
                {task.estimatedHours || task.isBillable !== undefined ? (
                  <div className="flex flex-col gap-1.5">
                    {task.estimatedHours && (
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                        <span>{task.estimatedHours}h estimated</span>
                      </div>
                    )}
                    {task.isBillable !== undefined && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className={cn(
                          "text-2xl leading-none",
                          task.isBillable ? "text-green-600 dark:text-green-400" : "text-muted-foreground"
                        )}>
                          💰
                        </span>
                        <span className={cn(
                          task.isBillable ? "text-foreground" : "text-muted-foreground"
                        )}>
                          {task.isBillable ? "Billable" : "Non-billable"}
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground/60 italic">
                    Not specified
                  </p>
                )}
              </div>

              <Separator />

              {/* Created */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Created</span>
                <span className="text-sm">{formatDate(task.createdDate)}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Updated</span>
                <span className="text-sm">
                  {new Date(task.updatedAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {/* Manual Task Actions */}
              {(!task.mode || task.mode === "manual") && (
                <>
                  <Button 
                    className="w-full" 
                    onClick={() => toast.info("Start work coming soon")}
                  >
                    <Play className="mr-2 h-4 w-4" />
                    Start Work
                  </Button>
                  <Button 
                    className="w-full" 
                    variant="outline"
                    onClick={() => toast.info("Mark complete coming soon")}
                  >
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Mark Complete
                  </Button>
                  <Button 
                    className="w-full" 
                    variant="outline"
                    onClick={() => toast.info("Request review coming soon")}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    Request Review
                  </Button>
                </>
              )}

              {/* AI Generative/Assisted Task Actions - Step-specific */}
              {task.mode && task.mode !== "manual" && (
                <>
                  {/* Step 2: Select AI Tool */}
                  {task.aiWorkflowStep === 2 && (
                    <>
                      <Button 
                        className="w-full" 
                        onClick={() => toast.info("Select AI tool coming soon")}
                      >
                        <Zap className="mr-2 h-4 w-4" />
                        Select AI Tool
                      </Button>
                      <Button 
                        className="w-full" 
                        variant="outline"
                        onClick={() => toast.info("Skip to manual coming soon")}
                      >
                        <SkipForward className="mr-2 h-4 w-4" />
                        Skip to Manual
                      </Button>
                    </>
                  )}

                  {/* Step 3 or 4: Create Prompt / Generate Output */}
                  {(task.aiWorkflowStep === 3 || task.aiWorkflowStep === 4) && (
                    <>
                      <Button 
                        className="w-full" 
                        onClick={() => toast.info(`Launching ${task.aiTool || "AI Tool"}...`)}
                      >
                        <Rocket className="mr-2 h-4 w-4" />
                        Launch Tool
                      </Button>
                      <Button 
                        className="w-full" 
                        variant="outline"
                        onClick={() => toast.info("View workflow coming soon")}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        View Workflow
                      </Button>
                    </>
                  )}

                  {/* Step 5: Upload Output */}
                  {task.aiWorkflowStep === 5 && (
                    <>
                      <Button 
                        className="w-full" 
                        onClick={() => toast.info("Upload asset coming soon")}
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        Upload Asset
                      </Button>
                      <Button 
                        className="w-full" 
                        variant="outline"
                        onClick={() => toast.info("Link existing asset coming soon")}
                      >
                        <Link2 className="mr-2 h-4 w-4" />
                        Link Existing Asset
                      </Button>
                    </>
                  )}

                  {/* Step 6 or 7: Review/Submit */}
                  {(task.aiWorkflowStep === 6 || task.aiWorkflowStep === 7) && (
                    <>
                      <Button 
                        className="w-full" 
                        onClick={() => toast.info("Submit for clearance coming soon")}
                      >
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Submit for Clearance
                      </Button>
                      <Button 
                        className="w-full" 
                        variant="outline"
                        onClick={() => toast.info("Request changes coming soon")}
                      >
                        <AlertCircle className="mr-2 h-4 w-4" />
                        Request Changes
                      </Button>
                    </>
                  )}

                  {/* Step 1 or undefined - default actions */}
                  {(!task.aiWorkflowStep || task.aiWorkflowStep === 1) && (
                    <>
                      <Button 
                        className="w-full" 
                        onClick={() => toast.info("Start workflow coming soon")}
                      >
                        <Play className="mr-2 h-4 w-4" />
                        Start Workflow
                      </Button>
                      <Button 
                        className="w-full" 
                        variant="outline"
                        onClick={() => toast.info("View workflow coming soon")}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        View Workflow
                      </Button>
                    </>
                  )}
                </>
              )}

              {/* Common Actions - Always Available */}
              <Separator />
              <Button 
                className="w-full" 
                variant="ghost"
                onClick={() => toast.info("Edit task coming soon")}
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit Task
              </Button>
              <Button 
                className="w-full" 
                variant="ghost"
                onClick={() => toast.info("Duplicate coming soon")}
              >
                <Copy className="mr-2 h-4 w-4" />
                Duplicate
              </Button>
              <Button 
                className="w-full" 
                variant="ghost"
                onClick={() => toast.info("Archive coming soon")}
              >
                <Archive className="mr-2 h-4 w-4" />
                Archive
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
