"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Building2, Upload } from "lucide-react";
import { SettingsPageHeader } from "@/components/settings/SettingsPageHeader";

export default function OrganizationPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <SettingsPageHeader
        title="Organization"
        description="Manage your company profile and branding"
      />

      {/* Company Profile */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            <CardTitle>Company Profile</CardTitle>
          </div>
          <CardDescription>
            Basic information about your organization
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="company-name">Company Name</Label>
            <Input id="company-name" defaultValue="Acme Corporation" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="industry">Industry</Label>
            <Select defaultValue="technology">
              <SelectTrigger id="industry">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="technology">Technology</SelectItem>
                <SelectItem value="media">Media & Entertainment</SelectItem>
                <SelectItem value="advertising">Advertising</SelectItem>
                <SelectItem value="healthcare">Healthcare</SelectItem>
                <SelectItem value="finance">Finance</SelectItem>
                <SelectItem value="retail">Retail</SelectItem>
                <SelectItem value="education">Education</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="company-size">Company Size</Label>
            <Select defaultValue="50-200">
              <SelectTrigger id="company-size">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1-10">1-10 employees</SelectItem>
                <SelectItem value="11-50">11-50 employees</SelectItem>
                <SelectItem value="51-200">51-200 employees</SelectItem>
                <SelectItem value="201-500">201-500 employees</SelectItem>
                <SelectItem value="501-1000">501-1000 employees</SelectItem>
                <SelectItem value="1000+">1000+ employees</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input id="website" type="url" defaultValue="https://acme.com" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Company Description</Label>
            <Textarea
              id="description"
              rows={4}
              defaultValue="Leading provider of AI content creation solutions..."
              placeholder="Tell us about your company"
            />
          </div>

          <Button onClick={() => toast.success("Company profile updated!")}>
            Save Changes
          </Button>
        </CardContent>
      </Card>

      {/* Branding */}
      <Card>
        <CardHeader>
          <CardTitle>Branding</CardTitle>
          <CardDescription>
            Customize your organization&apos;s appearance
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Company Logo</Label>
            <div className="flex items-center gap-4">
              <div className="h-20 w-20 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <Building2 className="h-8 w-8 text-gray-400" />
              </div>
              <div className="flex-1">
                <Button variant="outline" size="sm">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Logo
                </Button>
                <p className="text-xs text-muted-foreground mt-2">
                  Recommended: Square image, at least 200x200px, PNG or SVG
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Brand Colors</Label>
            <div className="flex items-center gap-3">
              <div className="space-y-2">
                <Label htmlFor="primary-color" className="text-xs">Primary</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="primary-color"
                    type="color"
                    defaultValue="#3b82f6"
                    className="w-20 h-10"
                  />
                  <Input
                    type="text"
                    defaultValue="#3b82f6"
                    className="w-24 font-mono text-sm"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="secondary-color" className="text-xs">Secondary</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="secondary-color"
                    type="color"
                    defaultValue="#8b5cf6"
                    className="w-20 h-10"
                  />
                  <Input
                    type="text"
                    defaultValue="#8b5cf6"
                    className="w-24 font-mono text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          <Button onClick={() => toast.success("Branding updated!")}>
            Save Branding
          </Button>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
          <CardDescription>
            Primary contact details for your organization
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="contact-email">Primary Contact Email</Label>
            <Input id="contact-email" type="email" defaultValue="contact@acme.com" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="support-email">Support Email</Label>
            <Input id="support-email" type="email" defaultValue="support@acme.com" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input id="phone" type="tel" defaultValue="+1 (555) 123-4567" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              rows={3}
              defaultValue="123 Main Street, Suite 100&#10;San Francisco, CA 94105&#10;United States"
            />
          </div>

          <Button onClick={() => toast.success("Contact information updated!")}>
            Save Contact Info
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
