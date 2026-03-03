"use client";

import * as React from "react";
import {
  IconBriefcase,
  IconChartBar,
  IconDashboard,
  IconHelpCircle,
  IconListDetails,
  IconSettings,
  IconReportAnalytics,
  IconSidebarToggle,
  IconUsersGroup,
} from "@/lib/icons";

import { NavMain } from "@/components/nav-main";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandLogo } from "@/components/BrandLogo";
// Dashboard, Staff, Client, Students, Drive, Reports
const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: IconDashboard,
    },
    {
      title: "Staff",
      url: "/staff",
      icon: IconUsersGroup,
    },
    {
      title: "Client",
      url: "/client",
      icon: IconListDetails,
    },
    {
      title: "Candidate",
      url: "/candidate",
      icon: IconChartBar,
    },
    {
      title: "Drive",
      url: "/drive",
      icon: IconBriefcase,
    },
    {
      title: "Reports",
      url: "/reports",
      icon: IconReportAnalytics,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const { state, toggleSidebar } = useSidebar();
  return (
    <>
      {pathname === "/" ? null : (
        <Sidebar collapsible="icon" variant="sidebar" {...props}>
          <SidebarHeader className="h-14 border-b px-2.5 py-0">
            <div className="flex h-full items-center justify-between gap-2 group-data-[collapsible=icon]:justify-center">
              <Link
                href="/"
                className="flex h-full flex-1 items-center px-2 group-data-[collapsible=icon]:hidden"
              >
                <BrandLogo compact />
              </Link>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={toggleSidebar}
                className="size-8 rounded-md text-muted-foreground hover:bg-muted/70 hover:text-foreground"
                aria-label="Toggle sidebar"
              >
                <IconSidebarToggle
                  className={`size-4 transition-transform ${state === "collapsed" ? "rotate-180" : ""}`}
                />
              </Button>
            </div>
          </SidebarHeader>
          <SidebarContent className="px-2 pt-2">
            <NavMain items={data.navMain} />
          </SidebarContent>
          <SidebarFooter className="mt-auto px-2 pb-3">
            <SidebarMenu className="gap-1">
              <SidebarMenuItem>
                <Link href="/account?tab=account">
                  <SidebarMenuButton
                    isActive={pathname.startsWith("/account")}
                    className="h-10 rounded-md px-3.5 text-[15px] text-muted-foreground hover:bg-muted/70 hover:text-foreground data-[active=true]:bg-primary/12 data-[active=true]:text-primary"
                  >
                    <IconSettings className="size-[18px]" />
                    <span>Settings</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <Link href="/support">
                  <SidebarMenuButton
                    isActive={pathname.startsWith("/support")}
                    className="h-10 rounded-md px-3.5 text-[15px] text-muted-foreground hover:bg-muted/70 hover:text-foreground data-[active=true]:bg-primary/12 data-[active=true]:text-primary"
                  >
                    <IconHelpCircle className="size-[18px]" />
                    <span>Support</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>
      )}
    </>
  );
}
