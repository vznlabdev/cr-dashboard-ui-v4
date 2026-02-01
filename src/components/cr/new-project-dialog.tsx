"use client"

import { useState } from "react";
import { useData } from "@/contexts/data-context";
import { getAllCompanies } from "@/lib/mock-data/projects-tasks";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { FolderPlus, Loader2 } from "lucide-react";

// Team members for selection
const TEAM_MEMBERS = [
  { id: 'jgordon', name: 'jgordon', fullName: 'Jeff Gordon' },
  { id: 'abdul.qadeer', name: 'abdul.qadeer', fullName: 'Abdul Qadeer' },
  { id: 'asad', name: 'asad', fullName: 'Asad' },
  { id: 'dev.vznlab', name: 'dev.vznlab', fullName: 'Dev Vznlab' },
  { id: 'husnain.raza', name: 'husnain.raza', fullName: 'Husnain Raza' },
  { id: 'jg', name: 'jg', fullName: 'JG' },
  { id: 'ryan', name: 'ryan', fullName: 'Ryan' },
  { id: 'zlane', name: 'zlane', fullName: 'Zlane' },
]

interface NewProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NewProjectDialog({ open, onOpenChange }: NewProjectDialogProps) {
  const { createProject } = useData();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const companies = getAllCompanies();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    owner: "",
    companyId: companies[0]?.id || "company-1",
    members: [] as string[],
    startDate: "",
    targetDate: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name.trim()) {
      toast.error("Project name is required");
      return;
    }
    if (!formData.owner.trim()) {
      toast.error("Project lead is required");
      return;
    }
    if (!formData.companyId) {
      toast.error("Brand is required");
      return;
    }

    setIsSubmitting(true);
    
    try {
      const newProject = await createProject({
        name: formData.name,
        description: formData.description,
        owner: formData.owner,
        companyId: formData.companyId,
        status: "Draft",
        risk: "Low", // Default to Low risk
      });
      
      toast.success(`Project "${newProject.name}" created successfully!`);
      
      // Reset form
      setFormData({
        name: "",
        description: "",
        owner: "",
        companyId: companies[0]?.id || "company-1",
        members: [],
        startDate: "",
        targetDate: "",
      });
      
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to create project");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({
        name: "",
        description: "",
        owner: "",
        companyId: companies[0]?.id || "company-1",
        members: [],
        startDate: "",
        targetDate: "",
      });
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[680px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <FolderPlus className="h-5 w-5" />
            Create New Project
          </DialogTitle>
          <DialogDescription>
            Start a new AI content creation project with provenance tracking
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-0 py-3">
            {/* Project Name */}
            <div className="flex items-start gap-3 py-2.5 border-b border-border">
              <div className="w-32 flex-shrink-0 pt-2">
                <Label htmlFor="project-name" className="text-sm font-medium">
                  Project Name <span className="text-destructive">*</span>
                </Label>
              </div>
              <div className="flex-1">
                <Input
                  id="project-name"
                  placeholder="e.g., Summer Campaign 2024"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  disabled={isSubmitting}
                  required
                />
              </div>
            </div>

            {/* Description */}
            <div className="flex items-start gap-3 py-2.5 border-b border-border">
              <div className="w-32 flex-shrink-0 pt-2">
                <Label htmlFor="project-description" className="text-sm font-medium">
                  Description
                </Label>
              </div>
              <div className="flex-1">
                <Textarea
                  id="project-description"
                  placeholder="Brief description of the project and its goals..."
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  disabled={isSubmitting}
                  className="resize-none"
                />
              </div>
            </div>

            {/* Brand */}
            <div className="flex items-start gap-3 py-2.5 border-b border-border">
              <div className="w-32 flex-shrink-0 pt-2">
                <Label htmlFor="company" className="text-sm font-medium">
                  Brand <span className="text-destructive">*</span>
                </Label>
              </div>
              <div className="flex-1">
                <Select
                  value={formData.companyId}
                  onValueChange={(value) => setFormData({ ...formData, companyId: value })}
                  disabled={isSubmitting}
                >
                  <SelectTrigger id="company">
                    <SelectValue placeholder="Select brand" />
                  </SelectTrigger>
                  <SelectContent>
                    {companies.map((company) => (
                      <SelectItem key={company.id} value={company.id}>
                        {company.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Project Lead */}
            <div className="flex items-start gap-3 py-2.5 border-b border-border">
              <div className="w-32 flex-shrink-0 pt-2">
                <Label htmlFor="project-lead" className="text-sm font-medium">
                  Project Lead <span className="text-destructive">*</span>
                </Label>
              </div>
              <div className="flex-1">
                <Select
                  value={formData.owner}
                  onValueChange={(value) => setFormData({ ...formData, owner: value })}
                  disabled={isSubmitting}
                >
                  <SelectTrigger id="project-lead">
                    <SelectValue placeholder="Select project lead" />
                  </SelectTrigger>
                  <SelectContent>
                    {TEAM_MEMBERS.map((member) => (
                      <SelectItem key={member.id} value={member.fullName}>
                        {member.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Members */}
            <div className="flex items-start gap-3 py-2.5 border-b border-border">
              <div className="w-32 flex-shrink-0 pt-2">
                <Label htmlFor="members" className="text-sm font-medium">
                  Members
                </Label>
              </div>
              <div className="flex-1">
                <Select disabled={isSubmitting}>
                  <SelectTrigger id="members">
                    <SelectValue placeholder="Select team members" />
                  </SelectTrigger>
                  <SelectContent>
                    {TEAM_MEMBERS.map((member) => (
                      <SelectItem key={member.id} value={member.id}>
                        {member.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">Select team members for this project</p>
              </div>
            </div>

            {/* Dates */}
            <div className="flex items-start gap-3 py-2.5">
              <div className="w-32 flex-shrink-0 pt-2">
                <Label className="text-sm font-medium">Dates</Label>
              </div>
              <div className="flex-1 grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="start-date" className="text-xs text-muted-foreground">
                    Start Date
                  </Label>
                  <Input
                    id="start-date"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    disabled={isSubmitting}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="target-date" className="text-xs text-muted-foreground">
                    Target Date
                  </Label>
                  <Input
                    id="target-date"
                    type="date"
                    value={formData.targetDate}
                    onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Project
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

