"use client"

import { notFound } from "next/navigation"
import { PageContainer } from "@/components/layout/PageContainer"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LinearBreadcrumb } from "@/components/navigation/LinearBreadcrumb"
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
import { useState, use } from "react"
import { SignContractModal } from "@/components/talent-rights/SignContractModal"
import { RenewalRequestDialog } from "@/components/talent-rights/RenewalRequestDialog"

export default function ContractDetailPage({ params }: { params: Promise<{ contractId: string }> }) {
  const { getContractById } = useContracts()
  const [signModalOpen, setSignModalOpen] = useState(false)
  const [renewalDialogOpen, setRenewalDialogOpen] = useState(false)
  
  const { contractId } = use(params)
  const contract = getContractById(contractId)

  if (!contract) {
    notFound()
  }

  const daysRemaining = getDaysUntilExpiration(new Date(contract.terms.expirationDate))
  const isActive = contract.status === "signed" && daysRemaining > 0
  const isExpiringSoon = daysRemaining > 0 && daysRemaining <= 30

  return (
    <PageContainer className="space-y-4">
      {/* Breadcrumb */}
      <LinearBreadcrumb
        backHref="/creative/talent-rights/contracts"
        segments={[
          { label: "Talent Rights", href: "/creative/talent-rights" },
          { label: "Contracts", href: "/creative/talent-rights/contracts" },
          { label: contract.title }
        ]}
      />

      {/* Compact Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-semibold mb-1">{contract.title}</h1>
          <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
            <span className="font-mono">{contract.contractId}</span>
            <span>•</span>
            {isActive ? (
              <Badge variant="outline" className="h-5 px-1.5 text-[10px] border-0 bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400">
                Active
              </Badge>
            ) : contract.status === "pending_signature" ? (
              <Badge variant="outline" className="h-5 px-1.5 text-[10px] border-0 bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400">
                Pending
              </Badge>
            ) : contract.status === "expired" ? (
              <Badge variant="outline" className="h-5 px-1.5 text-[10px] border-0 bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400">
                Expired
              </Badge>
            ) : (
              <Badge variant="outline" className="h-5 px-1.5 text-[10px]">{contract.status}</Badge>
            )}
            <span>•</span>
            <span>{contract.talentName}</span>
            {isExpiringSoon && isActive && (
              <>
                <span>•</span>
                <span className="text-orange-600 font-medium">Expires in {daysRemaining}d</span>
              </>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {contract.status === "pending_signature" && (
            <Button size="sm" onClick={() => setSignModalOpen(true)}>
              Sign Contract
            </Button>
          )}
          {isActive && isExpiringSoon && (
            <Button size="sm" onClick={() => setRenewalDialogOpen(true)}>
              Request Renewal
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={() => toast.info("Download feature coming soon")}>
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Expiration Warning */}
      {isExpiringSoon && isActive && (
        <div className="rounded-lg border border-orange-200 bg-orange-50 dark:bg-orange-900/20 dark:border-orange-800 p-3">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-4 w-4 text-orange-600 shrink-0 mt-0.5" />
            <div className="flex-1 text-sm">
              <p className="font-medium text-orange-900 dark:text-orange-100">
                Contract expires in {daysRemaining} days
              </p>
              <p className="text-xs text-orange-700 dark:text-orange-200 mt-1">
                Consider requesting renewal to maintain {contract.terms.category} rights
              </p>
            </div>
            <Button size="sm" variant="outline" onClick={() => setRenewalDialogOpen(true)}>
              Request Renewal
            </Button>
          </div>
        </div>
      )}

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="h-9 bg-transparent border-b w-full justify-start rounded-none p-0">
          <TabsTrigger value="overview" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary">
            Overview
          </TabsTrigger>
          <TabsTrigger value="documents" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary">
            Documents ({contract.documents.length})
          </TabsTrigger>
          <TabsTrigger value="history" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary">
            History
          </TabsTrigger>
          <TabsTrigger value="terms" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary">
            Terms
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          {/* Contract Information */}
          <div className="rounded-lg border bg-card p-4">
            <h3 className="text-xs uppercase tracking-wide text-muted-foreground mb-3">
              Contract Information
            </h3>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-2.5 text-sm">
              <div>
                <dt className="text-xs text-muted-foreground mb-0.5">Brand</dt>
                <dd className="font-medium">{contract.brandName}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground mb-0.5">Type</dt>
                <dd className="font-medium capitalize">{contract.contractType.replace(/_/g, ' ')}</dd>
              </div>
              {contract.projectTitle && (
                <div className="col-span-2">
                  <dt className="text-xs text-muted-foreground mb-0.5">Project</dt>
                  <dd className="font-medium">{contract.projectTitle}</dd>
                </div>
              )}
              <div>
                <dt className="text-xs text-muted-foreground mb-0.5">Effective Date</dt>
                <dd className="font-medium">{formatDateLong(contract.terms.effectiveDate)}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground mb-0.5">Expiration Date</dt>
                <dd className={cn("font-medium", isExpiringSoon && "text-orange-600")}>
                  {formatDateLong(contract.terms.expirationDate)}
                  {isActive && <span className="ml-2 text-xs">({daysRemaining} days)</span>}
                </dd>
              </div>
            </dl>
          </div>

          {/* NILP Rights - Compact Table */}
          <div className="rounded-lg border bg-card p-4">
            <h3 className="text-xs uppercase tracking-wide text-muted-foreground mb-3">
              NILP Rights Granted
            </h3>
            <div className="space-y-2.5">
              {/* Name */}
              <div className="grid grid-cols-[auto_80px_1fr] gap-4 text-sm items-start">
                {contract.nilpRights.name.included ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                ) : (
                  <XCircle className="h-4 w-4 text-gray-400 mt-0.5" />
                )}
                <span className={cn("font-medium", !contract.nilpRights.name.included && "text-muted-foreground")}>
                  Name
                </span>
                {contract.nilpRights.name.included ? (
                  <div className="text-xs text-muted-foreground">
                    {contract.nilpRights.name.usage && contract.nilpRights.name.usage.length > 0 && (
                      <span>{contract.nilpRights.name.usage.join(", ")}</span>
                    )}
                    {contract.nilpRights.name.restrictions && (
                      <span className="block mt-1">{contract.nilpRights.name.restrictions}</span>
                    )}
                  </div>
                ) : (
                  <span className="text-xs text-muted-foreground">Not included</span>
                )}
              </div>

              {/* Image */}
              <div className="grid grid-cols-[auto_80px_1fr] gap-4 text-sm items-start">
                {contract.nilpRights.image.included ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                ) : (
                  <XCircle className="h-4 w-4 text-gray-400 mt-0.5" />
                )}
                <span className={cn("font-medium", !contract.nilpRights.image.included && "text-muted-foreground")}>
                  Image
                </span>
                {contract.nilpRights.image.included ? (
                  <div className="text-xs text-muted-foreground">
                    {contract.nilpRights.image.usage && contract.nilpRights.image.usage.length > 0 && (
                      <span>{contract.nilpRights.image.usage.join(", ")}</span>
                    )}
                    {contract.nilpRights.image.restrictions && (
                      <span className="block mt-1">{contract.nilpRights.image.restrictions}</span>
                    )}
                  </div>
                ) : (
                  <span className="text-xs text-muted-foreground">Not included</span>
                )}
              </div>

              {/* Likeness */}
              <div className="grid grid-cols-[auto_80px_1fr] gap-4 text-sm items-start">
                {contract.nilpRights.likeness.included ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                ) : (
                  <XCircle className="h-4 w-4 text-gray-400 mt-0.5" />
                )}
                <span className={cn("font-medium", !contract.nilpRights.likeness.included && "text-muted-foreground")}>
                  Likeness
                </span>
                {contract.nilpRights.likeness.included ? (
                  <div className="text-xs text-muted-foreground space-y-0.5">
                    {contract.nilpRights.likeness.aiGeneration && <p>AI generation allowed</p>}
                    {contract.nilpRights.likeness.approvedTools && contract.nilpRights.likeness.approvedTools.length > 0 && (
                      <p>Tools: {contract.nilpRights.likeness.approvedTools.join(", ")}</p>
                    )}
                    {contract.nilpRights.likeness.requiresApproval && <p>Prior approval required</p>}
                    {contract.nilpRights.likeness.restrictions && <p>{contract.nilpRights.likeness.restrictions}</p>}
                  </div>
                ) : (
                  <span className="text-xs text-muted-foreground">
                    {contract.nilpRights.likeness.restrictions || "Not included"}
                  </span>
                )}
              </div>

              {/* Persona */}
              <div className="grid grid-cols-[auto_80px_1fr] gap-4 text-sm items-start">
                {contract.nilpRights.persona.included ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                ) : (
                  <XCircle className="h-4 w-4 text-gray-400 mt-0.5" />
                )}
                <span className={cn("font-medium", !contract.nilpRights.persona.included && "text-muted-foreground")}>
                  Persona
                </span>
                {contract.nilpRights.persona.included ? (
                  <div className="text-xs text-muted-foreground space-y-0.5">
                    {contract.nilpRights.persona.personalityTraits && contract.nilpRights.persona.personalityTraits.length > 0 && (
                      <p>{contract.nilpRights.persona.personalityTraits.join(", ")}</p>
                    )}
                    {contract.nilpRights.persona.brandVoice && <p>{contract.nilpRights.persona.brandVoice}</p>}
                    {contract.nilpRights.persona.messagingTone && <p>{contract.nilpRights.persona.messagingTone}</p>}
                    {contract.nilpRights.persona.restrictions && <p>{contract.nilpRights.persona.restrictions}</p>}
                  </div>
                ) : (
                  <span className="text-xs text-muted-foreground">
                    {contract.nilpRights.persona.restrictions || "Not included"}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Terms & Compensation */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="rounded-lg border bg-card p-4">
              <h3 className="text-xs uppercase tracking-wide text-muted-foreground mb-3">
                Terms
              </h3>
              <dl className="space-y-2 text-sm">
                <div>
                  <dt className="text-xs text-muted-foreground mb-0.5">Territory</dt>
                  <dd>{contract.terms.territory.join(", ")}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground mb-0.5">Category</dt>
                  <dd>{contract.terms.category}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground mb-0.5">Media Channels</dt>
                  <dd className="capitalize">{contract.terms.mediaChannels.join(", ")}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground mb-0.5">Exclusivity</dt>
                  <dd>
                    {contract.terms.exclusivity.isExclusive ? (
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5">Exclusive</Badge>
                        {contract.terms.exclusivity.competitors && contract.terms.exclusivity.competitors.length > 0 && (
                          <span className="text-xs text-muted-foreground">
                            Blocks: {contract.terms.exclusivity.competitors.join(", ")}
                          </span>
                        )}
                      </div>
                    ) : (
                      "Non-exclusive"
                    )}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="rounded-lg border bg-card p-4">
              <h3 className="text-xs uppercase tracking-wide text-muted-foreground mb-3">
                Compensation
              </h3>
              <div className="space-y-2.5 text-sm">
                <div>
                  <dt className="text-xs text-muted-foreground mb-0.5">Total Amount</dt>
                  <dd className="text-xl font-bold">${contract.compensation.totalAmount.toLocaleString()} {contract.compensation.currency}</dd>
                </div>
                {contract.compensation.breakdown && (
                  <div>
                    <dt className="text-xs text-muted-foreground mb-1">Breakdown</dt>
                    <dd className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                      {contract.compensation.breakdown.nameRights && (
                        <span>Name: ${contract.compensation.breakdown.nameRights.toLocaleString()}</span>
                      )}
                      {contract.compensation.breakdown.imageRights && (
                        <span>Image: ${contract.compensation.breakdown.imageRights.toLocaleString()}</span>
                      )}
                      {contract.compensation.breakdown.likenessRights && (
                        <span>Likeness: ${contract.compensation.breakdown.likenessRights.toLocaleString()}</span>
                      )}
                      {contract.compensation.breakdown.personaRights && (
                        <span>Persona: ${contract.compensation.breakdown.personaRights.toLocaleString()}</span>
                      )}
                    </dd>
                  </div>
                )}
                <div>
                  <dt className="text-xs text-muted-foreground mb-0.5">Payment Status</dt>
                  <dd className="flex items-center gap-2">
                    {contract.compensation.paymentStatus === "paid" ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <span>Paid</span>
                        {contract.compensation.paidAt && (
                          <span className="text-xs text-muted-foreground">
                            {formatDateLong(contract.compensation.paidAt)}
                          </span>
                        )}
                      </>
                    ) : (
                      <>
                        <Clock className="h-4 w-4 text-orange-500" />
                        <span>Pending</span>
                      </>
                    )}
                  </dd>
                </div>
              </div>
            </div>
          </div>

          {/* Special Provisions */}
          {contract.specialProvisions && contract.specialProvisions.length > 0 && (
            <div className="rounded-lg border bg-card p-4">
              <h3 className="text-xs uppercase tracking-wide text-muted-foreground mb-3">
                Special Provisions
              </h3>
              <ul className="space-y-1.5 text-sm">
                {contract.specialProvisions.map((provision, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-muted-foreground mt-0.5">•</span>
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

        {/* History Tab - Timeline Style */}
        <TabsContent value="history" className="space-y-4">
          {contract.contractHistory.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No history available</p>
            </div>
          ) : (
            <div className="relative pl-6 space-y-4">
              {/* Vertical timeline line */}
              <div className="absolute left-2 top-2 bottom-2 w-px bg-border" />
              
              {contract.contractHistory.map((entry, idx) => (
                <div key={entry.id} className="relative">
                  {/* Timeline dot */}
                  <div className="absolute -left-6 top-1 h-4 w-4 rounded-full border-2 border-border bg-background flex items-center justify-center">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                  </div>
                  
                  <div className="text-sm">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="capitalize font-medium">{entry.action.replace(/_/g, ' ')}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatDateLong(entry.timestamp)}
                      </span>
                    </div>
                    {entry.performedByName && (
                      <p className="text-xs text-muted-foreground">
                        by {entry.performedByName}
                      </p>
                    )}
                    {entry.details && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {entry.details}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Terms Tab */}
        <TabsContent value="terms" className="space-y-4">
          <div className="rounded-lg border bg-card p-4">
            <h3 className="text-xs uppercase tracking-wide text-muted-foreground mb-3">
              Usage Rights & Restrictions
            </h3>
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-xs text-muted-foreground mb-0.5">Territory</dt>
                <dd>{contract.terms.territory.join(", ")}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground mb-0.5">Category</dt>
                <dd>{contract.terms.category}</dd>
              </div>
              <div className="col-span-2">
                <dt className="text-xs text-muted-foreground mb-0.5">Media Channels</dt>
                <dd className="capitalize">{contract.terms.mediaChannels.join(", ")}</dd>
              </div>
              <div className="col-span-2">
                <dt className="text-xs text-muted-foreground mb-0.5">Intended Use</dt>
                <dd>{contract.terms.intendedUse}</dd>
              </div>
            </dl>
          </div>

          <div className="rounded-lg border bg-card p-4">
            <h3 className="text-xs uppercase tracking-wide text-muted-foreground mb-3">
              Rights & Protections
            </h3>
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
          <div className="rounded-lg border bg-card p-4">
            <h3 className="text-xs uppercase tracking-wide text-muted-foreground mb-3">
              Reminders
            </h3>
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
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5">
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
