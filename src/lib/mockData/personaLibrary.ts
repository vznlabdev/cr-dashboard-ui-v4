import type { AssignedCreator } from '@/types/mediaManager'

/**
 * Mock Persona/Creator Library for Media Manager Development
 * 12 creators with varied authorization statuses and roles
 * 
 * Distribution:
 * - 5 authorized (valid, not expiring soon)
 * - 3 expires-soon (< 30 days)
 * - 2 expired
 * - 2 pending (awaiting approval)
 */

export const MOCK_PERSONA_LIBRARY: AssignedCreator[] = [
  // ========== AUTHORIZED (5) ==========
  {
    id: 'persona-001',
    name: 'Sarah Johnson',
    nilpId: 'CR-2025-00001',
    avatarUrl: 'https://i.pravatar.cc/150?img=1',
    authorizationStatus: 'authorized',
    expirationDate: new Date('2026-12-31'),
    role: 'Brand Ambassador',
    nilpComponents: {
      name: true,
      image: true,
      likeness: true,
      personality: true
    },
    metadata: {
      email: 'sarah.johnson@example.com',
      phone: '+1 (555) 123-4567',
      authorizationDoc: 'auth_doc_2025_001.pdf',
      signedDate: new Date('2025-01-01'),
      specialties: ['Brand Representation', 'Social Media', 'Events']
    }
  },
  {
    id: 'persona-002',
    name: 'Marcus Chen',
    nilpId: 'CR-2025-00002',
    avatarUrl: 'https://i.pravatar.cc/150?img=12',
    authorizationStatus: 'authorized',
    expirationDate: new Date('2027-06-30'),
    role: 'Voice Actor',
    nilpComponents: {
      name: true,
      image: false,
      likeness: false,
      personality: true
    },
    metadata: {
      email: 'marcus.chen@example.com',
      phone: '+1 (555) 234-5678',
      authorizationDoc: 'auth_doc_2025_002.pdf',
      signedDate: new Date('2024-12-15'),
      specialties: ['Voice Over', 'Narration', 'Character Voices']
    }
  },
  {
    id: 'persona-003',
    name: 'Aisha Patel',
    nilpId: 'CR-2025-00003',
    avatarUrl: 'https://i.pravatar.cc/150?img=5',
    authorizationStatus: 'authorized',
    expirationDate: new Date('2027-03-15'),
    role: 'Model',
    nilpComponents: {
      name: true,
      image: true,
      likeness: true,
      personality: false
    },
    metadata: {
      email: 'aisha.patel@example.com',
      phone: '+1 (555) 345-6789',
      authorizationDoc: 'auth_doc_2025_003.pdf',
      signedDate: new Date('2024-11-20'),
      specialties: ['Fashion Photography', 'Product Modeling', 'Lifestyle']
    }
  },
  {
    id: 'persona-004',
    name: 'David Lee',
    nilpId: 'CR-2025-00004',
    avatarUrl: 'https://i.pravatar.cc/150?img=13',
    authorizationStatus: 'authorized',
    expirationDate: new Date('2026-09-20'),
    role: 'Actor',
    nilpComponents: {
      name: true,
      image: true,
      likeness: true,
      personality: true
    },
    metadata: {
      email: 'david.lee@example.com',
      phone: '+1 (555) 456-7890',
      authorizationDoc: 'auth_doc_2025_004.pdf',
      signedDate: new Date('2024-10-10'),
      specialties: ['Commercial Acting', 'Video Production', 'Testimonials']
    }
  },
  {
    id: 'persona-005',
    name: 'Emma Rodriguez',
    nilpId: 'CR-2025-00005',
    avatarUrl: 'https://i.pravatar.cc/150?img=9',
    authorizationStatus: 'authorized',
    expirationDate: new Date('2027-01-10'),
    role: 'Influencer',
    nilpComponents: {
      name: true,
      image: true,
      likeness: true,
      personality: true
    },
    metadata: {
      email: 'emma.rodriguez@example.com',
      phone: '+1 (555) 567-8901',
      authorizationDoc: 'auth_doc_2025_005.pdf',
      signedDate: new Date('2024-12-01'),
      specialties: ['Social Media Marketing', 'Content Creation', 'Brand Partnerships'],
      socialMedia: {
        instagram: '@emma_rodriguez',
        tiktok: '@emmar',
        followers: 125000
      }
    }
  },

  // ========== EXPIRES SOON (3) ==========
  {
    id: 'persona-006',
    name: 'James Wilson',
    nilpId: 'CR-2025-00006',
    avatarUrl: 'https://i.pravatar.cc/150?img=14',
    authorizationStatus: 'expires-soon',
    expirationDate: new Date('2025-02-15'), // 22 days from now (assuming today is 2025-01-24)
    role: 'Brand Ambassador',
    nilpComponents: {
      name: true,
      image: true,
      likeness: true,
      personality: true
    },
    metadata: {
      email: 'james.wilson@example.com',
      phone: '+1 (555) 678-9012',
      authorizationDoc: 'auth_doc_2024_045.pdf',
      signedDate: new Date('2024-02-15'),
      specialties: ['Corporate Events', 'Product Launches', 'Media Relations'],
      renewalStatus: 'Renewal in progress'
    }
  },
  {
    id: 'persona-007',
    name: 'Olivia Martinez',
    nilpId: 'CR-2025-00007',
    avatarUrl: 'https://i.pravatar.cc/150?img=10',
    authorizationStatus: 'expires-soon',
    expirationDate: new Date('2025-02-28'), // Expires in ~35 days (but within warning threshold)
    role: 'Voice Actor',
    nilpComponents: {
      name: true,
      image: false,
      likeness: false,
      personality: true
    },
    metadata: {
      email: 'olivia.martinez@example.com',
      phone: '+1 (555) 789-0123',
      authorizationDoc: 'auth_doc_2024_067.pdf',
      signedDate: new Date('2024-02-28'),
      specialties: ['Commercial Voice', 'Audiobooks', 'Podcast Hosting'],
      renewalStatus: 'Awaiting signature'
    }
  },
  {
    id: 'persona-008',
    name: 'Noah Anderson',
    nilpId: 'CR-2025-00008',
    avatarUrl: 'https://i.pravatar.cc/150?img=15',
    authorizationStatus: 'expires-soon',
    expirationDate: new Date('2025-02-20'),
    role: 'Model',
    nilpComponents: {
      name: true,
      image: true,
      likeness: true,
      personality: false
    },
    metadata: {
      email: 'noah.anderson@example.com',
      phone: '+1 (555) 890-1234',
      authorizationDoc: 'auth_doc_2024_089.pdf',
      signedDate: new Date('2024-02-20'),
      specialties: ['Print Modeling', 'E-commerce', 'Lifestyle Photography'],
      renewalStatus: 'Renewal documents sent'
    }
  },

  // ========== EXPIRED (2) ==========
  {
    id: 'persona-009',
    name: 'Sophia Taylor',
    nilpId: 'CR-2024-00523',
    avatarUrl: 'https://i.pravatar.cc/150?img=16',
    authorizationStatus: 'expired',
    expirationDate: new Date('2025-01-01'),
    role: 'Actor',
    nilpComponents: {
      name: true,
      image: true,
      likeness: true,
      personality: true
    },
    metadata: {
      email: 'sophia.taylor@example.com',
      phone: '+1 (555) 901-2345',
      authorizationDoc: 'auth_doc_2024_523.pdf',
      signedDate: new Date('2024-01-01'),
      specialties: ['Video Production', 'Testimonials', 'Training Videos'],
      expirationReason: 'Contract period ended',
      renewalStatus: 'Renewal pending'
    }
  },
  {
    id: 'persona-010',
    name: 'Liam Thompson',
    nilpId: 'CR-2024-00634',
    avatarUrl: 'https://i.pravatar.cc/150?img=17',
    authorizationStatus: 'expired',
    expirationDate: new Date('2024-12-15'),
    role: 'Influencer',
    nilpComponents: {
      name: true,
      image: true,
      likeness: true,
      personality: true
    },
    metadata: {
      email: 'liam.thompson@example.com',
      phone: '+1 (555) 012-3456',
      authorizationDoc: 'auth_doc_2024_634.pdf',
      signedDate: new Date('2023-12-15'),
      specialties: ['Tech Reviews', 'Product Demos', 'Unboxing'],
      socialMedia: {
        instagram: '@liam_tech',
        youtube: '@LiamTechReviews',
        followers: 89000
      },
      expirationReason: 'Annual renewal required',
      renewalStatus: 'Negotiation in progress'
    }
  },

  // ========== PENDING (2) ==========
  {
    id: 'persona-011',
    name: 'Isabella Garcia',
    nilpId: 'CR-2025-00201',
    avatarUrl: 'https://i.pravatar.cc/150?img=20',
    authorizationStatus: 'pending',
    expirationDate: undefined,
    role: 'Model',
    nilpComponents: {
      name: true,
      image: true,
      likeness: true,
      personality: false
    },
    metadata: {
      email: 'isabella.garcia@example.com',
      phone: '+1 (555) 123-7890',
      authorizationDoc: 'auth_doc_2025_201_pending.pdf',
      signedDate: new Date('2025-01-20'),
      specialties: ['Fashion', 'Beauty', 'Editorial'],
      pendingReason: 'Awaiting legal review',
      submittedDate: new Date('2025-01-20'),
      reviewStatus: 'Legal department review'
    }
  },
  {
    id: 'persona-012',
    name: 'Ethan Brown',
    nilpId: 'CR-2025-00389',
    avatarUrl: 'https://i.pravatar.cc/150?img=18',
    authorizationStatus: 'pending',
    expirationDate: undefined,
    role: 'Voice Actor',
    nilpComponents: {
      name: true,
      image: false,
      likeness: false,
      personality: true
    },
    metadata: {
      email: 'ethan.brown@example.com',
      phone: '+1 (555) 234-8901',
      authorizationDoc: 'auth_doc_2025_389_pending.pdf',
      signedDate: new Date('2025-01-22'),
      specialties: ['Animation', 'Character Voice', 'Gaming'],
      pendingReason: 'Awaiting compliance approval',
      submittedDate: new Date('2025-01-22'),
      reviewStatus: 'Compliance verification'
    }
  }
]

// Type extension for metadata
declare module '@/types/mediaManager' {
  interface AssignedCreator {
    metadata?: {
      email: string
      phone: string
      authorizationDoc: string
      signedDate: Date
      specialties: string[]
      socialMedia?: {
        instagram?: string
        tiktok?: string
        youtube?: string
        followers?: number
      }
      renewalStatus?: string
      expirationReason?: string
      pendingReason?: string
      submittedDate?: Date
      reviewStatus?: string
    }
  }
}
