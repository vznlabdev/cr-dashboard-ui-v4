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
    <div className="space-y-3">
      {/* Score Overview */}
      <Card>
        <CardContent className="p-3 space-y-2">
          <div className="flex items-center gap-1.5 mb-2">
            <Shield className="h-4 w-4" />
            <span className="text-xs font-medium text-muted-foreground">Copyright Check</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold">{similarityScore}%</div>
              <div className="text-xs text-muted-foreground">Similarity Score</div>
            </div>
            <div className="text-right">
              <Badge variant={passed ? 'default' : 'destructive'} className={cn(passed ? 'bg-green-600' : '', 'text-xs px-2 py-0.5')}>
                {passed ? 'Passed' : 'Failed'}
              </Badge>
              <div className="text-[10px] text-muted-foreground mt-1">
                Threshold: {threshold}%
              </div>
              <div className="text-[10px] text-muted-foreground">
                {format(data.checkedAt, 'MMM d, h:mm a')}
              </div>
            </div>
          </div>
          
          <Progress value={similarityScore} className="h-1.5" />

          {passed ? (
            <Alert className="py-2">
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription className="text-xs">
                Similarity score is below the {threshold}% threshold. This asset is cleared for use.
              </AlertDescription>
            </Alert>
          ) : (
            <Alert variant="destructive" className="py-2">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-xs">
                Similarity score of {similarityScore}% exceeds the {threshold}% threshold. This asset requires admin review before approval.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Risk Breakdown */}
      <Card>
        <CardContent className="p-3 space-y-2">
          <div className="flex items-center gap-1.5 mb-2">
            <TrendingUp className="h-4 w-4" />
            <span className="text-xs font-medium text-muted-foreground">Risk Breakdown</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <div className="text-[10px] text-muted-foreground mb-1.5">Copyright Risk</div>
              <div className="text-xl font-bold">{riskBreakdown.copyrightRisk}%</div>
              <Progress value={riskBreakdown.copyrightRisk} className="h-1 mt-1.5" />
            </div>
            <div>
              <div className="text-[10px] text-muted-foreground mb-1.5">Trademark Risk</div>
              <div className="text-xl font-bold">{riskBreakdown.trademarkRisk}%</div>
              <Progress value={riskBreakdown.trademarkRisk} className="h-1 mt-1.5" />
            </div>
            <div>
              <div className="text-[10px] text-muted-foreground mb-1.5">Overall Risk</div>
              <div className="text-xl font-bold">{riskBreakdown.overallRisk}%</div>
              <Progress value={riskBreakdown.overallRisk} className="h-1 mt-1.5" />
            </div>
          </div>

          <div className="flex items-center justify-between pt-1.5 border-t">
            <span className="text-xs font-medium">Risk Level</span>
            <Badge variant="outline" className={cn(
              'text-[10px] px-1.5 py-0',
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
          <CardContent className="p-3">
            <div className="flex items-center gap-1.5 mb-2">
              <span className="text-xs font-medium text-muted-foreground">Matched Sources ({matchedSources.length})</span>
            </div>
            <div className="space-y-2">
              {matchedSources.map((source) => (
                <div 
                  key={source.id} 
                  className="p-2 border rounded-md hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="text-xs font-medium">{source.title}</span>
                        <Badge variant="outline" className={cn(
                          'text-[10px] px-1.5 py-0',
                          source.similarity >= 70 && 'border-red-500 text-red-700',
                          source.similarity >= 40 && source.similarity < 70 && 'border-amber-500 text-amber-700',
                          source.similarity < 40 && 'border-green-500 text-green-700'
                        )}>
                          {source.similarity}% match
                        </Badge>
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        Source: {source.source}
                      </div>
                      {source.url && (
                        <a 
                          href={source.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-[10px] text-blue-600 hover:underline flex items-center gap-1 mt-0.5"
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
