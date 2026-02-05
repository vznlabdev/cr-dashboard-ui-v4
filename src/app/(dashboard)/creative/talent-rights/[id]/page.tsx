"use client"

import { useState } from "react"
import { useParams, notFound } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LinearBreadcrumb } from "@/components/navigation/LinearBreadcrumb"
import { useTalentRights } from "@/contexts/talent-rights-context"
import { useData } from "@/contexts/data-context"
import { useContracts } from "@/contexts/contracts-context"
import { PageContainer } from "@/components/layout/PageContainer"
import {
  User,
  FileText,
  Download,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ExternalLink,
  Mail,
  Shield,
  Image as ImageIcon,
  Users as UsersIcon,
  Sparkles,
  Plus,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  getRightsStatusColor,
  getRightsStatusVariant,
  formatCreatorExpiration,
} from "@/lib/creator-utils"
import { formatDateLong, getInitials } from "@/lib/format-utils"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { EmptyState } from "@/components/cr"
import { NilpDropdownTab, ContractCard, UploadContractModal } from "@/components/talent-rights"
import type { TalentContract } from "@/types/talent-contracts"
import { getTotalContractValue } from "@/lib/mock-data/contracts"

export default function TalentRightsDetailPage() {
  const params = useParams()
  const id = params.id as string
  const { getTalentById, getAllCreditsByTalent } = useTalentRights()
  const { projects, getAssetById } = useData()
  const { getContractsByTalent } = useContracts()
  
  // State for managing active tab
  const [currentTab, setCurrentTab] = useState<string>("overview")
  const [uploadModalOpen, setUploadModalOpen] = useState(false)

  const talent = getTalentById(id)
  
  // Get contracts for this talent
  const contractsForTalent = talent ? getContractsByTalent(talent.id) : []
  const activeContracts = contractsForTalent.filter(c => c.status === "signed")
  const totalContractValue = getTotalContractValue(activeContracts)
  const expiringContracts = contractsForTalent.filter(c => {
    const daysRemaining = Math.ceil((new Date(c.terms.expirationDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    return c.status === "signed" && daysRemaining > 0 && daysRemaining <= 30
  })

  if (!talent) {
    notFound()
  }

  const credits = getAllCreditsByTalent(id)
  const assetCredits = credits.filter((c) => c.assetId)
  const projectCredits = credits.filter((c) => c.projectId)

  // Helper to get asset name
  const getAssetName = (assetId: string, projectId?: string) => {
    if (!projectId) {
      // Try to find asset in any project
      for (const proj of projects) {
        const asset = getAssetById(proj.id, assetId)
        if (asset) return asset.name
      }
      return `Asset ${assetId}`
    }
    const asset = getAssetById(projectId, assetId)
    return asset?.name || `Asset ${assetId}`
  }

  // Helper to get project name
  const getProjectName = (projectId: string) => {
    const project = projects.find((p) => p.id === projectId)
    return project?.name || `Project ${projectId}`
  }

  const getStatusIcon = () => {
    switch (talent.rightsStatus) {
      case "Authorized":
        return <CheckCircle2 className="h-4 w-4" />
      case "Expiring Soon":
        return <Clock className="h-4 w-4" />
      case "Expired":
        return <AlertTriangle className="h-4 w-4" />
      default:
        return null
    }
  }

  const talentRightsId = talent.talentRightsId || talent.creatorRightsId || 'N/A'
  const talentType = talent.talentType || talent.creatorType

  return (
    <PageContainer className="space-y-6 animate-fade-in">
      {/* Breadcrumb Navigation */}
      <LinearBreadcrumb
        backHref="/creative/talent-rights"
        segments={[
          { label: "Talent Rights", href: "/creative/talent-rights" },
          { label: talent.fullName }
        ]}
      />

      {/* Page Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-4">
          <Avatar className="h-24 w-24">
            <AvatarImage src={talent.avatarUrl} alt={talent.fullName} />
            <AvatarFallback className="bg-primary/10 text-primary font-semibold text-2xl">
              {getInitials(talent.fullName)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight break-all">
                {talent.fullName}
              </h1>
              <Badge variant="secondary">{talentType}</Badge>
              <Badge
                variant={getRightsStatusVariant(talent.rightsStatus)}
                className="flex items-center gap-1"
              >
                {getStatusIcon()}
                {talent.rightsStatus}
              </Badge>
              <Badge variant="outline" className="font-mono text-xs">
                {talentRightsId}
              </Badge>
            </div>
            <p className="text-muted-foreground flex items-center gap-1 text-sm sm:text-base">
              <Mail className="h-4 w-4" />
              {talent.email}
            </p>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-3 text-xs sm:text-sm text-muted-foreground">
              <span>
                Registered: {formatDateLong(talent.createdAt)} (
                {talent.registrationSource === "invited" ? "Invited" : "Self-Registered"})
              </span>
              <span className="hidden sm:inline">•</span>
              <span>Last updated: {formatDateLong(talent.updatedAt)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-3 sm:gap-4 grid-cols-2 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Risk Level</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge
              variant={
                talent.riskLevel === "Low"
                  ? "default"
                  : talent.riskLevel === "Medium"
                  ? "secondary"
                  : "destructive"
              }
            >
              {talent.riskLevel}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Credits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {talent.linkedAssetsCount + talent.linkedProjectsCount}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {talent.linkedAssetsCount} assets, {talent.linkedProjectsCount} projects
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profile Completion</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{talent.profileCompletion}%</div>
            <p className="text-xs text-muted-foreground mt-1">Complete</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expiration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={cn("text-sm font-medium", getRightsStatusColor(talent.rightsStatus))}>
              {formatCreatorExpiration(talent.validThrough)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {formatDateLong(talent.validThrough)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* NILP™ Tabbed Content - Grouped Navigation */}
      <Tabs value={currentTab} onValueChange={setCurrentTab} className="space-y-4">
        <div className="border-b border-border">
          <div className="flex items-center gap-0">
            <TabsList className="h-auto bg-transparent p-0 border-0">
              <TabsTrigger value="overview" className="whitespace-nowrap rounded-none">
                Overview
              </TabsTrigger>
              <TabsTrigger value="contracts" className="whitespace-nowrap rounded-none">
                Contracts
                {contractsForTalent.length > 0 && (
                  <Badge variant="secondary" className="ml-1.5 h-3.5 px-1 text-[9px]">
                    {contractsForTalent.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>
            
            <NilpDropdownTab
              currentTab={currentTab}
              onTabChange={setCurrentTab}
            />
            
            <TabsList className="h-auto bg-transparent p-0 border-0">
              <TabsTrigger value="rights" className="whitespace-nowrap rounded-none">
                Rights & Documentation
              </TabsTrigger>
              <TabsTrigger value="references" className="whitespace-nowrap rounded-none">
                Reference Materials
              </TabsTrigger>
              <TabsTrigger value="credits" className="whitespace-nowrap rounded-none">
                Credits
              </TabsTrigger>
            </TabsList>
          </div>
        </div>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Talent profile details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">Full Name</h4>
                  <p className="font-medium">{talent.fullName}</p>
                </div>
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">Email</h4>
                  <p className="font-medium">{talent.email}</p>
                </div>
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">
                    Talent Rights ID
                  </h4>
                  <p className="font-medium font-mono">{talentRightsId}</p>
                </div>
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">Talent Type</h4>
                  <Badge variant="secondary">{talentType}</Badge>
                </div>
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">
                    Registration Source
                  </h4>
                  <Badge variant="outline">
                    {talent.registrationSource === "invited" ? "Invited" : "Self-Registered"}
                  </Badge>
                </div>
                {talent.contactInformation && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-muted-foreground">
                      Contact Information
                    </h4>
                    <p className="font-medium">{talent.contactInformation}</p>
                  </div>
                )}
              </div>
              {talent.notes && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">Notes</h4>
                  <p className="text-sm">{talent.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contracts Tab */}
        <TabsContent value="contracts" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h3 className="text-base font-semibold">Contracts</h3>
              {contractsForTalent.length > 0 && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{activeContracts.length} active</span>
                  {totalContractValue > 0 && (
                    <>
                      <span>•</span>
                      <span>${totalContractValue.toLocaleString()} total</span>
                    </>
                  )}
                  {expiringContracts.length > 0 && (
                    <>
                      <span>•</span>
                      <span className="text-orange-600">{expiringContracts.length} expiring</span>
                    </>
                  )}
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link href="/creative/talent-rights/contracts">
                  <FileText className="mr-2 h-4 w-4" />
                  View All
                </Link>
              </Button>
              <Button size="sm" onClick={() => setUploadModalOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                New Contract
              </Button>
            </div>
          </div>

          {contractsForTalent.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No contracts yet"
              description="Create a contract to begin managing talent agreements"
              action={{
                label: "Create Contract",
                onClick: () => setUploadModalOpen(true),
              }}
            />
          ) : (
            <div className="border rounded-lg overflow-hidden">
              {contractsForTalent.map((contract) => (
                <ContractCard
                  key={contract.id}
                  contract={contract}
                  compact
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* NILP™ Name Rights Tab */}
        <TabsContent value="name" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Name Rights</CardTitle>
              <CardDescription>
                Legal names, stage names, and trademark information for use in assets
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">Legal Name</h4>
                  <p className="font-medium">{talent.nilpCategories?.name?.legalName || talent.fullName}</p>
                </div>
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">Stage/Professional Name</h4>
                  <p className="font-medium">{talent.nilpCategories?.name?.stageName || 'Not specified'}</p>
                </div>
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">Trademark Status</h4>
                  <p className="font-medium">{talent.nilpCategories?.name?.trademarkStatus || 'Not specified'}</p>
                </div>
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">Approval Required</h4>
                  <Badge variant={talent.nilpCategories?.name?.approvalRequired ? "secondary" : "outline"}>
                    {talent.nilpCategories?.name?.approvalRequired ? 'Yes' : 'No'}
                  </Badge>
                </div>
              </div>
              {talent.nilpCategories?.name?.usageRestrictions && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">Usage Restrictions</h4>
                  <p className="text-sm">{talent.nilpCategories.name.usageRestrictions}</p>
                </div>
              )}
              {talent.nilpCategories?.name?.notes && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">Notes</h4>
                  <p className="text-sm">{talent.nilpCategories.name.notes}</p>
                </div>
              )}
              {!talent.nilpCategories?.name && (
                <EmptyState
                  icon={Shield}
                  title="Name rights not configured"
                  description="Name rights information has not been set up for this talent yet."
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* NILP™ Image Rights Tab */}
        <TabsContent value="image" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Image Rights</CardTitle>
              <CardDescription>
                Approved images, photos, and visual representation guidelines
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">Image Usage Guidelines</h4>
                  <p className="text-sm">{talent.nilpCategories?.image?.imageUsageGuidelines || 'Not specified'}</p>
                </div>
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">Exclusivity Restrictions</h4>
                  <p className="text-sm">{talent.nilpCategories?.image?.exclusivityRestrictions || 'Not specified'}</p>
                </div>
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">Geographic Limitations</h4>
                  <p className="text-sm">{talent.nilpCategories?.image?.geographicLimitations || 'Not specified'}</p>
                </div>
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">Time Period Restrictions</h4>
                  <p className="text-sm">{talent.nilpCategories?.image?.timePeriodRestrictions || 'Not specified'}</p>
                </div>
              </div>
              {talent.nilpCategories?.image?.approvedImages && talent.nilpCategories.image.approvedImages.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">Approved Images</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {talent.nilpCategories.image.approvedImages.map((url, idx) => (
                      <div key={idx} className="aspect-square rounded-lg border overflow-hidden">
                        <img src={url} alt={`Approved ${idx + 1}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {talent.nilpCategories?.image?.notes && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">Notes</h4>
                  <p className="text-sm">{talent.nilpCategories.image.notes}</p>
                </div>
              )}
              {!talent.nilpCategories?.image && (
                <EmptyState
                  icon={ImageIcon}
                  title="Image rights not configured"
                  description="Image rights information has not been set up for this talent yet."
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* NILP™ Likeness Tab */}
        <TabsContent value="likeness" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Likeness Rights</CardTitle>
              <CardDescription>
                Voice characteristics, physical traits, and impersonation guidelines
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">Voice Characteristics</h4>
                  <p className="text-sm">{talent.nilpCategories?.likeness?.voiceCharacteristics || 'Not specified'}</p>
                </div>
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">Physical Mannerisms</h4>
                  <p className="text-sm">{talent.nilpCategories?.likeness?.physicalMannerisms || 'Not specified'}</p>
                </div>
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">Signature Traits</h4>
                  <p className="text-sm">{talent.nilpCategories?.likeness?.signatureTraits || 'Not specified'}</p>
                </div>
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">Digital Likeness Rights</h4>
                  <Badge variant={talent.nilpCategories?.likeness?.digitalLikenessRights ? "default" : "outline"}>
                    {talent.nilpCategories?.likeness?.digitalLikenessRights ? 'Granted' : 'Not Granted'}
                  </Badge>
                </div>
              </div>
              {talent.nilpCategories?.likeness?.impersonationGuidelines && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">Impersonation Guidelines</h4>
                  <p className="text-sm">{talent.nilpCategories.likeness.impersonationGuidelines}</p>
                </div>
              )}
              {talent.nilpCategories?.likeness?.notes && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">Notes</h4>
                  <p className="text-sm">{talent.nilpCategories.likeness.notes}</p>
                </div>
              )}
              {!talent.nilpCategories?.likeness && (
                <EmptyState
                  icon={UsersIcon}
                  title="Likeness rights not configured"
                  description="Likeness rights information has not been set up for this talent yet."
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* NILP™ Persona Tab */}
        <TabsContent value="persona" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Persona™ Traits</CardTitle>
              <CardDescription>
                Personality attributes, brand associations, and behavioral guidelines
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">Personality Attributes</h4>
                  <div className="flex flex-wrap gap-1">
                    {talent.nilpCategories?.persona?.personalityAttributes && talent.nilpCategories.persona.personalityAttributes.length > 0 ? (
                      talent.nilpCategories.persona.personalityAttributes.map((attr, idx) => (
                        <Badge key={idx} variant="secondary">{attr}</Badge>
                      ))
                    ) : (
                      <span className="text-sm text-muted-foreground">Not specified</span>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">Brand Associations</h4>
                  <div className="flex flex-wrap gap-1">
                    {talent.nilpCategories?.persona?.brandAssociations && talent.nilpCategories.persona.brandAssociations.length > 0 ? (
                      talent.nilpCategories.persona.brandAssociations.map((brand, idx) => (
                        <Badge key={idx} variant="outline">{brand}</Badge>
                      ))
                    ) : (
                      <span className="text-sm text-muted-foreground">Not specified</span>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">Character Traits</h4>
                  <div className="flex flex-wrap gap-1">
                    {talent.nilpCategories?.persona?.characterTraits && talent.nilpCategories.persona.characterTraits.length > 0 ? (
                      talent.nilpCategories.persona.characterTraits.map((trait, idx) => (
                        <Badge key={idx} variant="secondary">{trait}</Badge>
                      ))
                    ) : (
                      <span className="text-sm text-muted-foreground">Not specified</span>
                    )}
                  </div>
                </div>
              </div>
              {talent.nilpCategories?.persona?.valuesBeliefs && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">Values & Beliefs Representation</h4>
                  <p className="text-sm">{talent.nilpCategories.persona.valuesBeliefs}</p>
                </div>
              )}
              {talent.nilpCategories?.persona?.behavioralGuidelines && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">Behavioral Guidelines</h4>
                  <p className="text-sm">{talent.nilpCategories.persona.behavioralGuidelines}</p>
                </div>
              )}
              {talent.nilpCategories?.persona?.notes && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">Notes</h4>
                  <p className="text-sm">{talent.nilpCategories.persona.notes}</p>
                </div>
              )}
              {!talent.nilpCategories?.persona && (
                <EmptyState
                  icon={Sparkles}
                  title="Persona™ traits not configured"
                  description="Persona™ traits have not been set up for this talent yet."
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rights" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Rights Documentation</CardTitle>
              <CardDescription>Rights agreement and validity information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">Rights Status</h4>
                  <Badge
                    variant={getRightsStatusVariant(talent.rightsStatus)}
                    className="flex items-center gap-1 w-fit"
                  >
                    {getStatusIcon()}
                    {talent.rightsStatus}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">Risk Level</h4>
                  <Badge
                    variant={
                      talent.riskLevel === "Low"
                        ? "default"
                        : talent.riskLevel === "Medium"
                        ? "secondary"
                        : "destructive"
                    }
                  >
                    {talent.riskLevel}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">Valid From</h4>
                  <p className="font-medium">{formatDateLong(talent.validFrom)}</p>
                </div>
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">Valid Through</h4>
                  <p className={cn("font-medium", getRightsStatusColor(talent.rightsStatus))}>
                    {formatDateLong(talent.validThrough)}
                  </p>
                </div>
              </div>

              {talent.rightsAgreementUrl && (
                <div className="space-y-2 pt-4 border-t">
                  <h4 className="text-sm font-medium text-muted-foreground">
                    Rights Agreement Document
                  </h4>
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{talent.rightsAgreementFileName}</span>
                    <Button variant="outline" size="sm" asChild>
                      <a href={talent.rightsAgreementUrl} download target="_blank" rel="noopener noreferrer">
                        <Download className="h-3 w-3 mr-1" />
                        Download
                      </a>
                    </Button>
                  </div>
                </div>
              )}

              {talent.lastVerified && (
                <div className="space-y-2 pt-4 border-t">
                  <h4 className="text-sm font-medium text-muted-foreground">Last Verified</h4>
                  <p className="text-sm">{formatDateLong(talent.lastVerified)}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="references" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Reference Materials</CardTitle>
              <CardDescription>
                Supporting evidence and reference files uploaded by the talent
              </CardDescription>
            </CardHeader>
            <CardContent>
              {talent.referenceMaterials.length === 0 ? (
                <EmptyState
                  icon={FileText}
                  title="No reference materials"
                  description="This talent hasn't uploaded any reference materials yet."
                />
              ) : (
                <div className="space-y-2">
                  {talent.referenceMaterials.map((ref) => (
                    <div
                      key={ref.id}
                      className="flex items-center justify-between p-3 rounded-lg border"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium text-sm">{ref.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {ref.type} • {formatDateLong(ref.uploadedAt)}
                          </p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <a href={ref.url} download target="_blank" rel="noopener noreferrer">
                          <Download className="h-3 w-3 mr-1" />
                          Download
                        </a>
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="credits" className="space-y-4">
          {/* Assets Crediting This Talent */}
          <Card>
            <CardHeader>
              <CardTitle>Assets Crediting This Talent</CardTitle>
              <CardDescription>
                All assets where this talent is credited for their work
              </CardDescription>
            </CardHeader>
            <CardContent>
              {assetCredits.length === 0 ? (
                <EmptyState
                  icon={FileText}
                  title="No asset credits"
                  description="This talent hasn't been credited on any assets yet."
                />
              ) : (
                <div className="space-y-2">
                  {assetCredits.map((credit) => {
                    const assetName = credit.projectId 
                      ? getAssetName(credit.assetId!, credit.projectId)
                      : getAssetName(credit.assetId!)
                    const projectName = credit.projectId ? getProjectName(credit.projectId) : null
                    
                    return (
                      <div
                        key={credit.id}
                        className="flex items-center justify-between p-3 rounded-lg border"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-medium text-sm">
                              {assetName}
                            </p>
                            {credit.role && (
                              <Badge variant="outline" className="text-xs">
                                {credit.role}
                              </Badge>
                            )}
                            {projectName && (
                              <Badge variant="secondary" className="text-xs">
                                {projectName}
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            Credited: {formatDateLong(credit.creditedAt)}
                          </p>
                        </div>
                        {credit.projectId && (
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/projects/${credit.projectId}/assets/${credit.assetId}`}>
                              <ExternalLink className="h-3 w-3 mr-1" />
                              View Asset
                            </Link>
                          </Button>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Projects Crediting This Talent */}
          <Card>
            <CardHeader>
              <CardTitle>Projects Crediting This Talent</CardTitle>
              <CardDescription>
                All projects where this talent is credited for their work
              </CardDescription>
            </CardHeader>
            <CardContent>
              {projectCredits.length === 0 ? (
                <EmptyState
                  icon={FileText}
                  title="No project credits"
                  description="This talent hasn't been credited on any projects yet."
                />
              ) : (
                <div className="space-y-2">
                  {projectCredits.map((credit) => {
                    const projectName = getProjectName(credit.projectId!)
                    
                    return (
                      <div
                        key={credit.id}
                        className="flex items-center justify-between p-3 rounded-lg border"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-medium text-sm">
                              {projectName}
                            </p>
                            {credit.role && (
                              <Badge variant="outline" className="text-xs">
                                {credit.role}
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            Credited: {formatDateLong(credit.creditedAt)}
                          </p>
                        </div>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/projects/${credit.projectId}`}>
                            <ExternalLink className="h-3 w-3 mr-1" />
                            View Project
                          </Link>
                        </Button>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Upload Contract Modal */}
      <UploadContractModal 
        open={uploadModalOpen}
        onOpenChange={setUploadModalOpen}
        prefilledTalentId={talent.id}
      />
    </PageContainer>
  )
}
