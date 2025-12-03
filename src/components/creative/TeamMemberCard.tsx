"use client"

import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { TeamMember } from "@/types/creative"
import { RoleBadge } from "./RoleBadge"
import { WorkloadBar } from "./WorkloadBar"
import { cn } from "@/lib/utils"
import { Mail, CheckCircle2, XCircle } from "lucide-react"
import { mockTickets } from "@/lib/mock-data/creative"

interface TeamMemberCardProps {
  member: TeamMember
  variant?: "grid" | "list"
  className?: string
}

export function TeamMemberCard({
  member,
  variant = "grid",
  className,
}: TeamMemberCardProps) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  // Get assigned tickets count
  const assignedTickets = mockTickets.filter(
    (t) => t.assigneeId === member.id && t.status !== "delivered"
  ).length

  if (variant === "list") {
    return (
      <Link href={`/creative/team/${member.id}`} className={cn("block", className)}>
        <Card className="hover:shadow-md transition-all hover:border-primary/50">
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              {/* Avatar */}
              <Avatar className="h-12 w-12">
                <AvatarImage src={member.avatar} alt={member.name} />
                <AvatarFallback className="bg-primary/10 text-primary font-medium">
                  {getInitials(member.name)}
                </AvatarFallback>
              </Avatar>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium truncate">{member.name}</h3>
                  {member.isAvailable ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  ) : (
                    <XCircle className="h-4 w-4 text-muted-foreground shrink-0" />
                  )}
                </div>
                <p className="text-sm text-muted-foreground truncate">
                  {member.email}
                </p>
              </div>

              {/* Role */}
              <RoleBadge role={member.role} size="sm" />

              {/* Workload */}
              <div className="w-32">
                <WorkloadBar
                  current={member.currentLoad}
                  max={member.maxCapacity}
                  size="sm"
                />
              </div>

              {/* Tickets */}
              <div className="text-center w-20">
                <p className="text-lg font-semibold">{assignedTickets}</p>
                <p className="text-xs text-muted-foreground">tickets</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    )
  }

  // Grid variant (default)
  return (
    <Link href={`/creative/team/${member.id}`} className={cn("block", className)}>
      <Card className="group hover:shadow-lg transition-all hover:border-primary/50 hover:-translate-y-1 py-0">
        <CardContent className="p-5">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={member.avatar} alt={member.name} />
              <AvatarFallback className="bg-primary/10 text-primary font-medium text-sm">
                {getInitials(member.name)}
              </AvatarFallback>
            </Avatar>
            <Badge variant="outline" className={cn(
              "text-xs py-0 h-5",
              member.isAvailable 
                ? "text-emerald-600 border-emerald-500/30 bg-emerald-500/10" 
                : "text-muted-foreground"
            )}>
              {member.isAvailable ? "Available" : "Unavailable"}
            </Badge>
          </div>

          {/* Name & Email */}
          <h3 className="font-medium text-sm group-hover:text-primary transition-colors">
            {member.name}
          </h3>
          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
            <Mail className="h-3 w-3" />
            <span className="truncate">{member.email}</span>
          </p>

          {/* Role */}
          <div className="mt-2">
            <RoleBadge role={member.role} size="sm" />
          </div>

          {/* Skills */}
          {member.skills.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {member.skills.slice(0, 3).map((skill, i) => (
                <Badge key={i} variant="secondary" className="text-[10px] px-1.5 py-0">
                  {skill}
                </Badge>
              ))}
              {member.skills.length > 3 && (
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                  +{member.skills.length - 3}
                </Badge>
              )}
            </div>
          )}

          {/* Workload */}
          <div className="mt-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted-foreground">Workload</span>
              <span className="text-xs font-medium">{assignedTickets} active tickets</span>
            </div>
            <WorkloadBar
              current={member.currentLoad}
              max={member.maxCapacity}
              showLabel={false}
              size="sm"
            />
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

