"use client";

import { usePathname } from "next/navigation";

const TITLE_BY_ROUTE: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/staff": "Staff",
  "/client": "Client",
  "/candidate": "Candidate",
  "/drive": "Drive",
  "/reports": "Reports",
  "/account": "Account",
  "/notifications": "Notifications",
};

export function PageTitle() {
  const pathname = usePathname();
  const basePath = `/${pathname.split("/").filter(Boolean)[0] || "dashboard"}`;
  const title = TITLE_BY_ROUTE[basePath];

  if (!title || pathname === "/" || pathname === "/login") {
    return null;
  }

  return (
    <div className="px-4 ml-4 pt-4 md:px-6 md:pt-6">
      <h2 className="text-2xl font-semibold">{title}</h2>
    </div>
  );
}
