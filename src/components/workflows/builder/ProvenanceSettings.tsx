"use client";

import { useCallback } from "react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";
import { cn } from "@/lib/utils";

export type ProvenanceSettingsLevel = "step" | "workflow";

export type ProvenanceComplianceLevel = "standard" | "elevated" | "strict";

export interface ProvenanceSettingsData {
  requireExtension: boolean;
  requireModelVersionLog: boolean;
  requireManualEntry: boolean;
  capturePrompts: boolean;
  captureOutputHashes: boolean;
  captureTokenUsage?: boolean;
  generateCertificateOnCompletion?: boolean;
  complianceLevel?: ProvenanceComplianceLevel;
}

const COMPLIANCE_OPTIONS: {
  value: ProvenanceComplianceLevel;
  label: string;
  description: string;
}[] = [
  {
    value: "standard",
    label: "Standard",
    description: "Extension recommended, model logging required",
  },
  {
    value: "elevated",
    label: "Elevated",
    description: "Extension required, all captures on, human review gate",
  },
  {
    value: "strict",
    label: "Strict",
    description: "Extension required, all captures on, legal review gate, insurance policy must be active",
  },
];

interface ProvenanceSettingsProps {
  settings: ProvenanceSettingsData;
  onChange: (settings: ProvenanceSettingsData) => void;
  level: ProvenanceSettingsLevel;
}

function ToggleRow({
  id,
  label,
  hint,
  checked,
  onCheckedChange,
  disabled,
}: {
  id: string;
  label: string;
  hint?: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-1.5">
      <div className="min-w-0">
        <Label
          htmlFor={id}
          className={cn(
            "text-sm font-normal cursor-pointer",
            disabled && "text-muted-foreground cursor-not-allowed"
          )}
        >
          {label}
        </Label>
        {hint && (
          <p className="text-[11px] text-muted-foreground mt-0.5">{hint}</p>
        )}
      </div>
      <Switch
        id={id}
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        className="shrink-0"
      />
    </div>
  );
}

export function ProvenanceSettings({
  settings,
  onChange,
  level,
}: ProvenanceSettingsProps) {
  const update = useCallback(
    (updates: Partial<ProvenanceSettingsData>) => {
      onChange({ ...settings, ...updates });
    },
    [settings, onChange]
  );

  const isWorkflow = level === "workflow";

  return (
    <div className="space-y-4">
      <Alert className="py-2.5 px-3 border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/20">
        <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        <AlertDescription className="text-xs text-muted-foreground pl-6">
          Provenance data feeds into your ACLAR risk assessment and insurance
          underwriting reports. Higher compliance levels provide more granular
          audit trails.
        </AlertDescription>
      </Alert>

      {/* Extension & logging */}
      <div className="space-y-0">
        <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide mb-1.5">
          Extension & logging
        </p>
        <div className="space-y-0 rounded-md border border-border bg-muted/20 p-2">
          <ToggleRow
            id="provenance-extension"
            label={
              isWorkflow
                ? "Require browser extension active (default for new steps)"
                : "Require browser extension active during this step"
            }
            checked={settings.requireExtension}
            onCheckedChange={(c) => update({ requireExtension: c })}
          />
          <ToggleRow
            id="provenance-model-log"
            label="Log model version used"
            checked={settings.requireModelVersionLog}
            onCheckedChange={(c) => update({ requireModelVersionLog: c })}
          />
          <ToggleRow
            id="provenance-manual"
            label="Require manual provenance entry if extension is off"
            checked={settings.requireManualEntry}
            onCheckedChange={(c) => update({ requireManualEntry: c })}
          />
        </div>
      </div>

      {/* Auto capture (extension) */}
      <div className="space-y-0">
        <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide mb-1.5">
          Auto capture
        </p>
        <div className="space-y-0 rounded-md border border-border bg-muted/20 p-2">
          <ToggleRow
            id="provenance-prompts"
            label="Capture prompts and inputs"
            hint="Auto via extension"
            checked={settings.capturePrompts}
            onCheckedChange={(c) => update({ capturePrompts: c })}
          />
          <ToggleRow
            id="provenance-hashes"
            label="Hash outputs for verification"
            hint="Auto via extension"
            checked={settings.captureOutputHashes}
            onCheckedChange={(c) => update({ captureOutputHashes: c })}
          />
        </div>
      </div>

      {isWorkflow && (
        <>
          {/* Certificate & usage */}
          <div className="space-y-0">
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide mb-1.5">
              Certificate & usage
            </p>
            <div className="space-y-0 rounded-md border border-border bg-muted/20 p-2">
              <ToggleRow
                id="provenance-certificate"
                label="Generate provenance certificate on completion"
                checked={settings.generateCertificateOnCompletion ?? false}
                onCheckedChange={(c) =>
                  update({ generateCertificateOnCompletion: c })
                }
              />
              <ToggleRow
                id="provenance-token-usage"
                label="Capture token/credit usage per step"
                checked={settings.captureTokenUsage ?? false}
                onCheckedChange={(c) => update({ captureTokenUsage: c })}
              />
            </div>
          </div>

          {/* Compliance level */}
          <div className="space-y-1.5">
            <Label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
              Compliance level
            </Label>
            <Select
              value={settings.complianceLevel ?? "standard"}
              onValueChange={(v) =>
                update({
                  complianceLevel: v as ProvenanceComplianceLevel,
                })
              }
            >
              <SelectTrigger className="h-9 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {COMPLIANCE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-[11px] text-muted-foreground mt-1">
              {COMPLIANCE_OPTIONS.find(
                (o) => o.value === (settings.complianceLevel ?? "standard")
              )?.description}
            </p>
          </div>
        </>
      )}
    </div>
  );
}
