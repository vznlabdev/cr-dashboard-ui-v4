"use client"

import { Button } from "@/components/ui/button"
import { Plus, Search, LayoutGrid, List } from "lucide-react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { mockBrands, mockTickets } from "@/lib/mock-data/creative"
import { BrandCard } from "@/components/creative"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ColorSwatches } from "@/components/creative/ColorPalette"
import { PageContainer } from "@/components/layout/PageContainer"

type ViewType = "grid" | "list"

export default function BrandsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [view, setView] = useState<ViewType>("grid")
  const router = useRouter()

  // Filter brands by search query
  const filteredBrands = mockBrands.filter((brand) =>
    brand.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    brand.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Get active ticket count for a brand
  const getActiveTicketCount = (brandId: string) => {
    return mockTickets.filter(
      (t) => t.brandId === brandId && t.status !== "delivered"
    ).length
  }

  return (
    <PageContainer className="space-y-4 animate-fade-in">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Brands</h1>
          <div className="text-sm text-muted-foreground mt-1">
            {filteredBrands.length} {filteredBrands.length === 1 ? 'brand' : 'brands'}
            {searchQuery && ' • filtered'}
          </div>
        </div>
        <Button 
          size="sm"
          onClick={() => router.push('/creative/brands/new')}
        >
          <Plus className="mr-2 h-4 w-4" />
          New Brand
        </Button>
      </div>

      {/* Search and View Controls */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search brands..."
            className="pl-9 h-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        {/* Compact View Toggle - Segmented Control */}
        <div className="flex items-center gap-0.5 bg-muted/50 rounded-md p-0.5">
          <button
            onClick={() => setView('grid')}
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-1 text-xs rounded transition-all duration-200",
              view === 'grid' 
                ? "bg-background shadow-sm text-foreground font-medium" 
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <LayoutGrid className="h-3.5 w-3.5" />
            <span>Grid</span>
          </button>
          <button
            onClick={() => setView('list')}
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-1 text-xs rounded transition-all duration-200",
              view === 'list' 
                ? "bg-background shadow-sm text-foreground font-medium" 
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <List className="h-3.5 w-3.5" />
            <span>List</span>
          </button>
        </div>
        
        {/* Clear Search Button */}
        {searchQuery && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSearchQuery('')}
            className="h-9"
          >
            Clear
          </Button>
        )}
      </div>

      {/* Brand Grid View */}
      {view === "grid" && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredBrands.map((brand) => (
            <BrandCard key={brand.id} brand={brand} />
          ))}
        </div>
      )}

      {/* Brand List View */}
      {view === "list" && (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Brand</TableHead>
                <TableHead>Colors</TableHead>
                <TableHead>Personality</TableHead>
                <TableHead className="text-center">Active Tickets</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBrands.map((brand) => {
                const primaryColor = brand.colors.find((c) => c.type === "primary")
                const activeCount = getActiveTicketCount(brand.id)

                return (
                  <TableRow key={brand.id}>
                    <TableCell>
                      <Link
                        href={`/creative/brands/${brand.id}`}
                        className="flex items-center gap-3 hover:underline"
                      >
                        <div
                          className="h-10 w-10 rounded-lg flex items-center justify-center text-white font-bold shadow-sm"
                          style={{ backgroundColor: primaryColor?.hex || "#666" }}
                        >
                          {brand.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium">{brand.name}</p>
                          <p className="text-sm text-muted-foreground line-clamp-1 max-w-[200px]">
                            {brand.description}
                          </p>
                        </div>
                      </Link>
                    </TableCell>
                    <TableCell>
                      <ColorSwatches colors={brand.colors} max={4} />
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {brand.personality.slice(0, 2).map((trait, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {trait}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      {activeCount > 0 ? (
                        <Badge variant="secondary">{activeCount}</Badge>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href={`/creative/brands/${brand.id}`}>
                        <Button variant="ghost" size="sm">
                          View
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Empty State */}
      {filteredBrands.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">
            {searchQuery
              ? "No brands found matching your search."
              : "No brands created yet."}
          </p>
          {!searchQuery && (
            <Link href="/creative/brands/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Brand
              </Button>
            </Link>
          )}
        </div>
      )}
    </PageContainer>
  )
}
