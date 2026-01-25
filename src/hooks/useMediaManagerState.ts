'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import type { MediaManagerData } from '@/types/mediaManager'

/**
 * Custom hook for managing Media Manager state with auto-save
 * 
 * Features:
 * - Auto-saves to localStorage every 30 seconds
 * - Loads from localStorage on mount
 * - Warns user about unsaved changes on browser close
 * - Provides methods to save, clear, and reset
 * 
 * @param taskId - Unique identifier for the task (use 'new' for new tasks)
 * @param initialData - Initial media data
 * @returns Media manager state and control functions
 */
export function useMediaManagerState(
  taskId: string,
  initialData?: MediaManagerData
) {
  const [mediaData, setMediaDataState] = useState<MediaManagerData>(() => {
    // Try to load from localStorage on mount
    if (typeof window !== 'undefined') {
      const storageKey = `media-manager-${taskId}`
      const stored = localStorage.getItem(storageKey)
      
      if (stored) {
        try {
          const parsed = JSON.parse(stored)
          // Convert date strings back to Date objects
          if (parsed.assets) {
            parsed.assets = parsed.assets.map((asset: any) => ({
              ...asset,
              uploadedAt: new Date(asset.uploadedAt)
            }))
          }
          if (parsed.creatorDNA) {
            parsed.creatorDNA = parsed.creatorDNA.map((creator: any) => ({
              ...creator,
              expirationDate: creator.expirationDate ? new Date(creator.expirationDate) : undefined
            }))
          }
          return parsed
        } catch (e) {
          console.error('Failed to parse stored media data:', e)
        }
      }
    }
    
    // Return initial data or empty structure
    return initialData || getEmptyMediaData()
  })

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [lastSaveTime, setLastSaveTime] = useState(Date.now())
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Get storage key
  const getStorageKey = useCallback(() => `media-manager-${taskId}`, [taskId])

  // Save to localStorage
  const saveToLocal = useCallback(() => {
    if (typeof window === 'undefined') return
    
    const storageKey = getStorageKey()
    try {
      localStorage.setItem(storageKey, JSON.stringify(mediaData))
      setHasUnsavedChanges(false)
      setLastSaveTime(Date.now())
      return true
    } catch (e) {
      console.error('Failed to save media data to localStorage:', e)
      return false
    }
  }, [mediaData, getStorageKey])

  // Clear from localStorage
  const clearLocal = useCallback(() => {
    if (typeof window === 'undefined') return
    
    const storageKey = getStorageKey()
    localStorage.removeItem(storageKey)
    setHasUnsavedChanges(false)
  }, [getStorageKey])

  // Reset to initial state
  const resetToInitial = useCallback(() => {
    setMediaDataState(initialData || getEmptyMediaData())
    clearLocal()
    setHasUnsavedChanges(false)
  }, [initialData, clearLocal])

  // Set media data (tracks changes)
  const setMediaData = useCallback((data: MediaManagerData | ((prev: MediaManagerData) => MediaManagerData)) => {
    setMediaDataState(prev => {
      const newData = typeof data === 'function' ? data(prev) : data
      // Mark as having unsaved changes
      setHasUnsavedChanges(true)
      return newData
    })
  }, [])

  // Auto-save effect
  useEffect(() => {
    if (!hasUnsavedChanges) return

    // Set up auto-save timer (30 seconds)
    autoSaveTimerRef.current = setTimeout(() => {
      const saved = saveToLocal()
      if (saved) {
        console.log('[MediaManager] Auto-saved to localStorage')
      }
    }, 30000) // 30 seconds

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current)
      }
    }
  }, [hasUnsavedChanges, saveToLocal, mediaData])

  // Warn on browser close/refresh
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault()
        e.returnValue = 'You have unsaved media changes. Are you sure you want to leave?'
        return e.returnValue
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [hasUnsavedChanges])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Final save on unmount if there are unsaved changes
      if (hasUnsavedChanges && typeof window !== 'undefined') {
        const storageKey = `media-manager-${taskId}`
        try {
          localStorage.setItem(storageKey, JSON.stringify(mediaData))
        } catch (e) {
          console.error('Failed to save on unmount:', e)
        }
      }
    }
  }, []) // Only on unmount

  return {
    mediaData,
    setMediaData,
    hasUnsavedChanges,
    saveToLocal,
    clearLocal,
    resetToInitial,
    lastSaveTime
  }
}

/**
 * Get empty media data structure
 */
function getEmptyMediaData(): MediaManagerData {
  return {
    assets: [],
    prompts: {
      text: '',
      saveToLibrary: false,
      title: undefined,
      tags: undefined,
      isPrivate: true
    },
    training: [],
    references: [],
    creatorDNA: []
  }
}
