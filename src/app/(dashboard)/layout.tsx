import { MainLayout } from "@/components/layout/MainLayout";
import { SidebarProvider } from "@/components/layout/sidebar-context";
import { DataProvider } from "@/contexts/data-context";
import { NotificationProvider } from "@/contexts/notification-context";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <NotificationProvider>
        <DataProvider>
          <MainLayout>{children}</MainLayout>
        </DataProvider>
      </NotificationProvider>
    </SidebarProvider>
  );
}

