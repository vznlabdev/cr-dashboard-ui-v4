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
    riskLevel: "Low" as "Low" | "Medium" | "High",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name.trim()) {
      toast.error("Project name is required");
      return;
    }
    if (!formData.owner.trim()) {
      toast.error("Project owner is required");
      return;
    }
    if (!formData.companyId) {
      toast.error("Company is required");
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
        risk: formData.riskLevel,
      });
      
      toast.success(`Project "${newProject.name}" created successfully!`);
      
      // Reset form
      setFormData({
        name: "",
        description: "",
        owner: "",
        companyId: companies[0]?.id || "company-1",
        riskLevel: "Low",
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
        riskLevel: "Low",
      });
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FolderPlus className="h-5 w-5" />
            Create New Project
          </DialogTitle>
          <DialogDescription>
            Start a new AI content creation project with provenance tracking
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="project-name">
                Project Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="project-name"
                placeholder="e.g., Summer Campaign 2024"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={isSubmitting}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="project-description">Description</Label>
              <Textarea
                id="project-description"
                placeholder="Brief description of the project and its goals..."
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="company">
                Company <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.companyId}
                onValueChange={(value) => setFormData({ ...formData, companyId: value })}
                disabled={isSubmitting}
              >
                <SelectTrigger id="company">
                  <SelectValue placeholder="Select company" />
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

            <div className="space-y-2">
              <Label htmlFor="project-owner">
                Project Owner <span className="text-destructive">*</span>
              </Label>
              <Input
                id="project-owner"
                placeholder="e.g., Sarah Johnson"
                value={formData.owner}
                onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
                disabled={isSubmitting}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="risk-level">Initial Risk Level</Label>
              <Select
                value={formData.riskLevel}
                onValueChange={(value: "Low" | "Medium" | "High") => setFormData({ ...formData, riskLevel: value })}
                disabled={isSubmitting}
              >
                <SelectTrigger id="risk-level">
                  <SelectValue placeholder="Select risk level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Low">Low Risk</SelectItem>
                  <SelectItem value="Medium">Medium Risk</SelectItem>
                  <SelectItem value="High">High Risk</SelectItem>
                </SelectContent>
              </Select>
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

