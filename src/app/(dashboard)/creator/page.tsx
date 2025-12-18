"use client"

import { useCreatorAccount } from "@/contexts/creator-account-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  User,
  FileText,
  Upload,
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight,
  Image,
  Folder,
  TrendingUp,
} from "lucide-react"
import { PageContainer } from "@/components/layout/PageContainer"
import {
  getRightsStatusColor,
  getRightsStatusVariant,
  formatCreatorExpiration,
} from "@/lib/creator-utils"
import { formatDateLong } from "@/lib/format-utils"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function CreatorDashboardPage() {
  const router = useRouter()
  const {
    currentCreator,
    getMyCredits,
    getMyLinkedAssets,
    getMyLinkedProjects,
    getProfileCompletionStatus,
  } = useCreatorAccount()

  if (!currentCreator) {
    return (
      <PageContainer>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">Please log in to view your dashboard</p>
              <Button asChild>
                <Link href="/creator/login">Log In</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </PageContainer>
    )
  }

  const credits = getMyCredits()
  const assetIds = getMyLinkedAssets()
  const projectIds = getMyLinkedProjects()
  const profileCompletion = getProfileCompletionStatus()

  const getStatusIcon = () => {
    switch (currentCreator.rightsStatus) {
      case "Authorized":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />
      case "Expiring Soon":
        return <Clock className="h-5 w-5 text-amber-500" />
      case "Expired":
        return <AlertTriangle className="h-5 w-5 text-red-500" />
      default:
        return null
    }
  }

  return (
    <PageContainer className="space-y-6 animate-fade-in">
      {/* Welcome Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Welcome back, {currentCreator.fullName}!
          </h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            Manage your creator rights and view your credits
          </p>
        </div>
        <Button asChild>
          <Link href="/creator/profile">
            <User className="mr-2 h-4 w-4" />
            Edit Profile
          </Link>
        </Button>
      </div>

      {/* Rights Status Summary */}
      <Card className={cn(
        "border-2",
        currentCreator.rightsStatus === "Authorized" && "border-green-500/20 bg-green-500/5",
        currentCreator.rightsStatus === "Expiring Soon" && "border-amber-500/20 bg-amber-500/5",
        currentCreator.rightsStatus === "Expired" && "border-red-500/20 bg-red-500/5",
      )}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getStatusIcon()}
              <div>
                <CardTitle>Rights Status</CardTitle>
                <CardDescription>
                  {formatCreatorExpiration(currentCreator.validThrough)}
                </CardDescription>
              </div>
            </div>
            <Badge variant={getRightsStatusVariant(currentCreator.rightsStatus)}>
              {currentCreator.rightsStatus}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <p className="text-sm text-muted-foreground">Valid From</p>
              <p className="font-medium">{formatDateLong(currentCreator.validFrom)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Valid Through</p>
              <p className="font-medium">{formatDateLong(currentCreator.validThrough)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Risk Level</p>
              <Badge
                variant={
                  currentCreator.riskLevel === "Low"
                    ? "default"
                    : currentCreator.riskLevel === "Medium"
                    ? "secondary"
                    : "destructive"
                }
              >
                {currentCreator.riskLevel}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Credits</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{credits.length}</div>
            <p className="text-xs text-muted-foreground">Across all assets and projects</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Assets Credited</CardTitle>
            <Image className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{assetIds.length}</div>
            <p className="text-xs text-muted-foreground">Assets using your likeness</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Projects Credited</CardTitle>
            <Folder className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projectIds.length}</div>
            <p className="text-xs text-muted-foreground">Projects you're credited in</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Profile Completion</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{profileCompletion}%</div>
            <Progress value={profileCompletion} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="cursor-pointer transition-all hover:shadow-lg hover:border-primary/50"
          onClick={() => router.push("/creator/profile")}>
          <CardHeader>
            <CardTitle className="text-base">Update Profile</CardTitle>
            <CardDescription>Edit your personal information and rights details</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">
              <User className="mr-2 h-4 w-4" />
              Go to Profile
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer transition-all hover:shadow-lg hover:border-primary/50"
          onClick={() => router.push("/creator/profile#references")}>
          <CardHeader>
            <CardTitle className="text-base">Upload Reference</CardTitle>
            <CardDescription>Add photos, voice samples, or guidelines</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">
              <Upload className="mr-2 h-4 w-4" />
              Upload Files
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer transition-all hover:shadow-lg hover:border-primary/50"
          onClick={() => router.push("/creator/profile#rights")}>
          <CardHeader>
            <CardTitle className="text-base">Extend Rights</CardTitle>
            <CardDescription>Renew or extend your rights agreement</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">
              <Calendar className="mr-2 h-4 w-4" />
              Extend Rights
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Credits */}
      {credits.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Credits</CardTitle>
                <CardDescription>Your most recent asset and project credits</CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/creator/profile#credits">
                  View All
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {credits.slice(0, 5).map((credit) => (
                <div
                  key={credit.id}
                  className="flex items-center justify-between p-3 border rounded-md"
                >
                  <div className="flex items-center gap-3">
                    {credit.assetId ? (
                      <Image className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Folder className="h-4 w-4 text-muted-foreground" />
                    )}
                    <div>
                      <p className="font-medium text-sm">
                        {credit.assetId ? `Asset Credit` : `Project Credit`}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {credit.role || "Creator"}
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {new Date(credit.creditedAt).toLocaleDateString()}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State for Credits */}
      {credits.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-sm font-medium mb-2">No Credits Yet</p>
              <p className="text-xs text-muted-foreground mb-4">
                You haven't been credited to any assets or projects yet.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </PageContainer>
  )
}

