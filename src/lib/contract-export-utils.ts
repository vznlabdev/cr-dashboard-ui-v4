import type { TalentContract } from "@/types/talent-contracts"
import { formatDateLong } from "@/lib/format-utils"

/**
 * Export contracts to CSV format
 */
export function exportContractsToCSV(contracts: TalentContract[]): string {
  const headers = [
    "Contract ID",
    "Title",
    "Talent",
    "Brand",
    "Type",
    "Status",
    "Effective Date",
    "Expiration Date",
    "Territory",
    "Category",
    "Total Amount",
    "Payment Status",
    "Name Rights",
    "Image Rights",
    "Likeness Rights",
    "Persona Rights",
    "Exclusivity"
  ]

  const rows = contracts.map(contract => [
    contract.contractId,
    contract.title,
    contract.talentName,
    contract.brandName,
    contract.contractType,
    contract.status,
    formatDateLong(contract.terms.effectiveDate),
    formatDateLong(contract.terms.expirationDate),
    contract.terms.territory.join("; "),
    contract.terms.category,
    contract.compensation.totalAmount,
    contract.compensation.paymentStatus,
    contract.nilpRights.name.included ? "Yes" : "No",
    contract.nilpRights.image.included ? "Yes" : "No",
    contract.nilpRights.likeness.included ? "Yes" : "No",
    contract.nilpRights.persona.included ? "Yes" : "No",
    contract.terms.exclusivity.isExclusive ? "Exclusive" : "Non-exclusive"
  ])

  const csvContent = [
    headers.join(","),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
  ].join("\n")

  return csvContent
}

/**
 * Download CSV file
 */
export function downloadContractsCSV(contracts: TalentContract[], filename: string = "contracts.csv"): void {
  const csv = exportContractsToCSV(contracts)
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
  const link = document.createElement("a")
  const url = URL.createObjectURL(blob)
  
  link.setAttribute("href", url)
  link.setAttribute("download", filename)
  link.style.visibility = "hidden"
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/**
 * Export contracts to JSON
 */
export function exportContractsToJSON(contracts: TalentContract[]): string {
  return JSON.stringify(contracts, null, 2)
}

/**
 * Download JSON file
 */
export function downloadContractsJSON(contracts: TalentContract[], filename: string = "contracts.json"): void {
  const json = exportContractsToJSON(contracts)
  const blob = new Blob([json], { type: "application/json" })
  const link = document.createElement("a")
  const url = URL.createObjectURL(blob)
  
  link.setAttribute("href", url)
  link.setAttribute("download", filename)
  link.style.visibility = "hidden"
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/**
 * Generate contract summary report data
 */
export interface ContractSummaryReport {
  totalContracts: number
  activeContracts: number
  expiredContracts: number
  pendingContracts: number
  totalValue: number
  valueByBrand: Record<string, number>
  valueByCategory: Record<string, number>
  nilpBreakdown: {
    nameRights: number
    imageRights: number
    likenessRights: number
    personaRights: number
  }
  exclusiveContracts: number
}

export function generateContractSummary(contracts: TalentContract[]): ContractSummaryReport {
  const active = contracts.filter(c => c.status === "signed")
  const expired = contracts.filter(c => c.status === "expired")
  const pending = contracts.filter(c => ["pending_signature", "sent", "under_review"].includes(c.status))

  const totalValue = contracts.reduce((sum, c) => sum + c.compensation.totalAmount, 0)
  
  const valueByBrand: Record<string, number> = {}
  contracts.forEach(c => {
    valueByBrand[c.brandName] = (valueByBrand[c.brandName] || 0) + c.compensation.totalAmount
  })

  const valueByCategory: Record<string, number> = {}
  contracts.forEach(c => {
    valueByCategory[c.terms.category] = (valueByCategory[c.terms.category] || 0) + c.compensation.totalAmount
  })

  const nilpBreakdown = {
    nameRights: contracts.filter(c => c.nilpRights.name.included).length,
    imageRights: contracts.filter(c => c.nilpRights.image.included).length,
    likenessRights: contracts.filter(c => c.nilpRights.likeness.included).length,
    personaRights: contracts.filter(c => c.nilpRights.persona.included).length
  }

  const exclusiveContracts = contracts.filter(c => c.terms.exclusivity.isExclusive).length

  return {
    totalContracts: contracts.length,
    activeContracts: active.length,
    expiredContracts: expired.length,
    pendingContracts: pending.length,
    totalValue,
    valueByBrand,
    valueByCategory,
    nilpBreakdown,
    exclusiveContracts
  }
}

/**
 * Download all documents for a contract as ZIP (mock implementation)
 */
export async function downloadContractDocumentsZip(contract: TalentContract): Promise<void> {
  // Mock implementation
  console.log(`Downloading ${contract.documents.length} documents for ${contract.title}`)
  return Promise.resolve()
}

/**
 * Prepare contract data for email
 */
export function prepareContractEmail(contract: TalentContract): {
  subject: string
  body: string
} {
  return {
    subject: `Contract: ${contract.title}`,
    body: `
Contract Details:
- Title: ${contract.title}
- Contract ID: ${contract.contractId}
- Brand: ${contract.brandName}
- Effective: ${formatDateLong(contract.terms.effectiveDate)}
- Expires: ${formatDateLong(contract.terms.expirationDate)}
- Compensation: $${contract.compensation.totalAmount.toLocaleString()} ${contract.compensation.currency}

NILP Rights Included:
- Name: ${contract.nilpRights.name.included ? "Yes" : "No"}
- Image: ${contract.nilpRights.image.included ? "Yes" : "No"}
- Likeness: ${contract.nilpRights.likeness.included ? "Yes" : "No"}
- Persona: ${contract.nilpRights.persona.included ? "Yes" : "No"}

Please review the attached documents.
    `.trim()
  }
}
