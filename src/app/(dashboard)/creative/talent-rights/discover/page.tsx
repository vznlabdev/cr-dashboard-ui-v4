"use client"

import { useState } from "react"
import { PageContainer } from "@/components/layout/PageContainer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, SlidersHorizontal, UserPlus, ExternalLink, Plus } from "lucide-react"
import { EmptyState } from "@/components/cr"
import { getInitials } from "@/lib/format-utils"

export default function DiscoverPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [filtersOpen, setFiltersOpen] = useState(false)

  // Mock discovery results
  const discoveryResults: any[] = []

  return (
    <PageContainer className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Discover Talent</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Search and find talent to add to your network
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, skills, location..."
            className="pl-9 h-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline" size="sm" className="h-9" onClick={() => setFiltersOpen(!filtersOpen)}>
          <SlidersHorizontal className="mr-2 h-4 w-4" />
          Filters
        </Button>
      </div>

      {/* Results */}
      {discoveryResults.length === 0 ? (
        <EmptyState
          icon={Search}
          title="No results"
          description="Try searching for talent by name, skills, or location"
        />
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {discoveryResults.map((talent: any) => (
            <Card key={talent.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={talent.avatarUrl} />
                    <AvatarFallback>{getInitials(talent.name)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">{talent.name}</h3>
                    <p className="text-sm text-muted-foreground truncate">{talent.title}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {talent.skills?.slice(0, 3).map((skill: string) => (
                        <Badge key={skill} variant="secondary" className="text-[10px]">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-4">
                  <Button size="sm" className="flex-1">
                    <UserPlus className="mr-2 h-4 w-4" />
                    Invite
                  </Button>
                  <Button variant="outline" size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Pipeline
                  </Button>
                  <Button variant="ghost" size="icon" className="h-9 w-9">
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </PageContainer>
  )
}
