"use client"

import { useRouter } from "next/navigation"
import { PageContainer } from "@/components/layout/PageContainer"
import { WorkflowTemplateEditor } from "@/components/workflows/WorkflowTemplateEditor"
import { addWorkflowTemplate } from "@/lib/mock-data/workflows"
import { STEP_TYPE_CONFIG } from "@/lib/workflow-step-config"
import type { WorkflowTemplate } from "@/types/workflows"
import { toast } from "sonner"

const DEFAULT_TEMPLATE: WorkflowTemplate = {
  id: "",
  name: "",
  description: "",
  category: "custom",
  icon: "📋",
  steps: [
    {
      id: "step-new-1",
      name: "First Step",
      stepType: "image_generation",
      order: 1,
      required: true,
      estimatedMinutes: STEP_TYPE_CONFIG.image_generation.defaultEstimate,
      promptTemplate: "",
      tips: [],
      acceptanceCriteria: [],
      recommendedToolIds: [],
    },
  ],
  createdBy: "Me",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  isSystem: false,
  isPublished: false,
}

export default function NewWorkflowPage() {
  const router = useRouter()

  return (
    <PageContainer>
      <WorkflowTemplateEditor
        mode="create"
        initialTemplate={DEFAULT_TEMPLATE}
        templateId={null}
        onSave={(template) => {
          addWorkflowTemplate(template)
          toast.success("Workflow created")
          router.push("/workflows")
        }}
      />
    </PageContainer>
  )
}
