"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { PageContainer } from "@/components/layout/PageContainer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
import { ArrowLeft, GitBranch } from "lucide-react"
import { addWorkflowTemplate } from "@/lib/mock-data/workflows"
import type { WorkflowTemplate } from "@/types/workflows"
import { toast } from "sonner"

const CATEGORY_OPTIONS: { value: WorkflowTemplate["category"]; label: string }[] = [
  { value: "video", label: "Video" },
  { value: "image", label: "Image" },
  { value: "audio", label: "Audio" },
  { value: "mixed", label: "Mixed" },
  { value: "custom", label: "Custom" },
]

export default function NewWorkflowPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState<WorkflowTemplate["category"]>("custom")
  const [icon, setIcon] = useState("📋")
  const [isSubmitting, setIsSubmitting] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) {
      toast.error("Name is required")
      return
    }
    setIsSubmitting(true)
    const now = new Date().toISOString()
    const template: WorkflowTemplate = {
      id: `wf-custom-${Date.now()}`,
      name: name.trim(),
      description: description.trim() || undefined,
      category,
      icon: icon.trim() || "📋",
      steps: [],
      createdBy: "Me",
      createdAt: now,
      updatedAt: now,
      isSystem: false,
      isPublished: false,
    }
    addWorkflowTemplate(template)
    toast.success("Workflow created")
    router.push(`/workflows/${template.id}`)
  }

  return (
    <PageContainer className="space-y-6 animate-fade-in max-w-2xl">
      <Link
        href="/workflows"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
      >
        <ArrowLeft className="h-4 w-4" /> Workflows
      </Link>

      <div>
        <h1 className="text-2xl font-bold tracking-tight">Create workflow</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Add a new workflow template. You can add steps later from the template detail page.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GitBranch className="h-5 w-5 text-primary" />
              Basic information
            </CardTitle>
            <CardDescription>
              Name, category, and icon for your workflow
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Social asset pack"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="What this workflow is for..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="resize-y"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={category}
                  onValueChange={(v) => setCategory(v as WorkflowTemplate["category"])}
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORY_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="icon">Icon (emoji)</Label>
                <Input
                  id="icon"
                  placeholder="📋"
                  value={icon}
                  onChange={(e) => setIcon(e.target.value)}
                  maxLength={4}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-3">
          <Button type="button" variant="outline" asChild>
            <Link href="/workflows">Cancel</Link>
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create workflow"}
          </Button>
        </div>
      </form>
    </PageContainer>
  )
}
