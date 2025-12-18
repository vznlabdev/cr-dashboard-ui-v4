"use client"

import { useState } from "react"
import { useCreatorAccount } from "@/contexts/creator-account-context"
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
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import {
  User,
  Save,
  FileText,
  Upload,
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Download,
  Loader2,
} from "lucide-react"
import { PageContainer } from "@/components/layout/PageContainer"
import {
  getRightsStatusColor,
  getRightsStatusVariant,
  formatCreatorExpiration,
  validateRightsDates,
} from "@/lib/creator-utils"
import { formatDateLong } from "@/lib/format-utils"
import { cn } from "@/lib/utils"
import { EmptyState } from "@/components/cr"
import type { CreatorType } from "@/types/creators"
import { format } from "date-fns"

export default function CreatorProfilePage() {
  const {
    currentCreator,
    updateMyProfile,
    uploadMyReference,
    uploadMyRightsAgreement,
    getProfileCompletionStatus,
    extendRights,
  } = useCreatorAccount()

  const [isSaving, setIsSaving] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [formData, setFormData] = useState({
    fullName: currentCreator?.fullName || "",
    creatorType: (currentCreator?.creatorType || "") as CreatorType | "",
    validFrom: currentCreator?.validFrom
      ? format(new Date(currentCreator.validFrom), "yyyy-MM-dd")
      : "",
    validThrough: currentCreator?.validThrough
      ? format(new Date(currentCreator.validThrough), "yyyy-MM-dd")
      : "",
    notes: currentCreator?.notes || "",
    contactInformation: currentCreator?.contactInformation || "",
  })

  if (!currentCreator) {
    return (
      <PageContainer>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <p className="text-muted-foreground">Please log in to view your profile</p>
            </div>
          </CardContent>
        </Card>
      </PageContainer>
    )
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate dates
    if (formData.validFrom && formData.validThrough) {
      if (
        !validateRightsDates(
          new Date(formData.validFrom),
          new Date(formData.validThrough)
        )
      ) {
        toast.error("Valid From date must be before Valid Through date")
        return
      }
    }

    setIsSaving(true)

    try {
      await updateMyProfile({
        fullName: formData.fullName,
        creatorType: formData.creatorType || undefined,
        validFrom: formData.validFrom ? new Date(formData.validFrom) : undefined,
        validThrough: formData.validThrough
          ? new Date(formData.validThrough)
          : undefined,
        notes: formData.notes || undefined,
        contactInformation: formData.contactInformation || undefined,
      })
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update profile"
      toast.error(errorMessage)
    } finally {
      setIsSaving(false)
    }
  }

  const handleFileUpload = async (
    file: File,
    type: "reference" | "rights_agreement"
  ) => {
    setIsUploading(true)

    try {
      if (type === "rights_agreement") {
        // Validate PDF
        if (file.type !== "application/pdf" && !file.name.endsWith(".pdf")) {
          toast.error("Rights agreement must be a PDF file")
          return
        }
        await uploadMyRightsAgreement(file)
      } else {
        // Determine reference type from file
        let refType: "photo" | "voice_sample" | "guideline" | "other" = "other"
        if (file.type.startsWith("image/")) {
          refType = "photo"
        } else if (file.type.startsWith("audio/")) {
          refType = "voice_sample"
        } else if (file.type === "application/pdf") {
          refType = "guideline"
        }
        await uploadMyReference(file, refType)
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to upload file"
      toast.error(errorMessage)
    } finally {
      setIsUploading(false)
    }
  }

  const getStatusIcon = () => {
    switch (currentCreator.rightsStatus) {
      case "Authorized":
        return <CheckCircle2 className="h-4 w-4" />
      case "Expiring Soon":
        return <Clock className="h-4 w-4" />
      case "Expired":
        return <AlertTriangle className="h-4 w-4" />
      default:
        return null
    }
  }

  const profileCompletion = getProfileCompletionStatus()

  return (
    <PageContainer className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight break-all">
              My Profile
            </h1>
            <Badge variant="secondary">{currentCreator.creatorType}</Badge>
            <Badge
              variant={getRightsStatusVariant(currentCreator.rightsStatus)}
              className="flex items-center gap-1"
            >
              {getStatusIcon()}
              {currentCreator.rightsStatus}
            </Badge>
            <Badge variant="outline" className="font-mono text-xs">
              {currentCreator.creatorRightsId}
            </Badge>
          </div>
          <p className="text-muted-foreground text-sm sm:text-base">
            {currentCreator.email}
          </p>
        </div>
      </div>

      {/* Profile Completion */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Completion</CardTitle>
          <CardDescription>
            Complete your profile to improve your creator rights management
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-semibold">{profileCompletion}%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${profileCompletion}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabbed Content */}
      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList className="w-full justify-start overflow-x-auto flex-nowrap">
          <TabsTrigger value="profile" className="whitespace-nowrap">
            Profile
          </TabsTrigger>
          <TabsTrigger value="rights" className="whitespace-nowrap">
            Rights & Documentation
          </TabsTrigger>
          <TabsTrigger value="references" className="whitespace-nowrap">
            Reference Materials
          </TabsTrigger>
          <TabsTrigger value="credits" className="whitespace-nowrap">
            My Credits
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Update your profile details</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSave} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">
                      Full Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="fullName"
                      value={formData.fullName}
                      onChange={(e) =>
                        setFormData({ ...formData, fullName: e.target.value })
                      }
                      disabled={isSaving}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="creatorType">
                      Creator Type <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={formData.creatorType}
                      onValueChange={(value) =>
                        setFormData({ ...formData, creatorType: value as CreatorType })
                      }
                      disabled={isSaving}
                      required
                    >
                      <SelectTrigger id="creatorType">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Real Person">Real Person</SelectItem>
                        <SelectItem value="Character">Character</SelectItem>
                        <SelectItem value="Brand Mascot">Brand Mascot</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={currentCreator.email}
                      disabled
                      className="bg-muted"
                    />
                    <p className="text-xs text-muted-foreground">
                      Email cannot be changed. Contact admin if needed.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="creatorRightsId">Creator Rights ID</Label>
                    <Input
                      id="creatorRightsId"
                      value={currentCreator.creatorRightsId}
                      disabled
                      className="bg-muted font-mono"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactInformation">Contact Information</Label>
                    <Input
                      id="contactInformation"
                      value={formData.contactInformation}
                      onChange={(e) =>
                        setFormData({ ...formData, contactInformation: e.target.value })
                      }
                      disabled={isSaving}
                      placeholder="Additional contact info (optional)"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                    disabled={isSaving}
                    placeholder="Additional notes about your creator profile (optional)"
                    rows={3}
                  />
                </div>
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rights" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Rights Documentation</CardTitle>
              <CardDescription>
                Manage your rights agreement and validity dates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleSave} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="validFrom">
                      Valid From <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="validFrom"
                      type="date"
                      value={formData.validFrom}
                      onChange={(e) =>
                        setFormData({ ...formData, validFrom: e.target.value })
                      }
                      disabled={isSaving}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="validThrough">
                      Valid Through <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="validThrough"
                      type="date"
                      value={formData.validThrough}
                      onChange={(e) =>
                        setFormData({ ...formData, validThrough: e.target.value })
                      }
                      disabled={isSaving}
                      required
                    />
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-muted">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-medium">Current Status:</span>
                    <Badge
                      variant={getRightsStatusVariant(currentCreator.rightsStatus)}
                      className="flex items-center gap-1"
                    >
                      {getStatusIcon()}
                      {currentCreator.rightsStatus}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {formatCreatorExpiration(currentCreator.validThrough)}
                  </p>
                </div>

                {currentCreator.rightsAgreementUrl && (
                  <div className="space-y-2 pt-4 border-t">
                    <Label>Rights Agreement Document</Label>
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{currentCreator.rightsAgreementFileName}</span>
                      <Button variant="outline" size="sm" asChild>
                        <a
                          href={currentCreator.rightsAgreementUrl}
                          download
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Download className="h-3 w-3 mr-1" />
                          Download
                        </a>
                      </Button>
                    </div>
                  </div>
                )}

                <div className="space-y-2 pt-4 border-t">
                  <Label htmlFor="rightsAgreement">Upload Rights Agreement (PDF)</Label>
                  <Input
                    id="rightsAgreement"
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        handleFileUpload(file, "rights_agreement")
                      }
                    }}
                    disabled={isUploading}
                  />
                  <p className="text-xs text-muted-foreground">
                    Upload a PDF document of your rights agreement
                  </p>
                </div>

                <Button type="submit" disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="references" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Reference Materials</CardTitle>
              <CardDescription>
                Upload reference photos, voice samples, and guidelines
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="referenceUpload">Upload Reference Material</Label>
                <Input
                  id="referenceUpload"
                  type="file"
                  accept="image/*,audio/*,.pdf"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      handleFileUpload(file, "reference")
                    }
                  }}
                  disabled={isUploading}
                />
                <p className="text-xs text-muted-foreground">
                  Supported: Images, audio files, PDFs
                </p>
              </div>

              {currentCreator.referenceMaterials.length === 0 ? (
                <EmptyState
                  icon={FileText}
                  title="No reference materials"
                  description="Upload reference photos, voice samples, or guidelines to help document your creator profile."
                />
              ) : (
                <div className="space-y-2">
                  {currentCreator.referenceMaterials.map((ref) => (
                    <div
                      key={ref.id}
                      className="flex items-center justify-between p-3 rounded-lg border"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium text-sm">{ref.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {ref.type} • {formatDateLong(ref.uploadedAt)}
                          </p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <a
                          href={ref.url}
                          download
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Download className="h-3 w-3 mr-1" />
                          Download
                        </a>
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="credits" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>My Credits</CardTitle>
              <CardDescription>
                Assets and projects where you're credited for your work
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Assets ({currentCreator.linkedAssetsCount})</h4>
                  {currentCreator.linkedAssetsCount === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      You haven't been credited on any assets yet.
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      View your credited assets in the admin dashboard.
                    </p>
                  )}
                </div>
                <div>
                  <h4 className="font-medium mb-2">
                    Projects ({currentCreator.linkedProjectsCount})
                  </h4>
                  {currentCreator.linkedProjectsCount === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      You haven't been credited on any projects yet.
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      View your credited projects in the admin dashboard.
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageContainer>
  )
}

