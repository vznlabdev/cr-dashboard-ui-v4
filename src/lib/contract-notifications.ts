import type { TalentContract } from "@/types/talent-contracts"
import { getDaysUntilExpiration } from "@/types/talent-contracts"

export interface ContractNotification {
  id: string
  contractId: string
  type: "expiration_30" | "expiration_7" | "category_available" | "signature_requested" | "payment_received"
  title: string
  message: string
  severity: "info" | "warning" | "success"
  createdAt: Date
  read: boolean
}

/**
 * Check which contracts need expiration notifications
 */
export function getExpirationNotifications(contracts: TalentContract[]): ContractNotification[] {
  const notifications: ContractNotification[] = []
  const now = new Date()

  contracts.forEach(contract => {
    if (contract.status !== "signed") return

    const daysRemaining = getDaysUntilExpiration(new Date(contract.terms.expirationDate))

    // 30-day reminder
    if (daysRemaining === 30 && contract.reminders.find(r => r.type === "30_days")?.enabled) {
      notifications.push({
        id: `notif-${contract.id}-30`,
        contractId: contract.id,
        type: "expiration_30",
        title: "Contract Expiring in 30 Days",
        message: `${contract.title} with ${contract.brandName} expires on ${contract.terms.expirationDate}`,
        severity: "warning",
        createdAt: now,
        read: false
      })
    }

    // 7-day reminder
    if (daysRemaining === 7 && contract.reminders.find(r => r.type === "7_days")?.enabled) {
      notifications.push({
        id: `notif-${contract.id}-7`,
        contractId: contract.id,
        type: "expiration_7",
        title: "Contract Expiring in 7 Days",
        message: `${contract.title} with ${contract.brandName} expires soon. Consider renewal.`,
        severity: "warning",
        createdAt: now,
        read: false
      })
    }
  })

  return notifications
}

/**
 * Check for category availability notifications
 */
export function getCategoryAvailabilityNotifications(contracts: TalentContract[]): ContractNotification[] {
  const notifications: ContractNotification[] = []
  const now = new Date()

  contracts.forEach(contract => {
    if (contract.status === "expired" && contract.terms.exclusivity.isExclusive) {
      const expiredRecently = (now.getTime() - new Date(contract.terms.expirationDate).getTime()) / (1000 * 60 * 60 * 24) <= 1

      if (expiredRecently && contract.reminders.find(r => r.type === "category_available")?.enabled) {
        notifications.push({
          id: `notif-${contract.id}-category`,
          contractId: contract.id,
          type: "category_available",
          title: "Category Now Available",
          message: `Category "${contract.terms.category}" is now available for new contracts after ${contract.brandName} exclusivity expired`,
          severity: "info",
          createdAt: now,
          read: false
        })
      }
    }
  })

  return notifications
}

/**
 * Get all pending notifications for contracts
 */
export function getAllContractNotifications(contracts: TalentContract[]): ContractNotification[] {
  return [
    ...getExpirationNotifications(contracts),
    ...getCategoryAvailabilityNotifications(contracts)
  ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
}

/**
 * Send email notification (mock implementation)
 */
export async function sendContractEmail(
  to: string,
  subject: string,
  body: string
): Promise<void> {
  // Mock email sending
  console.log("Sending email:", { to, subject, body })
  return Promise.resolve()
}

/**
 * Schedule reminder for contract expiration
 */
export function scheduleExpirationReminder(
  contract: TalentContract,
  daysBefore: number
): void {
  // In production, this would schedule a job/cron
  console.log(`Scheduled reminder for ${contract.title} - ${daysBefore} days before expiration`)
}
