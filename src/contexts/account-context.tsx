"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"

export interface Company {
  id: string
  name: string
  logo?: string
  description?: string
  industry?: string
}

// Mock companies - TODO: Replace with actual company data from auth/API
export const companies: Company[] = [
  {
    id: "company-1",
    name: "Acme Corporation",
    description: "Enterprise software solutions",
    industry: "Technology",
  },
  {
    id: "company-2",
    name: "TechStart Inc",
    description: "Innovative startup platform",
    industry: "Technology",
  },
  {
    id: "company-3",
    name: "Design Studio",
    description: "Creative agency services",
    industry: "Design & Marketing",
  },
  {
    id: "company-4",
    name: "Global Media Group",
    description: "Media and entertainment",
    industry: "Media",
  },
]

interface AccountContextType {
  currentCompany: Company | null
  setCompany: (companyId: string) => void
  getAllCompanies: () => Company[]
}

const AccountContext = createContext<AccountContextType | undefined>(undefined)

export function AccountProvider({ children }: { children: ReactNode }) {
  const [currentCompany, setCurrentCompany] = useState<Company | null>(companies[0])

  // Load saved company from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("cr-company-id")
      if (stored) {
        const company = companies.find((c) => c.id === stored)
        if (company) {
          setCurrentCompany(company)
        }
      }
    }
  }, [])

  const handleSetCompany = (companyId: string) => {
    const company = companies.find((c) => c.id === companyId)
    if (company) {
      setCurrentCompany(company)
      if (typeof window !== "undefined") {
        localStorage.setItem("cr-company-id", companyId)
      }
    }
  }

  const getAllCompanies = (): Company[] => {
    return companies
  }

  return (
    <AccountContext.Provider
      value={{
        currentCompany,
        setCompany: handleSetCompany,
        getAllCompanies,
      }}
    >
      {children}
    </AccountContext.Provider>
  )
}

export function useAccount() {
  const context = useContext(AccountContext)
  if (context === undefined) {
    throw new Error("useAccount must be used within an AccountProvider")
  }
  return context
}

