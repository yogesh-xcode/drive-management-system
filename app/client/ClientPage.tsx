"use client";
import { PaginatedDataTable } from "@/components/EntityTable/PaginatedDataTable";
import { programColumns } from "@/components/EntityTable/colums/programColumn";
import { programFields } from "@/components/EntityTable/schema";
import { clientDataService, userService } from "@/lib/repositories";
import { Client } from "@/types";
import React, { useEffect, useState } from "react";
import CardCover from "@/components/Cards/CardCover";
import DashboardCard from "@/components/Cards/DashboardCard";
import { GrowthStatsCard } from "@/components/Cards/Client/GrowthStatsCard";
import { OpeningsStatsCard } from "@/components/Cards/Client/OpeningsStatsCard";
import { useRouter } from "next/navigation";
import PageSkeleton from "@/components/Skeleton/PageSkeleton";
import { PageHeader, PageSection } from "@/components/layout/PageHeader";

export default function Page() {
  const [authenticated, setAuthenticated] = useState(false);
  const [clientData, setClientData] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  async function fetchData() {
    try {
      setLoading(true);
      const result = await clientDataService.get();
      setClientData(result.data || []);
    } finally {
      setLoading(false);
    }
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
      const result = await clientDataService.get();
      if (!mounted) return;
      setClientData(result.data || []);
      setLoading(false);
    };

    void init();
    return () => {
      mounted = false;
    };
  }, [router]);

  if (loading || !authenticated) {
    return <PageSkeleton />;
  }

  return (
    <div className="flex flex-1 flex-col">
      <PageHeader
        title="Client Programs"
        description="Track program volume, client growth, and contact pipelines"
      />
      <div className="@container/main flex flex-1 flex-col">
        <PageSection>
          <CardCover>
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
            <OpeningsStatsCard data={clientData} />
            <DashboardCard />
          </CardCover>
          <PaginatedDataTable<Client>
            columns={programColumns}
            data={clientData}
            dateAccessor="date"
            fields={programFields}
            onAdd={async (values) => {
              await clientDataService.create(values);
              await fetchData();
            }}
            onEdit={async (row, values) => {
              await clientDataService.update(row.programNo, values);
              await fetchData();
            }}
            onDelete={async (row) => {
              await clientDataService.destroy(row.programNo);
              await fetchData();
            }}
            title="Programs"
            entity="client"
            rowsPerPage={8}
            loading={loading}
            immutableFields={["programNo"]}
          />
        </PageSection>
      </div>
    </div>
  );
}
