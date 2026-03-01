"use client";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NavMainProps } from "@/types";

export function NavMain({ items }: NavMainProps) {
  const pathname = usePathname();

  return (
    <SidebarGroup className="px-0">
      <SidebarGroupContent className="flex flex-col gap-1">
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <Link href={item.url}>
                <SidebarMenuButton
                  tooltip={item.title}
                  isActive={
                    pathname === item.url ||
                    (item.url !== "/" && pathname.startsWith(`${item.url}/`))
                  }
                  className="h-12 rounded-md px-3.5 text-[15px] font-medium data-[active=true]:bg-primary/12 data-[active=true]:text-primary hover:bg-muted/70"
                >
                  {item.icon && <item.icon className="size-[18px]" />}
                  <span className="truncate">{item.title}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
