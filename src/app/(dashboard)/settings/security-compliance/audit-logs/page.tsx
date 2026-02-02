"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { FileSearch, Download, Search, Filter } from "lucide-react";
import { SettingsPageHeader } from "@/components/settings/SettingsPageHeader";

// Mock audit log data
const auditLogs = [
  {
    id: "1",
    timestamp: "2026-02-02 14:23:15",
    user: "Sarah Johnson",
    action: "Updated team member role",
    resource: "Team Settings",
    ipAddress: "192.168.1.100",
    severity: "info",
  },
  {
    id: "2",
    timestamp: "2026-02-02 13:45:32",
    user: "Michael Chen",
    action: "Approved AI tool",
    resource: "AI Tools",
    ipAddress: "192.168.1.101",
    severity: "info",
  },
  {
    id: "3",
    timestamp: "2026-02-02 12:18:47",
    user: "System",
    action: "Failed login attempt",
    resource: "Authentication",
    ipAddress: "203.0.113.42",
    severity: "warning",
  },
  {
    id: "4",
    timestamp: "2026-02-02 11:05:21",
    user: "Emma Davis",
    action: "Exported compliance report",
    resource: "Reports",
    ipAddress: "192.168.1.102",
    severity: "info",
  },
  {
    id: "5",
    timestamp: "2026-02-02 10:32:58",
    user: "James Wilson",
    action: "Modified risk thresholds",
    resource: "Risk Settings",
    ipAddress: "192.168.1.103",
    severity: "high",
  },
];

export default function AuditLogsPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <SettingsPageHeader
        title="Audit Logs"
        description="View and export comprehensive audit logs for compliance tracking"
        actions={
          <Button onClick={() => toast.success("Exporting audit logs...")}>
            <Download className="mr-2 h-4 w-4" />
            Export Logs
          </Button>
        }
      />

      {/* Log Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            <CardTitle>Filter Logs</CardTitle>
          </div>
          <CardDescription>
            Search and filter audit logs by user, action, date range, and severity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search logs..."
                  className="pl-9"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="user-filter">User</Label>
              <Select defaultValue="all">
                <SelectTrigger id="user-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="sarah">Sarah Johnson</SelectItem>
                  <SelectItem value="michael">Michael Chen</SelectItem>
                  <SelectItem value="emma">Emma Davis</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="action-filter">Action Type</Label>
              <Select defaultValue="all">
                <SelectTrigger id="action-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  <SelectItem value="auth">Authentication</SelectItem>
                  <SelectItem value="settings">Settings Changes</SelectItem>
                  <SelectItem value="approval">Approvals</SelectItem>
                  <SelectItem value="export">Data Exports</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="severity-filter">Severity</Label>
              <Select defaultValue="all">
                <SelectTrigger id="severity-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Severities</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="info">Info</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-4 mt-4">
            <div className="flex-1 grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date-from">From Date</Label>
                <Input id="date-from" type="date" defaultValue="2026-02-01" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date-to">To Date</Label>
                <Input id="date-to" type="date" defaultValue="2026-02-02" />
              </div>
            </div>
            <div className="flex items-end gap-2">
              <Button>Apply Filters</Button>
              <Button variant="outline">Reset</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Audit Logs Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileSearch className="h-5 w-5" />
            <CardTitle>Activity Log</CardTitle>
          </div>
          <CardDescription>
            Detailed record of all system and user activities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Timestamp</th>
                  <th className="text-left py-3 px-4 font-medium">User</th>
                  <th className="text-left py-3 px-4 font-medium">Action</th>
                  <th className="text-left py-3 px-4 font-medium">Resource</th>
                  <th className="text-left py-3 px-4 font-medium">IP Address</th>
                  <th className="text-left py-3 px-4 font-medium">Severity</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.map((log) => (
                  <tr key={log.id} className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4 font-mono text-xs">{log.timestamp}</td>
                    <td className="py-3 px-4">{log.user}</td>
                    <td className="py-3 px-4">{log.action}</td>
                    <td className="py-3 px-4">{log.resource}</td>
                    <td className="py-3 px-4 font-mono text-xs">{log.ipAddress}</td>
                    <td className="py-3 px-4">
                      <Badge 
                        variant={
                          log.severity === "high" ? "destructive" :
                          log.severity === "warning" ? "secondary" :
                          "outline"
                        }
                        className="text-xs"
                      >
                        {log.severity}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-muted-foreground">
              Showing 5 of 1,234 log entries
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">Previous</Button>
              <Button variant="outline" size="sm">Next</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Retention Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Log Retention Settings</CardTitle>
          <CardDescription>
            Configure how long audit logs are retained
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="retention-period">Retention Period</Label>
            <Select defaultValue="365">
              <SelectTrigger id="retention-period">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="90">90 days</SelectItem>
                <SelectItem value="180">180 days</SelectItem>
                <SelectItem value="365">1 year (365 days)</SelectItem>
                <SelectItem value="730">2 years (730 days)</SelectItem>
                <SelectItem value="1825">5 years (1825 days)</SelectItem>
                <SelectItem value="forever">Forever</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Audit logs older than this period will be automatically deleted
            </p>
          </div>

          <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Compliance Note:</strong> Many compliance frameworks (SOC2, ISO27001, GDPR) require audit logs to be retained for at least 1-2 years. Consider your regulatory requirements when setting retention periods.
            </p>
          </div>

          <Button onClick={() => toast.success("Retention settings saved!")}>
            Save Retention Settings
          </Button>
        </CardContent>
      </Card>

      {/* Export Options */}
      <Card>
        <CardHeader>
          <CardTitle>Export Options</CardTitle>
          <CardDescription>
            Configure and schedule audit log exports
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="export-format">Export Format</Label>
            <Select defaultValue="csv">
              <SelectTrigger id="export-format">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="csv">CSV</SelectItem>
                <SelectItem value="json">JSON</SelectItem>
                <SelectItem value="pdf">PDF Report</SelectItem>
                <SelectItem value="siem">SIEM Format</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="export-schedule">Automated Export Schedule</Label>
            <Select defaultValue="none">
              <SelectTrigger id="export-schedule">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No automated exports</SelectItem>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="quarterly">Quarterly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={() => toast.success("Export settings saved!")}>
            Save Export Settings
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
