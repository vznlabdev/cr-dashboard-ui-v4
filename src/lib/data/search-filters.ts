/**
 * Filter definitions for Creation Rights enterprise search.
 * Powers the filter bar on the search page; each definition specifies
 * which entity tabs show the filter and which operators/options apply.
 */

import type { FilterDefinition, SearchEntityType } from "@/types/search";

const ALL_ENTITY_TYPES: SearchEntityType[] = [
  "asset",
  "project",
  "task",
  "workflow",
  "brand",
  "talent",
  "team_member",
  "compliance",
  "contract",
  "insurance",
];

/** All available filter definitions for the search UI. */
export const SEARCH_FILTER_DEFINITIONS: FilterDefinition[] = [
  // --- Global (all entity tabs) ---
  {
    field: "status",
    label: "Status",
    type: "select",
    operators: ["is", "is_not"],
    options: [
      { value: "active", label: "Active", color: "green" },
      { value: "pending", label: "Pending", color: "yellow" },
      { value: "completed", label: "Completed", color: "blue" },
      { value: "archived", label: "Archived", color: "gray" },
    ],
    entityTypes: ALL_ENTITY_TYPES,
  },
  {
    field: "createdDate",
    label: "Created Date",
    type: "date_range",
    operators: ["before", "after", "between"],
    entityTypes: ALL_ENTITY_TYPES,
  },
  {
    field: "updatedDate",
    label: "Updated Date",
    type: "date_range",
    operators: ["before", "after", "between"],
    entityTypes: ALL_ENTITY_TYPES,
  },
  {
    field: "brand",
    label: "Brand",
    type: "multi_select",
    operators: ["is", "is_not"],
    options: [
      { value: "nike", label: "Nike" },
      { value: "samsung", label: "Samsung" },
      { value: "coca-cola", label: "Coca-Cola" },
      { value: "adidas", label: "Adidas" },
      { value: "apple", label: "Apple" },
    ],
    entityTypes: ALL_ENTITY_TYPES,
  },
  {
    field: "createdBy",
    label: "Created By",
    type: "multi_select",
    operators: ["is", "is_not"],
    options: [
      { value: "john-doe", label: "John Doe" },
      { value: "sarah-chen", label: "Sarah Chen" },
      { value: "emily-rodriguez", label: "Emily Rodriguez" },
      { value: "mike-chen", label: "Mike Chen" },
    ],
    entityTypes: ALL_ENTITY_TYPES,
  },

  // --- Asset ---
  {
    field: "fileType",
    label: "File Type",
    type: "multi_select",
    operators: ["is", "is_not"],
    options: [
      { value: "image", label: "Images" },
      { value: "video", label: "Videos" },
      { value: "pdf", label: "PDFs" },
      { value: "audio", label: "Audio" },
      { value: "document", label: "Documents" },
    ],
    entityTypes: ["asset"],
  },
  {
    field: "creationMethod",
    label: "Creation Method",
    type: "multi_select",
    operators: ["is", "is_not"],
    options: [
      { value: "ai_generated", label: "AI Generated" },
      { value: "ai_enhanced", label: "AI Enhanced" },
      { value: "human_made", label: "Human Made" },
      { value: "mixed", label: "Mixed" },
    ],
    entityTypes: ["asset"],
  },
  {
    field: "aclarScore",
    label: "ACLAR Score",
    type: "number_range",
    operators: ["gt", "lt", "between"],
    entityTypes: ["asset"],
  },
  {
    field: "approvalStatus",
    label: "Approval Status",
    type: "select",
    operators: ["is", "is_not"],
    options: [
      { value: "pending", label: "Pending", color: "yellow" },
      { value: "approved", label: "Approved", color: "green" },
      { value: "rejected", label: "Rejected", color: "red" },
      { value: "in_review", label: "In Review", color: "blue" },
    ],
    entityTypes: ["asset"],
  },
  {
    field: "complianceStatus",
    label: "Compliance Status",
    type: "select",
    operators: ["is", "is_not"],
    options: [
      { value: "compliant", label: "Compliant", color: "green" },
      { value: "non_compliant", label: "Non-Compliant", color: "red" },
      { value: "pending_review", label: "Pending Review", color: "yellow" },
      { value: "flagged", label: "Flagged", color: "orange" },
    ],
    entityTypes: ["asset"],
  },
  {
    field: "aiToolUsed",
    label: "AI Tool Used",
    type: "multi_select",
    operators: ["is", "is_not"],
    options: [
      { value: "midjourney", label: "Midjourney" },
      { value: "dall-e-3", label: "DALL-E 3" },
      { value: "adobe-firefly", label: "Adobe Firefly" },
      { value: "runway-gen-3", label: "Runway Gen-3" },
      { value: "heygen", label: "HeyGen" },
      { value: "elevenlabs", label: "ElevenLabs" },
      { value: "chatgpt-enterprise", label: "ChatGPT Enterprise" },
      { value: "claude", label: "Claude" },
    ],
    entityTypes: ["asset"],
  },
  {
    field: "fileSize",
    label: "File Size",
    type: "select",
    operators: ["is", "is_not"],
    options: [
      { value: "under_1mb", label: "Under 1MB" },
      { value: "1_10mb", label: "1-10MB" },
      { value: "10_100mb", label: "10-100MB" },
      { value: "over_100mb", label: "Over 100MB" },
    ],
    entityTypes: ["asset"],
  },
  {
    field: "hasProvenance",
    label: "Has Provenance",
    type: "boolean",
    operators: ["is"],
    options: [
      { value: "true", label: "Yes" },
      { value: "false", label: "No" },
    ],
    entityTypes: ["asset"],
  },

  // --- Project ---
  {
    field: "projectStatus",
    label: "Project Status",
    type: "select",
    operators: ["is", "is_not"],
    options: [
      { value: "planning", label: "Planning", color: "gray" },
      { value: "active", label: "Active", color: "green" },
      { value: "on_hold", label: "On Hold", color: "yellow" },
      { value: "completed", label: "Completed", color: "blue" },
      { value: "archived", label: "Archived", color: "gray" },
    ],
    entityTypes: ["project"],
  },
  {
    field: "department",
    label: "Department",
    type: "multi_select",
    operators: ["is", "is_not"],
    options: [
      { value: "marketing", label: "Marketing" },
      { value: "brand", label: "Brand" },
      { value: "legal", label: "Legal" },
      { value: "creative", label: "Creative" },
      { value: "production", label: "Production" },
    ],
    entityTypes: ["project"],
  },
  {
    field: "assetCount",
    label: "Asset Count",
    type: "number_range",
    operators: ["gt", "lt", "between"],
    entityTypes: ["project"],
  },
  {
    field: "budgetRange",
    label: "Budget Range",
    type: "number_range",
    operators: ["gt", "lt", "between"],
    entityTypes: ["project"],
  },

  // --- Task ---
  {
    field: "assignee",
    label: "Assignee",
    type: "multi_select",
    operators: ["is", "is_not"],
    options: [
      { value: "john-doe", label: "John Doe" },
      { value: "sarah-chen", label: "Sarah Chen" },
      { value: "emily-rodriguez", label: "Emily Rodriguez" },
      { value: "mike-chen", label: "Mike Chen" },
    ],
    entityTypes: ["task"],
  },
  {
    field: "priority",
    label: "Priority",
    type: "select",
    operators: ["is", "is_not"],
    options: [
      { value: "low", label: "Low", color: "gray" },
      { value: "medium", label: "Medium", color: "blue" },
      { value: "high", label: "High", color: "orange" },
      { value: "urgent", label: "Urgent", color: "red" },
    ],
    entityTypes: ["task"],
  },
  {
    field: "taskStatus",
    label: "Task Status",
    type: "select",
    operators: ["is", "is_not"],
    options: [
      { value: "to_do", label: "To Do", color: "gray" },
      { value: "in_progress", label: "In Progress", color: "blue" },
      { value: "in_review", label: "In Review", color: "yellow" },
      { value: "done", label: "Done", color: "green" },
      { value: "blocked", label: "Blocked", color: "red" },
    ],
    entityTypes: ["task"],
  },
  {
    field: "dueDate",
    label: "Due Date",
    type: "date_range",
    operators: ["before", "after", "between"],
    entityTypes: ["task"],
  },
  {
    field: "hasWorkflow",
    label: "Has Workflow",
    type: "boolean",
    operators: ["is"],
    options: [
      { value: "true", label: "Yes" },
      { value: "false", label: "No" },
    ],
    entityTypes: ["task"],
  },
  {
    field: "workflowStepType",
    label: "Workflow Step Type",
    type: "multi_select",
    operators: ["is", "is_not"],
    options: [
      { value: "image_generation", label: "Image Gen" },
      { value: "video_generation", label: "Video Gen" },
      { value: "voice_audio", label: "Voice" },
      { value: "text_script", label: "Text" },
      { value: "enhancement", label: "Enhancement" },
      { value: "review_approval", label: "Review" },
    ],
    entityTypes: ["task"],
  },

  // --- Workflow ---
  {
    field: "category",
    label: "Category",
    type: "select",
    operators: ["is", "is_not"],
    options: [
      { value: "video", label: "Video" },
      { value: "image", label: "Image" },
      { value: "audio", label: "Audio" },
      { value: "mixed", label: "Mixed" },
      { value: "text", label: "Text" },
      { value: "custom", label: "Custom" },
    ],
    entityTypes: ["workflow"],
  },
  {
    field: "complianceLevel",
    label: "Compliance Level",
    type: "select",
    operators: ["is", "is_not"],
    options: [
      { value: "standard", label: "Standard" },
      { value: "elevated", label: "Elevated" },
      { value: "strict", label: "Strict" },
    ],
    entityTypes: ["workflow"],
  },
  {
    field: "isSystemTemplate",
    label: "Is System Template",
    type: "boolean",
    operators: ["is"],
    options: [
      { value: "true", label: "Yes" },
      { value: "false", label: "No" },
    ],
    entityTypes: ["workflow"],
  },
  {
    field: "toolTypesUsed",
    label: "Tool Types Used",
    type: "multi_select",
    operators: ["is", "is_not"],
    options: [
      { value: "image_generation", label: "Image Generation" },
      { value: "video_generation", label: "Video Generation" },
      { value: "voice_audio", label: "Voice & Audio" },
      { value: "text_script", label: "Text & Script" },
      { value: "enhancement", label: "Enhancement" },
    ],
    entityTypes: ["workflow"],
  },

  // --- Talent ---
  {
    field: "contractStatus",
    label: "Contract Status",
    type: "select",
    operators: ["is", "is_not"],
    options: [
      { value: "active", label: "Active", color: "green" },
      { value: "expired", label: "Expired", color: "gray" },
      { value: "pending", label: "Pending", color: "yellow" },
      { value: "none", label: "None", color: "gray" },
    ],
    entityTypes: ["talent"],
  },
  {
    field: "rightsType",
    label: "Rights Type",
    type: "multi_select",
    operators: ["is", "is_not"],
    options: [
      { value: "name", label: "Name" },
      { value: "image", label: "Image" },
      { value: "likeness", label: "Likeness" },
      { value: "performance", label: "Performance (NILP)" },
    ],
    entityTypes: ["talent"],
  },
  {
    field: "exclusivity",
    label: "Exclusivity",
    type: "select",
    operators: ["is", "is_not"],
    options: [
      { value: "exclusive", label: "Exclusive" },
      { value: "non_exclusive", label: "Non-Exclusive" },
    ],
    entityTypes: ["talent"],
  },

  // --- Compliance ---
  {
    field: "severity",
    label: "Severity",
    type: "select",
    operators: ["is", "is_not"],
    options: [
      { value: "low", label: "Low", color: "blue" },
      { value: "medium", label: "Medium", color: "yellow" },
      { value: "high", label: "High", color: "orange" },
      { value: "critical", label: "Critical", color: "red" },
    ],
    entityTypes: ["compliance"],
  },
  {
    field: "alertType",
    label: "Alert Type",
    type: "select",
    operators: ["is", "is_not"],
    options: [
      { value: "ip_risk", label: "IP Risk" },
      { value: "license_violation", label: "License Violation" },
      { value: "provenance_gap", label: "Provenance Gap" },
      { value: "consent_missing", label: "Consent Missing" },
    ],
    entityTypes: ["compliance"],
  },
  {
    field: "resolutionStatus",
    label: "Resolution Status",
    type: "select",
    operators: ["is", "is_not"],
    options: [
      { value: "open", label: "Open", color: "red" },
      { value: "in_progress", label: "In Progress", color: "yellow" },
      { value: "resolved", label: "Resolved", color: "green" },
      { value: "dismissed", label: "Dismissed", color: "gray" },
    ],
    entityTypes: ["compliance"],
  },

  // --- Contract ---
  {
    field: "contractType",
    label: "Contract Type",
    type: "select",
    operators: ["is", "is_not"],
    options: [
      { value: "license", label: "License" },
      { value: "assignment", label: "Assignment" },
      { value: "employment", label: "Employment" },
      { value: "collaboration", label: "Collaboration" },
    ],
    entityTypes: ["contract"],
  },
  {
    field: "expiration",
    label: "Expiration",
    type: "date_range",
    operators: ["before", "after", "between"],
    entityTypes: ["contract"],
  },
  {
    field: "valueRange",
    label: "Value Range",
    type: "number_range",
    operators: ["gt", "lt", "between"],
    entityTypes: ["contract"],
  },
  {
    field: "exclusivity",
    label: "Exclusivity",
    type: "boolean",
    operators: ["is"],
    options: [
      { value: "true", label: "Exclusive" },
      { value: "false", label: "Non-Exclusive" },
    ],
    entityTypes: ["contract"],
  },

  // --- Insurance ---
  {
    field: "riskLevel",
    label: "Risk Level",
    type: "select",
    operators: ["is", "is_not"],
    options: [
      { value: "low", label: "Low", color: "green" },
      { value: "moderate", label: "Moderate", color: "yellow" },
      { value: "high", label: "High", color: "orange" },
      { value: "critical", label: "Critical", color: "red" },
    ],
    entityTypes: ["insurance"],
  },
  {
    field: "coverageType",
    label: "Coverage Type",
    type: "select",
    operators: ["is", "is_not"],
    options: [
      { value: "ip_indemnity", label: "IP Indemnity" },
      { value: "e_and_o", label: "E&O" },
      { value: "general_liability", label: "General Liability" },
    ],
    entityTypes: ["insurance"],
  },
  {
    field: "policyStatus",
    label: "Policy Status",
    type: "select",
    operators: ["is", "is_not"],
    options: [
      { value: "active", label: "Active", color: "green" },
      { value: "expired", label: "Expired", color: "gray" },
      { value: "pending", label: "Pending", color: "yellow" },
      { value: "cancelled", label: "Cancelled", color: "red" },
    ],
    entityTypes: ["insurance"],
  },
];

/** Get filter definitions for a given entity type (or all). */
export function getFiltersForEntityType(
  entityType: SearchEntityType | "all"
): FilterDefinition[] {
  if (entityType === "all") {
    return SEARCH_FILTER_DEFINITIONS;
  }
  return SEARCH_FILTER_DEFINITIONS.filter((f) =>
    f.entityTypes.includes(entityType)
  );
}
