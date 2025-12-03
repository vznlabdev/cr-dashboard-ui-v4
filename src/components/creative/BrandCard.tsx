"use client"

import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Brand } from "@/types/creative"
import { cn } from "@/lib/utils"
import { mockTickets } from "@/lib/mock-data/creative"

interface BrandCardProps {
  brand: Brand
  className?: string
}

export function BrandCard({ brand, className }: BrandCardProps) {
  // Count active tickets for this brand
  const activeTicketCount = mockTickets.filter(
    (t) => t.brandId === brand.id && t.status !== "delivered"
  ).length

  // Get primary color for avatar fallback
  const primaryColor = brand.colors.find((c) => c.type === "primary")

  return (
    <Link href={`/creative/brands/${brand.id}`} className={cn("block", className)}>
      <Card className="group relative overflow-hidden transition-all hover:shadow-lg hover:border-primary/50 hover:-translate-y-1 py-0">
        {/* Color Bar */}
        <div className="h-2 flex">
          {brand.colors.map((color) => (
            <div 
              key={color.id} 
              className="flex-1" 
              style={{ backgroundColor: color.hex }} 
            />
          ))}
        </div>

        <CardContent className="px-5 pt-3 pb-5">
          {/* Brand Name & Logo */}
          <div className="flex items-center gap-2.5 mb-1.5">
            {/* Logo - image or fallback */}
            <Avatar className="h-10 w-10 shadow-sm">
              <AvatarImage src={brand.logoUrl} alt={brand.name} />
              <AvatarFallback 
                className="text-white font-bold"
                style={{ backgroundColor: primaryColor?.hex || "#666" }}
              >
                {brand.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-sm group-hover:text-primary transition-colors">
                {brand.name}
              </h3>
              {activeTicketCount > 0 && (
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                  {activeTicketCount} active ticket{activeTicketCount !== 1 ? "s" : ""}
                </Badge>
              )}
            </div>
          </div>

          {/* Description */}
          <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
            {brand.description}
          </p>

          {/* Personality Tags */}
          {brand.personality.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {brand.personality.slice(0, 3).map((trait, index) => (
                <Badge key={index} variant="outline" className="text-[10px] px-1.5 py-0">
                  {trait}
                </Badge>
              ))}
              {brand.personality.length > 3 && (
                <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                  +{brand.personality.length - 3}
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}

