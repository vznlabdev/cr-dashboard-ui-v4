/**
 * Mock Training Datasets for Media Manager Development
 * 8 dataset collections with varied content types and sizes
 * All datasets must be cleared for use in AI training
 */

export interface TrainingDataset {
  id: string
  name: string
  assetCount: number
  fileTypes: string[]
  totalSize: string
  clearanceStatus: 'cleared'
  tags: string[]
  createdAt: Date
  lastUpdated: Date
  description: string
  creator: string
  usageCount: number
  category: 'visual' | 'text' | 'audio' | 'mixed'
}

export const MOCK_TRAINING_DATASETS: TrainingDataset[] = [
  {
    id: 'dataset-001',
    name: 'Product Photography Dataset - Spring 2025',
    assetCount: 247,
    fileTypes: ['jpg', 'png'],
    totalSize: '1.2 GB',
    clearanceStatus: 'cleared',
    tags: ['product', 'photography', 'spring', 'lifestyle', 'e-commerce'],
    createdAt: new Date('2025-01-01'),
    lastUpdated: new Date('2025-01-15'),
    description: 'Comprehensive collection of lifestyle product shots for spring campaign training. Includes various angles, lighting conditions, and backgrounds. Perfect for training AI models on product presentation and e-commerce imagery.',
    creator: 'Sarah Johnson',
    usageCount: 12,
    category: 'visual'
  },
  {
    id: 'dataset-002',
    name: 'Brand Voice Training Corpus',
    assetCount: 1847,
    fileTypes: ['txt', 'md', 'docx'],
    totalSize: '45 MB',
    clearanceStatus: 'cleared',
    tags: ['brand-voice', 'copywriting', 'tone', 'messaging', 'content'],
    createdAt: new Date('2024-11-10'),
    lastUpdated: new Date('2025-01-20'),
    description: 'Curated collection of approved brand communications including blog posts, social media content, email campaigns, and product descriptions. Use for training AI copywriting tools to match brand voice, tone, and messaging guidelines.',
    creator: 'Marcus Chen',
    usageCount: 28,
    category: 'text'
  },
  {
    id: 'dataset-003',
    name: 'Social Media Visual Library - Q4 2024',
    assetCount: 389,
    fileTypes: ['jpg', 'png', 'gif', 'mp4'],
    totalSize: '2.8 GB',
    clearanceStatus: 'cleared',
    tags: ['social-media', 'instagram', 'tiktok', 'visual-content', 'engagement'],
    createdAt: new Date('2024-10-01'),
    lastUpdated: new Date('2025-01-10'),
    description: 'High-performing social media visuals from Q4 2024 across Instagram, TikTok, and LinkedIn. Includes both static images and short-form video content. Optimized for platform-specific engagement and brand consistency training.',
    creator: 'Aisha Patel',
    usageCount: 19,
    category: 'mixed'
  },
  {
    id: 'dataset-004',
    name: 'Logo System & Brand Identity Applications',
    assetCount: 127,
    fileTypes: ['svg', 'ai', 'pdf', 'png'],
    totalSize: '380 MB',
    clearanceStatus: 'cleared',
    tags: ['logo', 'branding', 'identity', 'design-system', 'guidelines'],
    createdAt: new Date('2024-09-01'),
    lastUpdated: new Date('2024-12-15'),
    description: 'Complete logo system including primary logo, variations, sub-brands, and real-world applications across digital and print media. Perfect for training AI on brand consistency, logo placement, and design system adherence.',
    creator: 'David Lee',
    usageCount: 34,
    category: 'visual'
  },
  {
    id: 'dataset-005',
    name: 'Video Content Training Set - Testimonials & Demos',
    assetCount: 56,
    fileTypes: ['mp4', 'mov', 'srt'],
    totalSize: '8.4 GB',
    clearanceStatus: 'cleared',
    tags: ['video', 'testimonial', 'demo', 'customer-story', 'production'],
    createdAt: new Date('2024-08-15'),
    lastUpdated: new Date('2025-01-05'),
    description: 'Approved video content showcasing brand style, pacing, production values, and storytelling approach. Includes customer testimonials, product demos, and explainer videos with transcripts. Use for video generation and editing AI training.',
    creator: 'Emma Rodriguez',
    usageCount: 15,
    category: 'mixed'
  },
  {
    id: 'dataset-006',
    name: 'UI Design Patterns & Component Library',
    assetCount: 423,
    fileTypes: ['fig', 'sketch', 'png', 'svg'],
    totalSize: '1.9 GB',
    clearanceStatus: 'cleared',
    tags: ['ui', 'design-system', 'components', 'patterns', 'web-design'],
    createdAt: new Date('2024-07-01'),
    lastUpdated: new Date('2025-01-12'),
    description: 'Comprehensive UI component library and design pattern examples from website and app interfaces. Includes buttons, forms, navigation, cards, and layout systems. Train AI on consistent UI/UX design and component usage.',
    creator: 'James Wilson',
    usageCount: 41,
    category: 'visual'
  },
  {
    id: 'dataset-007',
    name: 'Email Campaign Templates & Performance Data',
    assetCount: 234,
    fileTypes: ['html', 'txt', 'png', 'csv'],
    totalSize: '156 MB',
    clearanceStatus: 'cleared',
    tags: ['email', 'marketing', 'templates', 'copywriting', 'conversion'],
    createdAt: new Date('2024-06-15'),
    lastUpdated: new Date('2025-01-18'),
    description: 'Collection of high-performing email campaigns with subject lines, body copy, design templates, and performance metrics. Includes welcome sequences, promotional campaigns, and newsletters. Train AI on email marketing best practices and conversion optimization.',
    creator: 'Olivia Martinez',
    usageCount: 27,
    category: 'mixed'
  },
  {
    id: 'dataset-008',
    name: 'Audio & Voice Guidelines - Brand Sound',
    assetCount: 89,
    fileTypes: ['mp3', 'wav', 'txt', 'pdf'],
    totalSize: '2.1 GB',
    clearanceStatus: 'cleared',
    tags: ['audio', 'voice', 'sound', 'podcast', 'brand-guidelines'],
    createdAt: new Date('2024-05-20'),
    lastUpdated: new Date('2024-12-28'),
    description: 'Brand audio guidelines including approved music tracks, voice-over samples, podcast intro/outros, and sonic branding elements. Includes transcripts and usage guidelines. Train AI voice and audio generation tools on brand sound identity.',
    creator: 'Noah Anderson',
    usageCount: 8,
    category: 'audio'
  }
]

/**
 * Get datasets by category
 */
export function getDatasetsByCategory(category: TrainingDataset['category']): TrainingDataset[] {
  return MOCK_TRAINING_DATASETS.filter(dataset => dataset.category === category)
}

/**
 * Get datasets by tag
 */
export function getDatasetsByTag(tag: string): TrainingDataset[] {
  return MOCK_TRAINING_DATASETS.filter(dataset => 
    dataset.tags.some(t => t.toLowerCase().includes(tag.toLowerCase()))
  )
}

/**
 * Get most used datasets
 */
export function getTopUsedDatasets(count: number = 5): TrainingDataset[] {
  return [...MOCK_TRAINING_DATASETS]
    .sort((a, b) => b.usageCount - a.usageCount)
    .slice(0, count)
}

/**
 * Search datasets by name or description
 */
export function searchDatasets(query: string): TrainingDataset[] {
  const lowerQuery = query.toLowerCase()
  return MOCK_TRAINING_DATASETS.filter(dataset =>
    dataset.name.toLowerCase().includes(lowerQuery) ||
    dataset.description.toLowerCase().includes(lowerQuery) ||
    dataset.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  )
}
