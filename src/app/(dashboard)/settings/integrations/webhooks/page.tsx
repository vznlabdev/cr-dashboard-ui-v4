"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { 
  Webhook, 
  Plus, 
  Settings, 
  Trash2, 
  Copy,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Send,
  Eye
} from "lucide-react";
import { SettingsPageHeader } from "@/components/settings/SettingsPageHeader";
import { cn } from "@/lib/utils";

interface WebhookEndpoint {
  id: string;
  url: string;
  description: string;
  events: string[];
  active: boolean;
  secret: string;
  createdAt: string;
  lastDelivery?: string;
  deliverySuccess?: number;
  deliveryFailure?: number;
}

interface DeliveryLog {
  id: string;
  webhookId: string;
  event: string;
  status: "success" | "failed" | "pending";
  statusCode?: number;
  timestamp: string;
  duration?: string;
  retries?: number;
}

const availableEvents = [
  { value: "asset.created", label: "Asset Created" },
  { value: "asset.updated", label: "Asset Updated" },
  { value: "asset.deleted", label: "Asset Deleted" },
  { value: "project.created", label: "Project Created" },
  { value: "project.completed", label: "Project Completed" },
  { value: "compliance.check", label: "Compliance Check" },
  { value: "legal.review", label: "Legal Review" },
  { value: "user.invited", label: "User Invited" },
  { value: "integration.connected", label: "Integration Connected" },
];

const mockWebhooks: WebhookEndpoint[] = [
  {
    id: "wh_1",
    url: "https://api.example.com/webhooks/cr",
    description: "Production webhook for all asset events",
    events: ["asset.created", "asset.updated", "asset.deleted"],
    active: true,
    secret: "whsec_abc123...",
    createdAt: "January 15, 2024",
    lastDelivery: "2 minutes ago",
    deliverySuccess: 1247,
    deliveryFailure: 3
  },
  {
    id: "wh_2",
    url: "https://slack-webhook.example.com/notify",
    description: "Slack notifications for compliance events",
    events: ["compliance.check", "legal.review"],
    active: true,
    secret: "whsec_xyz789...",
    createdAt: "January 10, 2024",
    lastDelivery: "15 minutes ago",
    deliverySuccess: 342,
    deliveryFailure: 0
  },
  {
    id: "wh_3",
    url: "https://dev.example.com/webhook-test",
    description: "Development testing webhook",
    events: ["asset.created", "project.created"],
    active: false,
    secret: "whsec_dev456...",
    createdAt: "December 20, 2023",
    deliverySuccess: 89,
    deliveryFailure: 12
  }
];

const mockDeliveryLogs: DeliveryLog[] = [
  {
    id: "log_1",
    webhookId: "wh_1",
    event: "asset.created",
    status: "success",
    statusCode: 200,
    timestamp: "2 minutes ago",
    duration: "142ms",
    retries: 0
  },
  {
    id: "log_2",
    webhookId: "wh_1",
    event: "asset.updated",
    status: "success",
    statusCode: 200,
    timestamp: "5 minutes ago",
    duration: "98ms",
    retries: 0
  },
  {
    id: "log_3",
    webhookId: "wh_2",
    event: "compliance.check",
    status: "success",
    statusCode: 200,
    timestamp: "15 minutes ago",
    duration: "201ms",
    retries: 0
  },
  {
    id: "log_4",
    webhookId: "wh_1",
    event: "asset.deleted",
    status: "failed",
    statusCode: 500,
    timestamp: "1 hour ago",
    duration: "5000ms",
    retries: 2
  },
  {
    id: "log_5",
    webhookId: "wh_3",
    event: "project.created",
    status: "pending",
    timestamp: "2 hours ago",
    retries: 1
  }
];

export default function WebhooksPage() {
  const [webhooks, setWebhooks] = useState<WebhookEndpoint[]>(mockWebhooks);
  const [deliveryLogs] = useState<DeliveryLog[]>(mockDeliveryLogs);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [testDialogOpen, setTestDialogOpen] = useState(false);
  const [selectedWebhook, setSelectedWebhook] = useState<string | null>(null);
  
  // Form state
  const [newWebhookUrl, setNewWebhookUrl] = useState("");
  const [newWebhookDescription, setNewWebhookDescription] = useState("");
  const [newWebhookEvents, setNewWebhookEvents] = useState<string[]>([]);

  const handleCreateWebhook = () => {
    if (!newWebhookUrl || newWebhookEvents.length === 0) {
      toast.error("Please fill in all required fields");
      return;
    }

    const newWebhook: WebhookEndpoint = {
      id: `wh_${Date.now()}`,
      url: newWebhookUrl,
      description: newWebhookDescription,
      events: newWebhookEvents,
      active: true,
      secret: `whsec_${Math.random().toString(36).substring(7)}...`,
      createdAt: new Date().toLocaleDateString("en-US", { 
        year: "numeric", 
        month: "long", 
        day: "numeric" 
      }),
      deliverySuccess: 0,
      deliveryFailure: 0
    };

    setWebhooks([...webhooks, newWebhook]);
    setCreateDialogOpen(false);
    setNewWebhookUrl("");
    setNewWebhookDescription("");
    setNewWebhookEvents([]);
    toast.success("Webhook created successfully");
  };

  const handleToggleWebhook = (id: string) => {
    setWebhooks(webhooks.map(wh => 
      wh.id === id ? { ...wh, active: !wh.active } : wh
    ));
    toast.success("Webhook status updated");
  };

  const handleDeleteWebhook = (id: string) => {
    setWebhooks(webhooks.filter(wh => wh.id !== id));
    toast.info("Webhook deleted");
  };

  const handleTestWebhook = (id: string) => {
    setSelectedWebhook(id);
    setTestDialogOpen(true);
  };

  const handleSendTestEvent = () => {
    toast.success("Test event sent successfully");
    setTestDialogOpen(false);
  };

  const handleCopySecret = (secret: string) => {
    navigator.clipboard.writeText(secret);
    toast.success("Secret copied to clipboard");
  };

  const activeWebhooksCount = webhooks.filter(w => w.active).length;
  const totalDeliveries = webhooks.reduce((sum, w) => sum + (w.deliverySuccess || 0) + (w.deliveryFailure || 0), 0);
  const successRate = totalDeliveries > 0 
    ? Math.round((webhooks.reduce((sum, w) => sum + (w.deliverySuccess || 0), 0) / totalDeliveries) * 100)
    : 100;

  return (
    <div className="space-y-6 animate-fade-in">
      <SettingsPageHeader
        title="Webhooks"
        description="Configure webhook endpoints for real-time event notifications"
        actions={
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="transition-all duration-150">
                <Plus className="mr-2 h-4 w-4" />
                Create Webhook
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Webhook</DialogTitle>
                <DialogDescription>
                  Add a new webhook endpoint to receive event notifications
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="webhook-url">Endpoint URL *</Label>
                  <Input
                    id="webhook-url"
                    placeholder="https://api.example.com/webhooks"
                    value={newWebhookUrl}
                    onChange={(e) => setNewWebhookUrl(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="webhook-description">Description</Label>
                  <Input
                    id="webhook-description"
                    placeholder="Describe what this webhook is for"
                    value={newWebhookDescription}
                    onChange={(e) => setNewWebhookDescription(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Events to Subscribe *</Label>
                  <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 border rounded-md">
                    {availableEvents.map(event => (
                      <label key={event.value} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={newWebhookEvents.includes(event.value)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setNewWebhookEvents([...newWebhookEvents, event.value]);
                            } else {
                              setNewWebhookEvents(newWebhookEvents.filter(ev => ev !== event.value));
                            }
                          }}
                          className="rounded"
                        />
                        <span className="text-sm">{event.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateWebhook}>
                  Create Webhook
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Webhooks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{webhooks.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{activeWebhooksCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Deliveries
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDeliveries.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Success Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{successRate}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Webhooks List */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Webhook className="h-5 w-5" />
            <CardTitle>Webhook Endpoints</CardTitle>
          </div>
          <CardDescription>
            Manage your webhook endpoints and monitor delivery status
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {webhooks.length === 0 ? (
            <div className="text-center py-12">
              <Webhook className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground mb-4">No webhooks configured yet</p>
              <Button variant="outline" onClick={() => setCreateDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Webhook
              </Button>
            </div>
          ) : (
            webhooks.map((webhook, index) => (
              <div key={webhook.id}>
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold truncate">{webhook.url}</h4>
                        <Badge variant={webhook.active ? "default" : "secondary"}>
                          {webhook.active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      {webhook.description && (
                        <p className="text-sm text-muted-foreground mb-2">{webhook.description}</p>
                      )}
                      <div className="flex flex-wrap gap-1 mb-2">
                        {webhook.events.map(event => (
                          <Badge key={event} variant="outline" className="text-xs">
                            {availableEvents.find(e => e.value === event)?.label || event}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                        <span>Created {webhook.createdAt}</span>
                        {webhook.lastDelivery && <span>Last delivery {webhook.lastDelivery}</span>}
                        <span className="text-green-500">{webhook.deliverySuccess} successful</span>
                        {webhook.deliveryFailure! > 0 && (
                          <span className="text-destructive">{webhook.deliveryFailure} failed</span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleTestWebhook(webhook.id)}
                        className="transition-all duration-150"
                      >
                        <Send className="h-4 w-4 mr-2" />
                        Test
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toast.info("Webhook settings coming soon")}
                        className="transition-all duration-150"
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteWebhook(webhook.id)}
                        className="transition-all duration-150"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {/* Webhook Secret */}
                  <div className="bg-muted/50 p-3 rounded-md">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <p className="text-xs font-medium mb-1">Signing Secret</p>
                        <code className="text-xs text-muted-foreground">{webhook.secret}</code>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopySecret(webhook.secret)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Toggle Active */}
                  <div className="flex items-center justify-between p-3 bg-muted/30 rounded-md">
                    <Label htmlFor={`active-${webhook.id}`} className="text-sm cursor-pointer">
                      Enable webhook endpoint
                    </Label>
                    <Switch
                      id={`active-${webhook.id}`}
                      checked={webhook.active}
                      onCheckedChange={() => handleToggleWebhook(webhook.id)}
                    />
                  </div>
                </div>
                {index < webhooks.length - 1 && <Separator className="mt-4" />}
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Recent Delivery Logs */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Deliveries</CardTitle>
          <CardDescription>
            View the status of recent webhook deliveries
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {deliveryLogs.map((log) => {
              const webhook = webhooks.find(w => w.id === log.webhookId);
              return (
                <div key={log.id} className="flex items-center justify-between p-3 border rounded-md transition-all duration-150 hover:bg-accent/50">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={cn(
                      "rounded-full p-2",
                      log.status === "success" && "bg-green-500/10",
                      log.status === "failed" && "bg-destructive/10",
                      log.status === "pending" && "bg-amber-500/10"
                    )}>
                      {log.status === "success" && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                      {log.status === "failed" && <XCircle className="h-4 w-4 text-destructive" />}
                      {log.status === "pending" && <Clock className="h-4 w-4 text-amber-500" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {availableEvents.find(e => e.value === log.event)?.label || log.event}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {webhook?.url || "Unknown webhook"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    {log.statusCode && (
                      <Badge variant={log.status === "success" ? "default" : "destructive"}>
                        {log.statusCode}
                      </Badge>
                    )}
                    {log.duration && <span>{log.duration}</span>}
                    {log.retries! > 0 && (
                      <span className="text-amber-500">{log.retries} retries</span>
                    )}
                    <span>{log.timestamp}</span>
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Test Webhook Dialog */}
      <Dialog open={testDialogOpen} onOpenChange={setTestDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Test Webhook</DialogTitle>
            <DialogDescription>
              Send a test event to verify your webhook is working correctly
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Select Event Type</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Choose an event" />
                </SelectTrigger>
                <SelectContent>
                  {availableEvents.map(event => (
                    <SelectItem key={event.value} value={event.value}>
                      {event.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="bg-muted p-3 rounded-md">
              <p className="text-xs text-muted-foreground mb-2">Sample Payload:</p>
              <pre className="text-xs overflow-x-auto">
{`{
  "event": "asset.created",
  "timestamp": "${new Date().toISOString()}",
  "data": {
    "id": "ast_123",
    "name": "test-asset.jpg"
  }
}`}
              </pre>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTestDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSendTestEvent}>
              <Send className="mr-2 h-4 w-4" />
              Send Test Event
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
