"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import { PageContainer } from "@/components/layout/PageContainer"
import { WorkflowTemplateEditor } from "@/components/workflows/WorkflowTemplateEditor"
import { getWorkflowTemplateById, updateWorkflowTemplate } from "@/lib/mock-data/workflows"
import { toast } from "sonner"
import { ArrowLeft } from "lucide-react"

export default function WorkflowEditPage() {
  const params = useParams()
  const id = typeof params.id === "string" ? params.id : params.id?.[0]
  const template = id ? getWorkflowTemplateById(id) : null

  if (!template) {
    return (
      <PageContainer>
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <p className="text-sm font-medium text-muted-foreground">
            Template not found
          </p>
          <Link
            href="/workflows"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mt-3"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Workflows
          </Link>
        </div>
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <WorkflowTemplateEditor
        mode="edit"
        initialTemplate={template}
        templateId={template.id}
        onSave={(updated) => {
          updateWorkflowTemplate(updated.id, updated)
          toast.success("Workflow saved")
        }}
      />
    </PageContainer>
  )
}
