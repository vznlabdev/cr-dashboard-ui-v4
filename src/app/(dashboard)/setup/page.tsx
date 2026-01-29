"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { SetupCategoryItem } from "@/components/setup/SetupCategoryItem"
import { SetupTaskDetail } from "@/components/setup/SetupTaskDetail"
import { useSetup } from "@/lib/contexts/setup-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { CheckCircle2, Plus, Settings } from "lucide-react"

export default function SetupPage() {
  const router = useRouter()
  const {
    setupState,
    isSetupComplete,
    completeTask,
    dismissSetup,
  } = useSetup()
  const [showSkipDialog, setShowSkipDialog] = useState(false)
  const [showCompleteDialog, setShowCompleteDialog] = useState(false)
  const [selectedCategoryId, setSelectedCategoryId] = useState(
    setupState.categories[0]?.id || ""
  )

  // Auto-redirect when setup is complete
  useEffect(() => {
    if (isSetupComplete && !showCompleteDialog) {
      setShowCompleteDialog(true)
    }
  }, [isSetupComplete, showCompleteDialog])

  const handleSkip = () => {
    dismissSetup()
    router.push("/tasks")
  }

  const handleContinue = () => {
    router.push("/tasks")
  }

  const selectedCategory = setupState.categories.find(
    (cat) => cat.id === selectedCategoryId
  )

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Page Header */}
      <div className="flex items-center justify-between px-8 pt-6 pb-4 border-b border-border">
        <h1 className="text-2xl font-bold tracking-tight">
          Setup Creation Rights
        </h1>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            Add-ons
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <Settings className="h-4 w-4" />
            Company settings
          </Button>
        </div>
      </div>

      {/* Two-panel layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Category List */}
        <div className="w-80 border-r border-border bg-muted/30 p-6 overflow-y-auto">
          <div className="space-y-3">
            {setupState.categories.map((category) => (
              <SetupCategoryItem
                key={category.id}
                category={category}
                isSelected={selectedCategoryId === category.id}
                onClick={() => setSelectedCategoryId(category.id)}
              />
            ))}
          </div>
        </div>

        {/* Right Panel - Selected Category Detail */}
        <div className="flex-1 overflow-y-auto">
          {selectedCategory && (
            <div className="max-w-4xl mx-auto px-8 py-8">
              {/* Category header */}
              <div className="mb-8">
                <h2 className="text-3xl font-bold mb-2">
                  {selectedCategory.title}
                </h2>
                <p className="text-muted-foreground">
                  {selectedCategory.description}
                </p>
                {selectedCategory.locked && (
                  <p className="text-sm text-amber-600 dark:text-amber-400 mt-2">
                    Complete{" "}
                    <span className="font-medium">
                      {getPreviousCategoryTitle(selectedCategory.id)}
                    </span>{" "}
                    to unlock.
                  </p>
                )}
              </div>

              {/* Task list */}
              {!selectedCategory.locked && (
                <div className="space-y-4">
                  {selectedCategory.tasks.map((task) => (
                    <SetupTaskDetail
                      key={task.id}
                      task={task}
                      categoryId={selectedCategory.id}
                      onToggle={completeTask}
                    />
                  ))}
                </div>
              )}

              {/* Locked state message */}
              {selectedCategory.locked && (
                <div className="bg-muted/50 border border-border rounded-lg p-8 text-center">
                  <div className="h-16 w-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
                    <svg
                      className="h-8 w-8 text-muted-foreground"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">
                    This section is locked
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Complete the previous steps to unlock this section
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Skip Confirmation Dialog */}
      <Dialog open={showSkipDialog} onOpenChange={setShowSkipDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Skip setup?</DialogTitle>
            <DialogDescription>
              Are you sure you want to skip the setup process? You can always
              return to complete these steps later from Settings.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowSkipDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSkip}>Skip setup</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Setup Complete Dialog */}
      <Dialog open={showCompleteDialog} onOpenChange={setShowCompleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              Setup Complete!
            </DialogTitle>
            <DialogDescription>
              Congratulations! You've completed all the required setup steps.
              You're ready to start using Creation Rights.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={handleContinue}>Continue to Dashboard</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Helper function to get previous category title
function getPreviousCategoryTitle(categoryId: string): string {
  const categoryOrder = ["profile", "team", "project", "integrations"]
  const currentIndex = categoryOrder.indexOf(categoryId)
  if (currentIndex > 0) {
    const titles: Record<string, string> = {
      profile: "Complete your profile",
      team: "Add team members",
      project: "Create first project",
      integrations: "Set up integrations",
    }
    return titles[categoryOrder[currentIndex - 1]] || "the previous step"
  }
  return "the previous step"
}
