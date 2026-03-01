import type { Metadata } from "next";
import { Noto_Serif } from "next/font/google";
import "@/theme-variants/variant-16.css";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { AppHeader } from "@/components/layout/AppHeader";
import { Toaster } from "sonner";

const notoSerif = Noto_Serif({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-noto-serif",
});

export const metadata: Metadata = {
  title: "Drivems Suite",
  description: "Manpower solution for IT Solutions",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${notoSerif.variable} antialiased`}>
        <NuqsAdapter>
          <SidebarProvider>
            <AppSidebar variant="sidebar" />
            <SidebarInset>
              <AppHeader />
              {children}
            </SidebarInset>
          </SidebarProvider>
          <Toaster position="bottom-right" richColors />
        </NuqsAdapter>
      </body>
    </html>
  );
}
