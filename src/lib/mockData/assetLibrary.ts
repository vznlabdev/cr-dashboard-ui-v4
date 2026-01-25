import type { LinkedAsset } from '@/types/mediaManager'

/**
 * Mock Asset Library for Media Manager Development
 * 30 assets with varied types, clearance statuses, and metadata
 * 
 * Distribution:
 * - 40% cleared (12 assets)
 * - 30% pending (9 assets)
 * - 20% uncleared (6 assets)
 * - 10% in-progress (3 assets)
 */

export const MOCK_ASSET_LIBRARY: LinkedAsset[] = [
  // ========== CLEARED ASSETS (12) ==========
  {
    id: 'asset-001',
    filename: 'product_photo_hero_v3.jpg',
    fileType: 'image/jpeg',
    fileSize: 4200000, // 4.2 MB
    thumbnailUrl: 'https://picsum.photos/200/200?random=1',
    clearanceStatus: 'cleared',
    source: 'library',
    uploadedAt: new Date('2024-12-15T10:30:00'),
    metadata: {
      uploader: 'Sarah Johnson',
      dimensions: '3840x2160',
      tags: ['product', 'hero', 'lifestyle', 'spring-2025']
    }
  },
  {
    id: 'asset-002',
    filename: 'brand_guidelines_2025.pdf',
    fileType: 'application/pdf',
    fileSize: 8500000, // 8.5 MB
    thumbnailUrl: 'https://picsum.photos/200/200?random=2',
    clearanceStatus: 'cleared',
    source: 'library',
    uploadedAt: new Date('2025-01-02T14:20:00'),
    metadata: {
      uploader: 'Marcus Chen',
      tags: ['brand', 'guidelines', 'documentation', 'internal']
    }
  },
  {
    id: 'asset-003',
    filename: 'campaign_video_30sec_final.mp4',
    fileType: 'video/mp4',
    fileSize: 24500000, // 24.5 MB
    thumbnailUrl: 'https://picsum.photos/200/200?random=3',
    clearanceStatus: 'cleared',
    source: 'library',
    uploadedAt: new Date('2024-11-20T16:45:00'),
    metadata: {
      uploader: 'Aisha Patel',
      duration: '00:30',
      dimensions: '1920x1080',
      tags: ['video', 'campaign', 'advertising', 'tv-spot']
    }
  },
  {
    id: 'asset-004',
    filename: 'social_media_template_instagram.psd',
    fileType: 'image/vnd.adobe.photoshop',
    fileSize: 45200000, // 45.2 MB
    thumbnailUrl: 'https://picsum.photos/200/200?random=4',
    clearanceStatus: 'cleared',
    source: 'library',
    uploadedAt: new Date('2024-10-10T09:15:00'),
    metadata: {
      uploader: 'David Lee',
      dimensions: '1080x1080',
      tags: ['social-media', 'instagram', 'template', 'design-system']
    }
  },
  {
    id: 'asset-005',
    filename: 'logo_variations_master.ai',
    fileType: 'application/postscript',
    fileSize: 12400000, // 12.4 MB
    thumbnailUrl: 'https://picsum.photos/200/200?random=5',
    clearanceStatus: 'cleared',
    source: 'library',
    uploadedAt: new Date('2024-09-05T11:00:00'),
    metadata: {
      uploader: 'Emma Rodriguez',
      tags: ['logo', 'branding', 'master-file', 'vector']
    }
  },
  {
    id: 'asset-006',
    filename: 'team_photo_office_2024.jpg',
    fileType: 'image/jpeg',
    fileSize: 5800000, // 5.8 MB
    thumbnailUrl: 'https://picsum.photos/200/200?random=6',
    clearanceStatus: 'cleared',
    source: 'library',
    uploadedAt: new Date('2024-08-15T13:30:00'),
    metadata: {
      uploader: 'James Wilson',
      dimensions: '4000x2667',
      tags: ['team', 'office', 'culture', 'photography']
    }
  },
  {
    id: 'asset-007',
    filename: 'website_mockup_homepage.fig',
    fileType: 'application/figma',
    fileSize: 9800000, // 9.8 MB
    thumbnailUrl: 'https://picsum.photos/200/200?random=7',
    clearanceStatus: 'cleared',
    source: 'library',
    uploadedAt: new Date('2024-12-01T15:45:00'),
    metadata: {
      uploader: 'Olivia Martinez',
      tags: ['website', 'mockup', 'figma', 'homepage']
    }
  },
  {
    id: 'asset-008',
    filename: 'product_lineup_2025_q1.png',
    fileType: 'image/png',
    fileSize: 7100000, // 7.1 MB
    thumbnailUrl: 'https://picsum.photos/200/200?random=8',
    clearanceStatus: 'cleared',
    source: 'library',
    uploadedAt: new Date('2025-01-10T10:20:00'),
    metadata: {
      uploader: 'Noah Anderson',
      dimensions: '5000x3000',
      tags: ['product', 'lineup', 'catalog', 'q1-2025']
    }
  },
  {
    id: 'asset-009',
    filename: 'testimonial_video_customer_a.mp4',
    fileType: 'video/mp4',
    fileSize: 32100000, // 32.1 MB
    thumbnailUrl: 'https://picsum.photos/200/200?random=9',
    clearanceStatus: 'cleared',
    source: 'library',
    uploadedAt: new Date('2024-11-05T14:00:00'),
    metadata: {
      uploader: 'Sophia Taylor',
      duration: '01:15',
      dimensions: '1920x1080',
      tags: ['testimonial', 'video', 'customer', 'case-study']
    }
  },
  {
    id: 'asset-010',
    filename: 'infographic_market_trends.png',
    fileType: 'image/png',
    fileSize: 2900000, // 2.9 MB
    thumbnailUrl: 'https://picsum.photos/200/200?random=10',
    clearanceStatus: 'cleared',
    source: 'library',
    uploadedAt: new Date('2024-10-20T16:30:00'),
    metadata: {
      uploader: 'Liam Thompson',
      dimensions: '1200x3000',
      tags: ['infographic', 'data-viz', 'market', 'trends']
    }
  },
  {
    id: 'asset-011',
    filename: 'executive_headshot_ceo.jpg',
    fileType: 'image/jpeg',
    fileSize: 3200000, // 3.2 MB
    thumbnailUrl: 'https://picsum.photos/200/200?random=11',
    clearanceStatus: 'cleared',
    source: 'library',
    uploadedAt: new Date('2024-09-12T11:45:00'),
    metadata: {
      uploader: 'Isabella Garcia',
      dimensions: '2000x2000',
      tags: ['headshot', 'executive', 'leadership', 'photography']
    }
  },
  {
    id: 'asset-012',
    filename: 'packaging_design_mockup.psd',
    fileType: 'image/vnd.adobe.photoshop',
    fileSize: 38900000, // 38.9 MB
    thumbnailUrl: 'https://picsum.photos/200/200?random=12',
    clearanceStatus: 'cleared',
    source: 'library',
    uploadedAt: new Date('2024-12-20T09:00:00'),
    metadata: {
      uploader: 'Ethan Brown',
      dimensions: '3000x3000',
      tags: ['packaging', 'design', 'mockup', 'product']
    }
  },

  // ========== PENDING ASSETS (9) ==========
  {
    id: 'asset-013',
    filename: 'stock_photo_business_team.jpg',
    fileType: 'image/jpeg',
    fileSize: 3800000, // 3.8 MB
    thumbnailUrl: 'https://picsum.photos/200/200?random=13',
    clearanceStatus: 'pending',
    source: 'library',
    uploadedAt: new Date('2025-01-18T10:15:00'),
    metadata: {
      uploader: 'Mia Davis',
      dimensions: '3000x2000',
      tags: ['stock', 'business', 'team', 'professional']
    }
  },
  {
    id: 'asset-014',
    filename: 'licensed_music_track_upbeat.mp3',
    fileType: 'audio/mpeg',
    fileSize: 8200000, // 8.2 MB
    thumbnailUrl: 'https://picsum.photos/200/200?random=14',
    clearanceStatus: 'pending',
    source: 'library',
    uploadedAt: new Date('2025-01-20T14:30:00'),
    metadata: {
      uploader: 'Alexander White',
      duration: '03:24',
      tags: ['music', 'audio', 'licensed', 'background']
    }
  },
  {
    id: 'asset-015',
    filename: 'illustration_concept_art.png',
    fileType: 'image/png',
    fileSize: 6500000, // 6.5 MB
    thumbnailUrl: 'https://picsum.photos/200/200?random=15',
    clearanceStatus: 'pending',
    source: 'library',
    uploadedAt: new Date('2025-01-15T11:20:00'),
    metadata: {
      uploader: 'Charlotte Miller',
      dimensions: '4000x3000',
      tags: ['illustration', 'concept', 'art', 'creative']
    }
  },
  {
    id: 'asset-016',
    filename: 'user_generated_content_instagram.jpg',
    fileType: 'image/jpeg',
    fileSize: 2400000, // 2.4 MB
    thumbnailUrl: 'https://picsum.photos/200/200?random=16',
    clearanceStatus: 'pending',
    source: 'library',
    uploadedAt: new Date('2025-01-22T15:45:00'),
    metadata: {
      uploader: 'Benjamin Wilson',
      dimensions: '1080x1350',
      tags: ['ugc', 'instagram', 'social', 'customer']
    }
  },
  {
    id: 'asset-017',
    filename: 'influencer_collaboration_video.mp4',
    fileType: 'video/mp4',
    fileSize: 28900000, // 28.9 MB
    thumbnailUrl: 'https://picsum.photos/200/200?random=17',
    clearanceStatus: 'pending',
    source: 'library',
    uploadedAt: new Date('2025-01-19T13:00:00'),
    metadata: {
      uploader: 'Amelia Moore',
      duration: '00:45',
      dimensions: '1080x1920',
      tags: ['influencer', 'collaboration', 'video', 'tiktok']
    }
  },
  {
    id: 'asset-018',
    filename: 'event_photography_collection.jpg',
    fileType: 'image/jpeg',
    fileSize: 4500000, // 4.5 MB
    thumbnailUrl: 'https://picsum.photos/200/200?random=18',
    clearanceStatus: 'pending',
    source: 'library',
    uploadedAt: new Date('2025-01-21T16:20:00'),
    metadata: {
      uploader: 'Henry Taylor',
      dimensions: '3600x2400',
      tags: ['event', 'photography', 'conference', 'networking']
    }
  },
  {
    id: 'asset-019',
    filename: 'third_party_logo_partner.svg',
    fileType: 'image/svg+xml',
    fileSize: 125000, // 125 KB
    thumbnailUrl: 'https://picsum.photos/200/200?random=19',
    clearanceStatus: 'pending',
    source: 'library',
    uploadedAt: new Date('2025-01-23T09:30:00'),
    metadata: {
      uploader: 'Harper Anderson',
      tags: ['logo', 'partner', 'third-party', 'brand']
    }
  },
  {
    id: 'asset-020',
    filename: 'drone_footage_aerial_view.mp4',
    fileType: 'video/mp4',
    fileSize: 45800000, // 45.8 MB
    thumbnailUrl: 'https://picsum.photos/200/200?random=20',
    clearanceStatus: 'pending',
    source: 'library',
    uploadedAt: new Date('2025-01-17T12:00:00'),
    metadata: {
      uploader: 'Evelyn Martinez',
      duration: '01:30',
      dimensions: '3840x2160',
      tags: ['drone', 'aerial', 'video', 'cinematic']
    }
  },
  {
    id: 'asset-021',
    filename: 'celebrity_endorsement_photo.jpg',
    fileType: 'image/jpeg',
    fileSize: 5100000, // 5.1 MB
    thumbnailUrl: 'https://picsum.photos/200/200?random=21',
    clearanceStatus: 'pending',
    source: 'library',
    uploadedAt: new Date('2025-01-16T14:45:00'),
    metadata: {
      uploader: 'Sebastian Garcia',
      dimensions: '2400x3600',
      tags: ['celebrity', 'endorsement', 'photography', 'campaign']
    }
  },

  // ========== UNCLEARED ASSETS (6) ==========
  {
    id: 'asset-022',
    filename: 'unauthorized_brand_image.jpg',
    fileType: 'image/jpeg',
    fileSize: 3900000, // 3.9 MB
    thumbnailUrl: 'https://picsum.photos/200/200?random=22',
    clearanceStatus: 'uncleared',
    source: 'library',
    uploadedAt: new Date('2024-11-10T10:00:00'),
    metadata: {
      uploader: 'Victoria Lopez',
      dimensions: '2800x2100',
      tags: ['brand', 'unauthorized', 'clearance-failed'],
      clearanceReason: 'Trademark verification failed'
    }
  },
  {
    id: 'asset-023',
    filename: 'copyrighted_illustration.png',
    fileType: 'image/png',
    fileSize: 2100000, // 2.1 MB
    thumbnailUrl: 'https://picsum.photos/200/200?random=23',
    clearanceStatus: 'uncleared',
    source: 'library',
    uploadedAt: new Date('2024-10-25T11:30:00'),
    metadata: {
      uploader: 'Daniel Rodriguez',
      dimensions: '2000x2000',
      tags: ['illustration', 'copyright', 'clearance-failed'],
      clearanceReason: 'Copyright holder objection'
    }
  },
  {
    id: 'asset-024',
    filename: 'unlicensed_stock_footage.mp4',
    fileType: 'video/mp4',
    fileSize: 38500000, // 38.5 MB
    thumbnailUrl: 'https://picsum.photos/200/200?random=24',
    clearanceStatus: 'uncleared',
    source: 'library',
    uploadedAt: new Date('2024-12-05T15:00:00'),
    metadata: {
      uploader: 'Grace Hernandez',
      duration: '01:00',
      dimensions: '1920x1080',
      tags: ['stock', 'video', 'clearance-failed'],
      clearanceReason: 'License expired'
    }
  },
  {
    id: 'asset-025',
    filename: 'restricted_content_image.jpg',
    fileType: 'image/jpeg',
    fileSize: 4100000, // 4.1 MB
    thumbnailUrl: 'https://picsum.photos/200/200?random=25',
    clearanceStatus: 'uncleared',
    source: 'library',
    uploadedAt: new Date('2024-11-28T13:15:00'),
    metadata: {
      uploader: 'Matthew King',
      dimensions: '3200x2400',
      tags: ['restricted', 'clearance-failed', 'compliance'],
      clearanceReason: 'Contains restricted elements'
    }
  },
  {
    id: 'asset-026',
    filename: 'disputed_trademark_logo.svg',
    fileType: 'image/svg+xml',
    fileSize: 89000, // 89 KB
    thumbnailUrl: 'https://picsum.photos/200/200?random=26',
    clearanceStatus: 'uncleared',
    source: 'library',
    uploadedAt: new Date('2024-09-20T09:45:00'),
    metadata: {
      uploader: 'Scarlett Wright',
      tags: ['trademark', 'logo', 'clearance-failed', 'disputed'],
      clearanceReason: 'Trademark dispute in progress'
    }
  },
  {
    id: 'asset-027',
    filename: 'unverified_source_photo.jpg',
    fileType: 'image/jpeg',
    fileSize: 3300000, // 3.3 MB
    thumbnailUrl: 'https://picsum.photos/200/200?random=27',
    clearanceStatus: 'uncleared',
    source: 'library',
    uploadedAt: new Date('2024-10-15T14:20:00'),
    metadata: {
      uploader: 'Owen Scott',
      dimensions: '2600x1950',
      tags: ['photography', 'clearance-failed', 'unverified'],
      clearanceReason: 'Source cannot be verified'
    }
  },

  // ========== IN-PROGRESS ASSETS (3) ==========
  {
    id: 'asset-028',
    filename: 'new_product_photo_hero.jpg',
    fileType: 'image/jpeg',
    fileSize: 5600000, // 5.6 MB
    thumbnailUrl: 'https://picsum.photos/200/200?random=28',
    clearanceStatus: 'pending', // Using 'pending' for in-progress (API check running)
    source: 'upload',
    uploadedAt: new Date('2025-01-24T16:00:00'),
    metadata: {
      uploader: 'Chloe Adams',
      dimensions: '4200x2800',
      tags: ['product', 'photography', 'hero', 'processing'],
      processingStatus: 'API verification in progress'
    }
  },
  {
    id: 'asset-029',
    filename: 'marketing_video_draft_v2.mp4',
    fileType: 'video/mp4',
    fileSize: 42300000, // 42.3 MB
    thumbnailUrl: 'https://picsum.photos/200/200?random=29',
    clearanceStatus: 'pending',
    source: 'upload',
    uploadedAt: new Date('2025-01-24T15:30:00'),
    metadata: {
      uploader: 'Ryan Campbell',
      duration: '01:45',
      dimensions: '1920x1080',
      tags: ['marketing', 'video', 'draft', 'processing'],
      processingStatus: 'Content analysis in progress'
    }
  },
  {
    id: 'asset-030',
    filename: 'brand_asset_collection.zip',
    fileType: 'application/zip',
    fileSize: 52100000, // 52.1 MB
    thumbnailUrl: 'https://picsum.photos/200/200?random=30',
    clearanceStatus: 'pending',
    source: 'upload',
    uploadedAt: new Date('2025-01-24T14:45:00'),
    metadata: {
      uploader: 'Aria Mitchell',
      tags: ['brand', 'collection', 'archive', 'processing'],
      processingStatus: 'Extracting and verifying contents'
    }
  }
]

// Type extension for metadata
declare module '@/types/mediaManager' {
  interface LinkedAsset {
    metadata?: {
      uploader: string
      dimensions?: string
      duration?: string
      tags?: string[]
      clearanceReason?: string
      processingStatus?: string
    }
  }
}
