'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Shield, AlertTriangle, CheckCircle2, ExternalLink, TrendingUp } from 'lucide-react'
import type { CopyrightCheckData } from '@/types/creative'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'

interface CopyrightCheckPanelProps {
  data: CopyrightCheckData
}

export function CopyrightCheckPanel({ data }: CopyrightCheckPanelProps) {
  const { similarityScore, matchedSources, riskBreakdown } = data
  const threshold = 30
  const passed = similarityScore < threshold

  return (
    <div className="space-y-6">
      {/* Score Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Copyright Check Results
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-4xl font-bold">{similarityScore}%</div>
              <div className="text-sm text-muted-foreground">Similarity Score</div>
            </div>
            <div className="text-right">
              <Badge variant={passed ? 'default' : 'destructive'} className={passed ? 'bg-green-600' : ''}>
                {passed ? 'Passed' : 'Failed'}
              </Badge>
              <div className="text-xs text-muted-foreground mt-1">
                Threshold: {threshold}%
              </div>
              <div className="text-xs text-muted-foreground">
                Checked {format(data.checkedAt, 'MMM d, h:mm a')}
              </div>
            </div>
          </div>
          
          <Progress value={similarityScore} className="h-2" />

          {passed ? (
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                Similarity score is below the {threshold}% threshold. This asset is cleared for use.
              </AlertDescription>
            </Alert>
          ) : (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Similarity score of {similarityScore}% exceeds the {threshold}% threshold. This asset requires admin review before approval.
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
            <div>
              <div className="text-xs text-muted-foreground mb-2">Copyright Risk</div>
              <div className="text-2xl font-bold">{riskBreakdown.copyrightRisk}%</div>
              <Progress value={riskBreakdown.copyrightRisk} className="h-1.5 mt-2" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-2">Trademark Risk</div>
              <div className="text-2xl font-bold">{riskBreakdown.trademarkRisk}%</div>
              <Progress value={riskBreakdown.trademarkRisk} className="h-1.5 mt-2" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-2">Overall Risk</div>
              <div className="text-2xl font-bold">{riskBreakdown.overallRisk}%</div>
              <Progress value={riskBreakdown.overallRisk} className="h-1.5 mt-2" />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t">
            <span className="text-sm font-medium">Risk Level</span>
            <Badge variant="outline" className={cn(
              riskBreakdown.riskLevel === 'high' && 'border-red-500 text-red-700',
              riskBreakdown.riskLevel === 'medium' && 'border-amber-500 text-amber-700',
              riskBreakdown.riskLevel === 'low' && 'border-green-500 text-green-700'
            )}>
              {riskBreakdown.riskLevel.toUpperCase()}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Matched Sources */}
      {matchedSources.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Matched Sources ({matchedSources.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {matchedSources.map((source) => (
                <div 
                  key={source.id} 
                  className="p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium">{source.title}</span>
                        <Badge variant="outline" className={cn(
                          source.similarity >= 70 && 'border-red-500 text-red-700',
                          source.similarity >= 40 && source.similarity < 70 && 'border-amber-500 text-amber-700',
                          source.similarity < 40 && 'border-green-500 text-green-700'
                        )}>
                          {source.similarity}% match
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Source: {source.source}
                      </div>
                      {source.url && (
                        <a 
                          href={source.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:underline flex items-center gap-1 mt-1"
                        >
                          View source
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

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
