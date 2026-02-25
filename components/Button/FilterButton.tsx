import { Button } from "@/components/ui/button";
import { IconFilter } from "@tabler/icons-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import React, { useState } from "react";
import { JSX } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface DateRangeFilterValue {
  from?: string;
  to?: string;
}

export type FilterValue = string | DateRangeFilterValue;

export interface FilterFieldConfig {
  accessorKey: string;
  header: string;
  type: "select" | "date";
  options?: string[];
}

export interface FilterButtonProps {
  filterableColumns: FilterFieldConfig[];
  title?: string;
  onApply: (filters: Record<string, FilterValue>) => void;
  onClear?: () => void;
  children?: React.ReactNode;
}

export const FilterButton = React.forwardRef<
  HTMLButtonElement,
  FilterButtonProps
>(function FilterButton(
  { filterableColumns, title, onApply, onClear, children }: FilterButtonProps,
  ref
) {
  const [filterOpen, setFilterOpen] = useState(false);
  const [tempFilters, setTempFilters] = useState<Record<string, FilterValue>>(
    {}
  );

  const handleApplyFilter = () => {
    onApply(tempFilters);
    setFilterOpen(false);
  };

  const handleClearFilter = () => {
    setTempFilters({});
    onClear?.();
    setFilterOpen(false);
  };

  return (
    <>
      <Button
        ref={ref}
        className="gap-1.5 text-sm"
        variant="default"
        type="button"
        onClick={() => setFilterOpen(true)}
      >
        <IconFilter />
        {children ?? "Filter"}
      </Button>
      <Dialog open={filterOpen} onOpenChange={setFilterOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Filter {title ? `${title}s` : "Records"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {filterableColumns.length === 0 && (
              <div className="text-sm text-muted-foreground">
                No filters available
              </div>
            )}
            {filterableColumns.map((col) => (
              <div key={col.accessorKey}>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  {typeof col.header === "string"
                    ? col.header
                    : String(col.accessorKey)}
                </label>
                {col.type === "date" ? (
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="date"
                      value={
                        typeof tempFilters[col.accessorKey] === "object"
                          ? (tempFilters[col.accessorKey] as DateRangeFilterValue)
                              .from || ""
                          : ""
                      }
                      onChange={(e) =>
                        setTempFilters((f) => ({
                          ...f,
                          [col.accessorKey]: {
                            ...((typeof f[col.accessorKey] === "object"
                              ? f[col.accessorKey]
                              : {}) as DateRangeFilterValue),
                            from: e.target.value,
                          },
                        }))
                      }
                    />
                    <Input
                      type="date"
                      value={
                        typeof tempFilters[col.accessorKey] === "object"
                          ? (tempFilters[col.accessorKey] as DateRangeFilterValue)
                              .to || ""
                          : ""
                      }
                      onChange={(e) =>
                        setTempFilters((f) => ({
                          ...f,
                          [col.accessorKey]: {
                            ...((typeof f[col.accessorKey] === "object"
                              ? f[col.accessorKey]
                              : {}) as DateRangeFilterValue),
                            to: e.target.value,
                          },
                        }))
                      }
                    />
                  </div>
                ) : (
                  <Select
                    value={
                      typeof tempFilters[col.accessorKey] === "string" &&
                      tempFilters[col.accessorKey]
                        ? (tempFilters[col.accessorKey] as string)
                        : "__all__"
                    }
                    onValueChange={(value) =>
                      setTempFilters((f) => ({
                        ...f,
                        [col.accessorKey]: value === "__all__" ? "" : value,
                      }))
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue
                        placeholder={`Select ${col.header || col.accessorKey}`}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__all__">All</SelectItem>
                      {(col.options || []).map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            ))}
          </div>
          <DialogFooter className="gap-2">
            <Button onClick={handleClearFilter} type="button" variant="ghost">
              Clear
            </Button>
            <Button onClick={handleApplyFilter} type="button">
              Apply
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}) as (
  props: FilterButtonProps & { ref?: React.Ref<HTMLButtonElement> }
) => JSX.Element;
