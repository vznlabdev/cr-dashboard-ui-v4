import {
  User,
  Bell,
  Shield,
  Building2,
  Users,
  UserCog,
  Building,
  FileText,
  AlertTriangle,
  Lock,
  FileSearch,
  Database,
  Cpu,
  Plug,
  Key,
  Webhook,
  Link2,
  CreditCard,
  Code,
  Download,
  Upload,
  Settings,
} from "lucide-react";

export interface SettingsMenuItem {
  id: string;
  label: string;
  href: string;
  icon: any;
  badge?: string;
  description?: string;
  keywords?: string[];
  children?: SettingsMenuItem[];
}

export interface SettingsMenuSection {
  id: string;
  label: string;
  items: SettingsMenuItem[];
}

export const settingsMenu: SettingsMenuSection[] = [
  // Personal settings
  {
    id: "personal",
    label: "Personal",
    items: [
      {
        id: "preferences",
        label: "Preferences",
        href: "/settings/preferences",
        icon: Settings,
        description: "Theme, language, and display settings",
        keywords: ["theme", "language", "timezone", "display"],
      },
      {
        id: "account",
        label: "Account",
        href: "/settings/account",
        icon: User,
        description: "Profile and account settings",
        keywords: ["profile", "email", "password", "delete"],
      },
      {
        id: "notifications",
        label: "Notifications",
        href: "/settings/notifications",
        icon: Bell,
        description: "Manage notification preferences",
        keywords: ["email", "push", "alerts", "digest"],
      },
      {
        id: "security",
        label: "Security & Access",
        href: "/settings/security",
        icon: Shield,
        description: "Two-factor authentication and sessions",
        keywords: ["2fa", "mfa", "sessions", "login", "security keys"],
      },
    ],
  },
  // Organization & Team
  {
    id: "organization",
    label: "Organization & Team",
    items: [
      {
        id: "organization",
        label: "Organization",
        href: "/settings/organization",
        icon: Building2,
        description: "Company profile and branding",
        keywords: ["company", "branding", "logo", "industry"],
      },
      {
        id: "team",
        label: "Team",
        href: "/creative/team",
        icon: Users,
        description: "Manage team members and invitations",
        keywords: ["members", "invite", "remove", "roles"],
      },
      {
        id: "roles",
        label: "Roles & Permissions",
        href: "/settings/roles",
        icon: UserCog,
        description: "Define roles and permissions",
        keywords: ["permissions", "access", "roles", "custom"],
      },
      {
        id: "sub-accounts",
        label: "Sub-accounts",
        href: "/settings/sub-accounts",
        icon: Building,
        description: "Manage sub-account hierarchy",
        keywords: ["hierarchy", "structure", "resources"],
      },
    ],
  },
  // Content & Rights - Groups creative admin priorities
  {
    id: "content-rights",
    label: "Content & Rights",
    items: [
      {
        id: "talent-rights",
        label: "Talent Rights",
        href: "/settings/talent-rights",
        icon: FileText,
        description: "External talent agreements",
        keywords: ["talent", "rights", "agreements", "licensing"],
      },
      {
        id: "ai-tools",
        label: "AI Tool Whitelist",
        href: "/settings/ai-tools",
        icon: Cpu,
        description: "Manage approved AI tools",
        keywords: ["whitelist", "tools", "ai", "approve"],
      },
      {
        id: "ai-approval-settings",
        label: "Approval Settings",
        href: "/settings/ai-tools/approval-settings",
        icon: Shield,
        description: "Tool approval workflow",
        keywords: ["approval", "workflow", "block", "detect"],
      },
      {
        id: "ai-project-restrictions",
        label: "Project Restrictions",
        href: "/settings/ai-tools/project-restrictions",
        icon: Lock,
        description: "Project-specific tool access",
        keywords: ["project", "restrictions", "access", "tools"],
      },
    ],
  },
  // Security & Compliance - Elevated for SOC2/ISO27001
  {
    id: "security-compliance",
    label: "Security & Compliance",
    items: [
      {
        id: "policies",
        label: "Policies",
        href: "/settings/security-compliance/policies",
        icon: FileText,
        description: "Company governance policies",
        keywords: ["governance", "compliance", "legal", "approval"],
      },
      {
        id: "risk-thresholds",
        label: "Risk Thresholds",
        href: "/settings/security-compliance/risk-thresholds",
        icon: AlertTriangle,
        description: "Risk settings and alerts",
        keywords: ["risk", "alerts", "thresholds", "compliance"],
      },
      {
        id: "access-control",
        label: "Access Control",
        href: "/settings/security-compliance/access-control",
        icon: Lock,
        description: "IP allowlisting and SSO configuration",
        keywords: ["ip", "sso", "saml", "login", "session"],
      },
      {
        id: "audit-logs",
        label: "Audit Logs",
        href: "/settings/security-compliance/audit-logs",
        icon: FileSearch,
        description: "View and export audit logs",
        keywords: ["logs", "audit", "activity", "compliance", "export"],
      },
      {
        id: "data-privacy",
        label: "Data Privacy",
        href: "/settings/security-compliance/data-privacy",
        icon: Database,
        description: "GDPR and data retention settings",
        keywords: ["gdpr", "privacy", "retention", "deletion", "export"],
      },
    ],
  },
  // Integrations
  {
    id: "integrations",
    label: "Integrations",
    items: [
      {
        id: "integrations",
        label: "Integrations",
        href: "/settings/integrations",
        icon: Plug,
        description: "Configure integrations",
        keywords: ["webhook", "api", "sync", "metadata"],
      },
      {
        id: "api-keys",
        label: "API Keys",
        href: "/settings/integrations/api-keys",
        icon: Key,
        description: "Manage API keys",
        keywords: ["api", "keys", "tokens", "permissions"],
      },
      {
        id: "webhooks",
        label: "Webhooks",
        href: "/settings/integrations/webhooks",
        icon: Webhook,
        description: "Webhook configuration",
        keywords: ["webhooks", "events", "delivery", "logs"],
      },
      {
        id: "connected-services",
        label: "Connected Services",
        href: "/settings/integrations/connected-services",
        icon: Link2,
        description: "Third-party integrations",
        keywords: ["oauth", "third-party", "services", "sync"],
      },
    ],
  },
  // Business
  {
    id: "business",
    label: "Business",
    items: [
      {
        id: "billing",
        label: "Billing & Subscription",
        href: "/settings/billing",
        icon: CreditCard,
        description: "Subscription and payment settings",
        keywords: ["billing", "subscription", "payment", "invoice"],
      },
    ],
  },
  // Developer
  {
    id: "developer",
    label: "Developer",
    items: [
      {
        id: "developer",
        label: "Developer Settings",
        href: "/settings/developer",
        icon: Code,
        description: "API documentation and settings",
        keywords: ["api", "docs", "developer", "logs"],
      },
    ],
  },
  // Data Management
  {
    id: "data",
    label: "Data Management",
    items: [
      {
        id: "import-export",
        label: "Import & Export",
        href: "/settings/import-export",
        icon: Download,
        description: "Data import and export",
        keywords: ["export", "import", "data", "backup"],
      },
    ],
  },
];

/**
 * Get all menu items as a flat array (useful for search)
 */
export function getAllMenuItems(): SettingsMenuItem[] {
  const items: SettingsMenuItem[] = [];
  
  settingsMenu.forEach((section) => {
    section.items.forEach((item) => {
      items.push(item);
      if (item.children) {
        items.push(...item.children);
      }
    });
  });
  
  return items;
}

/**
 * Search menu items by keyword
 */
export function searchMenuItems(query: string): SettingsMenuItem[] {
  const lowerQuery = query.toLowerCase();
  const allItems = getAllMenuItems();
  
  return allItems.filter((item) => {
    const labelMatch = item.label.toLowerCase().includes(lowerQuery);
    const descriptionMatch = item.description?.toLowerCase().includes(lowerQuery);
    const keywordMatch = item.keywords?.some((keyword) =>
      keyword.toLowerCase().includes(lowerQuery)
    );
    
    return labelMatch || descriptionMatch || keywordMatch;
  });
}

/**
 * Get breadcrumb trail for a given path
 */
export function getBreadcrumbs(pathname: string): { label: string; href: string }[] {
  const breadcrumbs: { label: string; href: string }[] = [
    { label: "Settings", href: "/settings" },
  ];
  
  const allItems = getAllMenuItems();
  const currentItem = allItems.find((item) => item.href === pathname);
  
  if (currentItem) {
    breadcrumbs.push({
      label: currentItem.label,
      href: currentItem.href,
    });
  }
  
  return breadcrumbs;
}
