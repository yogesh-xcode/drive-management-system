import { serviceMap } from "@/lib/repositories/services";
import Papa from "papaparse";
import { saveAs } from "file-saver";
import { IconTableExport } from "@/lib/icons";
import { Button } from "@/components/ui/button";
import { JSX } from "react";
import { ExportButtonProps } from "@/types";

export function ExportButton({
  entity,
  fileName,
  children,
}: ExportButtonProps): JSX.Element {
  async function handleExport() {
    const service = serviceMap[entity];
    if (!service) {
      alert("Invalid export entity!");
      return;
    }
    const { data, error } = await service.get();
    if (error || !data) {
      alert("Failed to fetch data!");
      return;
    }
    const exportRows = data.map((row: Record<string, unknown>) =>
      Object.fromEntries(Object.entries(row).filter(([key]) => key !== "id")),
    );
    const csv = Papa.unparse(exportRows);
    saveAs(new Blob([csv], { type: "text/csv" }), fileName || `${entity}.csv`);
  }

  return (
    <Button type="button" className="gap-1.5 text-sm bg-none" onClick={handleExport}>
      <IconTableExport /> {children || `Export ${entity}`}
    </Button>
  );
}
