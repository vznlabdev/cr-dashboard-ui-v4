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
  Folder,
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
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold tracking-tight">{task.title}</h1>
              <TaskStatusBadge status={task.status} />
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
              <p className="text-sm">
                {task.title}
              </p>
              
              {taskGroup?.description && (
                <div className="mt-4 pt-4 border-t">
                  <h4 className="text-sm font-medium mb-1">Task Group</h4>
                  <p className="text-sm text-muted-foreground">{taskGroup.description}</p>
                </div>
              )}
            </CardContent>
          </Card>

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
                  {comments.map((comment) => (
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
                <TaskStatusBadge status={task.status} />
              </div>

              {/* Workstream */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Workstream</span>
                <Badge variant="secondary" className="capitalize">
                  {task.workstream}
                </Badge>
              </div>

              <Separator />

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
              {task.status === "submitted" && (
                <Button 
                  className="w-full" 
                  variant="outline"
                  onClick={() => toast.info("Start assessment coming soon")}
                >
                  Start Assessment
                </Button>
              )}
              {task.status === "assessment" && (
                <Button 
                  className="w-full"
                  onClick={() => toast.info("Assign coming soon")}
                >
                  Assign to Team Member
                </Button>
              )}
              {task.status === "production" && (
                <Button 
                  className="w-full"
                  onClick={() => toast.info("Submit for QA coming soon")}
                >
                  Submit for QA
                </Button>
              )}
              {task.status === "qa_review" && (
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
              {task.status === "delivered" && (
                <div className="text-center py-4">
                  <CheckCircle2 className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">This task has been delivered</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Task Group */}
          {taskGroup && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <Folder className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Task Group:</span>
                  <Badge 
                    variant="outline" 
                    style={{ 
                      borderColor: taskGroup.color,
                      color: taskGroup.color 
                    }}
                  >
                    {taskGroup.name}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
