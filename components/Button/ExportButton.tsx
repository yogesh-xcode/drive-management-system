import { serviceMap } from "@/lib/repositories/services";
import Papa from "papaparse";
import { saveAs } from "file-saver";
import { IconTableExport } from "@tabler/icons-react";
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
    const csv = Papa.unparse(data);
    saveAs(new Blob([csv], { type: "text/csv" }), fileName || `${entity}.csv`);
  }

  return (
    <Button className="gap-1.5 text-sm bg-none" onClick={handleExport}>
      <IconTableExport /> {children || `Export ${entity}`}
    </Button>
  );
}
