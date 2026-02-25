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
} from "@/lib/repositories";
import CompanyOverviewAreaChart from "@/components/Chart/CompanyOverviewChart";
import { DashboardSkeleten } from "@/components/Skeleton/DashboardSkeleten";
import { PageHeader, PageSection } from "@/components/layout/PageHeader";

export default function Dashboard() {
  const [staffData, setStaffData] = useState<Staff[]>([]);
  const [candidateData, setCandidateData] = useState<Candidate[]>([]);
  const [clientData, setClientData] = useState<Client[]>([]);
  const [driveData, setDriveData] = useState<Drive[]>([]);
  const [loading, setLoading] = useState(true);

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
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-1 flex-col">
        <PageHeader
          title="Dashboard"
          description="Organization-wide KPIs, hiring momentum, and drive trends"
        />
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
      <PageHeader
        title="Dashboard"
        description="Organization-wide KPIs, hiring momentum, and drive trends"
      />
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
          <DepartmentStatCard data={staffData} />
          <StatusConversionCard data={candidateData} />
          <GrowthStatsCard
            data={clientData}
            mode="clients"
            dateSelector={(item) => item.date}
            uniqueField={(item) => item.client}
            description="New Clients"
            positiveLabel="New clients acquired"
            negativeLabel="Acquisition needs attention"
          />
          <StaffTenureCard data={staffData} />
          <OfferRateCard data={candidateData} />
        </div>
      </PageSection>
    </div>
  );
}
