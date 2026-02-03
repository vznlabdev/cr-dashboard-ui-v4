"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  CheckCircle2, 
  XCircle, 
  FileText, 
  Download, 
  Eye, 
  Calendar,
  MapPin,
  Shield,
  DollarSign,
  AlertTriangle,
  Clock
} from "lucide-react"
import type { TalentContract } from "@/types/talent-contracts"
import { formatDateLong } from "@/lib/format-utils"
import { getDaysUntilExpiration } from "@/types/talent-contracts"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface ContractDetailViewProps {
  contract: TalentContract
  open: boolean
  onOpenChange: (open: boolean) => void
  onRequestRenewal?: () => void
}

export function ContractDetailView({ contract, open, onOpenChange, onRequestRenewal }: ContractDetailViewProps) {
  const daysRemaining = getDaysUntilExpiration(new Date(contract.terms.expirationDate))
  const isActive = contract.status === "signed" && daysRemaining > 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-xl mb-2">{contract.title}</DialogTitle>
              <p className="text-sm text-muted-foreground">Contract ID: {contract.contractId}</p>
            </div>
            {isActive ? (
              <Badge variant="default" className="flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" />
                ACTIVE
              </Badge>
            ) : contract.status === "pending_signature" ? (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                PENDING SIGNATURE
              </Badge>
            ) : contract.status === "expired" ? (
              <Badge variant="destructive" className="flex items-center gap-1">
                <XCircle className="h-3 w-3" />
                EXPIRED
              </Badge>
            ) : (
              <Badge variant="outline">
                {contract.status.toUpperCase().replace(/_/g, ' ')}
              </Badge>
            )}
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 px-6 pb-6" style={{ maxHeight: 'calc(90vh - 200px)' }}>
          <div className="space-y-6 py-4">
            {/* Contract Information */}
            <section>
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                CONTRACT INFORMATION
              </h3>
              <div className="bg-muted/30 rounded-lg p-4 space-y-2 text-sm">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-muted-foreground">Brand</span>
                    <p className="font-medium">{contract.brandName}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Contract Type</span>
                    <p className="font-medium capitalize">{contract.contractType.replace(/_/g, ' ')}</p>
                  </div>
                  {contract.projectTitle && (
                    <div className="col-span-2">
                      <span className="text-muted-foreground">Project</span>
                      <p className="font-medium">{contract.projectTitle}</p>
                    </div>
                  )}
                  <div>
                    <span className="text-muted-foreground">Contract Date</span>
                    <p className="font-medium">{formatDateLong(contract.createdAt)}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Effective Date</span>
                    <p className="font-medium">{formatDateLong(contract.terms.effectiveDate)}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Expiration Date</span>
                    <p className="font-medium">{formatDateLong(contract.terms.expirationDate)}</p>
                  </div>
                  {isActive && (
                    <div>
                      <span className="text-muted-foreground">Days Remaining</span>
                      <p className={cn(
                        "font-medium",
                        daysRemaining <= 30 && "text-orange-600"
                      )}>
                        {daysRemaining} days
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* NILP Rights Granted */}
            <section>
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Shield className="h-4 w-4" />
                NILP RIGHTS GRANTED
              </h3>
              <div className="bg-muted/30 rounded-lg p-4 space-y-4 text-sm">
                <p className="text-muted-foreground mb-3">This contract grants the following NILP rights:</p>
                
                {/* Name Rights */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    {contract.nilpRights.name.included ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <span className="font-semibold">NAME RIGHTS</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4 text-gray-400" />
                        <span className="font-semibold text-muted-foreground">NAME RIGHTS (Not Included)</span>
                      </>
                    )}
                  </div>
                  {contract.nilpRights.name.included && contract.nilpRights.name.usage && (
                    <ul className="ml-6 text-xs space-y-1 list-disc list-inside">
                      {contract.nilpRights.name.usage.map((usage, idx) => (
                        <li key={idx}>{usage.replace(/_/g, ' ')}</li>
                      ))}
                    </ul>
                  )}
                  {contract.nilpRights.name.restrictions && (
                    <p className="ml-6 text-xs text-muted-foreground italic">
                      Restrictions: {contract.nilpRights.name.restrictions}
                    </p>
                  )}
                </div>

                {/* Image Rights */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    {contract.nilpRights.image.included ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <span className="font-semibold">IMAGE RIGHTS</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4 text-gray-400" />
                        <span className="font-semibold text-muted-foreground">IMAGE RIGHTS (Not Included)</span>
                      </>
                    )}
                  </div>
                  {contract.nilpRights.image.included && contract.nilpRights.image.usage && (
                    <ul className="ml-6 text-xs space-y-1 list-disc list-inside">
                      {contract.nilpRights.image.usage.map((usage, idx) => (
                        <li key={idx}>{usage.replace(/_/g, ' ')}</li>
                      ))}
                    </ul>
                  )}
                  {contract.nilpRights.image.restrictions && (
                    <p className="ml-6 text-xs text-muted-foreground italic">
                      Restrictions: {contract.nilpRights.image.restrictions}
                    </p>
                  )}
                </div>

                {/* Likeness Rights */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    {contract.nilpRights.likeness.included ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <span className="font-semibold">LIKENESS RIGHTS</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4 text-gray-400" />
                        <span className="font-semibold text-muted-foreground">LIKENESS RIGHTS (Not Included)</span>
                      </>
                    )}
                  </div>
                  {contract.nilpRights.likeness.included && (
                    <div className="ml-6 text-xs space-y-1">
                      {contract.nilpRights.likeness.aiGeneration && (
                        <p>• AI-generated representations allowed</p>
                      )}
                      {contract.nilpRights.likeness.approvedTools && contract.nilpRights.likeness.approvedTools.length > 0 && (
                        <p>• Approved tools: {contract.nilpRights.likeness.approvedTools.join(", ")}</p>
                      )}
                      {contract.nilpRights.likeness.requiresApproval && (
                        <p>• Prior approval required for all outputs</p>
                      )}
                    </div>
                  )}
                  {contract.nilpRights.likeness.restrictions && (
                    <p className="ml-6 text-xs text-muted-foreground italic">
                      Restrictions: {contract.nilpRights.likeness.restrictions}
                    </p>
                  )}
                </div>

                {/* Persona Rights */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    {contract.nilpRights.persona.included ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <span className="font-semibold">PERSONA RIGHTS</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4 text-gray-400" />
                        <span className="font-semibold text-muted-foreground">PERSONA RIGHTS (Not Included)</span>
                      </>
                    )}
                  </div>
                  {contract.nilpRights.persona.included && (
                    <div className="ml-6 text-xs space-y-1">
                      {contract.nilpRights.persona.personalityTraits && contract.nilpRights.persona.personalityTraits.length > 0 && (
                        <p>• Traits: {contract.nilpRights.persona.personalityTraits.join(", ")}</p>
                      )}
                      {contract.nilpRights.persona.brandVoice && (
                        <p>• Brand voice: {contract.nilpRights.persona.brandVoice}</p>
                      )}
                      {contract.nilpRights.persona.messagingTone && (
                        <p>• Messaging: {contract.nilpRights.persona.messagingTone}</p>
                      )}
                    </div>
                  )}
                  {contract.nilpRights.persona.restrictions && (
                    <p className="ml-6 text-xs text-muted-foreground italic">
                      Restrictions: {contract.nilpRights.persona.restrictions}
                    </p>
                  )}
                </div>
              </div>
            </section>

            {/* Usage Rights & Restrictions */}
            <section>
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                USAGE RIGHTS & RESTRICTIONS
              </h3>
              <div className="bg-muted/30 rounded-lg p-4 space-y-3 text-sm">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-muted-foreground">Territory</span>
                    <p className="font-medium">{contract.terms.territory.join(", ")}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Category</span>
                    <p className="font-medium">{contract.terms.category}</p>
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">Media Channels</span>
                  <p className="font-medium capitalize">{contract.terms.mediaChannels.join(", ")}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Intended Use</span>
                  <p className="font-medium">{contract.terms.intendedUse}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Exclusivity</span>
                  <div className="mt-1">
                    {contract.terms.exclusivity.isExclusive ? (
                      <div className="space-y-1">
                        <Badge variant="secondary" className="text-xs">Exclusive</Badge>
                        {contract.terms.exclusivity.competitors && contract.terms.exclusivity.competitors.length > 0 && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Blocks: {contract.terms.exclusivity.competitors.join(", ")}
                          </p>
                        )}
                      </div>
                    ) : (
                      <span className="text-sm">Non-exclusive</span>
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* Compensation */}
            <section>
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                COMPENSATION
              </h3>
              <div className="bg-muted/30 rounded-lg p-4 space-y-3 text-sm">
                <div className="flex items-baseline gap-2">
                  <span className="text-muted-foreground">Total NILP Fee:</span>
                  <p className="text-2xl font-bold">${contract.compensation.totalAmount.toLocaleString()} {contract.compensation.currency}</p>
                </div>
                
                {contract.compensation.breakdown && (
                  <div>
                    <span className="text-muted-foreground text-xs">Payment Breakdown:</span>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {contract.compensation.breakdown.nameRights && (
                        <div className="text-xs">
                          • Name Rights: ${contract.compensation.breakdown.nameRights.toLocaleString()}
                        </div>
                      )}
                      {contract.compensation.breakdown.imageRights && (
                        <div className="text-xs">
                          • Image Rights: ${contract.compensation.breakdown.imageRights.toLocaleString()}
                        </div>
                      )}
                      {contract.compensation.breakdown.likenessRights && (
                        <div className="text-xs">
                          • Likeness Rights: ${contract.compensation.breakdown.likenessRights.toLocaleString()}
                        </div>
                      )}
                      {contract.compensation.breakdown.personaRights && (
                        <div className="text-xs">
                          • Persona Rights: ${contract.compensation.breakdown.personaRights.toLocaleString()}
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div>
                    <span className="text-muted-foreground">Payment Terms</span>
                    <p>{contract.compensation.paymentTerms}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Status</span>
                    <div className="flex items-center gap-2 mt-1">
                      {contract.compensation.paymentStatus === "paid" ? (
                        <>
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          <span className="font-medium">Paid in full</span>
                        </>
                      ) : (
                        <>
                          <Clock className="h-4 w-4 text-orange-500" />
                          <span className="font-medium">Pending</span>
                        </>
                      )}
                    </div>
                  </div>
                  {contract.compensation.paidAt && (
                    <div>
                      <span className="text-muted-foreground">Payment Date</span>
                      <p>{formatDateLong(contract.compensation.paidAt)}</p>
                    </div>
                  )}
                  {contract.compensation.invoiceNumber && (
                    <div>
                      <span className="text-muted-foreground">Invoice</span>
                      <p>{contract.compensation.invoiceNumber}</p>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* Special Provisions */}
            {contract.specialProvisions && contract.specialProvisions.length > 0 && (
              <section>
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  SPECIAL PROVISIONS
                </h3>
                <div className="bg-muted/30 rounded-lg p-4">
                  <ul className="space-y-2 text-sm">
                    {contract.specialProvisions.map((provision, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-muted-foreground mt-0.5">•</span>
                        <span>{provision}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </section>
            )}

            {/* Documents */}
            {contract.documents.length > 0 && (
              <section>
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  DOCUMENTS
                </h3>
                <div className="space-y-2">
                  {contract.documents.map((doc) => (
                    <div key={doc.id} className="bg-muted/30 rounded-lg p-3 flex items-center justify-between">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <FileText className="h-5 w-5 text-muted-foreground shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate">{doc.fileName}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{(doc.fileSize / 1024 / 1024).toFixed(1)} MB</span>
                            {doc.signedAt && (
                              <>
                                <span>•</span>
                                <span>Signed: {formatDateLong(doc.signedAt)}</span>
                                {doc.signatureMethod && (
                                  <>
                                    <span>•</span>
                                    <span className="capitalize">{doc.signatureMethod}</span>
                                  </>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => toast.info("Download feature coming soon")}
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Download
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => toast.info("View feature coming soon")}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Contract History */}
            {contract.contractHistory.length > 0 && (
              <section>
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  CONTRACT HISTORY
                </h3>
                <div className="bg-muted/30 rounded-lg p-4">
                  <div className="space-y-3">
                    {contract.contractHistory.map((entry) => (
                      <div key={entry.id} className="flex gap-3 text-sm">
                        <span className="text-muted-foreground shrink-0 w-28">
                          {formatDateLong(entry.timestamp)}
                        </span>
                        <div className="flex-1">
                          <span className="capitalize font-medium">{entry.action.replace(/_/g, ' ')}</span>
                          {entry.details && (
                            <span className="text-muted-foreground ml-2">- {entry.details}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* Reminders */}
            <section>
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                REMINDERS SET
              </h3>
              <div className="bg-muted/30 rounded-lg p-4 space-y-2 text-sm">
                {contract.reminders.map((reminder, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>
                      {reminder.type === "30_days" && "30 days before expiration"}
                      {reminder.type === "7_days" && "7 days before expiration"}
                      {reminder.type === "category_available" && "When category becomes available"}
                    </span>
                    {reminder.triggeredAt && (
                      <Badge variant="outline" className="text-[10px] px-1">
                        Sent {formatDateLong(reminder.triggeredAt)}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </section>
          </div>
        </ScrollArea>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t flex items-center justify-between">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline"
              onClick={() => toast.info("Download feature coming soon")}
            >
              <Download className="mr-2 h-4 w-4" />
              Download Contract
            </Button>
            {contract.projectId && (
              <Button 
                variant="outline"
                onClick={() => toast.info("Navigate to project")}
              >
                View Project
              </Button>
            )}
            {isActive && daysRemaining <= 60 && onRequestRenewal && (
              <Button onClick={onRequestRenewal}>
                Request Renewal
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
