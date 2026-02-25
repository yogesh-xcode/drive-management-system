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
import PageSkeleton from "@/components/Skeleton/PageSkeleton";
import { useRouter } from "next/navigation";
import { PageHeader, PageSection } from "@/components/layout/PageHeader";

export default function Page() {
  const [staffData, setStaffData] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);

  const router = useRouter();

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
      <PageHeader
        title="Staff"
        description="Manage employees, departments, and tenure distribution"
      />
      <div className="@container/main flex flex-1 flex-col">
        <PageSection>
          <CardCover>
            <DepartmentStatCard data={staffData} />
            <TenureStatCard data={staffData} />
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
            rowsPerPage={9}
            loading={loading}
            immutableFields={["id"]}
          />
        </PageSection>
      </div>
    </div>
  );
}
