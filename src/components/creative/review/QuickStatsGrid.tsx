'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Shield, Eye, Search, Palette, Zap, ShieldCheck, Loader2 } from 'lucide-react'
import type { AssetReviewData, CheckStatus } from '@/types/creative'
import { cn } from '@/lib/utils'

interface QuickStatsGridProps {
  reviewData: AssetReviewData | null
  checkStates: Record<string, CheckStatus>
  onRunCheck: (checkType: string) => void
  isAnyChecking: boolean
}

interface CheckCard {
  id: string
  label: string
  icon: typeof Shield
  color: string
}

const checkConfigs: CheckCard[] = [
  { id: 'copyright', label: 'Copyright', icon: Shield, color: 'text-purple-600' },
  { id: 'accessibility', label: 'Accessibility', icon: Eye, color: 'text-blue-600' },
  { id: 'seo', label: 'SEO', icon: Search, color: 'text-green-600' },
  { id: 'brandCompliance', label: 'Brand', icon: Palette, color: 'text-pink-600' },
  { id: 'performance', label: 'Performance', icon: Zap, color: 'text-amber-600' },
  { id: 'security', label: 'Security', icon: ShieldCheck, color: 'text-red-600' },
]

export function QuickStatsGrid({ 
  reviewData, 
  checkStates, 
  onRunCheck,
  isAnyChecking 
}: QuickStatsGridProps) {
  
  const getScore = (checkId: string): number | undefined => {
    if (!reviewData) return undefined
    
    switch (checkId) {
      case 'copyright':
        // For copyright, invert the similarity score (lower is better)
        return reviewData.copyright.data ? 100 - reviewData.copyright.data.similarityScore : undefined
      case 'accessibility':
        return reviewData.accessibility.data?.score
      case 'seo':
        return reviewData.seo.data?.score
      case 'brandCompliance':
        return reviewData.brandCompliance.data?.score
      case 'performance':
        return reviewData.performance.data?.score
      case 'security':
        return reviewData.security.data?.score
      default:
        return undefined
    }
  }

  const getScoreColor = (score?: number) => {
    if (score === undefined) return 'text-muted-foreground'
    if (score >= 80) return 'text-green-600'
    if (score >= 50) return 'text-amber-600'
    return 'text-red-600'
  }

  const getScoreBgColor = (score?: number) => {
    if (score === undefined) return 'bg-muted'
    if (score >= 80) return 'bg-green-50 dark:bg-green-900/20'
    if (score >= 50) return 'bg-amber-50 dark:bg-amber-900/20'
    return 'bg-red-50 dark:bg-red-900/20'
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
      {checkConfigs.map((check) => {
        const CheckIcon = check.icon
        const status = checkStates[check.id] || 'not-started'
        const score = getScore(check.id)
        const isChecking = status === 'checking'
        const isCompleted = status === 'completed'
        
        return (
          <Card 
            key={check.id} 
            className={cn(
              'hover:shadow-md transition-all cursor-pointer',
              isChecking && 'ring-2 ring-blue-500'
            )}
            onClick={() => !isChecking && onRunCheck(check.id)}
          >
            <CardContent className="p-3">
              <div className="flex items-start justify-between mb-2">
                <div className={cn('p-1.5 rounded-md flex-shrink-0', getScoreBgColor(score))}>
                  <CheckIcon className={cn('h-4 w-4', score !== undefined ? getScoreColor(score) : check.color)} />
                </div>
                <div className="flex-shrink-0">
                  {isChecking ? (
                    <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                  ) : isCompleted ? (
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-green-500 text-green-600">
                      Done
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                      Run
                    </Badge>
                  )}
                </div>
              </div>
              
              <div className="text-[10px] font-medium text-muted-foreground mb-1">
                {check.label}
              </div>
              
              {score !== undefined ? (
                <div className={cn('text-2xl font-bold', getScoreColor(score))}>
                  {score}
                </div>
              ) : (
                <div className="text-xl font-medium text-muted-foreground">
                  —
                </div>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
