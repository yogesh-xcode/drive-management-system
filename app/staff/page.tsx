"use client";
import { PaginatedDataTable } from "@/components/EntityTable/PaginatedDataTable";
import { staffColumns } from "@/components/EntityTable/colums/staffColumn";
import { staffFields } from "@/components/EntityTable/schema";
import { staffDataService, userService } from "@/lib/repositories";
import { Staff } from "@/types";
import React, { useEffect, useState } from "react";
import CardCover from "@/components/Cards/CardCover";
import DashboardCard from "@/components/Cards/DashboardCard";
import DepartmentStatCard from "@/components/Cards/Staff/DepartmentStatCard";
import TenureStatCard from "@/components/Cards/Staff/StaffTenureCard";
import StaffCountCard from "@/components/Cards/Staff/StaffCountCard";
import PageSkeleton from "@/components/Skeleton/PageSkeleton";
import { useRouter } from "next/navigation";
import { PageSection } from "@/components/layout/PageHeader";
import { FileUploadDialog } from "@/components/FileUploadDialog";

export default function Page() {
  const [staffData, setStaffData] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);

  const router = useRouter();
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

  // Centralized data fetch
  const fetchData = async () => {
    try {
      setLoading(true);
      const result = await staffDataService.get();
      setStaffData(result.data || []);
    } finally {
      setLoading(false);
    }
  };

  // Fetch once when mounted
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

      const result = await staffDataService.get();
      if (!mounted) return;
      setStaffData(result.data || []);
      setLoading(false);
    };

    void init();
    return () => {
      mounted = false;
    };
  }, [router]);

  if (loading) {
    return <PageSkeleton />;
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col">
        <PageSection>
          <CardCover>
            <DepartmentStatCard data={staffData} />
            <TenureStatCard data={staffData} />
            <StaffCountCard data={staffData} />
            <DashboardCard />
          </CardCover>
          <PaginatedDataTable<Staff>
            columns={staffColumns}
            data={staffData}
            dateAccessor="joinedDate"
            fields={staffFields}
            onAdd={async (values) => {
              await staffDataService.create(values);
              await fetchData();
            }}
            onEdit={async (row, values) => {
              await staffDataService.update(row.id, values);
              await fetchData();
            }}
            onDelete={async (row) => {
              await staffDataService.destroy(row.id);
              await fetchData();
            }}
            title="Staff"
            entity="staff"
            rowsPerPage={8}
            loading={loading}
            immutableFields={["id"]}
            toolbarBeforeExport={
              <FileUploadDialog
                entityLabel="Staff"
                fields={staffFields}
                onImportRows={async (rows) => {
                  let inserted = 0;
                  let skipped = 0;
                  const existingResult = await staffDataService.get();
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
                      await staffDataService.create(row as Omit<Staff, "id">);
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
