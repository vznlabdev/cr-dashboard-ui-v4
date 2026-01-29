"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Progress } from "@/components/ui/progress"
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
  ChevronLeft,
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
  Search,
  X,
  Circle,
  Menu,
  Trash2,
  ChevronDown,
  FileCheck,
  Image,
} from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { getTaskById, getTaskGroupById } from "@/lib/mock-data/projects-tasks"
import { useData } from "@/contexts/data-context"
import type { Task } from "@/types"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { aiToolsWhitelist, getAvailableToolsForProject, type AITool } from "@/lib/ai-tools-data"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
} from "@/components/ui/dropdown-menu"
import { TaskComments, type TaskComment, type TeamMember as TaskTeamMember } from "@/components/task/TaskComments"

// Team members for @mentions
const TEAM_MEMBERS: TaskTeamMember[] = [
  { id: "user-1", name: "Sarah Chen", initials: "SC", avatarColor: "#3b82f6" },
  { id: "user-2", name: "Mike Johnson", initials: "MJ", avatarColor: "#8b5cf6" },
  { id: "user-3", name: "Emma Wilson", initials: "EW", avatarColor: "#10b981" },
  { id: "user-4", name: "Alex Kim", initials: "AK", avatarColor: "#f59e0b" },
  { id: "user-5", name: "Jordan Lee", initials: "JL", avatarColor: "#ef4444" },
]

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
  const [comments, setComments] = useState<TaskComment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  // Current user (mock - in real app, get from auth)
  const currentUserId = "user-1"
  const currentUserInitials = "SC"
  
  // Tool selection state
  const [toolSearchQuery, setToolSearchQuery] = useState("")
  const [toolCategoryFilter, setToolCategoryFilter] = useState("all")
  const [requestToolModalOpen, setRequestToolModalOpen] = useState(false)
  const [requestToolForm, setRequestToolForm] = useState({
    toolName: "",
    toolUrl: "",
    reason: "",
  })
  
  // Tool launch state
  const [extensionStatus, setExtensionStatus] = useState<"active" | "inactive" | "not-detected">("active") // Mock as active
  const [toolLaunched, setToolLaunched] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  
  // Upload state
  const [uploadedAssets, setUploadedAssets] = useState<Array<{
    id: string
    name: string
    size: number
    uploadedAt: Date
    provenanceStatus: "verified" | "matching" | "manual-needed"
    thumbnail?: string
  }>>([])
  const [isDragging, setIsDragging] = useState(false)
  
  // Review state
  const [qualityChecks, setQualityChecks] = useState({
    meetsBrief: false,
    matchesBrand: false,
    appropriateAudience: false,
    readyForReview: false,
  })
  
  // Rejection response state
  const [addressFeedbackOpen, setAddressFeedbackOpen] = useState(false)
  const [selectedResponse, setSelectedResponse] = useState<"generate" | "upload" | "document" | "respond" | null>(null)
  
  // Step navigation state
  const [skipStepDialogOpen, setSkipStepDialogOpen] = useState(false)
  const [skipStepNumber, setSkipStepNumber] = useState<number | null>(null)
  
  // Quick actions state
  const [convertToManualDialogOpen, setConvertToManualDialogOpen] = useState(false)
  const [restartWorkflowDialogOpen, setRestartWorkflowDialogOpen] = useState(false)
  const [deleteTaskDialogOpen, setDeleteTaskDialogOpen] = useState(false)
  const [evidenceModalOpen, setEvidenceModalOpen] = useState(false)
  
  // Evidence modal state
  const [expandedPrompts, setExpandedPrompts] = useState<number[]>([0]) // First prompt expanded by default
  const [expandedGenerations, setExpandedGenerations] = useState<number[]>([0])
  const [expandedDownloads, setExpandedDownloads] = useState<number[]>([0])
  
  // Extension tracking state
  const [extensionTracking, setExtensionTracking] = useState<{
    status: "active" | "inactive" | "not-detected" | "not-needed"
    sessionId: string | null
    lastActivity: Date | null
    evidence: {
      prompts: number
      generations: number
      downloads: number
    }
  }>({
    status: "active",
    sessionId: "abc123",
    lastActivity: new Date(Date.now() - 2 * 60 * 1000), // 2 minutes ago
    evidence: {
      prompts: 3,
      generations: 4,
      downloads: 2,
    }
  })

  // Poll for extension evidence updates
  useEffect(() => {
    if (!task || task.mode === 'manual') return
    if (extensionTracking.status !== 'active') return
    
    // Poll every 10 seconds for evidence updates
    const pollInterval = setInterval(() => {
      // Simulate evidence updates (in real app, would fetch from backend)
      const shouldUpdate = Math.random() > 0.7 // 30% chance of update
      
      if (shouldUpdate) {
        setExtensionTracking(prev => {
          const newEvidence = {
            prompts: prev.evidence.prompts + (Math.random() > 0.5 ? 1 : 0),
            generations: prev.evidence.generations + (Math.random() > 0.5 ? 1 : 0),
            downloads: prev.evidence.downloads + (Math.random() > 0.5 ? 1 : 0),
          }
          
          // Show notification if evidence changed
          if (
            newEvidence.prompts !== prev.evidence.prompts ||
            newEvidence.generations !== prev.evidence.generations ||
            newEvidence.downloads !== prev.evidence.downloads
          ) {
            toast.success("📸 New evidence captured")
          }
          
          return {
            ...prev,
            lastActivity: new Date(),
            evidence: newEvidence,
          }
        })
      }
    }, 10000) // Poll every 10 seconds
    
    return () => clearInterval(pollInterval)
  }, [task, extensionTracking.status])

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
        
        // Set extension tracking status based on task mode
        if (foundTask.mode === 'generative' || foundTask.mode === 'assisted') {
          // For AI tasks, check if session already exists
          if (foundTask.aiWorkflowStep && foundTask.aiWorkflowStep >= 3) {
            // Already in workflow, show as active
            setExtensionTracking(prev => ({
              ...prev,
              status: "active"
            }))
          } else {
            // Not yet in workflow, show as inactive
            setExtensionTracking(prev => ({
              ...prev,
              status: "inactive",
              sessionId: null
            }))
          }
        } else {
          // Manual task - no tracking needed
          setExtensionTracking(prev => ({
            ...prev,
            status: "not-needed"
          }))
        }
        
        // Mock comments with mentions and reactions
        setComments([
          {
            id: "c-1",
            content: "This looks great! Can we adjust the color palette slightly? @Mike Johnson what do you think?",
            authorId: "user-1",
            authorName: "Sarah Chen",
            authorInitials: "SC",
            createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
            mentions: ["user-2"],
            reactions: [
              { emoji: "👍", userId: "user-2", userName: "Mike Johnson" },
              { emoji: "👍", userId: "user-3", userName: "Emma Wilson" },
              { emoji: "🎉", userId: "user-4", userName: "Alex Kim" },
            ]
          },
          {
            id: "c-2",
            content: "Good point! I think we should use a warmer tone. Let me work on an updated version.",
            authorId: "user-2",
            authorName: "Mike Johnson",
            authorInitials: "MJ",
            createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
            mentions: [],
            reactions: [
              { emoji: "🚀", userId: "user-1", userName: "Sarah Chen" },
            ]
          },
        ])
      }
      
      setIsLoading(false)
    }
    loadTask()
  }, [taskId])

  // Handle add comment with mentions
  const handleAddComment = (content: string, mentions: string[]) => {
    if (!content.trim() || !task) return

    const comment: TaskComment = {
      id: `c-${Date.now()}`,
      content,
      authorId: currentUserId,
      authorName: "Sarah Chen", // In real app, get from auth
      authorInitials: currentUserInitials,
      createdAt: new Date(),
      mentions,
      reactions: [],
    }

    setComments([...comments, comment])
    
    // Notify mentioned users
    if (mentions.length > 0) {
      const mentionedNames = mentions
        .map(id => TEAM_MEMBERS.find(m => m.id === id)?.name)
        .filter(Boolean)
        .join(', ')
      toast.success(`Comment added and ${mentionedNames} mentioned`)
    }
  }
  
  // Handle add reaction
  const handleAddReaction = (commentId: string, emoji: string) => {
    setComments(comments.map(comment => {
      if (comment.id === commentId) {
        const reactions = comment.reactions || []
        return {
          ...comment,
          reactions: [...reactions, {
            emoji,
            userId: currentUserId,
            userName: "Sarah Chen" // In real app, get from auth
          }]
        }
      }
      return comment
    }))
  }
  
  // Handle remove reaction
  const handleRemoveReaction = (commentId: string, emoji: string) => {
    setComments(comments.map(comment => {
      if (comment.id === commentId) {
        const reactions = comment.reactions || []
        return {
          ...comment,
          reactions: reactions.filter(
            r => !(r.emoji === emoji && r.userId === currentUserId)
          )
        }
      }
      return comment
    }))
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

  // Handle tool selection
  const handleSelectTool = (tool: AITool) => {
    if (!task) return
    
    // Map tool tracking levels to task tracking levels
    let trackingLevel: 'full' | 'partial' | 'none' = 'none'
    if (tool.trackingLevel === "Full Tracking") {
      trackingLevel = 'full'
    } else if (tool.trackingLevel === "Good Tracking" || tool.trackingLevel === "Basic Tracking") {
      // Both Good and Basic Tracking map to 'partial' since they provide some tracking
      trackingLevel = 'partial'
    }
    
    // Update task with selected tool
    setTask({
      ...task,
      aiTool: tool.name,
      aiTrackingLevel: trackingLevel,
      aiWorkflowStep: 3, // Advance to "Create Prompt"
      completedSteps: [...(task.completedSteps || []), 2], // Mark step 2 as complete
    })
    
    toast.success(`✓ ${tool.name} selected`)
  }

  // Handle request new tool
  const handleRequestNewTool = () => {
    if (!requestToolForm.toolName || !requestToolForm.toolUrl || !requestToolForm.reason) {
      toast.error("Please fill in all fields")
      return
    }
    
    // In a real app, this would send a request to the backend
    toast.success("Tool request submitted! Admin will review shortly.")
    
    // Reset form and close modal
    setRequestToolForm({ toolName: "", toolUrl: "", reason: "" })
    setRequestToolModalOpen(false)
  }

  // Get available tools for this project
  const availableTools = getAvailableToolsForProject(projectId)
  
  // Filter tools based on search and category
  const filteredTools = availableTools.filter(tool => {
    const matchesSearch = tool.name.toLowerCase().includes(toolSearchQuery.toLowerCase()) ||
                         tool.category.toLowerCase().includes(toolSearchQuery.toLowerCase())
    const matchesCategory = toolCategoryFilter === "all" || tool.category === toolCategoryFilter
    return matchesSearch && matchesCategory
  })

  // Get unique categories for filter
  const categories = Array.from(new Set(availableTools.map(tool => tool.category)))

  // Handle tool launch
  const handleLaunchTool = () => {
    if (!task || !task.aiTool) return
    
    // Generate session ID
    const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substring(7)}`
    setSessionId(newSessionId)
    
    // Find the tool to get its baseUrl
    const tool = availableTools.find(t => t.name === task.aiTool)
    if (!tool) return
    
    // Build URL with tracking params
    const url = new URL(tool.baseUrl)
    url.searchParams.append('cr_task_id', taskId)
    url.searchParams.append('cr_project_id', projectId)
    url.searchParams.append('cr_session', newSessionId)
    
    // Open in new tab
    window.open(url.toString(), '_blank')
    
    // Update state
    setToolLaunched(true)
    
    // Show confirmation
    toast.success(`✓ Tracking active in new tab`)
  }

  // Handle mark step complete
  const handleMarkStepComplete = () => {
    if (!task || !task.aiWorkflowStep) return
    
    const currentStep = task.aiWorkflowStep
    
    // Update task to next step
    setTask({
      ...task,
      aiWorkflowStep: currentStep + 1,
      completedSteps: [...(task.completedSteps || []), currentStep],
    })
    
    // Reset launch state for next step
    setToolLaunched(false)
    
    toast.success(`Step ${currentStep} completed!`)
  }

  // Handle install/activate extension
  const handleInstallExtension = () => {
    toast.info("Opening Chrome Web Store...")
    window.open("https://chrome.google.com/webstore", '_blank')
  }

  const handleActivateExtension = () => {
    toast.info("Please activate the CreativeRightsHub extension in your browser")
  }

  const handleContinueAnyway = () => {
    toast.warning("Tracking disabled - provenance data will not be captured")
    handleLaunchTool()
  }

  // Handle file upload
  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    
    // Simulate upload process
    Array.from(files).forEach((file) => {
      const newAsset = {
        id: `asset_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        name: file.name,
        size: file.size,
        uploadedAt: new Date(),
        provenanceStatus: "matching" as const,
        thumbnail: undefined,
      }
      
      setUploadedAssets(prev => [...prev, newAsset])
      
      // Simulate provenance matching after 2 seconds
      setTimeout(() => {
        setUploadedAssets(prev => prev.map(asset => 
          asset.id === newAsset.id 
            ? { ...asset, provenanceStatus: Math.random() > 0.3 ? "verified" : "manual-needed" as const }
            : asset
        ))
      }, 2000)
      
      toast.success(`Uploading ${file.name}...`)
    })
  }

  // Handle drag and drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    handleFileUpload(e.dataTransfer.files)
  }

  // Handle remove asset
  const handleRemoveAsset = (assetId: string) => {
    setUploadedAssets(prev => prev.filter(asset => asset.id !== assetId))
    toast.success("Asset removed")
  }

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  // Format relative time
  const formatRelativeTime = (date: Date) => {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
    if (seconds < 60) return "just now"
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    return `${Math.floor(seconds / 86400)}d ago`
  }

  // Handle continue to review
  const handleContinueToReview = () => {
    if (!task || !task.aiWorkflowStep) return
    
    // Advance to next step
    setTask({
      ...task,
      aiWorkflowStep: 6, // Review & Iterate
      completedSteps: [...(task.completedSteps || []), 5],
    })
    
    toast.success("Assets uploaded! Moving to review...")
  }

  // Handle generate more
  const handleGenerateMore = () => {
    if (!task) return
    
    // Go back to "Create Prompt" step
    setTask({
      ...task,
      aiWorkflowStep: 3,
    })
    
    // Reset tool launched state
    setToolLaunched(false)
    
    toast.info("Returning to prompt creation...")
  }

  // Handle edit and re-upload
  const handleEditAndReupload = () => {
    if (!task) return
    
    // Go back to "Upload Output" step
    setTask({
      ...task,
      aiWorkflowStep: 5,
    })
    
    toast.info("Returning to upload...")
  }

  // Handle submit for clearance (special action for step 6)
  const handleSubmitForClearance = () => {
    if (!task) return
    
    // Update task status and advance to step 7
    // Mark step 6 as complete, but step 7 is now in progress (showing submission status)
    setTask({
      ...task,
      status: 'delivered',
      aiWorkflowStep: 7, // Advance to "Submit for Clearance" step
      completedSteps: [...(task.completedSteps || []), 6], // Mark step 6 as complete
    })
    
    toast.success("✓ Submitted for clearance! Admin and legal teams will review your assets.")
  }

  // Toggle quality check
  const handleToggleQualityCheck = (check: keyof typeof qualityChecks) => {
    setQualityChecks(prev => ({
      ...prev,
      [check]: !prev[check]
    }))
  }

  // Calculate workflow progress
  const calculateWorkflowProgress = () => {
    if (!task?.aiWorkflowStep) return { percent: 0, completed: 0, total: 7 }
    const completed = task.completedSteps?.length || 0
    const percent = Math.round((completed / 7) * 100)
    return { percent, completed, total: 7 }
  }

  // Get step status
  const getStepStatus = (stepNumber: number) => {
    if (!task) return 'not-started'
    if (task.completedSteps?.includes(stepNumber)) return 'completed'
    if (task.aiWorkflowStep === stepNumber) return 'current'
    if (stepNumber === 5 && task.clearanceRejection) return 'needs-changes'
    return 'not-started'
  }

  // Get step info
  const getStepInfo = (stepNumber: number) => {
    if (!task) return null
    
    switch (stepNumber) {
      case 1:
        return task.completedSteps?.includes(1) ? 'Brief completed' : null
      case 2:
        return task.aiTool ? `${task.aiTool} selected` : null
      case 3:
        return task.completedSteps?.includes(3) ? 'Tool launched with tracking' : null
      case 4:
        return task.completedSteps?.includes(4) ? '4 generations captured' : null
      case 5:
        if (uploadedAssets.length > 0) return `${uploadedAssets.length} asset${uploadedAssets.length !== 1 ? 's' : ''} uploaded`
        return task.completedSteps?.includes(5) ? 'Assets uploaded' : 'No assets uploaded yet'
      case 6:
        return task.completedSteps?.includes(6) ? 'Review completed' : null
      case 7:
        return task.completedSteps?.includes(7) ? 'Submitted for clearance' : null
      default:
        return null
    }
  }

  // Get step timestamp (mock)
  const getStepTimestamp = (stepNumber: number) => {
    if (!task?.completedSteps?.includes(stepNumber)) return null
    // Mock timestamps - in real app, would come from backend
    const baseTime = new Date(task.createdDate).getTime()
    const stepTime = new Date(baseTime + stepNumber * 30 * 60 * 1000) // 30 min per step
    return stepTime.toLocaleString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      hour: 'numeric', 
      minute: '2-digit' 
    })
  }

  // Jump to workflow step
  const handleJumpToStep = (stepNumber: number) => {
    if (!task) return
    
    // Only allow jumping to current or completed steps
    if (stepNumber <= (task.aiWorkflowStep || 0)) {
      setTask({
        ...task,
        aiWorkflowStep: stepNumber,
      })
      toast.info(`Jumped to step ${stepNumber}`)
    } else {
      toast.warning("Complete previous steps first")
    }
  }

  // Format relative time for extension activity
  const formatExtensionActivityTime = (date: Date | null) => {
    if (!date) return "No activity"
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
    if (seconds < 60) return "Just now"
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minute${Math.floor(seconds / 60) !== 1 ? 's' : ''} ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hour${Math.floor(seconds / 3600) !== 1 ? 's' : ''} ago`
    return `${Math.floor(seconds / 86400)} day${Math.floor(seconds / 86400) !== 1 ? 's' : ''} ago`
  }

  // Handle activate extension
  const handleActivateExtensionTracking = () => {
    setExtensionTracking({
      status: "active",
      sessionId: `session_${Date.now().toString(36)}`,
      lastActivity: new Date(),
      evidence: {
        prompts: 0,
        generations: 0,
        downloads: 0,
      }
    })
    toast.success("✓ Extension activated - tracking started")
  }

  // Handle stop tracking
  const handleStopTracking = () => {
    setExtensionTracking(prev => ({
      ...prev,
      status: "inactive",
      sessionId: null,
    }))
    toast.info("Tracking stopped")
  }

  // Handle view evidence
  const handleViewEvidence = () => {
    setEvidenceModalOpen(true)
  }

  const togglePromptExpanded = (index: number) => {
    setExpandedPrompts(prev => 
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    )
  }

  const toggleGenerationExpanded = (index: number) => {
    setExpandedGenerations(prev => 
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    )
  }

  const toggleDownloadExpanded = (index: number) => {
    setExpandedDownloads(prev => 
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    )
  }

  // Mock evidence data
  const mockEvidence = {
    sessionId: 'abc123xyz',
    tool: task?.aiTool || 'Unknown',
    trackingLevel: task?.aiTrackingLevel || 'none',
    sessionDuration: '45 minutes',
    prompts: [
      {
        timestamp: '2024-01-24T14:47:00Z',
        text: 'futuristic city skyline at sunset, cinematic style, warm golden hour lighting, dramatic clouds, reflections on glass buildings, ultra detailed architecture',
        model: 'Midjourney v6',
        settings: '--ar 16:9 --style cinematic --q 2',
        hasScreenshot: true,
      },
      {
        timestamp: '2024-01-24T15:02:00Z',
        text: 'same as above but with more detail in architecture, add people walking on streets, vibrant city life atmosphere',
        model: 'Midjourney v6',
        settings: '--ar 16:9 --style cinematic --q 2 --stylize 500',
        hasScreenshot: true,
      },
      {
        timestamp: '2024-01-24T15:18:00Z',
        text: 'variation with blue hour lighting instead of golden hour, more dramatic mood, city lights glowing',
        model: 'Midjourney v6',
        settings: '--ar 16:9 --style cinematic --q 2 --stylize 750',
        hasScreenshot: false,
      },
    ],
    generations: [
      {
        jobId: 1,
        startTime: '2024-01-24T14:47:15Z',
        endTime: '2024-01-24T14:48:23Z',
        duration: '68 seconds',
        outputCount: 4,
      },
      {
        jobId: 2,
        startTime: '2024-01-24T15:02:30Z',
        endTime: '2024-01-24T15:03:43Z',
        duration: '73 seconds',
        outputCount: 4,
      },
      {
        jobId: 3,
        startTime: '2024-01-24T15:18:45Z',
        endTime: '2024-01-24T15:19:58Z',
        duration: '73 seconds',
        outputCount: 4,
      },
    ],
    downloads: [
      {
        filename: 'hero_image_v1.png',
        timestamp: '2024-01-24T15:15:00Z',
        fileHash: 'sha256:a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6',
        matchedToAsset: true,
        assetId: 'asset-billboard-001',
      },
      {
        filename: 'hero_image_v2.png',
        timestamp: '2024-01-24T15:16:00Z',
        fileHash: 'sha256:z9y8x7w6v5u4t3s2r1q0p9o8n7m6l5k4j3i2h1g0f9e8d7c6b5a4',
        matchedToAsset: true,
        assetId: 'asset-billboard-002',
      },
    ],
  }

  // Get step button text
  const getStepButtonText = (stepNumber: number) => {
    switch (stepNumber) {
      case 2: return "Select Tool →"
      case 3: return "Launch Tool →"
      case 4: return "Continue to Upload →"
      case 5: return "Continue to Review →"
      case 6: return "Submit for Clearance →"
      case 7: return "Complete →"
      default: return "Continue →"
    }
  }

  // Check if step requirements are met
  const checkStepRequirements = (stepNumber: number) => {
    if (!task) return { met: false, message: "" }
    
    switch (stepNumber) {
      case 2:
        // Must select a tool
        if (!task.aiTool) {
          return { 
            met: false, 
            message: "Select an AI tool to continue" 
          }
        }
        return { met: true, message: "" }
      
      case 5:
        // Must upload at least 1 asset
        if (uploadedAssets.length === 0) {
          return { 
            met: false, 
            message: "Upload at least one output asset" 
          }
        }
        return { met: true, message: "" }
      
      case 6:
        // All quality checks should be reviewed (not strictly required)
        return { met: true, message: "" }
      
      default:
        return { met: true, message: "" }
    }
  }

  // Handle previous step
  const handlePreviousStep = () => {
    if (!task || !task.aiWorkflowStep) return
    
    const prevStep = task.aiWorkflowStep - 1
    if (prevStep < 1) {
      toast.warning("Already at first step")
      return
    }
    
    setTask({
      ...task,
      aiWorkflowStep: prevStep,
    })
    
    toast.info(`Moved to step ${prevStep}`)
  }

  // Handle next step (complete current step)
  const handleNextStep = () => {
    if (!task || !task.aiWorkflowStep) return
    
    const currentStep = task.aiWorkflowStep
    const requirements = checkStepRequirements(currentStep)
    
    if (!requirements.met) {
      toast.error(requirements.message)
      return
    }
    
    const nextStep = currentStep + 1
    const newCompletedSteps = [...(task.completedSteps || []), currentStep]
    
    setTask({
      ...task,
      aiWorkflowStep: nextStep,
      completedSteps: newCompletedSteps,
    })
    
    toast.success(`✓ Step ${currentStep} completed!`)
  }

  // Handle skip step
  const handleSkipStep = (stepNumber: number) => {
    setSkipStepNumber(stepNumber)
    setSkipStepDialogOpen(true)
  }

  // Confirm skip step
  const handleConfirmSkipStep = () => {
    if (!task || !skipStepNumber) return
    
    const nextStep = skipStepNumber + 1
    
    setTask({
      ...task,
      aiWorkflowStep: nextStep,
    })
    
    setSkipStepDialogOpen(false)
    setSkipStepNumber(null)
    
    toast.warning(`⚠️ Step ${skipStepNumber} skipped - provenance tracking may be affected`)
  }

  // Check if step can be skipped
  const canSkipStep = (stepNumber: number) => {
    // Critical steps that cannot be skipped
    const criticalSteps = [1, 2, 7] // Brief, Select Tool, Submit
    return !criticalSteps.includes(stepNumber)
  }

  // Quick action handlers
  const handleConvertToManual = () => {
    if (!task) return
    
    setTask({
      ...task,
      mode: undefined,
      aiWorkflowStep: undefined,
      aiTool: undefined,
      aiTrackingLevel: undefined,
      completedSteps: undefined,
    })
    
    setConvertToManualDialogOpen(false)
    toast.success("✓ Task converted to Manual mode")
  }

  const handleRestartWorkflow = () => {
    if (!task) return
    
    setTask({
      ...task,
      aiWorkflowStep: 1,
      completedSteps: [],
    })
    
    setRestartWorkflowDialogOpen(false)
    toast.success("✓ Workflow restarted from beginning")
  }

  const handleDeleteTask = () => {
    setDeleteTaskDialogOpen(false)
    toast.success("Task deleted (demo mode)")
    router.push(`/projects/${projectId}/tasks`)
  }

  const handleChangeAssignee = () => {
    toast.info("Change assignee dialog coming soon")
  }

  const handleSetDueDate = () => {
    toast.info("Set due date picker coming soon")
  }

  const handleArchiveTask = () => {
    if (!task) return
    toast.success("Task archived (demo mode)")
    router.push(`/projects/${projectId}/tasks`)
  }

  // Render step navigation controls
  const renderStepNavigation = (stepNumber: number) => {
    if (!task) return null
    
    const requirements = checkStepRequirements(stepNumber)
    const isFirstStep = stepNumber === 1
    const isSubmitStep = stepNumber === 6 // Step 6 submits for clearance
    
    return (
      <div className="pt-4 border-t space-y-3">
        {/* Requirements Warning */}
        {!requirements.met && (
          <div className="flex items-start gap-2 p-3 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400 shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-yellow-900 dark:text-yellow-200">
                ⚠️ Complete requirements to continue:
              </p>
              <p className="text-yellow-700 dark:text-yellow-300 mt-1">
                • {requirements.message}
              </p>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between gap-3">
          <Button
            variant="outline"
            onClick={handlePreviousStep}
            disabled={isFirstStep}
            className="flex-1"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Previous Step
          </Button>
          
          <Button
            onClick={isSubmitStep ? handleSubmitForClearance : handleNextStep}
            disabled={!requirements.met}
            className="flex-1"
          >
            {getStepButtonText(stepNumber)}
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>

        {/* Skip Option */}
        {canSkipStep(stepNumber) && (
          <div className="text-center">
            <button
              onClick={() => handleSkipStep(stepNumber)}
              className="text-sm text-muted-foreground hover:text-foreground underline transition-colors"
            >
              Skip this step
            </button>
          </div>
        )}
      </div>
    )
  }

  // Handle address feedback proceed
  const handleAddressFeedbackProceed = () => {
    if (!selectedResponse || !task) return
    
    setAddressFeedbackOpen(false)
    
    switch (selectedResponse) {
      case "generate":
        // Go to "Create Prompt" step
        setTask({
          ...task,
          aiWorkflowStep: 3,
        })
        setToolLaunched(false)
        toast.info("Generate a new version with corrections")
        break
      
      case "upload":
        // Go to "Upload Output" step
        setTask({
          ...task,
          aiWorkflowStep: 5,
        })
        toast.info("Upload your revised asset")
        break
      
      case "document":
        // Open asset editor (mock)
        toast.info("Asset documentation editor coming soon")
        break
      
      case "respond":
        // Scroll to comments section
        const commentsSection = document.getElementById('comments-section')
        if (commentsSection) {
          commentsSection.scrollIntoView({ behavior: 'smooth' })
        }
        toast.info("Add your response in the comments below")
        break
    }
    
    // Reset selection
    setSelectedResponse(null)
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
      <div className="flex items-center text-sm text-muted-foreground">
        <Link href="/projects" className="hover:text-foreground transition-colors">
          Projects
        </Link>
        <ChevronRight className="h-4 w-4 mx-1" />
        <Link href={`/projects/${projectId}/tasks`} className="hover:text-foreground transition-colors">
          {project.name}
        </Link>
        <ChevronRight className="h-4 w-4 mx-1" />
        <span className="text-foreground font-medium truncate max-w-[300px]">{task.title}</span>
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
                className="font-medium bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800"
              >
                Med
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
              <Button variant="outline" className="gap-2">
                <MoreHorizontal className="h-4 w-4" />
                Actions
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground">
                Workflow Actions
              </div>
              <DropdownMenuSeparator />
              
              {/* Jump to Step submenu */}
              {task.mode && task.mode !== 'manual' && (
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <ChevronRight className="mr-2 h-4 w-4" />
                    Jump to Step...
                  </DropdownMenuSubTrigger>
                  <DropdownMenuPortal>
                    <DropdownMenuSubContent>
                      {[
                        { num: 1, label: "Brief & Context" },
                        { num: 2, label: "Select AI Tool" },
                        { num: 3, label: "Create Prompt" },
                        { num: 4, label: "Generate Output" },
                        { num: 5, label: "Upload Output" },
                        { num: 6, label: "Review & Iterate" },
                        { num: 7, label: "Submit for Clearance" },
                      ].map((step) => (
                        <DropdownMenuItem
                          key={step.num}
                          onClick={() => handleJumpToStep(step.num)}
                          disabled={step.num > (task.aiWorkflowStep || 1)}
                        >
                          {step.num}. {step.label}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuSubContent>
                  </DropdownMenuPortal>
                </DropdownMenuSub>
              )}
              
              {task.mode && task.mode !== 'manual' && (
                <DropdownMenuItem onClick={handleViewEvidence}>
                  <Eye className="mr-2 h-4 w-4" />
                  View All Evidence
                </DropdownMenuItem>
              )}
              
              {task.mode && task.mode !== 'manual' && task.aiTool && (
                <DropdownMenuItem onClick={handleLaunchTool}>
                  <Rocket className="mr-2 h-4 w-4" />
                  Launch AI Tool
                </DropdownMenuItem>
              )}
              
              <DropdownMenuItem onClick={() => toast.info("Upload asset coming soon")}>
                <Upload className="mr-2 h-4 w-4" />
                Upload Asset
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem onClick={() => toast.info("Edit task details coming soon")}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Task Details
              </DropdownMenuItem>
              
              <DropdownMenuItem onClick={handleChangeAssignee}>
                <User className="mr-2 h-4 w-4" />
                Change Assignee
              </DropdownMenuItem>
              
              <DropdownMenuItem onClick={handleSetDueDate}>
                <Calendar className="mr-2 h-4 w-4" />
                Set Due Date
              </DropdownMenuItem>
              
              {task.mode && task.mode !== 'manual' && (
                <>
                  <DropdownMenuSeparator />
                  
                  <DropdownMenuItem onClick={() => setConvertToManualDialogOpen(true)}>
                    <AlertCircle className="mr-2 h-4 w-4" />
                    Convert to Manual
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem onClick={() => setRestartWorkflowDialogOpen(true)}>
                    <ChevronRight className="mr-2 h-4 w-4 rotate-180" />
                    Restart Workflow
                  </DropdownMenuItem>
                </>
              )}
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem onClick={handleArchiveTask}>
                <Archive className="mr-2 h-4 w-4" />
                Archive Task
              </DropdownMenuItem>
              
              <DropdownMenuItem 
                className="text-destructive focus:text-destructive"
                onClick={() => setDeleteTaskDialogOpen(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Task
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Clearance Rejection Banner */}
      {task.clearanceRejection && (
        <Card className="border-red-500 dark:border-red-800 bg-red-50 dark:bg-red-950/20">
          <CardContent className="p-6">
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-start gap-3">
                <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-red-900 dark:text-red-200 flex items-center gap-2">
                    🚨 NEEDS CHANGES
                  </h3>
                  <p className="text-sm text-red-800 dark:text-red-300 mt-1">
                    Your submission has been rejected by{" "}
                    {task.clearanceRejection.rejectedBy === "legal" && "Legal Review"}
                    {task.clearanceRejection.rejectedBy === "admin" && "Admin Review"}
                    {task.clearanceRejection.rejectedBy === "qa" && "QA Review"}
                  </p>
                </div>
              </div>

              {/* Rejected Asset */}
              <div className="pl-9 space-y-2">
                <div>
                  <span className="text-sm font-medium text-red-900 dark:text-red-200">
                    Rejected Asset:
                  </span>
                  <span className="text-sm text-red-800 dark:text-red-300 ml-2">
                    {task.clearanceRejection.rejectedAsset}
                  </span>
                </div>

                {/* Feedback */}
                <div>
                  <p className="text-sm font-medium text-red-900 dark:text-red-200 mb-1">
                    Feedback from{" "}
                    {task.clearanceRejection.rejectedBy === "legal" && "Legal Team"}
                    {task.clearanceRejection.rejectedBy === "admin" && "Admin Team"}
                    {task.clearanceRejection.rejectedBy === "qa" && "QA Team"}:
                  </p>
                  <p className="text-sm text-red-800 dark:text-red-300 italic border-l-2 border-red-400 dark:border-red-600 pl-3">
                    "{task.clearanceRejection.feedback}"
                  </p>
                </div>

                {/* What you need to do */}
                <div>
                  <p className="text-sm font-medium text-red-900 dark:text-red-200 mb-1">
                    What you need to do:
                  </p>
                  <p className="text-sm text-red-800 dark:text-red-300">
                    This output must be updated.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2 pl-9 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-white dark:bg-gray-900 border-red-300 dark:border-red-700 text-red-900 dark:text-red-200 hover:bg-red-100 dark:hover:bg-red-900/40"
                  onClick={() => toast.info("Asset viewer coming soon")}
                >
                  <Eye className="mr-2 h-3.5 w-3.5" />
                  View Asset
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-white dark:bg-gray-900 border-red-300 dark:border-red-700 text-red-900 dark:text-red-200 hover:bg-red-100 dark:hover:bg-red-900/40"
                  onClick={() => {
                    // Scroll to comments section
                    const commentsSection = document.getElementById('comments-section')
                    if (commentsSection) {
                      commentsSection.scrollIntoView({ behavior: 'smooth' })
                    }
                  }}
                >
                  <MessageSquare className="mr-2 h-3.5 w-3.5" />
                  View Clearance Details
                </Button>
                <Button
                  size="sm"
                  className="bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 text-white"
                  onClick={() => setAddressFeedbackOpen(true)}
                >
                  <Edit className="mr-2 h-3.5 w-3.5" />
                  Address Feedback
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* AI Workflow Section - Moved to top */}
          {(task.mode === 'generative' || task.mode === 'assisted') && (
          <Card className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border-blue-200 dark:border-blue-800">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                  <Zap className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-1">AI Workflow</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Manage your AI-assisted creation process with guided steps, tool tracking, and evidence collection.
                  </p>
                  <div className="flex items-center gap-3 mb-4">
                    <Badge variant="outline">
                      Step {task.aiWorkflowStep || 1} / 7
                    </Badge>
                    {task.aiTool && (
                      <span className="text-sm text-muted-foreground">
                        Using {task.aiTool}
                      </span>
                    )}
                  </div>
                  <Button asChild size="lg" className="w-full sm:w-auto">
                    <Link href={`/projects/${projectId}/tasks/${taskId}/workflow`}>
                      <Rocket className="mr-2 h-4 w-4" />
                      {task.aiWorkflowStep && task.aiWorkflowStep > 1 ? 'Continue Workflow' : 'Start AI Workflow'}
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          )}

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

          {/* Original AI Workflow Card (can be removed later) */}
          <Card style={{ display: 'none' }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-blue-500" />
                  AI Workflow
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Extension Status Indicator */}
                <Card className={cn(
                  "border-2",
                  extensionTracking.status === "active" && "border-green-500 dark:border-green-800 bg-green-50 dark:bg-green-950/20",
                  extensionTracking.status === "inactive" && "border-yellow-500 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-950/20",
                  extensionTracking.status === "not-detected" && "border-red-500 dark:border-red-800 bg-red-50 dark:bg-red-950/20",
                  extensionTracking.status === "not-needed" && "border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/20"
                )}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Extension Status</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Active Status */}
                    {extensionTracking.status === "active" && (
                      <>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">🟢</span>
                            <div className="flex-1">
                              <p className="text-sm font-semibold text-green-900 dark:text-green-100">
                                Active • Tracking session #{extensionTracking.sessionId}
                              </p>
                              <p className="text-xs text-green-700 dark:text-green-300">
                                Last activity: {formatExtensionActivityTime(extensionTracking.lastActivity)}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div>
                          <p className="text-sm font-medium text-green-900 dark:text-green-100 mb-2">
                            Evidence captured:
                          </p>
                          <div className="space-y-1 text-sm text-green-800 dark:text-green-200">
                            <div className="flex items-center gap-2">
                              <span>•</span>
                              <span>{extensionTracking.evidence.prompts} prompt{extensionTracking.evidence.prompts !== 1 ? 's' : ''}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span>•</span>
                              <span>{extensionTracking.evidence.generations} generation{extensionTracking.evidence.generations !== 1 ? 's' : ''}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span>•</span>
                              <span>{extensionTracking.evidence.downloads} download{extensionTracking.evidence.downloads !== 1 ? 's' : ''}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-2 pt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 bg-white dark:bg-gray-900 border-green-300 dark:border-green-700 text-green-900 dark:text-green-200 hover:bg-green-100 dark:hover:bg-green-900/40"
                            onClick={handleViewEvidence}
                          >
                            <Eye className="mr-2 h-3.5 w-3.5" />
                            View Evidence
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 bg-white dark:bg-gray-900 border-green-300 dark:border-green-700 text-green-900 dark:text-green-200 hover:bg-green-100 dark:hover:bg-green-900/40"
                            onClick={handleStopTracking}
                          >
                            <X className="mr-2 h-3.5 w-3.5" />
                            Stop Tracking
                          </Button>
                        </div>
                      </>
                    )}

                    {/* Inactive Status */}
                    {extensionTracking.status === "inactive" && (
                      <>
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">🟡</span>
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-yellow-900 dark:text-yellow-100">
                              Extension installed but not active
                            </p>
                            <p className="text-xs text-yellow-700 dark:text-yellow-300">
                              Click to activate tracking
                            </p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          className="w-full bg-yellow-600 hover:bg-yellow-700 dark:bg-yellow-700 dark:hover:bg-yellow-800 text-white"
                          onClick={handleActivateExtensionTracking}
                        >
                          <Play className="mr-2 h-3.5 w-3.5" />
                          Activate Tracking
                        </Button>
                      </>
                    )}

                    {/* Not Detected Status */}
                    {extensionTracking.status === "not-detected" && (
                      <>
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">🔴</span>
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-red-900 dark:text-red-100">
                              Extension not detected
                            </p>
                            <p className="text-xs text-red-700 dark:text-red-300">
                              Install extension to enable tracking
                            </p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          className="w-full bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 text-white"
                          onClick={handleInstallExtension}
                        >
                          <Download className="mr-2 h-3.5 w-3.5" />
                          Install Extension
                        </Button>
                      </>
                    )}

                    {/* Not Needed Status */}
                    {extensionTracking.status === "not-needed" && (
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">⚪</span>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                            Manual workflow - no tracking needed
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            Extension tracking is not required for manual tasks
                          </p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

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

                {/* Tool Selection UI - Show when step = 2 */}
                {task.aiWorkflowStep === 2 && (
                  <div className="space-y-4 pt-4 border-t">
                    <div>
                      <p className="text-sm font-medium mb-1">Select AI Tool</p>
                      <p className="text-sm text-muted-foreground">
                        Choose the AI tool you'll use to create this asset
                      </p>
                    </div>

                    {/* Search and Filter */}
                    {availableTools.length > 6 && (
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Search tools..."
                            value={toolSearchQuery}
                            onChange={(e) => setToolSearchQuery(e.target.value)}
                            className="pl-9"
                          />
                          {toolSearchQuery && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                              onClick={() => setToolSearchQuery("")}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                        <Select value={toolCategoryFilter} onValueChange={setToolCategoryFilter}>
                          <SelectTrigger className="w-[200px]">
                            <SelectValue placeholder="All Categories" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            {categories.map((category) => (
                              <SelectItem key={category} value={category}>
                                {category}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {/* Available Tools Grid */}
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-3">
                        Available Tools for this Project:
                      </p>
                      <div className="grid grid-cols-2 gap-3">
                        {filteredTools.map((tool) => (
                          <Card
                            key={tool.id}
                            className="group relative transition-all hover:shadow-md hover:border-blue-500/50 cursor-pointer"
                            onClick={() => handleSelectTool(tool)}
                          >
                            <CardContent className="p-4 space-y-3">
                              {/* Tool Icon & Name */}
                              <div className="flex items-center gap-2">
                                <span className="text-2xl">{tool.icon}</span>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-semibold truncate">
                                    {tool.name}
                                  </p>
                                  <p className="text-xs text-muted-foreground truncate">
                                    {tool.category}
                                  </p>
                                </div>
                              </div>

                              {/* Tracking Level Badge */}
                              <Badge
                                variant="outline"
                                className={cn(
                                  "text-[10px] w-full justify-center",
                                  tool.trackingLevel === "Full Tracking" && "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800",
                                  tool.trackingLevel === "Good Tracking" && "bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800",
                                  tool.trackingLevel === "Basic Tracking" && "bg-gray-50 dark:bg-gray-900/20 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-800"
                                )}
                              >
                                {tool.trackingLevel === "Full Tracking" && "✓ "}
                                {tool.trackingLevel}
                              </Badge>

                              {/* Select Button */}
                              <Button 
                                size="sm" 
                                className="w-full"
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleSelectTool(tool)
                                }}
                              >
                                Select
                              </Button>
                            </CardContent>
                          </Card>
                        ))}
                      </div>

                      {filteredTools.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-8">
                          No tools found matching your search.
                        </p>
                      )}
                    </div>

                    {/* Request New Tool */}
                    <div className="flex items-center justify-center gap-2 pt-2 border-t">
                      <span className="text-sm text-muted-foreground">🔍 Can't find your tool?</span>
                      <Button
                        variant="link"
                        size="sm"
                        className="h-auto p-0 text-blue-600 dark:text-blue-400"
                        onClick={() => setRequestToolModalOpen(true)}
                      >
                        Request New Tool
                      </Button>
                    </div>

                    {/* Step Navigation Controls */}
                    {renderStepNavigation(2)}
                  </div>
                )}

                {/* Tool Launch Interface - Show when step = 3 or 4 */}
                {(task.aiWorkflowStep === 3 || task.aiWorkflowStep === 4) && task.aiTool && (
                  <div className="space-y-4 pt-4 border-t">
                    <div>
                      <p className="text-sm font-medium mb-1">Ready to Create</p>
                      <p className="text-sm text-muted-foreground">
                        {task.aiWorkflowStep === 3 ? "Create your prompt in the AI tool" : "Generate your output"}
                      </p>
                    </div>

                    {/* Selected Tool Info */}
                    <div className="space-y-2 p-3 bg-muted/50 rounded-lg border">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Selected Tool</span>
                        <span className="text-sm font-semibold">{task.aiTool}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Tracking Level</span>
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[10px]",
                            task.aiTrackingLevel === "full" && "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800"
                          )}
                        >
                          {task.aiTrackingLevel === "full" ? "Full ✓" : task.aiTrackingLevel === "partial" ? "Good" : "Basic"}
                        </Badge>
                      </div>
                    </div>

                    {/* Extension Status */}
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-muted-foreground">Extension Status</p>
                      {extensionStatus === "active" && (
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-lg">🟢</span>
                          <span className="text-green-600 dark:text-green-400 font-medium">
                            Active and ready to track
                          </span>
                        </div>
                      )}
                      {extensionStatus === "inactive" && (
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-lg">🔴</span>
                          <span className="text-red-600 dark:text-red-400 font-medium">
                            Extension installed but inactive
                          </span>
                        </div>
                      )}
                      {extensionStatus === "not-detected" && (
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-lg">🟡</span>
                          <span className="text-yellow-600 dark:text-yellow-400 font-medium">
                            Extension not detected
                          </span>
                        </div>
                      )}
                    </div>

                    {/* What Will Be Tracked */}
                    {extensionStatus === "active" && (
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-muted-foreground">What will be tracked:</p>
                        <div className="space-y-1.5 text-sm">
                          <div className="flex items-center gap-2">
                            <Check className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                            <span>Your prompts and settings</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Check className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                            <span>Generation events</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Check className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                            <span>Output files</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Launch Button */}
                    <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-blue-200 dark:border-blue-800">
                      <CardContent className="p-4 space-y-3">
                        {extensionStatus === "active" ? (
                          <>
                            <Button 
                              size="lg" 
                              className="w-full text-base"
                              onClick={handleLaunchTool}
                              disabled={toolLaunched && sessionId !== null}
                            >
                              <Rocket className="mr-2 h-5 w-5" />
                              {toolLaunched ? "Tool Launched" : `Launch ${task.aiTool} with Tracking`}
                            </Button>
                            <p className="text-xs text-center text-muted-foreground">
                              {toolLaunched 
                                ? "Tool opened in new tab with tracking active"
                                : `This will open ${task.aiTool} in a new tab with automatic provenance tracking enabled`
                              }
                            </p>
                          </>
                        ) : extensionStatus === "inactive" ? (
                          <div className="space-y-2">
                            <Button 
                              size="lg" 
                              className="w-full"
                              onClick={handleActivateExtension}
                            >
                              Activate Extension
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="w-full"
                              onClick={handleContinueAnyway}
                            >
                              Continue Anyway
                            </Button>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <Button 
                              size="lg" 
                              className="w-full"
                              onClick={handleInstallExtension}
                            >
                              Install Extension
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="w-full"
                              onClick={handleContinueAnyway}
                            >
                              Continue Anyway
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Tips for Tool */}
                    <div className="space-y-2 p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
                      <p className="text-xs font-medium flex items-center gap-1.5">
                        <span className="text-sm">📋</span>
                        Tips for this tool:
                      </p>
                      <ul className="text-xs space-y-1 ml-5 list-disc text-muted-foreground">
                        <li>Use detailed prompts for best results</li>
                        <li>{task.aiTool} v6 recommended for this project</li>
                        <li>Check brand guidelines before generating</li>
                      </ul>
                    </div>

                    {/* Reference Materials */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-medium flex items-center gap-1.5">
                          <span className="text-sm">📎</span>
                          Reference Materials (3)
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        View inspiration assets before you start
                      </p>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="w-full"
                        onClick={() => toast.info("Reference materials coming soon")}
                      >
                        View References
                      </Button>
                    </div>

                    {/* Step Navigation Controls */}
                    {renderStepNavigation(task.aiWorkflowStep)}
                  </div>
                )}

                {/* Upload Output Interface - Show when step = 5 */}
                {task.aiWorkflowStep === 5 && task.aiTool && (
                  <div className="space-y-4 pt-4 border-t">
                    <div>
                      <p className="text-sm font-medium mb-1">Upload Generated Assets</p>
                      <p className="text-sm text-muted-foreground">
                        Upload the outputs you created with {task.aiTool}
                      </p>
                    </div>

                    {/* Drag & Drop Upload Area */}
                    <div
                      className={cn(
                        "relative border-2 border-dashed rounded-lg p-8 text-center transition-all",
                        isDragging 
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-950/20" 
                          : "border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600"
                      )}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                    >
                      <input
                        type="file"
                        id="file-upload"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        multiple
                        accept="image/*,video/*,application/pdf"
                        onChange={(e) => handleFileUpload(e.target.files)}
                      />
                      <div className="space-y-3">
                        <div className="flex justify-center">
                          <Upload className="h-12 w-12 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            📤 Drag & drop files here
                          </p>
                          <p className="text-sm text-muted-foreground">
                            or click to browse
                          </p>
                        </div>
                        <div className="text-xs text-muted-foreground space-y-1">
                          <p>Supported: PNG, JPG, PDF, MP4, etc.</p>
                          <p>Max file size: 100MB each</p>
                        </div>
                      </div>
                    </div>

                    {/* Link from Asset Library */}
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground mb-2">Or link existing asset:</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toast.info("Asset library coming soon")}
                      >
                        <Link2 className="mr-2 h-3.5 w-3.5" />
                        Link from Asset Library
                      </Button>
                    </div>

                    {/* Uploaded Outputs */}
                    {uploadedAssets.length > 0 && (
                      <div className="space-y-3 pt-4 border-t">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">
                            Uploaded Outputs: ({uploadedAssets.length})
                          </p>
                        </div>

                        <div className="space-y-3">
                          {uploadedAssets.map((asset) => (
                            <Card key={asset.id} className="group">
                              <CardContent className="p-4">
                                <div className="flex items-start gap-3">
                                  {/* Thumbnail placeholder */}
                                  <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center shrink-0">
                                    <FileText className="h-6 w-6 text-muted-foreground" />
                                  </div>

                                  {/* Asset Info */}
                                  <div className="flex-1 min-w-0 space-y-1.5">
                                    <p className="text-sm font-medium truncate">
                                      {asset.name}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      {formatFileSize(asset.size)} • Uploaded {formatRelativeTime(asset.uploadedAt)}
                                    </p>

                                    {/* Provenance Status */}
                                    {asset.provenanceStatus === "verified" && (
                                      <div className="flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400">
                                        <Check className="h-3.5 w-3.5" />
                                        <span className="font-medium">Provenance verified</span>
                                      </div>
                                    )}
                                    {asset.provenanceStatus === "matching" && (
                                      <div className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400">
                                        <div className="h-3.5 w-3.5 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
                                        <span>Matching to generation data...</span>
                                      </div>
                                    )}
                                    {asset.provenanceStatus === "manual-needed" && (
                                      <div className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400">
                                        <AlertCircle className="h-3.5 w-3.5" />
                                        <span className="font-medium">Manual verification needed</span>
                                      </div>
                                    )}
                                  </div>

                                  {/* Actions */}
                                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => toast.info("View asset coming soon")}
                                    >
                                      <Eye className="h-3.5 w-3.5 mr-1" />
                                      View
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleRemoveAsset(asset.id)}
                                    >
                                      <X className="h-3.5 w-3.5 mr-1" />
                                      Remove
                                    </Button>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>

                        {/* Step Navigation Controls */}
                        {renderStepNavigation(5)}
                      </div>
                    )}

                    {/* Step Navigation Controls (when no assets uploaded yet) */}
                    {uploadedAssets.length === 0 && renderStepNavigation(5)}
                  </div>
                )}

                {/* Review Interface - Show when step = 6 */}
                {task.aiWorkflowStep === 6 && task.aiTool && (
                  <div className="space-y-4 pt-4 border-t">
                    <div>
                      <p className="text-sm font-medium mb-1">Review Your Work</p>
                      <p className="text-sm text-muted-foreground">
                        Review outputs before submitting for clearance
                      </p>
                    </div>

                    {/* Generated Assets Section */}
                    <div className="space-y-3">
                      <p className="text-sm font-medium">
                        Generated Assets: ({uploadedAssets.length > 0 ? uploadedAssets.length : 2})
                      </p>

                      {/* Mock asset previews if none uploaded */}
                      {uploadedAssets.length === 0 && (
                        <div className="space-y-3">
                          <Card>
                            <CardContent className="p-4 space-y-4">
                              {/* Large Preview Area */}
                              <div className="w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-lg flex items-center justify-center">
                                <div className="text-center space-y-2">
                                  <FileText className="h-12 w-12 mx-auto text-muted-foreground" />
                                  <p className="text-sm font-medium">hero_image_v1.png</p>
                                </div>
                              </div>

                              {/* AI Evidence */}
                              <div className="space-y-2 p-3 bg-muted/50 rounded-lg">
                                <p className="text-xs font-medium">AI Evidence:</p>
                                <div className="space-y-1 text-xs">
                                  <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">Tool:</span>
                                    <span className="font-medium">{task.aiTool} v6</span>
                                  </div>
                                  <div className="flex items-start justify-between gap-2">
                                    <span className="text-muted-foreground shrink-0">Prompt:</span>
                                    <span className="font-medium text-right line-clamp-2">
                                      "futuristic city skyline with modern architecture, vibrant colors..."
                                    </span>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">Generated:</span>
                                    <span className="font-medium">
                                      {new Date().toLocaleString('en-US', { 
                                        month: 'short', 
                                        day: 'numeric', 
                                        hour: 'numeric', 
                                        minute: '2-digit' 
                                      })}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Actions */}
                              <div className="flex gap-2">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  className="flex-1"
                                  onClick={() => toast.info("Evidence viewer coming soon")}
                                >
                                  <Eye className="mr-2 h-3.5 w-3.5" />
                                  View Full Evidence
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  className="flex-1"
                                  onClick={() => toast.info("Download coming soon")}
                                >
                                  <Download className="mr-2 h-3.5 w-3.5" />
                                  Download
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      )}

                      {/* Show uploaded assets if they exist */}
                      {uploadedAssets.length > 0 && (
                        <div className="space-y-3">
                          {uploadedAssets.map((asset) => (
                            <Card key={asset.id}>
                              <CardContent className="p-4 space-y-4">
                                {/* Large Preview Area */}
                                <div className="w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-lg flex items-center justify-center">
                                  <div className="text-center space-y-2">
                                    <FileText className="h-12 w-12 mx-auto text-muted-foreground" />
                                    <p className="text-sm font-medium">{asset.name}</p>
                                  </div>
                                </div>

                                {/* AI Evidence */}
                                <div className="space-y-2 p-3 bg-muted/50 rounded-lg">
                                  <p className="text-xs font-medium">AI Evidence:</p>
                                  <div className="space-y-1 text-xs">
                                    <div className="flex items-center justify-between">
                                      <span className="text-muted-foreground">Tool:</span>
                                      <span className="font-medium">{task.aiTool} v6</span>
                                    </div>
                                    <div className="flex items-start justify-between gap-2">
                                      <span className="text-muted-foreground shrink-0">Prompt:</span>
                                      <span className="font-medium text-right line-clamp-2">
                                        "futuristic city skyline with modern architecture..."
                                      </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                      <span className="text-muted-foreground">Generated:</span>
                                      <span className="font-medium">{formatRelativeTime(asset.uploadedAt)}</span>
                                    </div>
                                  </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2">
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    className="flex-1"
                                    onClick={() => toast.info("Evidence viewer coming soon")}
                                  >
                                    <Eye className="mr-2 h-3.5 w-3.5" />
                                    View Full Evidence
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    className="flex-1"
                                    onClick={() => toast.info("Download coming soon")}
                                  >
                                    <Download className="mr-2 h-3.5 w-3.5" />
                                    Download
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Quality Check */}
                    <div className="space-y-3 pt-4 border-t">
                      <p className="text-sm font-medium">Quality Check:</p>
                      <div className="space-y-2">
                        <label className="flex items-center gap-3 cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={qualityChecks.meetsBrief}
                            onChange={() => handleToggleQualityCheck('meetsBrief')}
                            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm group-hover:text-foreground transition-colors">
                            Meets creative brief
                          </span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={qualityChecks.matchesBrand}
                            onChange={() => handleToggleQualityCheck('matchesBrand')}
                            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm group-hover:text-foreground transition-colors">
                            Matches brand guidelines
                          </span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={qualityChecks.appropriateAudience}
                            onChange={() => handleToggleQualityCheck('appropriateAudience')}
                            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm group-hover:text-foreground transition-colors">
                            Appropriate for target audience
                          </span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={qualityChecks.readyForReview}
                            onChange={() => handleToggleQualityCheck('readyForReview')}
                            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm group-hover:text-foreground transition-colors">
                            Ready for legal review
                          </span>
                        </label>
                      </div>
                    </div>

                    {/* Need to make changes? */}
                    <div className="space-y-3 pt-4 border-t">
                      <p className="text-sm font-medium">Need to make changes?</p>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={handleGenerateMore}
                        >
                          <ArrowLeft className="mr-2 h-4 w-4" />
                          Generate More
                        </Button>
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={handleEditAndReupload}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Edit & Re-upload
                        </Button>
                      </div>
                    </div>

                    {/* Step Navigation Controls */}
                    {renderStepNavigation(6)}
                  </div>
                )}

                {/* Submit for Clearance Interface - Show when step = 7 */}
                {task.aiWorkflowStep === 7 && task.aiTool && (
                  <div className="space-y-4 pt-4 border-t">
                    <div>
                      <p className="text-sm font-medium mb-1">Submitted for Clearance</p>
                      <p className="text-sm text-muted-foreground">
                        Your assets have been submitted and are now being reviewed
                      </p>
                    </div>

                    {/* Submission Confirmation */}
                    <Card className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/20">
                      <CardContent className="p-4 space-y-3">
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/30">
                            <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
                          </div>
                          <div className="flex-1 space-y-2">
                            <h3 className="font-semibold text-green-900 dark:text-green-200">
                              ✓ Submission Successful
                            </h3>
                            <p className="text-sm text-green-700 dark:text-green-300">
                              Your {uploadedAssets.length > 0 ? uploadedAssets.length : 2} asset(s) have been submitted for clearance review. 
                              The admin, legal, and QA teams have been notified.
                            </p>
                            <div className="flex items-center gap-2 text-xs text-green-600 dark:text-green-400">
                              <Clock className="h-3.5 w-3.5" />
                              <span>Submitted {new Date().toLocaleString('en-US', { 
                                month: 'short', 
                                day: 'numeric', 
                                hour: 'numeric', 
                                minute: '2-digit' 
                              })}</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Clearance Progress */}
                    <div className="space-y-3">
                      <p className="text-sm font-medium">Clearance Review Status</p>
                      
                      {/* Admin Review Lane */}
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-full bg-yellow-100 dark:bg-yellow-900/30">
                                <Clock className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                              </div>
                              <div>
                                <p className="text-sm font-medium">Admin Review</p>
                                <p className="text-xs text-muted-foreground">Pending review</p>
                              </div>
                            </div>
                            <Badge variant="outline" className="bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800">
                              Pending
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Legal Review Lane */}
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-full bg-yellow-100 dark:bg-yellow-900/30">
                                <Clock className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                              </div>
                              <div>
                                <p className="text-sm font-medium">Legal Review</p>
                                <p className="text-xs text-muted-foreground">Pending review</p>
                              </div>
                            </div>
                            <Badge variant="outline" className="bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800">
                              Pending
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>

                      {/* QA Review Lane */}
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-full bg-yellow-100 dark:bg-yellow-900/30">
                                <Clock className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                              </div>
                              <div>
                                <p className="text-sm font-medium">QA Review</p>
                                <p className="text-xs text-muted-foreground">Pending review</p>
                              </div>
                            </div>
                            <Badge variant="outline" className="bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800">
                              Pending
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* What happens next */}
                    <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-blue-900 dark:text-blue-200">
                            What happens next?
                          </p>
                          <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1 list-disc list-inside">
                            <li>Admin, Legal, and QA teams will review your assets</li>
                            <li>You'll receive notifications as reviews are completed</li>
                            <li>If any lane requests changes, you'll see feedback here</li>
                            <li>Once all lanes approve, assets will be cleared for use</li>
                          </ul>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Actions */}
                    <div className="space-y-2">
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={handleViewEvidence}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        View Full Evidence
                      </Button>
                      <p className="text-xs text-muted-foreground text-center">
                        You'll be notified when the review is complete
                      </p>
                    </div>

                    {/* Mark workflow as complete */}
                    <div className="pt-4 border-t">
                      <Button
                        className="w-full"
                        onClick={() => {
                          if (!task) return
                          setTask({
                            ...task,
                            completedSteps: [...(task.completedSteps || []), 7],
                          })
                          toast.success("✓ Workflow complete! Task awaiting clearance results.")
                        }}
                        disabled={(task.completedSteps || []).includes(7)}
                      >
                        <Check className="mr-2 h-4 w-4" />
                        {(task.completedSteps || []).includes(7) ? 'Workflow Complete' : 'Acknowledge Submission'}
                      </Button>
                    </div>
                  </div>
                )}

                {/* AI Tool Info */}
                {task.aiTool && task.aiWorkflowStep && task.aiWorkflowStep > 7 && (
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

          {/* Comments - Linear Style with @Mentions & Reactions */}
          <Card id="comments-section" className="border-0 shadow-none">
            <CardContent className="p-6">
              <TaskComments
                comments={comments}
                currentUserId={currentUserId}
                currentUserInitials={currentUserInitials}
                teamMembers={TEAM_MEMBERS}
                onAddComment={handleAddComment}
                onAddReaction={handleAddReaction}
                onRemoveReaction={handleRemoveReaction}
              />
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
                  className="font-medium bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800"
                >
                  Medium
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
              {/* AI Task Actions - Step-specific */}
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

      {/* Request New Tool Modal */}
      <Dialog open={requestToolModalOpen} onOpenChange={setRequestToolModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Request New AI Tool</DialogTitle>
            <DialogDescription>
              Submit a request for a new AI tool to be added to the platform.
              Our admin team will review and approve it.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="toolName">Tool Name *</Label>
              <Input
                id="toolName"
                placeholder="e.g., Claude, Gemini, etc."
                value={requestToolForm.toolName}
                onChange={(e) => setRequestToolForm({ ...requestToolForm, toolName: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="toolUrl">Tool URL *</Label>
              <Input
                id="toolUrl"
                type="url"
                placeholder="https://..."
                value={requestToolForm.toolUrl}
                onChange={(e) => setRequestToolForm({ ...requestToolForm, toolUrl: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason">Why do you need this tool? *</Label>
              <Textarea
                id="reason"
                placeholder="Explain your use case and why this tool would benefit the team..."
                rows={4}
                value={requestToolForm.reason}
                onChange={(e) => setRequestToolForm({ ...requestToolForm, reason: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setRequestToolModalOpen(false)
                setRequestToolForm({ toolName: "", toolUrl: "", reason: "" })
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleRequestNewTool}>
              Submit Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Address Feedback Dialog */}
      <Dialog open={addressFeedbackOpen} onOpenChange={setAddressFeedbackOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Address Feedback</DialogTitle>
            <DialogDescription>
              Choose how you'd like to address the feedback from the clearance team.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-3 py-4">
            <p className="text-sm font-medium mb-4">What would you like to do?</p>
            
            <label className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
              <input
                type="radio"
                name="response"
                value="generate"
                checked={selectedResponse === "generate"}
                onChange={() => setSelectedResponse("generate")}
                className="mt-1"
              />
              <div>
                <p className="text-sm font-medium">Generate new version with corrections</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Start from the prompt step and generate a new asset
                </p>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
              <input
                type="radio"
                name="response"
                value="upload"
                checked={selectedResponse === "upload"}
                onChange={() => setSelectedResponse("upload")}
                className="mt-1"
              />
              <div>
                <p className="text-sm font-medium">Upload revised asset</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Upload a manually corrected version of the asset
                </p>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
              <input
                type="radio"
                name="response"
                value="document"
                checked={selectedResponse === "document"}
                onChange={() => setSelectedResponse("document")}
                className="mt-1"
              />
              <div>
                <p className="text-sm font-medium">Add licensing documentation</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Provide additional documentation or proof to address the concern
                </p>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
              <input
                type="radio"
                name="response"
                value="respond"
                checked={selectedResponse === "respond"}
                onChange={() => setSelectedResponse("respond")}
                className="mt-1"
              />
              <div>
                <p className="text-sm font-medium">Respond to reviewer</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Add a comment in the clearance thread to discuss the feedback
                </p>
              </div>
            </label>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setAddressFeedbackOpen(false)
                setSelectedResponse(null)
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleAddressFeedbackProceed}
              disabled={!selectedResponse}
            >
              Proceed
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Skip Step Confirmation Dialog */}
      <Dialog open={skipStepDialogOpen} onOpenChange={setSkipStepDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Skip This Step?</DialogTitle>
            <DialogDescription>
              Skipping workflow steps may affect provenance tracking and evidence quality.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="flex items-start gap-3 p-4 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 shrink-0 mt-0.5" />
              <div className="space-y-2">
                <p className="text-sm font-medium text-yellow-900 dark:text-yellow-200">
                  ⚠️ Warning: Skipping may affect provenance tracking
                </p>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  If you skip this step, you may not be able to:
                </p>
                <ul className="text-sm text-yellow-700 dark:text-yellow-300 list-disc list-inside space-y-1">
                  <li>Capture complete evidence of the creation process</li>
                  <li>Prove authenticity and ownership of generated assets</li>
                  <li>Meet compliance requirements for AI-generated content</li>
                </ul>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setSkipStepDialogOpen(false)
                setSkipStepNumber(null)
              }}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={handleConfirmSkipStep}
            >
              Skip Anyway
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Convert to Manual Dialog */}
      <Dialog open={convertToManualDialogOpen} onOpenChange={setConvertToManualDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Convert to Manual Mode?</DialogTitle>
            <DialogDescription>
              This will remove all AI workflow features from this task.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
              <div className="space-y-2">
                <p className="text-sm font-medium text-red-900 dark:text-red-200">
                  ⚠️ Warning: This action cannot be undone
                </p>
                <p className="text-sm text-red-700 dark:text-red-300">
                  Converting to Manual mode will:
                </p>
                <ul className="text-sm text-red-700 dark:text-red-300 list-disc list-inside space-y-1">
                  <li>Stop AI tracking permanently</li>
                  <li>Remove all workflow steps</li>
                  <li>Preserve existing evidence (read-only)</li>
                  <li>Cannot be converted back to AI mode</li>
                </ul>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setConvertToManualDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={handleConvertToManual}
            >
              Convert to Manual
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Restart Workflow Dialog */}
      <Dialog open={restartWorkflowDialogOpen} onOpenChange={setRestartWorkflowDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Restart Workflow?</DialogTitle>
            <DialogDescription>
              This will reset all workflow progress to the beginning.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="flex items-start gap-3 p-4 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 shrink-0 mt-0.5" />
              <div className="space-y-2">
                <p className="text-sm font-medium text-yellow-900 dark:text-yellow-200">
                  This will reset all workflow steps to the beginning
                </p>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  Your existing assets and evidence will be preserved, but you'll need to go through all steps again.
                </p>
                <p className="text-sm text-yellow-700 dark:text-yellow-300 font-medium mt-2">
                  Continue?
                </p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setRestartWorkflowDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleRestartWorkflow}
            >
              Restart Workflow
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Task Dialog */}
      <Dialog open={deleteTaskDialogOpen} onOpenChange={setDeleteTaskDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Delete Task?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the task and all associated data.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
              <div className="space-y-2">
                <p className="text-sm font-medium text-red-900 dark:text-red-200">
                  ⚠️ Warning: This will permanently delete:
                </p>
                <ul className="text-sm text-red-700 dark:text-red-300 list-disc list-inside space-y-1">
                  <li>Task details and description</li>
                  <li>All workflow progress and evidence</li>
                  <li>All comments and activity history</li>
                  <li>All attached assets</li>
                </ul>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setDeleteTaskDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={handleDeleteTask}
            >
              Delete Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AI Evidence Modal */}
      <Dialog open={evidenceModalOpen} onOpenChange={setEvidenceModalOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>AI Evidence for {task?.title}</DialogTitle>
            <DialogDescription>
              Complete audit trail of AI generation activity
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Summary Section */}
            <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg space-y-2">
              <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-3">
                AI Evidence Summary
              </h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-muted-foreground">Tool Used:</span>
                  <span className="ml-2 font-medium">{mockEvidence.tool}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Session ID:</span>
                  <span className="ml-2 font-mono text-xs">{mockEvidence.sessionId}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Tracking Level:</span>
                  <Badge className="ml-2 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800">
                    <Check className="h-3 w-3 mr-1" />
                    {mockEvidence.trackingLevel === 'full' ? 'Full' : mockEvidence.trackingLevel}
                  </Badge>
                </div>
                <div>
                  <span className="text-muted-foreground">Session Duration:</span>
                  <span className="ml-2 font-medium">{mockEvidence.sessionDuration}</span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Prompts Section */}
            <div>
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Prompts ({mockEvidence.prompts.length})
              </h3>
              <div className="space-y-3">
                {mockEvidence.prompts.map((prompt, index) => (
                  <Card key={index} className="overflow-hidden">
                    <CardHeader 
                      className="py-3 px-4 bg-muted/50 cursor-pointer hover:bg-muted/70 transition-colors"
                      onClick={() => togglePromptExpanded(index)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <ChevronDown 
                            className={cn(
                              "h-4 w-4 transition-transform",
                              expandedPrompts.includes(index) ? "rotate-0" : "-rotate-90"
                            )}
                          />
                          <span className="font-medium text-sm">
                            {new Date(prompt.timestamp).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: 'numeric',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        {prompt.hasScreenshot && (
                          <Badge variant="outline" className="text-xs">
                            <Image className="h-3 w-3 mr-1" />
                            Screenshot
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    {expandedPrompts.includes(index) && (
                      <CardContent className="pt-4 space-y-3">
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Prompt:</p>
                          <p className="text-sm font-mono bg-muted p-3 rounded">{prompt.text}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <span className="text-muted-foreground">Model:</span>
                            <span className="ml-2 font-medium">{prompt.model}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Settings:</span>
                            <span className="ml-2 font-mono text-xs">{prompt.settings}</span>
                          </div>
                        </div>
                        {prompt.hasScreenshot && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => toast.info("Screenshot viewer coming soon")}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View Screenshot
                          </Button>
                        )}
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>
            </div>

            <Separator />

            {/* Generations Section */}
            <div>
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Generations ({mockEvidence.generations.length})
              </h3>
              <div className="space-y-3">
                {mockEvidence.generations.map((gen, index) => (
                  <Card key={index} className="overflow-hidden">
                    <CardHeader 
                      className="py-3 px-4 bg-muted/50 cursor-pointer hover:bg-muted/70 transition-colors"
                      onClick={() => toggleGenerationExpanded(index)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <ChevronDown 
                            className={cn(
                              "h-4 w-4 transition-transform",
                              expandedGenerations.includes(index) ? "rotate-0" : "-rotate-90"
                            )}
                          />
                          <span className="font-medium text-sm">
                            Job #{gen.jobId}
                          </span>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {gen.outputCount} outputs
                        </Badge>
                      </div>
                    </CardHeader>
                    {expandedGenerations.includes(index) && (
                      <CardContent className="pt-4">
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <span className="text-muted-foreground">Started:</span>
                            <span className="ml-2 font-medium">
                              {new Date(gen.startTime).toLocaleTimeString('en-US', {
                                hour: 'numeric',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Completed:</span>
                            <span className="ml-2 font-medium">
                              {new Date(gen.endTime).toLocaleTimeString('en-US', {
                                hour: 'numeric',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Duration:</span>
                            <span className="ml-2 font-medium">{gen.duration}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Outputs:</span>
                            <span className="ml-2 font-medium">{gen.outputCount} generated</span>
                          </div>
                        </div>
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>
            </div>

            <Separator />

            {/* Downloads Section */}
            <div>
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <Download className="h-5 w-5" />
                Downloads ({mockEvidence.downloads.length})
              </h3>
              <div className="space-y-3">
                {mockEvidence.downloads.map((download, index) => (
                  <Card key={index} className="overflow-hidden">
                    <CardHeader 
                      className="py-3 px-4 bg-muted/50 cursor-pointer hover:bg-muted/70 transition-colors"
                      onClick={() => toggleDownloadExpanded(index)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <ChevronDown 
                            className={cn(
                              "h-4 w-4 transition-transform",
                              expandedDownloads.includes(index) ? "rotate-0" : "-rotate-90"
                            )}
                          />
                          <span className="font-medium text-sm">{download.filename}</span>
                        </div>
                        {download.matchedToAsset && (
                          <Badge className="text-xs bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800">
                            <FileCheck className="h-3 w-3 mr-1" />
                            Matched
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    {expandedDownloads.includes(index) && (
                      <CardContent className="pt-4 space-y-3">
                        <div className="text-sm">
                          <span className="text-muted-foreground">Downloaded:</span>
                          <span className="ml-2 font-medium">
                            {new Date(download.timestamp).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: 'numeric',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">File Hash:</p>
                          <p className="text-xs font-mono bg-muted p-2 rounded break-all">
                            {download.fileHash}
                          </p>
                        </div>
                        {download.matchedToAsset && (
                          <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-400">
                            <Check className="h-4 w-4" />
                            <span>Matched to uploaded asset</span>
                          </div>
                        )}
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline"
              onClick={() => toast.info("PDF report export coming soon")}
            >
              <Download className="h-4 w-4 mr-2" />
              Download Full Report
            </Button>
            <Button onClick={() => setEvidenceModalOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
