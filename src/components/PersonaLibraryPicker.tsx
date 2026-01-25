'use client'

import { useState, useEffect, useMemo } from 'react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { 
  X, 
  Search, 
  Plus,
  Check,
  AlertCircle,
  XCircle,
  Clock,
  Upload,
  User,
  ExternalLink
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { AssignedCreator } from '@/types/mediaManager'
import { MOCK_PERSONA_LIBRARY } from '@/lib/mockData'

interface PersonaLibraryPickerProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (selectedPersonas: AssignedCreator[]) => void
  multiSelect?: boolean
  intendedUse?: string
  selectedPersonaIds?: string[]
}

type StatusFilter = 'all' | 'authorized' | 'expires-soon' | 'expired' | 'pending'

export function PersonaLibraryPicker({
  isOpen,
  onClose,
  onSelect,
  multiSelect = true,
  intendedUse,
  selectedPersonaIds = []
}: PersonaLibraryPickerProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(selectedPersonaIds))
  const [showCreateNew, setShowCreateNew] = useState(false)
  const [viewingPersona, setViewingPersona] = useState<string | null>(null)
  
  // Quick create form state
  const [newPersonaName, setNewPersonaName] = useState('')
  const [newPersonaRole, setNewPersonaRole] = useState('')
  const [newPersonaPhoto, setNewPersonaPhoto] = useState<File | null>(null)
  const [newPersonaNilpComponents, setNewPersonaNilpComponents] = useState({
    name: true,
    image: true,
    likeness: true,
    personality: true
  })
  const [newPersonaAuthDoc, setNewPersonaAuthDoc] = useState<File | null>(null)
  const [newPersonaExpiration, setNewPersonaExpiration] = useState('')
  const [newPersonaNotes, setNewPersonaNotes] = useState('')

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  // Reset selections when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedIds(new Set(selectedPersonaIds))
    }
  }, [isOpen, selectedPersonaIds])

  // Get unique roles from personas
  const availableRoles = useMemo(() => {
    const roles = new Set(MOCK_PERSONA_LIBRARY.map(p => p.role).filter(Boolean))
    return Array.from(roles).sort()
  }, [])

  // Filter personas
  const filteredPersonas = useMemo(() => {
    let personas = [...MOCK_PERSONA_LIBRARY]

    // Apply search
    if (debouncedSearch) {
      const query = debouncedSearch.toLowerCase()
      personas = personas.filter(p => 
        p.name.toLowerCase().includes(query) ||
        p.nilpId.toLowerCase().includes(query) ||
        p.role?.toLowerCase().includes(query)
      )
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      personas = personas.filter(p => p.authorizationStatus === statusFilter)
    }

    // Apply role filter
    if (roleFilter !== 'all') {
      personas = personas.filter(p => p.role === roleFilter)
    }

    return personas
  }, [debouncedSearch, statusFilter, roleFilter])

  // Get authorization status details
  const getAuthStatus = (status: AssignedCreator['authorizationStatus']) => {
    switch (status) {
      case 'authorized':
        return {
          label: 'Authorized',
          color: 'text-green-600 dark:text-green-400',
          bgColor: 'bg-green-50 dark:bg-green-900/20',
          borderColor: 'border-green-200 dark:border-green-800',
          icon: '🟢'
        }
      case 'expires-soon':
        return {
          label: 'Expires Soon',
          color: 'text-yellow-600 dark:text-yellow-400',
          bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
          borderColor: 'border-yellow-200 dark:border-yellow-800',
          icon: '🟡'
        }
      case 'expired':
        return {
          label: 'Expired',
          color: 'text-red-600 dark:text-red-400',
          bgColor: 'bg-red-50 dark:bg-red-900/20',
          borderColor: 'border-red-200 dark:border-red-800',
          icon: '🔴'
        }
      case 'pending':
        return {
          label: 'Pending',
          color: 'text-gray-600 dark:text-gray-400',
          bgColor: 'bg-gray-50 dark:bg-gray-800',
          borderColor: 'border-gray-200 dark:border-gray-700',
          icon: '⚪'
        }
    }
  }

  // Calculate days until expiration
  const getDaysUntilExpiration = (expirationDate?: Date): number | null => {
    if (!expirationDate) return null
    const now = new Date()
    const diff = expirationDate.getTime() - now.getTime()
    return Math.ceil(diff / (1000 * 60 * 60 * 24))
  }

  // Format expiration date
  const formatExpirationDate = (expirationDate?: Date): string => {
    if (!expirationDate) return 'No expiration'
    return expirationDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  // Get selected personas
  const selectedPersonas = useMemo(() => {
    return MOCK_PERSONA_LIBRARY.filter(p => selectedIds.has(p.id))
  }, [selectedIds])

  // Check for warnings
  const selectionWarnings = useMemo(() => {
    const warnings: string[] = []
    const expiresSoon = selectedPersonas.filter(p => p.authorizationStatus === 'expires-soon').length
    const expired = selectedPersonas.filter(p => p.authorizationStatus === 'expired').length
    const pending = selectedPersonas.filter(p => p.authorizationStatus === 'pending').length

    if (expired > 0) {
      warnings.push(`${expired} creator${expired > 1 ? 's have' : ' has'} expired authorization`)
    }
    if (expiresSoon > 0) {
      warnings.push(`${expiresSoon} creator${expiresSoon > 1 ? 's expire' : ' expires'} soon`)
    }
    if (pending > 0 && intendedUse?.toLowerCase().includes('advertising')) {
      warnings.push(`${pending} creator${pending > 1 ? 's have' : ' has'} pending authorization`)
    }

    return warnings
  }, [selectedPersonas, intendedUse])

  // Handle selection
  const toggleSelection = (personaId: string) => {
    if (!multiSelect) {
      setSelectedIds(new Set([personaId]))
      return
    }

    setSelectedIds(prev => {
      const newSelection = new Set(prev)
      if (newSelection.has(personaId)) {
        newSelection.delete(personaId)
      } else {
        newSelection.add(personaId)
      }
      return newSelection
    })
  }

  // Handle select all
  const handleSelectAll = () => {
    if (selectedIds.size === filteredPersonas.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filteredPersonas.map(p => p.id)))
    }
  }

  // Handle confirm
  const handleConfirm = () => {
    const selected = MOCK_PERSONA_LIBRARY.filter(p => selectedIds.has(p.id))
    onSelect(selected)
    onClose()
  }

  // Handle cancel
  const handleCancel = () => {
    setSelectedIds(new Set(selectedPersonaIds))
    onClose()
  }

  // Handle create new persona
  const handleCreatePersona = () => {
    if (!newPersonaName.trim() || !newPersonaAuthDoc) return

    const nilpId = `CR-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 100000)).padStart(5, '0')}`
    
    const newPersona: AssignedCreator = {
      id: `persona-${Date.now()}`,
      name: newPersonaName.trim(),
      nilpId,
      avatarUrl: newPersonaPhoto ? URL.createObjectURL(newPersonaPhoto) : '/placeholder.svg',
      authorizationStatus: 'pending',
      expirationDate: newPersonaExpiration ? new Date(newPersonaExpiration) : undefined,
      role: newPersonaRole || undefined,
      nilpComponents: newPersonaNilpComponents
    }

    // Add to mock library (in real app, this would be an API call)
    MOCK_PERSONA_LIBRARY.push(newPersona)

    // Auto-select the new persona
    setSelectedIds(prev => new Set([...prev, newPersona.id]))

    // Reset form
    setNewPersonaName('')
    setNewPersonaRole('')
    setNewPersonaPhoto(null)
    setNewPersonaNilpComponents({ name: true, image: true, likeness: true, personality: true })
    setNewPersonaAuthDoc(null)
    setNewPersonaExpiration('')
    setNewPersonaNotes('')
    setShowCreateNew(false)
  }

  // Keyboard shortcuts
  useEffect(() => {
    if (!isOpen || showCreateNew) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleCancel()
      } else if (e.key === 'Enter' && selectedIds.size > 0) {
        handleConfirm()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, showCreateNew, selectedIds, handleCancel, handleConfirm])

  const hasActiveFilters = searchQuery || statusFilter !== 'all' || roleFilter !== 'all'
  const isAdvertising = intendedUse?.toLowerCase().includes('advertising')

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 gap-0">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex-shrink-0">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Select Creators/Personas
          </h2>
          <button
            onClick={handleCancel}
            className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Advertising Warning Banner */}
        {isAdvertising && (
          <div className="px-6 py-3 bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-100 dark:border-yellow-800 flex-shrink-0">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                <strong>Advertising Use:</strong> Valid creator authorizations are required. Expired or pending authorizations may cause compliance issues.
              </p>
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 space-y-3 flex-shrink-0">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, NILP ID, or role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            />
          </div>

          {/* Filters Row */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              className="px-3 py-1.5 text-xs bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="authorized">🟢 Authorized Only</option>
              <option value="expires-soon">🟡 Expiring Soon</option>
              <option value="expired">🔴 Expired</option>
              <option value="pending">⚪ Pending Approval</option>
            </select>

            {/* Role Filter */}
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-1.5 text-xs bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="all">All Roles</option>
              {availableRoles.map(role => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <button
                onClick={() => {
                  setSearchQuery('')
                  setStatusFilter('all')
                  setRoleFilter('all')
                }}
                className="px-3 py-1.5 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
              >
                Clear Filters
              </button>
            )}

            {/* Spacer */}
            <div className="flex-1" />

            {/* Create New Button */}
            <button
              onClick={() => setShowCreateNew(true)}
              className="flex items-center gap-2 px-3 py-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition"
            >
              <Plus className="w-4 h-4" />
              Create New
            </button>

            {/* Select All */}
            {multiSelect && filteredPersonas.length > 0 && (
              <button
                onClick={handleSelectAll}
                className="px-3 py-1.5 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-medium"
              >
                {selectedIds.size === filteredPersonas.length ? 'Clear Selection' : 'Select All'}
              </button>
            )}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {filteredPersonas.length === 0 ? (
            // Empty State
            <div className="flex flex-col items-center justify-center py-16 text-center">
              {MOCK_PERSONA_LIBRARY.length === 0 ? (
                <>
                  <User className="w-16 h-16 text-gray-300 dark:text-gray-700 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No creators registered yet
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Create your first creator profile to get started
                  </p>
                  <button
                    onClick={() => setShowCreateNew(true)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition"
                  >
                    Create New Persona
                  </button>
                </>
              ) : (
                <>
                  <Search className="w-16 h-16 text-gray-300 dark:text-gray-700 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No creators match your filters
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Try adjusting your search or filters
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery('')
                      setStatusFilter('all')
                      setRoleFilter('all')
                    }}
                    className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white text-sm rounded-lg transition"
                  >
                    Clear Filters
                  </button>
                </>
              )}
            </div>
          ) : (
            // Personas List
            <div className="space-y-3">
              {filteredPersonas.map(persona => {
                const isSelected = selectedIds.has(persona.id)
                const authStatus = getAuthStatus(persona.authorizationStatus)
                const daysUntilExpiration = getDaysUntilExpiration(persona.expirationDate)
                
                return (
                  <div
                    key={persona.id}
                    onClick={() => toggleSelection(persona.id)}
                    className={cn(
                      "relative p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md",
                      isSelected
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                        : cn("border-gray-200 dark:border-gray-700", authStatus.borderColor)
                    )}
                  >
                    <div className="flex items-start gap-4">
                      {/* Checkbox */}
                      {multiSelect && (
                        <div className="pt-1">
                          <div className={cn(
                            "w-5 h-5 rounded border-2 flex items-center justify-center transition",
                            isSelected
                              ? "bg-blue-600 border-blue-600"
                              : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                          )}>
                            {isSelected && <Check className="w-3 h-3 text-white" />}
                          </div>
                        </div>
                      )}

                      {/* Avatar */}
                      <img
                        src={persona.avatarUrl}
                        alt={persona.name}
                        className="w-20 h-20 rounded-full object-cover flex-shrink-0"
                      />

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        {/* Name and NILP ID */}
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div>
                            <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                              {persona.name}
                            </h3>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                setViewingPersona(persona.id)
                              }}
                              className="flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition"
                            >
                              {persona.nilpId}
                              <ExternalLink className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        {/* Status and Role */}
                        <div className="flex items-center gap-3 flex-wrap mb-2">
                          {/* Authorization Status */}
                          <div className={cn(
                            "flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium",
                            authStatus.bgColor,
                            authStatus.color
                          )}>
                            <span>{authStatus.icon}</span>
                            <span>{authStatus.label}</span>
                            {persona.authorizationStatus === 'expires-soon' && daysUntilExpiration && (
                              <span className="text-xs">({daysUntilExpiration} days)</span>
                            )}
                          </div>

                          {/* Role */}
                          {persona.role && (
                            <span className="px-2 py-1 rounded text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                              {persona.role}
                            </span>
                          )}
                        </div>

                        {/* Expiration Date */}
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          {persona.authorizationStatus === 'expired' ? 'Expired: ' : 
                           persona.authorizationStatus === 'expires-soon' ? 'Expires: ' : 
                           persona.authorizationStatus === 'authorized' ? 'Expires: ' : 
                           'Status: '}
                          {formatExpirationDate(persona.expirationDate)}
                        </p>

                        {/* NILP Components */}
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">NILP:</span>
                          <div className="flex items-center gap-1">
                            {persona.nilpComponents.name && (
                              <span className="w-6 h-6 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-semibold flex items-center justify-center" title="Name">
                                N
                              </span>
                            )}
                            {persona.nilpComponents.image && (
                              <span className="w-6 h-6 rounded bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-semibold flex items-center justify-center" title="Image">
                                I
                              </span>
                            )}
                            {persona.nilpComponents.likeness && (
                              <span className="w-6 h-6 rounded bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-semibold flex items-center justify-center" title="Likeness">
                                L
                              </span>
                            )}
                            {persona.nilpComponents.personality && (
                              <span className="w-6 h-6 rounded bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 text-xs font-semibold flex items-center justify-center" title="Personality">
                                P
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800 flex-shrink-0">
          {/* Warnings */}
          {selectionWarnings.length > 0 && (
            <div className="mb-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  {selectionWarnings.map((warning, index) => (
                    <p key={index} className="text-sm text-yellow-800 dark:text-yellow-200">
                      ⚠ {warning}
                    </p>
                  ))}
                  {isAdvertising && (
                    <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                      This may cause compliance issues for advertising use.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {multiSelect ? (
                <span>
                  {selectedIds.size} {selectedIds.size === 1 ? 'creator' : 'creators'} selected
                </span>
              ) : (
                <span>
                  {selectedIds.size === 1 ? '1 creator selected' : 'Select a creator'}
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={selectedIds.size === 0}
                className={cn(
                  "px-6 py-2 text-sm font-medium rounded-lg transition",
                  selectedIds.size > 0
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed"
                )}
              >
                Select
              </button>
            </div>
          </div>
        </div>
      </DialogContent>

      {/* Create New Persona Modal */}
      <Dialog open={showCreateNew} onOpenChange={setShowCreateNew}>
        <DialogContent className="max-w-2xl p-0 gap-0">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Create New Persona
            </h3>
            <button
              onClick={() => setShowCreateNew(false)}
              className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Form */}
          <div className="px-6 py-4 space-y-4 max-h-[60vh] overflow-y-auto">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={newPersonaName}
                onChange={(e) => setNewPersonaName(e.target.value)}
                placeholder="Creator name"
                className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Role
              </label>
              <select
                value={newPersonaRole}
                onChange={(e) => setNewPersonaRole(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="">Select role...</option>
                <option value="Model">Model</option>
                <option value="Actor">Actor</option>
                <option value="Voice Actor">Voice Actor</option>
                <option value="Brand Ambassador">Brand Ambassador</option>
                <option value="Influencer">Influencer</option>
                <option value="Narrator">Narrator</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* NILP ID (read-only) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                NILP ID (auto-generated)
              </label>
              <input
                type="text"
                value={`CR-${new Date().getFullYear()}-XXXXX`}
                readOnly
                className="w-full px-3 py-2 text-sm bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-500"
              />
            </div>

            {/* Photo Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Photo
              </label>
              <label className="flex items-center gap-2 px-4 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition">
                <Upload className="w-4 h-4" />
                {newPersonaPhoto ? newPersonaPhoto.name : 'Choose photo...'}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setNewPersonaPhoto(e.target.files?.[0] || null)}
                  className="hidden"
                />
              </label>
            </div>

            {/* NILP Components */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                NILP Components
              </label>
              <div className="space-y-2">
                {(['name', 'image', 'likeness', 'personality'] as const).map(component => (
                  <label key={component} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newPersonaNilpComponents[component]}
                      onChange={(e) => setNewPersonaNilpComponents(prev => ({
                        ...prev,
                        [component]: e.target.checked
                      }))}
                      className="rounded border-gray-300 dark:border-gray-600"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                      {component}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Authorization Document */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Authorization Document <span className="text-red-500">*</span>
              </label>
              <label className="flex items-center gap-2 px-4 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition">
                <Upload className="w-4 h-4" />
                {newPersonaAuthDoc ? newPersonaAuthDoc.name : 'Choose document...'}
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => setNewPersonaAuthDoc(e.target.files?.[0] || null)}
                  className="hidden"
                />
              </label>
            </div>

            {/* Expiration Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Expiration Date
              </label>
              <input
                type="date"
                value={newPersonaExpiration}
                onChange={(e) => setNewPersonaExpiration(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Notes
              </label>
              <textarea
                value={newPersonaNotes}
                onChange={(e) => setNewPersonaNotes(e.target.value)}
                placeholder="Additional notes..."
                rows={3}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-800">
            <button
              onClick={() => setShowCreateNew(false)}
              className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition"
            >
              Cancel
            </button>
            <button
              onClick={handleCreatePersona}
              disabled={!newPersonaName.trim() || !newPersonaAuthDoc}
              className={cn(
                "px-6 py-2 text-sm font-medium rounded-lg transition",
                newPersonaName.trim() && newPersonaAuthDoc
                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed"
              )}
            >
              Create & Select
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </Dialog>
  )
}
