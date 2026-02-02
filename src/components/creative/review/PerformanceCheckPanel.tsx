'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Zap, TrendingDown, Clock, FileText, CheckCircle2, AlertTriangle } from 'lucide-react'
import type { PerformanceCheckData } from '@/types/creative'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { formatFileSize } from '@/lib/format-utils'

interface PerformanceCheckPanelProps {
  data: PerformanceCheckData
}

export function PerformanceCheckPanel({ data }: PerformanceCheckPanelProps) {
  const { score, fileSize, loadTimeEstimate, compressionScore, formatRecommendation } = data

  const savingsPercentage = ((fileSize.savings / fileSize.current) * 100).toFixed(1)

  return (
    <div className="space-y-6">
      {/* Score Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Performance Score
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
                This asset is well-optimized for performance
              </AlertDescription>
            </Alert>
          ) : (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                This asset could be optimized for better performance
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* File Size Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">File Size Analysis</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-muted-foreground mb-1">Current Size</div>
              <div className="text-lg font-semibold">{formatFileSize(fileSize.current)}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">Optimal Size</div>
              <div className="text-lg font-semibold text-green-600">
                {formatFileSize(fileSize.optimal)}
              </div>
            </div>
          </div>

          {fileSize.savings > 0 && (
            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-600">Potential Savings</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-green-700">{formatFileSize(fileSize.savings)}</span>
                <Badge variant="outline" className="border-green-500 text-green-700">
                  -{savingsPercentage}%
                </Badge>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Load Time Estimate */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Load Time Estimate</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <Clock className="h-8 w-8 text-muted-foreground" />
            <div>
              <div className="text-2xl font-bold">
                {loadTimeEstimate < 1000 
                  ? `${loadTimeEstimate}ms` 
                  : `${(loadTimeEstimate / 1000).toFixed(2)}s`}
              </div>
              <div className="text-xs text-muted-foreground">
                Estimated load time on 3G connection
              </div>
            </div>
          </div>
          
          <div className="mt-3">
            {loadTimeEstimate < 1000 ? (
              <Badge variant="outline" className="border-green-500 text-green-700">
                Fast
              </Badge>
            ) : loadTimeEstimate < 2000 ? (
              <Badge variant="outline" className="border-amber-500 text-amber-700">
                Moderate
              </Badge>
            ) : (
              <Badge variant="outline" className="border-red-500 text-red-700">
                Slow
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Compression Score */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Compression Analysis</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm">Compression Efficiency</span>
            <Badge variant="outline" className={cn(
              compressionScore >= 80 ? 'border-green-500 text-green-700' :
              compressionScore >= 60 ? 'border-amber-500 text-amber-700' :
              'border-red-500 text-red-700'
            )}>
              {compressionScore}%
            </Badge>
          </div>
          
          <Progress value={compressionScore} className="h-2" />

          {formatRecommendation && (
            <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="text-xs font-medium text-blue-600 mb-1">
                Format Recommendation
              </div>
              <p className="text-sm">{formatRecommendation}</p>
            </div>
          )}
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
