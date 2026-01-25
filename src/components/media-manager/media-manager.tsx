'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { X, Link2, Upload, Check, AlertCircle, XCircle, Trash2, Search, Filter, Image as ImageIcon, Video, FileText, Star, Copy, ChevronDown, Bold, Italic, Code, List as ListIcon, Lock, Users, Folder, GripVertical, ExternalLink, Plus, User, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { AssetLibraryPicker } from '@/components/AssetLibraryPicker'
import { PersonaLibraryPicker } from '@/components/PersonaLibraryPicker'
import { PromptSuggestions } from '@/components/PromptSuggestions'

// Import mock personas from centralized mock data
import { MOCK_PERSONA_LIBRARY } from '@/lib/mockData/personaLibrary'
import { MOCK_ASSET_LIBRARY } from '@/lib/mockData'

type CreationMethod = 'human-made' | 'ai-generated' | 'ai-enhanced'

type TabId = 'assets' | 'prompts' | 'training' | 'references' | 'creator-dna'

type ClearanceStatus = 'cleared' | 'pending' | 'uncleared'

interface TabConfig {
  id: TabId
  label: string
  required: boolean
  disabled: boolean
  tooltip?: string
}

type AuthorizationStatus = 'authorized' | 'expires-soon' | 'expired' | 'pending'

interface NilpComponents {
  name: boolean
  image: boolean
  likeness: boolean
  personality: boolean
}

interface Asset {
  id: string
  name: string
  type: 'image' | 'video' | 'pdf' | 'design' | 'other'
  size: string
  clearanceStatus: ClearanceStatus
  uploadedAt: string
  thumbnail?: string
}

interface Reference {
  id: string
  type: 'asset' | 'upload' | 'url'
  filename?: string
  url?: string
  thumbnailUrl?: string
  fileSize?: number
  notes?: string
  order: number
}

interface Persona {
  id: string
  name: string
  avatarUrl: string
  nilpId: string // e.g., CR-2025-00147
  authorizationStatus: AuthorizationStatus
  expirationDate?: Date
  role?: string
  nilpComponents: NilpComponents
}

interface AssignedCreatorInternal {
  persona: Persona
  role?: string // Voice Actor, Model, Brand Ambassador, etc.
  nilpComponents: NilpComponents
}

// Adapt AssignedCreator from mock data to internal Persona format
const MOCK_PERSONAS: Persona[] = MOCK_PERSONA_LIBRARY.map(creator => ({
  id: creator.id,
  name: creator.name,
  avatarUrl: creator.avatarUrl || '/placeholder.svg',
  nilpId: creator.nilpId,
  authorizationStatus: creator.authorizationStatus,
  expirationDate: creator.expirationDate,
  role: creator.role,
  nilpComponents: creator.nilpComponents
}))

const CREATOR_ROLES = [
  'Voice Actor',
  'Model',
  'Brand Ambassador',
  'Spokesperson',
  'Influencer',
  'Character Voice',
  'Narrator',
  'Actor',
  'Other'
]

interface MediaManagerProps {
  isOpen: boolean
  onClose: () => void
  creationMethod: CreationMethod
  taskId?: string
  onSave: (data: any) => void
  creativeType?: string
  toolUsed?: string
  intendedUse?: string
}

export function MediaManager({
  isOpen,
  onClose,
  creationMethod,
  taskId,
  onSave,
  creativeType,
  toolUsed,
  intendedUse
}: MediaManagerProps) {
  const [activeTab, setActiveTab] = useState<TabId>('assets')
  
  // Assets tab state
  const [linkedAssets, setLinkedAssets] = useState<Asset[]>([])
  const [showAssetLibrary, setShowAssetLibrary] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  // Prompts tab state
  const [promptText, setPromptText] = useState('')
  const [saveToLibrary, setSaveToLibrary] = useState(false)
  const [promptTitle, setPromptTitle] = useState('')
  const [promptTags, setPromptTags] = useState<string[]>([])
  const [isPrivate, setIsPrivate] = useState(true)
  const [showPromptHistory, setShowPromptHistory] = useState(false)

  // Training tab state
  const [trainingData, setTrainingData] = useState<Asset[]>([])
  const [showTrainingPicker, setShowTrainingPicker] = useState(false)

  // References tab state
  const [references, setReferences] = useState<Reference[]>([])
  const [showReferenceLibraryPicker, setShowReferenceLibraryPicker] = useState(false)
  const [showUrlInput, setShowUrlInput] = useState(false)
  const [urlInputValue, setUrlInputValue] = useState('')
  const [uploadingReference, setUploadingReference] = useState(false)
  const [uploadReferenceProgress, setUploadReferenceProgress] = useState(0)
  const [expandedNotes, setExpandedNotes] = useState<Set<string>>(new Set())

  // Creator DNA tab state
  const [assignedCreators, setAssignedCreators] = useState<AssignedCreatorInternal[]>([])
  const [showPersonaPicker, setShowPersonaPicker] = useState(false)
  const [showCreatePersona, setShowCreatePersona] = useState(false)
  const [expandedNilpComponents, setExpandedNilpComponents] = useState<Set<string>>(new Set())
  const [newPersonaName, setNewPersonaName] = useState('')
  const [newPersonaAuthDoc, setNewPersonaAuthDoc] = useState<File | null>(null)

  // Get tab configuration based on creation method
  const getTabConfig = (): TabConfig[] => {
    const baseConfig: TabConfig[] = [
      { id: 'assets', label: 'Assets', required: false, disabled: false },
      { id: 'prompts', label: 'Prompts', required: false, disabled: false },
      { id: 'training', label: 'Training', required: false, disabled: false },
      { id: 'references', label: 'References', required: false, disabled: false },
      { id: 'creator-dna', label: 'Creator DNA', required: true, disabled: false }
    ]

    switch (creationMethod) {
      case 'human-made':
        return baseConfig.map(tab => ({
          ...tab,
          required: tab.id === 'assets' || tab.id === 'creator-dna',
          tooltip: tab.id === 'prompts' || tab.id === 'training' 
            ? 'Not typically used for human-made content' 
            : undefined
        }))
      
      case 'ai-generated':
        return baseConfig.map(tab => ({
          ...tab,
          required: tab.id === 'prompts' || tab.id === 'training' || tab.id === 'creator-dna',
          tooltip: tab.id === 'assets' 
            ? 'Not typically used for AI-generated content' 
            : undefined
        }))
      
      case 'ai-enhanced':
        return baseConfig.map(tab => ({
          ...tab,
          required: tab.id === 'assets' || tab.id === 'prompts' || tab.id === 'creator-dna',
          tooltip: tab.id === 'training' 
            ? 'Not typically used for AI-enhanced content' 
            : undefined
        }))
      
      default:
        return baseConfig
    }
  }

  const tabs = getTabConfig()

  // Check if tab has content
  const hasContent = (tabId: TabId): boolean => {
    switch (tabId) {
      case 'assets':
        return linkedAssets.length > 0
      case 'prompts':
        return promptText.trim().length > 0
      case 'training':
        return trainingData.length > 0
      case 'references':
        return references.length > 0
      case 'creator-dna':
        return assignedCreators.length > 0
      default:
        return false
    }
  }

  // Handle save
  const handleSave = () => {
    // Basic validation
    const requiredTabs = tabs.filter(t => t.required)
    const missingTabs = requiredTabs.filter(t => !hasContent(t.id))
    
    if (missingTabs.length > 0) {
      toast.error(`Please complete required tabs: ${missingTabs.map(t => t.label).join(', ')}`)
      return
    }

    // Validate Creator DNA (always required)
    if (assignedCreators.length === 0) {
      toast.error('Please assign at least one creator/persona')
      setActiveTab('creator-dna')
      return
    }

    // Collect all data
    const mediaData = {
      assets: linkedAssets,
      prompts: {
        text: promptText,
        saveToLibrary,
        title: saveToLibrary ? promptTitle : undefined,
        tags: saveToLibrary ? promptTags : undefined,
        isPrivate
      },
      training: trainingData,
      references: references,
      creatorDNA: assignedCreators.map(ac => ({
        id: ac.persona.id,
        name: ac.persona.name,
        nilpId: ac.persona.nilpId,
        avatarUrl: ac.persona.avatarUrl,
        authorizationStatus: ac.persona.authorizationStatus,
        expirationDate: ac.persona.expirationDate,
        role: ac.role,
        nilpComponents: ac.nilpComponents
      }))
    }

    onSave(mediaData)
    onClose()
    toast.success('Media data saved')
  }

  // ========== ASSETS TAB HANDLERS ==========
  
  const handleLinkAssets = (selectedAssets: any[]) => {
    // Filter out already linked assets
    const newAssets = selectedAssets.filter(a => !linkedAssets.find(la => la.id === a.id))
    setLinkedAssets([...linkedAssets, ...newAssets])
    setShowAssetLibrary(false)
    toast.success(`${newAssets.length} asset${newAssets.length > 1 ? 's' : ''} linked`)
  }

  const handleRemoveAsset = (assetId: string) => {
    setLinkedAssets(linkedAssets.filter(a => a.id !== assetId))
    toast.success('Asset unlinked')
  }

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return

    setUploading(true)
    setUploadProgress(0)

    // Simulate upload
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 100))
      setUploadProgress(i)
    }

    // Add uploaded files as assets
    const newAssets: Asset[] = Array.from(files).map((file, index) => ({
      id: `upload-${Date.now()}-${index}`,
      name: file.name,
      type: file.type.startsWith('image/') ? 'image' : 
            file.type.startsWith('video/') ? 'video' :
            file.type.includes('pdf') ? 'pdf' : 'other',
      size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
      clearanceStatus: 'pending' as ClearanceStatus,
      uploadedAt: new Date().toISOString(),
      thumbnail: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined
    }))

    setLinkedAssets([...linkedAssets, ...newAssets])
    setUploading(false)
    setUploadProgress(0)
    toast.success(`${files.length} file${files.length > 1 ? 's' : ''} uploaded`)
  }

  // ========== TRAINING TAB HANDLERS ==========

  const handleLinkTrainingData = (selectedDatasets: any[]) => {
    const newData = selectedDatasets.filter(d => !trainingData.find(td => td.id === d.id))
    setTrainingData([...trainingData, ...newData])
    setShowTrainingPicker(false)
    toast.success(`${newData.length} dataset${newData.length > 1 ? 's' : ''} linked`)
  }

  const handleRemoveTrainingData = (dataId: string) => {
    setTrainingData(trainingData.filter(d => d.id !== dataId))
    toast.success('Training data unlinked')
  }

  // ========== REFERENCES TAB HANDLERS ==========

  const handleLinkReferenceAssets = (selectedAssets: any[]) => {
    const newReferences: Reference[] = selectedAssets
      .filter(a => !references.find(r => r.id === a.id))
      .map(asset => ({
        id: asset.id,
        type: 'asset' as const,
        filename: asset.filename,
        thumbnailUrl: asset.thumbnailUrl,
        fileSize: asset.fileSize,
        notes: '',
        order: references.length + selectedAssets.indexOf(asset)
      }))
    
    setReferences([...references, ...newReferences])
    setShowReferenceLibraryPicker(false)
    toast.success(`${newReferences.length} reference${newReferences.length > 1 ? 's' : ''} added`)
  }

  const handleUploadReference = async (files: FileList | null) => {
    if (!files || files.length === 0) return

    setUploadingReference(true)
    setUploadReferenceProgress(0)

    // Simulate upload
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 80))
      setUploadReferenceProgress(i)
    }

    const newReferences: Reference[] = Array.from(files).map((file, index) => ({
      id: `ref-upload-${Date.now()}-${index}`,
      type: 'upload' as const,
      filename: file.name,
      thumbnailUrl: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
      fileSize: file.size,
      notes: '',
      order: references.length + index
    }))

    setReferences([...references, ...newReferences])
    setUploadingReference(false)
    setUploadReferenceProgress(0)
    toast.success(`${files.length} reference${files.length > 1 ? 's' : ''} uploaded`)
  }

  const handleAddUrlReference = () => {
    if (!urlInputValue.trim()) return

    const newReference: Reference = {
      id: `ref-url-${Date.now()}`,
      type: 'url',
      url: urlInputValue.trim(),
      filename: new URL(urlInputValue).hostname,
      thumbnailUrl: 'https://picsum.photos/200/200?random=' + Date.now(),
      notes: '',
      order: references.length
    }

    setReferences([...references, newReference])
    setUrlInputValue('')
    setShowUrlInput(false)
    toast.success('URL reference added')
  }

  const handleRemoveReference = (refId: string) => {
    setReferences(references.filter(r => r.id !== refId))
    toast.success('Reference removed')
  }

  const handleUpdateReferenceNotes = (refId: string, notes: string) => {
    setReferences(references.map(r => r.id === refId ? { ...r, notes } : r))
  }

  const handleMoveReference = (refId: string, direction: 'up' | 'down') => {
    const index = references.findIndex(r => r.id === refId)
    if (index === -1) return
    if (direction === 'up' && index === 0) return
    if (direction === 'down' && index === references.length - 1) return

    const newReferences = [...references]
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    ;[newReferences[index], newReferences[targetIndex]] = [newReferences[targetIndex], newReferences[index]]
    
    // Update order
    newReferences.forEach((ref, idx) => ref.order = idx)
    setReferences(newReferences)
  }

  // ========== CREATOR DNA TAB HANDLERS ==========

  const handleAssignPersonas = (selectedPersonas: any[]) => {
    const newAssignments: AssignedCreatorInternal[] = selectedPersonas
      .filter(persona => !assignedCreators.find(ac => ac.persona.id === persona.id))
      .map(persona => ({
        persona: {
          id: persona.id,
          name: persona.name,
          avatarUrl: persona.avatarUrl || '/placeholder.svg',
          nilpId: persona.nilpId,
          authorizationStatus: persona.authorizationStatus,
          expirationDate: persona.expirationDate,
          role: persona.role,
          nilpComponents: persona.nilpComponents
        },
        role: persona.role,
        nilpComponents: persona.nilpComponents
      }))
    
    setAssignedCreators([...assignedCreators, ...newAssignments])
    setShowPersonaPicker(false)
    toast.success(`${newAssignments.length} creator${newAssignments.length > 1 ? 's' : ''} assigned`)
  }

  const handleRemoveCreator = (personaId: string) => {
    setAssignedCreators(assignedCreators.filter(ac => ac.persona.id !== personaId))
    toast.success('Creator removed')
  }

  const handleUpdateCreatorRole = (personaId: string, role: string) => {
    setAssignedCreators(assignedCreators.map(ac => 
      ac.persona.id === personaId ? { ...ac, role } : ac
    ))
  }

  const toggleNilpComponent = (personaId: string, component: keyof NilpComponents) => {
    setAssignedCreators(assignedCreators.map(ac => 
      ac.persona.id === personaId 
        ? { ...ac, nilpComponents: { ...ac.nilpComponents, [component]: !ac.nilpComponents[component] } }
        : ac
    ))
  }

  const handleCreatePersona = () => {
    if (!newPersonaName.trim()) return

    const nilpId = `CR-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 100000)).padStart(5, '0')}`
    
    const newPersona: Persona = {
      id: `persona-${Date.now()}`,
      name: newPersonaName.trim(),
      avatarUrl: '/placeholder.svg',
      nilpId,
      authorizationStatus: 'pending', // Always pending until admin approves
      expirationDate: undefined,
      role: undefined,
      nilpComponents: {
        name: true,
        image: true,
        likeness: true,
        personality: true
      }
    }

    const newAssignment: AssignedCreatorInternal = {
      persona: newPersona,
      role: undefined,
      nilpComponents: {
        name: true,
        image: true,
        likeness: true,
        personality: true
      }
    }

    setAssignedCreators([...assignedCreators, newAssignment])
    setNewPersonaName('')
    setNewPersonaAuthDoc(null)
    setShowCreatePersona(false)
    toast.success('Persona created and assigned')
  }

  // Get authorization status icon and color
  const getAuthStatusIcon = (status: AuthorizationStatus) => {
    switch (status) {
      case 'authorized':
        return <Check className="w-4 h-4 text-green-500" />
      case 'expires-soon':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />
      case 'expired':
        return <XCircle className="w-4 h-4 text-red-500" />
      case 'pending':
        return <Clock className="w-4 h-4 text-gray-500" />
    }
  }

  const getAuthStatusLabel = (status: AuthorizationStatus) => {
    switch (status) {
      case 'authorized': return 'Authorized'
      case 'expires-soon': return 'Expires Soon'
      case 'expired': return 'Expired'
      case 'pending': return 'Pending'
    }
  }

  const getAuthStatusColor = (status: AuthorizationStatus) => {
    switch (status) {
      case 'authorized': return 'text-green-600 dark:text-green-400'
      case 'expires-soon': return 'text-yellow-600 dark:text-yellow-400'
      case 'expired': return 'text-red-600 dark:text-red-400'
      case 'pending': return 'text-gray-600 dark:text-gray-400'
    }
  }

  // Check if there are authorization warnings
  const hasAuthWarnings = assignedCreators.some(ac => 
    ac.persona.authorizationStatus === 'expires-soon' ||
    ac.persona.authorizationStatus === 'expired' ||
    ac.persona.authorizationStatus === 'pending'
  )

  return (
    <>
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white dark:bg-[#0d0e14] border border-gray-200 dark:border-gray-800 p-0 w-full max-w-6xl max-h-[90vh] rounded-xl">
        <div className="flex flex-col h-full max-h-[90vh]">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex-shrink-0">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Media Manager - {creationMethod.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
            </h2>
            <button
              onClick={onClose}
              className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center gap-1 px-6 py-3 border-b border-gray-200 dark:border-gray-800 flex-shrink-0 overflow-x-auto">
            {tabs.map(tab => {
              const isActive = activeTab === tab.id
              const isRequired = tab.required
              const hasTabContent = hasContent(tab.id)
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "relative px-4 py-2 text-sm font-medium rounded-lg transition whitespace-nowrap",
                    isActive 
                      ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white" 
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800/50",
                    isRequired && "font-semibold",
                    tab.disabled && "opacity-50 cursor-not-allowed"
                  )}
                  disabled={tab.disabled}
                  title={tab.tooltip}
                >
                  <span className="flex items-center gap-2">
                    {tab.label}
                    {hasTabContent && (
                      <span className="w-2 h-2 rounded-full bg-blue-500" />
                    )}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === 'assets' && (
              <div className="space-y-4">
                {/* Two-Button Header */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowAssetLibrary(true)}
                    className="flex items-center gap-2 px-4 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                  >
                    <Link2 className="w-4 h-4" />
                    Link from Asset Library
                  </button>
                  
                  <label className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg cursor-pointer transition">
                    <Upload className="w-4 h-4" />
                    Upload New
                    <input
                      type="file"
                      multiple
                      accept="image/*,video/*,.pdf,.psd,.ai,.fig"
                      onChange={(e) => handleFileUpload(e.target.files)}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Upload Progress */}
                {uploading && (
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                      </div>
                      <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                        {uploadProgress}%
                      </span>
                    </div>
                  </div>
                )}

                {/* Linked Assets Display */}
                {linkedAssets.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <ImageIcon className="w-12 h-12 text-gray-300 dark:text-gray-700 mb-3" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      No assets linked. Link from library or upload new files.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {linkedAssets.map(asset => (
                      <div
                        key={asset.id}
                        className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                      >
                        {/* Thumbnail */}
                        {asset.thumbnail ? (
                          <img
                            src={asset.thumbnail}
                            alt={asset.name}
                            className="w-12 h-12 rounded object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                            <FileText className="w-6 h-6 text-gray-400" />
                          </div>
                        )}

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {asset.name}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs text-gray-500">{asset.size}</span>
                            <span className="text-xs text-gray-400">•</span>
                            <span className={cn(
                              "text-xs",
                              asset.clearanceStatus === 'cleared' && "text-green-600",
                              asset.clearanceStatus === 'pending' && "text-yellow-600",
                              asset.clearanceStatus === 'uncleared' && "text-red-600"
                            )}>
                              {asset.clearanceStatus === 'cleared' && '✓ Cleared'}
                              {asset.clearanceStatus === 'pending' && '⚠ Pending'}
                              {asset.clearanceStatus === 'uncleared' && '❌ Uncleared'}
                            </span>
                          </div>
                        </div>

                        {/* Remove Button */}
                        <button
                          onClick={() => handleRemoveAsset(asset.id)}
                          className="p-1.5 text-gray-400 hover:text-red-500 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'prompts' && (
              <div className="space-y-6">
                {/* Prompt Suggestions */}
                <PromptSuggestions
                  creativeType={creativeType}
                  toolUsed={toolUsed}
                  intendedUse={intendedUse}
                  onSelectPrompt={(text) => setPromptText(text)}
                />
                
                {/* Prompt Editor */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Prompt
                  </label>
                  <textarea
                    value={promptText}
                    onChange={(e) => setPromptText(e.target.value)}
                    placeholder="Enter your prompt here..."
                    rows={8}
                    className="w-full px-4 py-3 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                  />
                  {promptText.length > 500 && (
                    <p className="text-xs text-gray-500 mt-1">
                      {promptText.length} characters
                    </p>
                  )}
                </div>

                {/* Save to Library */}
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={saveToLibrary}
                      onChange={(e) => setSaveToLibrary(e.target.checked)}
                      className="rounded border-gray-300 dark:border-gray-600"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Save to Prompt Library for future use
                    </span>
                  </label>

                  {saveToLibrary && (
                    <div className="space-y-3 pt-2">
                      <input
                        type="text"
                        value={promptTitle}
                        onChange={(e) => setPromptTitle(e.target.value)}
                        placeholder="Prompt Title"
                        className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      />

                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isPrivate}
                          onChange={(e) => setIsPrivate(e.target.checked)}
                          className="rounded border-gray-300 dark:border-gray-600"
                        />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Private (only visible to your team)
                        </span>
                      </label>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'training' && (
              <div className="space-y-4">
                {/* Single Button */}
                <button
                  onClick={() => setShowTrainingPicker(true)}
                  className="flex items-center gap-2 px-4 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                >
                  <Link2 className="w-4 h-4" />
                  Link Training Datasets from Asset Library
                </button>

                {/* Helper Text */}
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Training data must be cleared assets to ensure compliance.
                </p>

                {/* Linked Training Data */}
                {trainingData.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Folder className="w-12 h-12 text-gray-300 dark:text-gray-700 mb-3" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      No training data linked. Link cleared datasets from your Asset Library.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    {trainingData.map(dataset => (
                      <div
                        key={dataset.id}
                        className="relative p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                      >
                        <button
                          onClick={() => handleRemoveTrainingData(dataset.id)}
                          className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-500 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        
                        <div className="pr-8">
                          <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                            {dataset.name}
                          </p>
                          <p className="text-xs text-gray-500">{dataset.size}</p>
                          <div className="flex items-center gap-1 mt-2">
                            <Check className="w-3 h-3 text-green-500" />
                            <span className="text-xs text-green-600">Cleared</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'references' && (
              <div className="space-y-4">
                {/* Three-Button Header */}
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => setShowReferenceLibraryPicker(true)}
                    className="flex items-center gap-2 px-4 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                  >
                    <Link2 className="w-4 h-4" />
                    Link from Asset Library
                  </button>
                  
                  <label className="flex items-center gap-2 px-4 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition">
                    <Upload className="w-4 h-4" />
                    Upload Reference Files
                    <input
                      type="file"
                      multiple
                      accept="image/*,.pdf"
                      onChange={(e) => handleUploadReference(e.target.files)}
                      className="hidden"
                    />
                  </label>

                  <button
                    onClick={() => setShowUrlInput(!showUrlInput)}
                    className="flex items-center gap-2 px-4 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                  >
                    <Plus className="w-4 h-4" />
                    Add URL Reference
                  </button>
                </div>

                {/* URL Input */}
                {showUrlInput && (
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={urlInputValue}
                      onChange={(e) => setUrlInputValue(e.target.value)}
                      placeholder="https://example.com/reference"
                      className="flex-1 px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      onKeyDown={(e) => e.key === 'Enter' && handleAddUrlReference()}
                    />
                    <button
                      onClick={handleAddUrlReference}
                      className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                    >
                      Add
                    </button>
                  </div>
                )}

                {/* Upload Progress */}
                {uploadingReference && (
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all"
                            style={{ width: `${uploadReferenceProgress}%` }}
                          />
                        </div>
                      </div>
                      <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                        {uploadReferenceProgress}%
                      </span>
                    </div>
                  </div>
                )}

                {/* References List */}
                {references.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Star className="w-12 h-12 text-gray-300 dark:text-gray-700 mb-3" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Add reference materials, inspiration images, or style guides.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {references.map((ref, index) => (
                      <div
                        key={ref.id}
                        className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-2"
                      >
                        <div className="flex items-start gap-3">
                          {/* Reorder Buttons */}
                          <div className="flex flex-col gap-1">
                            <button
                              onClick={() => handleMoveReference(ref.id, 'up')}
                              disabled={index === 0}
                              className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                              <ChevronDown className="w-4 h-4 rotate-180" />
                            </button>
                            <button
                              onClick={() => handleMoveReference(ref.id, 'down')}
                              disabled={index === references.length - 1}
                              className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                              <ChevronDown className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Thumbnail */}
                          {ref.thumbnailUrl ? (
                            <img
                              src={ref.thumbnailUrl}
                              alt={ref.filename || ref.url}
                              className="w-16 h-16 rounded object-cover"
                            />
                          ) : (
                            <div className="w-16 h-16 rounded bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                              {ref.type === 'url' ? (
                                <ExternalLink className="w-6 h-6 text-gray-400" />
                              ) : (
                                <FileText className="w-6 h-6 text-gray-400" />
                              )}
                            </div>
                          )}

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {ref.filename || ref.url}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-xs px-2 py-0.5 rounded bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                                {ref.type === 'asset' ? 'Asset Library' : 
                                 ref.type === 'upload' ? 'Task Upload' : 'URL'}
                              </span>
                              {ref.fileSize && (
                                <span className="text-xs text-gray-500">
                                  {(ref.fileSize / 1024 / 1024).toFixed(2)} MB
                                </span>
                              )}
                            </div>

                            {/* Notes */}
                            {expandedNotes.has(ref.id) ? (
                              <textarea
                                value={ref.notes}
                                onChange={(e) => handleUpdateReferenceNotes(ref.id, e.target.value)}
                                placeholder="Why is this reference relevant?"
                                rows={2}
                                className="w-full mt-2 px-2 py-1.5 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                              />
                            ) : ref.notes ? (
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                                {ref.notes}
                              </p>
                            ) : null}

                            <button
                              onClick={() => {
                                const newExpanded = new Set(expandedNotes)
                                if (newExpanded.has(ref.id)) {
                                  newExpanded.delete(ref.id)
                                } else {
                                  newExpanded.add(ref.id)
                                }
                                setExpandedNotes(newExpanded)
                              }}
                              className="text-xs text-blue-600 hover:text-blue-700 mt-1"
                            >
                              {expandedNotes.has(ref.id) ? 'Hide' : 'Add'} notes
                            </button>
                          </div>

                          {/* Remove Button */}
                          <button
                            onClick={() => handleRemoveReference(ref.id)}
                            className="p-1.5 text-gray-400 hover:text-red-500 transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'creator-dna' && (
              <div className="space-y-4">
                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowPersonaPicker(true)}
                    className="flex items-center gap-2 px-4 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                  >
                    <Plus className="w-4 h-4" />
                    Add Creator/Persona
                  </button>

                  <button
                    onClick={() => setShowCreatePersona(true)}
                    className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                  >
                    <Plus className="w-4 h-4" />
                    Create New Persona
                  </button>
                </div>

                {/* Authorization Warning */}
                {hasAuthWarnings && (
                  <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                          Creator Authorization Warning
                        </p>
                        <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                          One or more creators have expired or expiring authorizations. Please review before proceeding.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Assigned Creators */}
                {assignedCreators.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Users className="w-12 h-12 text-gray-300 dark:text-gray-700 mb-3" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      No creators assigned. Add from library or create a new persona.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {assignedCreators.map(assignedCreator => (
                      <div
                        key={assignedCreator.persona.id}
                        className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-3"
                      >
                        <div className="flex items-start gap-3">
                          {/* Avatar */}
                          <img
                            src={assignedCreator.persona.avatarUrl}
                            alt={assignedCreator.persona.name}
                            className="w-12 h-12 rounded-full object-cover"
                          />

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                  {assignedCreator.persona.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {assignedCreator.persona.nilpId}
                                </p>
                              </div>

                              <button
                                onClick={() => handleRemoveCreator(assignedCreator.persona.id)}
                                className="p-1 text-gray-400 hover:text-red-500 transition"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>

                            {/* Authorization Status */}
                            <div className="flex items-center gap-2 mt-2">
                              {getAuthStatusIcon(assignedCreator.persona.authorizationStatus)}
                              <span className={cn(
                                "text-xs font-medium",
                                getAuthStatusColor(assignedCreator.persona.authorizationStatus)
                              )}>
                                {getAuthStatusLabel(assignedCreator.persona.authorizationStatus)}
                              </span>
                              {assignedCreator.persona.expirationDate && (
                                <span className="text-xs text-gray-500">
                                  Expires: {assignedCreator.persona.expirationDate.toLocaleDateString('en-US', { 
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric'
                                  })}
                                </span>
                              )}
                            </div>

                            {/* Role Selection */}
                            <div className="mt-3">
                              <select
                                value={assignedCreator.role || ''}
                                onChange={(e) => handleUpdateCreatorRole(assignedCreator.persona.id, e.target.value)}
                                className="w-full px-3 py-1.5 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                              >
                                <option value="">Select Role (Optional)</option>
                                {CREATOR_ROLES.map(role => (
                                  <option key={role} value={role}>{role}</option>
                                ))}
                              </select>
                            </div>

                            {/* NILP Components */}
                            <div className="mt-3">
                              <button
                                onClick={() => {
                                  const newExpanded = new Set(expandedNilpComponents)
                                  if (newExpanded.has(assignedCreator.persona.id)) {
                                    newExpanded.delete(assignedCreator.persona.id)
                                  } else {
                                    newExpanded.add(assignedCreator.persona.id)
                                  }
                                  setExpandedNilpComponents(newExpanded)
                                }}
                                className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                              >
                                <ChevronDown className={cn(
                                  "w-4 h-4 transition-transform",
                                  expandedNilpComponents.has(assignedCreator.persona.id) && "rotate-180"
                                )} />
                                NILP Components
                              </button>

                              {expandedNilpComponents.has(assignedCreator.persona.id) && (
                                <div className="mt-2 pl-6 space-y-2">
                                  {(['name', 'image', 'likeness', 'personality'] as const).map(component => (
                                    <label key={component} className="flex items-center gap-2 cursor-pointer">
                                      <input
                                        type="checkbox"
                                        checked={assignedCreator.nilpComponents[component]}
                                        onChange={() => toggleNilpComponent(assignedCreator.persona.id, component)}
                                        className="rounded border-gray-300 dark:border-gray-600"
                                      />
                                      <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                                        {component}
                                      </span>
                                    </label>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-800 flex-shrink-0">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
            >
              Save & Close
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>

    {/* Asset Library Picker Modal */}
    <AssetLibraryPicker
      isOpen={showAssetLibrary}
      onClose={() => setShowAssetLibrary(false)}
      onSelect={handleLinkAssets}
      multiSelect={true}
      filterMode="all"
      selectedAssetIds={linkedAssets.map(a => a.id)}
    />

    {/* Training Data Picker Modal */}
    <AssetLibraryPicker
      isOpen={showTrainingPicker}
      onClose={() => setShowTrainingPicker(false)}
      onSelect={handleLinkTrainingData}
      multiSelect={true}
      filterMode="training-mode"
      selectedAssetIds={trainingData.map(d => d.id)}
    />

    {/* Reference Library Picker Modal */}
    <AssetLibraryPicker
      isOpen={showReferenceLibraryPicker}
      onClose={() => setShowReferenceLibraryPicker(false)}
      onSelect={handleLinkReferenceAssets}
      multiSelect={true}
      filterMode="all"
      selectedAssetIds={references.filter(r => r.type === 'asset').map(r => r.id)}
    />

    {/* Persona Picker Modal */}
    <PersonaLibraryPicker
      isOpen={showPersonaPicker}
      onClose={() => setShowPersonaPicker(false)}
      onSelect={handleAssignPersonas}
      multiSelect={true}
      selectedPersonaIds={assignedCreators.map(ac => ac.persona.id)}
    />

    {/* Create Persona Modal */}
    <Dialog open={showCreatePersona} onOpenChange={setShowCreatePersona}>
      <DialogContent className="bg-white dark:bg-[#0d0e14] border border-gray-200 dark:border-gray-800 p-0 w-full max-w-lg rounded-xl">
        <div className="flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              Create New Persona
            </h3>
            <button
              onClick={() => setShowCreatePersona(false)}
              className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>

          {/* Form */}
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Name
              </label>
              <input
                type="text"
                value={newPersonaName}
                onChange={(e) => setNewPersonaName(e.target.value)}
                placeholder="Creator name"
                className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Authorization Document (Optional)
              </label>
              <label className="flex items-center gap-2 px-4 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition">
                <Upload className="w-4 h-4" />
                {newPersonaAuthDoc ? newPersonaAuthDoc.name : 'Choose file...'}
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => setNewPersonaAuthDoc(e.target.files?.[0] || null)}
                  className="hidden"
                />
              </label>
            </div>

            <p className="text-xs text-gray-500">
              A NILP ID will be automatically generated upon creation.
            </p>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-800">
            <button
              onClick={() => setShowCreatePersona(false)}
              className="px-4 py-2 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition"
            >
              Cancel
            </button>
            <button
              onClick={handleCreatePersona}
              disabled={!newPersonaName.trim()}
              className="px-6 py-2 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Create & Assign
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
    </>
  )
}
