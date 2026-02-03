"use client"

import { useState, useMemo } from "react"
import { PageContainer } from "@/components/layout/PageContainer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText, Search, SlidersHorizontal, Plus, Upload, AlertTriangle, CheckCircle2, Clock, DollarSign, FileCheck } from "lucide-react"
import { ContractCard } from "@/components/talent-rights/ContractCard"
import { UploadContractModal } from "@/components/talent-rights/UploadContractModal"
import { ContractDetailView } from "@/components/talent-rights/ContractDetailView"
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
  const [selectedView, setSelectedView] = useState<ViewTab>("all")
  const [sortBy, setSortBy] = useState<"expiration" | "created" | "brand">("expiration")
  const [uploadModalOpen, setUploadModalOpen] = useState(false)
  const [detailContract, setDetailContract] = useState<TalentContract | null>(null)
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
  }, [contracts, selectedView, searchQuery, statusFilter, typeFilter, brandFilter, sortBy, getActiveContracts, getExpiringContracts, getPendingContracts, getExpiredContracts])

  const activeFilterCount = useMemo(() => {
    let count = 0
    if (statusFilter !== 'all') count++
    if (typeFilter !== 'all') count++
    if (brandFilter !== 'all') count++
    return count
  }, [statusFilter, typeFilter, brandFilter])

  const clearFilters = () => {
    setSearchQuery("")
    setStatusFilter("all")
    setTypeFilter("all")
    setBrandFilter("all")
  }

  return (
    <PageContainer className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Contracts</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage all agreements, NILP rights deals, and usage contracts
          </p>
        </div>
        <Button size="sm" className="h-8" onClick={() => setUploadModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Upload Contract
        </Button>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="text-xs">Active Contracts</CardDescription>
            <CardTitle className="text-2xl font-bold">{stats.active}</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Currently live</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="text-xs flex items-center gap-1">
              <AlertTriangle className="h-3 w-3 text-orange-500" />
              Expiring Soon
            </CardDescription>
            <CardTitle className="text-2xl font-bold">{stats.expiring}</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">&lt;30 days</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="text-xs">Total Contracts</CardDescription>
            <CardTitle className="text-2xl font-bold">{stats.total}</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="text-xs flex items-center gap-1">
              <FileCheck className="h-3 w-3 text-blue-500" />
              Pending Review
            </CardDescription>
            <CardTitle className="text-2xl font-bold">{stats.pending}</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Awaiting sign</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search contracts by title, ID, brand, or talent..."
            className="pl-9 h-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2">
          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as ContractStatus | "all")}>
            <SelectTrigger className="w-[140px] h-9">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="sent">Sent</SelectItem>
              <SelectItem value="pending_signature">Pending Signature</SelectItem>
              <SelectItem value="signed">Signed</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
            </SelectContent>
          </Select>

          <Select value={brandFilter} onValueChange={setBrandFilter}>
            <SelectTrigger className="w-[140px] h-9">
              <SelectValue placeholder="Brand" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Brands</SelectItem>
              {brands.map(brand => (
                <SelectItem key={brand} value={brand}>{brand}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as ContractType | "all")}>
            <SelectTrigger className="w-[160px] h-9">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="nilp_rights_agreement">NILP Rights</SelectItem>
              <SelectItem value="usage_rights">Usage Rights</SelectItem>
              <SelectItem value="brand_endorsement">Endorsement</SelectItem>
              <SelectItem value="work_for_hire">Work for Hire</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={(value) => setSortBy(value as typeof sortBy)}>
            <SelectTrigger className="w-[140px] h-9">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="expiration">Expiration</SelectItem>
              <SelectItem value="created">Date Created</SelectItem>
              <SelectItem value="brand">Brand Name</SelectItem>
            </SelectContent>
          </Select>

          {activeFilterCount > 0 && (
            <Button variant="ghost" size="sm" className="h-9" onClick={clearFilters}>
              Clear ({activeFilterCount})
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b">
        <Button
          variant={selectedView === 'all' ? 'secondary' : 'ghost'}
          size="sm"
          className="h-8 rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
          data-state={selectedView === 'all' ? 'active' : ''}
          onClick={() => setSelectedView('all')}
        >
          All
          <Badge variant="secondary" className="ml-2 text-[10px] px-1.5 py-0">
            {contracts.length}
          </Badge>
        </Button>
        <Button
          variant={selectedView === 'active' ? 'secondary' : 'ghost'}
          size="sm"
          className="h-8 rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
          data-state={selectedView === 'active' ? 'active' : ''}
          onClick={() => setSelectedView('active')}
        >
          <CheckCircle2 className="mr-1.5 h-3.5 w-3.5 text-green-500" />
          Active
          <Badge variant="secondary" className="ml-2 text-[10px] px-1.5 py-0">
            {stats.active}
          </Badge>
        </Button>
        <Button
          variant={selectedView === 'expiring' ? 'secondary' : 'ghost'}
          size="sm"
          className="h-8 rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
          data-state={selectedView === 'expiring' ? 'active' : ''}
          onClick={() => setSelectedView('expiring')}
        >
          <AlertTriangle className="mr-1.5 h-3.5 w-3.5 text-orange-500" />
          Expiring Soon
          <Badge variant="secondary" className="ml-2 text-[10px] px-1.5 py-0">
            {stats.expiring}
          </Badge>
        </Button>
        <Button
          variant={selectedView === 'pending' ? 'secondary' : 'ghost'}
          size="sm"
          className="h-8 rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
          data-state={selectedView === 'pending' ? 'active' : ''}
          onClick={() => setSelectedView('pending')}
        >
          <Clock className="mr-1.5 h-3.5 w-3.5 text-blue-500" />
          Pending
          <Badge variant="secondary" className="ml-2 text-[10px] px-1.5 py-0">
            {stats.pending}
          </Badge>
        </Button>
        <Button
          variant={selectedView === 'expired' ? 'secondary' : 'ghost'}
          size="sm"
          className="h-8 rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
          data-state={selectedView === 'expired' ? 'active' : ''}
          onClick={() => setSelectedView('expired')}
        >
          Expired
        </Button>
      </div>

      {/* Contract List */}
      <div className="space-y-4">
        {filteredContracts.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No contracts found"
            description={
              searchQuery || activeFilterCount > 0
                ? "Try adjusting your search or filters"
                : "Upload your first NILP contract to get started"
            }
            action={
              searchQuery || activeFilterCount > 0 ? (
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  Clear Filters
                </Button>
              ) : (
                <Button size="sm" onClick={() => setUploadModalOpen(true)}>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Contract
                </Button>
              )
            }
          />
        ) : (
          <>
            {selectedView === "active" && (
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-sm font-medium text-muted-foreground">
                  ACTIVE CONTRACTS ({filteredContracts.length})
                </h2>
                <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => toast.info("Export feature coming soon")}>
                  <Download className="mr-1.5 h-3.5 w-3.5" />
                  Export All
                </Button>
              </div>
            )}
            
            {selectedView === "expiring" && (
              <div className="flex items-center gap-2 mb-2 p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                <AlertTriangle className="h-4 w-4 text-orange-500 shrink-0" />
                <p className="text-sm">
                  <span className="font-medium">{filteredContracts.length} contract{filteredContracts.length !== 1 ? 's' : ''}</span> expiring in the next 30 days. Consider renewal options.
                </p>
              </div>
            )}
            
            {selectedView === "pending" && (
              <div className="flex items-center gap-2 mb-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <FileCheck className="h-4 w-4 text-blue-500 shrink-0" />
                <p className="text-sm">
                  <span className="font-medium">{filteredContracts.length} contract{filteredContracts.length !== 1 ? 's' : ''}</span> awaiting signature or review.
                </p>
              </div>
            )}

            <div className="space-y-4">
              {filteredContracts.map((contract) => (
                <ContractCard 
                  key={contract.id} 
                  contract={contract}
                  onViewDetails={() => setDetailContract(contract)}
                  onSign={() => setSignContract(contract)}
                  onRenewal={() => setRenewalContract(contract)}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Modals */}
      <UploadContractModal 
        open={uploadModalOpen}
        onOpenChange={setUploadModalOpen}
      />
      
      {detailContract && (
        <ContractDetailView
          contract={detailContract}
          open={!!detailContract}
          onOpenChange={(open) => !open && setDetailContract(null)}
          onRequestRenewal={() => {
            setRenewalContract(detailContract)
            setDetailContract(null)
          }}
        />
      )}
      
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
