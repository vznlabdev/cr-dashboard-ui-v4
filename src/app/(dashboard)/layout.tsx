import { MainLayout } from "@/components/layout/MainLayout";
import { SidebarProvider } from "@/components/layout/sidebar-context";
import { DataProvider } from "@/contexts/data-context";
import { NotificationProvider } from "@/contexts/notification-context";
import { AccountProvider } from "@/contexts/account-context";
import { CreatorsProvider } from "@/contexts/creators-context";
import { CreatorAccountProvider } from "@/contexts/creator-account-context";
import { ContractsProvider } from "@/contexts/contracts-context";
import { SetupProvider } from "@/lib/contexts/setup-context";
import { InboxProvider } from "@/lib/contexts/inbox-context";
import { CopyrightCreditsProvider } from "@/lib/contexts/copyright-credits-context";
import { mockCompanies } from "@/lib/mock-data/projects-tasks";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Get credits from first company (in real app, get from current user's company)
  const initialCredits = mockCompanies[0]?.copyrightCheckCredits || null

  return (
    <AccountProvider>
      <SetupProvider>
        <InboxProvider>
          <CopyrightCreditsProvider initialCredits={initialCredits}>
            <SidebarProvider>
              <NotificationProvider>
                <DataProvider>
                  <CreatorsProvider>
                    <ContractsProvider>
                      <CreatorAccountProvider>
                        <MainLayout>{children}</MainLayout>
                      </CreatorAccountProvider>
                    </ContractsProvider>
                  </CreatorsProvider>
                </DataProvider>
              </NotificationProvider>
            </SidebarProvider>
          </CopyrightCreditsProvider>
        </InboxProvider>
      </SetupProvider>
    </AccountProvider>
  );
}

