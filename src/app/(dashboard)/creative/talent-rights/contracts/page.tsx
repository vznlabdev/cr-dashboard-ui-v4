"use client"

import { useState, useMemo } from "react"
import { PageContainer } from "@/components/layout/PageContainer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText, Search, SlidersHorizontal, Plus } from "lucide-react"
import { ContractCard } from "@/components/talent-rights/ContractCard"
import { EmptyState } from "@/components/cr"
import type { TalentContract, ContractStatus } from "@/types/talent-contracts"
import { cn } from "@/lib/utils"

export default function ContractsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchOpen, setSearchOpen] = useState(false)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState<ContractStatus | "all">("all")
  const [selectedView, setSelectedView] = useState<"all" | "draft" | "active" | "pending" | "expired">("all")

  // Mock data - replace with context
  const contracts: TalentContract[] = []

  const filteredContracts = useMemo(() => {
    return contracts.filter(contract => {
      const matchesSearch = contract.title.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = statusFilter === "all" || contract.status === statusFilter
      const matchesView = 
        selectedView === "all" ||
        (selectedView === "draft" && contract.status === "draft") ||
        (selectedView === "active" && contract.status === "signed") ||
        (selectedView === "pending" && ["sent", "under_review", "negotiating", "pending_signature"].includes(contract.status)) ||
        (selectedView === "expired" && contract.status === "expired")
      return matchesSearch && matchesStatus && matchesView
    })
  }, [contracts, searchQuery, statusFilter, selectedView])

  const stats = useMemo(() => ({
    all: contracts.length,
    draft: contracts.filter(c => c.status === "draft").length,
    active: contracts.filter(c => c.status === "signed").length,
    pending: contracts.filter(c => ["sent", "under_review", "negotiating", "pending_signature"].includes(c.status)).length,
    expired: contracts.filter(c => c.status === "expired").length,
  }), [contracts])

  return (
    <PageContainer className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-semibold">Contracts</h1>
          <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5">
            {filteredContracts.length} total
          </Badge>
        </div>
        <Button size="sm" className="h-8">
          <Plus className="mr-2 h-4 w-4" />
          New Contract
        </Button>
      </div>

      {/* Shopify-Style Toolbar */}
      <div className="flex items-center justify-between py-3 border-b">
        <div className="flex items-center gap-1">
          <Button
            variant={selectedView === 'all' ? 'secondary' : 'ghost'}
            size="sm"
            className="h-8 rounded-full px-4"
            onClick={() => setSelectedView('all')}
          >
            All
            <Badge variant="secondary" className="ml-2 text-[10px] px-1.5 py-0">
              {stats.all}
            </Badge>
          </Button>
          <Button
            variant={selectedView === 'draft' ? 'secondary' : 'ghost'}
            size="sm"
            className="h-8 rounded-full px-4"
            onClick={() => setSelectedView('draft')}
          >
            Drafts
          </Button>
          <Button
            variant={selectedView === 'active' ? 'secondary' : 'ghost'}
            size="sm"
            className="h-8 rounded-full px-4"
            onClick={() => setSelectedView('active')}
          >
            Active
          </Button>
          <Button
            variant={selectedView === 'pending' ? 'secondary' : 'ghost'}
            size="sm"
            className="h-8 rounded-full px-4"
            onClick={() => setSelectedView('pending')}
          >
            Pending
            {stats.pending > 0 && (
              <Badge variant="secondary" className="ml-2 text-[10px] px-1.5 py-0">
                {stats.pending}
              </Badge>
            )}
          </Button>
          <Button
            variant={selectedView === 'expired' ? 'secondary' : 'ghost'}
            size="sm"
            className="h-8 rounded-full px-4"
            onClick={() => setSelectedView('expired')}
          >
            Expired
          </Button>
        </div>

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSearchOpen(!searchOpen)}>
            <Search className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setFiltersOpen(!filtersOpen)}>
            <SlidersHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Collapsible Search */}
      {searchOpen && (
        <div className="flex items-center gap-2 py-2 border-b animate-in slide-in-from-top-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search contracts..."
              className="pl-9 h-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />
          </div>
          <Button variant="ghost" size="sm" onClick={() => setSearchOpen(false)}>
            Cancel
          </Button>
        </div>
      )}

      {/* Contracts List */}
      {filteredContracts.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No contracts found"
          description="Create your first contract to get started"
          action={{
            label: "Create Contract",
            onClick: () => {},
          }}
        />
      ) : (
        <div className="space-y-4">
          {filteredContracts.map((contract) => (
            <ContractCard
              key={contract.id}
              contract={contract}
              onView={() => {}}
              onNegotiate={() => {}}
              onSign={() => {}}
            />
          ))}
        </div>
      )}
    </PageContainer>
  )
}
