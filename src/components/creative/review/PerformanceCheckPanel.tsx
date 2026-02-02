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
    <div className="space-y-3">
      {/* Score Overview */}
      <Card>
        <CardContent className="p-3 space-y-2">
          <div className="flex items-center gap-1.5 mb-2">
            <Zap className="h-4 w-4" />
            <span className="text-xs font-medium text-muted-foreground">Performance Score</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold">{score}</div>
              <div className="text-xs text-muted-foreground">out of 100</div>
            </div>
            <div className="text-right">
              <div className="text-[10px] text-muted-foreground">
                {format(data.checkedAt, 'MMM d, h:mm a')}
              </div>
            </div>
          </div>
          
          <Progress value={score} className="h-1.5" />

          {score >= 70 ? (
            <Alert className="py-2">
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription className="text-xs">
                This asset is well-optimized for performance
              </AlertDescription>
            </Alert>
          ) : (
            <Alert variant="destructive" className="py-2">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-xs">
                This asset could be optimized for better performance
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* File Size Analysis */}
      <Card>
        <CardContent className="p-3 space-y-2">
          <div className="flex items-center gap-1.5 mb-2">
            <span className="text-xs font-medium text-muted-foreground">File Size Analysis</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <div className="text-[10px] text-muted-foreground mb-1">Current Size</div>
              <div className="text-base font-semibold">{formatFileSize(fileSize.current)}</div>
            </div>
            <div>
              <div className="text-[10px] text-muted-foreground mb-1">Optimal Size</div>
              <div className="text-base font-semibold text-green-600">
                {formatFileSize(fileSize.optimal)}
              </div>
            </div>
          </div>

          {fileSize.savings > 0 && (
            <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-md border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-1.5 mb-1">
                <TrendingDown className="h-3.5 w-3.5 text-green-600" />
                <span className="text-xs font-medium text-green-600">Potential Savings</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-bold text-green-700">{formatFileSize(fileSize.savings)}</span>
                <Badge variant="outline" className="border-green-500 text-green-700 text-[10px] px-1.5 py-0">
                  -{savingsPercentage}%
                </Badge>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Load Time Estimate */}
      <Card>
        <CardContent className="p-3">
          <div className="flex items-center gap-1.5 mb-2">
            <span className="text-xs font-medium text-muted-foreground">Load Time Estimate</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-6 w-6 text-muted-foreground" />
            <div>
              <div className="text-xl font-bold">
                {loadTimeEstimate < 1000 
                  ? `${loadTimeEstimate}ms` 
                  : `${(loadTimeEstimate / 1000).toFixed(2)}s`}
              </div>
              <div className="text-[10px] text-muted-foreground">
                Estimated on 3G
              </div>
            </div>
          </div>
          
          <div className="mt-2">
            {loadTimeEstimate < 1000 ? (
              <Badge variant="outline" className="border-green-500 text-green-700 text-[10px] px-1.5 py-0">
                Fast
              </Badge>
            ) : loadTimeEstimate < 2000 ? (
              <Badge variant="outline" className="border-amber-500 text-amber-700 text-[10px] px-1.5 py-0">
                Moderate
              </Badge>
            ) : (
              <Badge variant="outline" className="border-red-500 text-red-700 text-[10px] px-1.5 py-0">
                Slow
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Compression Score */}
      <Card>
        <CardContent className="p-3 space-y-2">
          <div className="flex items-center gap-1.5 mb-2">
            <span className="text-xs font-medium text-muted-foreground">Compression Analysis</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs">Compression Efficiency</span>
            <Badge variant="outline" className={cn(
              'text-[10px] px-1.5 py-0',
              compressionScore >= 80 ? 'border-green-500 text-green-700' :
              compressionScore >= 60 ? 'border-amber-500 text-amber-700' :
              'border-red-500 text-red-700'
            )}>
              {compressionScore}%
            </Badge>
          </div>
          
          <Progress value={compressionScore} className="h-1.5" />

          {formatRecommendation && (
            <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-md border border-blue-200 dark:border-blue-800">
              <div className="text-[10px] font-medium text-blue-600 mb-0.5">
                Format Recommendation
              </div>
              <p className="text-xs">{formatRecommendation}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardContent className="p-3">
          <div className="flex items-center gap-1.5 mb-2">
            <span className="text-xs font-medium text-muted-foreground">Recommendations</span>
          </div>
          <ul className="space-y-1.5">
            {data.recommendations.map((rec, idx) => (
              <li key={idx} className="text-xs flex items-start gap-2">
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
