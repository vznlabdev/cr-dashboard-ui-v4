"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { toast } from "sonner"
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ExternalLink,
  Shield,
  FileText,
  TrendingUp,
} from "lucide-react"
import { Asset, CopyrightCheckData } from "@/types/creative"
import { cn } from "@/lib/utils"
import { format } from "date-fns"

interface CopyrightCheckReviewProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  asset: Asset
  onApprove?: (assetId: string) => void
  onReject?: (assetId: string, reason: string) => void
}

export function CopyrightCheckReview({
  open,
  onOpenChange,
  asset,
  onApprove,
  onReject,
}: CopyrightCheckReviewProps) {
  const [rejectionReason, setRejectionReason] = useState("")
  const [showRejectInput, setShowRejectInput] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  if (!asset.copyrightCheckData) {
    return null
  }

  const checkData = asset.copyrightCheckData
  const similarityScore = checkData.similarityScore
  const threshold = 30
  const passed = similarityScore < threshold
  const riskLevel = checkData.riskBreakdown.riskLevel

  const handleApprove = async () => {
    if (!onApprove) {
      toast.error("Approve function not provided")
      return
    }

    setIsProcessing(true)
    try {
      await onApprove(asset.id)
      toast.success(`Asset "${asset.name}" approved successfully`)
      onOpenChange(false)
    } catch (error) {
      toast.error("Failed to approve asset")
      console.error(error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleReject = async () => {
    if (!onReject) {
      toast.error("Reject function not provided")
      return
    }

    if (!rejectionReason.trim()) {
      toast.error("Please provide a rejection reason")
      return
    }

    setIsProcessing(true)
    try {
      await onReject(asset.id, rejectionReason)
      toast.success(`Asset "${asset.name}" rejected`)
      onOpenChange(false)
      setRejectionReason("")
      setShowRejectInput(false)
    } catch (error) {
      toast.error("Failed to reject asset")
      console.error(error)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Copyright Check Results
          </DialogTitle>
          <DialogDescription>
            Review copyright check results for {asset.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Similarity Score */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center justify-between">
                <span>Similarity Score</span>
                <Badge
                  variant={passed ? "default" : "destructive"}
                  className={cn(
                    "text-sm font-semibold",
                    passed && "bg-green-500 hover:bg-green-600"
                  )}
                >
                  {similarityScore}%
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Threshold</span>
                  <span className="font-medium">{threshold}%</span>
                </div>
                <Progress
                  value={similarityScore}
                  className={cn(
                    "h-3",
                    passed ? "bg-green-500" : "bg-red-500"
                  )}
                />
                <div className="flex items-center gap-2 text-sm">
                  {passed ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span className="text-green-600 font-medium">
                        Copyright Check Passed
                      </span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4 text-red-500" />
                      <span className="text-red-600 font-medium">
                        Copyright Check Failed
                      </span>
                    </>
                  )}
                </div>
              </div>

              {!passed && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Similarity score of {similarityScore}% exceeds the {threshold}% threshold.
                    This asset requires admin review before approval.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Risk Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Risk Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Copyright Risk</span>
                    <span className="font-medium">
                      {checkData.riskBreakdown.copyrightRisk}%
                    </span>
                  </div>
                  <Progress
                    value={checkData.riskBreakdown.copyrightRisk}
                    className="h-2"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Trademark Risk</span>
                    <span className="font-medium">
                      {checkData.riskBreakdown.trademarkRisk}%
                    </span>
                  </div>
                  <Progress
                    value={checkData.riskBreakdown.trademarkRisk}
                    className="h-2"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Overall Risk</span>
                    <Badge
                      variant={
                        riskLevel === "low"
                          ? "default"
                          : riskLevel === "medium"
                          ? "secondary"
                          : "destructive"
                      }
                      className="text-xs"
                    >
                      {riskLevel.toUpperCase()}
                    </Badge>
                  </div>
                  <Progress
                    value={checkData.riskBreakdown.overallRisk}
                    className={cn(
                      "h-2",
                      riskLevel === "high" && "bg-red-500",
                      riskLevel === "medium" && "bg-yellow-500",
                      riskLevel === "low" && "bg-green-500"
                    )}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Matched Sources */}
          {checkData.matchedSources.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Matched Sources ({checkData.matchedSources.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {checkData.matchedSources.map((source) => (
                    <div
                      key={source.id}
                      className="flex items-start justify-between p-3 bg-muted/50 rounded-lg border border-border"
                    >
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{source.title}</span>
                          <Badge variant="outline" className="text-xs">
                            {source.similarity}% match
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{source.source}</span>
                          <span>•</span>
                          <span className="capitalize">{source.type}</span>
                        </div>
                      </div>
                      {source.url && (
                        <a
                          href={source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 hover:bg-muted rounded-md transition-colors"
                        >
                          <ExternalLink className="h-4 w-4 text-muted-foreground" />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recommendations */}
          {checkData.recommendations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {checkData.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <span className="text-muted-foreground mt-0.5">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Check Metadata */}
          <div className="text-xs text-muted-foreground space-y-1">
            <div className="flex items-center justify-between">
              <span>Checked At</span>
              <span>{format(checkData.checkedAt, "MMM d, yyyy 'at' h:mm a")}</span>
            </div>
            {checkData.checkDuration && (
              <div className="flex items-center justify-between">
                <span>Check Duration</span>
                <span>{(checkData.checkDuration / 1000).toFixed(1)}s</span>
              </div>
            )}
          </div>

          <Separator />

          {/* Rejection Reason Input */}
          {showRejectInput && (
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Rejection Reason <span className="text-destructive">*</span>
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Explain why this asset is being rejected..."
                className="w-full min-h-[100px] p-3 border rounded-md resize-none text-sm"
                disabled={isProcessing}
              />
            </div>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false)
              setShowRejectInput(false)
              setRejectionReason("")
            }}
            disabled={isProcessing}
          >
            Close
          </Button>
          {!passed && asset.approvalStatus === "pending" && (
            <>
              {!showRejectInput ? (
                <>
                  <Button
                    variant="outline"
                    onClick={() => setShowRejectInput(true)}
                    disabled={isProcessing}
                  >
                    Reject
                  </Button>
                  <Button
                    onClick={handleApprove}
                    disabled={isProcessing}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {isProcessing ? "Processing..." : "Approve"}
                  </Button>
                </>
              ) : (
                <Button
                  variant="destructive"
                  onClick={handleReject}
                  disabled={isProcessing || !rejectionReason.trim()}
                >
                  {isProcessing ? "Processing..." : "Confirm Rejection"}
                </Button>
              )}
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

