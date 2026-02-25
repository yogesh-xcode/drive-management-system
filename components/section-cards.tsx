import { GrowthStatsCard } from "@/components/Cards/Client/GrowthStatsCard"; // Import your new card
import DashboardCard from "./Cards/DashboardCard";

type SectionCardsProps = {
  clientData: any[];
};

export function SectionCards({ clientData }: SectionCardsProps) {
  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-3 justify-center">
      {/* Total Programs Card */}
      <GrowthStatsCard
        data={clientData}
        mode="programs"
        dateSelector={(item) => item.date}
        description="Total Programs"
        positiveLabel="Better growth this month"
        negativeLabel="Lower growth this month"
      />

      {/* New Clients Card */}
      <GrowthStatsCard
        data={clientData}
        mode="clients"
        dateSelector={(item) => item.date}
        uniqueField={(item) => item.client}
        description="New Clients"
        positiveLabel="New clients acquired"
        negativeLabel="Acquisition needs attention"
      />

      <DashboardCard />
    </div>
  );
}
