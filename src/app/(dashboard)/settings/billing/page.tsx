"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { CreditCard, Download, TrendingUp } from "lucide-react";
import { SettingsPageHeader } from "@/components/settings/SettingsPageHeader";

export default function BillingPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <SettingsPageHeader
        title="Billing & Subscription"
        description="Manage your subscription, payment methods, and billing history"
      />

      {/* Current Plan */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            <CardTitle>Current Plan</CardTitle>
          </div>
          <CardDescription>
            Your subscription and usage details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-2xl font-bold">Professional Plan</h3>
              <p className="text-muted-foreground">$99/month • Billed monthly</p>
            </div>
            <Badge className="text-sm">Active</Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
            <div>
              <p className="text-sm text-muted-foreground">Team Members</p>
              <p className="text-2xl font-bold">12 <span className="text-sm font-normal text-muted-foreground">/ 25</span></p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Storage Used</p>
              <p className="text-2xl font-bold">45 <span className="text-sm font-normal text-muted-foreground">/ 100 GB</span></p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">API Calls</p>
              <p className="text-2xl font-bold">12.5k <span className="text-sm font-normal text-muted-foreground">/ 15k</span></p>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button onClick={() => toast.info("Upgrade plan coming soon")}>
              Upgrade Plan
            </Button>
            <Button variant="outline" onClick={() => toast.info("Plan details coming soon")}>
              View Plan Details
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Payment Method */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            <CardTitle>Payment Method</CardTitle>
          </div>
          <CardDescription>
            Manage your payment information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <div className="h-10 w-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded flex items-center justify-center text-white font-bold text-xs">
                VISA
              </div>
              <div>
                <p className="font-medium">•••• •••• •••• 4242</p>
                <p className="text-sm text-muted-foreground">Expires 12/2027</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => toast.info("Update card coming soon")}>
                Update
              </Button>
              <Button variant="outline" size="sm" onClick={() => toast.info("Remove card coming soon")}>
                Remove
              </Button>
            </div>
          </div>

          <Button variant="outline" onClick={() => toast.info("Add payment method coming soon")}>
            Add Payment Method
          </Button>
        </CardContent>
      </Card>

      {/* Billing History */}
      <Card>
        <CardHeader>
          <CardTitle>Billing History</CardTitle>
          <CardDescription>
            View and download past invoices
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Date</th>
                  <th className="text-left py-3 px-4 font-medium">Description</th>
                  <th className="text-right py-3 px-4 font-medium">Amount</th>
                  <th className="text-center py-3 px-4 font-medium">Status</th>
                  <th className="text-right py-3 px-4 font-medium">Invoice</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-3 px-4">Feb 1, 2026</td>
                  <td className="py-3 px-4">Professional Plan - February 2026</td>
                  <td className="text-right py-3 px-4">$99.00</td>
                  <td className="text-center py-3 px-4">
                    <Badge variant="default" className="text-xs">Paid</Badge>
                  </td>
                  <td className="text-right py-3 px-4">
                    <Button variant="ghost" size="sm" onClick={() => toast.success("Downloading invoice...")}>
                      <Download className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4">Jan 1, 2026</td>
                  <td className="py-3 px-4">Professional Plan - January 2026</td>
                  <td className="text-right py-3 px-4">$99.00</td>
                  <td className="text-center py-3 px-4">
                    <Badge variant="default" className="text-xs">Paid</Badge>
                  </td>
                  <td className="text-right py-3 px-4">
                    <Button variant="ghost" size="sm" onClick={() => toast.success("Downloading invoice...")}>
                      <Download className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4">Dec 1, 2025</td>
                  <td className="py-3 px-4">Professional Plan - December 2025</td>
                  <td className="text-right py-3 px-4">$99.00</td>
                  <td className="text-center py-3 px-4">
                    <Badge variant="default" className="text-xs">Paid</Badge>
                  </td>
                  <td className="text-right py-3 px-4">
                    <Button variant="ghost" size="sm" onClick={() => toast.success("Downloading invoice...")}>
                      <Download className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Billing Information */}
      <Card>
        <CardHeader>
          <CardTitle>Billing Information</CardTitle>
          <CardDescription>
            Company details for invoices
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Company Name</label>
            <input type="text" defaultValue="Acme Corporation" className="w-full p-2 border rounded-md" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Billing Email</label>
            <input type="email" defaultValue="billing@acme.com" className="w-full p-2 border rounded-md" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Tax ID / VAT Number</label>
            <input type="text" defaultValue="US123456789" className="w-full p-2 border rounded-md" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Billing Address</label>
            <textarea 
              rows={3} 
              defaultValue="123 Main Street&#10;San Francisco, CA 94105&#10;United States"
              className="w-full p-2 border rounded-md"
            />
          </div>

          <Button onClick={() => toast.success("Billing information updated!")}>
            Save Billing Information
          </Button>
        </CardContent>
      </Card>

      {/* Cancel Subscription */}
      <Card className="border-red-500/30">
        <CardHeader>
          <CardTitle className="text-red-600 dark:text-red-400">Cancel Subscription</CardTitle>
          <CardDescription>
            Permanently cancel your subscription
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Canceling your subscription will delete all your data after the current billing period ends.
            This action cannot be undone.
          </p>
          <Button variant="destructive" onClick={() => toast.error("Cancellation coming soon")}>
            Cancel Subscription
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
