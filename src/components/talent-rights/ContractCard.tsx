"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  CheckCircle2, 
  Clock, 
  XCircle,
  AlertTriangle,
  Eye,
  Download,
  RefreshCw,
  FileText
} from "lucide-react"
import type { TalentContract } from "@/types/talent-contracts"
import { getDaysUntilExpiration } from "@/types/talent-contracts"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { toast } from "sonner"

interface ContractCardProps {
  contract: TalentContract
  onSign?: () => void
  onRenewal?: () => void
  compact?: boolean
}

const getStatusConfig = (status: TalentContract["status"]) => {
  switch (status) {
    case "signed":
      return { label: "Active", color: "text-green-600 bg-green-50 dark:bg-green-900/20" }
    case "pending_signature":
      return { label: "Pending", color: "text-purple-600 bg-purple-50 dark:bg-purple-900/20" }
    case "expired":
      return { label: "Expired", color: "text-red-600 bg-red-50 dark:bg-red-900/20" }
    case "draft":
      return { label: "Draft", color: "text-gray-600 bg-gray-50 dark:bg-gray-900/20" }
    default:
      return { label: status, color: "text-gray-600 bg-gray-50 dark:bg-gray-900/20" }
  }
}

function getNilpIndicator(contract: TalentContract): string {
  const indicators = []
  if (contract.nilpRights.name.included) indicators.push("N")
  if (contract.nilpRights.image.included) indicators.push("I")
  if (contract.nilpRights.likeness.included) indicators.push("L")
  if (contract.nilpRights.persona.included) indicators.push("P")
  return indicators.join(" ")
}

export function ContractCard({ contract, onSign, onRenewal, compact = false }: ContractCardProps) {
  const statusConfig = getStatusConfig(contract.status)
  const daysUntilExpiration = getDaysUntilExpiration(new Date(contract.terms.expirationDate))
  const isExpiringSoon = daysUntilExpiration > 0 && daysUntilExpiration <= 30
  const isActive = contract.status === "signed" && daysUntilExpiration > 0
  const nilpIndicator = getNilpIndicator(contract)

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  return (
    <Link 
      href={`/creative/talent-rights/contracts/${contract.id}`}
      className={cn(
        "block group border-b last:border-b-0 hover:bg-muted/50 transition-colors",
        compact ? "py-2.5 px-4" : "py-3 px-4"
      )}
    >
      <div className="flex items-center justify-between gap-4">
        {/* Main Info */}
        <div className="flex-1 min-w-0 space-y-1">
          {/* Line 1: Talent, Brand, Amount, Expiration, Status, Title */}
          <div className="flex items-center gap-3 text-sm">
            {/* Primary: Who */}
            <span className="font-medium">{contract.talentName}</span>
            
            <span className="text-muted-foreground/40">|</span>
            
            {/* Primary: Client */}
            <span className="text-muted-foreground">{contract.brandName}</span>
            
            <span className="text-muted-foreground/40">|</span>
            
            {/* Primary: Value */}
            <span className="font-semibold">${contract.compensation.totalAmount.toLocaleString()}</span>
            
            <span className="text-muted-foreground/40">|</span>
            
            {/* Primary: Timeline */}
            <span className={cn(
              "text-xs",
              isExpiringSoon && isActive && "text-orange-600 font-medium"
            )}>
              {formatDate(contract.terms.expirationDate)}
            </span>
            
            {isExpiringSoon && isActive && (
              <Badge variant="outline" className="text-[9px] px-1 py-0 h-4 border-orange-500 text-orange-600">
                {daysUntilExpiration}d
              </Badge>
            )}
            
            <span className="text-muted-foreground/40">|</span>
            
            {/* Secondary: Status + Title */}
            <div className="flex items-center gap-2">
              <Badge 
                variant="outline" 
                className={cn("text-[9px] px-1 py-0 h-4 border-0", statusConfig.color)}
              >
                {statusConfig.label}
              </Badge>
              <span className="text-xs text-muted-foreground truncate">{contract.title}</span>
            </div>
          </div>

          {/* Line 2: Contract ID, NILP, Category, Territory */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="font-mono">{contract.contractId}</span>
            
            {nilpIndicator && (
              <>
                <span className="text-muted-foreground/40">|</span>
                <span className="font-mono font-medium">{nilpIndicator}</span>
              </>
            )}
            
            <span className="text-muted-foreground/40">|</span>
            <span>{contract.terms.category} • {contract.terms.territory.join(", ")}</span>
            
            <span className="text-muted-foreground/40">|</span>
            <div className="flex items-center gap-1.5">
              {contract.terms.exclusivity.isExclusive && (
                <Badge variant="secondary" className="text-[9px] px-0.5 py-0 h-3.5">Exclusive</Badge>
              )}
              {contract.compensation.paymentStatus === "paid" && (
                <span className="text-green-600 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Paid
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
