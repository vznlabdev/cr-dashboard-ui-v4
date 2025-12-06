/**
 * Shared Design Type Icon Mappings
 * 
 * Centralized icon mappings for design types to avoid duplication
 * across components.
 */

import {
  BarChart3,
  Share2,
  ShoppingCart,
  Mail,
  Palette,
  FileText,
  Presentation,
  Globe,
  Layout,
  Shirt,
  Package,
  Image,
  Store,
  CreditCard,
  Tag,
  Sparkles,
  type LucideIcon,
} from "lucide-react"

/**
 * Map of design type icon names to Lucide icon components
 */
export const DESIGN_TYPE_ICONS: Record<string, LucideIcon> = {
  BarChart3,
  Share2,
  ShoppingCart,
  Mail,
  Palette,
  FileText,
  Presentation,
  Globe,
  Layout,
  Shirt,
  Package,
  Image,
  Store,
  CreditCard,
  Tag,
  Sparkles,
}

/**
 * Get the Lucide icon component for a design type icon name
 * Falls back to FileText if icon not found
 */
export function getDesignTypeIcon(iconName: string): LucideIcon {
  return DESIGN_TYPE_ICONS[iconName] || FileText
}

