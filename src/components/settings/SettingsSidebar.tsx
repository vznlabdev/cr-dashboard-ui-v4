"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { settingsMenu, searchMenuItems, type SettingsMenuItem } from "@/lib/settings-menu";
import { Input } from "@/components/ui/input";
import { Search, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SettingsSidebarProps {
  className?: string;
  onNavigate?: () => void;
}

export function SettingsSidebar({ className, onNavigate }: SettingsSidebarProps) {
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const searchResults = searchQuery ? searchMenuItems(searchQuery) : [];

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setIsSearching(value.length > 0);
  };

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Back button */}
      <div className="px-4 py-4 border-b">
        <Button
          variant="ghost"
          size="sm"
          asChild
          className="w-full justify-start text-sm font-normal hover:bg-muted"
        >
          <Link href="/dashboard">
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to app
          </Link>
        </Button>
      </div>

      {/* Search */}
      <div className="px-4 py-3 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search settings..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9 h-9"
          />
        </div>
      </div>

      {/* Menu */}
      <ScrollArea className="flex-1">
        {isSearching ? (
          // Search results
          <div className="px-2 py-2">
            {searchResults.length > 0 ? (
              <div className="space-y-1">
                {searchResults.map((item) => (
                  <Link
                    key={item.id}
                    href={item.href}
                    onClick={onNavigate}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                      "hover:bg-muted",
                      pathname === item.href
                        ? "bg-muted font-medium text-foreground"
                        : "text-muted-foreground"
                    )}
                  >
                    {item.icon && <item.icon className="h-4 w-4 shrink-0" />}
                    <div className="flex-1 min-w-0">
                      <div className="truncate">{item.label}</div>
                      {item.description && (
                        <div className="text-xs text-muted-foreground truncate">
                          {item.description}
                        </div>
                      )}
                    </div>
                    {item.badge && (
                      <Badge variant="secondary" className="text-xs">
                        {item.badge}
                      </Badge>
                    )}
                  </Link>
                ))}
              </div>
            ) : (
              <div className="px-3 py-8 text-center text-sm text-muted-foreground">
                No settings found for &quot;{searchQuery}&quot;
              </div>
            )}
          </div>
        ) : (
          // Normal menu
          <div className="px-2 py-3">
            {settingsMenu.map((section) => (
              <div key={section.id} className="mb-6">
                <div className="px-3 mb-2">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {section.label}
                  </h3>
                </div>
                <div className="space-y-1">
                  {section.items.map((item) => (
                    <div key={item.id}>
                      <Link
                        href={item.href}
                        onClick={onNavigate}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                          "hover:bg-muted",
                          pathname === item.href
                            ? "bg-muted font-medium text-foreground"
                            : "text-muted-foreground"
                        )}
                      >
                        {item.icon && <item.icon className="h-4 w-4 shrink-0" />}
                        <span className="flex-1 truncate">{item.label}</span>
                        {item.badge && (
                          <Badge variant="secondary" className="text-xs">
                            {item.badge}
                          </Badge>
                        )}
                      </Link>
                      {item.children && (
                        <div className="ml-7 mt-1 space-y-1">
                          {item.children.map((child) => (
                            <Link
                              key={child.id}
                              href={child.href}
                              onClick={onNavigate}
                              className={cn(
                                "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors",
                                "hover:bg-muted",
                                pathname === child.href
                                  ? "bg-muted font-medium text-foreground"
                                  : "text-muted-foreground"
                              )}
                            >
                              <span className="flex-1 truncate">{child.label}</span>
                              {child.badge && (
                                <Badge variant="secondary" className="text-xs">
                                  {child.badge}
                                </Badge>
                              )}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
