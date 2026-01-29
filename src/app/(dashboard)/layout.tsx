import { MainLayout } from "@/components/layout/MainLayout";
import { SidebarProvider } from "@/components/layout/sidebar-context";
import { DataProvider } from "@/contexts/data-context";
import { NotificationProvider } from "@/contexts/notification-context";
import { AccountProvider } from "@/contexts/account-context";
import { CreatorsProvider } from "@/contexts/creators-context";
import { CreatorAccountProvider } from "@/contexts/creator-account-context";
import { SetupProvider } from "@/lib/contexts/setup-context";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AccountProvider>
      <SetupProvider>
        <SidebarProvider>
          <NotificationProvider>
            <DataProvider>
              <CreatorsProvider>
                <CreatorAccountProvider>
                  <MainLayout>{children}</MainLayout>
                </CreatorAccountProvider>
              </CreatorsProvider>
            </DataProvider>
          </NotificationProvider>
        </SidebarProvider>
      </SetupProvider>
    </AccountProvider>
  );
}

