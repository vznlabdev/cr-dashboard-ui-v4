"use client"

import { Button } from "@/components/ui/button"
import { Plus, Search, LayoutGrid, List } from "lucide-react"
import { Input } from "@/components/ui/input"
import Link from "next/link"
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

type ViewType = "grid" | "list"

export default function BrandsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [view, setView] = useState<ViewType>("grid")

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
    <div className="space-y-6 animate-fade-in mx-auto max-w-7xl w-full">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Brand Profiles</h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            Manage brand guidelines, assets, and identity
          </p>
        </div>
        <Link href="/creative/brands/new">
          <Button className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            New Brand
          </Button>
        </Link>
      </div>

      {/* Search and View Toggle */}
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="relative flex-1 max-w-md w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search brands..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={view === "grid" ? "secondary" : "outline"}
            size="icon"
            onClick={() => setView("grid")}
            title="Grid view"
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant={view === "list" ? "secondary" : "outline"}
            size="icon"
            onClick={() => setView("list")}
            title="List view"
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Brand Stats */}
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <span>{filteredBrands.length} brand{filteredBrands.length !== 1 ? "s" : ""}</span>
        {searchQuery && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSearchQuery("")}
            className="h-auto py-1 px-2"
          >
            Clear search
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
    </div>
  )
}
