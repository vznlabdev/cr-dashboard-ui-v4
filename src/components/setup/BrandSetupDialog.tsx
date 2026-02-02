"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
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
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Building2, Palette, Upload, FileText, Loader2, ChevronLeft, ChevronRight } from "lucide-react"
import { toast } from "sonner"

interface BrandSetupDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onBrandCreated?: (brandId: string) => void
}

interface BrandData {
  name: string
  description: string
  website: string
  primaryColor: string
  secondaryColor: string
  logo?: File
  logoPreview?: string
  brandVoice: string
  guidelines: string
}

export function BrandSetupDialog({ open, onOpenChange, onBrandCreated }: BrandSetupDialogProps) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [brandData, setBrandData] = useState<BrandData>({
    name: "",
    description: "",
    website: "",
    primaryColor: "#3b82f6",
    secondaryColor: "#8b5cf6",
    brandVoice: "",
    guidelines: "",
  })

  const totalSteps = 3
  const progress = (currentStep / totalSteps) * 100

  const handleInputChange = (field: keyof BrandData, value: string) => {
    setBrandData((prev) => ({ ...prev, [field]: value }))
  }

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setBrandData((prev) => ({ ...prev, logo: file }))
      const reader = new FileReader()
      reader.onloadend = () => {
        setBrandData((prev) => ({ ...prev, logoPreview: reader.result as string }))
      }
      reader.readAsDataURL(file)
    }
  }

  const canProceedStep1 = brandData.name.trim() !== ""
  const canProceedStep2 = brandData.primaryColor !== ""
  
  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep((prev) => prev + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1)
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    const brandId = `brand-${Date.now()}`
    
    toast.success("Brand profile created successfully!")
    
    // Callback
    onBrandCreated?.(brandId)
    
    // Reset form
    setBrandData({
      name: "",
      description: "",
      website: "",
      primaryColor: "#3b82f6",
      secondaryColor: "#8b5cf6",
      brandVoice: "",
      guidelines: "",
      logo: undefined,
      logoPreview: undefined,
    })
    setCurrentStep(1)
    setIsSubmitting(false)
    
    // Navigate to brand page
    router.push(`/creative/brands/${brandId}`)
    
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Create Brand Profile
          </DialogTitle>
          <DialogDescription>
            Step {currentStep} of {totalSteps} - {getStepTitle(currentStep)}
          </DialogDescription>
          <Progress value={progress} className="mt-2" />
        </DialogHeader>

        <div className="py-4">
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="brand-name">
                  Brand Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="brand-name"
                  value={brandData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="e.g., Acme Corporation"
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="brand-description">Description</Label>
                <Textarea
                  id="brand-description"
                  value={brandData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Brief description of your brand..."
                  rows={3}
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="brand-website">Website</Label>
                <Input
                  id="brand-website"
                  type="url"
                  value={brandData.website}
                  onChange={(e) => handleInputChange("website", e.target.value)}
                  placeholder="https://www.example.com"
                  disabled={isSubmitting}
                />
              </div>
            </div>
          )}

          {/* Step 2: Brand Assets */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Brand Logo</Label>
                <div className="flex items-center gap-4">
                  <div className="h-24 w-24 rounded-lg border-2 border-dashed border-border flex items-center justify-center bg-muted/30 overflow-hidden">
                    {brandData.logoPreview ? (
                      <img
                        src={brandData.logoPreview}
                        alt="Logo preview"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Building2 className="h-8 w-8 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <Button type="button" variant="outline" size="sm" asChild disabled={isSubmitting}>
                      <label htmlFor="brand-logo-upload" className="cursor-pointer">
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Logo
                        <input
                          id="brand-logo-upload"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleLogoUpload}
                          disabled={isSubmitting}
                        />
                      </label>
                    </Button>
                    <p className="text-xs text-muted-foreground mt-1">PNG, JPG or SVG. Max 2MB.</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="primary-color">
                    Primary Color <span className="text-destructive">*</span>
                  </Label>
                  <div className="flex gap-2">
                    <input
                      id="primary-color"
                      type="color"
                      value={brandData.primaryColor}
                      onChange={(e) => handleInputChange("primaryColor", e.target.value)}
                      className="h-10 w-16 rounded border cursor-pointer"
                      disabled={isSubmitting}
                    />
                    <Input
                      value={brandData.primaryColor}
                      onChange={(e) => handleInputChange("primaryColor", e.target.value)}
                      placeholder="#3b82f6"
                      className="flex-1"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="secondary-color">Secondary Color</Label>
                  <div className="flex gap-2">
                    <input
                      id="secondary-color"
                      type="color"
                      value={brandData.secondaryColor}
                      onChange={(e) => handleInputChange("secondaryColor", e.target.value)}
                      className="h-10 w-16 rounded border cursor-pointer"
                      disabled={isSubmitting}
                    />
                    <Input
                      value={brandData.secondaryColor}
                      onChange={(e) => handleInputChange("secondaryColor", e.target.value)}
                      placeholder="#8b5cf6"
                      className="flex-1"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-2 p-4 border rounded-lg bg-muted/30">
                <div
                  className="h-12 w-12 rounded"
                  style={{ backgroundColor: brandData.primaryColor }}
                />
                <div
                  className="h-12 w-12 rounded"
                  style={{ backgroundColor: brandData.secondaryColor }}
                />
                <div className="flex-1 flex items-center">
                  <p className="text-sm text-muted-foreground">Color palette preview</p>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Brand Guidelines */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="brand-voice">Brand Voice & Tone</Label>
                <Textarea
                  id="brand-voice"
                  value={brandData.brandVoice}
                  onChange={(e) => handleInputChange("brandVoice", e.target.value)}
                  placeholder="e.g., Professional, friendly, innovative..."
                  rows={3}
                  disabled={isSubmitting}
                />
                <p className="text-xs text-muted-foreground">
                  Describe the personality and communication style of your brand
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="brand-guidelines">Brand Guidelines</Label>
                <Textarea
                  id="brand-guidelines"
                  value={brandData.guidelines}
                  onChange={(e) => handleInputChange("guidelines", e.target.value)}
                  placeholder="Key brand rules, dos and don'ts, usage guidelines..."
                  rows={6}
                  disabled={isSubmitting}
                />
                <p className="text-xs text-muted-foreground">
                  Add any specific guidelines for using your brand assets
                </p>
              </div>

              <div className="p-4 border rounded-lg bg-blue-50 dark:bg-blue-900/20">
                <p className="text-sm font-medium mb-2">Review Your Brand Profile</p>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p>
                    <span className="font-medium">Name:</span> {brandData.name || "Not set"}
                  </p>
                  {brandData.website && (
                    <p>
                      <span className="font-medium">Website:</span> {brandData.website}
                    </p>
                  )}
                  <p>
                    <span className="font-medium">Colors:</span>{" "}
                    <Badge variant="outline" style={{ backgroundColor: brandData.primaryColor, color: "white" }}>
                      Primary
                    </Badge>{" "}
                    <Badge variant="outline" style={{ backgroundColor: brandData.secondaryColor, color: "white" }}>
                      Secondary
                    </Badge>
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex justify-between sm:justify-between">
          <div>
            {currentStep > 1 && (
              <Button type="button" variant="outline" onClick={handleBack} disabled={isSubmitting}>
                <ChevronLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            {currentStep < totalSteps ? (
              <Button
                type="button"
                onClick={handleNext}
                disabled={(currentStep === 1 && !canProceedStep1) || (currentStep === 2 && !canProceedStep2)}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button type="button" onClick={handleSubmit} disabled={!canProceedStep1 || isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Brand
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function getStepTitle(step: number): string {
  switch (step) {
    case 1:
      return "Basic Information"
    case 2:
      return "Brand Assets"
    case 3:
      return "Brand Guidelines"
    default:
      return ""
  }
}
