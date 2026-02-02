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
    <div className="space-y-3">
      {/* Score Overview */}
      <Card>
        <CardContent className="p-3 space-y-2">
          <div className="flex items-center gap-1.5 mb-2">
            <Palette className="h-4 w-4" />
            <span className="text-xs font-medium text-muted-foreground">Brand Compliance</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold">{score}</div>
              <div className="text-xs text-muted-foreground">out of 100</div>
            </div>
            <div className="text-right">
              {brandName && (
                <div className="text-xs font-medium mb-0.5">{brandName}</div>
              )}
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
                This asset follows brand guidelines
              </AlertDescription>
            </Alert>
          ) : (
            <Alert variant="destructive" className="py-2">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-xs">
                This asset has brand compliance issues
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Color Compliance */}
      <Card>
        <CardContent className="p-3 space-y-2">
          <div className="flex items-center gap-1.5 mb-2">
            <span className="text-xs font-medium text-muted-foreground">Color Compliance</span>
          </div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium">Status</span>
            {colorCompliance.passed ? (
              <div className="flex items-center gap-1 text-green-600">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span className="text-xs">Passed</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-red-600">
                <XCircle className="h-3.5 w-3.5" />
                <span className="text-xs">Failed</span>
              </div>
            )}
          </div>

          {/* Brand Colors Used */}
          {colorCompliance.brandColorsUsed.length > 0 && (
            <div>
              <div className="text-[10px] font-medium text-muted-foreground mb-1.5">
                Brand Colors Used
              </div>
              <div className="flex flex-wrap gap-1.5">
                {colorCompliance.brandColorsUsed.map((color, idx) => (
                  <div key={idx} className="flex items-center gap-1.5">
                    <div 
                      className="h-5 w-5 rounded border border-gray-300 dark:border-gray-600"
                      style={{ backgroundColor: color }}
                    />
                    <code className="text-[10px]">{color}</code>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Off-Brand Colors */}
          {colorCompliance.offBrandColors.length > 0 && (
            <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded-md border border-red-200 dark:border-red-800">
              <div className="text-[10px] font-medium text-red-600 mb-1.5 flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                Off-Brand Colors
              </div>
              <div className="flex flex-wrap gap-1.5">
                {colorCompliance.offBrandColors.map((color, idx) => (
                  <div key={idx} className="flex items-center gap-1.5">
                    <div 
                      className="h-5 w-5 rounded border border-red-300"
                      style={{ backgroundColor: color }}
                    />
                    <code className="text-[10px] text-red-700">{color}</code>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Logo Usage */}
      <Card>
        <CardContent className="p-3">
          <div className="flex items-center gap-1.5 mb-2">
            <span className="text-xs font-medium text-muted-foreground">Logo Usage</span>
          </div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium">Compliance</span>
            {logoUsage.passed ? (
              <div className="flex items-center gap-1 text-green-600">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span className="text-xs">Passed</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-red-600">
                <XCircle className="h-3.5 w-3.5" />
                <span className="text-xs">Issues Found</span>
              </div>
            )}
          </div>

          {logoUsage.issues.length > 0 && (
            <div className="space-y-1.5">
              {logoUsage.issues.map((issue, idx) => (
                <div key={idx} className="text-xs p-1.5 bg-muted rounded">
                  <span className="text-red-600">•</span> {issue}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Style Guide Adherence */}
      <Card>
        <CardContent className="p-3">
          <div className="flex items-center gap-1.5 mb-2">
            <span className="text-xs font-medium text-muted-foreground">Style Guide Adherence</span>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs">Overall Adherence</span>
              <Badge variant="outline" className={cn(
                'text-[10px] px-1.5 py-0',
                styleGuideAdherence >= 80 ? 'border-green-500 text-green-700' :
                styleGuideAdherence >= 60 ? 'border-amber-500 text-amber-700' :
                'border-red-500 text-red-700'
              )}>
                {styleGuideAdherence}%
              </Badge>
            </div>
            
            <Progress value={styleGuideAdherence} className="h-1.5" />
            
            <p className="text-[10px] text-muted-foreground">
              Measures compliance with typography, spacing, and design system rules
            </p>
          </div>
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
