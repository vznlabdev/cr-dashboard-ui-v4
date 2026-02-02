'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ShieldCheck, CheckCircle2, XCircle, AlertTriangle, Lock, FileText } from 'lucide-react'
import type { SecurityCheckData } from '@/types/creative'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'

interface SecurityCheckPanelProps {
  data: SecurityCheckData
}

export function SecurityCheckPanel({ data }: SecurityCheckPanelProps) {
  const { score, threats, safe } = data

  const severityConfig = {
    critical: { label: 'Critical', color: 'text-red-600', bg: 'bg-red-50', icon: XCircle },
    high: { label: 'High', color: 'text-orange-600', bg: 'bg-orange-50', icon: AlertTriangle },
    medium: { label: 'Medium', color: 'text-amber-600', bg: 'bg-amber-50', icon: AlertTriangle },
    low: { label: 'Low', color: 'text-blue-600', bg: 'bg-blue-50', icon: AlertTriangle },
  }

  return (
    <div className="space-y-6">
      {/* Score Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5" />
            Security Score
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-4xl font-bold">{score}</div>
              <div className="text-sm text-muted-foreground">out of 100</div>
            </div>
            <div className="text-right">
              <Badge variant={safe ? 'default' : 'destructive'} className={safe ? 'bg-green-600' : ''}>
                {safe ? 'Safe' : 'Threats Detected'}
              </Badge>
              <div className="text-xs text-muted-foreground mt-1">
                Checked {format(data.checkedAt, 'MMM d, h:mm a')}
              </div>
            </div>
          </div>
          
          <Progress value={score} className="h-2" />

          {safe ? (
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                No security threats detected. This asset is safe to use.
              </AlertDescription>
            </Alert>
          ) : (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Security threats detected. Review before using this asset.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Threats List */}
      {threats.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Security Threats ({threats.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {threats.map((threat, idx) => {
                const config = severityConfig[threat.severity]
                const ThreatIcon = config.icon
                
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
                      <ThreatIcon className={cn('h-4 w-4 mt-0.5 shrink-0', config.color)} />
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {config.label}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {threat.type.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                          </Badge>
                        </div>
                        <p className="text-sm font-medium">{threat.description}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Security Scan Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Scan Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Malware Scan</span>
              </div>
              <Badge variant={safe ? 'default' : 'destructive'} className={safe ? 'bg-green-600' : ''}>
                {safe ? 'Clean' : 'Flagged'}
              </Badge>
            </div>

            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Metadata Analysis</span>
              </div>
              <Badge variant={threats.some(t => t.type === 'metadata-leak') ? 'destructive' : 'default'}>
                {threats.some(t => t.type === 'metadata-leak') ? 'Issues Found' : 'Clean'}
              </Badge>
            </div>

            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Suspicious Content</span>
              </div>
              <Badge variant={threats.some(t => t.type === 'suspicious-code') ? 'destructive' : 'default'}>
                {threats.some(t => t.type === 'suspicious-code') ? 'Detected' : 'None'}
              </Badge>
            </div>
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
