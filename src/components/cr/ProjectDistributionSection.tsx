"use client"

import { useFormContext } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import type { ProjectDistributionPrimaryUse } from "@/types"

const PRIMARY_USE_OPTIONS: { value: ProjectDistributionPrimaryUse; label: string }[] = [
  { value: "advertising", label: "Advertising" },
  { value: "editorial", label: "Editorial" },
  { value: "entertainment", label: "Entertainment" },
  { value: "internal", label: "Internal" },
]

const US_STATES = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
  "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
  "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
  "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
  "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY", "DC",
]

const INTERNATIONAL_MARKETS = [
  { value: "UK", label: "United Kingdom" },
  { value: "EU", label: "European Union" },
  { value: "CA", label: "Canada" },
  { value: "AU", label: "Australia" },
  { value: "JP", label: "Japan" },
  { value: "BR", label: "Brazil" },
  { value: "IN", label: "India" },
]

const PLATFORMS = [
  "Meta",
  "Google Ads",
  "TikTok",
  "LinkedIn",
  "TV",
  "Print",
]

export type DistributionFormValues = {
  distribution?: {
    primary_use: ProjectDistributionPrimaryUse
    us_states: string[]
    countries: string[]
    platforms: string[]
    start_date: string
    end_date?: string
  } | null
}

interface ProjectDistributionSectionProps {
  disabled?: boolean
}

export function ProjectDistributionSection({ disabled }: ProjectDistributionSectionProps) {
  const form = useFormContext<DistributionFormValues>()
  const primaryUse = form.watch("distribution.primary_use")

  return (
    <div>
      <FormField
        control={form.control}
        name="distribution.primary_use"
        render={({ field }) => (
          <FormItem>
            <div className="flex items-start gap-3 py-2.5">
              <div className="w-32 flex-shrink-0 pt-2">
                <FormLabel className="text-sm font-medium">Distribution</FormLabel>
              </div>
              <div className="flex-1">
                <Select
                  disabled={disabled}
                  value={field.value ?? ""}
                  onValueChange={(v) => field.onChange(v as ProjectDistributionPrimaryUse)}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select primary use" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {PRIMARY_USE_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </div>
            </div>
          </FormItem>
        )}
      />

      {primaryUse === "advertising" && (
        <>
          <FormField
            control={form.control}
            name="distribution.us_states"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-start gap-3 py-2.5">
                  <div className="w-32 flex-shrink-0 pt-2">
                    <FormLabel className="text-sm font-medium">US States</FormLabel>
                  </div>
                  <div className="flex-1 space-y-2">
                    <label className="flex items-center gap-1.5 text-sm text-muted-foreground cursor-pointer">
                      <Checkbox
                        checked={field.value?.includes("ALL") ?? false}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            field.onChange(["ALL"])
                          } else {
                            field.onChange([])
                          }
                        }}
                        disabled={disabled}
                      />
                      All US States
                    </label>
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-32 overflow-y-auto py-1">
                      {US_STATES.map((code) => (
                        <label
                          key={code}
                          className="flex items-center gap-1.5 text-xs cursor-pointer"
                        >
                          <Checkbox
                            checked={
                              field.value?.includes("ALL")
                                ? true
                                : field.value?.includes(code) ?? false
                            }
                            disabled={disabled || (field.value?.includes("ALL") ?? false)}
                            onCheckedChange={(checked) => {
                              const current = field.value ?? []
                              if (current.includes("ALL")) return
                              if (checked) {
                                field.onChange([...current, code])
                              } else {
                                field.onChange(current.filter((c) => c !== code))
                              }
                            }}
                          />
                          {code}
                        </label>
                      ))}
                    </div>
                    <FormMessage />
                  </div>
                </div>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="distribution.countries"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-start gap-3 py-2.5">
                  <div className="w-32 flex-shrink-0 pt-2">
                    <FormLabel className="text-sm font-medium">International Markets</FormLabel>
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap gap-2 py-1">
                      {INTERNATIONAL_MARKETS.map(({ value, label }) => (
                        <label
                          key={value}
                          className="flex items-center gap-1.5 text-sm cursor-pointer"
                        >
                          <Checkbox
                            checked={field.value?.includes(value) ?? false}
                            disabled={disabled}
                            onCheckedChange={(checked) => {
                              const current = field.value ?? []
                              if (checked) {
                                field.onChange([...current, value])
                              } else {
                                field.onChange(current.filter((c) => c !== value))
                              }
                            }}
                          />
                          {label}
                        </label>
                      ))}
                    </div>
                    <FormMessage />
                  </div>
                </div>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="distribution.platforms"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-start gap-3 py-2.5">
                  <div className="w-32 flex-shrink-0 pt-2">
                    <FormLabel className="text-sm font-medium">Platforms</FormLabel>
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap gap-2 py-1">
                      {PLATFORMS.map((name) => (
                        <label
                          key={name}
                          className="flex items-center gap-1.5 text-sm cursor-pointer"
                        >
                          <Checkbox
                            checked={field.value?.includes(name) ?? false}
                            disabled={disabled}
                            onCheckedChange={(checked) => {
                              const current = field.value ?? []
                              if (checked) {
                                field.onChange([...current, name])
                              } else {
                                field.onChange(current.filter((c) => c !== name))
                              }
                            }}
                          />
                          {name}
                        </label>
                      ))}
                    </div>
                    <FormMessage />
                  </div>
                </div>
              </FormItem>
            )}
          />

          <div className="flex items-start gap-3 py-2.5">
            <div className="w-32 flex-shrink-0 pt-2">
              <FormLabel className="text-sm font-medium">Campaign dates</FormLabel>
            </div>
            <div className="flex-1 grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="distribution.start_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs text-muted-foreground">Start</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        disabled={disabled}
                        value={field.value ?? ""}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="distribution.end_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs text-muted-foreground">End (optional)</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        disabled={disabled}
                        value={field.value ?? ""}
                        onChange={(e) => field.onChange(e.target.value || undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </>
      )}
    </div>
  )
}
