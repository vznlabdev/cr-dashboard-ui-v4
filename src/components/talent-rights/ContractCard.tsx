"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { 
  FileText, 
  Download, 
  Eye, 
  MessageSquare, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  XCircle,
  ExternalLink,
  DollarSign,
  Calendar,
  MapPin,
  Tv,
  Shield,
  X
} from "lucide-react"
import type { TalentContract } from "@/types/talent-contracts"
import { formatDateLong } from "@/lib/format-utils"
import { getDaysUntilExpiration } from "@/types/talent-contracts"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { toast } from "sonner"

interface ContractCardProps {
  contract: TalentContract
  onViewDetails?: () => void
  onSign?: () => void
  onRenewal?: () => void
}

const getStatusConfig = (status: TalentContract["status"]) => {
  switch (status) {
    case "signed":
      return { variant: "default" as const, icon: CheckCircle2, label: "ACTIVE", color: "text-green-600" }
    case "pending_signature":
      return { variant: "secondary" as const, icon: Clock, label: "AWAITING SIGNATURE", color: "text-purple-600" }
    case "negotiating":
      return { variant: "outline" as const, icon: MessageSquare, label: "NEGOTIATING", color: "text-orange-600" }
    case "sent":
      return { variant: "outline" as const, icon: Clock, label: "SENT", color: "text-blue-600" }
    case "expired":
      return { variant: "destructive" as const, icon: XCircle, label: "EXPIRED", color: "text-red-600" }
    case "draft":
      return { variant: "outline" as const, icon: FileText, label: "DRAFT", color: "text-gray-600" }
    case "under_review":
      return { variant: "outline" as const, icon: Eye, label: "UNDER REVIEW", color: "text-yellow-600" }
    default:
      return { variant: "outline" as const, icon: FileText, label: status.toUpperCase(), color: "text-gray-600" }
  }
}

export function ContractCard({ contract, onViewDetails, onSign, onRenewal }: ContractCardProps) {
  const statusConfig = getStatusConfig(contract.status)
  const StatusIcon = statusConfig.icon
  const daysUntilExpiration = getDaysUntilExpiration(new Date(contract.terms.expirationDate))
  const isExpiringSoon = daysUntilExpiration > 0 && daysUntilExpiration <= 30
  const isActive = contract.status === "signed" && daysUntilExpiration > 0

  const handleDownload = () => {
    toast.info("Download feature coming soon")
  }

  const handleDownloadAll = () => {
    toast.info("Download all documents feature coming soon")
  }

  return (
    <Card className="hover:shadow-md transition-shadow border-l-4" style={{
      borderLeftColor: isExpiringSoon ? '#f97316' : isActive ? '#22c55e' : '#94a3b8'
    }}>
      <CardContent className="p-6 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant={statusConfig.variant} className="shrink-0 flex items-center gap-1">
                <StatusIcon className="h-3 w-3" />
                {statusConfig.label}
              </Badge>
              {isExpiringSoon && isActive && (
                <Badge variant="outline" className="shrink-0 flex items-center gap-1 border-orange-500 text-orange-600">
                  <AlertTriangle className="h-3 w-3" />
                  EXPIRES IN {daysUntilExpiration} DAYS
                </Badge>
              )}
            </div>
            <h3 className="text-lg font-semibold mb-1">{contract.title}</h3>
            <p className="text-sm text-muted-foreground">Contract ID: {contract.contractId}</p>
          </div>
        </div>

        <Separator />

        {/* Details */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground mb-1">Brand</p>
            <p className="font-medium">{contract.brandName}</p>
          </div>
          <div>
            <p className="text-muted-foreground mb-1">Type</p>
            <p className="font-medium capitalize">{contract.contractType.replace(/_/g, ' ')}</p>
          </div>
          {contract.projectTitle && (
            <div className="col-span-2">
              <p className="text-muted-foreground mb-1">Project</p>
              <p className="font-medium">{contract.projectTitle}</p>
            </div>
          )}
        </div>

        <Separator />

        {/* NILP Rights Granted */}
        <div>
          <p className="text-sm font-semibold mb-2">NILP RIGHTS GRANTED</p>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center gap-2">
              {contract.nilpRights.name.included ? (
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              ) : (
                <XCircle className="h-4 w-4 text-gray-400" />
              )}
              <span className={contract.nilpRights.name.included ? "" : "text-muted-foreground"}>
                Name
              </span>
            </div>
            <div className="flex items-center gap-2">
              {contract.nilpRights.image.included ? (
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              ) : (
                <XCircle className="h-4 w-4 text-gray-400" />
              )}
              <span className={contract.nilpRights.image.included ? "" : "text-muted-foreground"}>
                Image
              </span>
            </div>
            <div className="flex items-center gap-2">
              {contract.nilpRights.likeness.included ? (
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              ) : (
                <XCircle className="h-4 w-4 text-gray-400" />
              )}
              <span className={contract.nilpRights.likeness.included ? "" : "text-muted-foreground"}>
                Likeness {contract.nilpRights.likeness.aiGeneration && "(AI)"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {contract.nilpRights.persona.included ? (
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              ) : (
                <XCircle className="h-4 w-4 text-gray-400" />
              )}
              <span className={contract.nilpRights.persona.included ? "" : "text-muted-foreground"}>
                Persona
              </span>
            </div>
          </div>
        </div>

        <Separator />

        {/* Terms */}
        <div>
          <p className="text-sm font-semibold mb-2">TERMS</p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
            <div>
              <span className="text-muted-foreground">Effective:</span>
              <span className="ml-2">{formatDateLong(contract.terms.effectiveDate)}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Expires:</span>
              <span className="ml-2">{formatDateLong(contract.terms.expirationDate)}</span>
              {isActive && isExpiringSoon && (
                <span className="ml-1 text-orange-600 font-medium">
                  ({daysUntilExpiration} days remaining)
                </span>
              )}
            </div>
            <div className="col-span-2">
              <span className="text-muted-foreground">Territory:</span>
              <span className="ml-2">{contract.terms.territory.join(", ")}</span>
            </div>
            <div className="col-span-2">
              <span className="text-muted-foreground">Usage:</span>
              <span className="ml-2 capitalize">{contract.terms.mediaChannels.join(", ")}</span>
            </div>
            <div className="col-span-2">
              <span className="text-muted-foreground">Category:</span>
              <span className="ml-2">{contract.terms.category}</span>
            </div>
            <div className="col-span-2">
              <span className="text-muted-foreground">Exclusivity:</span>
              <span className="ml-2">
                {contract.terms.exclusivity.isExclusive ? (
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0">Exclusive</Badge>
                ) : (
                  "Non-exclusive"
                )}
              </span>
            </div>
          </div>
        </div>

        <Separator />

        {/* Compensation */}
        <div>
          <p className="text-sm font-semibold mb-2">COMPENSATION</p>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-bold">${contract.compensation.totalAmount.toLocaleString()} {contract.compensation.currency}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-muted-foreground">Status:</span>
                {contract.compensation.paymentStatus === "paid" ? (
                  <Badge variant="default" className="text-[10px] px-1.5 py-0">
                    <CheckCircle2 className="h-2.5 w-2.5 mr-1" />
                    Paid
                  </Badge>
                ) : contract.compensation.paymentStatus === "pending" ? (
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                    <Clock className="h-2.5 w-2.5 mr-1" />
                    Pending
                  </Badge>
                ) : (
                  <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
                    <AlertTriangle className="h-2.5 w-2.5 mr-1" />
                    Overdue
                  </Badge>
                )}
                {contract.compensation.paidAt && (
                  <span className="text-xs text-muted-foreground">
                    ({formatDateLong(contract.compensation.paidAt)})
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Documents */}
        {contract.documents.length > 0 && (
          <>
            <div>
              <p className="text-sm font-semibold mb-2">DOCUMENTS</p>
              <div className="space-y-1.5">
                {contract.documents.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <FileText className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <span className="truncate">{doc.fileName}</span>
                      <span className="text-muted-foreground shrink-0">
                        ({(doc.fileSize / 1024 / 1024).toFixed(1)} MB)
                      </span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {doc.signedAt && (
                        <Badge variant="outline" className="text-[9px] px-1">
                          Signed: {formatDateLong(doc.signedAt)}
                        </Badge>
                      )}
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6"
                        onClick={handleDownload}
                      >
                        <Download className="h-3 w-3" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6"
                        onClick={() => toast.info("View feature coming soon")}
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <Separator />
          </>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={onViewDetails}
            >
              <Eye className="mr-2 h-4 w-4" />
              View Full Contract
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleDownloadAll}
            >
              <Download className="mr-2 h-4 w-4" />
              Download All
            </Button>
          </div>
          <div className="flex items-center gap-2">
            {contract.projectId && (
              <Button 
                variant="ghost" 
                size="sm"
                asChild
              >
                <Link href={`/projects/${contract.projectId}`}>
                  <ExternalLink className="mr-2 h-4 w-4" />
                  View Project
                </Link>
              </Button>
            )}
            {isExpiringSoon && isActive && onRenewal && (
              <Button 
                size="sm"
                onClick={onRenewal}
              >
                Request Renewal
              </Button>
            )}
            {contract.status === "pending_signature" && onSign && (
              <Button 
                size="sm"
                onClick={onSign}
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Review & Sign
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
