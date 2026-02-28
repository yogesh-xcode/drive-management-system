import type { Metadata } from "next";
import "@/theme-variants/variant-12.css";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { AppHeader } from "@/components/layout/AppHeader";

export const metadata: Metadata = {
  title: "Drivems Suite",
  description: "Manpower solution for IT Solutions",
};

export default function RootLayout({
  children,
}: Readonly<{ app; children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <NuqsAdapter>
          <SidebarProvider>
            <AppSidebar variant="floating" />
            <SidebarInset>
              <AppHeader />
              {children}
            </SidebarInset>
          </SidebarProvider>
        </NuqsAdapter>
      </body>
    </html>
  );
}
