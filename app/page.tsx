import {
  Check,
  Database,
  ShieldCheck,
  Users,
} from "lucide-react";
import { LoginForm } from "@/components/login-form";
import { BrandLogo } from "@/components/BrandLogo";

export default function HomePage() {
  return (
    <main className="min-h-[100dvh] bg-background px-4 py-6 lg:px-6">
      <div className="mx-auto flex min-h-[calc(100dvh-3rem)] w-full max-w-[1120px] items-center">
        <section className="grid w-full overflow-hidden rounded-3xl border border-border bg-background text-foreground shadow-sm lg:grid-cols-2">
        <div className="hidden bg-muted/40 px-8 py-8 text-foreground lg:flex lg:flex-col lg:justify-between">
          <div>
            <BrandLogo />

            <div className="mt-8 max-w-[420px] space-y-3">
              <h1 className="text-3xl font-extrabold leading-[1.08]">
                Enterprise Drive Management System
              </h1>
              <p className="text-sm leading-[1.45] text-muted-foreground">
                Secure hiring workflows for staff, candidates, client programs,
                and recruitment drives with complete visibility.
              </p>
            </div>

            <div className="mt-7 space-y-2.5">
              <p className="text-xs font-semibold tracking-[0.25em] text-muted-foreground">
                KEY CAPABILITIES
              </p>
              <div className="flex flex-wrap gap-2">
                <FeatureBadge
                  icon={<ShieldCheck className="size-3.5" />}
                  label="Role-based Access"
                />
                <FeatureBadge
                  icon={<Database className="size-3.5" />}
                  label="Pipeline Tracking"
                />
                <FeatureBadge
                  icon={<Users className="size-3.5" />}
                  label="Team Collaboration"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1 text-[11px] font-semibold text-foreground">
              <Check className="size-3.5" />
              Trusted for multi-team hiring operations
            </div>
            <p className="text-[11px] text-muted-foreground">
              24/7 Reliability • Secure Auth • Real-time updates
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center p-4 lg:p-6">
          <div className="w-full max-w-[520px] rounded-2xl border border-border bg-card p-3 sm:p-5 lg:p-6">
            <div className="rounded-xl border border-border bg-muted/40 p-3">
              <BrandLogo className="[&_p:first-child]:text-[11px] sm:[&_p:first-child]:text-xs [&_p:first-child]:tracking-[0.08em] [&_p:last-child]:text-[10px]" />
            </div>

            <LoginForm className="mt-3.5" />
          </div>
        </div>
        </section>
      </div>
    </main>
  );
}

function FeatureBadge({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <div className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 py-1 text-[11px] font-semibold text-foreground">
      {icon}
      {label}
    </div>
  );
}
