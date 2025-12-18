"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Mail, Loader2, ArrowLeft, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { api } from "@/lib/api"

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [email, setEmail] = useState("")
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email.trim()) {
      toast.error("Email is required")
      return
    }

    setIsSubmitting(true)

    try {
      await api.creators.forgotPassword(email.trim())
      setIsSuccess(true)
      toast.success("Password reset email sent! Check your inbox.")
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to send reset email"
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-green-100 p-3">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-center">
              Check Your Email
            </CardTitle>
            <CardDescription className="text-center">
              We've sent password reset instructions to {email}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground text-center space-y-2">
              <p>If an account exists with this email, you'll receive a password reset link.</p>
              <p>The link will expire in 1 hour.</p>
            </div>
            <div className="flex flex-col gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsSuccess(false)
                  setEmail("")
                }}
                className="w-full"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Reset
              </Button>
              <Button variant="ghost" asChild className="w-full">
                <Link href="/creator/login">
                  Back to Login
                </Link>
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
            Forgot Password
          </CardTitle>
          <CardDescription className="text-center">
            Enter your email address and we'll send you a link to reset your password
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="creator@example.com"
                  className="pl-9"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubmitting}
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Send Reset Link
                </>
              )}
            </Button>

            <div className="text-center text-sm">
              <Link
                href="/creator/login"
                className="text-primary hover:underline flex items-center justify-center gap-1"
              >
                <ArrowLeft className="h-3 w-3" />
                Back to Login
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

