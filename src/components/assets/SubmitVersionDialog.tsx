"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Upload } from "lucide-react"
import { cn } from "@/lib/utils"

interface SubmitVersionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (file: File, notes: string) => Promise<void>
  currentVersion?: number
}

export function SubmitVersionDialog({
  open,
  onOpenChange,
  onSubmit,
  currentVersion,
}: SubmitVersionDialogProps) {
  const [file, setFile] = useState<File | null>(null)
  const [notes, setNotes] = useState("")
  const [isDragging, setIsDragging] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

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
    
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile && droppedFile.type.startsWith("image/")) {
      setFile(droppedFile)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
    }
  }

  const handleSubmit = async () => {
    if (!file) return

    setIsSubmitting(true)
    try {
      await onSubmit(file, notes)
      // Reset form
      setFile(null)
      setNotes("")
      onOpenChange(false)
    } catch (error) {
      console.error("Failed to submit version:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Submit New Version</DialogTitle>
          <DialogDescription>
            Upload a new version {currentVersion && `(v${currentVersion + 1})`} and add notes about what changed.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* File Upload Area */}
          <div className="space-y-2">
            <Label>Upload File</Label>
            <div
              className={cn(
                "relative border-2 border-dashed rounded-lg p-8 transition-colors",
                isDragging
                  ? "border-primary bg-primary/5"
                  : "border-muted-foreground/25 hover:border-muted-foreground/50"
              )}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <input
                type="file"
                accept="image/*"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={handleFileSelect}
              />
              <div className="flex flex-col items-center justify-center text-center gap-2">
                <div className="p-3 rounded-full bg-muted">
                  <Upload className="h-6 w-6 text-muted-foreground" />
                </div>
                {file ? (
                  <div>
                    <p className="text-sm font-medium">{file.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm font-medium">
                      Drop your file here or click to browse
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Supports: PNG, JPG, GIF (max 10MB)
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Version Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Version Notes</Label>
            <Textarea
              id="notes"
              placeholder="Describe what changed in this version..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Help reviewers understand what you updated or fixed.
            </p>
          </div>

          {/* Preview */}
          {file && (
            <div className="space-y-2">
              <Label>Preview</Label>
              <div className="relative w-full h-48 rounded-lg overflow-hidden bg-muted border">
                <img
                  src={URL.createObjectURL(file)}
                  alt="Preview"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!file || isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit for Review"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
