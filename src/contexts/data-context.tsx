/**
 * Data Context - CRUD Operations for Projects & Assets
 * 
 * This Context provides in-memory state management for projects and assets.
 * 
 * INTEGRATION GUIDE:
 * ------------------
 * 1. Replace setTimeout() simulations with actual API calls from src/lib/api.ts
 * 2. Add error handling for network failures
 * 3. Consider adding optimistic updates for better UX
 * 4. Add loading states if needed
 * 
 * USAGE:
 * ------
 * import { useData } from '@/contexts/data-context';
 * 
 * const { projects, createProject, updateProject } = useData();
 * 
 * CURRENT STATE:
 * --------------
 * - All data stored in React state (in-memory)
 * - Data resets on page refresh
 * - Mock delays simulate API latency
 * - Ready for API integration - just replace the method implementations
 * 
 * See API_INTEGRATION.md for endpoint specifications
 */

"use client"

import React, { createContext, useContext, useState, useCallback } from "react";
import { toast } from "sonner";
import type { Project, Asset } from "@/types";

// Re-export types for backwards compatibility
export type { Project, Asset };

interface DataContextType {
  projects: Project[];
  createProject: (project: Omit<Project, "id" | "assets" | "compliance" | "updated" | "createdDate">) => Promise<Project>;
  updateProject: (id: string, updates: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  getProjectById: (id: string) => Project | undefined;
  
  assets: Record<string, Asset[]>;
  createAsset: (projectId: string, asset: Omit<Asset, "id" | "projectId" | "updated" | "createdDate">) => Promise<Asset>;
  updateAsset: (projectId: string, assetId: string, updates: Partial<Asset>) => Promise<void>;
  deleteAsset: (projectId: string, assetId: string) => Promise<void>;
  getAssetById: (projectId: string, assetId: string) => Asset | undefined;
  getProjectAssets: (projectId: string) => Asset[];
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// Initial mock data
const initialProjects: Project[] = [
  {
    id: "1",
    companyId: "company-1",  // belongs to Acme Corporation
    name: "Summer Campaign 2024",
    description: "AI-generated marketing content for Q3 summer campaign",
    status: "Active",
    priority: "high",
    assets: 4,
    compliance: 92,
    risk: "Low",
    updated: "2 hours ago",
    createdDate: "June 15, 2024",
    owner: "Sarah Johnson",
    members: ["Jeff Gordon", "Dev Vznlab", "JG"],
    targetDate: "2024-03-15",
    creatorIds: ["creator-1", "creator-2"], // Sarah Johnson (voice) and Brandy the Bear (mascot)
  },
  {
    id: "2",
    companyId: "company-1",  // belongs to Acme Corporation
    name: "Product Launch Video",
    description: "Promotional video with AI-enhanced visuals and voiceover",
    status: "Review",
    priority: "urgent",
    assets: 2,
    compliance: 78,
    risk: "Medium",
    updated: "5 hours ago",
    createdDate: "July 8, 2024",
    owner: "Michael Chen",
    members: ["Asad", "Husnain Raza"],
    targetDate: "2024-04-30",
    creatorIds: ["creator-1"], // Sarah Johnson (voiceover)
  },
  {
    id: "3",
    companyId: "company-2",  // belongs to TechStart Inc
    name: "Brand Refresh Campaign",
    description: "Complete brand refresh campaign with new visual identity",
    status: "Active",
    priority: "medium",
    assets: 8,
    compliance: 85,
    risk: "Medium",
    updated: "1 day ago",
    createdDate: "August 1, 2024",
    owner: "Emily Rodriguez",
    members: ["Ryan", "Zlane", "Abdul Qadeer", "Asad"],
    targetDate: "2024-05-20",
    creatorIds: ["creator-3"], // New creator
  },
  {
    id: "4",
    companyId: "company-1",  // belongs to Acme Corporation
    name: "Social Media Content Q4",
    description: "Automated social media posts and graphics",
    status: "Approved",
    priority: "low",
    assets: 0,
    compliance: 98,
    risk: "Low",
    updated: "2 days ago",
    createdDate: "September 5, 2024",
    owner: "James Wilson",
    members: ["Jeff Gordon"],
    targetDate: "2024-06-10",
  },
  {
    id: "5",
    companyId: "company-2",  // belongs to TechStart Inc
    name: "Podcast Series AI Voices",
    description: "AI voice cloning for podcast series production",
    status: "Active",
    priority: "medium",
    assets: 0,
    compliance: 85,
    risk: "Medium",
    updated: "3 days ago",
    createdDate: "October 12, 2024",
    owner: "Sarah Johnson",
    members: ["Dev Vznlab", "Husnain Raza"],
    targetDate: "2024-07-05",
    creatorIds: ["creator-1"], // Sarah Johnson (voice actor)
  },
];

const initialAssets: Record<string, Asset[]> = {
  "1": [
    {
      id: "1",
      projectId: "1",
      name: "hero-image-final.jpg",
      type: "Image",
      aiMethod: "AI Generative",
      status: "Approved",
      risk: "Low",
      compliance: 95,
      updated: "2 hours ago",
      createdDate: "June 20, 2024 at 3:42 PM",
      creator: "Sarah Johnson",
      creatorIds: ["creator-2"], // Brandy the Bear (mascot in image)
    },
    {
      id: "2",
      projectId: "1",
      name: "product-description.txt",
      type: "Text",
      aiMethod: "AI Augmented",
      status: "Approved",
      risk: "Low",
      compliance: 92,
      updated: "5 hours ago",
      createdDate: "June 21, 2024 at 10:15 AM",
      creator: "Sarah Johnson",
    },
    {
      id: "3",
      projectId: "1",
      name: "voice-over-v2.mp3",
      type: "Audio",
      aiMethod: "AI Generative",
      status: "Review",
      risk: "Medium",
      compliance: 78,
      updated: "1 day ago",
      createdDate: "June 22, 2024 at 2:30 PM",
      creator: "Michael Chen",
      creatorIds: ["creator-1"], // Sarah Johnson (voice actor)
    },
    {
      id: "4",
      projectId: "1",
      name: "promotional-video.mp4",
      type: "Video",
      aiMethod: "AI Augmented",
      status: "Draft",
      risk: "Low",
      compliance: 88,
      updated: "2 days ago",
      createdDate: "June 23, 2024 at 11:20 AM",
      creator: "Emma Davis",
      creatorIds: ["creator-1", "creator-2"], // Sarah Johnson (voice) and Brandy the Bear (visual)
    },
  ],
  "2": [
    {
      id: "1",
      projectId: "2",
      name: "main-video-edit.mp4",
      type: "Video",
      aiMethod: "AI Augmented",
      status: "Review",
      risk: "Medium",
      compliance: 82,
      updated: "3 hours ago",
      createdDate: "July 10, 2024",
      creator: "Michael Chen",
      creatorIds: ["creator-1"], // Sarah Johnson (voiceover)
    },
    {
      id: "2",
      projectId: "2",
      name: "background-music.wav",
      type: "Audio",
      aiMethod: "AI Generative",
      status: "Approved",
      risk: "Low",
      compliance: 94,
      updated: "1 day ago",
      createdDate: "July 12, 2024",
      creator: "James Wilson",
    },
  ],
  "3": [
    {
      id: "1",
      projectId: "3",
      name: "logo-redesign.svg",
      type: "Image",
      aiMethod: "AI Augmented",
      status: "Draft",
      risk: "High",
      compliance: 45,
      updated: "1 day ago",
      createdDate: "August 25, 2024",
      creator: "Emma Davis",
      creatorIds: ["creator-2"], // Brandy the Bear (brand mascot)
    },
  ],
};

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [assets, setAssets] = useState<Record<string, Asset[]>>(initialAssets);

  // ==============================================
  // Project CRUD Operations
  // ==============================================

  /**
   * Create a new project
   * 
   * INTEGRATION: Replace with:
   * const { project } = await api.projects.create(projectData);
   * setProjects(prev => [project, ...prev]);
   */
  const createProject = useCallback(async (projectData: Omit<Project, "id" | "assets" | "compliance" | "updated" | "createdDate">) => {
    // INTEGRATION POINT: Replace this simulation with real API call
    // Example: const response = await api.projects.create(projectData)
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const newProject: Project = {
      ...projectData,
      id: String(Date.now()),
      assets: 0,
      compliance: 0,
      updated: "Just now",
      createdDate: new Date().toLocaleDateString("en-US", { 
        year: "numeric", 
        month: "long", 
        day: "numeric" 
      }),
    };

    setProjects(prev => [newProject, ...prev]);
    return newProject;
  }, []);

  /**
   * Update an existing project
   * 
   * INTEGRATION: Replace with:
   * const { project } = await api.projects.update(id, updates);
   * setProjects(prev => prev.map(p => p.id === id ? project : p));
   */
  const updateProject = useCallback(async (id: string, updates: Partial<Project>) => {
    // INTEGRATION POINT: Replace with API call
    // Example: await api.projects.update(id, updates)
    await new Promise(resolve => setTimeout(resolve, 300));
    
    setProjects(prev => prev.map(p => 
      p.id === id 
        ? { ...p, ...updates }
        : p
    ));
  }, []);

  /**
   * Delete a project and all its assets
   * 
   * INTEGRATION: Replace with:
   * await api.projects.delete(id);
   */
  const deleteProject = useCallback(async (id: string) => {
    // INTEGRATION POINT: Replace with API call
    // Example: await api.projects.delete(id)
    await new Promise(resolve => setTimeout(resolve, 300));
    
    setProjects(prev => prev.filter(p => p.id !== id));
    setAssets(prev => {
      const newAssets = { ...prev };
      delete newAssets[id];
      return newAssets;
    });
  }, []);

  const getProjectById = useCallback((id: string) => {
    return projects.find(p => p.id === id);
  }, [projects]);

  // ==============================================
  // Asset CRUD Operations
  // ==============================================

  /**
   * Create a new asset in a project
   * 
   * INTEGRATION: Replace with:
   * const { asset } = await api.assets.create(projectId, assetData);
   * // Update state with returned asset
   */
  const createAsset = useCallback(async (projectId: string, assetData: Omit<Asset, "id" | "projectId" | "updated" | "createdDate">) => {
    // INTEGRATION POINT: Replace with API call
    // Example: const response = await api.assets.create(projectId, assetData)
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const newAsset: Asset = {
      ...assetData,
      id: String(Date.now()),
      projectId,
      updated: "Just now",
      createdDate: new Date().toLocaleString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
      }),
    };

    setAssets(prev => ({
      ...prev,
      [projectId]: [...(prev[projectId] || []), newAsset],
    }));

    // Update project asset count
    setProjects(prev => prev.map(p =>
      p.id === projectId
        ? { ...p, assets: p.assets + 1, updated: "Just now" }
        : p
    ));

    return newAsset;
  }, []);

  const updateAsset = useCallback(async (projectId: string, assetId: string, updates: Partial<Asset>) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    setAssets(prev => ({
      ...prev,
      [projectId]: (prev[projectId] || []).map(a =>
        a.id === assetId
          ? { ...a, ...updates, updated: "Just now" }
          : a
      ),
    }));

    // Update project updated time
    setProjects(prev => prev.map(p =>
      p.id === projectId
        ? { ...p, updated: "Just now" }
        : p
    ));
  }, []);

  const deleteAsset = useCallback(async (projectId: string, assetId: string) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    setAssets(prev => ({
      ...prev,
      [projectId]: (prev[projectId] || []).filter(a => a.id !== assetId),
    }));

    // Update project asset count
    setProjects(prev => prev.map(p =>
      p.id === projectId
        ? { ...p, assets: Math.max(0, p.assets - 1), updated: "Just now" }
        : p
    ));
  }, []);

  const getAssetById = useCallback((projectId: string, assetId: string) => {
    return assets[projectId]?.find(a => a.id === assetId);
  }, [assets]);

  const getProjectAssets = useCallback((projectId: string) => {
    return assets[projectId] || [];
  }, [assets]);

  return (
    <DataContext.Provider
      value={{
        projects,
        createProject,
        updateProject,
        deleteProject,
        getProjectById,
        assets,
        createAsset,
        updateAsset,
        deleteAsset,
        getAssetById,
        getProjectAssets,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useData must be used within DataProvider");
  }
  return context;
}

