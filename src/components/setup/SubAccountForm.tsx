"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Trash2, Building2 } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"

interface SubAccount {
  id: string
  name: string
  parentId: string
  inheritPermissions: boolean
}

interface SubAccountFormProps {
  onSave: (accounts: SubAccount[]) => void
  onSkip?: () => void
}

export function SubAccountForm({ onSave, onSkip }: SubAccountFormProps) {
  const [subAccounts, setSubAccounts] = useState<SubAccount[]>([])
  const [newAccountName, setNewAccountName] = useState("")
  const [selectedParent, setSelectedParent] = useState("main")
  const [inheritPermissions, setInheritPermissions] = useState(true)

  const handleAddAccount = () => {
    if (!newAccountName.trim()) return

    const newAccount: SubAccount = {
      id: `sub-${Date.now()}`,
      name: newAccountName,
      parentId: selectedParent,
      inheritPermissions,
    }

    setSubAccounts((prev) => [...prev, newAccount])
    setNewAccountName("")
    setSelectedParent("main")
    setInheritPermissions(true)
  }

  const handleRemoveAccount = (id: string) => {
    setSubAccounts((prev) => prev.filter((account) => account.id !== id))
  }

  const handleSave = () => {
    onSave(subAccounts)
  }

  const getParentOptions = () => {
    return [
      { id: "main", name: "Main Company" },
      ...subAccounts.map((account) => ({ id: account.id, name: account.name })),
    ]
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Add Sub-Company Account</CardTitle>
          <CardDescription>
            Create sub-accounts for departments, divisions, or subsidiaries
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Account Name */}
          <div className="space-y-2">
            <Label htmlFor="accountName">Account Name</Label>
            <Input
              id="accountName"
              value={newAccountName}
              onChange={(e) => setNewAccountName(e.target.value)}
              placeholder="e.g., Marketing Division, West Coast Office"
            />
          </div>

          {/* Parent Account */}
          <div className="space-y-2">
            <Label htmlFor="parentAccount">Parent Account</Label>
            <Select value={selectedParent} onValueChange={setSelectedParent}>
              <SelectTrigger id="parentAccount">
                <SelectValue placeholder="Select parent account" />
              </SelectTrigger>
              <SelectContent>
                {getParentOptions().map((option) => (
                  <SelectItem key={option.id} value={option.id}>
                    {option.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Inherit Permissions */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="inheritPermissions"
              checked={inheritPermissions}
              onCheckedChange={(checked) => setInheritPermissions(checked === true)}
            />
            <Label
              htmlFor="inheritPermissions"
              className="text-sm font-normal cursor-pointer"
            >
              Inherit permissions from parent account
            </Label>
          </div>

          {/* Add Button */}
          <Button
            type="button"
            variant="outline"
            onClick={handleAddAccount}
            disabled={!newAccountName.trim()}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Sub-Account
          </Button>
        </CardContent>
      </Card>

      {/* Sub-Accounts List */}
      {subAccounts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Sub-Accounts ({subAccounts.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {subAccounts.map((account) => {
              const parent = getParentOptions().find((opt) => opt.id === account.parentId)
              return (
                <div
                  key={account.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{account.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Parent: {parent?.name}
                        {account.inheritPermissions && " • Inherits permissions"}
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveAccount(account.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )
            })}
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex justify-between pt-4">
        {onSkip && (
          <Button type="button" variant="ghost" onClick={onSkip}>
            Skip for now
          </Button>
        )}
        <Button onClick={handleSave} className="ml-auto">
          {subAccounts.length > 0 ? "Save Sub-Accounts" : "Continue Without Sub-Accounts"}
        </Button>
      </div>
    </div>
  )
}
