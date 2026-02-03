"use client"

import { notFound } from "next/navigation"
import { PageContainer } from "@/components/layout/PageContainer"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { 
  Download, 
  ExternalLink, 
  CheckCircle2, 
  XCircle, 
  FileText,
  Clock,
  DollarSign,
  Shield,
  AlertTriangle,
  RefreshCw
} from "lucide-react"
import { useContracts } from "@/contexts/contracts-context"
import { formatDateLong } from "@/lib/format-utils"
import { getDaysUntilExpiration } from "@/types/talent-contracts"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { toast } from "sonner"
import { useState } from "react"
import { SignContractModal } from "@/components/talent-rights/SignContractModal"
import { RenewalRequestDialog } from "@/components/talent-rights/RenewalRequestDialog"

export default function ContractDetailPage({ params }: { params: { contractId: string } }) {
  const { getContractById } = useContracts()
  const contract = getContractById(params.contractId)
  const [signModalOpen, setSignModalOpen] = useState(false)
  const [renewalDialogOpen, setRenewalDialogOpen] = useState(false)

  if (!contract) {
    notFound()
  }

  const daysRemaining = getDaysUntilExpiration(new Date(contract.terms.expirationDate))
  const isActive = contract.status === "signed" && daysRemaining > 0
  const isExpiringSoon = daysRemaining > 0 && daysRemaining <= 30

  return (
    <PageContainer className="space-y-4">
      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/creative/talent-rights">Talent Rights</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/creative/talent-rights/contracts">Contracts</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{contract.title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-semibold mb-2">{contract.title}</h1>
          <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
            <span className="font-mono">{contract.contractId}</span>
            <span>•</span>
            {isActive ? (
              <Badge variant="default" className="flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Active
              </Badge>
            ) : contract.status === "pending_signature" ? (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Pending Signature
              </Badge>
            ) : contract.status === "expired" ? (
              <Badge variant="destructive" className="flex items-center gap-1">
                <XCircle className="h-3 w-3" />
                Expired
              </Badge>
            ) : (
              <Badge variant="outline">{contract.status}</Badge>
            )}
            <span>•</span>
            <span>{contract.talentName}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {contract.status === "pending_signature" && (
            <Button size="sm" onClick={() => setSignModalOpen(true)}>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Sign Contract
            </Button>
          )}
          {isActive && isExpiringSoon && (
            <Button size="sm" onClick={() => setRenewalDialogOpen(true)}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Request Renewal
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={() => toast.info("Download feature coming soon")}>
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="documents">
            Documents
            <Badge variant="secondary" className="ml-2 h-4 px-1.5 text-[10px]">
              {contract.documents.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="terms">Terms</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Contract Information */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Contract Information</h3>
            <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
              <div>
                <span className="text-muted-foreground text-xs">Brand</span>
                <p className="font-medium">{contract.brandName}</p>
              </div>
              <div>
                <span className="text-muted-foreground text-xs">Type</span>
                <p className="font-medium capitalize">{contract.contractType.replace(/_/g, ' ')}</p>
              </div>
              {contract.projectTitle && (
                <div className="col-span-2">
                  <span className="text-muted-foreground text-xs">Project</span>
                  <p className="font-medium">{contract.projectTitle}</p>
                </div>
              )}
              <div>
                <span className="text-muted-foreground text-xs">Effective Date</span>
                <p className="font-medium">{formatDateLong(contract.terms.effectiveDate)}</p>
              </div>
              <div>
                <span className="text-muted-foreground text-xs">Expiration Date</span>
                <p className={cn("font-medium", isExpiringSoon && "text-orange-600")}>
                  {formatDateLong(contract.terms.expirationDate)}
                  {isActive && <span className="ml-2 text-xs">({daysRemaining} days)</span>}
                </p>
              </div>
            </div>
          </div>

          {/* NILP Rights */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">NILP Rights Granted</h3>
            <div className="space-y-4 text-sm">
              {/* Name */}
              <div>
                <div className="flex items-center gap-2 mb-1">
                  {contract.nilpRights.name.included ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-gray-400" />
                  )}
                  <span className="font-medium">Name Rights</span>
                </div>
                {contract.nilpRights.name.included && (
                  <div className="ml-6 text-xs text-muted-foreground space-y-1">
                    {contract.nilpRights.name.usage && contract.nilpRights.name.usage.length > 0 && (
                      <p>Usage: {contract.nilpRights.name.usage.join(", ")}</p>
                    )}
                    {contract.nilpRights.name.restrictions && (
                      <p>Restrictions: {contract.nilpRights.name.restrictions}</p>
                    )}
                  </div>
                )}
              </div>

              {/* Image */}
              <div>
                <div className="flex items-center gap-2 mb-1">
                  {contract.nilpRights.image.included ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-gray-400" />
                  )}
                  <span className="font-medium">Image Rights</span>
                </div>
                {contract.nilpRights.image.included && (
                  <div className="ml-6 text-xs text-muted-foreground space-y-1">
                    {contract.nilpRights.image.usage && contract.nilpRights.image.usage.length > 0 && (
                      <p>Usage: {contract.nilpRights.image.usage.join(", ")}</p>
                    )}
                    {contract.nilpRights.image.restrictions && (
                      <p>Restrictions: {contract.nilpRights.image.restrictions}</p>
                    )}
                  </div>
                )}
              </div>

              {/* Likeness */}
              <div>
                <div className="flex items-center gap-2 mb-1">
                  {contract.nilpRights.likeness.included ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-gray-400" />
                  )}
                  <span className="font-medium">Likeness Rights</span>
                </div>
                {contract.nilpRights.likeness.included && (
                  <div className="ml-6 text-xs text-muted-foreground space-y-1">
                    {contract.nilpRights.likeness.aiGeneration && <p>AI generation allowed</p>}
                    {contract.nilpRights.likeness.approvedTools && contract.nilpRights.likeness.approvedTools.length > 0 && (
                      <p>Tools: {contract.nilpRights.likeness.approvedTools.join(", ")}</p>
                    )}
                    {contract.nilpRights.likeness.requiresApproval && <p>Prior approval required</p>}
                    {contract.nilpRights.likeness.restrictions && (
                      <p>Restrictions: {contract.nilpRights.likeness.restrictions}</p>
                    )}
                  </div>
                )}
              </div>

              {/* Persona */}
              <div>
                <div className="flex items-center gap-2 mb-1">
                  {contract.nilpRights.persona.included ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-gray-400" />
                  )}
                  <span className="font-medium">Persona Rights</span>
                </div>
                {contract.nilpRights.persona.included && (
                  <div className="ml-6 text-xs text-muted-foreground space-y-1">
                    {contract.nilpRights.persona.personalityTraits && contract.nilpRights.persona.personalityTraits.length > 0 && (
                      <p>Traits: {contract.nilpRights.persona.personalityTraits.join(", ")}</p>
                    )}
                    {contract.nilpRights.persona.brandVoice && (
                      <p>Voice: {contract.nilpRights.persona.brandVoice}</p>
                    )}
                    {contract.nilpRights.persona.messagingTone && (
                      <p>Tone: {contract.nilpRights.persona.messagingTone}</p>
                    )}
                    {contract.nilpRights.persona.restrictions && (
                      <p>Restrictions: {contract.nilpRights.persona.restrictions}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Terms & Compensation */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="text-sm font-semibold">Terms</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-muted-foreground text-xs">Territory</span>
                  <p>{contract.terms.territory.join(", ")}</p>
                </div>
                <div>
                  <span className="text-muted-foreground text-xs">Category</span>
                  <p>{contract.terms.category}</p>
                </div>
                <div>
                  <span className="text-muted-foreground text-xs">Media Channels</span>
                  <p className="capitalize">{contract.terms.mediaChannels.join(", ")}</p>
                </div>
                <div>
                  <span className="text-muted-foreground text-xs">Exclusivity</span>
                  <p>
                    {contract.terms.exclusivity.isExclusive ? (
                      <>
                        <Badge variant="secondary" className="text-xs">Exclusive</Badge>
                        {contract.terms.exclusivity.competitors && contract.terms.exclusivity.competitors.length > 0 && (
                          <span className="ml-2 text-xs text-muted-foreground">
                            Blocks: {contract.terms.exclusivity.competitors.join(", ")}
                          </span>
                        )}
                      </>
                    ) : (
                      "Non-exclusive"
                    )}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold">Compensation</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-muted-foreground text-xs">Total Amount</span>
                  <p className="text-xl font-bold">${contract.compensation.totalAmount.toLocaleString()} {contract.compensation.currency}</p>
                </div>
                {contract.compensation.breakdown && (
                  <div>
                    <span className="text-muted-foreground text-xs">Breakdown</span>
                    <div className="space-y-1 mt-1">
                      {contract.compensation.breakdown.nameRights && (
                        <p className="text-xs">Name: ${contract.compensation.breakdown.nameRights.toLocaleString()}</p>
                      )}
                      {contract.compensation.breakdown.imageRights && (
                        <p className="text-xs">Image: ${contract.compensation.breakdown.imageRights.toLocaleString()}</p>
                      )}
                      {contract.compensation.breakdown.likenessRights && (
                        <p className="text-xs">Likeness: ${contract.compensation.breakdown.likenessRights.toLocaleString()}</p>
                      )}
                      {contract.compensation.breakdown.personaRights && (
                        <p className="text-xs">Persona: ${contract.compensation.breakdown.personaRights.toLocaleString()}</p>
                      )}
                    </div>
                  </div>
                )}
                <div>
                  <span className="text-muted-foreground text-xs">Payment Status</span>
                  <div className="flex items-center gap-2 mt-1">
                    {contract.compensation.paymentStatus === "paid" ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <span>Paid</span>
                        {contract.compensation.paidAt && (
                          <span className="text-xs text-muted-foreground">
                            ({formatDateLong(contract.compensation.paidAt)})
                          </span>
                        )}
                      </>
                    ) : (
                      <>
                        <Clock className="h-4 w-4 text-orange-500" />
                        <span>Pending</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Special Provisions */}
          {contract.specialProvisions && contract.specialProvisions.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold">Special Provisions</h3>
              <ul className="space-y-1 text-sm">
                {contract.specialProvisions.map((provision, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-muted-foreground">•</span>
                    <span>{provision}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents" className="space-y-4">
          {contract.documents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No documents uploaded</p>
            </div>
          ) : (
            <div className="space-y-2">
              {contract.documents.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <FileText className="h-5 w-5 text-muted-foreground shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{doc.fileName}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{(doc.fileSize / 1024 / 1024).toFixed(1)} MB</span>
                        <span>•</span>
                        <span className="capitalize">{doc.type}</span>
                        {doc.signedAt && (
                          <>
                            <span>•</span>
                            <span>Signed {formatDateLong(doc.signedAt)}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" onClick={() => toast.info("View feature coming soon")}>
                      View
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => toast.info("Download feature coming soon")}>
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-4">
          {contract.contractHistory.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No history available</p>
            </div>
          ) : (
            <div className="space-y-3">
              {contract.contractHistory.map((entry) => (
                <div key={entry.id} className="flex gap-4 text-sm">
                  <span className="text-muted-foreground text-xs w-32 shrink-0">
                    {formatDateLong(entry.timestamp)}
                  </span>
                  <div className="flex-1">
                    <span className="capitalize font-medium">{entry.action.replace(/_/g, ' ')}</span>
                    {entry.performedByName && (
                      <span className="text-muted-foreground ml-2">by {entry.performedByName}</span>
                    )}
                    {entry.details && (
                      <p className="text-xs text-muted-foreground mt-1">{entry.details}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Terms Tab */}
        <TabsContent value="terms" className="space-y-6">
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Usage Rights & Restrictions</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground text-xs">Territory</span>
                <p>{contract.terms.territory.join(", ")}</p>
              </div>
              <div>
                <span className="text-muted-foreground text-xs">Category</span>
                <p>{contract.terms.category}</p>
              </div>
              <div className="col-span-2">
                <span className="text-muted-foreground text-xs">Media Channels</span>
                <p className="capitalize">{contract.terms.mediaChannels.join(", ")}</p>
              </div>
              <div className="col-span-2">
                <span className="text-muted-foreground text-xs">Intended Use</span>
                <p>{contract.terms.intendedUse}</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Rights & Protections</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                {contract.approvalRights ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-gray-400" />
                )}
                <span>Approval rights retained</span>
              </div>
              <div className="flex items-center gap-2">
                {contract.moralRights ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-gray-400" />
                )}
                <span>Moral rights retained</span>
              </div>
              {contract.terminationNotice && (
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span>{contract.terminationNotice}-day termination notice</span>
                </div>
              )}
            </div>
          </div>

          {/* Reminders */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Reminders</h3>
            <div className="space-y-2 text-sm">
              {contract.reminders.map((reminder, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span>
                    {reminder.type === "30_days" && "30 days before expiration"}
                    {reminder.type === "7_days" && "7 days before expiration"}
                    {reminder.type === "category_available" && "Category becomes available"}
                  </span>
                  {reminder.triggeredAt && (
                    <Badge variant="outline" className="text-[10px] px-1">
                      Sent {formatDateLong(reminder.triggeredAt)}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Modals */}
      {contract.status === "pending_signature" && (
        <SignContractModal
          contract={contract}
          open={signModalOpen}
          onOpenChange={setSignModalOpen}
        />
      )}
      
      <RenewalRequestDialog
        contract={contract}
        open={renewalDialogOpen}
        onOpenChange={setRenewalDialogOpen}
      />
    </PageContainer>
  )
}
