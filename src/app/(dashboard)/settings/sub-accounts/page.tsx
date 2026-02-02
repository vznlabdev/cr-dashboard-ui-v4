"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Building, Plus, Users, FolderTree } from "lucide-react";
import { SettingsPageHeader } from "@/components/settings/SettingsPageHeader";

// Mock sub-account data
const subAccounts = [
  {
    id: "1",
    name: "Marketing Department",
    description: "Marketing team and campaigns",
    userCount: 15,
    projectCount: 24,
    status: "Active",
    createdAt: "Jan 15, 2026",
  },
  {
    id: "2",
    name: "Product Team",
    description: "Product development and design",
    userCount: 12,
    projectCount: 18,
    status: "Active",
    createdAt: "Jan 10, 2026",
  },
  {
    id: "3",
    name: "External Agency - Brand Co",
    description: "External partner for brand campaigns",
    userCount: 8,
    projectCount: 6,
    status: "Active",
    createdAt: "Dec 20, 2025",
  },
];

export default function SubAccountsPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <SettingsPageHeader
        title="Sub-accounts"
        description="Manage organizational sub-accounts and resource allocation"
        actions={
          <Button onClick={() => toast.info("Create sub-account feature coming soon")}>
            <Plus className="mr-2 h-4 w-4" />
            Create Sub-account
          </Button>
        }
      />

      {/* Sub-accounts List */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            <CardTitle>Sub-accounts</CardTitle>
          </div>
          <CardDescription>
            Organize your team into separate sub-accounts with their own projects and resources
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {subAccounts.map((account) => (
              <div 
                key={account.id}
                className="p-4 rounded-lg border hover:border-gray-300 dark:hover:border-gray-700 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{account.name}</h3>
                      <Badge variant="outline" className="text-xs">
                        {account.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      {account.description}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{account.userCount} members</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <FolderTree className="h-4 w-4" />
                        <span>{account.projectCount} projects</span>
                      </div>
                      <span>Created {account.createdAt}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toast.info(`Manage ${account.name}`)}
                    >
                      Manage
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toast.info(`Settings for ${account.name}`)}
                    >
                      Settings
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Sub-account Hierarchy */}
      <Card>
        <CardHeader>
          <CardTitle>Organization Hierarchy</CardTitle>
          <CardDescription>
            Visual representation of your organization structure
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 p-4 bg-muted/30 rounded-lg">
            <div className="flex items-center gap-2 p-3 bg-background rounded border">
              <Building className="h-5 w-5" />
              <span className="font-semibold">Acme Corporation (Parent)</span>
            </div>
            <div className="ml-8 space-y-2">
              {subAccounts.map((account) => (
                <div 
                  key={account.id}
                  className="flex items-center gap-2 p-3 bg-background rounded border"
                >
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{account.name}</span>
                  <Badge variant="outline" className="text-xs ml-auto">
                    {account.userCount} users
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resource Allocation */}
      <Card>
        <CardHeader>
          <CardTitle>Resource Allocation</CardTitle>
          <CardDescription>
            Manage resource limits and quotas for sub-accounts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Sub-account</th>
                  <th className="text-right py-3 px-4 font-medium">Storage Limit</th>
                  <th className="text-right py-3 px-4 font-medium">User Limit</th>
                  <th className="text-right py-3 px-4 font-medium">Project Limit</th>
                  <th className="text-right py-3 px-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {subAccounts.map((account) => (
                  <tr key={account.id} className="border-b">
                    <td className="py-3 px-4">{account.name}</td>
                    <td className="text-right py-3 px-4">100 GB</td>
                    <td className="text-right py-3 px-4">25 users</td>
                    <td className="text-right py-3 px-4">50 projects</td>
                    <td className="text-right py-3 px-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toast.info("Edit resource allocation")}
                      >
                        Edit
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Sub-account Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Sub-account Settings</CardTitle>
          <CardDescription>
            Configure default settings for new sub-accounts
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Default Storage Limit</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                defaultValue="100"
                className="w-24 p-2 border rounded-md"
              />
              <span className="text-sm text-muted-foreground">GB</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Default User Limit</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                defaultValue="25"
                className="w-24 p-2 border rounded-md"
              />
              <span className="text-sm text-muted-foreground">users</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Default Project Limit</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                defaultValue="50"
                className="w-24 p-2 border rounded-md"
              />
              <span className="text-sm text-muted-foreground">projects</span>
            </div>
          </div>

          <Button onClick={() => toast.success("Default settings saved!")}>
            Save Defaults
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
