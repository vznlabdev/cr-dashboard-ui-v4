"use client"

import { useFormContext } from "react-hook-form"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
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
import { ChevronDown } from "lucide-react"
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
    <Collapsible defaultOpen className="border rounded-lg">
      <CollapsibleTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          className="flex items-center justify-between w-full px-4 py-3 hover:bg-muted/50 rounded-t-lg"
        >
          <span className="text-sm font-medium">Distribution & Compliance</span>
          <ChevronDown className="h-4 w-4 text-muted-foreground data-[state=open]:rotate-180 transition-transform" />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="px-4 pb-4 pt-1 space-y-4">
          <FormField
            control={form.control}
            name="distribution.primary_use"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Primary Use</FormLabel>
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
                    <div className="flex items-center gap-2 mb-2">
                      <FormLabel className="mb-0">US States</FormLabel>
                      <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer">
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
                    </div>
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-32 overflow-y-auto p-2 border rounded-md bg-muted/30">
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
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="distribution.countries"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>International Markets</FormLabel>
                    <div className="flex flex-wrap gap-2 p-2 border rounded-md bg-muted/30">
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
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="distribution.platforms"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Platforms</FormLabel>
                    <div className="flex flex-wrap gap-2 p-2 border rounded-md bg-muted/30">
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
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="distribution.start_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Campaign Start Date</FormLabel>
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
                      <FormLabel>Campaign End Date (optional)</FormLabel>
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
            </>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}
