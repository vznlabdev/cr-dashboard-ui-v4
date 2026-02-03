"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectLabel, SelectSeparator, SelectGroup } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { SettingsPageHeader } from "@/components/settings/SettingsPageHeader";
import { Globe } from "lucide-react";

// Comprehensive timezone data with IANA identifiers
const timezones = [
  // Americas - North
  { value: "America/Los_Angeles", label: "Los Angeles (Pacific)", offset: "UTC-8/-7", region: "Americas" },
  { value: "America/Denver", label: "Denver (Mountain)", offset: "UTC-7/-6", region: "Americas" },
  { value: "America/Chicago", label: "Chicago (Central)", offset: "UTC-6/-5", region: "Americas" },
  { value: "America/New_York", label: "New York (Eastern)", offset: "UTC-5/-4", region: "Americas" },
  { value: "America/Toronto", label: "Toronto", offset: "UTC-5/-4", region: "Americas" },
  { value: "America/Halifax", label: "Halifax (Atlantic)", offset: "UTC-4/-3", region: "Americas" },
  { value: "America/Mexico_City", label: "Mexico City", offset: "UTC-6/-5", region: "Americas" },
  
  // Americas - South
  { value: "America/Caracas", label: "Caracas", offset: "UTC-4", region: "Americas" },
  { value: "America/Lima", label: "Lima", offset: "UTC-5", region: "Americas" },
  { value: "America/Bogota", label: "Bogotá", offset: "UTC-5", region: "Americas" },
  { value: "America/Sao_Paulo", label: "São Paulo", offset: "UTC-3", region: "Americas" },
  { value: "America/Buenos_Aires", label: "Buenos Aires", offset: "UTC-3", region: "Americas" },
  { value: "America/Santiago", label: "Santiago", offset: "UTC-3/-4", region: "Americas" },
  
  // Europe - West
  { value: "Europe/London", label: "London", offset: "UTC+0/+1", region: "Europe" },
  { value: "Europe/Dublin", label: "Dublin", offset: "UTC+0/+1", region: "Europe" },
  { value: "Europe/Lisbon", label: "Lisbon", offset: "UTC+0/+1", region: "Europe" },
  { value: "Atlantic/Reykjavik", label: "Reykjavik", offset: "UTC+0", region: "Europe" },
  
  // Europe - Central
  { value: "Europe/Paris", label: "Paris", offset: "UTC+1/+2", region: "Europe" },
  { value: "Europe/Berlin", label: "Berlin", offset: "UTC+1/+2", region: "Europe" },
  { value: "Europe/Rome", label: "Rome", offset: "UTC+1/+2", region: "Europe" },
  { value: "Europe/Madrid", label: "Madrid", offset: "UTC+1/+2", region: "Europe" },
  { value: "Europe/Amsterdam", label: "Amsterdam", offset: "UTC+1/+2", region: "Europe" },
  { value: "Europe/Brussels", label: "Brussels", offset: "UTC+1/+2", region: "Europe" },
  { value: "Europe/Vienna", label: "Vienna", offset: "UTC+1/+2", region: "Europe" },
  { value: "Europe/Warsaw", label: "Warsaw", offset: "UTC+1/+2", region: "Europe" },
  { value: "Europe/Prague", label: "Prague", offset: "UTC+1/+2", region: "Europe" },
  { value: "Europe/Stockholm", label: "Stockholm", offset: "UTC+1/+2", region: "Europe" },
  { value: "Europe/Copenhagen", label: "Copenhagen", offset: "UTC+1/+2", region: "Europe" },
  { value: "Europe/Zurich", label: "Zurich", offset: "UTC+1/+2", region: "Europe" },
  
  // Europe - East
  { value: "Europe/Athens", label: "Athens", offset: "UTC+2/+3", region: "Europe" },
  { value: "Europe/Helsinki", label: "Helsinki", offset: "UTC+2/+3", region: "Europe" },
  { value: "Europe/Bucharest", label: "Bucharest", offset: "UTC+2/+3", region: "Europe" },
  { value: "Europe/Istanbul", label: "Istanbul", offset: "UTC+3", region: "Europe" },
  { value: "Europe/Moscow", label: "Moscow", offset: "UTC+3", region: "Europe" },
  
  // Asia - West & Central
  { value: "Asia/Dubai", label: "Dubai", offset: "UTC+4", region: "Asia" },
  { value: "Asia/Karachi", label: "Karachi", offset: "UTC+5", region: "Asia" },
  { value: "Asia/Kolkata", label: "Mumbai/Delhi", offset: "UTC+5:30", region: "Asia" },
  { value: "Asia/Dhaka", label: "Dhaka", offset: "UTC+6", region: "Asia" },
  { value: "Asia/Bangkok", label: "Bangkok", offset: "UTC+7", region: "Asia" },
  
  // Asia - East
  { value: "Asia/Singapore", label: "Singapore", offset: "UTC+8", region: "Asia" },
  { value: "Asia/Hong_Kong", label: "Hong Kong", offset: "UTC+8", region: "Asia" },
  { value: "Asia/Shanghai", label: "Shanghai", offset: "UTC+8", region: "Asia" },
  { value: "Asia/Taipei", label: "Taipei", offset: "UTC+8", region: "Asia" },
  { value: "Asia/Seoul", label: "Seoul", offset: "UTC+9", region: "Asia" },
  { value: "Asia/Tokyo", label: "Tokyo", offset: "UTC+9", region: "Asia" },
  
  // Pacific
  { value: "Australia/Perth", label: "Perth", offset: "UTC+8", region: "Pacific" },
  { value: "Australia/Adelaide", label: "Adelaide", offset: "UTC+9:30/+10:30", region: "Pacific" },
  { value: "Australia/Brisbane", label: "Brisbane", offset: "UTC+10", region: "Pacific" },
  { value: "Australia/Sydney", label: "Sydney", offset: "UTC+10/+11", region: "Pacific" },
  { value: "Australia/Melbourne", label: "Melbourne", offset: "UTC+10/+11", region: "Pacific" },
  { value: "Pacific/Auckland", label: "Auckland", offset: "UTC+12/+13", region: "Pacific" },
  { value: "Pacific/Fiji", label: "Fiji", offset: "UTC+12/+13", region: "Pacific" },
  
  // Africa & Middle East
  { value: "Africa/Cairo", label: "Cairo", offset: "UTC+2", region: "Africa" },
  { value: "Africa/Johannesburg", label: "Johannesburg", offset: "UTC+2", region: "Africa" },
  { value: "Africa/Lagos", label: "Lagos", offset: "UTC+1", region: "Africa" },
  { value: "Africa/Nairobi", label: "Nairobi", offset: "UTC+3", region: "Africa" },
  
  // UTC
  { value: "UTC", label: "UTC (Coordinated Universal Time)", offset: "UTC+0", region: "UTC" },
];

export default function PreferencesPage() {
  const [detectedTimezone, setDetectedTimezone] = useState<string>("");
  const [mounted, setMounted] = useState(false);

  // Auto-detect user's timezone on mount
  useEffect(() => {
    setMounted(true);
    try {
      const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
      setDetectedTimezone(detected);
    } catch (error) {
      setDetectedTimezone("UTC");
    }
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      <SettingsPageHeader
        title="Preferences"
        description="Customize your experience with theme, language, and display settings"
      />

      {/* Appearance */}
      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>
            Customize how the application looks and feels
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="theme">Theme</Label>
            <Select defaultValue="system">
              <SelectTrigger id="theme">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Choose your preferred color scheme
            </p>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Compact Mode</Label>
              <p className="text-sm text-muted-foreground">
                Display content in a more compact layout
              </p>
            </div>
            <Switch />
          </div>
        </CardContent>
      </Card>

      {/* Localization */}
      <Card>
        <CardHeader>
          <CardTitle>Localization</CardTitle>
          <CardDescription>
            Set your language, timezone, and regional preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="language">Language</Label>
            <Select defaultValue="en">
              <SelectTrigger id="language">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="es">Español (Spanish)</SelectItem>
                <SelectItem value="fr">Français (French)</SelectItem>
                <SelectItem value="de">Deutsch (German)</SelectItem>
                <SelectItem value="it">Italiano (Italian)</SelectItem>
                <SelectItem value="pt">Português (Portuguese)</SelectItem>
                <SelectItem value="nl">Nederlands (Dutch)</SelectItem>
                <SelectItem value="pl">Polski (Polish)</SelectItem>
                <SelectItem value="ru">Русский (Russian)</SelectItem>
                <SelectItem value="ja">日本語 (Japanese)</SelectItem>
                <SelectItem value="zh-cn">简体中文 (Chinese Simplified)</SelectItem>
                <SelectItem value="zh-tw">繁體中文 (Chinese Traditional)</SelectItem>
                <SelectItem value="ko">한국어 (Korean)</SelectItem>
                <SelectItem value="ar">العربية (Arabic)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="timezone">Timezone</Label>
            {mounted && detectedTimezone && (
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="text-xs">
                  <Globe className="h-3 w-3 mr-1" />
                  Detected: {detectedTimezone}
                </Badge>
              </div>
            )}
            <Select defaultValue={detectedTimezone || "America/New_York"}>
              <SelectTrigger id="timezone">
                <SelectValue placeholder="Select timezone" />
              </SelectTrigger>
              <SelectContent className="max-h-[400px]">
                {/* UTC */}
                <SelectGroup>
                  <SelectLabel>Universal</SelectLabel>
                  {timezones.filter(tz => tz.region === "UTC").map(tz => (
                    <SelectItem key={tz.value} value={tz.value}>
                      {tz.label} ({tz.offset})
                    </SelectItem>
                  ))}
                </SelectGroup>
                
                <SelectSeparator />
                
                {/* Americas */}
                <SelectGroup>
                  <SelectLabel>Americas</SelectLabel>
                  {timezones.filter(tz => tz.region === "Americas").map(tz => (
                    <SelectItem key={tz.value} value={tz.value}>
                      {tz.label} ({tz.offset})
                    </SelectItem>
                  ))}
                </SelectGroup>
                
                <SelectSeparator />
                
                {/* Europe */}
                <SelectGroup>
                  <SelectLabel>Europe</SelectLabel>
                  {timezones.filter(tz => tz.region === "Europe").map(tz => (
                    <SelectItem key={tz.value} value={tz.value}>
                      {tz.label} ({tz.offset})
                    </SelectItem>
                  ))}
                </SelectGroup>
                
                <SelectSeparator />
                
                {/* Asia */}
                <SelectGroup>
                  <SelectLabel>Asia</SelectLabel>
                  {timezones.filter(tz => tz.region === "Asia").map(tz => (
                    <SelectItem key={tz.value} value={tz.value}>
                      {tz.label} ({tz.offset})
                    </SelectItem>
                  ))}
                </SelectGroup>
                
                <SelectSeparator />
                
                {/* Pacific */}
                <SelectGroup>
                  <SelectLabel>Pacific</SelectLabel>
                  {timezones.filter(tz => tz.region === "Pacific").map(tz => (
                    <SelectItem key={tz.value} value={tz.value}>
                      {tz.label} ({tz.offset})
                    </SelectItem>
                  ))}
                </SelectGroup>
                
                <SelectSeparator />
                
                {/* Africa & Middle East */}
                <SelectGroup>
                  <SelectLabel>Africa & Middle East</SelectLabel>
                  {timezones.filter(tz => tz.region === "Africa").map(tz => (
                    <SelectItem key={tz.value} value={tz.value}>
                      {tz.label} ({tz.offset})
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Your timezone is automatically detected but can be changed manually
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date-format">Date Format</Label>
            <Select defaultValue="mdy">
              <SelectTrigger id="date-format">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mdy">MM/DD/YYYY (US)</SelectItem>
                <SelectItem value="dmy">DD/MM/YYYY (EU)</SelectItem>
                <SelectItem value="ymd">YYYY-MM-DD (ISO)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="time-format">Time Format</Label>
            <Select defaultValue="12h">
              <SelectTrigger id="time-format">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="12h">12-hour (AM/PM)</SelectItem>
                <SelectItem value="24h">24-hour</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Default Views */}
      <Card>
        <CardHeader>
          <CardTitle>Default Views</CardTitle>
          <CardDescription>
            Set your preferred default views for different sections
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="default-page">Default Landing Page</Label>
            <Select defaultValue="dashboard">
              <SelectTrigger id="default-page">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dashboard">Dashboard</SelectItem>
                <SelectItem value="assets">Assets</SelectItem>
                <SelectItem value="projects">Projects</SelectItem>
                <SelectItem value="tasks">Tasks</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="assets-view">Assets Default View</Label>
            <Select defaultValue="grid">
              <SelectTrigger id="assets-view">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="grid">Grid View</SelectItem>
                <SelectItem value="list">List View</SelectItem>
                <SelectItem value="table">Table View</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={() => toast.success("Preferences saved successfully!")}>
          Save Preferences
        </Button>
      </div>
    </div>
  );
}
