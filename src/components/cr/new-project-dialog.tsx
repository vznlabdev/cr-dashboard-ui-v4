"use client"

import { useEffect } from "react";
import { useForm } from "react-hook-form";
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
import { FolderPlus, Loader2 } from "lucide-react";
import {
  ProjectDistributionSection,
  type DistributionFormValues,
} from "./ProjectDistributionSection";
import type { ProjectDistribution } from "@/types";

const TEAM_MEMBERS = [
  { id: "jgordon", name: "jgordon", fullName: "Jeff Gordon" },
  { id: "abdul.qadeer", name: "abdul.qadeer", fullName: "Abdul Qadeer" },
  { id: "asad", name: "asad", fullName: "Asad" },
  { id: "dev.vznlab", name: "dev.vznlab", fullName: "Dev Vznlab" },
  { id: "husnain.raza", name: "husnain.raza", fullName: "Husnain Raza" },
  { id: "jg", name: "jg", fullName: "JG" },
  { id: "ryan", name: "ryan", fullName: "Ryan" },
  { id: "zlane", name: "zlane", fullName: "Zlane" },
];

function formValuesToDistribution(values: DistributionFormValues): ProjectDistribution | null {
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

type NewProjectFormValues = {
  name: string;
  description: string;
  owner: string;
  companyId: string;
  distribution?: DistributionFormValues["distribution"];
};

interface NewProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  setupMode?: boolean;
  onProjectCreated?: (projectId: string) => void;
}

export function NewProjectDialog({
  open,
  onOpenChange,
  setupMode,
  onProjectCreated,
}: NewProjectDialogProps) {
  const { createProject } = useData();
  const companies = getAllCompanies();
  const form = useForm<NewProjectFormValues>({
    defaultValues: {
      name: "",
      description: "",
      owner: "",
      companyId: companies[0]?.id ?? "company-1",
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
    if (open && companies.length) {
      form.reset({
        ...form.getValues(),
        companyId: companies[0]?.id ?? "company-1",
      });
    }
  }, [open, companies, form]);

  const isSubmitting = form.formState.isSubmitting;

  const onSubmit = async (values: NewProjectFormValues) => {
    try {
      const newProject = await createProject({
        name: values.name,
        description: values.description,
        owner: values.owner,
        companyId: values.companyId,
        status: "Draft",
        risk: "Low",
        distribution: formValuesToDistribution({ distribution: values.distribution ?? null }),
      });
      if (setupMode) {
        toast.success(
          `Great! Your first project "${newProject.name}" has been created. Next, let's add some tasks.`
        );
      } else {
        toast.success(`Project "${newProject.name}" created successfully!`);
      }
      onProjectCreated?.(newProject.id);
      form.reset({
        name: "",
        description: "",
        owner: "",
        companyId: companies[0]?.id ?? "company-1",
        distribution: {
          primary_use: "internal",
          us_states: [],
          countries: [],
          platforms: [],
          start_date: "",
          end_date: "",
        },
      });
      onOpenChange(false);
    } catch {
      toast.error("Failed to create project");
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      form.reset();
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[680px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <FolderPlus className="h-5 w-5" />
            {setupMode ? "Create Your First Project" : "Create New Project"}
          </DialogTitle>
          <DialogDescription>
            {setupMode
              ? "Start by creating a project to organize your creative work and tasks"
              : "Start a new AI content creation project with provenance tracking"}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="space-y-0 py-3">
              <div className="flex items-start gap-3 py-2.5 border-b border-border">
                <div className="w-32 flex-shrink-0 pt-2">
                  <FormLabel className="text-sm font-medium">
                    Project Name <span className="text-destructive">*</span>
                  </FormLabel>
                </div>
                <div className="flex-1">
                  <FormField
                    control={form.control}
                    name="name"
                    rules={{ required: "Project name is required" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            placeholder="e.g., Summer Campaign 2024"
                            disabled={isSubmitting}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="flex items-start gap-3 py-2.5 border-b border-border">
                <div className="w-32 flex-shrink-0 pt-2">
                  <FormLabel className="text-sm font-medium">Description</FormLabel>
                </div>
                <div className="flex-1">
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Textarea
                            placeholder="Brief description of the project and its goals..."
                            rows={2}
                            disabled={isSubmitting}
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="flex items-start gap-3 py-2.5 border-b border-border">
                <div className="w-32 flex-shrink-0 pt-2">
                  <FormLabel className="text-sm font-medium">
                    Brand <span className="text-destructive">*</span>
                  </FormLabel>
                </div>
                <div className="flex-1">
                  <FormField
                    control={form.control}
                    name="companyId"
                    rules={{ required: "Brand is required" }}
                    render={({ field }) => (
                      <FormItem>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                          disabled={isSubmitting}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select brand" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {companies.map((company) => (
                              <SelectItem key={company.id} value={company.id}>
                                {company.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="flex items-start gap-3 py-2.5 border-b border-border">
                <div className="w-32 flex-shrink-0 pt-2">
                  <FormLabel className="text-sm font-medium">
                    Project Lead <span className="text-destructive">*</span>
                  </FormLabel>
                </div>
                <div className="flex-1">
                  <FormField
                    control={form.control}
                    name="owner"
                    rules={{ required: "Project lead is required" }}
                    render={({ field }) => (
                      <FormItem>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                          disabled={isSubmitting}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select project lead" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {TEAM_MEMBERS.map((member) => (
                              <SelectItem key={member.id} value={member.fullName}>
                                {member.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="flex items-start gap-3 py-2.5 border-b border-border">
                <div className="w-32 flex-shrink-0 pt-2">
                  <FormLabel className="text-sm font-medium">Members</FormLabel>
                </div>
                <div className="flex-1">
                  <Select disabled={isSubmitting}>
                    <SelectTrigger>
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
                  <p className="text-xs text-muted-foreground mt-1">
                    Select team members for this project
                  </p>
                </div>
              </div>

              <div className="py-3">
                <ProjectDistributionSection disabled={isSubmitting} />
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
        </Form>
      </DialogContent>
    </Dialog>
  );
}
