'use client'

import { useState, useCallback } from 'react'
import type { 
  AssetReviewData, 
  CheckStatus,
  CopyrightCheckData,
  AccessibilityCheckData,
  SEOCheckData,
  BrandComplianceCheckData,
  PerformanceCheckData,
  SecurityCheckData
} from '@/types/creative'
import { 
  runCopyrightCheck, 
  runAccessibilityCheck, 
  runSEOCheck,
  runBrandComplianceCheck,
  runPerformanceCheck,
  runSecurityCheck,
  runAllChecks
} from '@/lib/api/asset-checks'
import { toast } from 'sonner'

export type CheckType = 'copyright' | 'accessibility' | 'seo' | 'brandCompliance' | 'performance' | 'security'

interface UseAssetChecksReturn {
  reviewData: AssetReviewData | null
  checkStates: Record<CheckType, CheckStatus>
  runCheck: (checkType: CheckType, assetId: string, file?: File, brandId?: string) => Promise<void>
  runAllChecksAction: (assetId: string, file?: File, brandId?: string) => Promise<void>
  getCheckProgress: () => number
  isAnyChecking: boolean
}

export function useAssetChecks(initialData?: AssetReviewData): UseAssetChecksReturn {
  const [reviewData, setReviewData] = useState<AssetReviewData | null>(initialData || null)
  const [checkStates, setCheckStates] = useState<Record<CheckType, CheckStatus>>(() => {
    if (initialData) {
      return {
        copyright: initialData.copyright.status,
        accessibility: initialData.accessibility.status,
        seo: initialData.seo.status,
        brandCompliance: initialData.brandCompliance.status,
        performance: initialData.performance.status,
        security: initialData.security.status,
      }
    }
    return {
      copyright: 'not-started',
      accessibility: 'not-started',
      seo: 'not-started',
      brandCompliance: 'not-started',
      performance: 'not-started',
      security: 'not-started',
    }
  })

  const isAnyChecking = Object.values(checkStates).some(status => status === 'checking')

  // Run a single check
  const runCheck = useCallback(async (
    checkType: CheckType,
    assetId: string,
    file?: File,
    brandId?: string
  ) => {
    // Update status to checking
    setCheckStates(prev => ({ ...prev, [checkType]: 'checking' }))

    try {
      switch (checkType) {
        case 'copyright': {
          const checkData = await runCopyrightCheck(assetId, file)
          setReviewData(prev => prev ? {
            ...prev,
            copyright: { status: 'completed', data: checkData },
            checksCompleted: prev.checksCompleted + (prev.copyright.status === 'completed' ? 0 : 1)
          } : null)
          break
        }
          
        case 'accessibility': {
          const checkData = await runAccessibilityCheck(assetId, file)
          setReviewData(prev => prev ? {
            ...prev,
            accessibility: { status: 'completed', data: checkData },
            checksCompleted: prev.checksCompleted + (prev.accessibility.status === 'completed' ? 0 : 1)
          } : null)
          break
        }
          
        case 'seo': {
          const checkData = await runSEOCheck(assetId, file)
          setReviewData(prev => prev ? {
            ...prev,
            seo: { status: 'completed', data: checkData },
            checksCompleted: prev.checksCompleted + (prev.seo.status === 'completed' ? 0 : 1)
          } : null)
          break
        }
          
        case 'brandCompliance': {
          const checkData = await runBrandComplianceCheck(assetId, file, brandId || '')
          setReviewData(prev => prev ? {
            ...prev,
            brandCompliance: { status: 'completed', data: checkData },
            checksCompleted: prev.checksCompleted + (prev.brandCompliance.status === 'completed' ? 0 : 1)
          } : null)
          break
        }
          
        case 'performance': {
          const checkData = await runPerformanceCheck(assetId, file)
          setReviewData(prev => prev ? {
            ...prev,
            performance: { status: 'completed', data: checkData },
            checksCompleted: prev.checksCompleted + (prev.performance.status === 'completed' ? 0 : 1)
          } : null)
          break
        }
          
        case 'security': {
          const checkData = await runSecurityCheck(assetId, file)
          setReviewData(prev => prev ? {
            ...prev,
            security: { status: 'completed', data: checkData },
            checksCompleted: prev.checksCompleted + (prev.security.status === 'completed' ? 0 : 1)
          } : null)
          break
        }
      }

      setCheckStates(prev => ({ ...prev, [checkType]: 'completed' }))
      toast.success(`${checkType} check completed`)
    } catch (error) {
      setCheckStates(prev => ({ ...prev, [checkType]: 'failed' }))
      toast.error(`Failed to run ${checkType} check`)
      console.error(error)
    }
  }, [])

  // Run all checks
  const runAllChecksAction = useCallback(async (
    assetId: string,
    file?: File,
    brandId?: string
  ) => {
    // Update all statuses to checking
    setCheckStates({
      copyright: 'checking',
      accessibility: 'checking',
      seo: 'checking',
      brandCompliance: 'checking',
      performance: 'checking',
      security: 'checking',
    })

    try {
      const allData = await runAllChecks(assetId, file, brandId)
      
      setReviewData(allData)
      setCheckStates({
        copyright: 'completed',
        accessibility: 'completed',
        seo: 'completed',
        brandCompliance: 'completed',
        performance: 'completed',
        security: 'completed',
      })
      
      toast.success('All checks completed successfully')
    } catch (error) {
      setCheckStates({
        copyright: 'failed',
        accessibility: 'failed',
        seo: 'failed',
        brandCompliance: 'failed',
        performance: 'failed',
        security: 'failed',
      })
      toast.error('Failed to complete checks')
      console.error(error)
    }
  }, [])

  // Calculate check progress percentage
  const getCheckProgress = useCallback(() => {
    const completed = Object.values(checkStates).filter(s => s === 'completed').length
    return Math.round((completed / 6) * 100)
  }, [checkStates])

  return {
    reviewData,
    checkStates,
    runCheck,
    runAllChecksAction,
    getCheckProgress,
    isAnyChecking
  }
}
