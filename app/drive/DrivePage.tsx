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
import { useRouter, useSearchParams } from "next/navigation";
import { PageSection } from "@/components/layout/PageHeader";
import { FileUploadDialog } from "@/components/FileUploadDialog";
import PageSkeleton from "@/components/Skeleton/PageSkeleton";

export default function Page() {
  const [authenticated, setAuthenticated] = React.useState(false);
  const [driveData, setDriveData] = React.useState<Drive[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [openQuickCreate, setOpenQuickCreate] = React.useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const normalizeValue = (value: unknown) =>
    String(value ?? "").trim().toLowerCase();

  const isSameRow = (
    existing: Record<string, unknown>,
    incoming: Record<string, unknown>,
  ) => {
    const comparableKeys = Object.keys(incoming).filter(
      (key) => key !== "id" && key !== "user_id" && key !== "id_uuid",
    );

    return comparableKeys.every(
      (key) => normalizeValue(existing[key]) === normalizeValue(incoming[key]),
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

      setAuthenticated(true);
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

  React.useEffect(() => {
    if (searchParams.get("add") === "1") {
      setOpenQuickCreate(true);
    }
  }, [searchParams]);

  const handleQuickCreateOpenChange = (open: boolean) => {
    setOpenQuickCreate(open);
    if (!open && searchParams.get("add") === "1") {
      router.replace("/drive");
    }
  };

  if (loading || !authenticated) {
    return <PageSkeleton />;
  }

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
              setOpenQuickCreate(false);
              router.replace("/drive");
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
            quickCreateOpen={openQuickCreate}
            onQuickCreateOpenChange={handleQuickCreateOpenChange}
            toolbarBeforeExport={
              <FileUploadDialog
                entityLabel="Drive"
                fields={driveFields}
                onImportRows={async (rows) => {
                  let inserted = 0;
                  let skipped = 0;
                  const existingResult = await driveDataService.get();
                  const existingRows = (existingResult.data ?? []) as Record<
                    string,
                    unknown
                  >[];

                  for (const row of rows) {
                    if (existingRows.some((existing) => isSameRow(existing, row))) {
                      skipped += 1;
                      continue;
                    }

                    try {
                      await driveDataService.create(row as Omit<Drive, "id">);
                      inserted += 1;
                      existingRows.push(row);
                    } catch (error) {
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
