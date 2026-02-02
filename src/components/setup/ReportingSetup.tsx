"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  BarChart3,
  Bell,
  Calendar,
  CheckCircle2,
  FolderKanban,
  Mail,
  Smartphone,
  TrendingUp,
  Users,
} from "lucide-react"

interface DashboardWidget {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  enabled: boolean
}

interface NotificationSetting {
  id: string
  label: string
  description: string
  enabled: boolean
}

interface ReportingSetupProps {
  onSave: (config: ReportingConfig) => void
  onSkip?: () => void
}

export interface ReportingConfig {
  dashboardWidgets: string[]
  reportFrequency: string
  notifications: {
    email: boolean
    push: boolean
    settings: Record<string, boolean>
  }
}

const DASHBOARD_WIDGETS: DashboardWidget[] = [
  {
    id: "project-stats",
    name: "Project Statistics",
    description: "Overview of active, completed, and pending projects",
    icon: <FolderKanban className="h-4 w-4" />,
    enabled: true,
  },
  {
    id: "task-progress",
    name: "Task Progress",
    description: "Track task completion rates and bottlenecks",
    icon: <CheckCircle2 className="h-4 w-4" />,
    enabled: true,
  },
  {
    id: "team-activity",
    name: "Team Activity",
    description: "See who's working on what in real-time",
    icon: <Users className="h-4 w-4" />,
    enabled: false,
  },
  {
    id: "upcoming-deadlines",
    name: "Upcoming Deadlines",
    description: "Calendar view of approaching due dates",
    icon: <Calendar className="h-4 w-4" />,
    enabled: true,
  },
  {
    id: "analytics",
    name: "Analytics",
    description: "Key metrics and performance indicators",
    icon: <BarChart3 className="h-4 w-4" />,
    enabled: false,
  },
  {
    id: "recent-activity",
    name: "Recent Activity",
    description: "Latest updates and changes across projects",
    icon: <TrendingUp className="h-4 w-4" />,
    enabled: true,
  },
]

const NOTIFICATION_SETTINGS: NotificationSetting[] = [
  {
    id: "task-assigned",
    label: "Task assigned to me",
    description: "Get notified when a task is assigned to you",
    enabled: true,
  },
  {
    id: "task-completed",
    label: "Task completion",
    description: "Notify when tasks you're watching are completed",
    enabled: true,
  },
  {
    id: "project-updates",
    label: "Project updates",
    description: "Updates on projects you're involved in",
    enabled: true,
  },
  {
    id: "approval-requests",
    label: "Approval requests",
    description: "When assets need your review or approval",
    enabled: true,
  },
  {
    id: "mentions",
    label: "Mentions",
    description: "When someone mentions you in comments",
    enabled: true,
  },
  {
    id: "deadline-reminders",
    label: "Deadline reminders",
    description: "Reminders for approaching deadlines",
    enabled: true,
  },
]

export function ReportingSetup({ onSave, onSkip }: ReportingSetupProps) {
  const [widgets, setWidgets] = useState<DashboardWidget[]>(DASHBOARD_WIDGETS)
  const [reportFrequency, setReportFrequency] = useState("weekly")
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [pushNotifications, setPushNotifications] = useState(true)
  const [notificationSettings, setNotificationSettings] =
    useState<NotificationSetting[]>(NOTIFICATION_SETTINGS)

  const handleWidgetToggle = (id: string, enabled: boolean) => {
    setWidgets((prev) =>
      prev.map((widget) => (widget.id === id ? { ...widget, enabled } : widget))
    )
  }

  const handleNotificationToggle = (id: string, enabled: boolean) => {
    setNotificationSettings((prev) =>
      prev.map((setting) => (setting.id === id ? { ...setting, enabled } : setting))
    )
  }

  const handleSave = () => {
    const config: ReportingConfig = {
      dashboardWidgets: widgets.filter((w) => w.enabled).map((w) => w.id),
      reportFrequency,
      notifications: {
        email: emailNotifications,
        push: pushNotifications,
        settings: notificationSettings.reduce(
          (acc, setting) => ({
            ...acc,
            [setting.id]: setting.enabled,
          }),
          {}
        ),
      },
    }
    onSave(config)
  }

  const enabledWidgetsCount = widgets.filter((w) => w.enabled).length
  const enabledNotificationsCount = notificationSettings.filter((n) => n.enabled).length

  return (
    <div className="space-y-6">
      {/* Dashboard Layout */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Dashboard Layout
          </CardTitle>
          <CardDescription>
            Choose which widgets to display on your dashboard
            {enabledWidgetsCount > 0 && ` (${enabledWidgetsCount} enabled)`}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {widgets.map((widget) => (
            <div
              key={widget.id}
              className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded bg-primary/10 flex items-center justify-center">
                  {widget.icon}
                </div>
                <div>
                  <p className="font-medium text-sm">{widget.name}</p>
                  <p className="text-xs text-muted-foreground">{widget.description}</p>
                </div>
              </div>
              <Switch
                checked={widget.enabled}
                onCheckedChange={(checked) => handleWidgetToggle(widget.id, checked)}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Report Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Report Preferences</CardTitle>
          <CardDescription>Configure automated report delivery</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="report-frequency">Report Frequency</Label>
            <Select value={reportFrequency} onValueChange={setReportFrequency}>
              <SelectTrigger id="report-frequency">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="biweekly">Bi-weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="never">Never</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Receive summary reports via email at your chosen frequency
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Preferences
            <Badge variant="secondary" className="ml-auto">
              Required
            </Badge>
          </CardTitle>
          <CardDescription>
            Choose how and when you receive notifications
            {enabledNotificationsCount > 0 && ` (${enabledNotificationsCount} enabled)`}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Notification Channels */}
          <div className="space-y-3 pb-4 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div>
                  <Label>Email Notifications</Label>
                  <p className="text-xs text-muted-foreground">
                    Receive notifications via email
                  </p>
                </div>
              </div>
              <Switch
                checked={emailNotifications}
                onCheckedChange={setEmailNotifications}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Smartphone className="h-4 w-4 text-muted-foreground" />
                <div>
                  <Label>Push Notifications</Label>
                  <p className="text-xs text-muted-foreground">
                    Receive notifications in your browser
                  </p>
                </div>
              </div>
              <Switch
                checked={pushNotifications}
                onCheckedChange={setPushNotifications}
              />
            </div>
          </div>

          {/* Notification Types */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold">Notification Types</Label>
            {notificationSettings.map((setting) => (
              <div
                key={setting.id}
                className="flex items-start justify-between p-2 rounded hover:bg-muted/20 transition-colors"
              >
                <div className="space-y-0.5">
                  <Label className="font-normal cursor-pointer">{setting.label}</Label>
                  <p className="text-xs text-muted-foreground">{setting.description}</p>
                </div>
                <Checkbox
                  checked={setting.enabled}
                  onCheckedChange={(checked) =>
                    handleNotificationToggle(setting.id, checked === true)
                  }
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-between pt-4">
        {onSkip && (
          <Button type="button" variant="ghost" onClick={onSkip}>
            Use default settings
          </Button>
        )}
        <Button onClick={handleSave} className="ml-auto">
          Save Reporting Configuration
        </Button>
      </div>
    </div>
  )
}
