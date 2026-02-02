'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Eye, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react'
import type { AccessibilityCheckData } from '@/types/creative'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'

interface AccessibilityCheckPanelProps {
  data: AccessibilityCheckData
}

export function AccessibilityCheckPanel({ data }: AccessibilityCheckPanelProps) {
  const { score, issues, wcagLevel, colorContrast, altText } = data

  const severityConfig = {
    critical: { label: 'Critical', color: 'text-red-600', bg: 'bg-red-50', icon: XCircle },
    serious: { label: 'Serious', color: 'text-orange-600', bg: 'bg-orange-50', icon: AlertTriangle },
    moderate: { label: 'Moderate', color: 'text-amber-600', bg: 'bg-amber-50', icon: AlertTriangle },
    minor: { label: 'Minor', color: 'text-blue-600', bg: 'bg-blue-50', icon: AlertTriangle },
  }

  return (
    <div className="space-y-3">
      {/* Score Overview */}
      <Card>
        <CardContent className="p-3 space-y-2">
          <div className="flex items-center gap-1.5 mb-2">
            <Eye className="h-4 w-4" />
            <span className="text-xs font-medium text-muted-foreground">Accessibility Score</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold">{score}</div>
              <div className="text-xs text-muted-foreground">out of 100</div>
            </div>
            <div className="text-right space-y-1">
              <Badge 
                variant="outline"
                className={cn(
                  'text-xs px-2 py-0.5',
                  wcagLevel === 'AAA' ? 'border-green-500 text-green-700' :
                  wcagLevel === 'AA' ? 'border-blue-500 text-blue-700' :
                  wcagLevel === 'A' ? 'border-amber-500 text-amber-700' :
                  'border-red-500 text-red-700'
                )}
              >
                WCAG {wcagLevel}
              </Badge>
              <div className="text-[10px] text-muted-foreground">
                {format(data.checkedAt, 'MMM d, h:mm a')}
              </div>
            </div>
          </div>
          
          <Progress value={score} className="h-1.5" />

          {score >= 80 ? (
            <Alert className="py-2">
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription className="text-xs">
                This asset meets accessibility standards
              </AlertDescription>
            </Alert>
          ) : (
            <Alert variant="destructive" className="py-2">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-xs">
                This asset has accessibility issues that need attention
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Color Contrast Check */}
      <Card>
        <CardContent className="p-3">
          <div className="flex items-center gap-1.5 mb-2">
            <span className="text-xs font-medium text-muted-foreground">Color Contrast</span>
          </div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs">Contrast Ratio</span>
            <Badge variant={colorContrast.passed ? 'default' : 'destructive'} className="text-xs px-2 py-0.5">
              {colorContrast.ratio.toFixed(2)}:1
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            {colorContrast.recommendation}
          </p>
          <div className="mt-2">
            {colorContrast.passed ? (
              <div className="flex items-center gap-1.5 text-xs text-green-600">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Passes WCAG standards</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-xs text-red-600">
                <XCircle className="h-3.5 w-3.5" />
                <span>Does not meet WCAG standards</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Alt Text Check */}
      <Card>
        <CardContent className="p-3">
          <div className="flex items-center gap-1.5 mb-2">
            <span className="text-xs font-medium text-muted-foreground">Alt Text Quality</span>
          </div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs">Present</span>
            <Badge variant={altText.present ? 'default' : 'destructive'} className="text-xs px-2 py-0.5">
              {altText.present ? 'Yes' : 'No'}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs">Quality</span>
            <Badge variant="outline" className={cn(
              'text-[10px] px-1.5 py-0',
              altText.quality === 'good' && 'border-green-500 text-green-700',
              altText.quality === 'fair' && 'border-amber-500 text-amber-700',
              (altText.quality === 'poor' || altText.quality === 'missing') && 'border-red-500 text-red-700'
            )}>
              {altText.quality.charAt(0).toUpperCase() + altText.quality.slice(1)}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Issues List */}
      {issues.length > 0 && (
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-1.5 mb-2">
              <span className="text-xs font-medium text-muted-foreground">Issues Found ({issues.length})</span>
            </div>
            <div className="space-y-2">
              {issues.map((issue, idx) => {
                const config = severityConfig[issue.severity]
                const SeverityIcon = config.icon
                
                return (
                  <div 
                    key={idx}
                    className={cn(
                      'p-2 rounded-md border',
                      config.bg,
                      'border-gray-200 dark:border-gray-700'
                    )}
                  >
                    <div className="flex items-start gap-2">
                      <SeverityIcon className={cn('h-3.5 w-3.5 mt-0.5 shrink-0', config.color)} />
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-1.5">
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                            {config.label}
                          </Badge>
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                            {issue.type}
                          </Badge>
                        </div>
                        <p className="text-xs font-medium">{issue.description}</p>
                        {issue.element && (
                          <p className="text-[10px] text-muted-foreground">Element: {issue.element}</p>
                        )}
                        <p className="text-[10px] text-muted-foreground mt-1">
                          💡 {issue.recommendation}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
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
