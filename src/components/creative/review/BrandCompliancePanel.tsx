'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Palette, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react'
import type { BrandComplianceCheckData } from '@/types/creative'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'

interface BrandCompliancePanelProps {
  data: BrandComplianceCheckData
  brandName?: string
}

export function BrandCompliancePanel({ data, brandName }: BrandCompliancePanelProps) {
  const { score, colorCompliance, logoUsage, styleGuideAdherence } = data

  return (
    <div className="space-y-6">
      {/* Score Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Brand Compliance Score
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-4xl font-bold">{score}</div>
              <div className="text-sm text-muted-foreground">out of 100</div>
            </div>
            <div className="text-right">
              {brandName && (
                <div className="text-sm font-medium mb-1">{brandName}</div>
              )}
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
                This asset follows brand guidelines
              </AlertDescription>
            </Alert>
          ) : (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                This asset has brand compliance issues
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Color Compliance */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Color Compliance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium">Status</span>
            {colorCompliance.passed ? (
              <div className="flex items-center gap-1 text-green-600">
                <CheckCircle2 className="h-4 w-4" />
                <span className="text-sm">Passed</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-red-600">
                <XCircle className="h-4 w-4" />
                <span className="text-sm">Failed</span>
              </div>
            )}
          </div>

          {/* Brand Colors Used */}
          {colorCompliance.brandColorsUsed.length > 0 && (
            <div>
              <div className="text-xs font-medium text-muted-foreground mb-2">
                Brand Colors Used
              </div>
              <div className="flex flex-wrap gap-2">
                {colorCompliance.brandColorsUsed.map((color, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <div 
                      className="h-6 w-6 rounded border border-gray-300 dark:border-gray-600"
                      style={{ backgroundColor: color }}
                    />
                    <code className="text-xs">{color}</code>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Off-Brand Colors */}
          {colorCompliance.offBrandColors.length > 0 && (
            <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
              <div className="text-xs font-medium text-red-600 mb-2 flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                Off-Brand Colors Detected
              </div>
              <div className="flex flex-wrap gap-2">
                {colorCompliance.offBrandColors.map((color, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <div 
                      className="h-6 w-6 rounded border border-red-300"
                      style={{ backgroundColor: color }}
                    />
                    <code className="text-xs text-red-700">{color}</code>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Logo Usage */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Logo Usage</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium">Compliance</span>
            {logoUsage.passed ? (
              <div className="flex items-center gap-1 text-green-600">
                <CheckCircle2 className="h-4 w-4" />
                <span className="text-sm">Passed</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-red-600">
                <XCircle className="h-4 w-4" />
                <span className="text-sm">Issues Found</span>
              </div>
            )}
          </div>

          {logoUsage.issues.length > 0 && (
            <div className="space-y-2">
              {logoUsage.issues.map((issue, idx) => (
                <div key={idx} className="text-sm p-2 bg-muted rounded">
                  <span className="text-red-600">•</span> {issue}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Style Guide Adherence */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Style Guide Adherence</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Overall Adherence</span>
              <Badge variant="outline" className={cn(
                styleGuideAdherence >= 80 ? 'border-green-500 text-green-700' :
                styleGuideAdherence >= 60 ? 'border-amber-500 text-amber-700' :
                'border-red-500 text-red-700'
              )}>
                {styleGuideAdherence}%
              </Badge>
            </div>
            
            <Progress value={styleGuideAdherence} className="h-2" />
            
            <p className="text-xs text-muted-foreground">
              Measures compliance with typography, spacing, and design system rules
            </p>
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
