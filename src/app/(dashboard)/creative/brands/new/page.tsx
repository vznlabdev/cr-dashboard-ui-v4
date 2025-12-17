"use client"

import { useRouter } from "next/navigation"
import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  Plus,
  X,
  Upload,
  Palette,
  Type,
  Image as ImageIcon,
  Target,
  Heart,
  Lightbulb,
} from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface ColorInput {
  id: string
  name: string
  hex: string
  type: "primary" | "secondary" | "accent"
}

interface FontInput {
  id: string
  name: string
  type: "primary" | "secondary"
  usage: string
}

export default function NewBrandPage() {
  const router = useRouter()
  
  // Form state
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [targetAudience, setTargetAudience] = useState("")
  const [mission, setMission] = useState("")
  const [vision, setVision] = useState("")
  const [values, setValues] = useState<string[]>([])
  const [valueInput, setValueInput] = useState("")
  const [personality, setPersonality] = useState<string[]>([])
  const [personalityInput, setPersonalityInput] = useState("")
  const [colors, setColors] = useState<ColorInput[]>([
    { id: "1", name: "Primary", hex: "#3b82f6", type: "primary" },
  ])
  const [fonts, setFonts] = useState<FontInput[]>([])
  
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Add value
  const addValue = () => {
    if (valueInput.trim() && !values.includes(valueInput.trim())) {
      setValues([...values, valueInput.trim()])
      setValueInput("")
    }
  }

  // Remove value
  const removeValue = (value: string) => {
    setValues(values.filter((v) => v !== value))
  }

  // Add personality trait
  const addPersonality = () => {
    if (personalityInput.trim() && !personality.includes(personalityInput.trim())) {
      setPersonality([...personality, personalityInput.trim()])
      setPersonalityInput("")
    }
  }

  // Remove personality trait
  const removePersonality = (trait: string) => {
    setPersonality(personality.filter((p) => p !== trait))
  }

  // Add color
  const addColor = () => {
    const newId = String(colors.length + 1)
    setColors([
      ...colors,
      { id: newId, name: "", hex: "#000000", type: "secondary" },
    ])
  }

  // Update color
  const updateColor = (id: string, field: keyof ColorInput, value: string) => {
    setColors(
      colors.map((c) => (c.id === id ? { ...c, [field]: value } : c))
    )
  }

  // Remove color
  const removeColor = (id: string) => {
    if (colors.length > 1) {
      setColors(colors.filter((c) => c.id !== id))
    }
  }

  // Add font
  const addFont = () => {
    const newId = String(fonts.length + 1)
    setFonts([
      ...fonts,
      { id: newId, name: "", type: fonts.length === 0 ? "primary" : "secondary", usage: "" },
    ])
  }

  // Update font
  const updateFont = (id: string, field: keyof FontInput, value: string) => {
    setFonts(
      fonts.map((f) => (f.id === id ? { ...f, [field]: value } : f))
    )
  }

  // Remove font
  const removeFont = (id: string) => {
    setFonts(fonts.filter((f) => f.id !== id))
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!name.trim()) {
      toast.error("Please enter a brand name")
      return
    }

    setIsSubmitting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    toast.success("Brand created successfully!")
    router.push("/creative/brands")
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => router.push("/creative/brands")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Create New Brand
          </h1>
          <p className="text-muted-foreground mt-1">
            Set up a new brand profile with guidelines and assets
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Basic Information
            </CardTitle>
            <CardDescription>
              Core details about the brand
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Brand Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Acme Corporation"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="targetAudience">Target Audience</Label>
                <Input
                  id="targetAudience"
                  placeholder="e.g., B2B Enterprise, Tech-savvy decision makers"
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe the brand, its purpose, and what it represents..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Brand Identity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-primary" />
              Brand Identity
            </CardTitle>
            <CardDescription>
              Mission, vision, values, and personality
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="mission">Mission Statement</Label>
                <Textarea
                  id="mission"
                  placeholder="What is the brand's purpose?"
                  value={mission}
                  onChange={(e) => setMission(e.target.value)}
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vision">Vision Statement</Label>
                <Textarea
                  id="vision"
                  placeholder="What does the brand aspire to achieve?"
                  value={vision}
                  onChange={(e) => setVision(e.target.value)}
                  rows={2}
                />
              </div>
            </div>

            {/* Values */}
            <div className="space-y-2">
              <Label>Brand Values</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Add a value (e.g., Innovation)"
                  value={valueInput}
                  onChange={(e) => setValueInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      addValue()
                    }
                  }}
                />
                <Button type="button" variant="outline" onClick={addValue}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {values.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {values.map((value) => (
                    <Badge key={value} variant="secondary" className="gap-1">
                      {value}
                      <button
                        type="button"
                        onClick={() => removeValue(value)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Personality */}
            <div className="space-y-2">
              <Label>Brand Personality</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Add a trait (e.g., Professional)"
                  value={personalityInput}
                  onChange={(e) => setPersonalityInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      addPersonality()
                    }
                  }}
                />
                <Button type="button" variant="outline" onClick={addPersonality}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {personality.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {personality.map((trait) => (
                    <Badge key={trait} variant="outline" className="gap-1">
                      {trait}
                      <button
                        type="button"
                        onClick={() => removePersonality(trait)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Colors */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5 text-primary" />
              Color Palette
            </CardTitle>
            <CardDescription>
              Define the brand&apos;s color scheme
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {colors.map((color, index) => (
              <div key={color.id} className="flex items-end gap-3">
                <div className="space-y-2 flex-1">
                  <Label>Color Name</Label>
                  <Input
                    placeholder="e.g., Primary Blue"
                    value={color.name}
                    onChange={(e) => updateColor(color.id, "name", e.target.value)}
                  />
                </div>
                <div className="space-y-2 w-32">
                  <Label>Hex Code</Label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={color.hex}
                      onChange={(e) => updateColor(color.id, "hex", e.target.value)}
                      className="h-10 w-10 rounded border border-border cursor-pointer"
                    />
                    <Input
                      value={color.hex}
                      onChange={(e) => updateColor(color.id, "hex", e.target.value)}
                      className="font-mono text-sm"
                      placeholder="#000000"
                    />
                  </div>
                </div>
                <div className="space-y-2 w-32">
                  <Label>Type</Label>
                  <select
                    value={color.type}
                    onChange={(e) =>
                      updateColor(color.id, "type", e.target.value as "primary" | "secondary" | "accent")
                    }
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="primary">Primary</option>
                    <option value="secondary">Secondary</option>
                    <option value="accent">Accent</option>
                  </select>
                </div>
                {colors.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeColor(color.id)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button type="button" variant="outline" onClick={addColor} className="w-full">
              <Plus className="mr-2 h-4 w-4" />
              Add Color
            </Button>
          </CardContent>
        </Card>

        {/* Typography */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Type className="h-5 w-5 text-primary" />
              Typography
            </CardTitle>
            <CardDescription>
              Define the brand&apos;s fonts and usage guidelines
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {fonts.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <Type className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No fonts added yet</p>
              </div>
            ) : (
              fonts.map((font) => (
                <div key={font.id} className="flex items-end gap-3">
                  <div className="space-y-2 flex-1">
                    <Label>Font Name</Label>
                    <Input
                      placeholder="e.g., Inter"
                      value={font.name}
                      onChange={(e) => updateFont(font.id, "name", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2 w-32">
                    <Label>Type</Label>
                    <select
                      value={font.type}
                      onChange={(e) =>
                        updateFont(font.id, "type", e.target.value as "primary" | "secondary")
                      }
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="primary">Primary</option>
                      <option value="secondary">Secondary</option>
                    </select>
                  </div>
                  <div className="space-y-2 flex-1">
                    <Label>Usage</Label>
                    <Input
                      placeholder="e.g., Headlines and body text"
                      value={font.usage}
                      onChange={(e) => updateFont(font.id, "usage", e.target.value)}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeFont(font.id)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))
            )}
            <Button type="button" variant="outline" onClick={addFont} className="w-full">
              <Plus className="mr-2 h-4 w-4" />
              Add Font
            </Button>
          </CardContent>
        </Card>

        {/* Logo Assets */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-primary" />
              Logo Assets
            </CardTitle>
            <CardDescription>
              Upload logo variations (can be added later)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
              <Upload className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-2">
                Drag and drop logo files here, or click to browse
              </p>
              <p className="text-xs text-muted-foreground">
                SVG, PNG, or PDF up to 10MB
              </p>
              <Button type="button" variant="outline" className="mt-4">
                Browse Files
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/creative/brands")}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create Brand"}
          </Button>
        </div>
      </form>
    </div>
  )
}

