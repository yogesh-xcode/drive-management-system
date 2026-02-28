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
import { FileUploadDialog } from "@/components/FileUploadDialog";

export default function Page() {
  const [driveData, setDriveData] = React.useState<Drive[]>([]);
  const [loading, setLoading] = React.useState(true);

  const router = useRouter();

  const isDuplicateError = (error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);
    const normalized = message.toLowerCase();
    return (
      normalized.includes("duplicate") ||
      normalized.includes("unique constraint") ||
      normalized.includes("already exists")
    );
  };

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
      <div className="@container/main flex flex-1 flex-col">
        <PageSection>
          <CardCover>
            <DriveStatsCard data={driveData} type="total" description={""} />
            <DriveStatsCard
              data={driveData}
              type="scheduled"
              description={""}
            />
            <DriveStatsCard
              data={driveData}
              type="completed"
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
            rowsPerPage={8}
            loading={loading}
            immutableFields={["id"]}
            toolbarBeforeExport={
              <FileUploadDialog
                entityLabel="Drive"
                fields={driveFields}
                onImportRows={async (rows) => {
                  let inserted = 0;
                  let skipped = 0;

                  for (const row of rows) {
                    try {
                      await driveDataService.create(row as Omit<Drive, "id">);
                      inserted += 1;
                    } catch (error) {
                      if (isDuplicateError(error)) {
                        skipped += 1;
                        continue;
                      }
                      throw error;
                    }
                  }

                  await fetchData();
                  return { inserted, skipped };
                }}
              />
            }
          />
        </PageSection>
      </div>
    </div>
  );
}
