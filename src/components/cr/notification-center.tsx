"use client"

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bell, Check, CheckCheck, Trash2, Info, AlertCircle, CheckCircle2, AlertTriangle } from "lucide-react";
import { useNotifications } from "@/contexts/notification-context";
import Link from "next/link";

export function NotificationCenter() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification, clearAll } = useNotifications();
  const [open, setOpen] = useState(false);

  const getIcon = (type: string) => {
    const iconClass = "h-3.5 w-3.5";
    switch (type) {
      case "success":
        return <CheckCircle2 className={`${iconClass} text-green-500`} />;
      case "warning":
        return <AlertTriangle className={`${iconClass} text-amber-500`} />;
      case "error":
        return <AlertCircle className={`${iconClass} text-destructive`} />;
      default:
        return <Info className={`${iconClass} text-blue-500`} />;
    }
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const handleNotificationClick = (notification: typeof notifications[0]) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    if (notification.action?.onClick) {
      notification.action.onClick();
      setOpen(false);
    }
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-8 w-8 overflow-visible">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-0.5 -right-0.5 min-w-4 h-4 flex items-center justify-center p-0 text-[10px] rounded-full"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between px-2 py-1.5">
          <DropdownMenuLabel className="p-0 text-xs font-medium">Notifications</DropdownMenuLabel>
          <div className="flex gap-0.5">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-1.5 text-[11px]"
                onClick={markAllAsRead}
              >
                <CheckCheck className="h-3 w-3 mr-1" />
                Mark all read
              </Button>
            )}
            {notifications.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-1.5 text-[11px]"
                onClick={clearAll}
              >
                <Trash2 className="h-3 w-3 mr-1" />
                Clear
              </Button>
            )}
          </div>
        </div>
        <DropdownMenuSeparator />

        {notifications.length === 0 ? (
          <div className="py-6 text-center text-xs text-muted-foreground">
            <Bell className="h-6 w-6 mx-auto mb-1.5 opacity-50" />
            <p>No notifications</p>
          </div>
        ) : (
          <div className="max-h-[320px] overflow-y-auto">
            <div className="space-y-0.5 p-1">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`group relative rounded-md p-2 hover:bg-accent cursor-pointer transition-colors ${
                    !notification.read ? "bg-primary/5" : ""
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex gap-2">
                    <div className="mt-0.5 shrink-0">{getIcon(notification.type)}</div>
                    <div className="flex-1 min-w-0 space-y-0.5">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-xs font-medium leading-none">
                          {notification.title}
                        </p>
                        {!notification.read && (
                          <div className="h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0 mt-0.5" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {notification.message}
                      </p>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-[11px] text-muted-foreground">
                          {formatTimestamp(notification.timestamp)}
                        </p>
                        {notification.action && (
                          <Button
                            variant="link"
                            size="sm"
                            className="h-auto p-0 text-[11px]"
                            asChild={!!notification.action.href}
                            onClick={(e) => {
                              if (notification.action?.onClick) {
                                e.stopPropagation();
                                notification.action.onClick();
                                setOpen(false);
                              }
                            }}
                          >
                            {notification.action.href ? (
                              <Link href={notification.action.href} onClick={() => setOpen(false)}>
                                {notification.action.label} →
                              </Link>
                            ) : (
                              <span>{notification.action.label} →</span>
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-5 w-5 p-0 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(notification.id);
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

