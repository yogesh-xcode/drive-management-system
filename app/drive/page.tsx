"use client";
import { PaginatedDataTable } from "@/components/EntityTable/PaginatedDataTable";
import { driveColumns } from "@/components/EntityTable/colums/driveColumn";
import { driveFields } from "@/components/EntityTable/schema";
import { driveDataService, userService } from "@/lib/repositories";
import { Drive } from "@/types";
import React from "react";
import CardCover from "@/components/Cards/CardCover";
import DashboardCard from "@/components/Cards/DashboardCard";
import { DriveStatsCard } from "@/components/Cards/Drive/StatCard";
import { useRouter } from "next/navigation";
import { PageHeader, PageSection } from "@/components/layout/PageHeader";

export default function Page() {
  const [driveData, setDriveData] = React.useState<Drive[]>([]);
  const [loading, setLoading] = React.useState(true);

  const router = useRouter();

  async function fetchData() {
    setLoading(true);
    const result = await driveDataService.get();
    setDriveData(result.data || []);
    setLoading(false);
  }

  React.useEffect(() => {
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

      const result = await driveDataService.get();
      if (!mounted) return;
      setDriveData(result.data || []);
      setLoading(false);
    };

    void init();
    return () => {
      mounted = false;
    };
  }, [router]);

  return (
    <div className="flex flex-1 flex-col">
      <PageHeader
        title="Drives"
        description="Schedule, monitor, and analyze hiring drive execution"
      />
      <div className="@container/main flex flex-1 flex-col">
        <PageSection>
          <CardCover>
            <DriveStatsCard data={driveData} type="total" description={""} />
            <DriveStatsCard
              data={driveData}
              type="scheduled"
              description={""}
            />
            <DashboardCard />
          </CardCover>
          <PaginatedDataTable<Drive>
            columns={driveColumns}
            data={driveData}
            dateAccessor="date"
            fields={driveFields}
            onAdd={async (values) => {
              await driveDataService.create(values);
              await fetchData();
            }}
            onEdit={async (row, values) => {
              await driveDataService.update(row.id, values);
              await fetchData();
            }}
            onDelete={async (row) => {
              await driveDataService.destroy(row.id);
              await fetchData();
            }}
            title="Drives"
            entity="drive"
            rowsPerPage={9}
            loading={loading}
            immutableFields={["id"]}
          />
        </PageSection>
      </div>
    </div>
  );
}
