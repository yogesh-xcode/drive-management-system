"use client";
import React, { useState } from "react";
import {
  flexRender,
  FilterFn,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  getFilteredRowModel,
  SortingState,
  ColumnDef,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AnimatePresence, motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { AddButton } from "@/components/Button/AddButton";
import { ExportButton } from "@/components/Button/ExportButton";
import {
  DateRangeFilterValue,
  FilterButton,
  FilterValue,
} from "@/components/Button/FilterButton";
import { SidePeak } from "@/components/SidePeak";
import { cn } from "@/lib/utils";
import { serviceMap } from "@/lib/repositories/services";
import { Button } from "@/components/ui/button";
import { IconX } from "@tabler/icons-react";
import dayjs from "dayjs";

export interface DataTableProps<T extends Record<string, any>> {
  columns: ColumnDef<T>[];
  data: T[];
  dateAccessor: string;
  fields: any[];
  onAdd?: (values: T) => Promise<void>;
  onEdit?: (row: T, values: T) => Promise<void>;
  onDelete?: (row: T) => Promise<void>;
  title?: string;
  entity: keyof typeof serviceMap;
  immutableFields?: string[];
  addButtonOpen?: boolean;
  onAddButtonOpenChange?: (open: boolean) => void;
  loading?: boolean;
}

const FILTER_EXCLUDE_BY_ENTITY: Partial<
  Record<keyof typeof serviceMap, string[]>
> = {
  candidate: ["fullName"],
  client: ["opening", "contact"],
  staff: ["name", "email"],
};

const DATE_RANGE_FILTER: FilterFn<any> = (row, columnId, filterValue) => {
  const rawValue = row.getValue(columnId);
  const rowDate = dayjs(rawValue as string | number | Date);
  if (!rowDate.isValid()) return false;

  const value = (filterValue || {}) as DateRangeFilterValue;
  if (value.from && rowDate.isBefore(dayjs(value.from), "day")) return false;
  if (value.to && rowDate.isAfter(dayjs(value.to), "day")) return false;
  return true;
};

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  dateAccessor = "date",
  fields,
  onAdd,
  onEdit,
  onDelete,
  title = "Record",
  entity,
  immutableFields = [],
  loading,
  addButtonOpen,
  onAddButtonOpenChange,
}: DataTableProps<T>) {
  const hasActions = Boolean(onEdit || onDelete);
  const tableColCount = columns.length + (hasActions ? 1 : 0) + 2;

  const [sorting, setSorting] = useState<SortingState>([
    { id: dateAccessor, desc: true },
  ]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [columnFilters, setColumnFilters] = useState<any[]>([]);
  const [editRow, setEditRow] = useState<T | null>(null);

  const fieldTypeMap = new Map(
    (fields || [])
      .filter((field: any) => field?.name)
      .map((field: any) => [String(field.name), field?.type || "text"]),
  );

  const isIdLikeField = (accessorKey: string) =>
    accessorKey === "id" ||
    accessorKey === "programNo" ||
    accessorKey.toLowerCase().endsWith("id");

  const isDateField = (accessorKey: string) =>
    fieldTypeMap.get(accessorKey) === "date" ||
    accessorKey.toLowerCase().includes("date");

  const excludedFilterKeys = new Set(FILTER_EXCLUDE_BY_ENTITY[entity] || []);

  const filterableColumns = columns
    .filter((col) => typeof (col as any).accessorKey === "string")
    .map((col) => {
      const accessorKey = String((col as any).accessorKey);
      if (isIdLikeField(accessorKey) || excludedFilterKeys.has(accessorKey))
        return null;

      const header = typeof col.header === "string" ? col.header : accessorKey;
      if (isDateField(accessorKey)) {
        return { accessorKey, header, type: "date" as const };
      }

      const options = Array.from(
        new Set(
          data
            .map((row) => row[accessorKey])
            .filter((value) => value !== null && value !== undefined)
            .map((value) => String(value).trim())
            .filter((value) => value.length > 0),
        ),
      ).sort((a, b) => a.localeCompare(b));

      return options.length > 0
        ? { accessorKey, header, type: "select" as const, options }
        : null;
    })
    .filter(Boolean);

  const dateFilterKeys = new Set(
    filterableColumns
      .filter((col) => col?.type === "date")
      .map((col) => col!.accessorKey),
  );

  const enhancedColumns = columns.map((col) => {
    const accessorKey = (col as any).accessorKey;
    if (typeof accessorKey === "string" && dateFilterKeys.has(accessorKey)) {
      return {
        ...col,
        filterFn: DATE_RANGE_FILTER,
      };
    }
    return col;
  });

  // TanStack Table
  const table = useReactTable({
    data,
    columns: enhancedColumns,
    state: { sorting, globalFilter, columnFilters },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <div className="space-y-4 flex flex-col w-[95.7%]">
      {/* Top Bar */}
      <div className="flex">
        <Input
          placeholder="Search"
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="w-full mr-8"
        />
        <div className="flex gap-4">
          {onAdd && (
            <AddButton<T>
              fields={fields}
              onSubmit={async (values) => {
                await onAdd(values);
              }}
              open={addButtonOpen}
              onOpenChange={onAddButtonOpenChange}
            >
              Add {title}
            </AddButton>
          )}

          {/* Filter/Clear swap */}
          {columnFilters.length === 0 ? (
            <FilterButton
              filterableColumns={filterableColumns}
              title={title}
              onApply={(filtersObj) => {
                const nextFilters = Object.entries(
                  filtersObj as Record<string, FilterValue>,
                ).reduce<Array<{ id: string; value: unknown }>>(
                  (acc, [id, value]) => {
                    if (typeof value === "string") {
                      const normalized = value.trim();
                      if (normalized) {
                        acc.push({ id, value: normalized });
                      }
                      return acc;
                    }

                    const from = value?.from?.trim();
                    const to = value?.to?.trim();
                    if (from || to) {
                      acc.push({ id, value: { from, to } });
                    }

                    return acc;
                  },
                  [],
                );

                setColumnFilters(nextFilters);
              }}
              onClear={() => setColumnFilters([])}
            >
              Filter
            </FilterButton>
          ) : (
            <Button
              variant="outline"
              className="gap-1.5 text-sm text-destructive border-destructive/30 hover:bg-destructive/10"
              type="button"
              onClick={() => setColumnFilters([])}
            >
              <IconX size={18} /> Clear
            </Button>
          )}

          <ExportButton entity={entity} />
        </div>
      </div>

      {/* Edit Modal */}
      {onEdit && editRow && (
        <SidePeak<T>
          key={
            ((editRow as any)?.id ||
              (editRow as any)?.programNo ||
              "new") as React.Key
          }
          open={!!editRow}
          onOpenChange={(o) => !o && setEditRow(null)}
          mode="update"
          fields={fields}
          initialValues={editRow}
          immutable={immutableFields}
          onSubmit={async (values) => {
            await onEdit(editRow, values);
            setEditRow(null);
          }}
          closeOnSuccess
        />
      )}

      {/* Table with striped rows */}
      <div className={cn("rounded-md border-2")}>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                <TableHead aria-hidden className="w-[3%] p-0" />
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="cursor-pointer select-none"
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    {header.isPlaceholder ? null : (
                      <div className="flex w-full items-center justify-start gap-1 pl-2 text-left">
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                        {{
                          asc: " 🔼",
                          desc: " 🔽",
                        }[header.column.getIsSorted() as string] ?? null}
                      </div>
                    )}
                  </TableHead>
                ))}
                {(onEdit || onDelete) && (
                  <TableHead>
                    <div className="w-full pl-2 text-left">Actions</div>
                  </TableHead>
                )}
                <TableHead aria-hidden className="w-[3%] p-0" />
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.tr>
                  <TableCell
                    colSpan={tableColCount}
                    className="h-24 text-center"
                  >
                    <span className="inline-block animate-spin text-primary text-3xl">
                      ⏳
                    </span>
                    <span className="text-2xl">
                      <motion.span
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                      >
                        🔍
                      </motion.span>
                    </span>
                    <span className="block mt-2 text-muted-foreground font-mono">
                      Loading...
                    </span>
                  </TableCell>
                </motion.tr>
              ) : table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row, idx) => (
                  <motion.tr
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.5 }}
                    className={cn(
                      idx % 2 === 0
                        ? "bg-background"
                        : "bg-muted/35 hover:bg-muted/50",
                    )}
                  >
                    <TableCell aria-hidden className="w-[3%] p-0" />
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        <div className="w-full pl-2 text-left">
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </div>
                      </TableCell>
                    ))}
                    {(onEdit || onDelete) && (
                      <TableCell>
                        <div className="w-full pl-2 text-left">
                          {onEdit && (
                            <button
                              onClick={() => setEditRow(row.original)}
                              className="mr-2 text-primary hover:underline"
                            >
                              Edit
                            </button>
                          )}
                          {onDelete && (
                            <button
                              onClick={() => onDelete(row.original)}
                              className="text-destructive hover:underline"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </TableCell>
                    )}
                    <TableCell aria-hidden className="w-[3%] p-0" />
                  </motion.tr>
                ))
              ) : (
                <motion.tr
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <TableCell
                    colSpan={tableColCount}
                    className="h-24 text-center text-muted-foreground"
                  >
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-2xl">🔍</span>
                      <span className="font-mono text-sm">
                        No results found.
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Try adjusting your search or add a new{" "}
                        {title?.toLowerCase?.() || "record"}.
                      </span>
                      {onAdd && (
                        <div className="mt-2">
                          <AddButton<T>
                            fields={fields}
                            onSubmit={async (values) => {
                              await onAdd(values);
                            }}
                            open={addButtonOpen}
                            onOpenChange={onAddButtonOpenChange}
                          >
                            Add {title}
                          </AddButton>
                        </div>
                      )}
                    </div>
                  </TableCell>
                </motion.tr>
              )}
            </AnimatePresence>
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
