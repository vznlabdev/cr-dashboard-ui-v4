"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  ArrowLeft, 
  Check,
  ChevronRight,
  Circle,
  Zap,
  Eye,
  Rocket,
  Clock,
  AlertCircle,
  Play,
  Download,
  FileText,
  MessageSquare,
  Target,
  Upload,
  Edit,
  Search,
  X,
  ChevronDown,
  FileCheck,
  Image,
  Link2,
} from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { getTaskById } from "@/lib/mock-data/projects-tasks"
import { useData } from "@/contexts/data-context"
import type { Task } from "@/types"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { aiToolsWhitelist, getAvailableToolsForProject, type AITool } from "@/lib/ai-tools-data"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export default function TaskWorkflowPage() {
  const params = useParams()
  const router = useRouter()
  const taskId = params.taskId as string
  const projectId = params.id as string
  
  const { getProjectById } = useData()
  const project = getProjectById(projectId)
  
  const [task, setTask] = useState<Task | null>(null)
  const [loading, setLoading] = useState(true)

  // Workflow state
  const [toolSearchQuery, setToolSearchQuery] = useState("")
  const [toolCategoryFilter, setToolCategoryFilter] = useState("all")
  const [requestToolModalOpen, setRequestToolModalOpen] = useState(false)
  const [uploadedAssets, setUploadedAssets] = useState<any[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [qualityChecks, setQualityChecks] = useState({
    meetsBrief: false,
    matchesBrand: false,
    appropriateAudience: false,
    readyForReview: false,
  })

  // Extension tracking state
  const [extensionTracking, setExtensionTracking] = useState({
    status: 'not-detected' as 'active' | 'inactive' | 'not-detected' | 'not-needed',
    sessionId: '',
    lastActivity: '',
    evidenceCounts: { prompts: 0, generations: 0, downloads: 0 }
  })

  // Load task
  useEffect(() => {
    const loadedTask = getTaskById(taskId)
    setTask(loadedTask || null)
    setLoading(false)
  }, [taskId])

  if (loading || !task) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-sm text-muted-foreground">Loading workflow...</p>
        </div>
      </div>
    )
  }

  // Check if task has AI workflow
  if (!task.mode || task.mode === 'manual') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center space-y-4">
            <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground" />
            <div>
              <h3 className="font-semibold text-lg mb-2">No AI Workflow</h3>
              <p className="text-sm text-muted-foreground">
                This task doesn't have an AI workflow enabled.
              </p>
            </div>
            <Button asChild>
              <Link href={`/projects/${projectId}/tasks/${taskId}`}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Task
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const currentStep = task.aiWorkflowStep || 1
  const completedSteps = task.completedSteps || []
  const totalSteps = 7

  // Calculate progress
  const progressPercent = Math.round((completedSteps.length / totalSteps) * 100)

  // Workflow steps
  const workflowSteps = [
    { num: 1, label: "Brief & Context" },
    { num: 2, label: "Select AI Tool" },
    { num: 3, label: "Create Prompt" },
    { num: 4, label: "Generate Output" },
    { num: 5, label: "Upload Output" },
    { num: 6, label: "Review & Iterate" },
    { num: 7, label: "Submit for Clearance" },
  ]

  // Get status icon for step
  const getStepIcon = (stepNum: number) => {
    if (completedSteps.includes(stepNum)) {
      return <Check className="h-4 w-4 text-green-500" />
    }
    if (stepNum === currentStep) {
      return <ChevronRight className="h-4 w-4 text-blue-500" />
    }
    return <Circle className="h-4 w-4 text-gray-400" />
  }

  // Tool selection handler
  const handleSelectTool = (tool: AITool) => {
    if (!task) return
    
    let trackingLevel: 'full' | 'partial' | 'none' = 'none'
    if (tool.trackingLevel === "Full Tracking") {
      trackingLevel = 'full'
    } else if (tool.trackingLevel === "Good Tracking" || tool.trackingLevel === "Basic Tracking") {
      trackingLevel = 'partial'
    }
    
    setTask({
      ...task,
      aiTool: tool.name,
      aiTrackingLevel: trackingLevel,
      aiWorkflowStep: 3,
      completedSteps: [...(task.completedSteps || []), 2],
    })
    
    toast.success(`✓ ${tool.name} selected`)
  }

  // File upload handler
  const handleFileUpload = (files: FileList | null) => {
    if (!files) return
    
    Array.from(files).forEach((file) => {
      const asset = {
        id: `asset-${Date.now()}-${Math.random()}`,
        filename: file.name,
        size: file.size,
        uploadedAt: new Date().toISOString(),
        provenanceVerified: Math.random() > 0.3,
      }
      setUploadedAssets(prev => [...prev, asset])
    })
    
    toast.success(`✓ ${files.length} file(s) uploaded`)
  }

  // Available tools for project
  const availableTools = getAvailableToolsForProject(projectId)
  const filteredTools = availableTools.filter(tool => {
    const matchesSearch = tool.name.toLowerCase().includes(toolSearchQuery.toLowerCase())
    const matchesCategory = toolCategoryFilter === "all" || tool.category === toolCategoryFilter
    return matchesSearch && matchesCategory
  })

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          {/* Breadcrumb */}
          <div className="flex items-center text-sm text-muted-foreground mb-3">
            <Link href="/projects" className="hover:text-foreground transition-colors">
              Projects
            </Link>
            <ChevronRight className="h-4 w-4 mx-1" />
            <Link href={`/projects/${projectId}/tasks`} className="hover:text-foreground transition-colors">
              {project?.name || 'Project'}
            </Link>
            <ChevronRight className="h-4 w-4 mx-1" />
            <Link href={`/projects/${projectId}/tasks/${taskId}`} className="hover:text-foreground transition-colors truncate max-w-[200px]">
              {task.title}
            </Link>
            <ChevronRight className="h-4 w-4 mx-1" />
            <span className="text-foreground font-medium">AI Workflow</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                asChild
              >
                <Link href={`/projects/${projectId}/tasks/${taskId}`}>
                  <ArrowLeft className="h-5 w-5" />
                </Link>
              </Button>
              <div>
                <h1 className="text-xl font-bold">{task.title}</h1>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className={cn(
                    "gap-1",
                    task.mode === "generative" && "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800",
                    task.mode === "assisted" && "bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800"
                  )}>
                    <Zap className="h-3 w-3" />
                    {task.mode === "generative" ? "AI Generative" : "AI Assisted"}
                  </Badge>
                  {task.aiTool && (
                    <span className="text-sm text-muted-foreground">• {task.aiTool}</span>
                  )}
                </div>
              </div>
            </div>
            
            <Button variant="outline" size="sm" asChild>
              <Link href={`/projects/${projectId}/tasks/${taskId}`}>
                View Task Details
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
          {/* Sidebar - Workflow Progress */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Workflow Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">
                      {completedSteps.length} of {totalSteps} steps
                    </span>
                    <span className="font-medium">{progressPercent}%</span>
                  </div>
                  <Progress value={progressPercent} className="h-2" />
                </div>

                <div className="space-y-2">
                  {workflowSteps.map((step) => (
                    <div
                      key={step.num}
                      className={cn(
                        "flex items-start gap-3 p-2 rounded-lg transition-colors",
                        step.num === currentStep && "bg-blue-50 dark:bg-blue-900/20"
                      )}
                    >
                      <div className="mt-0.5">
                        {getStepIcon(step.num)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={cn(
                          "text-sm font-medium",
                          step.num === currentStep && "text-blue-600 dark:text-blue-400",
                          completedSteps.includes(step.num) && "text-green-600 dark:text-green-400"
                        )}>
                          {step.num}. {step.label}
                        </p>
                        {completedSteps.includes(step.num) && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Completed
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* AI Evidence Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <FileCheck className="h-4 w-4" />
                  AI Evidence
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Prompts:</span>
                    <span className="font-medium">3</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Generations:</span>
                    <span className="font-medium">4</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Downloads:</span>
                    <span className="font-medium">2</span>
                  </div>
                </div>
                <Separator />
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-green-500" />
                    <span className="text-muted-foreground">Provenance verified</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-muted-foreground">Session: 45 min</span>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="w-full" onClick={() => {
                  const evidenceCard = document.getElementById('evidence-section')
                  evidenceCard?.scrollIntoView({ behavior: 'smooth' })
                }}>
                  <Eye className="mr-2 h-3.5 w-3.5" />
                  View Details
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Main Workflow Area */}
          <div className="space-y-6">
            {/* Current Step Display */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>
                    Step {currentStep}: {workflowSteps[currentStep - 1]?.label}
                  </CardTitle>
                  <Badge variant="outline">
                    {currentStep} / {totalSteps}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {/* Step-specific content will go here */}
                {currentStep === 1 && (
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Review the task brief and prepare for AI-assisted creation.
                    </p>
                    <div className="p-4 border rounded-lg bg-muted/50">
                      <h4 className="font-medium mb-2">Task Details</h4>
                      <div className="space-y-2 text-sm">
                        <div><span className="text-muted-foreground">Type:</span> {task.deliverableType || 'Not specified'}</div>
                        <div><span className="text-muted-foreground">Target Audience:</span> {task.targetAudience || 'Not specified'}</div>
                        {task.intendedUses && task.intendedUses.length > 0 && (
                          <div><span className="text-muted-foreground">Intended Uses:</span> {task.intendedUses.join(', ')}</div>
                        )}
                      </div>
                    </div>
                    <Button onClick={() => setTask({ ...task, aiWorkflowStep: 2, completedSteps: [...(task.completedSteps || []), 1] })}>
                      Continue to Tool Selection
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Choose the AI tool you'll use to create this asset
                    </p>

                    {/* Tool Search and Filter */}
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          placeholder="Search tools..."
                          className="pl-9"
                          value={toolSearchQuery}
                          onChange={(e) => setToolSearchQuery(e.target.value)}
                        />
                      </div>
                      <Select value={toolCategoryFilter} onValueChange={setToolCategoryFilter}>
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Categories</SelectItem>
                          <SelectItem value="Image Generation">Image Generation</SelectItem>
                          <SelectItem value="Text Generation">Text Generation</SelectItem>
                          <SelectItem value="Video Generation">Video Generation</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Tool Grid */}
                    <div className="grid gap-3 sm:grid-cols-2">
                      {filteredTools.map((tool) => (
                        <Card key={tool.id} className="cursor-pointer hover:border-blue-500 transition-colors">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-2">
                              <div className="text-2xl">{tool.icon}</div>
                              <Badge variant="outline" className="text-xs">
                                {tool.trackingLevel === "Full Tracking" ? "Full" : tool.trackingLevel === "Good Tracking" ? "Good" : "Basic"}
                              </Badge>
                            </div>
                            <h4 className="font-medium mb-1">{tool.name}</h4>
                            <p className="text-xs text-muted-foreground mb-3">{tool.category}</p>
                            <Button size="sm" className="w-full" onClick={() => handleSelectTool(tool)}>
                              Select
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    {filteredTools.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        <p className="text-sm">No tools found matching your criteria</p>
                      </div>
                    )}

                    <Button variant="outline" onClick={() => setRequestToolModalOpen(true)}>
                      Request New Tool
                    </Button>
                  </div>
                )}

                {currentStep === 3 && (
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Launch {task.aiTool} and create your prompts
                    </p>
                    <div className="p-4 border rounded-lg space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Extension Status</span>
                        <Badge variant="outline" className="text-xs text-yellow-600 border-yellow-600">
                          Not Detected
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Install the browser extension to enable automatic tracking
                      </p>
                      <Button size="sm" variant="outline">
                        <Download className="mr-2 h-4 w-4" />
                        Install Extension
                      </Button>
                    </div>
                    <Button className="w-full" onClick={() => {
                      window.open(`https://example.com/${task.aiTool}`, '_blank')
                      toast.success(`✓ Launched ${task.aiTool}`)
                    }}>
                      <Rocket className="mr-2 h-4 w-4" />
                      Launch {task.aiTool}
                    </Button>
                    <Button variant="outline" className="w-full" onClick={() => setTask({ ...task, aiWorkflowStep: 4, completedSteps: [...completedSteps, 3] })}>
                      Mark Complete
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                )}

                {currentStep === 4 && (
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Generate your outputs using {task.aiTool}
                    </p>
                    <div className="p-4 border rounded-lg bg-blue-50 dark:bg-blue-900/20">
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <Eye className="h-4 w-4" />
                        Tips for Generation
                      </h4>
                      <ul className="text-sm space-y-1 list-disc list-inside text-muted-foreground">
                        <li>Use detailed, specific prompts</li>
                        <li>Reference brand guidelines</li>
                        <li>Generate multiple variations</li>
                        <li>Save all generations for review</li>
                      </ul>
                    </div>
                    <Button className="w-full" onClick={() => setTask({ ...task, aiWorkflowStep: 5, completedSteps: [...completedSteps, 4] })}>
                      Continue to Upload
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                )}

                {currentStep === 5 && (
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Upload the outputs you created
                    </p>

                    {/* Drag & Drop Upload */}
                    <div
                      className={cn(
                        "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
                        isDragging ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" : "border-border"
                      )}
                      onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
                      onDragLeave={() => setIsDragging(false)}
                      onDrop={(e) => {
                        e.preventDefault()
                        setIsDragging(false)
                        handleFileUpload(e.dataTransfer.files)
                      }}
                    >
                      <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm font-medium mb-1">Drag & drop files here</p>
                      <p className="text-xs text-muted-foreground mb-3">or click to browse</p>
                      <Input
                        type="file"
                        multiple
                        className="hidden"
                        id="file-upload"
                        onChange={(e) => handleFileUpload(e.target.files)}
                      />
                      <Button size="sm" variant="outline" asChild>
                        <label htmlFor="file-upload" className="cursor-pointer">
                          Browse Files
                        </label>
                      </Button>
                    </div>

                    {/* Uploaded Assets */}
                    {uploadedAssets.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium">Uploaded Assets ({uploadedAssets.length})</h4>
                        {uploadedAssets.map((asset) => (
                          <div key={asset.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center gap-3">
                              <FileText className="h-5 w-5 text-muted-foreground" />
                              <div>
                                <p className="text-sm font-medium">{asset.filename}</p>
                                <p className="text-xs text-muted-foreground">
                                  {(asset.size / 1024).toFixed(1)} KB
                                </p>
                              </div>
                            </div>
                            <Badge variant={asset.provenanceVerified ? "default" : "outline"} className="text-xs">
                              {asset.provenanceVerified ? (
                                <>
                                  <FileCheck className="h-3 w-3 mr-1" />
                                  Verified
                                </>
                              ) : (
                                <>
                                  <AlertCircle className="h-3 w-3 mr-1" />
                                  Manual Check
                                </>
                              )}
                            </Badge>
                          </div>
                        ))}
                        <Button className="w-full" onClick={() => setTask({ ...task, aiWorkflowStep: 6, completedSteps: [...completedSteps, 5] })}>
                          Continue to Review
                          <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {currentStep === 6 && (
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Review your work before submitting for clearance
                    </p>

                    {/* Quality Checklist */}
                    <div className="border rounded-lg p-4 space-y-3">
                      <h4 className="font-medium text-sm mb-3">Quality Checklist</h4>
                      {Object.entries({
                        meetsBrief: "Meets creative brief",
                        matchesBrand: "Matches brand guidelines",
                        appropriateAudience: "Appropriate for target audience",
                        readyForReview: "Ready for legal review"
                      }).map(([key, label]) => (
                        <label key={key} className="flex items-center gap-3 cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={qualityChecks[key as keyof typeof qualityChecks]}
                            onChange={() => setQualityChecks(prev => ({ ...prev, [key]: !prev[key as keyof typeof qualityChecks] }))}
                            className="w-4 h-4 rounded border-gray-300"
                          />
                          <span className="text-sm">{label}</span>
                        </label>
                      ))}
                    </div>

                    {/* Asset Preview (if uploaded) */}
                    {uploadedAssets.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium">Generated Assets ({uploadedAssets.length})</h4>
                        <div className="grid gap-3 sm:grid-cols-2">
                          {uploadedAssets.map((asset) => (
                            <Card key={asset.id}>
                              <CardContent className="p-4">
                                <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded mb-3 flex items-center justify-center">
                                  <FileText className="h-8 w-8 text-muted-foreground" />
                                </div>
                                <p className="text-sm font-medium truncate">{asset.filename}</p>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button variant="outline" className="flex-1" onClick={() => setTask({ ...task, aiWorkflowStep: 3 })}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Generate More
                      </Button>
                      <Button variant="outline" className="flex-1" onClick={() => setTask({ ...task, aiWorkflowStep: 5 })}>
                        <Edit className="mr-2 h-4 w-4" />
                        Re-upload
                      </Button>
                    </div>

                    <Button className="w-full" onClick={() => {
                      setTask({ ...task, aiWorkflowStep: 7, completedSteps: [...completedSteps, 6], status: 'delivered' })
                      toast.success("✓ Submitted for clearance!")
                    }}>
                      Submit for Clearance
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                )}

                {currentStep === 7 && (
                  <div className="space-y-4">
                    <div className="border-2 border-green-500 rounded-lg p-6 bg-green-50 dark:bg-green-900/20">
                      <div className="flex items-start gap-3 mb-4">
                        <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/30">
                          <Check className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-green-900 dark:text-green-200 mb-1">
                            Submission Successful
                          </h3>
                          <p className="text-sm text-green-700 dark:text-green-300">
                            Your assets have been submitted for clearance review
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-900 rounded">
                          <span className="text-sm font-medium">Admin Review</span>
                          <Badge variant="outline" className="text-yellow-600 border-yellow-600">Pending</Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-900 rounded">
                          <span className="text-sm font-medium">Legal Review</span>
                          <Badge variant="outline" className="text-yellow-600 border-yellow-600">Pending</Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-900 rounded">
                          <span className="text-sm font-medium">QA Review</span>
                          <Badge variant="outline" className="text-yellow-600 border-yellow-600">Pending</Badge>
                        </div>
                      </div>
                    </div>

                    <div className="border rounded-lg p-4 bg-blue-50 dark:bg-blue-900/20">
                      <h4 className="font-medium mb-2">What happens next?</h4>
                      <ul className="text-sm space-y-1 list-disc list-inside text-muted-foreground">
                        <li>Admin, Legal, and QA teams will review your assets</li>
                        <li>You'll receive notifications as reviews complete</li>
                        <li>If changes are needed, you'll see feedback here</li>
                        <li>Once approved, assets will be cleared for use</li>
                      </ul>
                    </div>

                    <Button className="w-full" onClick={() => setTask({ ...task, completedSteps: [...completedSteps, 7] })}>
                      <Check className="mr-2 h-4 w-4" />
                      Acknowledge Submission
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Full Evidence Viewer */}
            <Card id="evidence-section">
              <CardHeader>
                <CardTitle>AI Evidence Trail</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Summary */}
                <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <h3 className="font-semibold text-sm mb-3">Evidence Summary</h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-muted-foreground">Tool:</span>
                      <span className="ml-2 font-medium">{task.aiTool || 'Not selected'}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Session ID:</span>
                      <span className="ml-2 font-mono text-xs">abc123xyz</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Tracking:</span>
                      <Badge className="ml-2 text-xs bg-green-100 dark:bg-green-900/20 text-green-700 border-green-200">
                        <Check className="h-3 w-3 mr-1" />
                        Full
                      </Badge>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Duration:</span>
                      <span className="ml-2 font-medium">45 minutes</span>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Prompts */}
                <div className="space-y-3">
                  <h3 className="font-semibold flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Prompts (3)
                  </h3>
                  <Card>
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Jan 24, 2:47 PM</span>
                        <Badge variant="outline" className="text-xs">
                          <Image className="h-3 w-3 mr-1" />
                          Screenshot
                        </Badge>
                      </div>
                      <p className="text-sm font-mono bg-muted p-3 rounded">
                        futuristic city skyline at sunset, cinematic style, warm golden hour lighting, dramatic clouds...
                      </p>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div><span className="text-muted-foreground">Model:</span> <span className="font-medium">Midjourney v6</span></div>
                        <div><span className="text-muted-foreground">Settings:</span> <span className="font-mono">--ar 16:9 --q 2</span></div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4 space-y-3">
                      <span className="text-sm font-medium">Jan 24, 3:02 PM</span>
                      <p className="text-sm font-mono bg-muted p-3 rounded">
                        same as above but with more detail in architecture, add people walking on streets...
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4 space-y-3">
                      <span className="text-sm font-medium">Jan 24, 3:18 PM</span>
                      <p className="text-sm font-mono bg-muted p-3 rounded">
                        variation with blue hour lighting instead of golden hour, more dramatic mood...
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <Separator />

                {/* Generations */}
                <div className="space-y-3">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Generations (4)
                  </h3>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Job #1</span>
                        <Badge variant="outline" className="text-xs">4 outputs</Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div><span className="text-muted-foreground">Started:</span> 2:47 PM</div>
                        <div><span className="text-muted-foreground">Completed:</span> 2:48 PM</div>
                        <div><span className="text-muted-foreground">Duration:</span> 68s</div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Job #2</span>
                        <Badge variant="outline" className="text-xs">4 outputs</Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div><span className="text-muted-foreground">Started:</span> 3:02 PM</div>
                        <div><span className="text-muted-foreground">Completed:</span> 3:03 PM</div>
                        <div><span className="text-muted-foreground">Duration:</span> 73s</div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Separator />

                {/* Downloads */}
                <div className="space-y-3">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Download className="h-5 w-5" />
                    Downloads (2)
                  </h3>
                  <Card>
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">hero_image_v1.png</span>
                        <Badge className="text-xs bg-green-100 dark:bg-green-900/20 text-green-700 border-green-200">
                          <FileCheck className="h-3 w-3 mr-1" />
                          Matched
                        </Badge>
                      </div>
                      <div className="text-xs">
                        <span className="text-muted-foreground">Downloaded:</span>
                        <span className="ml-2">3:15 PM</span>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">File Hash:</p>
                        <p className="text-xs font-mono bg-muted p-2 rounded break-all">
                          sha256:a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6
                        </p>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-400">
                        <Check className="h-4 w-4" />
                        <span>Matched to uploaded asset</span>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">hero_image_v2.png</span>
                        <Badge className="text-xs bg-green-100 dark:bg-green-900/20 text-green-700 border-green-200">
                          <FileCheck className="h-3 w-3 mr-1" />
                          Matched
                        </Badge>
                      </div>
                      <div className="text-xs">
                        <span className="text-muted-foreground">Downloaded:</span>
                        <span className="ml-2">3:16 PM</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Export Report */}
                <div className="pt-4 border-t">
                  <Button variant="outline" className="w-full" onClick={() => toast.info("PDF export coming soon")}>
                    <Download className="mr-2 h-4 w-4" />
                    Download Full Evidence Report
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Request Tool Modal */}
      <Dialog open={requestToolModalOpen} onOpenChange={setRequestToolModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request New AI Tool</DialogTitle>
            <DialogDescription>
              Submit a request to add a new AI tool to the platform
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Tool Name</label>
              <Input placeholder="e.g., DALL-E 4" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Tool URL</label>
              <Input placeholder="https://..." />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Why do you need this tool?</label>
              <Textarea placeholder="Describe your use case..." rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRequestToolModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              setRequestToolModalOpen(false)
              toast.success("✓ Request submitted")
            }}>
              Submit Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
