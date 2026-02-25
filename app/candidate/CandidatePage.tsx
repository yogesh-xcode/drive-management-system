"use client";
import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { candidateColumns } from "@/components/EntityTable/colums/candidateColumn";
import { candidateDataService, userService } from "@/lib/repositories";
import { candidateFields } from "@/components/EntityTable/schema";
import { Candidate } from "@/types";
import { StatusConversionCard } from "@/components/Cards/Candidate/StatusConversionCard";
import { OfferRateCard } from "@/components/Cards/Candidate/OfferRateCard";
import CardCover from "@/components/Cards/CardCover";
import DashboardCard from "@/components/Cards/DashboardCard";
import PageSkeleton from "@/components/Skeleton/PageSkeleton";
import { PaginatedDataTable } from "@/components/EntityTable/PaginatedDataTable";
import { PageHeader, PageSection } from "@/components/layout/PageHeader";

export default function Page() {
  const [authenticated, setAuthenticated] = useState(false);
  const [candidateData, setCandidateData] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [openQuickCreate, setOpenQuickCreate] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();

  async function fetchData() {
    try {
      setLoading(true);
      const result = await candidateDataService.get();
      setCandidateData(result.data || []);
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
      const result = await candidateDataService.get();
      if (!mounted) return;
      setCandidateData(result.data || []);
      setLoading(false);
    };

    void init();
    return () => {
      mounted = false;
    };
  }, [router]);

  // 🔹 Open Quick Create modal if ?add=1 exists in the URL
  useEffect(() => {
    if (searchParams.get("add") === "1") {
      setOpenQuickCreate(true);
    }
  }, [searchParams]);

  if (loading || !authenticated) {
    return <PageSkeleton />;
  }

  return (
    <div className="flex flex-1 flex-col">
      <PageHeader
        title="Candidates"
        description="Monitor pipeline conversion, offers, and application health"
      />
      <div className="@container/main flex flex-1 flex-col">
        <PageSection>
          <CardCover>
            <StatusConversionCard data={candidateData} />
            <OfferRateCard data={candidateData} />
            <DashboardCard />
          </CardCover>

          <PaginatedDataTable<Candidate>
            columns={candidateColumns}
            data={candidateData}
            dateAccessor="appliedDate"
            fields={candidateFields}
            onAdd={async (values) => {
              await candidateDataService.create(values);
              await fetchData();
              setOpenQuickCreate(false); // Close modal after creation
              router.replace("/candidate"); // Remove ?add=1 from URL
            }}
            onEdit={async (row, values) => {
              await candidateDataService.update(row.id, values);
              await fetchData();
            }}
            onDelete={async (row) => {
              await candidateDataService.destroy(row.id);
              await fetchData();
            }}
            title="Candidate"
            entity="candidate"
            rowsPerPage={10}
            loading={loading}
            immutableFields={["id"]}
            // 🔹 Controlled open state for Quick Create
            quickCreateOpen={openQuickCreate}
            onQuickCreateOpenChange={setOpenQuickCreate}
          />
        </PageSection>
      </div>
    </div>
  );
}
