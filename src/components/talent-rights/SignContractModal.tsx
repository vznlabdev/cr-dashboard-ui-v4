"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle2, AlertTriangle, FileText, Download, CheckSquare } from "lucide-react"
import type { TalentContract } from "@/types/talent-contracts"
import { formatDateLong } from "@/lib/format-utils"
import { useContracts } from "@/contexts/contracts-context"
import { toast } from "sonner"

interface SignContractModalProps {
  contract: TalentContract
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SignContractModal({ contract, open, onOpenChange }: SignContractModalProps) {
  const { signContract, loading } = useContracts()
  
  const [signature, setSignature] = useState("")
  const [agreedRead, setAgreedRead] = useState(false)
  const [agreedRights, setAgreedRights] = useState(false)
  const [agreedExclusivity, setAgreedExclusivity] = useState(false)
  const [agreedCompensation, setAgreedCompensation] = useState(false)
  const [agreedBinding, setAgreedBinding] = useState(false)

  const allAcknowledged = agreedRead && agreedRights && agreedExclusivity && agreedCompensation && agreedBinding
  const canSign = allAcknowledged && signature.trim().length > 0

  const handleSign = async () => {
    if (!canSign) {
      toast.error("Please complete all acknowledgments and enter your signature")
      return
    }

    await signContract(contract.id, {
      fullLegalName: signature,
      agreedToTerms: true,
      timestamp: new Date(),
      ipAddress: "192.168.1.1" // In production, get actual IP
    })

    onOpenChange(false)
    setSignature("")
    setAgreedRead(false)
    setAgreedRights(false)
    setAgreedExclusivity(false)
    setAgreedCompensation(false)
    setAgreedBinding(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Sign NILP Contract
          </DialogTitle>
          <DialogDescription>
            {contract.title}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 px-6" style={{ maxHeight: 'calc(90vh - 180px)' }}>
          <div className="space-y-4 py-4">
            {/* Contract Preview */}
            <section>
              <h3 className="text-xs font-semibold text-muted-foreground mb-2">Contract Preview</h3>
              <Card className="bg-muted/30">
                <CardContent className="p-6 text-center">
                  <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground mb-3">
                    {contract.documents[0]?.fileName || "Contract Document"}
                  </p>
                  <p className="text-xs text-muted-foreground mb-4">
                    Full PDF preview would be embedded here
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => toast.info("Download feature coming soon")}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download Full PDF
                  </Button>
                </CardContent>
              </Card>
            </section>

            {/* Key Terms */}
            <section>
              <h3 className="text-xs font-semibold text-muted-foreground mb-2">Key NILP Terms</h3>
              <Card className="bg-muted/30">
                <CardContent className="p-4 space-y-3 text-sm">
                  <div>
                    <p className="font-medium mb-2">NILP Rights Granted:</p>
                    <ul className="space-y-1 ml-4">
                      {contract.nilpRights.name.included && (
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                          <span>Name - {contract.nilpRights.name.usage?.join(", ") || "Various uses"}</span>
                        </li>
                      )}
                      {contract.nilpRights.image.included && (
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                          <span>Image - {contract.nilpRights.image.usage?.join(", ") || "Various uses"}</span>
                        </li>
                      )}
                      {contract.nilpRights.likeness.included && (
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                          <span>Likeness - {contract.nilpRights.likeness.aiGeneration ? "AI-generated imagery" : "Standard use"}</span>
                        </li>
                      )}
                      {contract.nilpRights.persona.included && (
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                          <span>Persona - {contract.nilpRights.persona.brandVoice || "Character representation"}</span>
                        </li>
                      )}
                    </ul>
                  </div>

                  <Separator />

                  <div>
                    <p className="font-medium mb-2">Terms:</p>
                    <ul className="space-y-1 text-xs ml-4">
                      <li>• Territory: {contract.terms.territory.join(", ")}</li>
                      <li>• Duration: {formatDateLong(contract.terms.effectiveDate)} - {formatDateLong(contract.terms.expirationDate)}</li>
                      <li>• Usage: {contract.terms.intendedUse}</li>
                      <li>• Category: {contract.terms.category}</li>
                      <li>• Exclusivity: {contract.terms.exclusivity.isExclusive ? "Exclusive" : "Non-exclusive"}</li>
                      <li>• Compensation: ${contract.compensation.totalAmount.toLocaleString()} {contract.compensation.currency}</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Acknowledgements */}
            <section>
              <h3 className="text-xs font-semibold text-muted-foreground mb-2">Acknowledgements</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <Checkbox 
                    id="ack-1" 
                    checked={agreedRead}
                    onCheckedChange={(checked) => setAgreedRead(checked as boolean)}
                  />
                  <Label htmlFor="ack-1" className="text-sm cursor-pointer leading-relaxed">
                    I have read and understood all NILP terms of this agreement
                  </Label>
                </div>

                <div className="flex items-start gap-2">
                  <Checkbox 
                    id="ack-2" 
                    checked={agreedRights}
                    onCheckedChange={(checked) => setAgreedRights(checked as boolean)}
                  />
                  <Label htmlFor="ack-2" className="text-sm cursor-pointer leading-relaxed">
                    I agree to grant the NILP rights as outlined
                  </Label>
                </div>

                <div className="flex items-start gap-2">
                  <Checkbox 
                    id="ack-3" 
                    checked={agreedExclusivity}
                    onCheckedChange={(checked) => setAgreedExclusivity(checked as boolean)}
                  />
                  <Label htmlFor="ack-3" className="text-sm cursor-pointer leading-relaxed">
                    I understand the category exclusivity restrictions
                  </Label>
                </div>

                <div className="flex items-start gap-2">
                  <Checkbox 
                    id="ack-4" 
                    checked={agreedCompensation}
                    onCheckedChange={(checked) => setAgreedCompensation(checked as boolean)}
                  />
                  <Label htmlFor="ack-4" className="text-sm cursor-pointer leading-relaxed">
                    I confirm the compensation terms are acceptable
                  </Label>
                </div>

                <div className="flex items-start gap-2">
                  <Checkbox 
                    id="ack-5" 
                    checked={agreedBinding}
                    onCheckedChange={(checked) => setAgreedBinding(checked as boolean)}
                  />
                  <Label htmlFor="ack-5" className="text-sm cursor-pointer leading-relaxed">
                    I understand this is a legally binding NILP agreement
                  </Label>
                </div>
              </div>
            </section>

            {/* Electronic Signature */}
            <section>
              <h3 className="text-xs font-semibold text-muted-foreground mb-2">Electronic Signature</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signature">Type your full legal name to sign:</Label>
                  <Input
                    id="signature"
                    placeholder="Michael Chen"
                    value={signature}
                    onChange={(e) => setSignature(e.target.value)}
                    className="text-lg font-medium"
                  />
                </div>
                
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                  <p className="text-xs text-blue-900 dark:text-blue-100">
                    By signing, you agree that your electronic signature is legally binding and grants the NILP rights specified in this agreement.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
                  <div>
                    <span>Date:</span>
                    <p className="font-medium text-foreground">{formatDateLong(new Date())}</p>
                  </div>
                  <div>
                    <span>IP Address:</span>
                    <p className="font-medium text-foreground">Will be recorded for verification</p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </ScrollArea>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t flex items-center justify-between">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button 
            onClick={handleSign} 
            disabled={!canSign || loading}
            className="min-w-[140px]"
          >
            <CheckCircle2 className="mr-2 h-4 w-4" />
            {loading ? "Signing..." : "Sign NILP Contract"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
