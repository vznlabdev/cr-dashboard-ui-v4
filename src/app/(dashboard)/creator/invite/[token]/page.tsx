"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { useCreators } from "@/contexts/creators-context"
import { useCreatorAccount } from "@/contexts/creator-account-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"
import { Mail, Loader2, Lock, User, UserPlus, AlertCircle } from "lucide-react"
import { isValidEmail, isInvitationExpired } from "@/lib/creator-utils"
import type { CreatorType } from "@/types/creators"
import Link from "next/link"

export default function CreatorInviteAcceptancePage() {
  const router = useRouter()
  const params = useParams()
  const token = params.token as string
  const { getCreatorByToken } = useCreators()
  const { registerCreator } = useCreatorAccount()

  const [invitation, setInvitation] = useState(
    getCreatorByToken(token) || null
  )
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    email: invitation?.email || "",
    password: "",
    confirmPassword: "",
    fullName: invitation?.name || "",
    creatorType: "" as CreatorType | "",
    acceptTerms: false,
  })

  useEffect(() => {
    const inv = getCreatorByToken(token)
    if (!inv) {
      toast.error("Invalid or expired invitation link")
      router.push("/creator/signup")
      return
    }

    if (isInvitationExpired(inv)) {
      toast.error("This invitation has expired")
      router.push("/creator/signup")
      return
    }

    if (inv.status === "accepted") {
      toast.error("This invitation has already been accepted")
      router.push("/creator/login")
      return
    }

    setInvitation(inv)
    setFormData((prev) => ({
      ...prev,
      email: inv.email,
      fullName: inv.name,
    }))
  }, [token, getCreatorByToken, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (formData.password.length < 8) {
      toast.error("Password must be at least 8 characters")
      return
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match")
      return
    }

    if (!formData.fullName.trim()) {
      toast.error("Full name is required")
      return
    }

    if (!formData.creatorType) {
      toast.error("Creator type is required")
      return
    }

    if (!formData.acceptTerms) {
      toast.error("You must accept the terms and conditions")
      return
    }

    setIsSubmitting(true)

    try {
      // Register the creator account
      await registerCreator({
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        fullName: formData.fullName.trim(),
        creatorType: formData.creatorType,
        acceptTerms: formData.acceptTerms,
      })

      toast.success("Account created successfully!")
      router.push("/creator/profile")
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create account"
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <AlertCircle className="h-12 w-12 mx-auto text-destructive" />
              <h2 className="text-xl font-semibold">Invalid Invitation</h2>
              <p className="text-sm text-muted-foreground">
                This invitation link is invalid or has expired.
              </p>
              <Button asChild>
                <Link href="/creator/signup">Sign Up Instead</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isInvitationExpired(invitation)) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <AlertCircle className="h-12 w-12 mx-auto text-amber-500" />
              <h2 className="text-xl font-semibold">Invitation Expired</h2>
              <p className="text-sm text-muted-foreground">
                This invitation has expired. Please contact the administrator for a new invitation.
              </p>
              <Button asChild>
                <Link href="/creator/signup">Sign Up Instead</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Accept Invitation
          </CardTitle>
          <CardDescription className="text-center">
            You've been invited to create a creator account. Complete your registration below.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="p-3 rounded-lg bg-muted">
              <p className="text-sm font-medium">Invitation Details</p>
              <p className="text-xs text-muted-foreground mt-1">
                Email: {invitation.email}
              </p>
              <p className="text-xs text-muted-foreground">
                Name: {invitation.name}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  disabled
                  className="pl-9 bg-muted"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Email is pre-filled from your invitation
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">
                Password <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="At least 8 characters"
                  className="pl-9"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  disabled={isSubmitting}
                  required
                  minLength={8}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">
                Confirm Password <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  className="pl-9"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({ ...formData, confirmPassword: e.target.value })
                  }
                  disabled={isSubmitting}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fullName">
                Full Name <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="fullName"
                  type="text"
                  className="pl-9"
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData({ ...formData, fullName: e.target.value })
                  }
                  disabled={isSubmitting}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="creatorType">
                Creator Type <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.creatorType}
                onValueChange={(value) =>
                  setFormData({ ...formData, creatorType: value as CreatorType })
                }
                disabled={isSubmitting}
                required
              >
                <SelectTrigger id="creatorType">
                  <SelectValue placeholder="Select your creator type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Real Person">Real Person</SelectItem>
                  <SelectItem value="Character">Character</SelectItem>
                  <SelectItem value="Brand Mascot">Brand Mascot</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-start space-x-2">
              <Checkbox
                id="terms"
                checked={formData.acceptTerms}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, acceptTerms: checked === true })
                }
                disabled={isSubmitting}
                required
              />
              <Label
                htmlFor="terms"
                className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                I accept the terms and conditions{" "}
                <span className="text-destructive">*</span>
              </Label>
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Create Account
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

