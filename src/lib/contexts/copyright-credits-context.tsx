'use client'

import { createContext, useContext, useState, useCallback, ReactNode, useMemo } from 'react'
import type { CopyrightCheckCredits } from '@/types'
import { toast } from 'sonner'

interface CopyrightCreditsContextType {
  credits: CopyrightCheckCredits | null
  hasCredits: boolean
  canRunCheck: () => boolean
  useCredit: () => Promise<void>
  purchaseCredits: (amount: number) => Promise<void>
  getTotalAvailable: () => number
}

const CopyrightCreditsContext = createContext<CopyrightCreditsContextType | undefined>(undefined)

export function CopyrightCreditsProvider({ 
  children,
  initialCredits 
}: { 
  children: ReactNode
  initialCredits?: CopyrightCheckCredits | null
}) {
  const [credits, setCredits] = useState<CopyrightCheckCredits | null>(initialCredits || null)

  // Calculate total available credits (quota + additional)
  const getTotalAvailable = useCallback(() => {
    if (!credits) return 0
    return credits.quotaRemaining + credits.additionalCredits
  }, [credits])

  // Check if credits are available
  const hasCredits = useMemo(() => {
    return getTotalAvailable() > 0
  }, [getTotalAvailable])

  // Check if we can run a copyright check
  const canRunCheck = useCallback(() => {
    return getTotalAvailable() > 0
  }, [getTotalAvailable])

  // Use one credit
  const useCredit = useCallback(async () => {
    if (!credits) {
      throw new Error('No credit system configured')
    }

    if (!canRunCheck()) {
      throw new Error('No credits available')
    }

    // Use quota first, then additional credits
    setCredits((prev) => {
      if (!prev) return null

      if (prev.quotaRemaining > 0) {
        return {
          ...prev,
          quotaUsed: prev.quotaUsed + 1,
          quotaRemaining: prev.quotaRemaining - 1,
        }
      } else if (prev.additionalCredits > 0) {
        return {
          ...prev,
          additionalCredits: prev.additionalCredits - 1,
        }
      }

      return prev
    })

    // INTEGRATION POINT: Call API to deduct credit
    // await fetch('/api/copyright/credits/use', { method: 'POST' })
  }, [credits, canRunCheck])

  // Purchase additional credits
  const purchaseCredits = useCallback(async (amount: number) => {
    if (!credits) {
      throw new Error('No credit system configured')
    }

    // INTEGRATION POINT: Call API to purchase credits
    // const response = await fetch('/api/copyright/credits/purchase', {
    //   method: 'POST',
    //   body: JSON.stringify({ amount })
    // })

    // Simulate purchase
    await new Promise(resolve => setTimeout(resolve, 1000))

    setCredits((prev) => {
      if (!prev) return null
      return {
        ...prev,
        additionalCredits: prev.additionalCredits + amount,
      }
    })

    toast.success(`Purchased ${amount} copyright check credits`)
  }, [credits])

  const value: CopyrightCreditsContextType = {
    credits,
    hasCredits,
    canRunCheck,
    useCredit,
    purchaseCredits,
    getTotalAvailable,
  }

  return (
    <CopyrightCreditsContext.Provider value={value}>
      {children}
    </CopyrightCreditsContext.Provider>
  )
}

export function useCopyrightCredits() {
  const context = useContext(CopyrightCreditsContext)
  if (context === undefined) {
    throw new Error('useCopyrightCredits must be used within a CopyrightCreditsProvider')
  }
  return context
}
