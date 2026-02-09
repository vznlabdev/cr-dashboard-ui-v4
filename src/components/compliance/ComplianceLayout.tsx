"use client"

import { usePathname } from "next/navigation"
import { PageContainer } from "@/components/layout/PageContainer"
import { LinearBreadcrumb, type BreadcrumbSegment } from "@/components/navigation/LinearBreadcrumb"

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
  "/compliance/distribution-risk": "Distribution Risk",
}

function buildSegments(pathname: string): BreadcrumbSegment[] {
  const segments: BreadcrumbSegment[] = [
    { label: "Compliance", href: "/compliance" },
  ]
  const currentLabel = breadcrumbMap[pathname]
  if (currentLabel && pathname !== "/compliance") {
    segments.push({ label: currentLabel })
  }
  return segments
}

export function ComplianceLayout({ title, children, actions }: ComplianceLayoutProps) {
  const pathname = usePathname()
  const isSubPage = pathname !== "/compliance"
  const segments = buildSegments(pathname)

  return (
    <PageContainer className="space-y-6 animate-fade-in">
      {/* Breadcrumb — only on sub-pages */}
      {isSubPage && (
        <LinearBreadcrumb
          backHref="/compliance"
          segments={segments}
        />
      )}

      {/* Header row — matches app-wide pattern */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">{title}</h1>
        </div>
        {actions && (
          <div className="flex items-center gap-2">{actions}</div>
        )}
      </div>

      {/* Content */}
      {children}
    </PageContainer>
  )
}
