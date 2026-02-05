"use client"

import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

export interface BreadcrumbSegment {
  label: string
  href?: string
}

interface LinearBreadcrumbProps {
  segments: BreadcrumbSegment[]
  backHref?: string
  onBack?: () => void
  className?: string
}

export function LinearBreadcrumb({ 
  segments, 
  backHref, 
  onBack,
  className 
}: LinearBreadcrumbProps) {
  const router = useRouter()
  
  const handleBack = () => {
    if (onBack) {
      onBack()
    } else if (backHref) {
      router.push(backHref)
    } else {
      router.back()
    }
  }
  
  return (
    <div className={cn(
      "flex items-center gap-2 text-sm text-muted-foreground",
      className
    )}>
      <button
        onClick={handleBack}
        className="hover:text-foreground transition-colors"
      >
        ← Back
      </button>
      <span>•</span>
      {segments.map((segment, index) => (
        <div key={index} className="flex items-center gap-2">
          {segment.href ? (
            <button
              onClick={() => router.push(segment.href!)}
              className="hover:text-foreground transition-colors"
            >
              {segment.label}
            </button>
          ) : (
            <span className={cn(
              index === segments.length - 1 && "text-foreground font-medium"
            )}>
              {segment.label}
            </span>
          )}
          {index < segments.length - 1 && <span>›</span>}
        </div>
      ))}
    </div>
  )
}
