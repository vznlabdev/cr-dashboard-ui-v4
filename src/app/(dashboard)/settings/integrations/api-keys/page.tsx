"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Key, Plus, Copy, Eye, EyeOff, AlertTriangle } from "lucide-react";
import { SettingsPageHeader } from "@/components/settings/SettingsPageHeader";
import { useState } from "react";

// Mock API key data
const apiKeys = [
  {
    id: "1",
    name: "Production API Key",
    key: "cr_live_******************************************1234",
    fullKey: "cr_live_sk_test_51234567890abcdefghijklmnopqrstuvwxyz1234",
    created: "2026-01-15",
    lastUsed: "2 hours ago",
    permissions: ["read", "write"],
    status: "active",
  },
  {
    id: "2",
    name: "Development API Key",
    key: "cr_test_******************************************5678",
    fullKey: "cr_test_sk_test_51234567890abcdefghijklmnopqrstuvwxyz5678",
    created: "2026-01-10",
    lastUsed: "5 days ago",
    permissions: ["read"],
    status: "active",
  },
  {
    id: "3",
    name: "Legacy Integration",
    key: "cr_live_******************************************9012",
    fullKey: "cr_live_sk_test_51234567890abcdefghijklmnopqrstuvwxyz9012",
    created: "2025-12-01",
    lastUsed: "Never",
    permissions: ["read", "write"],
    status: "revoked",
  },
];

export default function APIKeysPage() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [newKeyPermissions, setNewKeyPermissions] = useState<string[]>(["read"]);
  const [showKey, setShowKey] = useState<string | null>(null);

  const handleCreateKey = () => {
    if (newKeyName) {
      toast.success("New API key created successfully");
      setCreateDialogOpen(false);
      setNewKeyName("");
      setNewKeyPermissions(["read"]);
    }
  };

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    toast.success("API key copied to clipboard");
  };

  const handleRevokeKey = (name: string) => {
    toast.success(`API key "${name}" revoked`);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <SettingsPageHeader
        title="API Keys"
        description="Manage API keys for accessing the Creation Rights API"
        actions={
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create API Key
          </Button>
        }
      />

      {/* API Keys List */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            <CardTitle>API Keys</CardTitle>
          </div>
          <CardDescription>
            Manage your API keys for programmatic access
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {apiKeys.map((apiKey) => (
              <div 
                key={apiKey.id}
                className="p-4 rounded-lg border hover:border-gray-300 dark:hover:border-gray-700 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{apiKey.name}</h3>
                      <Badge 
                        variant={apiKey.status === "active" ? "default" : "outline"}
                        className="text-xs"
                      >
                        {apiKey.status}
                      </Badge>
                      {apiKey.permissions.map((perm) => (
                        <Badge key={perm} variant="secondary" className="text-xs">
                          {perm}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span>Created {apiKey.created}</span>
                      <span>•</span>
                      <span>Last used {apiKey.lastUsed}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <div className="relative">
                      <Input
                        type={showKey === apiKey.id ? "text" : "password"}
                        value={showKey === apiKey.id ? apiKey.fullKey : apiKey.key}
                        readOnly
                        className="font-mono text-xs pr-20"
                      />
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0"
                          onClick={() => setShowKey(showKey === apiKey.id ? null : apiKey.id)}
                        >
                          {showKey === apiKey.id ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0"
                          onClick={() => handleCopyKey(apiKey.fullKey)}
                          disabled={apiKey.status === "revoked"}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toast.info(`Regenerate ${apiKey.name}`)}
                    disabled={apiKey.status === "revoked"}
                  >
                    Regenerate
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRevokeKey(apiKey.name)}
                    disabled={apiKey.status === "revoked"}
                    className="text-red-600 hover:text-red-700"
                  >
                    Revoke
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {apiKeys.length === 0 && (
            <div className="text-center py-12">
              <Key className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground mb-4">No API keys created yet</p>
              <Button onClick={() => setCreateDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Your First API Key
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* API Usage */}
      <Card>
        <CardHeader>
          <CardTitle>API Usage</CardTitle>
          <CardDescription>
            Monitor your API usage and rate limits
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">API Calls This Month</p>
                <p className="text-2xl font-bold">12,450</p>
              </div>
              <Badge variant="secondary">75% of limit</Badge>
            </div>

            <div className="w-full h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500" style={{ width: "75%" }} />
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Current Plan Limit</p>
                <p className="font-medium">15,000 calls/month</p>
              </div>
              <div>
                <p className="text-muted-foreground">Rate Limit</p>
                <p className="font-medium">100 calls/minute</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Best Practices */}
      <Card className="border-amber-500/30">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            <CardTitle className="text-amber-600 dark:text-amber-400">Security Best Practices</CardTitle>
          </div>
          <CardDescription>
            Follow these guidelines to keep your API keys secure
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-amber-600 dark:text-amber-400">•</span>
              <span>Never commit API keys to version control (use environment variables)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-600 dark:text-amber-400">•</span>
              <span>Use different keys for development, staging, and production</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-600 dark:text-amber-400">•</span>
              <span>Rotate keys regularly and revoke unused keys immediately</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-600 dark:text-amber-400">•</span>
              <span>Use read-only keys when write access is not needed</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-600 dark:text-amber-400">•</span>
              <span>Monitor API usage for unusual activity</span>
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Create API Key Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New API Key</DialogTitle>
            <DialogDescription>
              Generate a new API key for programmatic access to Creation Rights
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="key-name">Key Name</Label>
              <Input
                id="key-name"
                placeholder="e.g., Production API Key"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Choose a descriptive name to identify this key
              </p>
            </div>

            <div className="space-y-2">
              <Label>Permissions</Label>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="perm-read"
                    checked={newKeyPermissions.includes("read")}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setNewKeyPermissions([...newKeyPermissions, "read"]);
                      } else {
                        setNewKeyPermissions(newKeyPermissions.filter(p => p !== "read"));
                      }
                    }}
                    className="rounded"
                  />
                  <label htmlFor="perm-read" className="text-sm">Read access</label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="perm-write"
                    checked={newKeyPermissions.includes("write")}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setNewKeyPermissions([...newKeyPermissions, "write"]);
                      } else {
                        setNewKeyPermissions(newKeyPermissions.filter(p => p !== "write"));
                      }
                    }}
                    className="rounded"
                  />
                  <label htmlFor="perm-write" className="text-sm">Write access</label>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
              <p className="text-sm text-amber-800 dark:text-amber-200">
                <strong>Important:</strong> This key will only be shown once. Make sure to copy and store it securely.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateKey} disabled={!newKeyName}>
              Create API Key
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
