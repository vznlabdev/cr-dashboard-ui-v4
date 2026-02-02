"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Download, Upload, FileDown, Database } from "lucide-react";
import { SettingsPageHeader } from "@/components/settings/SettingsPageHeader";

export default function ImportExportPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <SettingsPageHeader
        title="Import & Export"
        description="Manage data portability and migration"
      />

      {/* Export Data */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            <CardTitle>Export Your Data</CardTitle>
          </div>
          <CardDescription>
            Download a copy of all your data for backup or migration
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="export-format">Export Format</Label>
            <Select defaultValue="json">
              <SelectTrigger id="export-format">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="json">JSON</SelectItem>
                <SelectItem value="csv">CSV</SelectItem>
                <SelectItem value="xml">XML</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Data to Export</Label>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <input type="checkbox" id="export-assets" defaultChecked className="rounded" />
                <label htmlFor="export-assets" className="text-sm">Assets & Media</label>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="export-projects" defaultChecked className="rounded" />
                <label htmlFor="export-projects" className="text-sm">Projects & Tasks</label>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="export-team" defaultChecked className="rounded" />
                <label htmlFor="export-team" className="text-sm">Team Members</label>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="export-settings" defaultChecked className="rounded" />
                <label htmlFor="export-settings" className="text-sm">Settings & Configurations</label>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="export-audit" defaultChecked className="rounded" />
                <label htmlFor="export-audit" className="text-sm">Audit Logs</label>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Note:</strong> Large exports may take several minutes to prepare. You&apos;ll receive an email when your export is ready to download.
            </p>
          </div>

          <Button onClick={() => toast.success("Export started! You'll receive an email when it's ready.")}>
            <Download className="mr-2 h-4 w-4" />
            Start Export
          </Button>
        </CardContent>
      </Card>

      {/* Export History */}
      <Card>
        <CardHeader>
          <CardTitle>Export History</CardTitle>
          <CardDescription>
            Download previous exports (available for 30 days)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Date</th>
                  <th className="text-left py-3 px-4 font-medium">Type</th>
                  <th className="text-left py-3 px-4 font-medium">Format</th>
                  <th className="text-center py-3 px-4 font-medium">Status</th>
                  <th className="text-right py-3 px-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-3 px-4">Feb 1, 2026</td>
                  <td className="py-3 px-4">Full Export</td>
                  <td className="py-3 px-4">JSON</td>
                  <td className="text-center py-3 px-4">
                    <Badge variant="default" className="text-xs">Ready</Badge>
                  </td>
                  <td className="text-right py-3 px-4">
                    <Button variant="ghost" size="sm" onClick={() => toast.success("Downloading export...")}>
                      <FileDown className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4">Jan 15, 2026</td>
                  <td className="py-3 px-4">Assets Only</td>
                  <td className="py-3 px-4">CSV</td>
                  <td className="text-center py-3 px-4">
                    <Badge variant="default" className="text-xs">Ready</Badge>
                  </td>
                  <td className="text-right py-3 px-4">
                    <Button variant="ghost" size="sm" onClick={() => toast.success("Downloading export...")}>
                      <FileDown className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Import Data */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            <CardTitle>Import Data</CardTitle>
          </div>
          <CardDescription>
            Import data from CSV, JSON, or other systems
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-8 text-center">
            <Upload className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
            <p className="text-sm text-muted-foreground mb-4">
              Drag and drop your file here, or click to browse
            </p>
            <Button variant="outline" onClick={() => toast.info("File upload coming soon")}>
              Select File
            </Button>
          </div>

          <div className="space-y-2">
            <Label htmlFor="import-type">Import Type</Label>
            <Select defaultValue="assets">
              <SelectTrigger id="import-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="assets">Assets</SelectItem>
                <SelectItem value="projects">Projects</SelectItem>
                <SelectItem value="team">Team Members</SelectItem>
                <SelectItem value="full">Full Data Import</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
            <p className="text-sm text-amber-800 dark:text-amber-200">
              <strong>Warning:</strong> Importing data will merge with or replace existing data. Make sure to create a backup before importing.
            </p>
          </div>

          <Button onClick={() => toast.info("Import feature coming soon")}>
            <Upload className="mr-2 h-4 w-4" />
            Start Import
          </Button>
        </CardContent>
      </Card>

      {/* Scheduled Exports */}
      <Card>
        <CardHeader>
          <CardTitle>Scheduled Exports</CardTitle>
          <CardDescription>
            Automate regular data exports
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="schedule-frequency">Export Frequency</Label>
            <Select defaultValue="none">
              <SelectTrigger id="schedule-frequency">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No scheduled exports</SelectItem>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="delivery-method">Delivery Method</Label>
            <Select defaultValue="email">
              <SelectTrigger id="delivery-method">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="email">Email notification</SelectItem>
                <SelectItem value="s3">Amazon S3</SelectItem>
                <SelectItem value="gcs">Google Cloud Storage</SelectItem>
                <SelectItem value="sftp">SFTP</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={() => toast.success("Scheduled export settings saved!")}>
            Save Schedule Settings
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
