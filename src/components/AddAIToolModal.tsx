"use client"

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface AddAIToolModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CATEGORIES = [
  "Image Generation",
  "Text Generation",
  "Video Generation",
  "Audio Generation",
  "Image Editing",
  "Code Generation",
  "Other",
];

// Mock projects for the multi-select
const MOCK_PROJECTS = [
  { id: "1", name: "Brand Refresh Campaign" },
  { id: "2", name: "Product Launch Q1" },
  { id: "3", name: "Social Media Content" },
  { id: "4", name: "Website Redesign" },
  { id: "5", name: "Marketing Materials" },
];

export function AddAIToolModal({ open, onOpenChange }: AddAIToolModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    baseUrl: "",
    category: "",
    trackingLevel: "Full",
    description: "",
    iconUrl: "",
    projectAvailability: "all",
    status: "Active",
    selectedProjects: [] as string[],
  });

  const [errors, setErrors] = useState({
    name: "",
    baseUrl: "",
    category: "",
  });

  const [iconPreview, setIconPreview] = useState("");

  // URL validation
  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  // Handle form field changes
  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }

    // Real-time URL validation
    if (field === "baseUrl" && value) {
      if (!isValidUrl(value)) {
        setErrors((prev) => ({ ...prev, baseUrl: "Please enter a valid URL (e.g., https://example.com)" }));
      } else {
        setErrors((prev) => ({ ...prev, baseUrl: "" }));
      }
    }
  };

  // Handle icon upload
  const handleIconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("Please upload an image file");
        return;
      }

      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Image must be smaller than 2MB");
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setIconPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle icon URL
  const handleIconUrl = (url: string) => {
    setFormData((prev) => ({ ...prev, iconUrl: url }));
    if (isValidUrl(url)) {
      setIconPreview(url);
    }
  };

  // Toggle project selection
  const toggleProject = (projectId: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedProjects: prev.selectedProjects.includes(projectId)
        ? prev.selectedProjects.filter((id) => id !== projectId)
        : [...prev.selectedProjects, projectId],
    }));
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors = {
      name: "",
      baseUrl: "",
      category: "",
    };

    if (!formData.name.trim()) {
      newErrors.name = "Tool name is required";
    }

    if (!formData.baseUrl.trim()) {
      newErrors.baseUrl = "Base URL is required";
    } else if (!isValidUrl(formData.baseUrl)) {
      newErrors.baseUrl = "Please enter a valid URL";
    }

    if (!formData.category) {
      newErrors.category = "Category is required";
    }

    setErrors(newErrors);
    return !Object.values(newErrors).some((error) => error !== "");
  };

  // Handle form submission
  const handleSubmit = () => {
    if (!validateForm()) {
      toast.error("Please fix the errors before submitting");
      return;
    }

    // Here you would typically send the data to your backend
    console.log("Form data:", formData);
    
    toast.success(`${formData.name} added successfully!`);
    handleClose();
  };

  // Reset form and close modal
  const handleClose = () => {
    setFormData({
      name: "",
      baseUrl: "",
      category: "",
      trackingLevel: "Full",
      description: "",
      iconUrl: "",
      projectAvailability: "all",
      status: "Active",
      selectedProjects: [],
    });
    setErrors({
      name: "",
      baseUrl: "",
      category: "",
    });
    setIconPreview("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add AI Tool</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Tool Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">
              Tool Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="e.g., Midjourney"
              className={cn(errors.name && "border-red-500")}
            />
            {errors.name && (
              <p className="text-xs text-red-500">{errors.name}</p>
            )}
          </div>

          {/* Base URL */}
          <div className="space-y-2">
            <Label htmlFor="baseUrl" className="text-sm font-medium">
              Base URL <span className="text-red-500">*</span>
            </Label>
            <Input
              id="baseUrl"
              type="url"
              value={formData.baseUrl}
              onChange={(e) => handleChange("baseUrl", e.target.value)}
              placeholder="https://example.com"
              className={cn(errors.baseUrl && "border-red-500")}
            />
            {errors.baseUrl && (
              <p className="text-xs text-red-500">{errors.baseUrl}</p>
            )}
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category" className="text-sm font-medium">
              Category <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.category}
              onValueChange={(value) => handleChange("category", value)}
            >
              <SelectTrigger className={cn(errors.category && "border-red-500")}>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && (
              <p className="text-xs text-red-500">{errors.category}</p>
            )}
          </div>

          {/* Tracking Level */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">
              Tracking Level <span className="text-red-500">*</span>
            </Label>
            <RadioGroup
              value={formData.trackingLevel}
              onValueChange={(value) => handleChange("trackingLevel", value)}
              className="space-y-3"
            >
              <div className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors cursor-pointer">
                <RadioGroupItem value="Full" id="full" className="mt-0.5" />
                <div className="flex-1">
                  <Label htmlFor="full" className="font-medium cursor-pointer">
                    Full Tracking
                  </Label>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    Complete prompt, settings, and generation capture
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors cursor-pointer">
                <RadioGroupItem value="Good" id="good" className="mt-0.5" />
                <div className="flex-1">
                  <Label htmlFor="good" className="font-medium cursor-pointer">
                    Good Tracking
                  </Label>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    Prompt and basic settings capture
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors cursor-pointer">
                <RadioGroupItem value="Basic" id="basic" className="mt-0.5" />
                <div className="flex-1">
                  <Label htmlFor="basic" className="font-medium cursor-pointer">
                    Basic Tracking
                  </Label>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    Tool usage logged, limited metadata
                  </p>
                </div>
              </div>
            </RadioGroup>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Description <span className="text-gray-400">(optional)</span>
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Brief description of this tool..."
              rows={3}
              className="resize-none"
            />
          </div>

          {/* Icon/Logo */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Icon/Logo <span className="text-gray-400">(optional)</span>
            </Label>
            <div className="flex items-start gap-4">
              {/* Upload button */}
              <div className="flex-1">
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Input
                      type="text"
                      value={formData.iconUrl}
                      onChange={(e) => handleIconUrl(e.target.value)}
                      placeholder="Icon URL or upload file"
                      className="text-sm"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => document.getElementById("icon-upload")?.click()}
                    className="flex items-center gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    Upload
                  </Button>
                  <input
                    id="icon-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleIconUpload}
                    className="hidden"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Max 2MB. Accepts JPG, PNG, SVG
                </p>
              </div>

              {/* Icon preview */}
              {iconPreview && (
                <div className="relative w-16 h-16 rounded-lg border bg-gray-50 dark:bg-gray-900 flex items-center justify-center overflow-hidden">
                  <img
                    src={iconPreview}
                    alt="Icon preview"
                    className="w-full h-full object-contain"
                  />
                  <button
                    onClick={() => {
                      setIconPreview("");
                      setFormData((prev) => ({ ...prev, iconUrl: "" }));
                    }}
                    className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Project Availability */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">
              Project Availability <span className="text-red-500">*</span>
            </Label>
            <RadioGroup
              value={formData.projectAvailability}
              onValueChange={(value) => handleChange("projectAvailability", value)}
              className="space-y-2"
            >
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="all" id="all-projects" />
                <Label htmlFor="all-projects" className="font-normal cursor-pointer">
                  Available to all projects
                </Label>
              </div>
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="restricted" id="restricted-projects" />
                <Label htmlFor="restricted-projects" className="font-normal cursor-pointer">
                  Restrict to specific projects
                </Label>
              </div>
            </RadioGroup>

            {/* Project multi-select */}
            {formData.projectAvailability === "restricted" && (
              <div className="ml-6 mt-3 p-3 border rounded-lg space-y-2 bg-gray-50 dark:bg-gray-900">
                <Label className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  Select Projects
                </Label>
                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                  {MOCK_PROJECTS.map((project) => (
                    <label
                      key={project.id}
                      className="flex items-center space-x-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 p-2 rounded transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={formData.selectedProjects.includes(project.id)}
                        onChange={() => toggleProject(project.id)}
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm">{project.name}</span>
                    </label>
                  ))}
                </div>
                {formData.selectedProjects.length > 0 && (
                  <p className="text-xs text-gray-500 mt-2">
                    {formData.selectedProjects.length} project(s) selected
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Status */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">
              Status <span className="text-red-500">*</span>
            </Label>
            <RadioGroup
              value={formData.status}
              onValueChange={(value) => handleChange("status", value)}
              className="space-y-2"
            >
              <div className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors cursor-pointer">
                <RadioGroupItem value="Active" id="active" className="mt-0.5" />
                <div className="flex-1">
                  <Label htmlFor="active" className="font-medium cursor-pointer">
                    Active
                  </Label>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    Tool can be selected in tasks
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors cursor-pointer">
                <RadioGroupItem value="Inactive" id="inactive" className="mt-0.5" />
                <div className="flex-1">
                  <Label htmlFor="inactive" className="font-medium cursor-pointer">
                    Inactive
                  </Label>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    Tool hidden from selection
                  </p>
                </div>
              </div>
            </RadioGroup>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            Add Tool
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
