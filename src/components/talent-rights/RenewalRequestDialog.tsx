"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { RefreshCw, Plus, XCircle, Mail, AlertTriangle } from "lucide-react"
import type { TalentContract } from "@/types/talent-contracts"
import { formatDateLong } from "@/lib/format-utils"
import { getDaysUntilExpiration } from "@/types/talent-contracts"
import { useContracts } from "@/contexts/contracts-context"
import { toast } from "sonner"

interface RenewalRequestDialogProps {
  contract: TalentContract
  open: boolean
  onOpenChange: (open: boolean) => void
}

type RenewalOption = "extend" | "negotiate" | "expire" | "contact"

export function RenewalRequestDialog({ contract, open, onOpenChange }: RenewalRequestDialogProps) {
  const { requestRenewal, loading } = useContracts()
  const [selectedOption, setSelectedOption] = useState<RenewalOption>("extend")
  const [extensionPeriod, setExtensionPeriod] = useState<"3" | "6" | "12">("6")
  const [notes, setNotes] = useState("")

  const daysRemaining = getDaysUntilExpiration(new Date(contract.terms.expirationDate))

  const handleSubmit = async () => {
    let requestMessage = ""
    
    switch (selectedOption) {
      case "extend":
        requestMessage = `Extend current NILP terms by ${extensionPeriod} months`
        break
      case "negotiate":
        requestMessage = "Negotiate new NILP agreement"
        break
      case "expire":
        requestMessage = "Let contract expire"
        break
      case "contact":
        requestMessage = "Contact brand directly"
        break
    }

    if (notes) {
      requestMessage += ` - ${notes}`
    }

    await requestRenewal(contract.id, requestMessage)
    onOpenChange(false)
    setSelectedOption("extend")
    setExtensionPeriod("6")
    setNotes("")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Request Renewal
          </DialogTitle>
          <DialogDescription>
            {contract.title}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Contract Info */}
          <Card className="bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-orange-500 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-medium">
                    This contract expires in {daysRemaining} days
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Expiration: {formatDateLong(contract.terms.expirationDate)}
                  </p>
                  {contract.terms.exclusivity.isExclusive && (
                    <p className="text-xs text-muted-foreground">
                      Category "{contract.terms.category}" will become available after expiration
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Renewal Options */}
          <div className="space-y-3">
            <Label className="text-xs font-semibold text-muted-foreground">Renewal Options</Label>
            <RadioGroup value={selectedOption} onValueChange={(value) => setSelectedOption(value as RenewalOption)}>
              {/* Extend Current Terms */}
              <div className="flex items-start gap-2 pb-3 border-b">
                <RadioGroupItem value="extend" id="extend" className="mt-1" />
                <div className="flex-1 space-y-2">
                  <Label htmlFor="extend" className="text-sm font-medium cursor-pointer">
                    Extend current NILP terms
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Continue with same NILP rights, compensation, and restrictions
                  </p>
                  {selectedOption === "extend" && (
                    <div className="mt-3 space-y-2">
                      <Label className="text-xs">Extension Period:</Label>
                      <RadioGroup value={extensionPeriod} onValueChange={(value) => setExtensionPeriod(value as typeof extensionPeriod)} className="flex gap-3">
                        <div className="flex items-center gap-2">
                          <RadioGroupItem value="3" id="3-months" />
                          <Label htmlFor="3-months" className="text-xs cursor-pointer">
                            +3 months
                          </Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <RadioGroupItem value="6" id="6-months" />
                          <Label htmlFor="6-months" className="text-xs cursor-pointer">
                            +6 months
                          </Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <RadioGroupItem value="12" id="12-months" />
                          <Label htmlFor="12-months" className="text-xs cursor-pointer">
                            +1 year
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>
                  )}
                </div>
              </div>

              {/* Negotiate New Agreement */}
              <div className="flex items-start gap-2 pb-3 border-b">
                <RadioGroupItem value="negotiate" id="negotiate" className="mt-1" />
                <div className="flex-1">
                  <Label htmlFor="negotiate" className="text-sm font-medium cursor-pointer">
                    Negotiate new NILP agreement
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Propose changes to NILP rights, terms, or compensation
                  </p>
                </div>
              </div>

              {/* Let Expire */}
              <div className="flex items-start gap-2 pb-3 border-b">
                <RadioGroupItem value="expire" id="expire" className="mt-1" />
                <div className="flex-1">
                  <Label htmlFor="expire" className="text-sm font-medium cursor-pointer">
                    Let expire
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    No renewal - category becomes available after expiration
                  </p>
                  {contract.terms.exclusivity.isExclusive && (
                    <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                      ✓ Category "{contract.terms.category}" will become available
                    </p>
                  )}
                </div>
              </div>

              {/* Contact Brand */}
              <div className="flex items-start gap-2">
                <RadioGroupItem value="contact" id="contact" className="mt-1" />
                <div className="flex-1">
                  <Label htmlFor="contact" className="text-sm font-medium cursor-pointer">
                    Contact brand directly
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Discuss renewal options with {contract.brandName}
                  </p>
                </div>
              </div>
            </RadioGroup>
          </div>

          {/* Additional Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes (optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add any specific requests or concerns..."
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t flex items-center justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Sending..." : "Send Request"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
