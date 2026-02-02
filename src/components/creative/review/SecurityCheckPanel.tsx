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
    <div className="space-y-3">
      {/* Score Overview */}
      <Card>
        <CardContent className="p-3 space-y-2">
          <div className="flex items-center gap-1.5 mb-2">
            <ShieldCheck className="h-4 w-4" />
            <span className="text-xs font-medium text-muted-foreground">Security Score</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold">{score}</div>
              <div className="text-xs text-muted-foreground">out of 100</div>
            </div>
            <div className="text-right">
              <Badge variant={safe ? 'default' : 'destructive'} className={cn('text-xs px-2 py-0.5', safe && 'bg-green-600')}>
                {safe ? 'Safe' : 'Threats Detected'}
              </Badge>
              <div className="text-[10px] text-muted-foreground mt-1">
                {format(data.checkedAt, 'MMM d, h:mm a')}
              </div>
            </div>
          </div>
          
          <Progress value={score} className="h-1.5" />

          {safe ? (
            <Alert className="py-2">
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription className="text-xs">
                No security threats detected. This asset is safe to use.
              </AlertDescription>
            </Alert>
          ) : (
            <Alert variant="destructive" className="py-2">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-xs">
                Security threats detected. Review before using this asset.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Threats List */}
      {threats.length > 0 && (
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-1.5 mb-2">
              <span className="text-xs font-medium text-muted-foreground">Security Threats ({threats.length})</span>
            </div>
            <div className="space-y-2">
              {threats.map((threat, idx) => {
                const config = severityConfig[threat.severity]
                const ThreatIcon = config.icon
                
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
                      <ThreatIcon className={cn('h-3.5 w-3.5 mt-0.5 shrink-0', config.color)} />
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-1.5">
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                            {config.label}
                          </Badge>
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                            {threat.type.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                          </Badge>
                        </div>
                        <p className="text-xs font-medium">{threat.description}</p>
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
        <CardContent className="p-3">
          <div className="flex items-center gap-1.5 mb-2">
            <span className="text-xs font-medium text-muted-foreground">Scan Details</span>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-2 bg-muted rounded-md">
              <div className="flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs">Malware Scan</span>
              </div>
              <Badge variant={safe ? 'default' : 'destructive'} className={cn('text-[10px] px-1.5 py-0', safe && 'bg-green-600')}>
                {safe ? 'Clean' : 'Flagged'}
              </Badge>
            </div>

            <div className="flex items-center justify-between p-2 bg-muted rounded-md">
              <div className="flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs">Metadata Analysis</span>
              </div>
              <Badge variant={threats.some(t => t.type === 'metadata-leak') ? 'destructive' : 'default'} className="text-[10px] px-1.5 py-0">
                {threats.some(t => t.type === 'metadata-leak') ? 'Issues Found' : 'Clean'}
              </Badge>
            </div>

            <div className="flex items-center justify-between p-2 bg-muted rounded-md">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs">Suspicious Content</span>
              </div>
              <Badge variant={threats.some(t => t.type === 'suspicious-code') ? 'destructive' : 'default'} className="text-[10px] px-1.5 py-0">
                {threats.some(t => t.type === 'suspicious-code') ? 'Detected' : 'None'}
              </Badge>
            </div>
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
