"use client"

import { useState, useRef } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Upload, Loader2, X, FileImage, Plus, Sparkles } from "lucide-react"
import { mockBrands } from "@/lib/mock-data/creative"
import { DesignType, DESIGN_TYPE_CONFIG, AssetFileType, AssetContentType, PromptHistory, PromptMessage } from "@/types/creative"
import { getDesignTypeIcon } from "@/lib/design-icons"
import { cn } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"

interface UploadAssetDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

// Available AI tools list
const AI_TOOLS = [
  "Midjourney",
  "DALL-E",
  "Stable Diffusion",
  "Runway",
  "ElevenLabs",
  "ChatGPT",
  "Suno",
  "Luma AI",
  "Adobe Firefly",
  "Claude",
  "Other",
] as const

export function UploadAssetDialog({ open, onOpenChange }: UploadAssetDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<Record<string, string>>({})
  const [showAIMetadata, setShowAIMetadata] = useState(false)
  const [formData, setFormData] = useState({
    contentType: "original" as AssetContentType,
    brandId: "",
    designType: "" as DesignType | "",
    tags: [] as string[],
    tagInput: "",
    // AI metadata fields
    aiTool: "",
    modelVersion: "",
    prompt: "",
    generationDate: new Date().toISOString().split("T")[0],
    trainingDataSources: [] as string[],
    trainingDataSourceInput: "",
  })
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Detect file type from file
  const detectFileType = (file: File): AssetFileType => {
    const type = file.type.toLowerCase()
    if (type.startsWith("image/")) return "image"
    if (type.startsWith("video/")) return "video"
    if (type === "application/pdf") return "pdf"
    if (type.includes("document") || type.includes("word") || type.includes("text")) return "document"
    if (type.includes("zip") || type.includes("archive") || type.includes("compressed")) return "archive"
    return "other"
  }

  // Generate preview for image files
  const generatePreview = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader()
        reader.onload = (e) => resolve(e.target?.result as string)
        reader.readAsDataURL(file)
      } else {
        resolve("")
      }
    })
  }

  // Handle file selection
  const handleFileSelect = async (selectedFiles: FileList | null) => {
    if (!selectedFiles || selectedFiles.length === 0) return

    const newFiles = Array.from(selectedFiles)
    const newPreviews: Record<string, string> = {}

    // Generate previews for image files
    for (const file of newFiles) {
      const preview = await generatePreview(file)
      if (preview) {
        newPreviews[file.name] = preview
      }
    }

    setFiles((prev) => [...prev, ...newFiles])
    setPreviews((prev) => ({ ...prev, ...newPreviews }))
  }

  // Handle drag and drop
  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    await handleFileSelect(e.dataTransfer.files)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  // Remove file
  const removeFile = (index: number) => {
    const file = files[index]
    setFiles((prev) => prev.filter((_, i) => i !== index))
    setPreviews((prev) => {
      const newPreviews = { ...prev }
      delete newPreviews[file.name]
      return newPreviews
    })
  }

  // Add tag
  const addTag = () => {
    if (formData.tagInput.trim() && !formData.tags.includes(formData.tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, formData.tagInput.trim()],
        tagInput: "",
      })
    }
  }

  // Remove tag
  const removeTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((t) => t !== tag),
    })
  }

  // Add training data source
  const addTrainingDataSource = () => {
    if (
      formData.trainingDataSourceInput.trim() &&
      !formData.trainingDataSources.includes(formData.trainingDataSourceInput.trim())
    ) {
      setFormData({
        ...formData,
        trainingDataSources: [
          ...formData.trainingDataSources,
          formData.trainingDataSourceInput.trim(),
        ],
        trainingDataSourceInput: "",
      })
    }
  }

  // Remove training data source
  const removeTrainingDataSource = (source: string) => {
    setFormData({
      ...formData,
      trainingDataSources: formData.trainingDataSources.filter((s) => s !== source),
    })
  }

  // Generate unique ID for prompt messages
  const generateId = () => {
    return `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (files.length === 0) {
      toast.error("Please select at least one file to upload")
      return
    }

    if (!formData.brandId) {
      toast.error("Please select a brand")
      return
    }

    if (!formData.designType) {
      toast.error("Please select a design type")
      return
    }

    // Validate AI metadata if content type is AI-generated
    if (formData.contentType === "ai_generated") {
      if (!formData.aiTool) {
        toast.error("Please select an AI tool")
        return
      }
      if (!formData.prompt.trim()) {
        toast.error("Please enter the prompt used to generate this asset")
        return
      }
    }

    setIsSubmitting(true)

    // Construct prompt history if AI-generated
    let promptHistory: PromptHistory | undefined
    if (formData.contentType === "ai_generated") {
      const generationDate = formData.generationDate
        ? new Date(formData.generationDate)
        : new Date()

      const promptMessage: PromptMessage = {
        id: generateId(),
        role: "user",
        content: formData.prompt,
        timestamp: generationDate,
      }

      promptHistory = {
        messages: [promptMessage],
        aiTool: formData.aiTool,
        modelVersion: formData.modelVersion || undefined,
        generationDate: generationDate,
      }
    }

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    toast.success(
      `Successfully uploaded ${files.length} ${formData.contentType === "ai_generated" ? "AI-generated " : ""}asset${files.length !== 1 ? "s" : ""}!`
    )

    // Reset form
    setFiles([])
    setPreviews({})
    setShowAIMetadata(false)
    setFormData({
      contentType: "original",
      brandId: "",
      designType: "" as DesignType | "",
      tags: [],
      tagInput: "",
      aiTool: "",
      modelVersion: "",
      prompt: "",
      generationDate: new Date().toISOString().split("T")[0],
      trainingDataSources: [],
      trainingDataSourceInput: "",
    })

    setIsSubmitting(false)
    onOpenChange(false)
  }

  const handleClose = () => {
    if (!isSubmitting) {
      setFiles([])
      setPreviews({})
      setShowAIMetadata(false)
      setFormData({
        contentType: "original",
        brandId: "",
        designType: "" as DesignType | "",
        tags: [],
        tagInput: "",
        aiTool: "",
        modelVersion: "",
        prompt: "",
        generationDate: new Date().toISOString().split("T")[0],
        trainingDataSources: [],
        trainingDataSourceInput: "",
      })
      onOpenChange(false)
    }
  }

  // Update showAIMetadata when contentType changes
  const handleContentTypeChange = (value: AssetContentType) => {
    setFormData({ ...formData, contentType: value })
    setShowAIMetadata(value === "ai_generated")
  }

  const selectedBrand = mockBrands.find((b) => b.id === formData.brandId)

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Assets
          </DialogTitle>
          <DialogDescription>
            Upload files to the asset library. You can upload multiple files at once.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* File Upload Area */}
            <div className="space-y-2">
              <Label>Files</Label>
              <div
                className={cn(
                  "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
                  "border-muted-foreground/25 hover:border-primary/50",
                  "bg-muted/30 hover:bg-muted/50"
                )}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-1">
                  <span className="font-medium text-primary">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-muted-foreground">
                  Images, PDFs, Documents, Archives (up to 50MB per file)
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  multiple
                  onChange={(e) => handleFileSelect(e.target.files)}
                  accept="image/*,video/*,.pdf,.doc,.docx,.zip,.rar"
                />
              </div>

              {/* File List */}
              {files.length > 0 && (
                <div className="space-y-2 mt-4">
                  {files.map((file, index) => {
                    const fileType = detectFileType(file)
                    const preview = previews[file.name]
                    const fileSizeMB = (file.size / 1024 / 1024).toFixed(2)

                    return (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg"
                      >
                        {preview ? (
                          <div className="relative h-12 w-12 rounded overflow-hidden bg-muted shrink-0">
                            <img
                              src={preview}
                              alt={file.name}
                              className="h-full w-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="h-12 w-12 rounded bg-muted flex items-center justify-center shrink-0">
                            <FileImage className="h-6 w-6 text-muted-foreground" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{file.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {fileType} • {fileSizeMB} MB
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeFile(index)}
                          className="shrink-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Content Type */}
            <div className="space-y-2">
              <Label htmlFor="content-type">
                Content Type <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.contentType}
                onValueChange={(value) => handleContentTypeChange(value as AssetContentType)}
                disabled={isSubmitting}
              >
                <SelectTrigger id="content-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="original">Original Content</SelectItem>
                  <SelectItem value="ai_generated">AI-Generated</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {formData.contentType === "ai_generated"
                  ? "AI-generated content requires provenance metadata for compliance tracking."
                  : "Original content created without AI assistance."}
              </p>
            </div>

            {/* AI Metadata Section */}
            {formData.contentType === "ai_generated" && (
              <div className="space-y-4 p-4 bg-muted/30 rounded-lg border border-border">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <Label className="text-sm font-semibold">AI Generation Metadata</Label>
                </div>
                <p className="text-xs text-muted-foreground">
                  This information is required for provenance tracking and compliance purposes.
                </p>

                <Separator />

                {/* AI Tool */}
                <div className="space-y-2">
                  <Label htmlFor="ai-tool">
                    AI Tool <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.aiTool}
                    onValueChange={(value) => setFormData({ ...formData, aiTool: value })}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger id="ai-tool">
                      <SelectValue placeholder="Select AI tool..." />
                    </SelectTrigger>
                    <SelectContent>
                      {AI_TOOLS.map((tool) => (
                        <SelectItem key={tool} value={tool}>
                          {tool}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Model Version */}
                <div className="space-y-2">
                  <Label htmlFor="model-version">Model Version (optional)</Label>
                  <Input
                    id="model-version"
                    placeholder="e.g., v6.0, 3, XL, GPT-4"
                    value={formData.modelVersion}
                    onChange={(e) => setFormData({ ...formData, modelVersion: e.target.value })}
                    disabled={isSubmitting}
                  />
                </div>

                {/* Prompt */}
                <div className="space-y-2">
                  <Label htmlFor="prompt">
                    Prompt Used <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="prompt"
                    placeholder="Enter the full prompt used to generate this asset..."
                    rows={4}
                    value={formData.prompt}
                    onChange={(e) => setFormData({ ...formData, prompt: e.target.value })}
                    disabled={isSubmitting}
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    Include all prompt details, parameters, and settings used.
                  </p>
                </div>

                {/* Generation Date */}
                <div className="space-y-2">
                  <Label htmlFor="generation-date">Generation Date</Label>
                  <Input
                    id="generation-date"
                    type="date"
                    value={formData.generationDate}
                    onChange={(e) => setFormData({ ...formData, generationDate: e.target.value })}
                    disabled={isSubmitting}
                  />
                  <p className="text-xs text-muted-foreground">
                    When was this asset generated? (defaults to today)
                  </p>
                </div>

                {/* Training Data Sources (Optional) */}
                <div className="space-y-2">
                  <Label>Training Data Sources (optional)</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="e.g., LAION-5B, Common Crawl, Proprietary"
                      value={formData.trainingDataSourceInput}
                      onChange={(e) =>
                        setFormData({ ...formData, trainingDataSourceInput: e.target.value })
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault()
                          addTrainingDataSource()
                        }
                      }}
                      disabled={isSubmitting}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={addTrainingDataSource}
                      disabled={isSubmitting}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  {formData.trainingDataSources.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.trainingDataSources.map((source) => (
                        <Badge key={source} variant="outline" className="gap-1">
                          {source}
                          <button
                            type="button"
                            onClick={() => removeTrainingDataSource(source)}
                            className="ml-1 hover:text-destructive"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Known training datasets used by the AI model (if applicable).
                  </p>
                </div>
              </div>
            )}

            {/* Brand Selection */}
            <div className="space-y-2">
              <Label htmlFor="brand">
                Brand <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.brandId}
                onValueChange={(value) => setFormData({ ...formData, brandId: value })}
                disabled={isSubmitting}
              >
                <SelectTrigger id="brand">
                  <SelectValue placeholder="Select a brand..." />
                </SelectTrigger>
                <SelectContent>
                  {mockBrands.map((brand) => (
                    <SelectItem key={brand.id} value={brand.id}>
                      <span className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: brand.colors[0]?.hex || "#888" }}
                        />
                        {brand.name}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Design Type */}
            <div className="space-y-2">
              <Label htmlFor="design-type">
                Design Type <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.designType}
                onValueChange={(value) =>
                  setFormData({ ...formData, designType: value as DesignType })
                }
                disabled={isSubmitting}
              >
                <SelectTrigger id="design-type">
                  <SelectValue placeholder="Select design type..." />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(DESIGN_TYPE_CONFIG).map(([key, config]) => {
                    const Icon = getDesignTypeIcon(config.iconName)
                    return (
                      <SelectItem key={key} value={key}>
                        <span className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          {config.label}
                        </span>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label>Tags (optional)</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Add a tag (e.g., campaign, social, print)"
                  value={formData.tagInput}
                  onChange={(e) => setFormData({ ...formData, tagInput: e.target.value })}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      addTag()
                    }
                  }}
                  disabled={isSubmitting}
                />
                <Button type="button" variant="outline" onClick={addTag} disabled={isSubmitting}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="gap-1">
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Selected Brand Preview */}
            {selectedBrand && (
              <div className="p-3 bg-muted/50 rounded-lg border border-border">
                <p className="text-xs font-medium text-muted-foreground mb-2">Selected Brand</p>
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold shrink-0"
                    style={{ backgroundColor: selectedBrand.colors[0]?.hex || "#888" }}
                  >
                    {selectedBrand.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{selectedBrand.name}</p>
                    <p className="text-xs text-muted-foreground">{selectedBrand.description}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || files.length === 0}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Upload {files.length > 0 && `(${files.length})`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

