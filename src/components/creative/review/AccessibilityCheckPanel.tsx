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
    <div className="space-y-6">
      {/* Score Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Accessibility Score
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-4xl font-bold">{score}</div>
              <div className="text-sm text-muted-foreground">out of 100</div>
            </div>
            <div className="text-right space-y-2">
              <Badge 
                variant="outline"
                className={cn(
                  wcagLevel === 'AAA' ? 'border-green-500 text-green-700' :
                  wcagLevel === 'AA' ? 'border-blue-500 text-blue-700' :
                  wcagLevel === 'A' ? 'border-amber-500 text-amber-700' :
                  'border-red-500 text-red-700'
                )}
              >
                WCAG {wcagLevel}
              </Badge>
              <div className="text-xs text-muted-foreground">
                Checked {format(data.checkedAt, 'MMM d, h:mm a')}
              </div>
            </div>
          </div>
          
          <Progress value={score} className="h-2" />

          {score >= 80 ? (
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                This asset meets accessibility standards
              </AlertDescription>
            </Alert>
          ) : (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                This asset has accessibility issues that need attention
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Color Contrast Check */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Color Contrast</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm">Contrast Ratio</span>
            <Badge variant={colorContrast.passed ? 'default' : 'destructive'}>
              {colorContrast.ratio.toFixed(2)}:1
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {colorContrast.recommendation}
          </p>
          <div className="mt-3">
            {colorContrast.passed ? (
              <div className="flex items-center gap-2 text-sm text-green-600">
                <CheckCircle2 className="h-4 w-4" />
                <span>Passes WCAG standards</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm text-red-600">
                <XCircle className="h-4 w-4" />
                <span>Does not meet WCAG standards</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Alt Text Check */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Alt Text Quality</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm">Present</span>
            <Badge variant={altText.present ? 'default' : 'destructive'}>
              {altText.present ? 'Yes' : 'No'}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Quality</span>
            <Badge variant="outline" className={cn(
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
          <CardHeader>
            <CardTitle className="text-base">Issues Found ({issues.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {issues.map((issue, idx) => {
                const config = severityConfig[issue.severity]
                const SeverityIcon = config.icon
                
                return (
                  <div 
                    key={idx}
                    className={cn(
                      'p-3 rounded-lg border',
                      config.bg,
                      'border-gray-200 dark:border-gray-700'
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <SeverityIcon className={cn('h-4 w-4 mt-0.5 shrink-0', config.color)} />
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {config.label}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {issue.type}
                          </Badge>
                        </div>
                        <p className="text-sm font-medium">{issue.description}</p>
                        {issue.element && (
                          <p className="text-xs text-muted-foreground">Element: {issue.element}</p>
                        )}
                        <p className="text-xs text-muted-foreground mt-2">
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
