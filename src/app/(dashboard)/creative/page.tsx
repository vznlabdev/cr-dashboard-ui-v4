"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { mockTeamMembers, mockBrands, mockTickets } from "@/lib/mock-data/creative";
import { PageContainer } from "@/components/layout/PageContainer";

export default function CreativeDashboardPage() {

  return (
    <PageContainer className="space-y-6 animate-fade-in">
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
          <Card className="border-primary/20 transition-all hover:shadow-lg hover:-translate-y-1 cursor-pointer py-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 p-5 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Tickets
              </CardTitle>
              <Ticket className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent className="p-5 pt-0">
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
          <Card className="border-amber-500/20 transition-all hover:shadow-lg hover:-translate-y-1 cursor-pointer py-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 p-5 pb-2">
              <CardTitle className="text-sm font-medium">
                In Production
              </CardTitle>
              <Timer className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent className="p-5 pt-0">
              <div className="text-2xl font-bold">5</div>
              <p className="text-xs text-muted-foreground mt-1">
                Being worked on
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/creative/brands" className="block">
          <Card className="transition-all hover:shadow-lg hover:-translate-y-1 cursor-pointer py-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 p-5 pb-2">
              <CardTitle className="text-sm font-medium">
                Brand Profiles
              </CardTitle>
              <Palette className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-5 pt-0">
              <div className="text-2xl font-bold">8</div>
              <p className="text-xs text-muted-foreground mt-1">
                Active brands
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/creative/team" className="block">
          <Card className="transition-all hover:shadow-lg hover:-translate-y-1 cursor-pointer py-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 p-5 pb-2">
              <CardTitle className="text-sm font-medium">
                Team Members
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-5 pt-0">
              <div className="text-2xl font-bold">6</div>
              <p className="text-xs text-muted-foreground mt-1">
                Designers available
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Ticket Pipeline */}
      <Card className="py-0">
        <CardHeader className="p-5">
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
        <CardContent className="p-5 pt-0">
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
        <Card className="lg:col-span-4 py-0">
          <CardHeader className="p-5">
            <CardTitle>Recent Tickets</CardTitle>
            <CardDescription>
              Latest creative requests and their status
            </CardDescription>
          </CardHeader>
          <CardContent className="p-5 pt-0">
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
        <Card className="lg:col-span-3 py-0">
          <CardHeader className="p-5">
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common tasks and shortcuts
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-0 space-y-2">
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
        <Card className="py-0">
          <CardHeader className="p-5">
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
          <CardContent className="p-5 pt-0">
            <div className="space-y-4">
              {mockTeamMembers.slice(0, 4).map((member) => {
                const assignedTickets = mockTickets.filter(t => t.assigneeId === member.id && t.status !== "delivered").length;
                const load = Math.round((member.currentLoad / member.maxCapacity) * 100);
                return (
                  <div key={member.id} className="flex items-center justify-between pb-3 border-b last:border-0">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={member.avatar} alt={member.name} />
                        <AvatarFallback className="text-xs bg-primary/10">
                          {member.name.split(" ").map(n => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{member.name}</p>
                        <p className="text-xs text-muted-foreground capitalize">{member.role.replace("_", " ")}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${getWorkloadColor(load)}`}
                          style={{ width: `${load}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground w-8">
                        {assignedTickets}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Recent Brands */}
        <Card className="py-0">
          <CardHeader className="p-5">
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
          <CardContent className="p-5 pt-0">
            <div className="space-y-4">
              {mockBrands.slice(0, 4).map((brand) => {
                const activeTickets = mockTickets.filter(t => t.brandId === brand.id && t.status !== "delivered").length;
                const primaryColor = brand.colors.find(c => c.type === "primary")?.hex || "#666";
                return (
                  <div key={brand.id} className="flex items-center gap-3 pb-3 border-b last:border-0">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={brand.logoUrl} alt={brand.name} />
                      <AvatarFallback 
                        className="text-white font-bold text-sm"
                        style={{ backgroundColor: primaryColor }}
                      >
                        {brand.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{brand.name}</p>
                      <p className="text-xs text-muted-foreground">{activeTickets} active tickets</p>
                    </div>
                    <Link href={`/creative/brands/${brand.id}`}>
                      <Button variant="ghost" size="sm">
                        View
                      </Button>
                    </Link>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
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

const outputCategories = [
  "Social Media",
  "Digital Marketing",
  "Email Design",
  "Logos & Branding",
  "Presentations",
  "Print & Packaging",
];

