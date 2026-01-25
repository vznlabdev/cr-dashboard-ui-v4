"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Download, TrendingUp, Users, FolderOpen, CheckCircle, Activity } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { toast } from "sonner";

interface ToolUsageAnalyticsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tool: {
    name: string;
    icon?: string;
    taskCount: number;
    projectCount: number;
  };
}

// Mock data - in real app this would come from API
const generateMockData = (toolName: string) => {
  // Timeline data for last 30 days
  const timelineData = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    return {
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      tasks: Math.floor(Math.random() * 12) + 2,
    };
  });

  // Top users
  const topUsers = [
    { name: "Sarah Chen", tasks: 45, avatar: "SC" },
    { name: "Michael Rodriguez", tasks: 38, avatar: "MR" },
    { name: "Emma Wilson", tasks: 32, avatar: "EW" },
    { name: "James Kim", tasks: 27, avatar: "JK" },
    { name: "Lisa Anderson", tasks: 24, avatar: "LA" },
  ];

  // Top projects
  const topProjects = [
    { name: "Brand Refresh Campaign", tasks: 34, status: "active" },
    { name: "Product Launch Q1", tasks: 28, status: "active" },
    { name: "Social Media Content", tasks: 23, status: "active" },
    { name: "Website Redesign", tasks: 18, status: "completed" },
    { name: "Marketing Materials", tasks: 15, status: "active" },
  ];

  // Recent activity
  const recentActivity = [
    { id: "1", taskName: "Generate hero image variations", creator: "Sarah Chen", date: "2 hours ago", status: "active" },
    { id: "2", taskName: "Create product showcase images", creator: "Michael Rodriguez", date: "4 hours ago", status: "completed" },
    { id: "3", taskName: "Design social media assets", creator: "Emma Wilson", date: "6 hours ago", status: "active" },
    { id: "4", taskName: "Generate brand mood board", creator: "James Kim", date: "8 hours ago", status: "completed" },
    { id: "5", taskName: "Create marketing banners", creator: "Lisa Anderson", date: "1 day ago", status: "completed" },
    { id: "6", taskName: "Generate concept art", creator: "Sarah Chen", date: "1 day ago", status: "active" },
    { id: "7", taskName: "Design email headers", creator: "Michael Rodriguez", date: "2 days ago", status: "completed" },
    { id: "8", taskName: "Create thumbnail variations", creator: "Emma Wilson", date: "2 days ago", status: "completed" },
    { id: "9", taskName: "Generate background patterns", creator: "James Kim", date: "3 days ago", status: "completed" },
    { id: "10", taskName: "Design presentation slides", creator: "Lisa Anderson", date: "3 days ago", status: "completed" },
  ];

  return {
    overview: {
      totalTasks: 156,
      activeTasks: 23,
      completedTasks: 133,
      projects: 12,
    },
    timelineData,
    topUsers,
    topProjects,
    trackingQuality: {
      evidenceCaptured: 98,
      extensionActiveRate: 95,
    },
    recentActivity,
  };
};

export function ToolUsageAnalyticsModal({ 
  open, 
  onOpenChange,
  tool,
}: ToolUsageAnalyticsModalProps) {
  const data = generateMockData(tool.name);

  const handleExportCSV = () => {
    // In real app, this would generate and download a CSV file
    toast.success(`Exporting ${tool.name} usage data to CSV...`);
  };

  const handleTaskClick = (taskId: string, taskName: string) => {
    toast.info(`Opening task: ${taskName}`);
    // In real app, this would navigate to the task page
  };

  const getQualityColor = (percentage: number) => {
    if (percentage > 90) return "text-green-600 dark:text-green-400";
    if (percentage > 70) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  const getQualityBadge = (percentage: number) => {
    if (percentage > 90) return "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800";
    if (percentage > 70) return "bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800";
    return "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto !bg-white dark:!bg-gray-950 !backdrop-blur-none [backdrop-filter:none!important] [-webkit-backdrop-filter:none!important]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            {tool.icon && <span className="text-2xl">{tool.icon}</span>}
            {tool.name} Usage Analytics
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Overview Section */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total Tasks</p>
                    <p className="text-2xl font-bold">{data.overview.totalTasks}</p>
                  </div>
                  <Activity className="w-8 h-8 text-blue-500 opacity-50" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Active Tasks</p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">{data.overview.activeTasks}</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-green-500 opacity-50" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Completed</p>
                    <p className="text-2xl font-bold text-gray-700 dark:text-gray-300">{data.overview.completedTasks}</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-gray-500 opacity-50" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Projects</p>
                    <p className="text-2xl font-bold">{data.overview.projects}</p>
                  </div>
                  <FolderOpen className="w-8 h-8 text-purple-500 opacity-50" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Usage Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Usage Timeline (Last 30 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.timelineData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-800" />
                    <XAxis 
                      dataKey="date" 
                      className="text-xs"
                      tick={{ fill: 'currentColor' }}
                      interval="preserveStartEnd"
                    />
                    <YAxis 
                      className="text-xs"
                      tick={{ fill: 'currentColor' }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'var(--card)',
                        border: '1px solid var(--border)',
                        borderRadius: '0.5rem',
                      }}
                    />
                    <Bar 
                      dataKey="tasks" 
                      fill="rgb(59, 130, 246)" 
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Top Users and Top Projects */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Top Users */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Top Users
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.topUsers.map((user, index) => (
                    <div 
                      key={user.name}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-xs font-medium text-blue-700 dark:text-blue-400">
                          {user.avatar}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{user.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{user.tasks} tasks</p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        #{index + 1}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Top Projects */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <FolderOpen className="w-4 h-4" />
                  Top Projects
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.topProjects.map((project, index) => (
                    <div 
                      key={project.name}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{project.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{project.tasks} tasks</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={project.status === "active" ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {project.status}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          #{index + 1}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tracking Quality */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Tracking Quality</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-800">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium">Evidence Captured</p>
                    <Badge 
                      variant="outline"
                      className={cn("text-xs", getQualityBadge(data.trackingQuality.evidenceCaptured))}
                    >
                      {data.trackingQuality.evidenceCaptured}%
                    </Badge>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2">
                    <div 
                      className={cn(
                        "h-2 rounded-full transition-all",
                        data.trackingQuality.evidenceCaptured > 90 ? "bg-green-500" :
                        data.trackingQuality.evidenceCaptured > 70 ? "bg-yellow-500" : "bg-red-500"
                      )}
                      style={{ width: `${data.trackingQuality.evidenceCaptured}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    {data.trackingQuality.evidenceCaptured}% of tasks have complete evidence
                  </p>
                </div>

                <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-800">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium">Extension Active Rate</p>
                    <Badge 
                      variant="outline"
                      className={cn("text-xs", getQualityBadge(data.trackingQuality.extensionActiveRate))}
                    >
                      {data.trackingQuality.extensionActiveRate}%
                    </Badge>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2">
                    <div 
                      className={cn(
                        "h-2 rounded-full transition-all",
                        data.trackingQuality.extensionActiveRate > 90 ? "bg-green-500" :
                        data.trackingQuality.extensionActiveRate > 70 ? "bg-yellow-500" : "bg-red-500"
                      )}
                      style={{ width: `${data.trackingQuality.extensionActiveRate}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Extension was active during task creation
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {data.recentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    onClick={() => handleTaskClick(activity.id, activity.taskName)}
                    className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-800 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-all cursor-pointer"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{activity.taskName}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {activity.creator} • {activity.date}
                      </p>
                    </div>
                    <Badge 
                      variant={activity.status === "active" ? "default" : "secondary"}
                      className="ml-2 text-xs"
                    >
                      {activity.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={handleExportCSV}
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
          <Button onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
