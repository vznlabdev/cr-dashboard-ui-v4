"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Ticket, 
  Palette, 
  Users, 
  Clock,
  ArrowUpRight,
  Plus,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Timer,
  FileImage,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { useEffect } from "react";
import { useWorkspace } from "@/contexts/workspace-context";

export default function CreativeDashboardPage() {
  const { setWorkspace } = useWorkspace();

  // Ensure workspace is set to creative when visiting this page
  useEffect(() => {
    setWorkspace("creative");
  }, [setWorkspace]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Creative Workspace</h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            Manage creative requests, brands, and deliverables
          </p>
        </div>
        <Link href="/creative/tickets/new">
          <Button className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            New Request
          </Button>
        </Link>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Link href="/creative/tickets" className="block">
          <Card className="border-primary/20 transition-all hover:shadow-lg hover:-translate-y-1 cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Tickets
              </CardTitle>
              <Ticket className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <div className="flex items-center text-xs text-muted-foreground mt-1">
                <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
                <span className="text-green-500">+3</span>
                <span className="ml-1">this week</span>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/creative/tickets?status=in-progress" className="block">
          <Card className="border-amber-500/20 transition-all hover:shadow-lg hover:-translate-y-1 cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                In Production
              </CardTitle>
              <Timer className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">5</div>
              <p className="text-xs text-muted-foreground mt-1">
                Being worked on
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/creative/brands" className="block">
          <Card className="transition-all hover:shadow-lg hover:-translate-y-1 cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Brand Profiles
              </CardTitle>
              <Palette className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8</div>
              <p className="text-xs text-muted-foreground mt-1">
                Active brands
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/creative/team" className="block">
          <Card className="transition-all hover:shadow-lg hover:-translate-y-1 cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Team Members
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">6</div>
              <p className="text-xs text-muted-foreground mt-1">
                Designers available
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Ticket Pipeline */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg sm:text-xl">Ticket Pipeline</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Current status of creative requests
              </CardDescription>
            </div>
            <Link href="/creative/tickets">
              <Button variant="ghost" size="sm">
                View All
                <ArrowUpRight className="ml-1 h-3 w-3" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {ticketPipeline.map((stage) => (
              <div key={stage.name} className="text-center">
                <div className={`text-3xl font-bold ${stage.color}`}>
                  {stage.count}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {stage.name}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity & Quick Actions */}
      <div className="grid gap-6 lg:grid-cols-7">
        {/* Recent Tickets */}
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Recent Tickets</CardTitle>
            <CardDescription>
              Latest creative requests and their status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTickets.map((ticket, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div className={`rounded-full p-2 ${ticket.bgColor}`}>
                    <ticket.icon className={`h-4 w-4 ${ticket.iconColor}`} />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium leading-none">
                        {ticket.title}
                      </p>
                      <Badge variant={ticket.badgeVariant} className="text-xs">
                        {ticket.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {ticket.brand} • {ticket.type}
                    </p>
                  </div>
                  <div className="text-xs text-muted-foreground whitespace-nowrap">
                    {ticket.time}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common tasks and shortcuts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/creative/tickets/new">
              <Button className="w-full justify-start" variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Submit New Request
              </Button>
            </Link>
            <Separator />
            <Link href="/creative/tickets?status=pending-review">
              <Button className="w-full justify-start" variant="outline">
                <Clock className="mr-2 h-4 w-4" />
                Review Pending Tickets
              </Button>
            </Link>
            <Separator />
            <Link href="/creative/brands/new">
              <Button className="w-full justify-start" variant="outline">
                <Palette className="mr-2 h-4 w-4" />
                Create Brand Profile
              </Button>
            </Link>
            <Separator />
            <Link href="/creative/assets">
              <Button className="w-full justify-start" variant="outline">
                <FileImage className="mr-2 h-4 w-4" />
                Browse Asset Library
              </Button>
            </Link>
            <Separator className="my-4" />
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Output Categories</h4>
              <div className="flex flex-wrap gap-2">
                {outputCategories.map((category) => (
                  <Badge key={category} variant="secondary" className="text-xs">
                    {category}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Team Workload & Brands */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Team Workload */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Team Workload</CardTitle>
                <CardDescription>
                  Current assignments per team member
                </CardDescription>
              </div>
              <Link href="/creative/team">
                <Button variant="ghost" size="sm">
                  View All
                  <ArrowUpRight className="ml-1 h-3 w-3" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {teamWorkload.map((member, index) => (
                <div key={index} className="flex items-center justify-between pb-3 border-b last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                      {member.initials}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{member.name}</p>
                      <p className="text-xs text-muted-foreground">{member.role}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${getWorkloadColor(member.load)}`}
                        style={{ width: `${member.load}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground w-8">
                      {member.tickets}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Brands */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Brand Profiles</CardTitle>
                <CardDescription>
                  Recently updated brands
                </CardDescription>
              </div>
              <Link href="/creative/brands">
                <Button variant="ghost" size="sm">
                  View All
                  <ArrowUpRight className="ml-1 h-3 w-3" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentBrands.map((brand, index) => (
                <div key={index} className="flex items-center gap-3 pb-3 border-b last:border-0">
                  <div 
                    className="h-10 w-10 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                    style={{ backgroundColor: brand.color }}
                  >
                    {brand.initials}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{brand.name}</p>
                    <p className="text-xs text-muted-foreground">{brand.tickets} active tickets</p>
                  </div>
                  <Link href={`/creative/brands/${brand.id}`}>
                    <Button variant="ghost" size="sm">
                      View
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function getWorkloadColor(load: number) {
  if (load >= 80) return "bg-destructive";
  if (load >= 60) return "bg-amber-500";
  return "bg-green-500";
}

const ticketPipeline = [
  { name: "Submitted", count: 3, color: "text-blue-500" },
  { name: "Assessment", count: 2, color: "text-purple-500" },
  { name: "Assigned", count: 2, color: "text-amber-500" },
  { name: "Production", count: 5, color: "text-orange-500" },
  { name: "QA Review", count: 2, color: "text-cyan-500" },
  { name: "Delivered", count: 8, color: "text-green-500" },
];

const recentTickets = [
  {
    icon: CheckCircle2,
    title: "Homepage Banner Redesign",
    brand: "Acme Corp",
    type: "Digital Marketing",
    status: "Delivered",
    badgeVariant: "default" as const,
    time: "2 hours ago",
    bgColor: "bg-green-500/10",
    iconColor: "text-green-500",
  },
  {
    icon: Timer,
    title: "Social Media Pack Q1",
    brand: "TechStart",
    type: "Social Media",
    status: "In Production",
    badgeVariant: "secondary" as const,
    time: "5 hours ago",
    bgColor: "bg-amber-500/10",
    iconColor: "text-amber-500",
  },
  {
    icon: AlertCircle,
    title: "Email Newsletter Template",
    brand: "Acme Corp",
    type: "Email Design",
    status: "Needs Revision",
    badgeVariant: "destructive" as const,
    time: "1 day ago",
    bgColor: "bg-red-500/10",
    iconColor: "text-red-500",
  },
  {
    icon: Clock,
    title: "Product Packaging Design",
    brand: "NatureFresh",
    type: "Packaging",
    status: "Assessment",
    badgeVariant: "outline" as const,
    time: "1 day ago",
    bgColor: "bg-purple-500/10",
    iconColor: "text-purple-500",
  },
  {
    icon: Ticket,
    title: "Trade Show Booth Graphics",
    brand: "TechStart",
    type: "Trade Show",
    status: "Submitted",
    badgeVariant: "outline" as const,
    time: "2 days ago",
    bgColor: "bg-blue-500/10",
    iconColor: "text-blue-500",
  },
];

const teamWorkload = [
  { name: "Sarah Chen", initials: "SC", role: "Senior Designer", tickets: 4, load: 80 },
  { name: "Mike Johnson", initials: "MJ", role: "Designer", tickets: 3, load: 60 },
  { name: "Emily Davis", initials: "ED", role: "Designer", tickets: 2, load: 40 },
  { name: "Alex Kim", initials: "AK", role: "Junior Designer", tickets: 2, load: 50 },
];

const recentBrands = [
  { id: "1", name: "Acme Corporation", initials: "AC", color: "#3b82f6", tickets: 5 },
  { id: "2", name: "TechStart Inc", initials: "TS", color: "#8b5cf6", tickets: 3 },
  { id: "3", name: "NatureFresh Foods", initials: "NF", color: "#22c55e", tickets: 2 },
  { id: "4", name: "Urban Style Co", initials: "US", color: "#f59e0b", tickets: 2 },
];

const outputCategories = [
  "Social Media",
  "Digital Marketing",
  "Email Design",
  "Logos & Branding",
  "Presentations",
  "Print & Packaging",
];

