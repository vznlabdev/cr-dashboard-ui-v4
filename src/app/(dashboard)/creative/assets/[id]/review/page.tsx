'use client'

import { useState, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { PageContainer } from '@/components/layout/PageContainer'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  ChevronLeft, 
  PlayCircle, 
  CheckCircle2, 
  XCircle,
  FileDown,
  Loader2,
  Shield,
  Eye,
  Search,
  Palette,
  Zap,
  ShieldCheck
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { mockAssets } from '@/lib/mock-data/creative'
import { useAssetChecks } from '@/hooks/useAssetChecks'
import { QuickStatsGrid } from '@/components/creative/review/QuickStatsGrid'
import { CopyrightCheckPanel } from '@/components/creative/review/CopyrightCheckPanel'
import { AccessibilityCheckPanel } from '@/components/creative/review/AccessibilityCheckPanel'
import { SEOCheckPanel } from '@/components/creative/review/SEOCheckPanel'
import { BrandCompliancePanel } from '@/components/creative/review/BrandCompliancePanel'
import { PerformanceCheckPanel } from '@/components/creative/review/PerformanceCheckPanel'
import { SecurityCheckPanel } from '@/components/creative/review/SecurityCheckPanel'
import { ExportReportDialog } from '@/components/creative/review/ExportReportDialog'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { useCopyrightCredits } from '@/lib/contexts/copyright-credits-context'
import type { CheckType } from '@/hooks/useAssetChecks'

export default function AssetReviewPage() {
  const params = useParams()
  const router = useRouter()
  const assetId = params.id as string
  
  // Find asset
  const asset = mockAssets.find(a => a.id === assetId)
  
  const [activeTab, setActiveTab] = useState<'all' | CheckType>('all')
  const [showExportDialog, setShowExportDialog] = useState(false)
  const { canRunCheck, getTotalAvailable } = useCopyrightCredits()
  
  // Initialize with existing review data if available
  const { 
    reviewData, 
    checkStates, 
    runCheck, 
    runAllChecksAction, 
    getCheckProgress,
    isAnyChecking 
  } = useAssetChecks(asset?.reviewData)

  if (!asset) {
    return (
      <PageContainer>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Asset not found</p>
          <Button variant="outline" className="mt-4" onClick={() => router.back()}>
            Go Back
          </Button>
        </div>
      </PageContainer>
    )
  }

  const handleRunCheck = async (checkType: CheckType) => {
    if (checkType === 'copyright' && !canRunCheck()) {
      toast.error('No copyright check credits available')
      return
    }
    await runCheck(checkType, asset.id, undefined, asset.brandId)
  }

  const handleRunAllChecks = async () => {
    if (!canRunCheck()) {
      toast.error('No copyright check credits available')
      return
    }
    await runAllChecksAction(asset.id, undefined, asset.brandId)
  }

  const overallScore = reviewData?.overallScore
  const checksProgress = getCheckProgress()

  return (
    <PageContainer>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Button variant="ghost" size="sm" asChild>
                <Link href={`/creative/assets/${asset.id}`}>
                  <ChevronLeft className="mr-1 h-4 w-4" />
                  Back to Asset
                </Link>
              </Button>
            </div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{asset.name}</h1>
              {overallScore !== undefined && (
                <Badge 
                  variant="outline" 
                  className={cn(
                    'text-lg px-3 py-1',
                    overallScore >= 80 && 'border-green-500 text-green-700 bg-green-50',
                    overallScore >= 50 && overallScore < 80 && 'border-amber-500 text-amber-700 bg-amber-50',
                    overallScore < 50 && 'border-red-500 text-red-700 bg-red-50'
                  )}
                >
                  {overallScore}/100
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {asset.brandName} • {asset.designType}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleRunAllChecks}
              disabled={isAnyChecking}
            >
              {isAnyChecking ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Running...
                </>
              ) : (
                <>
                  <PlayCircle className="mr-2 h-4 w-4" />
                  Run All Checks
                </>
              )}
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowExportDialog(true)}
              disabled={!reviewData || checksProgress === 0}
            >
              <FileDown className="mr-2 h-4 w-4" />
              Export Report
            </Button>
          </div>
        </div>
        
        {/* Export Dialog */}
        <ExportReportDialog
          open={showExportDialog}
          onOpenChange={setShowExportDialog}
          assetName={asset.name}
          reviewData={reviewData}
        />

        {/* Preview and Quick Stats Grid */}
        <div className="grid lg:grid-cols-5 gap-6">
          {/* Asset Preview */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-4">
                <div className="aspect-video relative rounded-lg overflow-hidden bg-muted">
                  <Image
                    src={asset.thumbnailUrl}
                    alt={asset.name}
                    fill
                    className="object-contain"
                  />
                </div>
                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Type:</span>
                    <span className="font-medium">{asset.fileType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Progress:</span>
                    <Badge variant="outline">{checksProgress}% complete</Badge>
                  </div>
                  {getTotalAvailable() > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Credits:</span>
                      <Badge variant="outline">{getTotalAvailable()} available</Badge>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Stats Grid */}
          <div className="lg:col-span-3">
            <QuickStatsGrid 
              reviewData={reviewData}
              checkStates={checkStates}
              onRunCheck={(checkType) => handleRunCheck(checkType as CheckType)}
              isAnyChecking={isAnyChecking}
            />
          </div>
        </div>

        {/* Tabs for Detailed Results */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
          <div className="border-b border-border">
            <TabsList className="h-auto bg-transparent p-0 gap-0">
              <TabsTrigger 
                value="all"
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-foreground rounded-none px-4 pb-3"
              >
                All Checks
              </TabsTrigger>
              <TabsTrigger 
                value="copyright"
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-foreground rounded-none px-4 pb-3"
              >
                <Shield className="h-4 w-4 mr-2" />
                Copyright
              </TabsTrigger>
              <TabsTrigger 
                value="accessibility"
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-foreground rounded-none px-4 pb-3"
              >
                <Eye className="h-4 w-4 mr-2" />
                ADA
              </TabsTrigger>
              <TabsTrigger 
                value="seo"
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-foreground rounded-none px-4 pb-3"
              >
                <Search className="h-4 w-4 mr-2" />
                SEO
              </TabsTrigger>
              <TabsTrigger 
                value="brandCompliance"
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-foreground rounded-none px-4 pb-3"
              >
                <Palette className="h-4 w-4 mr-2" />
                Brand
              </TabsTrigger>
              <TabsTrigger 
                value="performance"
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-foreground rounded-none px-4 pb-3"
              >
                <Zap className="h-4 w-4 mr-2" />
                Performance
              </TabsTrigger>
              <TabsTrigger 
                value="security"
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-foreground rounded-none px-4 pb-3"
              >
                <ShieldCheck className="h-4 w-4 mr-2" />
                Security
              </TabsTrigger>
            </TabsList>
          </div>

          {/* All Checks Summary */}
          <TabsContent value="all" className="mt-6">
            <div className="grid md:grid-cols-2 gap-6">
              {reviewData?.copyright.data && (
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Shield className="h-4 w-4 text-purple-600" />
                      <h3 className="font-semibold">Copyright</h3>
                    </div>
                    <div className="text-2xl font-bold mb-1">
                      {100 - reviewData.copyright.data.similarityScore}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {reviewData.copyright.data.matchedSources.length} matches found
                    </p>
                  </CardContent>
                </Card>
              )}
              
              {reviewData?.accessibility.data && (
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Eye className="h-4 w-4 text-blue-600" />
                      <h3 className="font-semibold">Accessibility</h3>
                    </div>
                    <div className="text-2xl font-bold mb-1">
                      {reviewData.accessibility.data.score}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      WCAG {reviewData.accessibility.data.wcagLevel} • {reviewData.accessibility.data.issues.length} issues
                    </p>
                  </CardContent>
                </Card>
              )}
              
              {reviewData?.seo.data && (
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Search className="h-4 w-4 text-green-600" />
                      <h3 className="font-semibold">SEO</h3>
                    </div>
                    <div className="text-2xl font-bold mb-1">
                      {reviewData.seo.data.score}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {reviewData.seo.data.imageOptimization.format} format • {reviewData.seo.data.imageOptimization.sizeRating} size
                    </p>
                  </CardContent>
                </Card>
              )}
              
              {reviewData?.brandCompliance.data && (
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Palette className="h-4 w-4 text-pink-600" />
                      <h3 className="font-semibold">Brand Compliance</h3>
                    </div>
                    <div className="text-2xl font-bold mb-1">
                      {reviewData.brandCompliance.data.score}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {reviewData.brandCompliance.data.colorCompliance.passed ? 'Colors passed' : 'Color issues'} • {reviewData.brandCompliance.data.styleGuideAdherence}% adherence
                    </p>
                  </CardContent>
                </Card>
              )}
              
              {reviewData?.performance.data && (
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Zap className="h-4 w-4 text-amber-600" />
                      <h3 className="font-semibold">Performance</h3>
                    </div>
                    <div className="text-2xl font-bold mb-1">
                      {reviewData.performance.data.score}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {((reviewData.performance.data.fileSize.savings / reviewData.performance.data.fileSize.current) * 100).toFixed(0)}% compression potential
                    </p>
                  </CardContent>
                </Card>
              )}
              
              {reviewData?.security.data && (
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <ShieldCheck className="h-4 w-4 text-red-600" />
                      <h3 className="font-semibold">Security</h3>
                    </div>
                    <div className="text-2xl font-bold mb-1">
                      {reviewData.security.data.score}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {reviewData.security.data.safe ? 'No threats' : `${reviewData.security.data.threats.length} threats`}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Empty state for "All" tab */}
            {checksProgress === 0 && (
              <div className="text-center py-12 border rounded-lg">
                <PlayCircle className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <h3 className="font-semibold mb-1">No Checks Run Yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Run comprehensive checks to analyze this asset
                </p>
                <Button onClick={handleRunAllChecks} disabled={isAnyChecking}>
                  <PlayCircle className="mr-2 h-4 w-4" />
                  Run All Checks
                </Button>
              </div>
            )}
          </TabsContent>

          {/* Copyright Tab */}
          <TabsContent value="copyright" className="mt-6">
            {reviewData?.copyright.data ? (
              <CopyrightCheckPanel data={reviewData.copyright.data} />
            ) : (
              <div className="text-center py-12 border rounded-lg">
                <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <h3 className="font-semibold mb-1">Copyright Check Not Run</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Analyze this asset for copyright similarities
                </p>
                <Button 
                  onClick={() => handleRunCheck('copyright')} 
                  disabled={checkStates.copyright === 'checking'}
                >
                  {checkStates.copyright === 'checking' ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Checking...
                    </>
                  ) : (
                    <>
                      <Shield className="mr-2 h-4 w-4" />
                      Run Copyright Check
                    </>
                  )}
                </Button>
              </div>
            )}
          </TabsContent>

          {/* Accessibility Tab */}
          <TabsContent value="accessibility" className="mt-6">
            {reviewData?.accessibility.data ? (
              <AccessibilityCheckPanel data={reviewData.accessibility.data} />
            ) : (
              <div className="text-center py-12 border rounded-lg">
                <Eye className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <h3 className="font-semibold mb-1">Accessibility Check Not Run</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Check WCAG compliance and accessibility standards
                </p>
                <Button 
                  onClick={() => handleRunCheck('accessibility')} 
                  disabled={checkStates.accessibility === 'checking'}
                >
                  {checkStates.accessibility === 'checking' ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Checking...
                    </>
                  ) : (
                    <>
                      <Eye className="mr-2 h-4 w-4" />
                      Run Accessibility Check
                    </>
                  )}
                </Button>
              </div>
            )}
          </TabsContent>

          {/* SEO Tab */}
          <TabsContent value="seo" className="mt-6">
            {reviewData?.seo.data ? (
              <SEOCheckPanel 
                data={reviewData.seo.data} 
                fileName={asset.name}
                fileSize={asset.fileSize}
              />
            ) : (
              <div className="text-center py-12 border rounded-lg">
                <Search className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <h3 className="font-semibold mb-1">SEO Check Not Run</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Analyze image optimization and SEO factors
                </p>
                <Button 
                  onClick={() => handleRunCheck('seo')} 
                  disabled={checkStates.seo === 'checking'}
                >
                  {checkStates.seo === 'checking' ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Checking...
                    </>
                  ) : (
                    <>
                      <Search className="mr-2 h-4 w-4" />
                      Run SEO Check
                    </>
                  )}
                </Button>
              </div>
            )}
          </TabsContent>

          {/* Brand Compliance Tab */}
          <TabsContent value="brandCompliance" className="mt-6">
            {reviewData?.brandCompliance.data ? (
              <BrandCompliancePanel 
                data={reviewData.brandCompliance.data}
                brandName={asset.brandName}
              />
            ) : (
              <div className="text-center py-12 border rounded-lg">
                <Palette className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <h3 className="font-semibold mb-1">Brand Compliance Check Not Run</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Validate colors, logos, and brand guidelines
                </p>
                <Button 
                  onClick={() => handleRunCheck('brandCompliance')} 
                  disabled={checkStates.brandCompliance === 'checking'}
                >
                  {checkStates.brandCompliance === 'checking' ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Checking...
                    </>
                  ) : (
                    <>
                      <Palette className="mr-2 h-4 w-4" />
                      Run Brand Check
                    </>
                  )}
                </Button>
              </div>
            )}
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance" className="mt-6">
            {reviewData?.performance.data ? (
              <PerformanceCheckPanel data={reviewData.performance.data} />
            ) : (
              <div className="text-center py-12 border rounded-lg">
                <Zap className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <h3 className="font-semibold mb-1">Performance Check Not Run</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Analyze file size, load times, and optimization potential
                </p>
                <Button 
                  onClick={() => handleRunCheck('performance')} 
                  disabled={checkStates.performance === 'checking'}
                >
                  {checkStates.performance === 'checking' ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Checking...
                    </>
                  ) : (
                    <>
                      <Zap className="mr-2 h-4 w-4" />
                      Run Performance Check
                    </>
                  )}
                </Button>
              </div>
            )}
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="mt-6">
            {reviewData?.security.data ? (
              <SecurityCheckPanel data={reviewData.security.data} />
            ) : (
              <div className="text-center py-12 border rounded-lg">
                <ShieldCheck className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <h3 className="font-semibold mb-1">Security Check Not Run</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Scan for malware, threats, and metadata issues
                </p>
                <Button 
                  onClick={() => handleRunCheck('security')} 
                  disabled={checkStates.security === 'checking'}
                >
                  {checkStates.security === 'checking' ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Checking...
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="mr-2 h-4 w-4" />
                      Run Security Check
                    </>
                  )}
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </PageContainer>
  )
}
