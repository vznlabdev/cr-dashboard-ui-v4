"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { UserCog, Plus } from "lucide-react";
import { SettingsPageHeader } from "@/components/settings/SettingsPageHeader";

// Mock role data
const roles = [
  {
    id: "1",
    name: "Company Admin",
    description: "Full access to all settings, projects, and team management",
    userCount: 2,
    permissions: [
      "Manage settings",
      "Manage team",
      "Manage projects",
      "Manage billing",
      "View reports",
      "Approve content",
    ],
    isDefault: true,
  },
  {
    id: "2",
    name: "Legal Reviewer",
    description: "Approve/reject assets, view compliance data, access audit logs",
    userCount: 3,
    permissions: [
      "Approve content",
      "View compliance data",
      "Access audit logs",
      "Export reports",
    ],
    isDefault: true,
  },
  {
    id: "3",
    name: "Insurance Analyst",
    description: "View risk compliance, export reports, no approval permissions",
    userCount: 1,
    permissions: [
      "View risk compliance",
      "Export reports",
      "View compliance data",
    ],
    isDefault: true,
  },
  {
    id: "4",
    name: "Content Creator",
    description: "Upload assets, view own projects, no approval permissions",
    userCount: 12,
    permissions: [
      "Upload assets",
      "View assigned projects",
      "Create tasks",
      "Comment on tasks",
    ],
    isDefault: true,
  },
  {
    id: "5",
    name: "Creative Director",
    description: "Manage projects, assign tasks, approve creative work",
    userCount: 4,
    permissions: [
      "Manage projects",
      "Assign tasks",
      "Approve content",
      "View reports",
    ],
    isDefault: false,
  },
];

export default function RolesPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <SettingsPageHeader
        title="Roles & Permissions"
        description="Define roles and manage access permissions for your organization"
        actions={
          <Button onClick={() => toast.info("Custom role creation coming soon")}>
            <Plus className="mr-2 h-4 w-4" />
            Create Role
          </Button>
        }
      />

      {/* Roles List */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <UserCog className="h-5 w-5" />
            <CardTitle>Organization Roles</CardTitle>
          </div>
          <CardDescription>
            Manage roles and their associated permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {roles.map((role) => (
              <div 
                key={role.id}
                className="p-4 rounded-lg border hover:border-gray-300 dark:hover:border-gray-700 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{role.name}</h3>
                      {role.isDefault && (
                        <Badge variant="outline" className="text-xs">
                          Default
                        </Badge>
                      )}
                      <Badge variant="secondary" className="text-xs">
                        {role.userCount} {role.userCount === 1 ? 'user' : 'users'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {role.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toast.info(`Edit ${role.name} role`)}
                    >
                      Edit
                    </Button>
                    {!role.isDefault && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toast.error("Delete custom role")}
                        className="text-red-600 hover:text-red-700"
                      >
                        Delete
                      </Button>
                    )}
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {role.permissions.map((permission, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs font-normal">
                      {permission}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Permission Matrix */}
      <Card>
        <CardHeader>
          <CardTitle>Permission Matrix</CardTitle>
          <CardDescription>
            View detailed permission breakdown across all roles
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Permission</th>
                  <th className="text-center py-3 px-2 font-medium">Admin</th>
                  <th className="text-center py-3 px-2 font-medium">Legal</th>
                  <th className="text-center py-3 px-2 font-medium">Analyst</th>
                  <th className="text-center py-3 px-2 font-medium">Creator</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-3 px-4">Manage Settings</td>
                  <td className="text-center py-3 px-2">✓</td>
                  <td className="text-center py-3 px-2 text-gray-300 dark:text-gray-700">−</td>
                  <td className="text-center py-3 px-2 text-gray-300 dark:text-gray-700">−</td>
                  <td className="text-center py-3 px-2 text-gray-300 dark:text-gray-700">−</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4">Approve Content</td>
                  <td className="text-center py-3 px-2">✓</td>
                  <td className="text-center py-3 px-2">✓</td>
                  <td className="text-center py-3 px-2 text-gray-300 dark:text-gray-700">−</td>
                  <td className="text-center py-3 px-2 text-gray-300 dark:text-gray-700">−</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4">View Compliance Data</td>
                  <td className="text-center py-3 px-2">✓</td>
                  <td className="text-center py-3 px-2">✓</td>
                  <td className="text-center py-3 px-2">✓</td>
                  <td className="text-center py-3 px-2 text-gray-300 dark:text-gray-700">−</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4">Upload Assets</td>
                  <td className="text-center py-3 px-2">✓</td>
                  <td className="text-center py-3 px-2 text-gray-300 dark:text-gray-700">−</td>
                  <td className="text-center py-3 px-2 text-gray-300 dark:text-gray-700">−</td>
                  <td className="text-center py-3 px-2">✓</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4">Export Reports</td>
                  <td className="text-center py-3 px-2">✓</td>
                  <td className="text-center py-3 px-2">✓</td>
                  <td className="text-center py-3 px-2">✓</td>
                  <td className="text-center py-3 px-2 text-gray-300 dark:text-gray-700">−</td>
                </tr>
                <tr>
                  <td className="py-3 px-4">Access Audit Logs</td>
                  <td className="text-center py-3 px-2">✓</td>
                  <td className="text-center py-3 px-2">✓</td>
                  <td className="text-center py-3 px-2 text-gray-300 dark:text-gray-700">−</td>
                  <td className="text-center py-3 px-2 text-gray-300 dark:text-gray-700">−</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="mt-4">
            <Button 
              variant="outline"
              onClick={() => toast.info("Export permission matrix coming soon")}
            >
              Export Matrix
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Role Assignment Rules */}
      <Card>
        <CardHeader>
          <CardTitle>Role Assignment Rules</CardTitle>
          <CardDescription>
            Configure automatic role assignment for new team members
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Default Role for New Members</label>
            <select className="w-full p-2 border rounded-md">
              <option value="content-creator">Content Creator</option>
              <option value="legal-reviewer">Legal Reviewer</option>
              <option value="insurance-analyst">Insurance Analyst</option>
            </select>
            <p className="text-xs text-muted-foreground">
              New team members will be assigned this role by default
            </p>
          </div>

          <Button onClick={() => toast.success("Role assignment rules saved!")}>
            Save Rules
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
