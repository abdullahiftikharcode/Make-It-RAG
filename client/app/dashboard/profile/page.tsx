import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UserProfileForm } from "@/components/user-profile-form"
import { UserSecurityForm } from "@/components/user-security-form"
import { UserBillingForm } from "@/components/user-billing-form"

export default function ProfilePage() {
  return (
    <DashboardShell>
      <DashboardHeader heading="Profile" text="Manage your account settings and preferences." />

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <UserProfileForm />
        </TabsContent>

        <TabsContent value="security">
          <UserSecurityForm />
        </TabsContent>

        <TabsContent value="billing">
          <UserBillingForm />
        </TabsContent>
      </Tabs>
    </DashboardShell>
  )
}

