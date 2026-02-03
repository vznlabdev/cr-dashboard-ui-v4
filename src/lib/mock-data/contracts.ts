import type { TalentContract } from "@/types/talent-contracts"

export const mockContracts: TalentContract[] = [
  // Nike - Active NILP Rights Agreement
  {
    id: "contract-1",
    talentId: "creator-1",
    talentName: "Sarah Johnson",
    templateType: "standard",
    contractType: "nilp_rights_agreement",
    status: "signed",
    version: 1,
    title: "Nike Spring Campaign 2025 - NILP Rights Agreement",
    contractId: "CR-2024-245-NIKE",
    brandName: "Nike",
    brandLogoUrl: "https://placehold.co/100x100/000000/white?text=NIKE",
    projectId: "task-245",
    projectTitle: "Q1 2025 Campaign",
    contractUrl: "/contracts/Nike_NILP_Agreement_SarahJohnson.pdf",
    signedContractUrl: "/contracts/Nike_NILP_Agreement_SarahJohnson_Signed.pdf",
    
    nilpRights: {
      name: {
        included: true,
        usage: ["campaign_credits", "social_media", "press_releases", "promotional_materials"],
        restrictions: "Attribution required in all materials"
      },
      image: {
        included: true,
        approvedImages: ["headshot_2024.jpg", "previous_campaign.mp4"],
        usage: ["tv_commercial", "digital_ads", "social_media", "print"],
        restrictions: "Professional headshot and previous campaign footage only"
      },
      likeness: {
        included: true,
        aiGeneration: true,
        approvedTools: ["ChatGPT", "Midjourney"],
        requiresApproval: true,
        restrictions: "All AI-generated outputs require prior approval"
      },
      persona: {
        included: true,
        personalityTraits: ["Athletic", "Motivational", "Determined"],
        brandVoice: "Performance-driven, inspirational",
        messagingTone: "Achievement-focused, energetic, aspirational",
        restrictions: "Must align with Nike's Just Do It brand values"
      }
    },
    
    terms: {
      effectiveDate: new Date("2025-01-01"),
      expirationDate: new Date("2025-06-30"),
      territory: ["United States"],
      mediaChannels: ["tv", "digital", "social", "print"],
      intendedUse: "Advertising and promotional materials only",
      category: "Sports Apparel",
      exclusivity: {
        isExclusive: false,
        competitors: ["Adidas", "Under Armour", "Puma"]
      },
      autoRenewal: false
    },
    
    compensation: {
      totalAmount: 15000,
      currency: "USD",
      breakdown: {
        nameRights: 2000,
        imageRights: 5000,
        likenessRights: 4000,
        personaRights: 4000
      },
      paymentTerms: "Net 30 from contract execution",
      paymentMethod: "Wire transfer",
      paymentStatus: "paid",
      paidAt: new Date("2025-01-05"),
      invoiceNumber: "INV-2025-0105-245"
    },
    
    documents: [
      {
        id: "doc-1",
        type: "contract",
        fileName: "Nike_NILP_Agreement_SarahJohnson.pdf",
        fileUrl: "/contracts/Nike_NILP_Agreement_SarahJohnson.pdf",
        fileSize: 2100000,
        uploadedAt: new Date("2024-12-27"),
        uploadedBy: "admin-1",
        signedAt: new Date("2024-12-28"),
        signatureMethod: "electronic",
        signatureIpAddress: "192.168.1.1"
      },
      {
        id: "doc-2",
        type: "brief",
        fileName: "Nike_Campaign_Brief.pdf",
        fileUrl: "/contracts/Nike_Campaign_Brief.pdf",
        fileSize: 1500000,
        uploadedAt: new Date("2024-12-27"),
        uploadedBy: "admin-1"
      },
      {
        id: "doc-3",
        type: "invoice",
        fileName: "Invoice_INV-2025-0105-245.pdf",
        fileUrl: "/contracts/Invoice_INV-2025-0105-245.pdf",
        fileSize: 245000,
        uploadedAt: new Date("2025-01-05"),
        uploadedBy: "admin-1"
      }
    ],
    
    reminders: [
      { type: "30_days", enabled: true },
      { type: "7_days", enabled: true }
    ],
    
    specialProvisions: [
      "Talent retains approval rights for all final outputs",
      "Brand must submit NILP-based content for approval before publication",
      "Talent retains moral rights and attribution",
      "30-day notice required for early termination with pro-rated refund",
      "Option to extend for additional 6 months"
    ],
    
    approvalRights: true,
    moralRights: true,
    terminationNotice: 30,
    
    // Legacy fields
    compensationType: "flat_fee",
    compensationAmount: 15000,
    validFrom: new Date("2025-01-01"),
    validThrough: new Date("2025-06-30"),
    rightsGranted: { name: true, image: true, likeness: true, persona: true },
    usageRestrictions: ["Requires approval for AI-generated content"],
    territoryRestrictions: ["United States"],
    exclusivity: false,
    
    sentAt: new Date("2024-12-27"),
    viewedAt: new Date("2024-12-27"),
    signedAt: new Date("2024-12-28"),
    signedByTalent: true,
    signedByAdmin: true,
    executedAt: new Date("2024-12-28"),
    
    negotiations: [],
    
    contractHistory: [
      {
        id: "hist-1",
        action: "created",
        timestamp: new Date("2024-12-27"),
        performedBy: "admin-1",
        performedByName: "Admin User",
        details: "NILP contract created and sent for review"
      },
      {
        id: "hist-2",
        action: "viewed",
        timestamp: new Date("2024-12-27"),
        performedBy: "creator-1",
        performedByName: "Sarah Johnson",
        details: "Contract reviewed"
      },
      {
        id: "hist-3",
        action: "signed",
        timestamp: new Date("2024-12-28"),
        performedBy: "creator-1",
        performedByName: "Sarah Johnson",
        details: "Electronically signed"
      },
      {
        id: "hist-4",
        action: "executed",
        timestamp: new Date("2024-12-28"),
        performedBy: "admin-1",
        performedByName: "Admin User",
        details: "Contract fully executed"
      },
      {
        id: "hist-5",
        action: "paid",
        timestamp: new Date("2025-01-05"),
        performedBy: "admin-1",
        performedByName: "Admin User",
        details: "Payment received ($15,000)"
      }
    ],
    
    createdAt: new Date("2024-12-27"),
    createdBy: "admin-1",
    createdByName: "Admin User",
    updatedAt: new Date("2025-01-05"),
    updatedBy: "admin-1"
  },
  
  // Samsung - Active Brand Endorsement
  {
    id: "contract-2",
    talentId: "creator-1",
    talentName: "Sarah Johnson",
    templateType: "standard",
    contractType: "brand_endorsement",
    status: "signed",
    version: 1,
    title: "Samsung Global Campaign - NILP Endorsement Deal",
    contractId: "CR-2024-203-SAMSUNG",
    brandName: "Samsung",
    brandLogoUrl: "https://placehold.co/100x100/1428a0/white?text=SAMSUNG",
    projectId: "task-203",
    projectTitle: "Galaxy S25 Launch",
    contractUrl: "/contracts/Samsung_NILP_Endorsement_Agreement.pdf",
    signedContractUrl: "/contracts/Samsung_NILP_Endorsement_Agreement_Signed.pdf",
    
    nilpRights: {
      name: {
        included: true,
        usage: ["product_marketing", "social_media", "advertising"],
        restrictions: "Product-focused marketing only"
      },
      image: {
        included: true,
        approvedImages: ["existing_campaign_assets"],
        usage: ["digital_ads", "social_media", "print"],
        restrictions: "Existing campaign assets only"
      },
      likeness: {
        included: true,
        aiGeneration: true,
        approvedTools: ["ChatGPT", "Midjourney"],
        requiresApproval: true,
        restrictions: "AI-enhanced product photography only"
      },
      persona: {
        included: false,
        restrictions: "Not included - product-focused campaign"
      }
    },
    
    terms: {
      effectiveDate: new Date("2025-01-01"),
      expirationDate: new Date("2025-03-31"),
      territory: ["Global"],
      mediaChannels: ["digital", "social"],
      intendedUse: "Product marketing and advertising",
      category: "Consumer Electronics",
      exclusivity: {
        isExclusive: true,
        blockedCategories: ["Consumer Electronics"],
        competitors: ["Apple", "Google", "OnePlus"]
      },
      autoRenewal: false
    },
    
    compensation: {
      totalAmount: 25000,
      currency: "USD",
      breakdown: {
        nameRights: 5000,
        imageRights: 10000,
        likenessRights: 10000
      },
      paymentTerms: "Upon signature",
      paymentMethod: "Wire transfer",
      paymentStatus: "paid",
      paidAt: new Date("2024-12-15"),
      invoiceNumber: "INV-2024-1215-203"
    },
    
    documents: [
      {
        id: "doc-4",
        type: "contract",
        fileName: "Samsung_NILP_Endorsement_Agreement.pdf",
        fileUrl: "/contracts/Samsung_NILP_Endorsement_Agreement.pdf",
        fileSize: 3200000,
        uploadedAt: new Date("2024-12-10"),
        uploadedBy: "admin-1",
        signedAt: new Date("2024-12-15"),
        signatureMethod: "electronic",
        signatureIpAddress: "192.168.1.1"
      }
    ],
    
    reminders: [
      { type: "30_days", enabled: true },
      { type: "7_days", enabled: true },
      { type: "category_available", enabled: true }
    ],
    
    specialProvisions: [
      "Exclusive in consumer electronics category",
      "Blocks work with competing brands",
      "Category becomes available after expiration"
    ],
    
    approvalRights: true,
    moralRights: true,
    terminationNotice: 30,
    
    // Legacy fields
    compensationType: "flat_fee",
    compensationAmount: 25000,
    validFrom: new Date("2025-01-01"),
    validThrough: new Date("2025-03-31"),
    rightsGranted: { name: true, image: true, likeness: true, persona: false },
    usageRestrictions: ["AI-enhanced product photography only"],
    territoryRestrictions: [],
    exclusivity: true,
    
    sentAt: new Date("2024-12-10"),
    viewedAt: new Date("2024-12-12"),
    signedAt: new Date("2024-12-15"),
    signedByTalent: true,
    signedByAdmin: true,
    executedAt: new Date("2024-12-15"),
    
    negotiations: [],
    
    contractHistory: [
      {
        id: "hist-6",
        action: "created",
        timestamp: new Date("2024-12-10"),
        performedBy: "admin-1",
        performedByName: "Admin User"
      },
      {
        id: "hist-7",
        action: "signed",
        timestamp: new Date("2024-12-15"),
        performedBy: "creator-1",
        performedByName: "Sarah Johnson"
      },
      {
        id: "hist-8",
        action: "paid",
        timestamp: new Date("2024-12-15"),
        performedBy: "admin-1",
        performedByName: "Admin User"
      }
    ],
    
    createdAt: new Date("2024-12-10"),
    createdBy: "admin-1",
    createdByName: "Admin User",
    updatedAt: new Date("2024-12-15"),
    updatedBy: "admin-1"
  },
  
  // Toyota - Expiring Soon (Brand Mascot)
  {
    id: "contract-3",
    talentId: "creator-2",
    talentName: "Brandy the Bear",
    templateType: "standard",
    contractType: "usage_rights",
    status: "signed",
    version: 1,
    title: "Toyota Holiday Campaign - NILP Usage Rights",
    contractId: "CR-2024-189-TOYOTA",
    brandName: "Toyota",
    brandLogoUrl: "https://placehold.co/100x100/cc0000/white?text=TOYOTA",
    projectId: "task-189",
    projectTitle: "Year-End Sales",
    contractUrl: "/contracts/Toyota_NILP_Usage_Rights.pdf",
    signedContractUrl: "/contracts/Toyota_NILP_Usage_Rights_Signed.pdf",
    
    nilpRights: {
      name: {
        included: true,
        usage: ["on_screen_credits"],
        restrictions: "Credits in end slate only"
      },
      image: {
        included: true,
        approvedImages: ["commercial_footage.mp4"],
        usage: ["tv_commercial", "streaming"],
        restrictions: "Full appearance in commercial - live action"
      },
      likeness: {
        included: false,
        aiGeneration: false,
        requiresApproval: false,
        restrictions: "Not used - live action only"
      },
      persona: {
        included: true,
        personalityTraits: ["Adventure-driven", "Family-oriented", "Reliable"],
        brandVoice: "Trustworthy, adventurous",
        messagingTone: "Warm, relatable, inspirational"
      }
    },
    
    terms: {
      effectiveDate: new Date("2024-11-01"),
      expirationDate: new Date("2025-01-15"),  // 17 days from now (assuming today is ~Dec 29)
      territory: ["United States", "Canada"],
      mediaChannels: ["tv", "streaming"],
      intendedUse: "Television and streaming advertising",
      category: "Automotive",
      exclusivity: {
        isExclusive: true,
        blockedCategories: ["Automotive"],
        competitors: ["Honda", "Ford", "Chevrolet"]
      },
      autoRenewal: false,
      renewalTerms: "Option to extend for additional 3 months"
    },
    
    compensation: {
      totalAmount: 18000,
      currency: "USD",
      breakdown: {
        nameRights: 3000,
        imageRights: 8000,
        personaRights: 7000
      },
      paymentTerms: "Net 30",
      paymentMethod: "Wire transfer",
      paymentStatus: "paid",
      paidAt: new Date("2024-11-15"),
      invoiceNumber: "INV-2024-1115-189"
    },
    
    documents: [
      {
        id: "doc-5",
        type: "contract",
        fileName: "Toyota_NILP_Usage_Rights.pdf",
        fileUrl: "/contracts/Toyota_NILP_Usage_Rights.pdf",
        fileSize: 1800000,
        uploadedAt: new Date("2024-10-25"),
        uploadedBy: "admin-1",
        signedAt: new Date("2024-10-28"),
        signatureMethod: "electronic",
        signatureIpAddress: "192.168.1.1"
      }
    ],
    
    reminders: [
      { type: "30_days", enabled: true, triggeredAt: new Date("2024-12-16") },
      { type: "7_days", enabled: true },
      { type: "category_available", enabled: true }
    ],
    
    specialProvisions: [
      "Exclusive in automotive category during term",
      "Category becomes available January 16, 2025"
    ],
    
    approvalRights: false,
    moralRights: true,
    terminationNotice: 14,
    
    // Legacy fields
    compensationType: "flat_fee",
    compensationAmount: 18000,
    validFrom: new Date("2024-11-01"),
    validThrough: new Date("2025-01-15"),
    rightsGranted: { name: true, image: true, likeness: false, persona: true },
    usageRestrictions: ["Television and streaming only"],
    territoryRestrictions: ["United States", "Canada"],
    exclusivity: true,
    
    sentAt: new Date("2024-10-25"),
    viewedAt: new Date("2024-10-26"),
    signedAt: new Date("2024-10-28"),
    signedByTalent: true,
    signedByAdmin: true,
    executedAt: new Date("2024-10-28"),
    
    negotiations: [],
    
    contractHistory: [
      {
        id: "hist-9",
        action: "created",
        timestamp: new Date("2024-10-25"),
        performedBy: "admin-1",
        performedByName: "Admin User"
      },
      {
        id: "hist-10",
        action: "signed",
        timestamp: new Date("2024-10-28"),
        performedBy: "creator-1",
        performedByName: "Sarah Johnson"
      },
      {
        id: "hist-11",
        action: "paid",
        timestamp: new Date("2024-11-15"),
        performedBy: "admin-1",
        performedByName: "Admin User"
      }
    ],
    
    createdAt: new Date("2024-10-25"),
    createdBy: "admin-1",
    createdByName: "Admin User",
    updatedAt: new Date("2024-11-15"),
    updatedBy: "admin-1"
  },
  
  // Coca-Cola - Pending Signature
  {
    id: "contract-4",
    talentId: "creator-1",
    talentName: "Sarah Johnson",
    templateType: "standard",
    contractType: "nilp_rights_agreement",
    status: "pending_signature",
    version: 1,
    title: "Coca-Cola Super Bowl Campaign - NILP Rights Agreement",
    contractId: "CR-2025-267-COKE",
    brandName: "Coca-Cola",
    brandLogoUrl: "https://placehold.co/100x100/f40009/white?text=COKE",
    projectId: "task-267",
    projectTitle: "Super Bowl LIX",
    contractUrl: "/contracts/CocaCola_NILP_Agreement_Draft.pdf",
    
    nilpRights: {
      name: {
        included: true,
        usage: ["on_screen_credits", "product_packaging", "social_media"],
        restrictions: "Credits required in all materials"
      },
      image: {
        included: true,
        approvedImages: ["commercial_appearance.mp4"],
        usage: ["tv_commercial", "digital", "social", "print"],
        restrictions: "Commercial appearance only"
      },
      likeness: {
        included: false,
        aiGeneration: false,
        requiresApproval: false,
        restrictions: "Not requested - live action only"
      },
      persona: {
        included: true,
        personalityTraits: ["Energetic", "Celebratory", "Relatable"],
        brandVoice: "Fun, inclusive, joyful",
        messagingTone: "Uplifting, positive, community-focused"
      }
    },
    
    terms: {
      effectiveDate: new Date("2025-02-01"),
      expirationDate: new Date("2025-08-01"),
      territory: ["United States"],
      mediaChannels: ["tv", "digital", "social"],
      intendedUse: "Super Bowl commercial and related advertising",
      category: "Beverages",
      exclusivity: {
        isExclusive: true,
        blockedCategories: ["Non-alcoholic Beverages"],
        competitors: ["Pepsi", "Dr Pepper", "Mountain Dew"]
      },
      autoRenewal: false
    },
    
    compensation: {
      totalAmount: 30000,
      currency: "USD",
      breakdown: {
        nameRights: 6000,
        imageRights: 12000,
        personaRights: 12000
      },
      paymentTerms: "Within 30 days of signature",
      paymentMethod: "Wire transfer",
      paymentStatus: "pending"
    },
    
    documents: [
      {
        id: "doc-6",
        type: "contract",
        fileName: "CocaCola_NILP_Agreement_Draft.pdf",
        fileUrl: "/contracts/CocaCola_NILP_Agreement_Draft.pdf",
        fileSize: 2800000,
        uploadedAt: new Date("2024-12-29"),
        uploadedBy: "admin-1"
      }
    ],
    
    reminders: [
      { type: "30_days", enabled: true },
      { type: "7_days", enabled: true },
      { type: "category_available", enabled: true }
    ],
    
    specialProvisions: [
      "Exclusive in non-alcoholic beverage category",
      "Blocks all competing beverage brands during term",
      "Category becomes available after August 1, 2025"
    ],
    
    approvalRights: true,
    moralRights: true,
    terminationNotice: 30,
    
    // Legacy fields
    compensationType: "flat_fee",
    compensationAmount: 30000,
    validFrom: new Date("2025-02-01"),
    validThrough: new Date("2025-08-01"),
    rightsGranted: { name: true, image: true, likeness: false, persona: true },
    usageRestrictions: ["Super Bowl and related advertising"],
    territoryRestrictions: ["United States"],
    exclusivity: true,
    
    sentAt: new Date("2024-12-29"),
    viewedAt: new Date("2024-12-29"),
    signedByTalent: false,
    signedByAdmin: false,
    
    negotiations: [],
    
    contractHistory: [
      {
        id: "hist-12",
        action: "created",
        timestamp: new Date("2024-12-29"),
        performedBy: "admin-1",
        performedByName: "Admin User",
        details: "NILP contract sent for review"
      },
      {
        id: "hist-13",
        action: "viewed",
        timestamp: new Date("2024-12-29"),
        performedBy: "creator-1",
        performedByName: "Sarah Johnson",
        details: "Contract reviewed - awaiting signature"
      }
    ],
    
    createdAt: new Date("2024-12-29"),
    createdBy: "admin-1",
    createdByName: "Admin User",
    updatedAt: new Date("2024-12-29"),
    updatedBy: "admin-1"
  },
  
  // Apple - Expired (Athlete)
  {
    id: "contract-5",
    talentId: "creator-4",
    talentName: "Marcus Thompson",
    templateType: "standard",
    contractType: "nilp_rights_agreement",
    status: "expired",
    version: 1,
    title: "Apple Holiday Campaign 2024 - NILP Rights Agreement",
    contractId: "CR-2024-178-APPLE",
    brandName: "Apple",
    brandLogoUrl: "https://placehold.co/100x100/555555/white?text=APPLE",
    projectId: "task-178",
    projectTitle: "Holiday 2024 Campaign",
    contractUrl: "/contracts/Apple_NILP_Agreement.pdf",
    signedContractUrl: "/contracts/Apple_NILP_Agreement_Signed.pdf",
    
    nilpRights: {
      name: {
        included: true,
        usage: ["on_screen_credits", "marketing_materials"],
      },
      image: {
        included: true,
        approvedImages: ["headshot_2024.jpg"],
        usage: ["tv_commercial", "digital", "print"],
      },
      likeness: {
        included: true,
        aiGeneration: true,
        approvedTools: ["Midjourney"],
        requiresApproval: true,
        restrictions: "AI-enhanced imagery only"
      },
      persona: {
        included: false,
        restrictions: "Not used in this campaign"
      }
    },
    
    terms: {
      effectiveDate: new Date("2024-11-01"),
      expirationDate: new Date("2024-12-31"),
      territory: ["United States"],
      mediaChannels: ["tv", "digital", "social", "print"],
      intendedUse: "Holiday advertising campaign",
      category: "Consumer Electronics",
      exclusivity: {
        isExclusive: false
      },
      autoRenewal: false
    },
    
    compensation: {
      totalAmount: 20000,
      currency: "USD",
      breakdown: {
        nameRights: 4000,
        imageRights: 8000,
        likenessRights: 8000
      },
      paymentTerms: "Net 30",
      paymentMethod: "Wire transfer",
      paymentStatus: "paid",
      paidAt: new Date("2024-11-20"),
      invoiceNumber: "INV-2024-1120-178"
    },
    
    documents: [
      {
        id: "doc-7",
        type: "contract",
        fileName: "Apple_NILP_Agreement.pdf",
        fileUrl: "/contracts/Apple_NILP_Agreement.pdf",
        fileSize: 1900000,
        uploadedAt: new Date("2024-10-15"),
        uploadedBy: "admin-1",
        signedAt: new Date("2024-10-20"),
        signatureMethod: "electronic",
        signatureIpAddress: "192.168.1.1"
      }
    ],
    
    reminders: [
      { type: "30_days", enabled: true, triggeredAt: new Date("2024-12-01") },
      { type: "7_days", enabled: true, triggeredAt: new Date("2024-12-24") }
    ],
    
    specialProvisions: [
      "One-time flat fee for usage period",
      "No residuals or royalties"
    ],
    
    approvalRights: true,
    moralRights: true,
    terminationNotice: 30,
    
    // Legacy fields
    compensationType: "flat_fee",
    compensationAmount: 20000,
    validFrom: new Date("2024-11-01"),
    validThrough: new Date("2024-12-31"),
    rightsGranted: { name: true, image: true, likeness: true, persona: false },
    usageRestrictions: ["Holiday advertising only"],
    territoryRestrictions: ["United States"],
    exclusivity: false,
    
    sentAt: new Date("2024-10-15"),
    viewedAt: new Date("2024-10-17"),
    signedAt: new Date("2024-10-20"),
    signedByTalent: true,
    signedByAdmin: true,
    executedAt: new Date("2024-10-20"),
    
    negotiations: [],
    
    contractHistory: [
      {
        id: "hist-14",
        action: "created",
        timestamp: new Date("2024-10-15"),
        performedBy: "admin-1",
        performedByName: "Admin User"
      },
      {
        id: "hist-15",
        action: "signed",
        timestamp: new Date("2024-10-20"),
        performedBy: "creator-1",
        performedByName: "Sarah Johnson"
      },
      {
        id: "hist-16",
        action: "paid",
        timestamp: new Date("2024-11-20"),
        performedBy: "admin-1",
        performedByName: "Admin User"
      }
    ],
    
    createdAt: new Date("2024-10-15"),
    createdBy: "admin-1",
    createdByName: "Admin User",
    updatedAt: new Date("2024-11-20"),
    updatedBy: "admin-1"
  }
]

// Helper functions
export function getContractsByTalent(talentId: string): TalentContract[] {
  return mockContracts.filter(c => c.talentId === talentId)
}

export function getContractById(id: string): TalentContract | undefined {
  return mockContracts.find(c => c.id === id)
}

export function getActiveContracts(): TalentContract[] {
  return mockContracts.filter(c => c.status === "signed" && new Date(c.terms.expirationDate) > new Date())
}

export function getExpiringContracts(days: number = 30): TalentContract[] {
  const now = new Date()
  const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000)
  return mockContracts.filter(c => {
    if (c.status !== "signed") return false
    const expiration = new Date(c.terms.expirationDate)
    return expiration > now && expiration <= futureDate
  })
}

export function getPendingContracts(): TalentContract[] {
  return mockContracts.filter(c => 
    c.status === "pending_signature" || 
    c.status === "sent" || 
    c.status === "under_review"
  )
}

export function getExpiredContracts(): TalentContract[] {
  return mockContracts.filter(c => c.status === "expired")
}

export function getTotalContractValue(contracts: TalentContract[]): number {
  return contracts.reduce((sum, c) => sum + c.compensation.totalAmount, 0)
}

export function getContractsByBrand(brandName: string): TalentContract[] {
  return mockContracts.filter(c => c.brandName.toLowerCase().includes(brandName.toLowerCase()))
}

export function getContractsByCategory(category: string): TalentContract[] {
  return mockContracts.filter(c => c.terms.category.toLowerCase().includes(category.toLowerCase()))
}
