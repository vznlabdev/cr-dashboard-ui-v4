// Asset Generator for Pagination Testing
// Generates realistic mock assets with varied properties

import { Asset, AssetFileType, AssetContentType, DesignType } from "@/types/creative"

// Seeded random number generator for consistent server/client rendering
function seededRandom(seed: number) {
  let state = seed
  return function() {
    state = (state * 9301 + 49297) % 233280
    return state / 233280
  }
}

// Brand data for rotation (must match mockBrands in creative.ts)
const brands = [
  { id: "brand-1", name: "Acme Corporation", color: "#3b82f6", logoUrl: "https://placehold.co/100x100/3b82f6/white?text=A" },
  { id: "brand-2", name: "TechStart Inc", color: "#8b5cf6", logoUrl: "https://placehold.co/100x100/8b5cf6/white?text=T" },
  { id: "brand-3", name: "NatureFresh Foods", color: "#22c55e", logoUrl: "https://placehold.co/100x100/22c55e/white?text=N" },
  { id: "brand-4", name: "Urban Style Co", color: "#171717", logoUrl: "https://placehold.co/100x100/171717/white?text=U" },
]

// Team members for rotation
const teamMembers = [
  { id: "tm-1", name: "Sarah Chen" },
  { id: "tm-2", name: "Mike Johnson" },
  { id: "tm-3", name: "Emily Davis" },
  { id: "tm-4", name: "Alex Kim" },
  { id: "tm-5", name: "Jordan Lee" },
  { id: "tm-6", name: "Taylor Smith" },
]

// Asset naming components
const fileTypes = [
  "Banner", "Flyer", "Social Post", "Email Header", "Brochure", "Logo", 
  "Icon", "Infographic", "Business Card", "Poster", "Ad Campaign", 
  "Newsletter", "Landing Page", "Product Shot", "Hero Image"
]

const adjectives = [
  "Modern", "Vintage", "Minimal", "Bold", "Creative", "Professional", 
  "Elegant", "Dynamic", "Clean", "Vibrant", "Sleek", "Fresh", 
  "Innovative", "Classic", "Contemporary"
]

const purposes = [
  "Campaign", "Launch", "Promotion", "Event", "Announcement", "Update",
  "Release", "Feature", "Product", "Service", "Special", "Season"
]

const seasons = ["Spring", "Summer", "Fall", "Winter", "Holiday", "Q1", "Q2", "Q3", "Q4"]

const tags = [
  "marketing", "social", "print", "digital", "web", "mobile", "email",
  "campaign", "sale", "promotion", "launch", "event", "brand", "product"
]

// Design types
const designTypes: DesignType[] = [
  "digital_marketing",
  "social_media",
  "ecommerce",
  "email",
  "logo_branding",
  "pdf_ebook",
  "presentation",
  "web_design",
  "print_merch",
  "poster_flyer",
]

// File types with distribution
const fileTypeDistribution: { type: AssetFileType; weight: number }[] = [
  { type: "image", weight: 60 },
  { type: "video", weight: 20 },
  { type: "pdf", weight: 10 },
  { type: "document", weight: 10 },
]

// Helper: Get random item from array
function random<T>(arr: T[], rng: () => number): T {
  return arr[Math.floor(rng() * arr.length)]
}

// Helper: Get random file type based on distribution
function getRandomFileType(rng: () => number): AssetFileType {
  const total = fileTypeDistribution.reduce((sum, item) => sum + item.weight, 0)
  let rand = rng() * total
  
  for (const item of fileTypeDistribution) {
    if (rand < item.weight) return item.type
    rand -= item.weight
  }
  
  return "image" // fallback
}

// Helper: Get MIME type for file type
function getMimeType(fileType: AssetFileType): string {
  const mimeTypes: Record<AssetFileType, string> = {
    image: "image/png",
    video: "video/mp4",
    pdf: "application/pdf",
    document: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    archive: "application/zip",
    other: "application/octet-stream",
  }
  return mimeTypes[fileType]
}

// Helper: Get file extension
function getFileExtension(fileType: AssetFileType): string {
  const extensions: Record<AssetFileType, string> = {
    image: "png",
    video: "mp4",
    pdf: "pdf",
    document: "docx",
    archive: "zip",
    other: "file",
  }
  return extensions[fileType]
}

// Helper: Generate random file size (100KB to 10MB, bell curve centered at 2MB)
function getRandomFileSize(rng: () => number): number {
  // Use Box-Muller transform for normal distribution
  const u1 = rng()
  const u2 = rng()
  const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2)
  
  // Mean: 2MB (2097152 bytes), StdDev: 1.5MB
  const mean = 2097152
  const stdDev = 1572864
  let size = Math.round(mean + stdDev * z0)
  
  // Clamp between 100KB and 10MB
  size = Math.max(102400, Math.min(10485760, size))
  
  return size
}

// Helper: Generate random date in last 180 days
function getRandomDate(rng: () => number): Date {
  const now = Date.now()
  const sixMonthsAgo = now - (180 * 24 * 60 * 60 * 1000)
  const randomTime = sixMonthsAgo + rng() * (now - sixMonthsAgo)
  return new Date(randomTime)
}

// Helper: Generate random asset name
function generateRandomName(index: number, rng: () => number, fileType: AssetFileType): string {
  const adjective = random(adjectives, rng)
  const fileTypeName = random(fileTypes, rng)
  const purpose = random(purposes, rng)
  const season = random(seasons, rng)
  const ext = getFileExtension(fileType)
  
  const patterns = [
    `${adjective} ${fileTypeName} - ${purpose} ${season}.${ext}`,
    `${fileTypeName} - ${adjective} ${purpose}.${ext}`,
    `${season} ${adjective} ${fileTypeName}.${ext}`,
    `${purpose} ${fileTypeName} v${Math.floor(index / 10) + 1}.${ext}`,
  ]
  
  return random(patterns, rng)
}

// Helper: Generate random description
function generateRandomDescription(rng: () => number): string {
  const descriptions = [
    "High-quality asset for marketing campaign",
    "Professional design for brand promotion",
    "Creative visual for digital marketing",
    "Modern design for social media",
    "Elegant layout for print materials",
    "Bold graphics for event promotion",
    "Clean design for web presentation",
    "Vibrant visuals for product launch",
    "Minimalist approach to brand identity",
    "Dynamic content for email campaign",
  ]
  
  return random(descriptions, rng)
}

// Helper: Generate random tags
function generateRandomTags(rng: () => number): string[] {
  const count = Math.floor(rng() * 4) + 2 // 2-5 tags
  const selectedTags: string[] = []
  const availableTags = [...tags]
  
  for (let i = 0; i < count && availableTags.length > 0; i++) {
    const index = Math.floor(rng() * availableTags.length)
    selectedTags.push(availableTags[index])
    availableTags.splice(index, 1)
  }
  
  return selectedTags
}

/**
 * Generate mock assets for pagination testing
 * @param count Number of assets to generate (default: 75)
 * @param seed Random seed for deterministic generation (default: 12345)
 * @returns Array of generated Asset objects
 */
export function generateMockAssets(count: number = 75, seed: number = 12345): Asset[] {
  const assets: Asset[] = []
  const rng = seededRandom(seed)
  
  for (let i = 27; i <= count + 26; i++) {
    const brand = brands[i % brands.length]
    const teamMember = teamMembers[i % teamMembers.length]
    const fileType = getRandomFileType(rng)
    const contentType: AssetContentType = rng() > 0.4 ? "ai_generated" : "original"
    const designType = designTypes[i % designTypes.length]
    const createdAt = getRandomDate(rng)
    
    assets.push({
      id: `asset-${i}`,
      name: generateRandomName(i, rng, fileType),
      description: generateRandomDescription(rng),
      thumbnailUrl: `https://picsum.photos/seed/asset${i}/400/300`,
      fileUrl: `/assets/generated-${i}.${getFileExtension(fileType)}`,
      fileType,
      contentType,
      mimeType: getMimeType(fileType),
      fileSize: getRandomFileSize(rng),
      dimensions: fileType === "image" || fileType === "video" 
        ? { width: 1920, height: 1080 } 
        : undefined,
      brandId: brand.id,
      brandName: brand.name,
      brandColor: brand.color,
      brandLogoUrl: brand.logoUrl,
      designType,
      tags: generateRandomTags(rng),
      uploadedById: teamMember.id,
      uploadedByName: teamMember.name,
      createdAt,
      updatedAt: createdAt,
      // Skip promptHistory, copyrightCheck fields for generated assets
    })
  }
  
  return assets
}
