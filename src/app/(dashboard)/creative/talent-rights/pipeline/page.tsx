"use client"

import { useState, useMemo } from "react"
import { PageContainer } from "@/components/layout/PageContainer"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Plus, Users, AlertCircle } from "lucide-react"
import { EmptyState } from "@/components/cr"
import type { TalentProspect, HiringStage } from "@/types/talent-pipeline"
import { getInitials } from "@/lib/format-utils"
import { cn } from "@/lib/utils"

const STAGES: { id: HiringStage; label: string; color: string }[] = [
  { id: "prospect", label: "Prospects", color: "bg-slate-500" },
  { id: "contacted", label: "Contacted", color: "bg-blue-500" },
  { id: "screening", label: "Screening", color: "bg-purple-500" },
  { id: "negotiating", label: "Negotiating", color: "bg-amber-500" },
  { id: "contract_sent", label: "Contract Sent", color: "bg-orange-500" },
  { id: "onboarding", label: "Onboarding", color: "bg-green-500" },
]

export default function PipelinePage() {
  // Mock data - replace with context
  const prospects: TalentProspect[] = []

  const prospectsByStage = useMemo(() => {
    return STAGES.reduce((acc, stage) => {
      acc[stage.id] = prospects.filter(p => p.stage === stage.id)
      return acc
    }, {} as Record<HiringStage, TalentProspect[]>)
  }, [prospects])

  return (
    <PageContainer className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-semibold">Hiring Pipeline</h1>
          <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5">
            {prospects.length} prospects
          </Badge>
        </div>
        <Button size="sm" className="h-8">
          <Plus className="mr-2 h-4 w-4" />
          Add Prospect
        </Button>
      </div>

      {prospects.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No prospects in pipeline"
          description="Add prospects to track your talent recruitment process"
          action={{
            label: "Add First Prospect",
            onClick: () => {},
          }}
        />
      ) : (
        <div className="grid grid-cols-6 gap-3">
          {STAGES.map(stage => {
            const stageProspects = prospectsByStage[stage.id] || []
            return (
              <div key={stage.id} className="space-y-2">
                <div className="flex items-center justify-between px-2 py-1 border-b">
                  <div className="flex items-center gap-2">
                    <div className={cn("h-2 w-2 rounded-full", stage.color)} />
                    <span className="text-xs font-medium">{stage.label}</span>
                  </div>
                  <Badge variant="secondary" className="text-[10px] h-4 px-1.5">
                    {stageProspects.length}
                  </Badge>
                </div>
                
                <div className="space-y-2 min-h-[400px]">
                  {stageProspects.map(prospect => (
                    <Card 
                      key={prospect.id}
                      className="p-3 cursor-grab hover:shadow-md transition-shadow"
                      draggable
                    >
                      <div className="space-y-2">
                        <div className="flex items-start gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="text-xs">
                              {getInitials(prospect.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{prospect.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{prospect.email}</p>
                          </div>
                        </div>
                        
                        {prospect.priority === 'high' && (
                          <Badge variant="destructive" className="text-[10px] h-4 px-1.5">
                            High Priority
                          </Badge>
                        )}
                        
                        <div className="flex flex-wrap gap-1">
                          {prospect.tags.slice(0, 2).map(tag => (
                            <Badge key={tag} variant="secondary" className="text-[10px] h-4 px-1.5">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </PageContainer>
  )
}
