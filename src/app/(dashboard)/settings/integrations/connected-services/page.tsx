"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { 
  Link2, 
  CheckCircle2, 
  XCircle, 
  Settings, 
  ExternalLink,
  RefreshCw,
  AlertCircle
} from "lucide-react";
import { SettingsPageHeader } from "@/components/settings/SettingsPageHeader";
import { cn } from "@/lib/utils";

interface ConnectedService {
  id: string;
  name: string;
  description: string;
  icon: string;
  connected: boolean;
  lastSync?: string;
  scopes?: string[];
  status?: "active" | "warning" | "error";
  connectedAt?: string;
}

const services: ConnectedService[] = [
  {
    id: "google",
    name: "Google Workspace",
    description: "Sync content metadata and user information",
    icon: "🔵",
    connected: true,
    lastSync: "2 minutes ago",
    status: "active",
    connectedAt: "January 15, 2024",
    scopes: ["drive.readonly", "user.email"]
  },
  {
    id: "slack",
    name: "Slack",
    description: "Send notifications and alerts to Slack channels",
    icon: "💬",
    connected: true,
    lastSync: "5 minutes ago",
    status: "active",
    connectedAt: "January 10, 2024",
    scopes: ["chat:write", "channels:read"]
  },
  {
    id: "github",
    name: "GitHub",
    description: "Connect repositories for code provenance tracking",
    icon: "🐙",
    connected: false,
    scopes: ["repo", "read:user"]
  },
  {
    id: "dropbox",
    name: "Dropbox",
    description: "Sync assets and documents from Dropbox",
    icon: "📦",
    connected: false,
    scopes: ["files.content.read"]
  },
  {
    id: "figma",
    name: "Figma",
    description: "Import design files and track creative provenance",
    icon: "🎨",
    connected: true,
    lastSync: "1 hour ago",
    status: "warning",
    connectedAt: "December 20, 2023",
    scopes: ["file:read"]
  },
  {
    id: "notion",
    name: "Notion",
    description: "Sync documentation and project information",
    icon: "📝",
    connected: false,
    scopes: ["read:content"]
  },
  {
    id: "zapier",
    name: "Zapier",
    description: "Create automated workflows and integrations",
    icon: "⚡",
    connected: false,
    scopes: ["zap:write"]
  },
  {
    id: "salesforce",
    name: "Salesforce",
    description: "Sync client data and project information",
    icon: "☁️",
    connected: false,
    scopes: ["api", "refresh_token"]
  }
];

export default function ConnectedServicesPage() {
  const [servicesList, setServicesList] = useState(services);
  const [loading, setLoading] = useState<string | null>(null);

  const handleConnect = async (serviceId: string) => {
    setLoading(serviceId);
    // Simulate OAuth flow
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setServicesList(prev => prev.map(service => 
      service.id === serviceId 
        ? { 
            ...service, 
            connected: true, 
            status: "active", 
            lastSync: "Just now",
            connectedAt: new Date().toLocaleDateString("en-US", { 
              year: "numeric", 
              month: "long", 
              day: "numeric" 
            })
          }
        : service
    ));
    
    setLoading(null);
    toast.success(`Connected to ${services.find(s => s.id === serviceId)?.name}`);
  };

  const handleDisconnect = async (serviceId: string) => {
    setLoading(serviceId);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setServicesList(prev => prev.map(service => 
      service.id === serviceId 
        ? { ...service, connected: false, lastSync: undefined, status: undefined, connectedAt: undefined }
        : service
    ));
    
    setLoading(null);
    toast.info(`Disconnected from ${services.find(s => s.id === serviceId)?.name}`);
  };

  const handleRefresh = async (serviceId: string) => {
    setLoading(serviceId);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setServicesList(prev => prev.map(service => 
      service.id === serviceId 
        ? { ...service, lastSync: "Just now" }
        : service
    ));
    
    setLoading(null);
    toast.success("Connection refreshed successfully");
  };

  const connectedCount = servicesList.filter(s => s.connected).length;

  return (
    <div className="space-y-6 animate-fade-in">
      <SettingsPageHeader
        title="Connected Services"
        description="Manage third-party service integrations and OAuth connections"
      />

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Services
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{servicesList.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Connected
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{connectedCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Available
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{servicesList.length - connectedCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Services List */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Link2 className="h-5 w-5" />
            <CardTitle>Available Services</CardTitle>
          </div>
          <CardDescription>
            Connect external services to enhance your workflow
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {servicesList.map((service, index) => (
            <div key={service.id}>
              <div className="flex items-start gap-4">
                {/* Service Icon */}
                <div className="text-3xl mt-1">{service.icon}</div>

                {/* Service Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-1">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{service.name}</h3>
                        {service.connected && (
                          <Badge 
                            variant={service.status === "active" ? "default" : service.status === "warning" ? "secondary" : "destructive"}
                            className="text-xs"
                          >
                            {service.status === "active" && <CheckCircle2 className="h-3 w-3 mr-1" />}
                            {service.status === "warning" && <AlertCircle className="h-3 w-3 mr-1" />}
                            {service.status === "error" && <XCircle className="h-3 w-3 mr-1" />}
                            {service.status === "active" ? "Connected" : service.status === "warning" ? "Attention needed" : "Error"}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {service.description}
                      </p>
                      
                      {service.connected && (
                        <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                          {service.connectedAt && (
                            <span>Connected on {service.connectedAt}</span>
                          )}
                          {service.lastSync && (
                            <span>Last synced {service.lastSync}</span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      {service.connected ? (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRefresh(service.id)}
                            disabled={loading === service.id}
                            className="transition-all duration-150"
                          >
                            <RefreshCw className={cn(
                              "h-4 w-4 mr-2",
                              loading === service.id && "animate-spin"
                            )} />
                            Refresh
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toast.info("Service settings coming soon")}
                            className="transition-all duration-150"
                          >
                            <Settings className="h-4 w-4 mr-2" />
                            Configure
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDisconnect(service.id)}
                            disabled={loading === service.id}
                            className="transition-all duration-150"
                          >
                            {loading === service.id ? "Disconnecting..." : "Disconnect"}
                          </Button>
                        </>
                      ) : (
                        <Button
                          onClick={() => handleConnect(service.id)}
                          disabled={loading === service.id}
                          size="sm"
                          className="transition-all duration-150"
                        >
                          {loading === service.id ? "Connecting..." : "Connect"}
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Scopes/Permissions */}
                  {service.scopes && (
                    <div className="mt-2">
                      <p className="text-xs text-muted-foreground mb-1">Required permissions:</p>
                      <div className="flex flex-wrap gap-1">
                        {service.scopes.map(scope => (
                          <Badge key={scope} variant="outline" className="text-xs">
                            {scope}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {index < servicesList.length - 1 && <Separator className="mt-4" />}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Help Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Need Help?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            Connecting services allows Creation Rights to automatically sync data, 
            send notifications, and enhance your workflow.
          </p>
          <Button
            variant="link"
            className="h-auto p-0 text-sm"
            onClick={() => window.open("https://docs.example.com/integrations", "_blank")}
          >
            <ExternalLink className="h-3 w-3 mr-1" />
            View integration documentation
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
