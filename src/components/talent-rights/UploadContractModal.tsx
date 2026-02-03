"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent } from "@/components/ui/card"
import { Upload, X, File } from "lucide-react"
import { toast } from "sonner"
import { useContracts } from "@/contexts/contracts-context"
import { useTalentRights } from "@/contexts/talent-rights-context"
import type { ContractType, NILPRightsGranted, ContractTerms, ContractCompensation } from "@/types/talent-contracts"
import { cn } from "@/lib/utils"

interface UploadContractModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  prefilledTalentId?: string
}

export function UploadContractModal({ open, onOpenChange, prefilledTalentId }: UploadContractModalProps) {
  const { createContract, loading } = useContracts()
  const { talentRights } = useTalentRights()
  
  const [file, setFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  
  // Form state
  const [title, setTitle] = useState("")
  const [brandName, setBrandName] = useState("")
  const [contractType, setContractType] = useState<ContractType>("nilp_rights_agreement")
  const [talentId, setTalentId] = useState(prefilledTalentId || "")
  const [projectId, setProjectId] = useState("")
  
  // NILP Rights
  const [nameIncluded, setNameIncluded] = useState(false)
  const [imageIncluded, setImageIncluded] = useState(false)
  const [likenessIncluded, setLikenessIncluded] = useState(false)
  const [personaIncluded, setPersonaIncluded] = useState(false)
  const [aiGeneration, setAiGeneration] = useState(false)
  const [requiresApproval, setRequiresApproval] = useState(true)
  
  // Terms
  const [effectiveDate, setEffectiveDate] = useState("")
  const [expirationDate, setExpirationDate] = useState("")
  const [territory, setTerritory] = useState<string[]>([])
  const [category, setCategory] = useState("")
  const [usageRights, setUsageRights] = useState("")
  const [isExclusive, setIsExclusive] = useState(false)
  
  // Compensation
  const [totalAmount, setTotalAmount] = useState("")
  const [paymentStatus, setPaymentStatus] = useState<"pending" | "paid">("pending")
  const [paidDate, setPaidDate] = useState("")
  
  // Notifications
  const [remind30Days, setRemind30Days] = useState(true)
  const [remind7Days, setRemind7Days] = useState(true)
  const [remindCategoryAvailable, setRemindCategoryAvailable] = useState(false)

  const handleFileUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return
    
    const uploadedFile = files[0]
    const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    
    if (!validTypes.includes(uploadedFile.type)) {
      toast.error("Please upload a PDF, DOC, or DOCX file")
      return
    }
    
    if (uploadedFile.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB")
      return
    }
    
    setFile(uploadedFile)
    toast.success(`File "${uploadedFile.name}" ready to upload`)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    handleFileUpload(e.dataTransfer.files)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleSubmit = async () => {
    if (!title || !brandName || !talentId || !effectiveDate || !expirationDate || !totalAmount) {
      toast.error("Please fill in all required fields")
      return
    }

    const nilpRights: NILPRightsGranted = {
      name: {
        included: nameIncluded,
        usage: nameIncluded ? ["campaign_credits", "social_media"] : []
      },
      image: {
        included: imageIncluded,
        usage: imageIncluded ? ["tv_commercial", "digital_ads"] : []
      },
      likeness: {
        included: likenessIncluded,
        aiGeneration: aiGeneration,
        requiresApproval: requiresApproval
      },
      persona: {
        included: personaIncluded
      }
    }

    const terms: ContractTerms = {
      effectiveDate: new Date(effectiveDate),
      expirationDate: new Date(expirationDate),
      territory: territory.length > 0 ? territory : ["United States"],
      mediaChannels: ["tv", "digital", "social"],
      intendedUse: usageRights || "Advertising and promotional materials",
      category: category || "General",
      exclusivity: {
        isExclusive: isExclusive
      },
      autoRenewal: false
    }

    const compensation: ContractCompensation = {
      totalAmount: parseFloat(totalAmount),
      currency: "USD",
      paymentTerms: "Net 30",
      paymentStatus: paymentStatus,
      paidAt: paymentStatus === "paid" && paidDate ? new Date(paidDate) : undefined
    }

    const talent = talentRights.find(t => t.id === talentId)

    await createContract({
      talentId,
      talentName: talent?.fullName || "",
      title,
      brandName,
      contractType,
      projectId: projectId || undefined,
      nilpRights,
      terms,
      compensation,
      reminders: [
        { type: "30_days", enabled: remind30Days },
        { type: "7_days", enabled: remind7Days },
        { type: "category_available", enabled: remindCategoryAvailable }
      ]
    })

    onOpenChange(false)
    resetForm()
  }

  const resetForm = () => {
    setFile(null)
    setTitle("")
    setBrandName("")
    setContractType("nilp_rights_agreement")
    setTalentId(prefilledTalentId || "")
    setProjectId("")
    setNameIncluded(false)
    setImageIncluded(false)
    setLikenessIncluded(false)
    setPersonaIncluded(false)
    setEffectiveDate("")
    setExpirationDate("")
    setTerritory([])
    setCategory("")
    setUsageRights("")
    setIsExclusive(false)
    setTotalAmount("")
    setPaymentStatus("pending")
    setPaidDate("")
  }

  const selectedTalent = talentRights.find(t => t.id === talentId)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {prefilledTalentId && selectedTalent ? `New Contract for ${selectedTalent.fullName}` : "Upload Contract"}
          </DialogTitle>
          <DialogDescription>
            {prefilledTalentId ? "Create a new NILP contract for this talent" : "Upload existing NILP contracts for tracking and management"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* File Upload */}
          <div>
            <Label className="text-sm font-semibold mb-2 block">Contract Document</Label>
            <div
              className={cn(
                "border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer",
                isDragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50",
                file && "bg-muted/50"
              )}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => document.getElementById('file-upload')?.click()}
            >
              {file ? (
                <div className="flex items-center justify-center gap-3">
                  <File className="h-8 w-8 text-primary" />
                  <div className="text-left">
                    <p className="font-medium">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={(e) => {
                      e.stopPropagation()
                      setFile(null)
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <>
                  <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm font-medium">Drag files here or browse</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Supported: PDF, DOC, DOCX (Max 10MB)
                  </p>
                </>
              )}
              <input
                id="file-upload"
                type="file"
                className="hidden"
                accept=".pdf,.doc,.docx"
                onChange={(e) => handleFileUpload(e.target.files)}
              />
            </div>
          </div>

          <Separator />

          {/* Contract Details */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-muted-foreground">Contract Details</h3>
            
            <div className="space-y-2">
              <Label htmlFor="title">Contract Title *</Label>
              <Input
                id="title"
                placeholder="Nike Spring Campaign - NILP Rights Agreement"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="brand">Brand/Client *</Label>
                <Input
                  id="brand"
                  placeholder="Nike"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Contract Type *</Label>
                <Select value={contractType} onValueChange={(value) => setContractType(value as ContractType)}>
                  <SelectTrigger id="type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nilp_rights_agreement">NILP Rights Agreement</SelectItem>
                    <SelectItem value="usage_rights">Usage Rights</SelectItem>
                    <SelectItem value="brand_endorsement">Brand Endorsement</SelectItem>
                    <SelectItem value="work_for_hire">Work for Hire</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="talent">Talent *</Label>
                <Select value={talentId} onValueChange={setTalentId} disabled={!!prefilledTalentId}>
                  <SelectTrigger id="talent">
                    <SelectValue placeholder="Select talent" />
                  </SelectTrigger>
                  <SelectContent>
                    {talentRights.map((talent) => (
                      <SelectItem key={talent.id} value={talent.id}>
                        {talent.fullName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="project">Link to Project (optional)</Label>
                <Input
                  id="project"
                  placeholder="Task ID or Project ID"
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* NILP Rights Granted */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-muted-foreground">NILP Rights Granted</h3>
            
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <Checkbox 
                  id="name" 
                  checked={nameIncluded}
                  onCheckedChange={(checked) => setNameIncluded(checked as boolean)}
                />
                <div className="space-y-0.5">
                  <Label htmlFor="name" className="text-sm font-medium cursor-pointer">
                    Name - Usage of talent's name
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Campaign credits, social media mentions, press releases
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Checkbox 
                  id="image" 
                  checked={imageIncluded}
                  onCheckedChange={(checked) => setImageIncluded(checked as boolean)}
                />
                <div className="space-y-0.5">
                  <Label htmlFor="image" className="text-sm font-medium cursor-pointer">
                    Image - Usage of photographs/videos
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Headshots, campaign footage, video content
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Checkbox 
                  id="likeness" 
                  checked={likenessIncluded}
                  onCheckedChange={(checked) => setLikenessIncluded(checked as boolean)}
                />
                <div className="space-y-0.5">
                  <Label htmlFor="likeness" className="text-sm font-medium cursor-pointer">
                    Likeness - AI-generated representations
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    AI-generated imagery, digital compositing, AI video
                  </p>
                  {likenessIncluded && (
                    <div className="mt-2 ml-6 space-y-2">
                      <div className="flex items-center gap-2">
                        <Checkbox 
                          id="ai-gen" 
                          checked={aiGeneration}
                          onCheckedChange={(checked) => setAiGeneration(checked as boolean)}
                        />
                        <Label htmlFor="ai-gen" className="text-xs cursor-pointer">
                          Allow AI generation
                        </Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Checkbox 
                          id="requires-approval" 
                          checked={requiresApproval}
                          onCheckedChange={(checked) => setRequiresApproval(checked as boolean)}
                        />
                        <Label htmlFor="requires-approval" className="text-xs cursor-pointer">
                          Requires prior approval
                        </Label>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Checkbox 
                  id="persona" 
                  checked={personaIncluded}
                  onCheckedChange={(checked) => setPersonaIncluded(checked as boolean)}
                />
                <div className="space-y-0.5">
                  <Label htmlFor="persona" className="text-sm font-medium cursor-pointer">
                    Persona - Character, brand voice, personality
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Personality traits, messaging tone, brand alignment
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Terms & Dates */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-muted-foreground">Terms & Dates</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="effective">Effective Date *</Label>
                <Input
                  id="effective"
                  type="date"
                  value={effectiveDate}
                  onChange={(e) => setEffectiveDate(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="expiration">Expiration Date *</Label>
                <Input
                  id="expiration"
                  type="date"
                  value={expirationDate}
                  onChange={(e) => setExpirationDate(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="territory">Territory</Label>
              <Select onValueChange={(value) => setTerritory([value])}>
                <SelectTrigger id="territory">
                  <SelectValue placeholder="Select territory" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="United States">United States</SelectItem>
                  <SelectItem value="Canada">Canada</SelectItem>
                  <SelectItem value="United States, Canada">United States & Canada</SelectItem>
                  <SelectItem value="Europe">Europe</SelectItem>
                  <SelectItem value="Global">Global</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                placeholder="Sports Apparel, Consumer Electronics, etc."
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="usage">Usage Rights</Label>
              <Textarea
                id="usage"
                placeholder="Advertising (TV, Digital, Social, Print)"
                rows={2}
                value={usageRights}
                onChange={(e) => setUsageRights(e.target.value)}
              />
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-medium">Exclusivity</Label>
              <RadioGroup value={isExclusive ? "exclusive" : "non-exclusive"} onValueChange={(value) => setIsExclusive(value === "exclusive")}>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="exclusive" id="exclusive" />
                  <Label htmlFor="exclusive" className="text-sm cursor-pointer">
                    Exclusive (blocks entire category)
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="non-exclusive" id="non-exclusive" />
                  <Label htmlFor="non-exclusive" className="text-sm cursor-pointer">
                    Non-exclusive
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </div>

          {/* Compensation */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-muted-foreground">Compensation (optional)</h3>
            
            <div className="space-y-2">
              <Label htmlFor="amount">NILP Fee Amount</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  id="amount"
                  type="number"
                  placeholder="15000"
                  className="pl-7"
                  value={totalAmount}
                  onChange={(e) => setTotalAmount(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-medium">Payment Status</Label>
              <RadioGroup value={paymentStatus} onValueChange={(value) => setPaymentStatus(value as "pending" | "paid")}>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="pending" id="pending" />
                  <Label htmlFor="pending" className="text-sm cursor-pointer">
                    Pending
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="paid" id="paid" />
                  <Label htmlFor="paid" className="text-sm cursor-pointer">
                    Paid
                  </Label>
                </div>
              </RadioGroup>
              {paymentStatus === "paid" && (
                <div className="space-y-2 ml-6">
                  <Label htmlFor="paid-date">Date</Label>
                  <Input
                    id="paid-date"
                    type="date"
                    value={paidDate}
                    onChange={(e) => setPaidDate(e.target.value)}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Notifications */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-muted-foreground">Notifications</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Checkbox 
                  id="remind-30" 
                  checked={remind30Days}
                  onCheckedChange={(checked) => setRemind30Days(checked as boolean)}
                />
                <Label htmlFor="remind-30" className="text-sm cursor-pointer">
                  Remind me 30 days before expiration
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox 
                  id="remind-7" 
                  checked={remind7Days}
                  onCheckedChange={(checked) => setRemind7Days(checked as boolean)}
                />
                <Label htmlFor="remind-7" className="text-sm cursor-pointer">
                  Remind me 7 days before expiration
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox 
                  id="remind-category" 
                  checked={remindCategoryAvailable}
                  onCheckedChange={(checked) => setRemindCategoryAvailable(checked as boolean)}
                />
                <Label htmlFor="remind-category" className="text-sm cursor-pointer">
                  Alert when category becomes available (if exclusive)
                </Label>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Uploading..." : "Upload Contract"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
