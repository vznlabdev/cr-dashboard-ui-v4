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
import { toast } from "sonner";
import { AlertTriangle, Loader2 } from "lucide-react";
import { useData, type Project } from "@/contexts/data-context";

interface DeleteProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: Project | null;
}

export function DeleteProjectDialog({ open, onOpenChange, project }: DeleteProjectDialogProps) {
  const { deleteProject, getProjectAssets } = useData();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!project) return;
    
    setIsDeleting(true);
    
    try {
      await deleteProject(project.id);
      toast.success(`Project "${project.name}" deleted successfully`);
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to delete project");
    } finally {
      setIsDeleting(false);
    }
  };

  const assetCount = project ? getProjectAssets(project.id).length : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Delete Project
          </DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete the project and all its associated data.
          </DialogDescription>
        </DialogHeader>
        
        {project && (
          <div className="py-4">
            <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-4 space-y-2">
              <p className="font-semibold">{project.name}</p>
              <p className="text-sm text-muted-foreground">
                {assetCount} asset{assetCount !== 1 ? 's' : ''} will be deleted
              </p>
              {assetCount > 0 && (
                <p className="text-sm text-destructive font-medium">
                  ⚠️ Warning: All assets will be permanently removed
                </p>
              )}
            </div>
          </div>
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Delete Project
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

