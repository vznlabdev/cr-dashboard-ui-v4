import type { ReferenceItem } from '@/types/mediaManager'

/**
 * Mock Reference Materials for Media Manager Development
 * 15 references with mix of asset library links, direct uploads, and URLs
 * 
 * Distribution:
 * - 40% Asset library links (6)
 * - 40% Direct uploads (6)
 * - 20% URLs (3)
 */

export const MOCK_REFERENCES: ReferenceItem[] = [
  // ========== ASSET LIBRARY REFERENCES (6) ==========
  {
    id: 'ref-001',
    type: 'asset',
    filename: 'competitor_analysis_style.jpg',
    thumbnailUrl: 'https://picsum.photos/200/200?random=31',
    fileSize: 2800000, // 2.8 MB
    notes: 'Competitor\'s hero image layout - note the use of negative space and product positioning. We want to differentiate but learn from their clean approach.',
    order: 0
  },
  {
    id: 'ref-002',
    type: 'asset',
    filename: 'previous_campaign_winner.png',
    thumbnailUrl: 'https://picsum.photos/200/200?random=32',
    fileSize: 4100000, // 4.1 MB
    notes: 'Our highest-performing social post from Q4. The warm color palette and lifestyle setting resonated with our target audience. Use as baseline for new creative direction.',
    order: 1
  },
  {
    id: 'ref-003',
    type: 'asset',
    filename: 'brand_moodboard_v2.pdf',
    thumbnailUrl: 'https://picsum.photos/200/200?random=33',
    fileSize: 8500000, // 8.5 MB
    notes: 'Updated brand mood board from strategy team. Pay special attention to the typography examples and color combinations on pages 3-5.',
    order: 2
  },
  {
    id: 'ref-004',
    type: 'asset',
    filename: 'color_palette_inspo.jpg',
    thumbnailUrl: 'https://picsum.photos/200/200?random=34',
    fileSize: 1900000, // 1.9 MB
    notes: 'Saved from asset library - this color harmony is exactly what we\'re aiming for. Sage green + terracotta + cream neutrals.',
    order: 3
  },
  {
    id: 'ref-005',
    type: 'asset',
    filename: 'typography_system_ref.png',
    thumbnailUrl: 'https://picsum.photos/200/200?random=35',
    fileSize: 3200000, // 3.2 MB
    notes: 'Reference for type hierarchy and spacing. Note the generous line-height and how headings create clear visual distinction.',
    order: 4
  },
  {
    id: 'ref-006',
    type: 'asset',
    filename: 'product_styling_example.jpg',
    thumbnailUrl: 'https://picsum.photos/200/200?random=36',
    fileSize: 5600000, // 5.6 MB
    notes: 'Perfect example of how to style our product category. The props are minimal but add context, and lighting is soft and natural.',
    order: 5
  },

  // ========== DIRECT UPLOADS (6) ==========
  {
    id: 'ref-007',
    type: 'upload',
    filename: 'style_reference_minimalist.jpg',
    thumbnailUrl: 'https://picsum.photos/200/200?random=37',
    fileSize: 3800000, // 3.8 MB
    notes: 'Quick upload for inspiration - love the minimalist approach and how much breathing room there is. Everything feels intentional.',
    order: 6
  },
  {
    id: 'ref-008',
    type: 'upload',
    filename: 'hand_drawn_concept_sketch.pdf',
    thumbnailUrl: 'https://picsum.photos/200/200?random=38',
    fileSize: 1200000, // 1.2 MB
    notes: 'Initial concept sketch from brainstorming session. Rough but captures the layout idea we discussed. Use as starting point, not final design.',
    order: 7
  },
  {
    id: 'ref-009',
    type: 'upload',
    filename: 'texture_inspiration_fabric.jpg',
    thumbnailUrl: 'https://picsum.photos/200/200?random=39',
    fileSize: 4500000, // 4.5 MB
    notes: 'Texture reference for background elements. The subtle grain and tactile quality is what we\'re going for - organic and warm.',
    order: 8
  },
  {
    id: 'ref-010',
    type: 'upload',
    filename: 'composition_example_saved.png',
    thumbnailUrl: 'https://picsum.photos/200/200?random=40',
    fileSize: 2300000, // 2.3 MB
    notes: 'Saved from Instagram - composition is spot-on. Notice the rule of thirds application and how the eye flows through the frame.',
    order: 9
  },
  {
    id: 'ref-011',
    type: 'upload',
    filename: 'lighting_setup_diagram.pdf',
    thumbnailUrl: 'https://picsum.photos/200/200?random=41',
    fileSize: 890000, // 890 KB
    notes: 'Lighting diagram for photography session. Three-point lighting with key light at 45 degrees. Soft diffusion on fill light.',
    order: 10
  },
  {
    id: 'ref-012',
    type: 'upload',
    filename: 'pattern_reference_geometric.jpg',
    thumbnailUrl: 'https://picsum.photos/200/200?random=42',
    fileSize: 3100000, // 3.1 MB
    notes: 'Geometric pattern inspiration for background or accent elements. Could work well as a subtle texture in the negative space.',
    order: 11
  },

  // ========== URL REFERENCES (3) ==========
  {
    id: 'ref-013',
    type: 'url',
    filename: undefined,
    url: 'https://www.behance.net/gallery/modern-product-photography-collection',
    thumbnailUrl: 'https://picsum.photos/200/200?random=43',
    notes: 'Behance gallery showcasing modern product photography. Slides 4, 7, and 12 are particularly relevant to our aesthetic goals. Note the consistent use of props and surfaces.',
    order: 12
  },
  {
    id: 'ref-014',
    type: 'url',
    filename: undefined,
    url: 'https://dribbble.com/shots/minimal-brand-identity-design',
    thumbnailUrl: 'https://picsum.photos/200/200?random=44',
    notes: 'Dribbble shot with clean, minimal brand identity system. The way they handle lockups and spacing between elements is exactly what we need.',
    order: 13
  },
  {
    id: 'ref-015',
    type: 'url',
    filename: undefined,
    url: 'https://www.pinterest.com/pin/editorial-layout-inspiration',
    thumbnailUrl: 'https://picsum.photos/200/200?random=45',
    notes: 'Pinterest pin with editorial layout examples. Shows how to balance images with text in a compelling way. Could inform our campaign landing page design.',
    order: 14
  }
]

/**
 * Get references by type
 */
export function getReferencesByType(type: 'asset' | 'upload' | 'url'): ReferenceItem[] {
  return MOCK_REFERENCES.filter(ref => ref.type === type)
}

/**
 * Get references with notes containing specific keywords
 */
export function searchReferenceNotes(keyword: string): ReferenceItem[] {
  const lowerKeyword = keyword.toLowerCase()
  return MOCK_REFERENCES.filter(ref => 
    ref.notes?.toLowerCase().includes(lowerKeyword)
  )
}

/**
 * Get references in order
 */
export function getOrderedReferences(): ReferenceItem[] {
  return [...MOCK_REFERENCES].sort((a, b) => a.order - b.order)
}

/**
 * Count references by type
 */
export function countReferencesByType(): Record<'asset' | 'upload' | 'url', number> {
  return {
    asset: MOCK_REFERENCES.filter(r => r.type === 'asset').length,
    upload: MOCK_REFERENCES.filter(r => r.type === 'upload').length,
    url: MOCK_REFERENCES.filter(r => r.type === 'url').length
  }
}
