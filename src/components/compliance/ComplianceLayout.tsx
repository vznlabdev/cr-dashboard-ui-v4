"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Download, Play, ChevronRight } from "lucide-react"
import { toast } from "sonner"

interface ComplianceLayoutProps {
  title: string
  children: React.ReactNode
  actions?: React.ReactNode
}

const breadcrumbMap: Record<string, string> = {
  "/compliance": "Dashboards",
  "/compliance/alcar": "ALCAR Registry",
  "/compliance/kya": "KYA Profiler",
  "/compliance/scoring": "Scoring",
  "/compliance/evidence": "Evidence",
  "/compliance/jurisdictions": "Jurisdictions",
}

export function ComplianceLayout({ title, children, actions }: ComplianceLayoutProps) {
  const pathname = usePathname()
  const currentSection = breadcrumbMap[pathname] || title

  return (
    <div className="w-full min-h-full">
      {/* Compact header bar */}
      <div className="flex items-center justify-between px-4 py-2 md:px-6 border-b border-border/40">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
          <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <Link href="/compliance" className="hover:text-foreground transition-colors">Compliance</Link>
          {currentSection !== "Dashboards" && (
            <>
              <ChevronRight className="h-3 w-3" />
              <span className="text-foreground">{currentSection}</span>
            </>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {actions || (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2.5 text-xs"
                onClick={() => toast.info("Export initiated")}
              >
                <Download className="h-3.5 w-3.5 mr-1.5" />
                Export
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2.5 text-xs"
                onClick={() => toast.info("Audit scan started")}
              >
                <Play className="h-3.5 w-3.5 mr-1.5" />
                Run Audit
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Page title */}
      <div className="px-4 pt-3 pb-2 md:px-6">
        <h1 className="text-base font-semibold tracking-tight">{title}</h1>
      </div>

      {/* Content */}
      <div className="px-4 pb-6 md:px-6 space-y-4">
        {children}
      </div>
    </div>
  )
}
