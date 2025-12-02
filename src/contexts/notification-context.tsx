/**
 * Notification Context - User Notification System
 * 
 * Manages user notifications with read/unread state and actions.
 * 
 * INTEGRATION GUIDE:
 * ------------------
 * 1. Connect to WebSocket for real-time notifications
 * 2. Fetch initial notifications from API on mount
 * 3. Persist read/unread state to backend
 * 4. Add notification preferences (email, push, in-app)
 * 
 * USAGE:
 * ------
 * import { useNotifications } from '@/contexts/notification-context';
 * 
 * const { notifications, unreadCount, addNotification, markAsRead } = useNotifications();
 * 
 * // Add notification
 * addNotification({
 *   title: "New Project",
 *   message: "Project created successfully",
 *   type: "success",
 *   action: { label: "View", href: "/projects/1" }
 * });
 * 
 * CURRENT STATE:
 * --------------
 * - Mock initial notifications for demo
 * - All state in-memory (resets on refresh)
 * - Ready for WebSocket or polling integration
 * 
 * See API_INTEGRATION.md for notification API endpoints
 */

"use client"

import React, { createContext, useContext, useState, useCallback } from "react";
import type { Notification } from "@/types";

// Re-export type for backwards compatibility
export type { Notification };

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, "id" | "timestamp" | "read">) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  clearAll: () => void;
  unreadCount: number;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Mock initial notifications
const initialNotifications: Notification[] = [
  {
    id: "1",
    title: "Project Approved",
    message: "Summer Campaign 2024 has been approved for production",
    type: "success",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    read: false,
    action: {
      label: "View Project",
      href: "/projects/1",
    },
  },
  {
    id: "2",
    title: "High Risk Asset Detected",
    message: "logo-redesign.svg has been flagged for legal review",
    type: "warning",
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
    read: false,
    action: {
      label: "Review Now",
      href: "/legal",
    },
  },
  {
    id: "3",
    title: "New Integration Connected",
    message: "Midjourney has been successfully connected",
    type: "info",
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    read: true,
  },
  {
    id: "4",
    title: "Compliance Percentage Updated",
    message: "Your overall compliance percentage increased to 87%",
    type: "success",
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    read: true,
  },
];

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);

  /**
   * Add a new notification
   * 
   * INTEGRATION: Also send to backend to persist:
   * await api.notifications.create(notificationData);
   */
  const addNotification = useCallback((notificationData: Omit<Notification, "id" | "timestamp" | "read">) => {
    const newNotification: Notification = {
      ...notificationData,
      id: String(Date.now()),
      timestamp: new Date(),
      read: false,
    };

    setNotifications(prev => [newNotification, ...prev]);
  }, []);

  /**
   * Mark notification as read
   * 
   * INTEGRATION: await api.notifications.markAsRead(id);
   */
  const markAsRead = useCallback((id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  /**
   * Mark all notifications as read
   * 
   * INTEGRATION: await api.notifications.markAllAsRead();
   */
  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  /**
   * Delete a notification
   * 
   * INTEGRATION: await api.notifications.delete(id);
   */
  const deleteNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  /**
   * Clear all notifications
   * 
   * INTEGRATION: await api.notifications.clearAll();
   */
  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        addNotification,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearAll,
        unreadCount,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within NotificationProvider");
  }
  return context;
}

