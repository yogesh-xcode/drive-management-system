"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

import Auth from "@/lib/auth/auth";
import { userService } from "@/lib/repositories";
import {
  IconBriefcase,
  IconCreditCard,
  IconDatabase,
  IconLogout,
  IconNotification,
  IconSettings,
  IconUserCircle,
  IconUsersGroup,
} from "@/lib/icons";
import { PageSection } from "@/components/layout/PageHeader";
import PageSkeleton from "@/components/Skeleton/PageSkeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const makeAvatarUrl = (name: string) =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=E5E7EB&color=111827`;

type SettingsTab =
  | "apps"
  | "account"
  | "notification"
  | "language"
  | "general"
  | "members"
  | "billing";

type AccountUser = {
  id: string;
  email: string;
  displayName: string;
  avatar: string;
};

const GENERAL_SETTINGS: Array<{
  id: SettingsTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
    { id: "apps", label: "Apps", icon: IconBriefcase },
    { id: "account", label: "Account", icon: IconUserCircle },
    { id: "notification", label: "Notification", icon: IconNotification },
    { id: "language", label: "Language & Region", icon: IconDatabase },
  ];

const WORKSPACE_SETTINGS: Array<{
  id: SettingsTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
    { id: "general", label: "General", icon: IconSettings },
    { id: "members", label: "Members", icon: IconUsersGroup },
    { id: "billing", label: "Billing", icon: IconCreditCard },
  ];

function parseTab(value: string | null): SettingsTab {
  const fallback: SettingsTab = "account";
  if (!value) return fallback;
  const valid: SettingsTab[] = [
    "apps",
    "account",
    "notification",
    "language",
    "general",
    "members",
    "billing",
  ];
  return valid.includes(value as SettingsTab) ? (value as SettingsTab) : fallback;
}

export default function AccountPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = parseTab(searchParams.get("tab"));

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<AccountUser | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [twoStepEnabled, setTwoStepEnabled] = useState(false);
  const [supportAccess, setSupportAccess] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      const currentUser = await userService.get();
      if (!mounted) return;

      if (!currentUser) {
        router.replace("/login");
        setLoading(false);
        return;
      }

      const fullName = currentUser.user_metadata?.display_name || "Admin User";
      const [first = "Admin", ...rest] = fullName.trim().split(/\s+/);
      const last = rest.join(" ");

      setUser({
        id: currentUser.id,
        email: currentUser.email || "",
        displayName: fullName,
        avatar: currentUser.user_metadata?.avatar_url || makeAvatarUrl(fullName),
      });
      setFirstName(first);
      setLastName(last);
      setLoading(false);
    };

    void init();
    return () => {
      mounted = false;
    };
  }, [router]);

  const fullName = useMemo(
    () => `${firstName.trim()} ${lastName.trim()}`.trim(),
    [firstName, lastName],
  );

  const goToTab = (tab: SettingsTab) => {
    router.push(`/account?tab=${tab}`);
  };

  const handleSaveProfile = async () => {
    if (!fullName) {
      toast.error("Please enter your name.");
      return;
    }

    setSavingProfile(true);
    const { error } = await Auth.updateProfile(fullName);
    setSavingProfile(false);

    if (error) {
      toast.error(error.message || "Failed to update profile.");
      return;
    }

    setUser((prev) =>
      prev
        ? {
          ...prev,
          displayName: fullName,
          avatar: makeAvatarUrl(fullName),
        }
        : prev,
    );
    toast.success("Profile updated.");
  };

  const handlePasswordChange = async () => {
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setSavingPassword(true);
    const { error } = await Auth.updatePassword(newPassword);
    setSavingPassword(false);

    if (error) {
      toast.error(error.message || "Failed to change password.");
      return;
    }

    setNewPassword("");
    setConfirmPassword("");
    toast.success("Password updated.");
  };

  const handleLogoutAll = async () => {
    await Auth.signOut();
    router.replace("/login");
    router.refresh();
  };

  if (loading || !user) {
    return <PageSkeleton />;
  }

  const showAccountDetails = activeTab === "account";

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col">
        <PageSection className="!gap-0 !px-0 !py-0 md:!px-0 md:!py-0">
          <div className="overflow-hidden border bg-card">
            <div className="grid min-h-[calc(100vh-220px)] grid-cols-1 lg:grid-cols-[260px_1fr]">
              <aside className="border-r bg-muted/20">
                <div className="space-y-1 border-b p-4">
                  <p className="text-muted-foreground mb-2 text-xs font-semibold uppercase tracking-wide">
                    General Settings
                  </p>
                  {GENERAL_SETTINGS.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => goToTab(item.id)}
                      className={cn(
                        "flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors",
                        activeTab === item.id
                          ? "bg-primary/12 text-primary"
                          : "text-foreground hover:bg-muted",
                      )}
                    >
                      <item.icon className="size-4" />
                      <span>{item.label}</span>
                    </button>
                  ))}
                </div>
                <div className="space-y-1 p-4">
                  <p className="text-muted-foreground mb-2 text-xs font-semibold uppercase tracking-wide">
                    Workspace Settings
                  </p>
                  {WORKSPACE_SETTINGS.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => goToTab(item.id)}
                      className={cn(
                        "flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors",
                        activeTab === item.id
                          ? "bg-primary/12 text-primary"
                          : "text-foreground hover:bg-muted",
                      )}
                    >
                      <item.icon className="size-4" />
                      <span>{item.label}</span>
                    </button>
                  ))}
                </div>
              </aside>

              <main className="p-5">
                {showAccountDetails ? (
                  <div className="space-y-8">
                    <section className="space-y-4">
                      <div>
                        <h3 className="text-xl font-semibold">My Profile</h3>
                      </div>
                      <div className="flex flex-wrap items-center gap-3">
                        <Avatar className="h-14 w-14">
                          <AvatarImage src={user.avatar} alt={user.displayName} />
                          <AvatarFallback>
                            {user.displayName.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <Button size="sm" type="button">
                          Change Image
                        </Button>
                        <Button size="sm" variant="outline" type="button">
                          Remove Image
                        </Button>
                        <p className="text-muted-foreground text-xs">
                          We support PNG, JPG and GIF under 2MB.
                        </p>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="grid gap-2">
                          <Label htmlFor="first-name">First Name</Label>
                          <Input
                            id="first-name"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="last-name">Last Name</Label>
                          <Input
                            id="last-name"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                          />
                        </div>
                      </div>
                      <Button
                        type="button"
                        onClick={() => void handleSaveProfile()}
                        disabled={savingProfile}
                      >
                        {savingProfile ? "Saving..." : "Save Profile"}
                      </Button>
                    </section>

                    <section className="space-y-4 border-t pt-6">
                      <h3 className="text-xl font-semibold">Account Security</h3>

                      <div className="grid gap-2 md:grid-cols-[1fr_auto] md:items-end md:gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="email">Email</Label>
                          <Input id="email" value={user.email} disabled />
                        </div>
                        <Button variant="outline" type="button">
                          Change email
                        </Button>
                      </div>

                      <div className="grid gap-2 md:grid-cols-[1fr_1fr_auto] md:items-end md:gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="new-password">New password</Label>
                          <Input
                            id="new-password"
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Enter new password"
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="confirm-password">Confirm password</Label>
                          <Input
                            id="confirm-password"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm password"
                          />
                        </div>
                        <Button
                          type="button"
                          onClick={() => void handlePasswordChange()}
                          disabled={savingPassword}
                        >
                          {savingPassword ? "Updating..." : "Change password"}
                        </Button>
                      </div>

                      <div className="flex items-start justify-between rounded-md border px-4 py-3">
                        <div>
                          <p className="font-medium">2-Step Verification</p>
                          <p className="text-muted-foreground text-sm">
                            Add an additional layer of account security.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setTwoStepEnabled((prev) => !prev)}
                          className={cn(
                            "relative mt-1 inline-flex h-6 w-11 rounded-full border transition-colors",
                            twoStepEnabled
                              ? "border-primary bg-primary"
                              : "border-border bg-muted",
                          )}
                          aria-label="Toggle two-step verification"
                        >
                          <span
                            className={cn(
                              "absolute top-0.5 h-4.5 w-4.5 rounded-full bg-white transition-transform",
                              twoStepEnabled ? "translate-x-5" : "translate-x-1",
                            )}
                          />
                        </button>
                      </div>
                    </section>

                    <section className="space-y-4 border-t pt-6">
                      <h3 className="text-xl font-semibold">Support Access</h3>

                      <div className="flex items-start justify-between rounded-md border px-4 py-3">
                        <div>
                          <p className="font-medium">Support access</p>
                          <p className="text-muted-foreground text-sm">
                            Grant temporary access to support team.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setSupportAccess((prev) => !prev)}
                          className={cn(
                            "relative mt-1 inline-flex h-6 w-11 rounded-full border transition-colors",
                            supportAccess
                              ? "border-primary bg-primary"
                              : "border-border bg-muted",
                          )}
                          aria-label="Toggle support access"
                        >
                          <span
                            className={cn(
                              "absolute top-0.5 h-4.5 w-4.5 rounded-full bg-white transition-transform",
                              supportAccess ? "translate-x-5" : "translate-x-1",
                            )}
                          />
                        </button>
                      </div>

                      <div className="flex items-center justify-between rounded-md border px-4 py-3">
                        <div>
                          <p className="font-medium">Log out of all devices</p>
                          <p className="text-muted-foreground text-sm">
                            End sessions on other devices.
                          </p>
                        </div>
                        <Button variant="outline" type="button" onClick={() => void handleLogoutAll()}>
                          <IconLogout className="size-4" />
                          Log out
                        </Button>
                      </div>
                    </section>
                  </div>
                ) : (
                  <Card>
                    <CardHeader>
                      <CardTitle>
                        {
                          [...GENERAL_SETTINGS, ...WORKSPACE_SETTINGS].find(
                            (item) => item.id === activeTab,
                          )?.label
                        }
                      </CardTitle>
                      <CardDescription>
                        This section is available in the next update. Use the Account tab for profile and security settings.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button type="button" onClick={() => goToTab("account")}>
                        Go to Account
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </main>
            </div>
          </div>
        </PageSection>
      </div>
    </div>
  );
}
