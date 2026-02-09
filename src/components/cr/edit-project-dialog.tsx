"use client"

import { useEffect } from "react";
import { useForm } from "react-hook-form";
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
import { Edit, Loader2 } from "lucide-react";
import { useData, type Project } from "@/contexts/data-context";
import {
  ProjectDistributionSection,
  type DistributionFormValues,
} from "./ProjectDistributionSection";
import type { ProjectDistribution } from "@/types";

type EditProjectFormValues = {
  name: string;
  description: string;
  owner: string;
  status: Project["status"];
  risk: Project["risk"];
} & DistributionFormValues;

function distributionToFormValues(d: ProjectDistribution | null | undefined): DistributionFormValues["distribution"] {
  if (!d) {
    return {
      primary_use: "internal",
      us_states: [],
      countries: [],
      platforms: [],
      start_date: "",
      end_date: "",
    };
  }
  return {
    primary_use: d.primary_use,
    us_states: d.us_states ?? [],
    countries: d.countries ?? [],
    platforms: d.platforms ?? [],
    start_date: d.start_date instanceof Date ? d.start_date.toISOString().slice(0, 10) : "",
    end_date: d.end_date instanceof Date ? d.end_date.toISOString().slice(0, 10) : "",
  };
}

function formValuesToDistribution(values: EditProjectFormValues): Project["distribution"] {
  const d = values.distribution;
  if (!d || d.primary_use !== "advertising" || !d.start_date) {
    return null;
  }
  return {
    primary_use: d.primary_use,
    us_states: d.us_states?.length ? d.us_states : [],
    countries: d.countries ?? [],
    platforms: d.platforms ?? [],
    start_date: new Date(d.start_date),
    end_date: d.end_date ? new Date(d.end_date) : undefined,
  };
}

interface EditProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: Project | null;
}

export function EditProjectDialog({ open, onOpenChange, project }: EditProjectDialogProps) {
  const { updateProject } = useData();
  const form = useForm<EditProjectFormValues>({
    defaultValues: {
      name: "",
      description: "",
      owner: "",
      status: "Draft",
      risk: "Low",
      distribution: {
        primary_use: "internal",
        us_states: [],
        countries: [],
        platforms: [],
        start_date: "",
        end_date: "",
      },
    },
  });

  useEffect(() => {
    if (project && open) {
      form.reset({
        name: project.name,
        description: project.description,
        owner: project.owner,
        status: project.status,
        risk: project.risk,
        distribution: distributionToFormValues(project.distribution),
      });
    }
  }, [project, open, form]);

  const isSubmitting = form.formState.isSubmitting;

  const onSubmit = async (values: EditProjectFormValues) => {
    if (!project) return;
    try {
      await updateProject(project.id, {
        name: values.name,
        description: values.description,
        owner: values.owner,
        status: values.status,
        risk: values.risk,
        distribution: formValuesToDistribution(values),
      });
      toast.success(`Project "${values.name}" updated successfully!`);
      onOpenChange(false);
    } catch {
      toast.error("Failed to update project");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5" />
            Edit Project
          </DialogTitle>
          <DialogDescription>
            Update project details and settings
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4 py-2">
              <FormField
                control={form.control}
                name="name"
                rules={{ required: "Project name is required" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Project Name <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input {...field} disabled={isSubmitting} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={3} disabled={isSubmitting} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="owner"
                rules={{ required: "Project owner is required" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Project Owner <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input {...field} disabled={isSubmitting} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={isSubmitting}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Draft">Draft</SelectItem>
                          <SelectItem value="Review">Review</SelectItem>
                          <SelectItem value="Active">Active</SelectItem>
                          <SelectItem value="Approved">Approved</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="risk"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Risk Level</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={isSubmitting}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Low">Low Risk</SelectItem>
                          <SelectItem value="Medium">Medium Risk</SelectItem>
                          <SelectItem value="High">High Risk</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <ProjectDistributionSection disabled={isSubmitting} />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
