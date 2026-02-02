'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { Search, CheckCircle2, AlertTriangle, FileText, Zap, XCircle } from 'lucide-react'
import type { SEOCheckData } from '@/types/creative'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { formatFileSize } from '@/lib/format-utils'

interface SEOCheckPanelProps {
  data: SEOCheckData
  fileName?: string
  fileSize?: number
}

export function SEOCheckPanel({ data, fileName, fileSize }: SEOCheckPanelProps) {
  const { score, imageOptimization, metadata } = data

  const formatRatingStyles = {
    optimal: 'border-green-500 text-green-700',
    excellent: 'border-green-500 text-green-700',
    good: 'border-blue-500 text-blue-700',
    acceptable: 'border-amber-500 text-amber-700',
    large: 'border-amber-500 text-amber-700',
    poor: 'border-red-500 text-red-700',
    'too-large': 'border-red-500 text-red-700',
  }

  const qualityStyles = {
    descriptive: 'border-green-500 text-green-700',
    generic: 'border-amber-500 text-amber-700',
    poor: 'border-red-500 text-red-700',
  }

  return (
    <div className="space-y-6">
      {/* Score Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            SEO Score
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-4xl font-bold">{score}</div>
              <div className="text-sm text-muted-foreground">out of 100</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-muted-foreground">
                Checked {format(data.checkedAt, 'MMM d, h:mm a')}
              </div>
            </div>
          </div>
          
          <Progress value={score} className="h-2" />

          {score >= 70 ? (
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                This asset is well-optimized for SEO
              </AlertDescription>
            </Alert>
          ) : (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                This asset needs SEO improvements
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Image Optimization */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Image Optimization</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm">Format Quality</span>
            <Badge variant="outline" className={formatRatingStyles[imageOptimization.format]}>
              {imageOptimization.format.charAt(0).toUpperCase() + imageOptimization.format.slice(1)}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm">File Size Rating</span>
            <Badge variant="outline" className={formatRatingStyles[imageOptimization.sizeRating]}>
              {imageOptimization.sizeRating.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
            </Badge>
          </div>

          {imageOptimization.compressionPotential > 0 && (
            <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-600">Compression Potential</span>
              </div>
              <div className="text-2xl font-bold text-blue-700">
                {imageOptimization.compressionPotential}%
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                File size could be reduced by approximately {imageOptimization.compressionPotential}%
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Metadata Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Metadata & SEO Elements</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm">Filename Quality</span>
            <Badge variant="outline" className={qualityStyles[metadata.filenameQuality]}>
              {metadata.filenameQuality.charAt(0).toUpperCase() + metadata.filenameQuality.slice(1)}
            </Badge>
          </div>
          
          {fileName && (
            <div className="text-xs text-muted-foreground">
              Current: <code className="bg-muted px-1 py-0.5 rounded">{fileName}</code>
            </div>
          )}

          <Separator />

          <div className="flex items-center justify-between">
            <span className="text-sm">Alt Text Present</span>
            {metadata.altTextPresent ? (
              <div className="flex items-center gap-1 text-green-600">
                <CheckCircle2 className="h-4 w-4" />
                <span className="text-sm">Yes</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-red-600">
                <XCircle className="h-4 w-4" />
                <span className="text-sm">No</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm">Optimal Dimensions</span>
            {metadata.dimensionsOptimal ? (
              <div className="flex items-center gap-1 text-green-600">
                <CheckCircle2 className="h-4 w-4" />
                <span className="text-sm">Yes</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-amber-600">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm">Needs optimization</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {data.recommendations.map((rec, idx) => (
              <li key={idx} className="text-sm flex items-start gap-2">
                <span className="text-muted-foreground mt-0.5">•</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
