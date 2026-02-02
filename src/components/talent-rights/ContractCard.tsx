"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FileText, Download, Eye, MessageSquare, CheckCircle2, Clock, AlertTriangle } from "lucide-react"
import type { TalentContract } from "@/types/talent-contracts"
import { formatDateLong } from "@/lib/format-utils"
import { cn } from "@/lib/utils"

interface ContractCardProps {
  contract: TalentContract
  onView: () => void
  onNegotiate: () => void
  onSign: () => void
}

const getStatusConfig = (status: TalentContract["status"]) => {
  switch (status) {
    case "signed":
      return { variant: "default" as const, icon: CheckCircle2, label: "Signed" }
    case "pending_signature":
      return { variant: "secondary" as const, icon: Clock, label: "Pending Signature" }
    case "negotiating":
      return { variant: "secondary" as const, icon: MessageSquare, label: "Negotiating" }
    case "sent":
      return { variant: "secondary" as const, icon: Clock, label: "Sent" }
    case "expired":
      return { variant: "destructive" as const, icon: AlertTriangle, label: "Expired" }
    case "draft":
      return { variant: "outline" as const, icon: FileText, label: "Draft" }
    default:
      return { variant: "outline" as const, icon: FileText, label: status }
  }
}

export function ContractCard({ contract, onView, onNegotiate, onSign }: ContractCardProps) {
  const statusConfig = getStatusConfig(contract.status)
  const StatusIcon = statusConfig.icon
  const showNegotiateButton = contract.status === "negotiating" || contract.status === "under_review"
  const showSignButton = contract.status === "pending_signature"

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
              <h4 className="font-semibold truncate">{contract.title}</h4>
              <Badge variant={statusConfig.variant} className="shrink-0 flex items-center gap-1">
                <StatusIcon className="h-3 w-3" />
                {statusConfig.label}
              </Badge>
              {contract.version > 1 && (
                <Badge variant="outline" className="text-[10px] px-1.5">
                  v{contract.version}
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span>Valid: {formatDateLong(contract.validFrom)} - {formatDateLong(contract.validThrough)}</span>
              <span>•</span>
              <span className="capitalize">{contract.compensationType.replace('_', ' ')}</span>
              {contract.compensationAmount && (
                <>
                  <span>•</span>
                  <span>${contract.compensationAmount.toLocaleString()}</span>
                </>
              )}
            </div>

            {contract.negotiations.length > 0 && (
              <div className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
                <MessageSquare className="h-3 w-3" />
                <span>{contract.negotiations.length} negotiation{contract.negotiations.length !== 1 ? 's' : ''}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button variant="ghost" size="sm" onClick={onView}>
              <Eye className="mr-2 h-4 w-4" />
              View
            </Button>
            {showNegotiateButton && (
              <Button variant="outline" size="sm" onClick={onNegotiate}>
                <MessageSquare className="mr-2 h-4 w-4" />
                Negotiate
              </Button>
            )}
            {showSignButton && (
              <Button size="sm" onClick={onSign}>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Sign
              </Button>
            )}
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
