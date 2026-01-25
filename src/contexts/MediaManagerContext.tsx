'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import type { 
  MediaManagerData, 
  LinkedAsset, 
  PromptData, 
  ReferenceItem, 
  AssignedCreator,
  TabId 
} from '@/types/mediaManager'

interface MediaManagerContextType {
  // State
  mediaData: MediaManagerData
  activeTab: TabId
  hasUnsavedChanges: boolean
  
  // Setters
  setActiveTab: (tab: TabId) => void
  updateAssets: (assets: LinkedAsset[]) => void
  updatePrompts: (prompts: PromptData) => void
  updateTraining: (training: LinkedAsset[]) => void
  updateReferences: (references: ReferenceItem[]) => void
  updateCreatorDNA: (creators: AssignedCreator[]) => void
  setMediaData: (data: MediaManagerData) => void
  resetMediaData: () => void
  markAsSaved: () => void
}

const MediaManagerContext = createContext<MediaManagerContextType | undefined>(undefined)

const getEmptyMediaData = (): MediaManagerData => ({
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
})

interface MediaManagerProviderProps {
  children: React.ReactNode
  taskId?: string
  initialData?: Partial<MediaManagerData>
}

export function MediaManagerProvider({ children, taskId, initialData }: MediaManagerProviderProps) {
  const [mediaData, setMediaDataState] = useState<MediaManagerData>(() => {
    // Try to restore from localStorage on mount
    if (typeof window !== 'undefined' && taskId) {
      const storageKey = `task-media-${taskId}`
      const stored = localStorage.getItem(storageKey)
      if (stored) {
        try {
          const parsed = JSON.parse(stored)
          // Convert date strings back to Date objects
          if (parsed.assets) {
            parsed.assets = parsed.assets.map((asset: LinkedAsset) => ({
              ...asset,
              uploadedAt: new Date(asset.uploadedAt)
            }))
          }
          if (parsed.creatorDNA) {
            parsed.creatorDNA = parsed.creatorDNA.map((creator: AssignedCreator) => ({
              ...creator,
              expirationDate: creator.expirationDate ? new Date(creator.expirationDate) : undefined
            }))
          }
          return { ...getEmptyMediaData(), ...parsed }
        } catch (e) {
          console.error('Failed to parse stored media data:', e)
        }
      }
    }
    
    // Use initial data if provided
    if (initialData) {
      return { ...getEmptyMediaData(), ...initialData }
    }
    
    return getEmptyMediaData()
  })
  
  const [activeTab, setActiveTab] = useState<TabId>('assets')
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [lastSaveTime, setLastSaveTime] = useState(Date.now())

  // Auto-save to localStorage every 30 seconds
  useEffect(() => {
    if (!taskId || !hasUnsavedChanges) return
    
    const autoSaveInterval = setInterval(() => {
      const storageKey = `task-media-${taskId}`
      try {
        localStorage.setItem(storageKey, JSON.stringify(mediaData))
        console.log('Media data auto-saved to localStorage')
      } catch (e) {
        console.error('Failed to auto-save media data:', e)
      }
    }, 30000) // 30 seconds
    
    return () => clearInterval(autoSaveInterval)
  }, [taskId, mediaData, hasUnsavedChanges])

  // Mark as having unsaved changes when data changes
  useEffect(() => {
    // Skip initial render
    if (Date.now() - lastSaveTime < 1000) return
    setHasUnsavedChanges(true)
  }, [mediaData, lastSaveTime])

  const setMediaData = useCallback((data: MediaManagerData) => {
    setMediaDataState(data)
  }, [])

  const updateAssets = useCallback((assets: LinkedAsset[]) => {
    setMediaDataState(prev => ({ ...prev, assets }))
  }, [])

  const updatePrompts = useCallback((prompts: PromptData) => {
    setMediaDataState(prev => ({ ...prev, prompts }))
  }, [])

  const updateTraining = useCallback((training: LinkedAsset[]) => {
    setMediaDataState(prev => ({ ...prev, training }))
  }, [])

  const updateReferences = useCallback((references: ReferenceItem[]) => {
    setMediaDataState(prev => ({ ...prev, references }))
  }, [])

  const updateCreatorDNA = useCallback((creators: AssignedCreator[]) => {
    setMediaDataState(prev => ({ ...prev, creatorDNA: creators }))
  }, [])

  const resetMediaData = useCallback(() => {
    setMediaDataState(getEmptyMediaData())
    setHasUnsavedChanges(false)
    
    // Clear from localStorage
    if (taskId) {
      const storageKey = `task-media-${taskId}`
      localStorage.removeItem(storageKey)
    }
  }, [taskId])

  const markAsSaved = useCallback(() => {
    setHasUnsavedChanges(false)
    setLastSaveTime(Date.now())
    
    // Save to localStorage
    if (taskId) {
      const storageKey = `task-media-${taskId}`
      try {
        localStorage.setItem(storageKey, JSON.stringify(mediaData))
      } catch (e) {
        console.error('Failed to save media data:', e)
      }
    }
  }, [taskId, mediaData])

  const value: MediaManagerContextType = {
    mediaData,
    activeTab,
    hasUnsavedChanges,
    setActiveTab,
    updateAssets,
    updatePrompts,
    updateTraining,
    updateReferences,
    updateCreatorDNA,
    setMediaData,
    resetMediaData,
    markAsSaved
  }

  return (
    <MediaManagerContext.Provider value={value}>
      {children}
    </MediaManagerContext.Provider>
  )
}

export function useMediaManager() {
  const context = useContext(MediaManagerContext)
  if (context === undefined) {
    throw new Error('useMediaManager must be used within a MediaManagerProvider')
  }
  return context
}

/**
 * Utility function to clear media data from localStorage
 */
export function clearMediaDataFromStorage(taskId: string) {
  if (typeof window !== 'undefined') {
    const storageKey = `task-media-${taskId}`
    localStorage.removeItem(storageKey)
  }
}

/**
 * Utility function to get media data from localStorage
 */
export function getMediaDataFromStorage(taskId: string): MediaManagerData | null {
  if (typeof window === 'undefined') return null
  
  const storageKey = `task-media-${taskId}`
  const stored = localStorage.getItem(storageKey)
  if (!stored) return null
  
  try {
    const parsed = JSON.parse(stored)
    // Convert date strings back to Date objects
    if (parsed.assets) {
      parsed.assets = parsed.assets.map((asset: LinkedAsset) => ({
        ...asset,
        uploadedAt: new Date(asset.uploadedAt)
      }))
    }
    if (parsed.creatorDNA) {
      parsed.creatorDNA = parsed.creatorDNA.map((creator: AssignedCreator) => ({
        ...creator,
        expirationDate: creator.expirationDate ? new Date(creator.expirationDate) : undefined
      }))
    }
    return parsed
  } catch (e) {
    console.error('Failed to parse stored media data:', e)
    return null
  }
}
