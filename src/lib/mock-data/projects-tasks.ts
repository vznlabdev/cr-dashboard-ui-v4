// Mock data for Projects and Tasks
// This will be replaced with API calls in production

import type { Task } from "@/types"

// =============================================================================
// PROJECTS DATA
// =============================================================================

export interface MockProject {
  id: string
  name: string
  status: 'active' | 'review' | 'draft' | 'approved'
  compliance: number
  risk: 'low' | 'medium' | 'high'
  description?: string
  owner?: string
  createdDate?: string
  updated?: string
}

export const mockProjects: MockProject[] = [
  {
    id: 'proj-1',
    name: 'Brand Refresh Campaign',
    status: 'active',
    compliance: 85,
    risk: 'medium',
    description: 'Complete brand refresh campaign with new visual identity',
    owner: 'Sarah Johnson',
    createdDate: 'Dec 1, 2024',
    updated: '2 hours ago',
  },
  {
    id: 'proj-2',
    name: 'Product Launch Video',
    status: 'review',
    compliance: 78,
    risk: 'medium',
    description: 'Video content for upcoming product launch',
    owner: 'Michael Chen',
    createdDate: 'Dec 5, 2024',
    updated: '1 day ago',
  },
]

// =============================================================================
// TASKS DATA
// =============================================================================

export const mockTasks: Task[] = [
  {
    id: 'task-1',
    projectId: 'proj-1',
    workstream: 'creator',
    title: 'Design hero image',
    status: 'production',
    assignee: 'Sarah Chen',
    dueDate: 'Dec 20, 2024',
    createdDate: 'Dec 1, 2024',
    updated: '3 hours ago',
  },
  {
    id: 'task-2',
    projectId: 'proj-1',
    workstream: 'creator',
    title: 'Write copy variations',
    status: 'submitted',
    assignee: 'Mike Johnson',
    dueDate: 'Dec 18, 2024',
    createdDate: 'Dec 2, 2024',
    updated: '1 day ago',
  },
  {
    id: 'task-3',
    projectId: 'proj-1',
    workstream: 'legal',
    title: 'Review trademark usage',
    status: 'assessment',
    assignee: 'Legal Team',
    dueDate: 'Dec 22, 2024',
    createdDate: 'Dec 3, 2024',
    updated: '5 hours ago',
  },
  {
    id: 'task-4',
    projectId: 'proj-1',
    workstream: 'insurance',
    title: 'Verify AI content provenance',
    status: 'submitted',
    assignee: 'Insurance Analyst',
    dueDate: 'Dec 25, 2024',
    createdDate: 'Dec 4, 2024',
    updated: '2 days ago',
  },
  {
    id: 'task-5',
    projectId: 'proj-2',
    workstream: 'creator',
    title: 'Edit product demo',
    status: 'production',
    assignee: 'Emily Davis',
    dueDate: 'Dec 15, 2024',
    createdDate: 'Dec 5, 2024',
    updated: '4 hours ago',
  },
]

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

export function getTasksByProject(projectId: string): Task[] {
  return mockTasks.filter((task) => task.projectId === projectId)
}

export function getTasksByWorkstream(workstream: Task['workstream']): Task[] {
  return mockTasks.filter((task) => task.workstream === workstream)
}

export function getTaskById(id: string): Task | undefined {
  return mockTasks.find((task) => task.id === id)
}

export function getProjectById(id: string): MockProject | undefined {
  return mockProjects.find((project) => project.id === id)
}

export function getTaskCountByStatus(): Record<string, number> {
  const counts: Record<string, number> = {
    submitted: 0,
    assessment: 0,
    production: 0,
    review: 0,
    completed: 0,
  }
  
  mockTasks.forEach((task) => {
    counts[task.status] = (counts[task.status] || 0) + 1
  })
  
  return counts
}

export function getTaskCountByWorkstream(): Record<string, number> {
  const counts: Record<string, number> = {
    creator: 0,
    legal: 0,
    insurance: 0,
    general: 0,
  }
  
  mockTasks.forEach((task) => {
    counts[task.workstream] = (counts[task.workstream] || 0) + 1
  })
  
  return counts
}
