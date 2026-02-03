"use client"

import { createContext, useContext, useState, ReactNode, useCallback } from "react"
import type { TalentContract, SignatureData } from "@/types/talent-contracts"
import { 
  mockContracts, 
  getContractsByTalent as getContractsByTalentHelper,
  getContractById as getContractByIdHelper,
  getActiveContracts,
  getExpiringContracts,
  getPendingContracts,
  getExpiredContracts,
  getTotalContractValue
} from "@/lib/mock-data/contracts"
import { toast } from "sonner"

interface ContractsContextType {
  contracts: TalentContract[]
  getContractsByTalent: (talentId: string) => TalentContract[]
  getContractById: (id: string) => TalentContract | undefined
  getActiveContracts: () => TalentContract[]
  getExpiringContracts: (days?: number) => TalentContract[]
  getPendingContracts: () => TalentContract[]
  getExpiredContracts: () => TalentContract[]
  getTotalContractValue: (contracts: TalentContract[]) => number
  createContract: (contract: Partial<TalentContract>) => Promise<void>
  updateContract: (id: string, updates: Partial<TalentContract>) => Promise<void>
  uploadDocument: (contractId: string, file: File) => Promise<void>
  signContract: (contractId: string, signatureData: SignatureData) => Promise<void>
  requestRenewal: (contractId: string, renewalOption: string) => Promise<void>
  deleteContract: (contractId: string) => Promise<void>
  loading: boolean
}

const ContractsContext = createContext<ContractsContextType | undefined>(undefined)

export function ContractsProvider({ children }: { children: ReactNode }) {
  const [contracts, setContracts] = useState<TalentContract[]>(mockContracts)
  const [loading, setLoading] = useState(false)

  const getContractsByTalent = useCallback((talentId: string) => {
    return getContractsByTalentHelper(talentId)
  }, [])

  const getContractById = useCallback((id: string) => {
    return getContractByIdHelper(id)
  }, [])

  const createContract = useCallback(async (contractData: Partial<TalentContract>) => {
    setLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const newContract: TalentContract = {
        id: `contract-${Date.now()}`,
        talentId: contractData.talentId || "",
        talentName: contractData.talentName || "",
        templateType: contractData.templateType || "standard",
        contractType: contractData.contractType || "nilp_rights_agreement",
        status: "draft",
        version: 1,
        title: contractData.title || "",
        contractId: `CR-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000)}-${contractData.brandName?.toUpperCase() || "BRAND"}`,
        brandName: contractData.brandName || "",
        projectId: contractData.projectId,
        contractUrl: "",
        nilpRights: contractData.nilpRights || {
          name: { included: false, usage: [] },
          image: { included: false, usage: [] },
          likeness: { included: false, aiGeneration: false, requiresApproval: false },
          persona: { included: false }
        },
        terms: contractData.terms || {
          effectiveDate: new Date(),
          expirationDate: new Date(),
          territory: [],
          mediaChannels: [],
          intendedUse: "",
          category: "",
          exclusivity: { isExclusive: false },
          autoRenewal: false
        },
        compensation: contractData.compensation || {
          totalAmount: 0,
          currency: "USD",
          paymentTerms: "",
          paymentStatus: "pending"
        },
        documents: [],
        reminders: contractData.reminders || [
          { type: "30_days", enabled: true },
          { type: "7_days", enabled: true }
        ],
        approvalRights: contractData.approvalRights ?? true,
        moralRights: contractData.moralRights ?? true,
        terminationNotice: contractData.terminationNotice ?? 30,
        specialProvisions: contractData.specialProvisions || [],
        
        // Legacy fields
        compensationType: "flat_fee",
        compensationAmount: contractData.compensation?.totalAmount || 0,
        validFrom: contractData.terms?.effectiveDate || new Date(),
        validThrough: contractData.terms?.expirationDate || new Date(),
        rightsGranted: {
          name: contractData.nilpRights?.name.included || false,
          image: contractData.nilpRights?.image.included || false,
          likeness: contractData.nilpRights?.likeness.included || false,
          persona: contractData.nilpRights?.persona.included || false
        },
        usageRestrictions: [],
        exclusivity: contractData.terms?.exclusivity.isExclusive || false,
        
        negotiations: [],
        contractHistory: [
          {
            id: `hist-${Date.now()}`,
            action: "created",
            timestamp: new Date(),
            performedBy: "admin-1",
            performedByName: "Admin User",
            details: "Contract created"
          }
        ],
        
        createdAt: new Date(),
        createdBy: "admin-1",
        createdByName: "Admin User",
        updatedAt: new Date()
      }
      
      setContracts(prev => [...prev, newContract])
      toast.success("Contract created successfully")
    } catch (error) {
      toast.error("Failed to create contract")
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  const updateContract = useCallback(async (id: string, updates: Partial<TalentContract>) => {
    setLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setContracts(prev => prev.map(contract => 
        contract.id === id 
          ? { ...contract, ...updates, updatedAt: new Date() }
          : contract
      ))
      
      toast.success("Contract updated successfully")
    } catch (error) {
      toast.error("Failed to update contract")
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  const uploadDocument = useCallback(async (contractId: string, file: File) => {
    setLoading(true)
    try {
      // Simulate file upload
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      toast.success(`Document "${file.name}" uploaded successfully`)
    } catch (error) {
      toast.error("Failed to upload document")
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  const signContract = useCallback(async (contractId: string, signatureData: SignatureData) => {
    setLoading(true)
    try {
      // Simulate signing process
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setContracts(prev => prev.map(contract => {
        if (contract.id === contractId) {
          return {
            ...contract,
            status: "signed",
            signedAt: new Date(),
            signedByTalent: true,
            signedByAdmin: true,
            executedAt: new Date(),
            contractHistory: [
              ...contract.contractHistory,
              {
                id: `hist-${Date.now()}`,
                action: "signed",
                timestamp: new Date(),
                performedBy: contract.talentId,
                performedByName: signatureData.fullLegalName,
                details: `Electronically signed from IP: ${signatureData.ipAddress || "unknown"}`
              },
              {
                id: `hist-${Date.now() + 1}`,
                action: "executed",
                timestamp: new Date(),
                performedBy: "admin-1",
                performedByName: "Admin User",
                details: "Contract fully executed"
              }
            ],
            updatedAt: new Date()
          }
        }
        return contract
      }))
      
      toast.success("Contract signed successfully!")
    } catch (error) {
      toast.error("Failed to sign contract")
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  const requestRenewal = useCallback(async (contractId: string, renewalOption: string) => {
    setLoading(true)
    try {
      // Simulate renewal request
      await new Promise(resolve => setTimeout(resolve, 800))
      
      toast.success(`Renewal request sent: ${renewalOption}`)
    } catch (error) {
      toast.error("Failed to request renewal")
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  const deleteContract = useCallback(async (contractId: string) => {
    setLoading(true)
    try {
      // Simulate deletion
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setContracts(prev => prev.filter(c => c.id !== contractId))
      toast.success("Contract deleted successfully")
    } catch (error) {
      toast.error("Failed to delete contract")
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  const value: ContractsContextType = {
    contracts,
    getContractsByTalent,
    getContractById,
    getActiveContracts,
    getExpiringContracts,
    getPendingContracts,
    getExpiredContracts,
    getTotalContractValue,
    createContract,
    updateContract,
    uploadDocument,
    signContract,
    requestRenewal,
    deleteContract,
    loading
  }

  return (
    <ContractsContext.Provider value={value}>
      {children}
    </ContractsContext.Provider>
  )
}

export function useContracts() {
  const context = useContext(ContractsContext)
  if (!context) {
    throw new Error("useContracts must be used within ContractsProvider")
  }
  return context
}
