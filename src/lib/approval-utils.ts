import type { ApprovalStatus } from "@/types/creative"

const APPROVED_STATUSES: ApprovalStatus[] = ["client_approved", "approved"]
const REJECTED_STATUSES: ApprovalStatus[] = ["rejected"]
const PENDING_STATUSES: ApprovalStatus[] = ["draft", "submitted", "client_review", "admin_review"]

/** Statuses that count as "pending" for backward compatibility (e.g. legacy "pending" value). */
const LEGACY_PENDING = ["pending"] as const

/** Display labels matching VersionSelector (e.g. "Client OK" for client_approved). */
const APPROVAL_LABELS: Record<string, string> = {
  draft: "Draft",
  submitted: "Submitted",
  client_review: "Client Review",
  client_approved: "Client OK",
  admin_review: "Admin Review",
  approved: "Approved",
  rejected: "Rejected",
  pending: "Pending",
}

export function isApprovalApproved(status: ApprovalStatus | string | undefined): boolean {
  if (!status) return false
  return APPROVED_STATUSES.includes(status as ApprovalStatus)
}

export function isApprovalRejected(status: ApprovalStatus | string | undefined): boolean {
  if (!status) return false
  return REJECTED_STATUSES.includes(status as ApprovalStatus)
}

export function isApprovalPending(status: ApprovalStatus | string | undefined): boolean {
  if (!status) return false
  if (LEGACY_PENDING.includes(status as "pending")) return true
  return PENDING_STATUSES.includes(status as ApprovalStatus)
}

export function getApprovalStatusLabel(status: ApprovalStatus | string | undefined): string {
  if (!status) return "Draft"
  return APPROVAL_LABELS[status] ?? status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, " ")
}
