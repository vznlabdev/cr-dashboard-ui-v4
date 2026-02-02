"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Code, Book, Terminal, Zap } from "lucide-react";
import { SettingsPageHeader } from "@/components/settings/SettingsPageHeader";

export default function DeveloperPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <SettingsPageHeader
        title="Developer Settings"
        description="API documentation, rate limits, and developer tools"
      />

      {/* API Documentation */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Book className="h-5 w-5" />
            <CardTitle>API Documentation</CardTitle>
          </div>
          <CardDescription>
            Learn how to integrate with the Creation Rights API
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Access comprehensive documentation for the Creation Rights API, including authentication,
            endpoints, request/response formats, and code examples.
          </p>

          <div className="flex gap-2">
            <Button onClick={() => toast.info("Opening API docs...")}>
              <Book className="mr-2 h-4 w-4" />
              View Documentation
            </Button>
            <Button variant="outline" onClick={() => toast.info("Opening getting started guide...")}>
              Quick Start Guide
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* API Endpoints */}
      <Card>
        <CardHeader>
          <CardTitle>API Endpoints</CardTitle>
          <CardDescription>
            Base URLs for different environments
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-3 bg-muted rounded-lg">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium">Production</span>
              <Badge variant="default">Live</Badge>
            </div>
            <code className="text-xs">https://api.creationrights.com/v1</code>
          </div>

          <div className="p-3 bg-muted rounded-lg">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium">Sandbox</span>
              <Badge variant="secondary">Test</Badge>
            </div>
            <code className="text-xs">https://sandbox.api.creationrights.com/v1</code>
          </div>
        </CardContent>
      </Card>

      {/* Rate Limits */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            <CardTitle>Rate Limits</CardTitle>
          </div>
          <CardDescription>
            Current API rate limits for your plan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Requests per Minute</p>
              <p className="text-2xl font-bold">100</p>
            </div>
            <div className="p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Requests per Month</p>
              <p className="text-2xl font-bold">15,000</p>
            </div>
            <div className="p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Burst Limit</p>
              <p className="text-2xl font-bold">200</p>
            </div>
            <div className="p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Webhook Retries</p>
              <p className="text-2xl font-bold">3</p>
            </div>
          </div>

          <div className="mt-4 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              Need higher limits? <Button variant="link" className="h-auto p-0 text-blue-800 dark:text-blue-200" onClick={() => toast.info("Contact sales")}>Contact our sales team</Button> to discuss enterprise plans.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* SDK & Libraries */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Terminal className="h-5 w-5" />
            <CardTitle>SDKs & Libraries</CardTitle>
          </div>
          <CardDescription>
            Official client libraries for popular languages
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Button variant="outline" className="justify-start" onClick={() => toast.info("JavaScript SDK coming soon")}>
              <Code className="mr-2 h-4 w-4" />
              JavaScript / TypeScript
            </Button>
            <Button variant="outline" className="justify-start" onClick={() => toast.info("Python SDK coming soon")}>
              <Code className="mr-2 h-4 w-4" />
              Python
            </Button>
            <Button variant="outline" className="justify-start" onClick={() => toast.info("Ruby SDK coming soon")}>
              <Code className="mr-2 h-4 w-4" />
              Ruby
            </Button>
            <Button variant="outline" className="justify-start" onClick={() => toast.info("PHP SDK coming soon")}>
              <Code className="mr-2 h-4 w-4" />
              PHP
            </Button>
            <Button variant="outline" className="justify-start" onClick={() => toast.info("Java SDK coming soon")}>
              <Code className="mr-2 h-4 w-4" />
              Java
            </Button>
            <Button variant="outline" className="justify-start" onClick={() => toast.info("Go SDK coming soon")}>
              <Code className="mr-2 h-4 w-4" />
              Go
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* API Logs */}
      <Card>
        <CardHeader>
          <CardTitle>API Logs</CardTitle>
          <CardDescription>
            Monitor your API requests and responses
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Terminal className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground mb-4">API logs feature coming soon</p>
            <Button variant="outline" onClick={() => toast.info("Feature in development")}>
              View API Logs
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
