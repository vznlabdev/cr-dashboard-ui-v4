import { useState, useCallback, useMemo } from "react"
import { toast } from "sonner"

// Promise-returning debounce function
function debounce<T extends (...args: any[]) => Promise<any>>(
  func: T,
  wait: number
): (...args: Parameters<T>) => Promise<ReturnType<T>> {
  let timeout: NodeJS.Timeout | null = null
  let pendingResolve: ((value: any) => void) | null = null
  let pendingReject: ((error: any) => void) | null = null
  
  return function executedFunction(...args: Parameters<T>): Promise<ReturnType<T>> {
    return new Promise((resolve, reject) => {
      // Clear previous timeout and reject previous promise
      if (timeout) {
        clearTimeout(timeout)
        if (pendingReject) {
          pendingReject(new Error('Debounced call superseded'))
        }
      }
      
      // Store resolve/reject for later
      pendingResolve = resolve
      pendingReject = reject
      
      timeout = setTimeout(async () => {
        timeout = null
        try {
          const result = await func(...args)
          if (pendingResolve) {
            pendingResolve(result)
          }
        } catch (error) {
          if (pendingReject) {
            pendingReject(error)
          }
        } finally {
          pendingResolve = null
          pendingReject = null
        }
      }, wait)
    })
  }
}

// Helper to update nested object paths
function setNestedValue(obj: any, path: string, value: any): any {
  // Guard against null/undefined
  if (!obj || typeof obj !== 'object') {
    return obj
  }
  
  const keys = path.split('.')
  const result = { ...obj }
  let current = result
  
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i]
    current[key] = { ...current[key] }
    current = current[key]
  }
  
  current[keys[keys.length - 1]] = value
  return result
}

interface UseAssetAutoSaveOptions {
  onUpdate?: (updatedAsset: any) => void
  debounceMs?: number
}

export function useAssetAutoSave(
  assetId: string,
  currentAsset: any,
  options: UseAssetAutoSaveOptions = {}
) {
  const { onUpdate, debounceMs = 1000 } = options
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [pendingChanges, setPendingChanges] = useState<Record<string, any>>({})
  
  const saveField = useCallback(async (fieldPath: string, newValue: any) => {
    setIsSaving(true)
    try {
      // Simulate API call - In production, this would be:
      // await fetch(`/api/assets/${assetId}`, {
      //   method: 'PATCH',
      //   body: JSON.stringify({ [fieldPath]: newValue })
      // })
      
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Update local state optimistically
      const updatedAsset = setNestedValue(currentAsset, fieldPath, newValue)
      onUpdate?.(updatedAsset)
      
      setLastSaved(new Date())
      setPendingChanges(prev => {
        const { [fieldPath]: _, ...rest } = prev
        return rest
      })
      
      toast.success("Saved", { duration: 1500 })
    } catch (error) {
      console.error('Failed to save:', error)
      toast.error("Failed to save changes")
      throw error
    } finally {
      setIsSaving(false)
    }
  }, [assetId, currentAsset, onUpdate])
  
  // Debounced save for auto-save behavior
  const debouncedSave = useMemo(
    () => debounce(saveField, debounceMs),
    [saveField, debounceMs]
  )
  
  // Immediate save for manual triggers
  const saveImmediately = useCallback(async (fieldPath: string, newValue: any) => {
    return saveField(fieldPath, newValue)
  }, [saveField])
  
  // Track pending changes
  const trackChange = useCallback((fieldPath: string, newValue: any) => {
    setPendingChanges(prev => ({ ...prev, [fieldPath]: newValue }))
  }, [])
  
  const hasPendingChanges = Object.keys(pendingChanges).length > 0
  
  return { 
    saveField: debouncedSave, 
    saveImmediately,
    trackChange,
    isSaving, 
    lastSaved,
    hasPendingChanges
  }
}
