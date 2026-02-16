"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Search, ChevronLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import type {
  FilterDefinition,
  SearchFilter,
  SearchEntityType,
} from "@/types/search";

const ENTITY_LABELS: Record<SearchEntityType, string> = {
  asset: "Asset",
  project: "Project",
  task: "Task",
  workflow: "Workflow",
  storyboard: "Storyboard",
  brand: "Brand",
  talent: "Talent",
  team_member: "Team",
  compliance: "Compliance",
  contract: "Contract",
  insurance: "Insurance",
};

function getEntityHint(def: FilterDefinition): string | null {
  if (def.entityTypes.length >= 10) return null;
  const first = def.entityTypes[0];
  return ENTITY_LABELS[first] ?? null;
}

export interface FilterDropdownProps {
  availableFilters: FilterDefinition[];
  onApply: (filter: SearchFilter) => void;
  onClose: () => void;
}

type Stage = "field" | "value";

export function FilterDropdown({
  availableFilters,
  onApply,
  onClose,
}: FilterDropdownProps) {
  const [stage, setStage] = useState<Stage>("field");
  const [fieldSearch, setFieldSearch] = useState("");
  const [selectedDef, setSelectedDef] = useState<FilterDefinition | null>(null);
  const [valueSearch, setValueSearch] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Value state by type
  const [selectValues, setSelectValues] = useState<string[]>([]);
  const [dateMode, setDateMode] = useState<"before" | "after" | "between">("after");
  const [dateValue, setDateValue] = useState("");
  const [dateStart, setDateStart] = useState("");
  const [dateEnd, setDateEnd] = useState("");
  const [numberMin, setNumberMin] = useState("");
  const [numberMax, setNumberMax] = useState("");
  const [boolValue, setBoolValue] = useState<boolean | null>(null);
  const [textValue, setTextValue] = useState("");

  const filteredFields = useMemo(() => {
    const q = fieldSearch.toLowerCase().trim();
    if (!q) return availableFilters;
    return availableFilters.filter(
      (f) => f.label.toLowerCase().includes(q) || f.field.toLowerCase().includes(q)
    );
  }, [availableFilters, fieldSearch]);

  const filteredOptions = useMemo(() => {
    if (!selectedDef?.options) return [];
    const q = valueSearch.toLowerCase().trim();
    if (!q) return selectedDef.options;
    return selectedDef.options.filter(
      (o) =>
        o.label.toLowerCase().includes(q) || o.value.toLowerCase().includes(q)
    );
  }, [selectedDef, valueSearch]);

  const goBack = useCallback(() => {
    setStage("field");
    setSelectedDef(null);
    setValueSearch("");
    setSelectValues([]);
    setDateValue("");
    setDateStart("");
    setDateEnd("");
    setNumberMin("");
    setNumberMax("");
    setBoolValue(null);
    setTextValue("");
    setSelectedIndex(0);
  }, []);

  const selectField = useCallback((def: FilterDefinition) => {
    setSelectedDef(def);
    setStage("value");
    setValueSearch("");
    setSelectValues([]);
    setBoolValue(null);
    setSelectedIndex(0);
  }, []);

  const handleApply = useCallback(() => {
    if (!selectedDef) return;
    const id = `filter-${selectedDef.field}-${Date.now()}`;
    const operator = selectedDef.operators[0] ?? "is";

    if (
      selectedDef.type === "select" ||
      selectedDef.type === "multi_select"
    ) {
      const value =
        selectedDef.type === "multi_select"
          ? selectValues
          : selectValues[0] ?? "";
      const option = selectedDef.options?.find((o) =>
        Array.isArray(value) ? value.includes(o.value) : o.value === value
      );
      const label = option?.label ?? (Array.isArray(value) ? `${value.length} selected` : String(value));
      onApply({ id, field: selectedDef.field, operator, value, label });
    } else if (
      selectedDef.type === "date" ||
      selectedDef.type === "date_range"
    ) {
      if (dateMode === "between") {
        const value: [string, string] = [dateStart, dateEnd];
        onApply({
          id,
          field: selectedDef.field,
          operator: "between",
          value,
          label: `${dateStart || "…"} – ${dateEnd || "…"}`,
        });
      } else {
        const val = dateMode === "before" ? dateValue : dateValue;
        onApply({
          id,
          field: selectedDef.field,
          operator: dateMode === "before" ? "before" : "after",
          value: val,
          label: val || (dateMode === "before" ? "Before date" : "After date"),
        });
      }
    } else if (selectedDef.type === "number_range") {
      const minNum = numberMin === "" ? undefined : Number(numberMin);
      const maxNum = numberMax === "" ? undefined : Number(numberMax);
      const label =
        minNum != null && maxNum != null
          ? `${minNum} – ${maxNum}`
          : minNum != null
            ? `≥ ${minNum}`
            : maxNum != null
              ? `≤ ${maxNum}`
              : "Range";
      onApply({
        id,
        field: selectedDef.field,
        operator: "between",
        value: [String(minNum ?? 0), String(maxNum ?? 100)],
        label,
      });
    } else if (selectedDef.type === "boolean") {
      if (boolValue === null) return;
      onApply({
        id,
        field: selectedDef.field,
        operator: "is",
        value: String(boolValue),
        label: boolValue ? "Yes" : "No",
      });
    } else if (selectedDef.type === "text") {
      const val = textValue.trim();
      if (!val) return;
      onApply({
        id,
        field: selectedDef.field,
        operator: "contains",
        value: val,
        label: val.length > 20 ? `${val.slice(0, 20)}…` : val,
      });
    }
    onClose();
  }, [
    selectedDef,
    selectValues,
    dateMode,
    dateValue,
    dateStart,
    dateEnd,
    numberMin,
    numberMax,
    boolValue,
    textValue,
    onApply,
    onClose,
  ]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (stage === "value") goBack();
        else onClose();
        e.preventDefault();
      }
      if (stage === "field") {
        if (e.key === "ArrowDown")
          setSelectedIndex((i) => Math.min(i + 1, filteredFields.length - 1));
        if (e.key === "ArrowUp") setSelectedIndex((i) => Math.max(i - 1, 0));
        if (e.key === "Enter" && filteredFields[selectedIndex]) {
          selectField(filteredFields[selectedIndex]);
          e.preventDefault();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [stage, selectedIndex, filteredFields, goBack, onClose, selectField]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [fieldSearch]);

  if (stage === "field") {
    return (
      <div className="flex w-72 flex-col gap-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search filters..."
            value={fieldSearch}
            onChange={(e) => setFieldSearch(e.target.value)}
            className="pl-8"
            autoFocus
          />
        </div>
        <ul className="max-h-64 overflow-y-auto">
          {filteredFields.map((def, i) => {
            const hint = getEntityHint(def);
            return (
              <li key={def.field}>
                <button
                  type="button"
                  onClick={() => selectField(def)}
                  className={cn(
                    "flex w-full items-center justify-between gap-2 px-2 py-2 text-left text-sm hover:bg-muted/60 rounded-md",
                    i === selectedIndex && "bg-muted/60"
                  )}
                >
                  <span>{def.label}</span>
                  {hint && (
                    <span className="text-xs text-muted-foreground">
                      ({hint})
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    );
  }

  if (!selectedDef) return null;

  const isSelect = selectedDef.type === "select" || selectedDef.type === "multi_select";
  const isDate = selectedDef.type === "date" || selectedDef.type === "date_range";
  const isNumberRange = selectedDef.type === "number_range";
  const isBoolean = selectedDef.type === "boolean";
  const isText = selectedDef.type === "text";

  return (
    <div className="flex w-72 flex-col gap-3">
      <button
        type="button"
        onClick={goBack}
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" />
        {selectedDef.label}
      </button>

      {isSelect && (
        <>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={valueSearch}
              onChange={(e) => setValueSearch(e.target.value)}
              className="pl-8"
            />
          </div>
          <ul className="max-h-48 overflow-y-auto space-y-1">
            {filteredOptions.map((opt) => {
              const isMulti = selectedDef.type === "multi_select";
              const checked = selectValues.includes(opt.value);
              return (
                <li key={opt.value}>
                  <label className="flex items-center gap-2 cursor-pointer rounded-md px-2 py-1.5 hover:bg-muted/60 text-sm">
                    {isMulti ? (
                      <Checkbox
                        checked={checked}
                        onCheckedChange={(c) => {
                          setSelectValues((prev) =>
                            c ? [...prev, opt.value] : prev.filter((v) => v !== opt.value)
                          );
                        }}
                      />
                    ) : (
                      <input
                        type="radio"
                        name={selectedDef.field}
                        checked={selectValues[0] === opt.value}
                        onChange={() => setSelectValues([opt.value])}
                        className="h-4 w-4"
                      />
                    )}
                    {opt.label}
                  </label>
                </li>
              );
            })}
          </ul>
        </>
      )}

      {isDate && (
        <>
          <div className="space-y-2">
            {(["after", "before", "between"] as const).map((mode) => (
              <label key={mode} className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="dateMode"
                  checked={dateMode === mode}
                  onChange={() => setDateMode(mode)}
                  className="h-4 w-4"
                />
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </label>
            ))}
          </div>
          {dateMode === "between" ? (
            <div className="flex gap-2">
              <Input
                type="date"
                value={dateStart}
                onChange={(e) => setDateStart(e.target.value)}
                className="text-sm"
              />
              <Input
                type="date"
                value={dateEnd}
                onChange={(e) => setDateEnd(e.target.value)}
                className="text-sm"
              />
            </div>
          ) : (
            <Input
              type="date"
              value={dateValue}
              onChange={(e) => setDateValue(e.target.value)}
              className="text-sm"
            />
          )}
          <div className="border-t pt-2 text-xs text-muted-foreground">
            Quick picks
          </div>
          <div className="flex flex-wrap gap-1">
            {["Today", "Last 7 days", "Last 30 days", "This month", "This quarter"].map(
              (label) => (
                <Button
                  key={label}
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => {
                    const today = new Date();
                    if (label === "Today") {
                      setDateMode("after");
                      setDateValue(today.toISOString().slice(0, 10));
                    } else if (label === "Last 7 days") {
                      setDateMode("between");
                      const d = new Date(today);
                      d.setDate(d.getDate() - 7);
                      setDateStart(d.toISOString().slice(0, 10));
                      setDateEnd(today.toISOString().slice(0, 10));
                    } else if (label === "Last 30 days") {
                      setDateMode("between");
                      const d = new Date(today);
                      d.setDate(d.getDate() - 30);
                      setDateStart(d.toISOString().slice(0, 10));
                      setDateEnd(today.toISOString().slice(0, 10));
                    }
                  }}
                >
                  {label}
                </Button>
              )
            )}
          </div>
        </>
      )}

      {isNumberRange && (
        <>
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="text-xs text-muted-foreground">Min</label>
              <Input
                type="number"
                min={0}
                max={100}
                value={numberMin}
                onChange={(e) => setNumberMin(e.target.value)}
                placeholder="0"
                className="mt-0.5"
              />
            </div>
            <div className="flex-1">
              <label className="text-xs text-muted-foreground">Max</label>
              <Input
                type="number"
                min={0}
                max={100}
                value={numberMax}
                onChange={(e) => setNumberMax(e.target.value)}
                placeholder="100"
                className="mt-0.5"
              />
            </div>
          </div>
          {selectedDef.field === "aclarScore" && (
            <>
              <div className="border-t pt-2 text-xs text-muted-foreground">
                Quick picks
              </div>
              <div className="flex flex-wrap gap-1">
                {[
                  { label: "High (80-100)", min: 80, max: 100 },
                  { label: "Medium (50-79)", min: 50, max: 79 },
                  { label: "Low (0-49)", min: 0, max: 49 },
                ].map(({ label, min, max }) => (
                  <Button
                    key={label}
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => {
                      setNumberMin(String(min));
                      setNumberMax(String(max));
                    }}
                  >
                    {label}
                  </Button>
                ))}
              </div>
            </>
          )}
        </>
      )}

      {isBoolean && (
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              name="bool"
              checked={boolValue === true}
              onChange={() => setBoolValue(true)}
              className="h-4 w-4"
            />
            Yes
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              name="bool"
              checked={boolValue === false}
              onChange={() => setBoolValue(false)}
              className="h-4 w-4"
            />
            No
          </label>
        </div>
      )}

      {isText && (
        <Input
          placeholder="Enter value..."
          value={textValue}
          onChange={(e) => setTextValue(e.target.value)}
          className="text-sm"
        />
      )}

      <Button
        type="button"
        className="mt-2 w-full"
        onClick={handleApply}
        disabled={
          (isSelect && selectValues.length === 0) ||
          (isBoolean && boolValue === null) ||
          (isText && !textValue.trim()) ||
          (isDate &&
            ((dateMode === "between" && !dateStart && !dateEnd) ||
              (dateMode !== "between" && !dateValue)))
        }
      >
        Apply
      </Button>
    </div>
  );
}
