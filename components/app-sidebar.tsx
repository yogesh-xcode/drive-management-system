"use client";

import * as React from "react";
import {
  IconBriefcase,
  IconChartBar,
  IconDashboard,
  IconInnerShadowTop,
  IconListDetails,
  IconReportAnalytics,
  IconUsersGroup,
} from "@tabler/icons-react";

import { NavMain } from "@/components/nav-main";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
  return (
    <>
      {pathname === "/" ? null : (
        <Sidebar collapsible="icon" variant="inset" {...props}>
          <SidebarHeader>
            <SidebarMenu>
              <SidebarTrigger />
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  className="data-[slot=sidebar-menu-button]:!p-1.5"
                >
                  <Link href="/">
                    <IconInnerShadowTop className="!size-5" />
                    <span className="text-base font-semibold">
                      Drivems Suite
                    </span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarHeader>
          <SidebarContent>
            <NavMain items={data.navMain} />
          </SidebarContent>
        </Sidebar>
      )}
    </>
  );
}
