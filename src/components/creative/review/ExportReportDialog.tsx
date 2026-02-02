'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { FileDown, FileText, Table, Code } from 'lucide-react'
import { toast } from 'sonner'
import type { AssetReviewData } from '@/types/creative'

interface ExportReportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  assetName: string
  reviewData: AssetReviewData | null
}

type ExportFormat = 'pdf' | 'csv' | 'json'

export function ExportReportDialog({
  open,
  onOpenChange,
  assetName,
  reviewData,
}: ExportReportDialogProps) {
  const [format, setFormat] = useState<ExportFormat>('pdf')
  const [includeDetails, setIncludeDetails] = useState(true)
  const [includeRecommendations, setIncludeRecommendations] = useState(true)
  const [includeMetadata, setIncludeMetadata] = useState(true)
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async () => {
    if (!reviewData) {
      toast.error('No review data available to export')
      return
    }

    setIsExporting(true)

    try {
      // Simulate export process
      await new Promise(resolve => setTimeout(resolve, 1500))

      // In real app, would generate actual file
      const filename = `asset-review-${assetName.replace(/\s+/g, '-').toLowerCase()}.${format}`
      
      // INTEGRATION POINT: Generate and download actual file
      // For PDF: Use jsPDF or similar
      // For CSV: Generate CSV string and trigger download
      // For JSON: Stringify reviewData and trigger download

      toast.success(`Report exported as ${format.toUpperCase()}`, {
        description: `Downloaded: ${filename}`,
      })
      
      onOpenChange(false)
    } catch (error) {
      toast.error('Failed to export report')
      console.error(error)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileDown className="h-5 w-5" />
            Export Review Report
          </DialogTitle>
          <DialogDescription>
            Download a comprehensive report of all check results for {assetName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Format Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Export Format</Label>
            <RadioGroup value={format} onValueChange={(v) => setFormat(v as ExportFormat)}>
              <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                <RadioGroupItem value="pdf" id="pdf" />
                <Label htmlFor="pdf" className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-red-600" />
                    <div>
                      <div className="font-medium">PDF Report</div>
                      <div className="text-xs text-muted-foreground">
                        Full detailed report with all checks and visualizations
                      </div>
                    </div>
                  </div>
                </Label>
              </div>

              <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                <RadioGroupItem value="csv" id="csv" />
                <Label htmlFor="csv" className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <Table className="h-4 w-4 text-green-600" />
                    <div>
                      <div className="font-medium">CSV Summary</div>
                      <div className="text-xs text-muted-foreground">
                        Scores only, ideal for spreadsheet analysis
                      </div>
                    </div>
                  </div>
                </Label>
              </div>

              <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                <RadioGroupItem value="json" id="json" />
                <Label htmlFor="json" className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <Code className="h-4 w-4 text-blue-600" />
                    <div>
                      <div className="font-medium">JSON Data</div>
                      <div className="text-xs text-muted-foreground">
                        Raw data for API integration or custom processing
                      </div>
                    </div>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Include Options */}
          {format === 'pdf' && (
            <div className="space-y-3">
              <Label className="text-sm font-medium">Include in Report</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="details"
                    checked={includeDetails}
                    onCheckedChange={(checked) => setIncludeDetails(checked === true)}
                  />
                  <Label htmlFor="details" className="text-sm cursor-pointer">
                    Detailed check results
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="recommendations"
                    checked={includeRecommendations}
                    onCheckedChange={(checked) => setIncludeRecommendations(checked === true)}
                  />
                  <Label htmlFor="recommendations" className="text-sm cursor-pointer">
                    Recommendations
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="metadata"
                    checked={includeMetadata}
                    onCheckedChange={(checked) => setIncludeMetadata(checked === true)}
                  />
                  <Label htmlFor="metadata" className="text-sm cursor-pointer">
                    Asset metadata and timestamps
                  </Label>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isExporting}>
            Cancel
          </Button>
          <Button onClick={handleExport} disabled={isExporting || !reviewData}>
            {isExporting ? (
              <>Exporting...</>
            ) : (
              <>
                <FileDown className="mr-2 h-4 w-4" />
                Export {format.toUpperCase()}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
