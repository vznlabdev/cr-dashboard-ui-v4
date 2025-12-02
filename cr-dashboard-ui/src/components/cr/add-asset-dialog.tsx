"use client"

import { useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, FileUp } from "lucide-react";
import { useData } from "@/contexts/data-context";

interface AddAssetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
}

export function AddAssetDialog({ open, onOpenChange, projectId }: AddAssetDialogProps) {
  const { createAsset } = useData();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    type: "Image" as "Image" | "Video" | "Audio" | "Text" | "AR/VR",
    aiMethod: "AI Generative" as "AI Augmented" | "AI Generative" | "Multimodal",
    creator: "",
    status: "Draft" as "Draft" | "Review" | "Approved" | "Rejected",
    risk: "Low" as "Low" | "Medium" | "High",
    compliance: 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name.trim()) {
      toast.error("Asset name is required");
      return;
    }
    if (!formData.creator.trim()) {
      toast.error("Creator name is required");
      return;
    }

    setIsSubmitting(true);
    
    try {
      const newAsset = await createAsset(projectId, formData);
      toast.success(`Asset "${newAsset.name}" added successfully!`);
      
      // Reset form
      setFormData({
        name: "",
        type: "Image",
        aiMethod: "AI Generative",
        creator: "",
        status: "Draft",
        risk: "Low",
        compliance: 0,
      });
      
      onOpenChange(false);
    } catch (err) {
      console.error("Failed to add asset:", err);
      toast.error("Failed to add asset");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({
        name: "",
        type: "Image",
        aiMethod: "AI Generative",
        creator: "",
        status: "Draft",
        risk: "Low",
        compliance: 0,
      });
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileUp className="h-5 w-5" />
            Add Asset
          </DialogTitle>
          <DialogDescription>
            Upload a new AI-generated asset to this project
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="asset-name">
                Asset Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="asset-name"
                placeholder="e.g., hero-image-final.jpg"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={isSubmitting}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="asset-type">Asset Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: typeof formData.type) => setFormData({ ...formData, type: value })}
                  disabled={isSubmitting}
                >
                  <SelectTrigger id="asset-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Image">Image</SelectItem>
                    <SelectItem value="Video">Video</SelectItem>
                    <SelectItem value="Audio">Audio</SelectItem>
                    <SelectItem value="Text">Text</SelectItem>
                    <SelectItem value="AR/VR">AR/VR</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ai-method">AI Method</Label>
                <Select
                  value={formData.aiMethod}
                  onValueChange={(value: typeof formData.aiMethod) => setFormData({ ...formData, aiMethod: value })}
                  disabled={isSubmitting}
                >
                  <SelectTrigger id="ai-method">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AI Generative">AI Generative</SelectItem>
                    <SelectItem value="AI Augmented">AI Augmented</SelectItem>
                    <SelectItem value="Multimodal">Multimodal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="creator">
                Creator <span className="text-destructive">*</span>
              </Label>
              <Input
                id="creator"
                placeholder="e.g., Sarah Johnson"
                value={formData.creator}
                onChange={(e) => setFormData({ ...formData, creator: e.target.value })}
                disabled={isSubmitting}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: typeof formData.status) => setFormData({ ...formData, status: value })}
                  disabled={isSubmitting}
                >
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Draft">Draft</SelectItem>
                    <SelectItem value="Review">Review</SelectItem>
                    <SelectItem value="Approved">Approved</SelectItem>
                    <SelectItem value="Rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="asset-risk">Risk Level</Label>
                <Select
                  value={formData.risk}
                  onValueChange={(value: typeof formData.risk) => setFormData({ ...formData, risk: value })}
                  disabled={isSubmitting}
                >
                  <SelectTrigger id="asset-risk">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">Low Risk</SelectItem>
                    <SelectItem value="Medium">Medium Risk</SelectItem>
                    <SelectItem value="High">High Risk</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="compliance">Compliance Percentage (%)</Label>
              <Input
                id="compliance"
                type="number"
                min="0"
                max="100"
                value={formData.compliance}
                onChange={(e) => setFormData({ ...formData, compliance: parseInt(e.target.value) || 0 })}
                disabled={isSubmitting}
              />
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
              Add Asset
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

