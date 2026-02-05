"use client"

import { useState, useMemo } from "react"
import { PageContainer } from "@/components/layout/PageContainer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText, Search, SlidersHorizontal, Plus, Upload, AlertTriangle, CheckCircle2, Clock, DollarSign, FileCheck, Download } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LinearBreadcrumb } from "@/components/navigation/LinearBreadcrumb"
import { ContractCard } from "@/components/talent-rights/ContractCard"
import { UploadContractModal } from "@/components/talent-rights/UploadContractModal"
import { SignContractModal } from "@/components/talent-rights/SignContractModal"
import { RenewalRequestDialog } from "@/components/talent-rights/RenewalRequestDialog"
import { EmptyState } from "@/components/cr"
import { useContracts } from "@/contexts/contracts-context"
import type { ContractStatus, ContractType, TalentContract } from "@/types/talent-contracts"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

type ViewTab = "all" | "active" | "expiring" | "pending" | "expired"

export default function ContractsPage() {
  const { 
    contracts, 
    getActiveContracts, 
    getExpiringContracts, 
    getPendingContracts, 
    getExpiredContracts,
    getTotalContractValue,
    loading 
  } = useContracts()
  
  const [searchQuery, setSearchQuery] = useState("")
  const [searchOpen, setSearchOpen] = useState(false)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState<ContractStatus | "all">("all")
  const [typeFilter, setTypeFilter] = useState<ContractType | "all">("all")
  const [brandFilter, setBrandFilter] = useState<string>("all")
  const [talentFilter, setTalentFilter] = useState<string>("all")
  const [selectedView, setSelectedView] = useState<ViewTab>("all")
  const [sortBy, setSortBy] = useState<"expiration" | "created" | "brand">("expiration")
  const [uploadModalOpen, setUploadModalOpen] = useState(false)
  const [signContract, setSignContract] = useState<TalentContract | null>(null)
  const [renewalContract, setRenewalContract] = useState<TalentContract | null>(null)

  // Calculate stats
  const stats = useMemo(() => {
    const active = getActiveContracts()
    const expiringSoon = getExpiringContracts(30)
    const pending = getPendingContracts()
    
    return {
      active: active.length,
      expiring: expiringSoon.length,
      total: contracts.length,
      pending: pending.length,
      totalValue: getTotalContractValue(active)
    }
  }, [contracts, getActiveContracts, getExpiringContracts, getPendingContracts, getTotalContractValue])

  // Get unique brands
  const brands = useMemo(() => {
    const uniqueBrands = Array.from(new Set(contracts.map(c => c.brandName))).sort()
    return uniqueBrands
  }, [contracts])

  // Get unique talents
  const talents = useMemo(() => {
    const uniqueTalents = Array.from(new Set(contracts.map(c => c.talentName))).sort()
    return uniqueTalents
  }, [contracts])

  // Filter and sort contracts
  const filteredContracts = useMemo(() => {
    let filtered = contracts

    // Apply view tab filter
    if (selectedView === "active") {
      filtered = getActiveContracts()
    } else if (selectedView === "expiring") {
      filtered = getExpiringContracts(30)
    } else if (selectedView === "pending") {
      filtered = getPendingContracts()
    } else if (selectedView === "expired") {
      filtered = getExpiredContracts()
    }

    // Apply search
    if (searchQuery) {
      filtered = filtered.filter(contract =>
        contract.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contract.contractId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contract.brandName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contract.talentName.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(c => c.status === statusFilter)
    }

    // Apply type filter
    if (typeFilter !== "all") {
      filtered = filtered.filter(c => c.contractType === typeFilter)
    }

    // Apply brand filter
    if (brandFilter !== "all") {
      filtered = filtered.filter(c => c.brandName === brandFilter)
    }

    // Apply talent filter
    if (talentFilter !== "all") {
      filtered = filtered.filter(c => c.talentName === talentFilter)
    }

    // Sort
    filtered = [...filtered].sort((a, b) => {
      if (sortBy === "expiration") {
        return new Date(a.terms.expirationDate).getTime() - new Date(b.terms.expirationDate).getTime()
      } else if (sortBy === "created") {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      } else if (sortBy === "brand") {
        return a.brandName.localeCompare(b.brandName)
      }
      return 0
    })

    return filtered
  }, [contracts, selectedView, searchQuery, statusFilter, typeFilter, brandFilter, talentFilter, sortBy, getActiveContracts, getExpiringContracts, getPendingContracts, getExpiredContracts])

  const activeFilterCount = useMemo(() => {
    let count = 0
    if (statusFilter !== 'all') count++
    if (typeFilter !== 'all') count++
    if (brandFilter !== 'all') count++
    // Note: talentFilter is NOT counted here because it's an inline control, not inside the dropdown
    return count
  }, [statusFilter, typeFilter, brandFilter])

  const clearFilters = () => {
    setSearchQuery("")
    setStatusFilter("all")
    setTypeFilter("all")
    setBrandFilter("all")
    setTalentFilter("all")
  }

  return (
    <PageContainer className="space-y-4">
      {/* Breadcrumb */}
      <LinearBreadcrumb
        backHref="/creative/talent-rights"
        segments={[
          { label: "Talent Rights", href: "/creative/talent-rights" },
          { label: "Contracts" }
        ]}
      />

      {/* Compact Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-semibold">Contracts</h1>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5">
              {stats.active} active
            </Badge>
            {stats.expiring > 0 && (
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 border-orange-500 text-orange-600">
                {stats.expiring} expiring
              </Badge>
            )}
            {stats.pending > 0 && (
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5">
                {stats.pending} pending
              </Badge>
            )}
          </div>
        </div>
        <Button size="sm" className="h-8" onClick={() => setUploadModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Contract
        </Button>
      </div>

      {/* Compact Filters */}
      <div className="flex items-center gap-2">
        <div className="relative w-64">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search contracts..."
            className="pl-8 h-8 text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <Select value={talentFilter} onValueChange={setTalentFilter}>
          <SelectTrigger className="w-48 h-8 text-xs">
            <SelectValue placeholder="All Talent" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Talent</SelectItem>
            {talents.map(talent => (
              <SelectItem key={talent} value={talent}>{talent}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8">
              <SlidersHorizontal className="h-4 w-4" />
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="ml-1.5 h-4 px-1 text-[10px]">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuLabel className="text-xs">Filters</DropdownMenuLabel>
            <DropdownMenuSeparator />
            
            <div className="p-2 space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground">Status</label>
                <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as ContractStatus | "all")}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="sent">Sent</SelectItem>
                    <SelectItem value="pending_signature">Pending</SelectItem>
                    <SelectItem value="signed">Signed</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground">Brand</label>
                <Select value={brandFilter} onValueChange={setBrandFilter}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Brands</SelectItem>
                    {brands.map(brand => (
                      <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground">Type</label>
                <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as ContractType | "all")}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="nilp_rights_agreement">NILP Rights</SelectItem>
                    <SelectItem value="usage_rights">Usage Rights</SelectItem>
                    <SelectItem value="brand_endorsement">Endorsement</SelectItem>
                    <SelectItem value="work_for_hire">Work for Hire</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {activeFilterCount > 0 && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={clearFilters} className="text-xs">
                  Clear all filters
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        <Select value={sortBy} onValueChange={(value) => setSortBy(value as typeof sortBy)}>
          <SelectTrigger className="w-36 h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="expiration">Sort: Expiration</SelectItem>
            <SelectItem value="created">Sort: Created</SelectItem>
            <SelectItem value="brand">Sort: Brand</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Minimal Tabs */}
      <div className="flex items-center gap-6 text-sm border-b">
        <button
          className={cn(
            "pb-2 border-b-2 transition-colors",
            selectedView === 'all' 
              ? "border-primary font-medium" 
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
          onClick={() => setSelectedView('all')}
        >
          All <span className={cn(selectedView === 'all' ? "" : "text-muted-foreground")}>({contracts.length})</span>
        </button>
        <button
          className={cn(
            "pb-2 border-b-2 transition-colors",
            selectedView === 'active' 
              ? "border-primary font-medium" 
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
          onClick={() => setSelectedView('active')}
        >
          Active <span className={cn(selectedView === 'active' ? "" : "text-muted-foreground")}>({stats.active})</span>
        </button>
        <button
          className={cn(
            "pb-2 border-b-2 transition-colors",
            selectedView === 'expiring' 
              ? "border-primary font-medium" 
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
          onClick={() => setSelectedView('expiring')}
        >
          Expiring <span className={cn(selectedView === 'expiring' ? "" : "text-muted-foreground")}>({stats.expiring})</span>
        </button>
        <button
          className={cn(
            "pb-2 border-b-2 transition-colors",
            selectedView === 'pending' 
              ? "border-primary font-medium" 
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
          onClick={() => setSelectedView('pending')}
        >
          Pending <span className={cn(selectedView === 'pending' ? "" : "text-muted-foreground")}>({stats.pending})</span>
        </button>
        <button
          className={cn(
            "pb-2 border-b-2 transition-colors",
            selectedView === 'expired' 
              ? "border-primary font-medium" 
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
          onClick={() => setSelectedView('expired')}
        >
          Expired <span className={cn(selectedView === 'expired' ? "" : "text-muted-foreground")}>({getExpiredContracts().length})</span>
        </button>
      </div>

      {/* Contract List */}
      <div className="border rounded-lg overflow-hidden">
        {filteredContracts.length === 0 ? (
          <div className="py-12">
            <EmptyState
              icon={FileText}
              title="No contracts found"
              description={
                searchQuery || activeFilterCount > 0
                  ? "Try adjusting your search or filters"
                  : "Upload your first NILP contract to get started"
              }
              action={{
                label: searchQuery || activeFilterCount > 0 ? "Clear Filters" : "Upload Contract",
                onClick: searchQuery || activeFilterCount > 0 ? clearFilters : () => setUploadModalOpen(true)
              }}
            />
          </div>
        ) : (
          <div>
            {filteredContracts.map((contract) => (
              <ContractCard 
                key={contract.id} 
                contract={contract}
                onSign={() => setSignContract(contract)}
                onRenewal={() => setRenewalContract(contract)}
                compact
              />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <UploadContractModal 
        open={uploadModalOpen}
        onOpenChange={setUploadModalOpen}
      />
      
      {signContract && (
        <SignContractModal
          contract={signContract}
          open={!!signContract}
          onOpenChange={(open) => !open && setSignContract(null)}
        />
      )}
      
      {renewalContract && (
        <RenewalRequestDialog
          contract={renewalContract}
          open={!!renewalContract}
          onOpenChange={(open) => !open && setRenewalContract(null)}
        />
      )}
    </PageContainer>
  )
}
