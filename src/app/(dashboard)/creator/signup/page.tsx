"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useCreatorAccount } from "@/contexts/creator-account-context"
import { useCreators } from "@/contexts/creators-context"
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
import { UserPlus, Loader2, Mail, Lock, User } from "lucide-react"
import Link from "next/link"
import { isValidEmail } from "@/lib/creator-utils"
import type { CreatorType } from "@/types/creators"

export default function CreatorSignupPage() {
  const router = useRouter()
  const { registerCreator } = useCreatorAccount()
  const { checkEmailExists } = useCreators()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    creatorType: "" as CreatorType | "",
    acceptTerms: false,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (!formData.email.trim()) {
      toast.error("Email is required")
      return
    }

    if (!isValidEmail(formData.email)) {
      toast.error("Invalid email format")
      return
    }

    if (checkEmailExists(formData.email)) {
      toast.error("This email is already registered")
      return
    }

    if (!formData.password) {
      toast.error("Password is required")
      return
    }

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
      await registerCreator({
        email: formData.email.trim(),
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

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Create Creator Account
          </CardTitle>
          <CardDescription className="text-center">
            Sign up to manage your creator rights and profile
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">
                Email <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="creator@example.com"
                  className="pl-9"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  disabled={isSubmitting}
                  required
                />
              </div>
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
              <p className="text-xs text-muted-foreground">
                Must be at least 8 characters long
              </p>
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
                  placeholder="Your full name"
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

            <div className="text-center text-sm">
              <span className="text-muted-foreground">Already have an account? </span>
              <Link href="/creator/login" className="text-primary hover:underline">
                Sign in
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

