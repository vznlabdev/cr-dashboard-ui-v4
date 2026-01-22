// Mock data for Companies, Projects, Task Groups, and Tasks
// This will be replaced with API calls in production

import type { Company, Project, TaskGroup, Task } from "@/types"

// =============================================================================
// COMPANIES DATA
// =============================================================================

export const mockCompanies: Company[] = [
  {
    id: 'company-1',
    name: 'Acme Corporation',
    logo_url: 'https://placehold.co/200x200/3b82f6/white?text=ACME',
    branding_colors: '#3b82f6,#1e3a5f,#f97316',
    timezone: 'America/New_York',
    status: 'active',
    created_at: '2024-01-15T00:00:00Z',
    updated_at: '2024-12-01T00:00:00Z',
  },
  {
    id: 'company-2',
    name: 'TechStart Inc',
    logo_url: 'https://placehold.co/200x200/8b5cf6/white?text=TS',
    branding_colors: '#8b5cf6,#4c1d95,#ec4899',
    timezone: 'America/Los_Angeles',
    status: 'active',
    created_at: '2024-03-10T00:00:00Z',
    updated_at: '2024-12-05T00:00:00Z',
  },
]

// =============================================================================
// PROJECTS DATA
// =============================================================================

export const mockProjects: Project[] = [
  {
    id: '1',
    companyId: 'company-1',  // belongs to Acme Corporation
    name: 'Summer Campaign 2024',
    description: 'AI-generated marketing content for Q3 summer campaign',
    status: 'Active',
    assets: 4,
    compliance: 92,
    risk: 'Low',
    updated: '2 hours ago',
    createdDate: 'June 15, 2024',
    owner: 'Sarah Johnson',
    creatorIds: ['creator-1', 'creator-2'],
  },
  {
    id: '2',
    companyId: 'company-1',  // belongs to Acme Corporation
    name: 'Product Launch Video',
    description: 'Promotional video with AI-enhanced visuals and voiceover',
    status: 'Review',
    assets: 2,
    compliance: 78,
    risk: 'Medium',
    updated: '5 hours ago',
    createdDate: 'July 8, 2024',
    owner: 'Michael Chen',
    creatorIds: ['creator-1'],
  },
  {
    id: '3',
    companyId: 'company-2',  // belongs to TechStart Inc
    name: 'Brand Refresh Campaign',
    description: 'Complete brand refresh campaign with new visual identity',
    status: 'Active',
    assets: 8,
    compliance: 85,
    risk: 'Medium',
    updated: '1 day ago',
    createdDate: 'August 1, 2024',
    owner: 'Emily Rodriguez',
    creatorIds: ['creator-3'],
  },
]

// =============================================================================
// TASK GROUPS DATA
// =============================================================================

export const mockTaskGroups: TaskGroup[] = [
  // Task Groups for Project 1: Summer Campaign 2024
  {
    id: 'tg-1',
    projectId: '1',
    name: 'Social Media Assets',
    description: 'Instagram, Facebook, and Twitter campaign materials',
    color: '#3b82f6',  // blue
    displayOrder: 1,
    createdBy: 'Sarah Johnson',
    createdAt: '2024-06-15T10:00:00Z',
    updatedAt: '2024-06-20T14:30:00Z',
  },
  {
    id: 'tg-2',
    projectId: '1',
    name: 'Print Materials',
    description: 'Brochures, flyers, and outdoor advertising',
    color: '#8b5cf6',  // purple
    displayOrder: 2,
    createdBy: 'Sarah Johnson',
    createdAt: '2024-06-15T10:15:00Z',
    updatedAt: '2024-06-18T09:20:00Z',
  },
  {
    id: 'tg-3',
    projectId: '1',
    name: 'Legal & Compliance',
    description: 'Copyright, trademark, and regulatory review tasks',
    color: '#f59e0b',  // amber
    displayOrder: 3,
    createdBy: 'Legal Team',
    createdAt: '2024-06-16T08:00:00Z',
    updatedAt: '2024-06-22T11:45:00Z',
  },
  
  // Task Groups for Project 2: Product Launch Video
  {
    id: 'tg-4',
    projectId: '2',
    name: 'Video Production',
    description: 'Filming, editing, and post-production tasks',
    color: '#ec4899',  // pink
    displayOrder: 1,
    createdBy: 'Michael Chen',
    createdAt: '2024-07-08T09:00:00Z',
    updatedAt: '2024-07-15T16:30:00Z',
  },
  {
    id: 'tg-5',
    projectId: '2',
    name: 'Distribution & Marketing',
    description: 'Platform uploads, promotional materials, and ad campaigns',
    color: '#10b981',  // green
    displayOrder: 2,
    createdBy: 'Marketing Team',
    createdAt: '2024-07-08T09:30:00Z',
    updatedAt: '2024-07-20T10:15:00Z',
  },
  
  // Task Groups for Project 3: Brand Refresh Campaign
  {
    id: 'tg-6',
    projectId: '3',
    name: 'Brand Identity Design',
    description: 'Logo, color palette, typography, and brand guidelines',
    color: '#6366f1',  // indigo
    displayOrder: 1,
    createdBy: 'Emily Rodriguez',
    createdAt: '2024-08-01T10:00:00Z',
    updatedAt: '2024-08-10T14:00:00Z',
  },
  {
    id: 'tg-7',
    projectId: '3',
    name: 'Website Redesign',
    description: 'New website design and development',
    color: '#14b8a6',  // teal
    displayOrder: 2,
    createdBy: 'Emily Rodriguez',
    createdAt: '2024-08-01T10:30:00Z',
    updatedAt: '2024-08-15T09:45:00Z',
  },
  {
    id: 'tg-8',
    projectId: '3',
    name: 'Trade Show Materials',
    description: 'Booth design, banners, and promotional items',
    color: '#f97316',  // orange
    displayOrder: 3,
    createdBy: 'Events Team',
    createdAt: '2024-08-05T11:00:00Z',
    updatedAt: '2024-08-20T13:20:00Z',
  },
]

// =============================================================================
// TASKS DATA
// =============================================================================

export const mockTasks: Task[] = [
  // Tasks for Task Group 1: Social Media Assets (Project 1)
  {
    id: 'task-1',
    taskGroupId: 'tg-1',
    projectId: '1',
    workstream: 'creator',
    title: 'Design hero image',
    status: 'production',
    assignee: 'Sarah Chen',
    dueDate: 'Dec 20, 2024',
    createdDate: 'Dec 1, 2024',
    updatedAt: '2024-12-15T18:00:00Z',  // 3 hours ago
  },
  {
    id: 'task-2',
    taskGroupId: 'tg-1',
    projectId: '1',
    workstream: 'creator',
    title: 'Write copy variations',
    status: 'submitted',
    assignee: 'Mike Johnson',
    dueDate: 'Dec 18, 2024',
    createdDate: 'Dec 2, 2024',
    updatedAt: '2024-12-14T21:00:00Z',  // 1 day ago
  },
  {
    id: 'task-9',
    taskGroupId: 'tg-1',
    projectId: '1',
    workstream: 'creator',
    title: 'Create Instagram stories',
    status: 'assigned',
    assignee: 'Sarah Chen',
    dueDate: 'Dec 21, 2024',
    createdDate: 'Dec 7, 2024',
    updatedAt: '2024-12-15T19:00:00Z',  // 2 hours ago
  },
  {
    id: 'task-10',
    taskGroupId: 'tg-1',
    projectId: '1',
    workstream: 'creator',
    title: 'Design Facebook ad variants',
    status: 'qa_review',
    assignee: 'QA Team',
    dueDate: 'Dec 19, 2024',
    createdDate: 'Dec 3, 2024',
    updatedAt: '2024-12-15T17:00:00Z',  // 4 hours ago
  },
  {
    id: 'task-11',
    taskGroupId: 'tg-1',
    projectId: '1',
    workstream: 'creator',
    title: 'Twitter banner design',
    status: 'delivered',
    assignee: 'Sarah Chen',
    dueDate: 'Dec 15, 2024',
    createdDate: 'Nov 30, 2024',
    updatedAt: '2024-12-12T21:00:00Z',  // 3 days ago
  },
  
  // Tasks for Task Group 2: Print Materials (Project 1)
  {
    id: 'task-12',
    taskGroupId: 'tg-2',
    projectId: '1',
    workstream: 'creator',
    title: 'Design brochure layout',
    status: 'assessment',
    assignee: 'Print Team',
    dueDate: 'Dec 23, 2024',
    createdDate: 'Dec 8, 2024',
    updatedAt: '2024-12-15T20:00:00Z',  // 1 hour ago
  },
  {
    id: 'task-13',
    taskGroupId: 'tg-2',
    projectId: '1',
    workstream: 'creator',
    title: 'Create outdoor billboard',
    status: 'assigned',
    assignee: 'Design Team',
    dueDate: 'Dec 28, 2024',
    createdDate: 'Dec 9, 2024',
    updatedAt: '2024-12-15T20:30:00Z',  // 30 minutes ago
  },
  
  // Tasks for Task Group 3: Legal & Compliance (Project 1)
  {
    id: 'task-3',
    taskGroupId: 'tg-3',
    projectId: '1',
    workstream: 'legal',
    title: 'Review trademark usage',
    status: 'assessment',
    assignee: 'Legal Team',
    dueDate: 'Dec 22, 2024',
    createdDate: 'Dec 3, 2024',
    updatedAt: '2024-12-15T16:00:00Z',  // 5 hours ago
  },
  {
    id: 'task-4',
    taskGroupId: 'tg-3',
    projectId: '1',
    workstream: 'insurance',
    title: 'Verify AI content provenance',
    status: 'submitted',
    assignee: 'Insurance Analyst',
    dueDate: 'Dec 25, 2024',
    createdDate: 'Dec 4, 2024',
    updatedAt: '2024-12-13T21:00:00Z',  // 2 days ago
  },
  
  // Tasks for Task Group 4: Video Production (Project 2)
  {
    id: 'task-5',
    taskGroupId: 'tg-4',
    projectId: '2',
    workstream: 'creator',
    title: 'Edit product demo',
    status: 'production',
    assignee: 'Emily Davis',
    dueDate: 'Dec 15, 2024',
    createdDate: 'Dec 5, 2024',
    updatedAt: '2024-12-15T17:00:00Z',  // 4 hours ago
  },
  {
    id: 'task-6',
    taskGroupId: 'tg-4',
    projectId: '2',
    workstream: 'creator',
    title: 'Add background music',
    status: 'production',
    assignee: 'Audio Team',
    dueDate: 'Dec 16, 2024',
    createdDate: 'Dec 6, 2024',
    updatedAt: '2024-12-15T15:00:00Z',  // 6 hours ago
  },
  {
    id: 'task-14',
    taskGroupId: 'tg-4',
    projectId: '2',
    workstream: 'creator',
    title: 'Color grading and effects',
    status: 'qa_review',
    assignee: 'QA Team',
    dueDate: 'Dec 17, 2024',
    createdDate: 'Dec 4, 2024',
    updatedAt: '2024-12-15T13:00:00Z',  // 8 hours ago
  },
  
  // Tasks for Task Group 5: Distribution & Marketing (Project 2)
  {
    id: 'task-15',
    taskGroupId: 'tg-5',
    projectId: '2',
    workstream: 'creator',
    title: 'Upload to YouTube',
    status: 'assigned',
    assignee: 'Marketing Team',
    dueDate: 'Dec 18, 2024',
    createdDate: 'Dec 8, 2024',
    updatedAt: '2024-12-15T19:00:00Z',  // 2 hours ago
  },
  {
    id: 'task-16',
    taskGroupId: 'tg-5',
    projectId: '2',
    workstream: 'creator',
    title: 'Create promotional thumbnails',
    status: 'delivered',
    assignee: 'Design Team',
    dueDate: 'Dec 14, 2024',
    createdDate: 'Dec 2, 2024',
    updatedAt: '2024-12-11T21:00:00Z',  // 4 days ago
  },
  
  // Tasks for Task Group 6: Brand Identity Design (Project 3)
  {
    id: 'task-7',
    taskGroupId: 'tg-6',
    projectId: '3',
    workstream: 'creator',
    title: 'Design new logo concepts',
    status: 'qa_review',
    assignee: 'Design Team',
    dueDate: 'Dec 10, 2024',
    createdDate: 'Nov 28, 2024',
    updatedAt: '2024-12-13T21:00:00Z',  // 2 days ago
  },
  {
    id: 'task-8',
    taskGroupId: 'tg-6',
    projectId: '3',
    workstream: 'legal',
    title: 'Trademark search for new logo',
    status: 'assessment',
    assignee: 'Legal Team',
    dueDate: 'Dec 12, 2024',
    createdDate: 'Nov 30, 2024',
    updatedAt: '2024-12-14T21:00:00Z',  // 1 day ago
  },
  {
    id: 'task-17',
    taskGroupId: 'tg-6',
    projectId: '3',
    workstream: 'creator',
    title: 'Define brand color palette',
    status: 'delivered',
    assignee: 'Design Team',
    dueDate: 'Dec 5, 2024',
    createdDate: 'Nov 25, 2024',
    updatedAt: '2024-12-10T21:00:00Z',  // 5 days ago
  },
  
  // Tasks for Task Group 8: Trade Show Materials (Project 3)
  {
    id: 'task-18',
    taskGroupId: 'tg-8',
    projectId: '3',
    workstream: 'creator',
    title: 'Design booth layout',
    status: 'production',
    assignee: 'Events Team',
    dueDate: 'Dec 30, 2024',
    createdDate: 'Dec 10, 2024',
    updatedAt: '2024-12-15T20:00:00Z',  // 1 hour ago
  },
  {
    id: 'task-19',
    taskGroupId: 'tg-8',
    projectId: '3',
    workstream: 'creator',
    title: 'Create promotional banners',
    status: 'assigned',
    assignee: 'Print Team',
    dueDate: 'Dec 28, 2024',
    createdDate: 'Dec 9, 2024',
    updatedAt: '2024-12-15T18:00:00Z',  // 3 hours ago
  },
  
  // Additional Tasks for Project 3 - Brand Identity Design Group (tg-6)
  {
    id: 'task-20',
    taskGroupId: 'tg-6',
    projectId: '3',
    workstream: 'creator',
    title: 'Create typography guidelines',
    status: 'submitted',
    assignee: 'Design Team',
    dueDate: 'Dec 22, 2024',
    createdDate: 'Dec 11, 2024',
    updatedAt: '2024-12-15T21:00:00Z',
  },
  {
    id: 'task-21',
    taskGroupId: 'tg-6',
    projectId: '3',
    workstream: 'creator',
    title: 'Design business card templates',
    status: 'submitted',
    assignee: 'Sarah Chen',
    dueDate: 'Dec 20, 2024',
    createdDate: 'Dec 12, 2024',
    updatedAt: '2024-12-15T20:30:00Z',
  },
  {
    id: 'task-22',
    taskGroupId: 'tg-6',
    projectId: '3',
    workstream: 'creator',
    title: 'Create letterhead design',
    status: 'assessment',
    assignee: 'Mike Johnson',
    dueDate: 'Dec 21, 2024',
    createdDate: 'Dec 10, 2024',
    updatedAt: '2024-12-15T19:30:00Z',
  },
  {
    id: 'task-23',
    taskGroupId: 'tg-6',
    projectId: '3',
    workstream: 'creator',
    title: 'Design email signature templates',
    status: 'assessment',
    assignee: 'Design Team',
    dueDate: 'Dec 23, 2024',
    createdDate: 'Dec 9, 2024',
    updatedAt: '2024-12-15T18:45:00Z',
  },
  {
    id: 'task-24',
    taskGroupId: 'tg-6',
    projectId: '3',
    workstream: 'legal',
    title: 'Verify logo copyright clearance',
    status: 'assessment',
    assignee: 'Legal Team',
    dueDate: 'Dec 19, 2024',
    createdDate: 'Dec 8, 2024',
    updatedAt: '2024-12-15T17:30:00Z',
  },
  {
    id: 'task-25',
    taskGroupId: 'tg-6',
    projectId: '3',
    workstream: 'creator',
    title: 'Create brand style guide',
    status: 'production',
    assignee: 'Emily Davis',
    dueDate: 'Dec 24, 2024',
    createdDate: 'Dec 5, 2024',
    updatedAt: '2024-12-15T16:00:00Z',
  },
  {
    id: 'task-26',
    taskGroupId: 'tg-6',
    projectId: '3',
    workstream: 'creator',
    title: 'Design icon set',
    status: 'production',
    assignee: 'Sarah Chen',
    dueDate: 'Dec 25, 2024',
    createdDate: 'Dec 6, 2024',
    updatedAt: '2024-12-15T15:30:00Z',
  },
  
  // Additional Tasks for Website Redesign Group (tg-7)
  {
    id: 'task-27',
    taskGroupId: 'tg-7',
    projectId: '3',
    workstream: 'creator',
    title: 'Design homepage mockup',
    status: 'submitted',
    assignee: 'Web Design Team',
    dueDate: 'Dec 26, 2024',
    createdDate: 'Dec 13, 2024',
    updatedAt: '2024-12-15T22:00:00Z',
  },
  {
    id: 'task-28',
    taskGroupId: 'tg-7',
    projectId: '3',
    workstream: 'creator',
    title: 'Create product page templates',
    status: 'submitted',
    assignee: 'Design Team',
    dueDate: 'Dec 27, 2024',
    createdDate: 'Dec 13, 2024',
    updatedAt: '2024-12-15T21:45:00Z',
  },
  {
    id: 'task-29',
    taskGroupId: 'tg-7',
    projectId: '3',
    workstream: 'creator',
    title: 'Design mobile navigation',
    status: 'submitted',
    assignee: 'UX Team',
    dueDate: 'Dec 24, 2024',
    createdDate: 'Dec 12, 2024',
    updatedAt: '2024-12-15T21:30:00Z',
  },
  {
    id: 'task-30',
    taskGroupId: 'tg-7',
    projectId: '3',
    workstream: 'creator',
    title: 'Create contact form design',
    status: 'assessment',
    assignee: 'Web Design Team',
    dueDate: 'Dec 22, 2024',
    createdDate: 'Dec 11, 2024',
    updatedAt: '2024-12-15T20:15:00Z',
  },
  {
    id: 'task-31',
    taskGroupId: 'tg-7',
    projectId: '3',
    workstream: 'creator',
    title: 'Design footer layout',
    status: 'assigned',
    assignee: 'Design Team',
    dueDate: 'Dec 23, 2024',
    createdDate: 'Dec 10, 2024',
    updatedAt: '2024-12-15T19:45:00Z',
  },
  {
    id: 'task-32',
    taskGroupId: 'tg-7',
    projectId: '3',
    workstream: 'creator',
    title: 'Create hero section variants',
    status: 'assigned',
    assignee: 'Sarah Chen',
    dueDate: 'Dec 21, 2024',
    createdDate: 'Dec 9, 2024',
    updatedAt: '2024-12-15T19:00:00Z',
  },
  {
    id: 'task-33',
    taskGroupId: 'tg-7',
    projectId: '3',
    workstream: 'creator',
    title: 'Design about page layout',
    status: 'production',
    assignee: 'Mike Johnson',
    dueDate: 'Dec 26, 2024',
    createdDate: 'Dec 7, 2024',
    updatedAt: '2024-12-15T18:30:00Z',
  },
  {
    id: 'task-34',
    taskGroupId: 'tg-7',
    projectId: '3',
    workstream: 'creator',
    title: 'Create blog layout templates',
    status: 'production',
    assignee: 'Design Team',
    dueDate: 'Dec 25, 2024',
    createdDate: 'Dec 6, 2024',
    updatedAt: '2024-12-15T17:45:00Z',
  },
  {
    id: 'task-35',
    taskGroupId: 'tg-7',
    projectId: '3',
    workstream: 'creator',
    title: 'Design 404 error page',
    status: 'qa_review',
    assignee: 'QA Team',
    dueDate: 'Dec 20, 2024',
    createdDate: 'Dec 4, 2024',
    updatedAt: '2024-12-15T16:30:00Z',
  },
  {
    id: 'task-36',
    taskGroupId: 'tg-7',
    projectId: '3',
    workstream: 'creator',
    title: 'Create loading animations',
    status: 'qa_review',
    assignee: 'Animation Team',
    dueDate: 'Dec 21, 2024',
    createdDate: 'Dec 5, 2024',
    updatedAt: '2024-12-15T15:45:00Z',
  },
  {
    id: 'task-37',
    taskGroupId: 'tg-7',
    projectId: '3',
    workstream: 'creator',
    title: 'Design testimonials section',
    status: 'delivered',
    assignee: 'Design Team',
    dueDate: 'Dec 18, 2024',
    createdDate: 'Dec 2, 2024',
    updatedAt: '2024-12-14T21:00:00Z',
  },
  
  // Additional Tasks for Trade Show Materials (tg-8)
  {
    id: 'task-38',
    taskGroupId: 'tg-8',
    projectId: '3',
    workstream: 'creator',
    title: 'Design trade show booth graphics',
    status: 'submitted',
    assignee: 'Events Team',
    dueDate: 'Dec 29, 2024',
    createdDate: 'Dec 13, 2024',
    updatedAt: '2024-12-15T22:15:00Z',
  },
  {
    id: 'task-39',
    taskGroupId: 'tg-8',
    projectId: '3',
    workstream: 'creator',
    title: 'Create product catalog',
    status: 'assessment',
    assignee: 'Print Team',
    dueDate: 'Dec 27, 2024',
    createdDate: 'Dec 12, 2024',
    updatedAt: '2024-12-15T21:15:00Z',
  },
  {
    id: 'task-40',
    taskGroupId: 'tg-8',
    projectId: '3',
    workstream: 'creator',
    title: 'Design giveaway items',
    status: 'assessment',
    assignee: 'Design Team',
    dueDate: 'Dec 26, 2024',
    createdDate: 'Dec 11, 2024',
    updatedAt: '2024-12-15T20:45:00Z',
  },
  {
    id: 'task-41',
    taskGroupId: 'tg-8',
    projectId: '3',
    workstream: 'creator',
    title: 'Create signage designs',
    status: 'assigned',
    assignee: 'Events Team',
    dueDate: 'Dec 28, 2024',
    createdDate: 'Dec 10, 2024',
    updatedAt: '2024-12-15T19:15:00Z',
  },
  {
    id: 'task-42',
    taskGroupId: 'tg-8',
    projectId: '3',
    workstream: 'creator',
    title: 'Design presentation slides',
    status: 'production',
    assignee: 'Presentation Team',
    dueDate: 'Dec 30, 2024',
    createdDate: 'Dec 8, 2024',
    updatedAt: '2024-12-15T18:00:00Z',
  },
  {
    id: 'task-43',
    taskGroupId: 'tg-8',
    projectId: '3',
    workstream: 'creator',
    title: 'Create promotional video',
    status: 'production',
    assignee: 'Video Team',
    dueDate: 'Dec 31, 2024',
    createdDate: 'Dec 7, 2024',
    updatedAt: '2024-12-15T17:00:00Z',
  },
  {
    id: 'task-44',
    taskGroupId: 'tg-8',
    projectId: '3',
    workstream: 'creator',
    title: 'Design booth backdrop',
    status: 'qa_review',
    assignee: 'QA Team',
    dueDate: 'Dec 25, 2024',
    createdDate: 'Dec 5, 2024',
    updatedAt: '2024-12-15T16:15:00Z',
  },
  {
    id: 'task-45',
    taskGroupId: 'tg-8',
    projectId: '3',
    workstream: 'legal',
    title: 'Review booth materials compliance',
    status: 'qa_review',
    assignee: 'Legal Team',
    dueDate: 'Dec 24, 2024',
    createdDate: 'Dec 4, 2024',
    updatedAt: '2024-12-15T15:00:00Z',
  },
  {
    id: 'task-46',
    taskGroupId: 'tg-8',
    projectId: '3',
    workstream: 'creator',
    title: 'Create handout materials',
    status: 'delivered',
    assignee: 'Print Team',
    dueDate: 'Dec 19, 2024',
    createdDate: 'Dec 3, 2024',
    updatedAt: '2024-12-14T20:00:00Z',
  },
  {
    id: 'task-47',
    taskGroupId: 'tg-8',
    projectId: '3',
    workstream: 'creator',
    title: 'Design name badges',
    status: 'delivered',
    assignee: 'Design Team',
    dueDate: 'Dec 18, 2024',
    createdDate: 'Dec 2, 2024',
    updatedAt: '2024-12-13T21:00:00Z',
  },
  
  // More tasks for Brand Identity (tg-6)
  {
    id: 'task-48',
    taskGroupId: 'tg-6',
    projectId: '3',
    workstream: 'creator',
    title: 'Design social media templates',
    status: 'assigned',
    assignee: 'Social Media Team',
    dueDate: 'Dec 27, 2024',
    createdDate: 'Dec 11, 2024',
    updatedAt: '2024-12-15T20:00:00Z',
  },
  {
    id: 'task-49',
    taskGroupId: 'tg-6',
    projectId: '3',
    workstream: 'creator',
    title: 'Create presentation deck template',
    status: 'qa_review',
    assignee: 'Design Team',
    dueDate: 'Dec 22, 2024',
    createdDate: 'Dec 7, 2024',
    updatedAt: '2024-12-15T18:15:00Z',
  },
  {
    id: 'task-50',
    taskGroupId: 'tg-6',
    projectId: '3',
    workstream: 'creator',
    title: 'Design packaging templates',
    status: 'delivered',
    assignee: 'Packaging Team',
    dueDate: 'Dec 17, 2024',
    createdDate: 'Dec 1, 2024',
    updatedAt: '2024-12-12T20:00:00Z',
  },
]

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

// Company helpers
export function getCompanyById(id: string): Company | undefined {
  return mockCompanies.find((company) => company.id === id)
}

export function getAllCompanies(): Company[] {
  return mockCompanies
}

// Project helpers
export function getProjectById(id: string): Project | undefined {
  return mockProjects.find((project) => project.id === id)
}

export function getProjectsByCompany(companyId: string): Project[] {
  return mockProjects.filter((project) => project.companyId === companyId)
}

export function getAllProjects(): Project[] {
  return mockProjects
}

// Task Group helpers
export function getTaskGroupById(id: string): TaskGroup | undefined {
  return mockTaskGroups.find((group) => group.id === id)
}

export function getTaskGroupsByProject(projectId: string): TaskGroup[] {
  return mockTaskGroups
    .filter((group) => group.projectId === projectId)
    .sort((a, b) => a.displayOrder - b.displayOrder)
}

export function getAllTaskGroups(): TaskGroup[] {
  return mockTaskGroups
}

// Task helpers
export function getTaskById(id: string): Task | undefined {
  return mockTasks.find((task) => task.id === id)
}

export function getTasksByProject(projectId: string): Task[] {
  return mockTasks.filter((task) => task.projectId === projectId)
}

export function getTasksByTaskGroup(taskGroupId: string): Task[] {
  return mockTasks.filter((task) => task.taskGroupId === taskGroupId)
}

export function getTasksByWorkstream(workstream: Task['workstream']): Task[] {
  return mockTasks.filter((task) => task.workstream === workstream)
}

export function getTaskCountByStatus(): Record<string, number> {
  const counts: Record<string, number> = {
    submitted: 0,
    assessment: 0,
    assigned: 0,
    production: 0,
    qa_review: 0,
    delivered: 0,
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

// Hierarchy navigation helpers
export function getCompanyHierarchy(companyId: string) {
  const company = getCompanyById(companyId)
  if (!company) return null
  
  const projects = getProjectsByCompany(companyId)
  const projectsWithGroups = projects.map((project) => ({
    ...project,
    taskGroups: getTaskGroupsByProject(project.id).map((group) => ({
      ...group,
      tasks: getTasksByTaskGroup(group.id),
    })),
  }))
  
  return {
    company,
    projects: projectsWithGroups,
  }
}

export function getProjectHierarchy(projectId: string) {
  const project = getProjectById(projectId)
  if (!project) return null
  
  const taskGroups = getTaskGroupsByProject(projectId).map((group) => ({
    ...group,
    tasks: getTasksByTaskGroup(group.id),
  }))
  
  return {
    project,
    taskGroups,
  }
}
