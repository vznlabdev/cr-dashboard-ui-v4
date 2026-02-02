"use client"

import { useState } from "react"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { UserPlus, X, Search } from "lucide-react"
import { useTalentRights } from "@/contexts/talent-rights-context"
import { getInitials } from "@/lib/format-utils"

interface TalentPickerProps {
  value: string[]
  onChange: (talentIds: string[]) => void
}

export function TalentPicker({ value, onChange }: TalentPickerProps) {
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const { talentRights } = useTalentRights()
  
  const selectedTalents = talentRights.filter(t => value.includes(t.id))
  
  const filteredTalents = talentRights.filter(t => 
    t.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (t.talentRightsId || '').toLowerCase().includes(searchQuery.toLowerCase())
  )
  
  const handleToggle = (talentId: string) => {
    onChange(
      value.includes(talentId)
        ? value.filter(id => id !== talentId)
        : [...value, talentId]
    )
  }
  
  const handleRemove = (talentId: string) => {
    onChange(value.filter(id => id !== talentId))
  }
  
  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="h-8 w-full justify-start">
            <UserPlus className="mr-2 h-4 w-4" />
            {value.length === 0 ? "Select talent" : `${value.length} selected`}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[400px] p-0" align="start">
          <div className="p-2 border-b">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search talent..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-8"
              />
            </div>
          </div>
          <ScrollArea className="h-[300px]">
            <div className="p-2 space-y-1">
              {filteredTalents.map(talent => (
                <label
                  key={talent.id}
                  className="flex items-center gap-2 p-2 hover:bg-accent rounded cursor-pointer"
                >
                  <Checkbox
                    checked={value.includes(talent.id)}
                    onCheckedChange={() => handleToggle(talent.id)}
                  />
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={talent.avatarUrl} />
                    <AvatarFallback>{getInitials(talent.fullName)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{talent.fullName}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {talent.talentRightsId || talent.creatorRightsId}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-[10px]">
                    {talent.talentType || talent.creatorType}
                  </Badge>
                </label>
              ))}
            </div>
          </ScrollArea>
        </PopoverContent>
      </Popover>
      
      {selectedTalents.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {selectedTalents.map(talent => (
            <Badge key={talent.id} variant="secondary" className="pr-1">
              {talent.fullName}
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 ml-1"
                onClick={() => handleRemove(talent.id)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}
