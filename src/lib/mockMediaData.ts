import type { LinkedAsset, AssignedCreator } from '@/types/mediaManager'

// Mock Asset Library (20-30 assets with varied clearance statuses)
export const MOCK_ASSET_LIBRARY_DATA: Omit<LinkedAsset, 'uploadedAt'>[] = [
  // Images - Cleared
  { id: 'asset-1', filename: 'hero-banner-2024.jpg', fileType: 'image/jpeg', fileSize: 4200000, thumbnailUrl: '/placeholder.svg', clearanceStatus: 'cleared', source: 'library' },
  { id: 'asset-2', filename: 'product-shot-main.png', fileType: 'image/png', fileSize: 3800000, thumbnailUrl: '/placeholder.svg', clearanceStatus: 'cleared', source: 'library' },
  { id: 'asset-3', filename: 'team-photo-office.jpg', fileType: 'image/jpeg', fileSize: 5100000, thumbnailUrl: '/placeholder.svg', clearanceStatus: 'cleared', source: 'library' },
  { id: 'asset-4', filename: 'brand-logo-variations.svg', fileType: 'image/svg+xml', fileSize: 125000, thumbnailUrl: '/placeholder.svg', clearanceStatus: 'cleared', source: 'library' },
  { id: 'asset-5', filename: 'marketing-infographic.png', fileType: 'image/png', fileSize: 2900000, thumbnailUrl: '/placeholder.svg', clearanceStatus: 'cleared', source: 'library' },
  { id: 'asset-6', filename: 'social-media-template.jpg', fileType: 'image/jpeg', fileSize: 1800000, thumbnailUrl: '/placeholder.svg', clearanceStatus: 'cleared', source: 'library' },
  { id: 'asset-7', filename: 'event-photography-set.jpg', fileType: 'image/jpeg', fileSize: 6200000, thumbnailUrl: '/placeholder.svg', clearanceStatus: 'cleared', source: 'library' },
  { id: 'asset-8', filename: 'product-lifestyle-shot.jpg', fileType: 'image/jpeg', fileSize: 4500000, thumbnailUrl: '/placeholder.svg', clearanceStatus: 'cleared', source: 'library' },
  
  // Images - Pending
  { id: 'asset-9', filename: 'celebrity-endorsement-photo.jpg', fileType: 'image/jpeg', fileSize: 5800000, thumbnailUrl: '/placeholder.svg', clearanceStatus: 'pending', source: 'library' },
  { id: 'asset-10', filename: 'stock-photo-business.jpg', fileType: 'image/jpeg', fileSize: 3200000, thumbnailUrl: '/placeholder.svg', clearanceStatus: 'pending', source: 'library' },
  { id: 'asset-11', filename: 'licensed-artwork.png', fileType: 'image/png', fileSize: 7100000, thumbnailUrl: '/placeholder.svg', clearanceStatus: 'pending', source: 'library' },
  { id: 'asset-12', filename: 'user-submitted-content.jpg', fileType: 'image/jpeg', fileSize: 2400000, thumbnailUrl: '/placeholder.svg', clearanceStatus: 'pending', source: 'library' },
  
  // Images - Uncleared
  { id: 'asset-13', filename: 'unauthorized-brand-image.jpg', fileType: 'image/jpeg', fileSize: 3900000, thumbnailUrl: '/placeholder.svg', clearanceStatus: 'uncleared', source: 'library' },
  { id: 'asset-14', filename: 'copyrighted-illustration.png', fileType: 'image/png', fileSize: 2100000, thumbnailUrl: '/placeholder.svg', clearanceStatus: 'uncleared', source: 'library' },
  
  // Videos - Cleared
  { id: 'asset-15', filename: 'product-demo-video.mp4', fileType: 'video/mp4', fileSize: 24500000, thumbnailUrl: '/placeholder.svg', clearanceStatus: 'cleared', source: 'library' },
  { id: 'asset-16', filename: 'brand-story-animation.mp4', fileType: 'video/mp4', fileSize: 18900000, thumbnailUrl: '/placeholder.svg', clearanceStatus: 'cleared', source: 'library' },
  { id: 'asset-17', filename: 'testimonial-interview.mp4', fileType: 'video/mp4', fileSize: 32100000, thumbnailUrl: '/placeholder.svg', clearanceStatus: 'cleared', source: 'library' },
  
  // Videos - Pending
  { id: 'asset-18', filename: 'licensed-stock-footage.mp4', fileType: 'video/mp4', fileSize: 45800000, thumbnailUrl: '/placeholder.svg', clearanceStatus: 'pending', source: 'library' },
  
  // Documents - Cleared
  { id: 'asset-19', filename: 'brand-guidelines.pdf', fileType: 'application/pdf', fileSize: 8200000, thumbnailUrl: '/placeholder.svg', clearanceStatus: 'cleared', source: 'library' },
  { id: 'asset-20', filename: 'marketing-strategy-doc.pdf', fileType: 'application/pdf', fileSize: 3500000, thumbnailUrl: '/placeholder.svg', clearanceStatus: 'cleared', source: 'library' },
  { id: 'asset-21', filename: 'product-specifications.pdf', fileType: 'application/pdf', fileSize: 2100000, thumbnailUrl: '/placeholder.svg', clearanceStatus: 'cleared', source: 'library' },
  
  // Design Files - Cleared
  { id: 'asset-22', filename: 'logo-master-file.ai', fileType: 'application/illustrator', fileSize: 12400000, thumbnailUrl: '/placeholder.svg', clearanceStatus: 'cleared', source: 'library' },
  { id: 'asset-23', filename: 'website-mockup.fig', fileType: 'application/figma', fileSize: 9800000, thumbnailUrl: '/placeholder.svg', clearanceStatus: 'cleared', source: 'library' },
  { id: 'asset-24', filename: 'campaign-poster.psd', fileType: 'application/photoshop', fileSize: 45200000, thumbnailUrl: '/placeholder.svg', clearanceStatus: 'cleared', source: 'library' },
  
  // Mixed - Recent uploads
  { id: 'asset-25', filename: 'new-product-lineup.jpg', fileType: 'image/jpeg', fileSize: 5600000, thumbnailUrl: '/placeholder.svg', clearanceStatus: 'cleared', source: 'library' },
  { id: 'asset-26', filename: 'seasonal-campaign-hero.png', fileType: 'image/png', fileSize: 7800000, thumbnailUrl: '/placeholder.svg', clearanceStatus: 'pending', source: 'library' },
  { id: 'asset-27', filename: 'influencer-collab-photo.jpg', fileType: 'image/jpeg', fileSize: 4100000, thumbnailUrl: '/placeholder.svg', clearanceStatus: 'pending', source: 'library' },
  { id: 'asset-28', filename: 'executive-headshots.jpg', fileType: 'image/jpeg', fileSize: 3200000, thumbnailUrl: '/placeholder.svg', clearanceStatus: 'cleared', source: 'library' },
  { id: 'asset-29', filename: 'company-culture-video.mp4', fileType: 'video/mp4', fileSize: 28900000, thumbnailUrl: '/placeholder.svg', clearanceStatus: 'cleared', source: 'library' },
  { id: 'asset-30', filename: 'press-release-assets.zip', fileType: 'application/zip', fileSize: 52100000, thumbnailUrl: '/placeholder.svg', clearanceStatus: 'cleared', source: 'library' },
]

// Mock Persona Library (5-10 creators with varied authorization states)
export const MOCK_PERSONA_LIBRARY: Omit<AssignedCreator, 'role' | 'nilpComponents'>[] = [
  {
    id: 'persona-1',
    name: 'Sarah Chen',
    nilpId: 'CR-2025-00147',
    avatarUrl: '/placeholder.svg',
    authorizationStatus: 'authorized',
    expirationDate: new Date('2026-12-31')
  },
  {
    id: 'persona-2',
    name: 'Marcus Williams',
    nilpId: 'CR-2025-00089',
    avatarUrl: '/placeholder.svg',
    authorizationStatus: 'expires-soon',
    expirationDate: new Date('2025-02-15')
  },
  {
    id: 'persona-3',
    name: 'Elena Rodriguez',
    nilpId: 'CR-2024-00523',
    avatarUrl: '/placeholder.svg',
    authorizationStatus: 'expired',
    expirationDate: new Date('2025-01-01')
  },
  {
    id: 'persona-4',
    name: 'David Kim',
    nilpId: 'CR-2025-00201',
    avatarUrl: '/placeholder.svg',
    authorizationStatus: 'pending',
    expirationDate: undefined
  },
  {
    id: 'persona-5',
    name: 'Jasmine Patel',
    nilpId: 'CR-2025-00312',
    avatarUrl: '/placeholder.svg',
    authorizationStatus: 'authorized',
    expirationDate: new Date('2027-06-30')
  },
  {
    id: 'persona-6',
    name: 'Alexander Novak',
    nilpId: 'CR-2025-00428',
    avatarUrl: '/placeholder.svg',
    authorizationStatus: 'authorized',
    expirationDate: new Date('2026-08-15')
  },
  {
    id: 'persona-7',
    name: 'Kenji Tanaka',
    nilpId: 'CR-2024-00891',
    avatarUrl: '/placeholder.svg',
    authorizationStatus: 'expires-soon',
    expirationDate: new Date('2025-02-28')
  },
  {
    id: 'persona-8',
    name: 'Amara Okonkwo',
    nilpId: 'CR-2025-00156',
    avatarUrl: '/placeholder.svg',
    authorizationStatus: 'authorized',
    expirationDate: new Date('2027-03-20')
  },
  {
    id: 'persona-9',
    name: 'Lucas Santos',
    nilpId: 'CR-2024-00634',
    avatarUrl: '/placeholder.svg',
    authorizationStatus: 'pending',
    expirationDate: undefined
  },
  {
    id: 'persona-10',
    name: 'Olivia Thompson',
    nilpId: 'CR-2025-00389',
    avatarUrl: '/placeholder.svg',
    authorizationStatus: 'authorized',
    expirationDate: new Date('2026-11-10')
  }
]

// Mock Prompt Library (10-15 successful prompts with ratings)
export interface MockPrompt {
  id: string
  title: string
  text: string
  rating: number // 1-5 stars
  usageCount: number
  tags: string[]
  createdBy: string
  createdAt: Date
  effectiveness: 'excellent' | 'good' | 'average'
}

export const MOCK_PROMPT_LIBRARY: MockPrompt[] = [
  {
    id: 'prompt-1',
    title: 'Professional Product Photography',
    text: 'Create a high-quality product photograph with studio lighting, white background, focus on key features and benefits. Style: clean, professional, commercial. Lighting: soft box from 45-degree angle. Camera: macro lens perspective.',
    rating: 5,
    usageCount: 47,
    tags: ['Product Photography', 'Studio', 'E-commerce'],
    createdBy: 'Sarah Chen',
    createdAt: new Date('2024-11-15'),
    effectiveness: 'excellent'
  },
  {
    id: 'prompt-2',
    title: 'Social Media Carousel - Brand Story',
    text: 'Generate a 5-slide Instagram carousel telling our brand story. Slide 1: Hook with bold statement. Slides 2-4: Key milestones with visual metaphors. Slide 5: Call to action. Style: modern, vibrant, on-brand colors. Typography: bold headlines, clean sans-serif.',
    rating: 5,
    usageCount: 34,
    tags: ['Social Media', 'Instagram', 'Storytelling'],
    createdBy: 'Marcus Williams',
    createdAt: new Date('2024-12-03'),
    effectiveness: 'excellent'
  },
  {
    id: 'prompt-3',
    title: 'Lifestyle Brand Photography',
    text: 'Create lifestyle photography showing product in natural use. Setting: modern home/office environment. People: diverse, authentic moments. Lighting: natural window light, golden hour feel. Mood: aspirational yet attainable, warm and inviting.',
    rating: 4,
    usageCount: 29,
    tags: ['Lifestyle', 'Photography', 'Brand'],
    createdBy: 'Elena Rodriguez',
    createdAt: new Date('2024-10-22'),
    effectiveness: 'good'
  },
  {
    id: 'prompt-4',
    title: 'Email Newsletter Hero Image',
    text: 'Design email header image (600x300px) featuring seasonal theme. Include: product showcase, limited-time offer badge, brand elements. Style: attention-grabbing, mobile-optimized. Colors: complementary to brand palette. Text: minimal, impactful headline only.',
    rating: 4,
    usageCount: 56,
    tags: ['Email Marketing', 'Newsletter', 'Hero Image'],
    createdBy: 'David Kim',
    createdAt: new Date('2024-09-18'),
    effectiveness: 'good'
  },
  {
    id: 'prompt-5',
    title: 'Video Thumbnail - High CTR',
    text: 'Create YouTube thumbnail optimized for clicks. Elements: expressive face close-up, bold text overlay, contrasting colors, rule of thirds composition. Text: 3-5 words max, all caps. Style: high contrast, slightly exaggerated, curiosity-inducing.',
    rating: 5,
    usageCount: 82,
    tags: ['Video', 'Thumbnail', 'YouTube'],
    createdBy: 'Jasmine Patel',
    createdAt: new Date('2024-11-28'),
    effectiveness: 'excellent'
  },
  {
    id: 'prompt-6',
    title: 'Minimalist Logo Design',
    text: 'Design minimalist logo concept. Requirements: scalable vector, works in monochrome, memorable silhouette. Style: geometric shapes, negative space clever usage, timeless aesthetic. Avoid: gradients, fine details, text-heavy designs.',
    rating: 4,
    usageCount: 23,
    tags: ['Logo', 'Branding', 'Minimalist'],
    createdBy: 'Alexander Novak',
    createdAt: new Date('2024-08-14'),
    effectiveness: 'good'
  },
  {
    id: 'prompt-7',
    title: 'Infographic - Data Visualization',
    text: 'Create vertical infographic (800x2000px) presenting key statistics. Structure: intro > 3-5 data points > conclusion/CTA. Visual style: icons + charts + short text blocks. Color: brand primary + 2 complementary. Layout: clear visual hierarchy, scannable.',
    rating: 5,
    usageCount: 41,
    tags: ['Infographic', 'Data Viz', 'Statistics'],
    createdBy: 'Kenji Tanaka',
    createdAt: new Date('2024-12-10'),
    effectiveness: 'excellent'
  },
  {
    id: 'prompt-8',
    title: 'Podcast Cover Art',
    text: 'Design podcast cover art (3000x3000px). Must be: legible at thumbnail size, distinctive in crowded feed, on-brand. Include: show title, host name/photo, visual theme element. Typography: bold, high contrast. Test at 256x256px for readability.',
    rating: 4,
    usageCount: 18,
    tags: ['Podcast', 'Cover Art', 'Audio'],
    createdBy: 'Amara Okonkwo',
    createdAt: new Date('2024-07-29'),
    effectiveness: 'good'
  },
  {
    id: 'prompt-9',
    title: 'Website Hero Section',
    text: 'Design above-the-fold hero section. Elements: compelling headline, sub-headline, primary CTA button, supporting visual/video. Layout: F-pattern, focal point top-left. Visual: authentic, not stock photo feel. Mobile: stack vertically, maintain impact.',
    rating: 5,
    usageCount: 67,
    tags: ['Web Design', 'Hero', 'Landing Page'],
    createdBy: 'Lucas Santos',
    createdAt: new Date('2024-10-05'),
    effectiveness: 'excellent'
  },
  {
    id: 'prompt-10',
    title: 'Product Launch Teaser Post',
    text: 'Create anticipation-building social media post for product launch. Strategy: partial reveal, mystery element, countdown clock. Copy: question format, emoji usage, hashtag. Visual: close-up detail or silhouette. Goal: comments and shares over likes.',
    rating: 4,
    usageCount: 39,
    tags: ['Social Media', 'Product Launch', 'Teaser'],
    createdBy: 'Olivia Thompson',
    createdAt: new Date('2024-11-20'),
    effectiveness: 'good'
  },
  {
    id: 'prompt-11',
    title: 'Brand Guidelines Page',
    text: 'Design brand guidelines document page layout. Sections: logo usage, color palette with hex codes, typography hierarchy, imagery style, dos/donts. Style: clean, professional, easy to reference. Format: print-ready PDF and digital-friendly.',
    rating: 4,
    usageCount: 15,
    tags: ['Brand Guidelines', 'Documentation'],
    createdBy: 'Sarah Chen',
    createdAt: new Date('2024-06-12'),
    effectiveness: 'good'
  },
  {
    id: 'prompt-12',
    title: 'Testimonial Quote Card',
    text: 'Design testimonial quote graphic for social sharing. Include: customer quote (20-30 words), name, title/company, star rating, subtle brand watermark. Style: elegant, trustworthy, readable. Layout: quote marks prominent, white space generous.',
    rating: 5,
    usageCount: 52,
    tags: ['Testimonial', 'Social Proof', 'Quote'],
    createdBy: 'Marcus Williams',
    createdAt: new Date('2024-09-30'),
    effectiveness: 'excellent'
  },
  {
    id: 'prompt-13',
    title: 'Event Invitation Design',
    text: 'Create digital event invitation. Must include: event name, date/time, location, RSVP CTA, dress code if applicable. Style: matches event tone (professional/casual/festive). Format: mobile-optimized, save-to-calendar friendly. Hierarchy: what > when > where.',
    rating: 4,
    usageCount: 27,
    tags: ['Event', 'Invitation', 'Design'],
    createdBy: 'Elena Rodriguez',
    createdAt: new Date('2024-08-25'),
    effectiveness: 'good'
  },
  {
    id: 'prompt-14',
    title: 'Behind-the-Scenes Content',
    text: 'Capture behind-the-scenes moment showing authentic brand culture. Style: candid, unpolished, human. Content: team at work, creative process, workspace environment. Goal: build connection and trust. Caption: storytelling, ask question to audience.',
    rating: 5,
    usageCount: 44,
    tags: ['BTS', 'Culture', 'Authentic'],
    createdBy: 'David Kim',
    createdAt: new Date('2024-11-08'),
    effectiveness: 'excellent'
  },
  {
    id: 'prompt-15',
    title: 'Animated Logo Reveal',
    text: 'Create 3-5 second logo animation for video intros. Style: smooth, professional, not distracting. Motion: build-in effect or elegant reveal. Audio: subtle whoosh or chime (optional). Format: transparent background, multiple resolutions. Mood: premium, polished.',
    rating: 4,
    usageCount: 21,
    tags: ['Animation', 'Logo', 'Motion Graphics'],
    createdBy: 'Jasmine Patel',
    createdAt: new Date('2024-07-16'),
    effectiveness: 'good'
  }
]

// Mock Training Datasets (5-10 cleared dataset collections)
export interface MockTrainingDataset {
  id: string
  name: string
  type: 'collection' | 'image' | 'video' | 'text'
  count?: number // For collections
  fileSize?: number // For individual files
  thumbnailUrl: string
  description: string
  clearanceStatus: 'cleared'
  createdAt: Date
  tags: string[]
}

export const MOCK_TRAINING_DATASETS: MockTrainingDataset[] = [
  {
    id: 'dataset-1',
    name: 'Product Photography Collection 2024',
    type: 'collection',
    count: 247,
    thumbnailUrl: '/placeholder.svg',
    description: 'Comprehensive product photography dataset with various angles, lighting conditions, and backgrounds.',
    clearanceStatus: 'cleared',
    createdAt: new Date('2024-01-15'),
    tags: ['Product', 'Photography', 'E-commerce']
  },
  {
    id: 'dataset-2',
    name: 'Brand Voice Training Corpus',
    type: 'text',
    fileSize: 5200000,
    thumbnailUrl: '/placeholder.svg',
    description: 'Curated collection of approved brand communications, tone guidelines, and messaging examples.',
    clearanceStatus: 'cleared',
    createdAt: new Date('2024-02-20'),
    tags: ['Copywriting', 'Brand Voice', 'Messaging']
  },
  {
    id: 'dataset-3',
    name: 'Social Media Visual Library',
    type: 'collection',
    count: 156,
    thumbnailUrl: '/placeholder.svg',
    description: 'High-performing social media visuals across platforms, optimized for engagement.',
    clearanceStatus: 'cleared',
    createdAt: new Date('2024-03-10'),
    tags: ['Social Media', 'Visual', 'Engagement']
  },
  {
    id: 'dataset-4',
    name: 'Logo Variations & Usage Examples',
    type: 'collection',
    count: 89,
    thumbnailUrl: '/placeholder.svg',
    description: 'Complete logo system including variations, applications, and context-specific usage.',
    clearanceStatus: 'cleared',
    createdAt: new Date('2024-01-05'),
    tags: ['Logo', 'Branding', 'Identity']
  },
  {
    id: 'dataset-5',
    name: 'Video Content Training Set',
    type: 'collection',
    count: 34,
    thumbnailUrl: '/placeholder.svg',
    description: 'Approved video content showcasing brand style, pacing, and production values.',
    clearanceStatus: 'cleared',
    createdAt: new Date('2024-04-12'),
    tags: ['Video', 'Motion', 'Production']
  },
  {
    id: 'dataset-6',
    name: 'Typography & Layout Examples',
    type: 'collection',
    count: 127,
    thumbnailUrl: '/placeholder.svg',
    description: 'Typography hierarchies, layout grids, and design system components in use.',
    clearanceStatus: 'cleared',
    createdAt: new Date('2024-02-28'),
    tags: ['Typography', 'Layout', 'Design System']
  },
  {
    id: 'dataset-7',
    name: 'Color Application Guide',
    type: 'collection',
    count: 63,
    thumbnailUrl: '/placeholder.svg',
    description: 'Brand color palette applications across various media and contexts.',
    clearanceStatus: 'cleared',
    createdAt: new Date('2024-01-18'),
    tags: ['Color', 'Palette', 'Brand']
  },
  {
    id: 'dataset-8',
    name: 'Successful Campaign Archive',
    type: 'collection',
    count: 42,
    thumbnailUrl: '/placeholder.svg',
    description: 'Complete campaign assets from high-performing marketing initiatives.',
    clearanceStatus: 'cleared',
    createdAt: new Date('2024-05-05'),
    tags: ['Campaign', 'Marketing', 'Archive']
  },
  {
    id: 'dataset-9',
    name: 'Iconography & Illustration Style',
    type: 'collection',
    count: 198,
    thumbnailUrl: '/placeholder.svg',
    description: 'Custom iconography and illustration examples defining visual style.',
    clearanceStatus: 'cleared',
    createdAt: new Date('2024-03-22'),
    tags: ['Icons', 'Illustration', 'Visual Style']
  },
  {
    id: 'dataset-10',
    name: 'User Interface Patterns',
    type: 'collection',
    count: 84,
    thumbnailUrl: '/placeholder.svg',
    description: 'Reusable UI patterns, components, and interaction design examples.',
    clearanceStatus: 'cleared',
    createdAt: new Date('2024-04-30'),
    tags: ['UI', 'Components', 'Patterns']
  }
]
