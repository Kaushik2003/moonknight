"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Folder, Trash2, Calendar, Loader2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface Project {
  id: string;
  name: string;
  updated_at: string;
  created_at: string;
  contract_state: any;
  frontend_state: any;
}

interface ProjectsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProject: (project: Project) => void;
  currentProjectId?: string | null;
}

export function ProjectsModal({
  isOpen,
  onClose,
  onSelectProject,
  currentProjectId,
}: ProjectsModalProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    if (isOpen) {
      fetchProjects();
    }
  }, [isOpen]);

  const fetchProjects = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from("projects")
        .select("id, name, updated_at, created_at, contract_state, frontend_state")
        .order("updated_at", { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (err: any) {
      console.error("Error fetching projects:", err);
      setError(err.message || "Failed to load projects");
    } finally {
      setIsLoading(false);
    }
  };

  const deleteProject = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this project?")) return;

    try {
      const { error } = await supabase.from("projects").delete().eq("id", id);
      if (error) throw error;
      setProjects(projects.filter((p) => p.id !== id));
    } catch (err: any) {
      console.error("Error deleting project:", err);
      alert("Failed to delete project: " + err.message);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] bg-zinc-900 border-zinc-800 text-zinc-100">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <Folder className="w-5 h-5 text-purple-400" />
            My Projects
          </DialogTitle>
          <DialogDescription className="text-zinc-500">
            Select a project to load it into the IDE.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 text-zinc-500">
              <Loader2 className="w-8 h-8 animate-spin mb-2" />
              <p>Loading projects...</p>
            </div>
          ) : error ? (
            <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-12 text-zinc-500">
              <Folder className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p>No projects found. Save your progress to see it here.</p>
            </div>
          ) : (
            <div className="grid gap-2">
              {projects.map((project) => {
                const isActive = currentProjectId === project.id;
                return (
                  <div
                    key={project.id}
                    onClick={() => onSelectProject(project)}
                    className={cn(
                      "flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer bg-zinc-900/60 hover:bg-zinc-800",
                      isActive
                        ? "border-purple-500/60 shadow-[0_0_0_1px_rgba(168,85,247,0.25)]"
                        : "border-zinc-700/60 hover:border-purple-500/40",
                    )}
                  >
                    <div className="flex flex-col gap-1">
                      <span className="font-medium text-zinc-100">
                        {project.name}
                      </span>
                      <div className="flex items-center gap-3 text-[11px] text-zinc-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Updated {format(new Date(project.updated_at), "MMM d, yyyy HH:mm")}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 opacity-60" />
                          Created {format(new Date(project.created_at), "MMM d, yyyy")}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={(e) => deleteProject(project.id, e)}
                      className="p-2 rounded-md hover:bg-red-500/15 text-zinc-500 hover:text-red-400 transition-colors"
                      title="Delete project"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
