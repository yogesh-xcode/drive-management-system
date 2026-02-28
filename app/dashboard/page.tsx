"use client";
import React, { useEffect, useState } from "react";
import DepartmentStatCard from "@/components/Cards/Staff/DepartmentStatCard";
import StaffTenureCard from "@/components/Cards/Staff/StaffTenureCard";
import { StatusConversionCard } from "@/components/Cards/Candidate/StatusConversionCard";
import { OfferRateCard } from "@/components/Cards/Candidate/OfferRateCard";
import { Candidate, Client, Drive, Staff } from "@/types";
import { GrowthStatsCard } from "@/components/Cards/Client/GrowthStatsCard";
import {
  candidateDataService,
  clientDataService,
  driveDataService,
  staffDataService,
  userService,
} from "@/lib/repositories";
import CompanyOverviewAreaChart from "@/components/Chart/CompanyOverviewChart";
import { DashboardSkeleten } from "@/components/Skeleton/DashboardSkeleten";
import { PageSection } from "@/components/layout/PageHeader";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const [authenticated, setAuthenticated] = useState(false);
  const [staffData, setStaffData] = useState<Staff[]>([]);
  const [candidateData, setCandidateData] = useState<Candidate[]>([]);
  const [clientData, setClientData] = useState<Client[]>([]);
  const [driveData, setDriveData] = useState<Drive[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  async function fetchData() {
    setLoading(true);
    const [clientResult, candidateResult, staffResult, driveResult] =
      await Promise.all([
        clientDataService.get(),
        candidateDataService.get(),
        staffDataService.get(),
        driveDataService.get(),
      ]);

    if (!clientResult.error) setClientData(clientResult.data || []);
    if (!candidateResult.error) setCandidateData(candidateResult.data || []);
    if (!staffResult.error) setStaffData(staffResult.data || []);
    if (!driveResult.error) setDriveData(driveResult.data || []);
    setLoading(false);
  }

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      setLoading(true);
      const user = await userService.get();
      if (!mounted) return;

      if (!user) {
        router.replace("/login");
        setLoading(false);
        return;
      }

      setAuthenticated(true);
      await fetchData();
    };

    void init();
    return () => {
      mounted = false;
    };
  }, [router]);

  if (loading || !authenticated) {
    return (
      <div className="flex flex-1 flex-col">
        <PageSection>
          <div className="h-[250px] rounded-lg bg-primary/5" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, idx) => (
              <DashboardSkeleten key={idx} />
            ))}
          </div>
        </PageSection>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      <PageSection>
        <CompanyOverviewAreaChart
          staff={staffData}
          clients={clientData}
          candidates={candidateData}
          drives={driveData}
        />
        <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs sm:grid-cols-2 lg:grid-cols-3">
          <GrowthStatsCard
            data={clientData}
            mode="programs"
            dateSelector={(item) => item.date}
            description="Total Programs"
            positiveLabel="Better growth this month"
            negativeLabel="Lower growth this month"
          />
          <GrowthStatsCard
            data={clientData}
            mode="clients"
            dateSelector={(item) => item.date}
            uniqueField={(item) => item.client}
            description="New Clients"
            positiveLabel="New clients acquired"
            negativeLabel="Acquisition needs attention"
          />
          <OfferRateCard data={candidateData} />

          <DepartmentStatCard data={staffData} />
          <StatusConversionCard data={candidateData} />

          <StaffTenureCard data={staffData} />
        </div>
      </PageSection>
    </div>
  );
}
