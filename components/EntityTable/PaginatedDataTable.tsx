"use client";
import React, { useEffect, useMemo, useState } from "react";
import {
  flexRender,
  FilterFn,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  getFilteredRowModel,
  SortingState,
  ColumnDef,
  ColumnFiltersState,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
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
import { Button } from "@/components/ui/button";
import { IconX } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { serviceMap } from "@/lib/repositories/services";
import dayjs from "dayjs";

export interface PaginatedDataTableProps<T extends Record<string, any>> {
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
  rowsPerPage?: number;
  loading?: boolean;

  // ✅ Add these two props
  quickCreateOpen?: boolean;
  onQuickCreateOpenChange?: (open: boolean) => void;
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

  if (value.from && rowDate.isBefore(dayjs(value.from), "day")) {
    return false;
  }

  if (value.to && rowDate.isAfter(dayjs(value.to), "day")) {
    return false;
  }

  return true;
};

export function PaginatedDataTable<T extends Record<string, any>>({
  columns,
  data,
  dateAccessor,
  fields,
  onAdd,
  onEdit,
  onDelete,
  title = "Record",
  entity,
  immutableFields = [],
  rowsPerPage = 10,
  loading,
  quickCreateOpen,
  onQuickCreateOpenChange,
}: PaginatedDataTableProps<T>) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: dateAccessor, desc: true },
  ]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [editRow, setEditRow] = useState<T | null>(null);
  const [page, setPage] = useState(1);
  const hasActions = Boolean(onEdit || onDelete);

  const fieldTypeMap = useMemo(
    () =>
      new Map(
        (fields || [])
          .filter((field: any) => field?.name)
          .map((field: any) => [String(field.name), field?.type || "text"]),
      ),
    [fields],
  );

  const isIdLikeField = (accessorKey: string) =>
    accessorKey === "id" ||
    accessorKey === "programNo" ||
    accessorKey.toLowerCase().endsWith("id");

  const isDateField = (accessorKey: string) =>
    fieldTypeMap.get(accessorKey) === "date" ||
    accessorKey.toLowerCase().includes("date");

  const excludedFilterKeys = useMemo(
    () => new Set(FILTER_EXCLUDE_BY_ENTITY[entity] || []),
    [entity],
  );

  // Filter configs (dropdown/date); ID-like fields intentionally excluded
  const filterableColumns = useMemo(
    () =>
      columns
        .filter((col) => typeof (col as any).accessorKey === "string")
        .map((col) => {
          const accessorKey = String((col as any).accessorKey);
          if (
            isIdLikeField(accessorKey) ||
            excludedFilterKeys.has(accessorKey)
          ) {
            return null;
          }

          const header =
            typeof col.header === "string" ? col.header : accessorKey;

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
            ? {
                accessorKey,
                header,
                type: "select" as const,
                options,
              }
            : null;
        })
        .filter(Boolean),
    [columns, data, fields, excludedFilterKeys],
  );

  const dateFilterKeys = useMemo(
    () =>
      new Set(
        filterableColumns
          .filter((col) => col?.type === "date")
          .map((col) => col!.accessorKey),
      ),
    [filterableColumns],
  );

  const enhancedColumns = useMemo(
    () =>
      columns.map((col) => {
        const accessorKey = (col as any).accessorKey;
        if (
          typeof accessorKey === "string" &&
          dateFilterKeys.has(accessorKey)
        ) {
          return {
            ...col,
            filterFn: DATE_RANGE_FILTER,
          };
        }
        return col;
      }),
    [columns, dateFilterKeys],
  );

  // Table instance
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

  const rows = table.getRowModel().rows;
  const pageCount = Math.max(1, Math.ceil(rows.length / rowsPerPage));
  const paginatedRows = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return rows.slice(start, start + rowsPerPage);
  }, [page, rows, rowsPerPage]);
  const fillerRowCount = Math.max(0, rowsPerPage - paginatedRows.length);
  const tableColCount = columns.length + (hasActions ? 1 : 0) + 2;

  useEffect(() => {
    if (page > pageCount) {
      setPage(pageCount);
    }
  }, [page, pageCount]);

  useEffect(() => {
    setPage(1);
  }, [globalFilter, columnFilters, data.length]);

  return (
    <div className="flex flex-col gap-3 w-[95.5%] ml-5.5">
      {/* Top Bar */}
      <div className="flex items-center justify-between gap-4">
        <Input
          placeholder="Search"
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="w-full"
        />
        <div className="flex gap-3">
          {onAdd && (
            <div className="mt-2">
              <AddButton<T>
                fields={fields}
                onSubmit={onAdd}
                open={quickCreateOpen} // ✅ add this
                onOpenChange={onQuickCreateOpenChange} // ✅ add this
              >
                Add {title}
              </AddButton>
            </div>
          )}

          {columnFilters.length === 0 ? (
            <div className="mt-2">
              <FilterButton
                filterableColumns={filterableColumns}
                title={title}
                onApply={(filtersObj) => {
                  const nextFilters = Object.entries(
                    filtersObj as Record<string, FilterValue>,
                  ).reduce<ColumnFiltersState>((acc, [id, value]) => {
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
                  }, []);

                  setColumnFilters(nextFilters);
                }}
                onClear={() => setColumnFilters([])}
              >
                Filter
              </FilterButton>
            </div>
          ) : (
            <div className="mt-2">
              <Button
                variant="outline"
                className="gap-1.5 text-sm text-destructive border-destructive/30 hover:bg-destructive/10"
                type="button"
                onClick={() => setColumnFilters([])}
              >
                <IconX size={18} /> Clear
              </Button>
            </div>
          )}
          <div className="mt-2">
            <ExportButton entity={entity} />
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {onEdit && editRow && (
        <SidePeak<T>
          key={(editRow as any)?.id || "new"}
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

      {/* Table */}
      <div className={cn("rounded-md border-2 w-full")}>
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
                        {header.column.getIsSorted() === "asc"
                          ? " 🔼"
                          : header.column.getIsSorted() === "desc"
                            ? " 🔽"
                            : null}
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
                    <span className="block mt-2 text-muted-foreground font-mono">
                      Loading...
                    </span>
                  </TableCell>
                </motion.tr>
              ) : paginatedRows.length ? (
                <>
                  {paginatedRows.map((row, idx) => (
                    <motion.tr
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.4 }}
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
                  ))}
                  {Array.from({ length: fillerRowCount }, (_, idx) => (
                    <TableRow
                      key={`filler-row-${idx}`}
                      className={cn(
                        (paginatedRows.length + idx) % 2 === 0
                          ? "bg-background"
                          : "bg-muted/35 hover:bg-muted/50 ",
                        "border-none",
                      )}
                    >
                      {Array.from({
                        length: tableColCount,
                      }).map((_, cellIdx) => (
                        <TableCell key={`filler-cell-${idx}-${cellIdx}`}>
                          &nbsp;
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </>
              ) : (
                <>
                  <motion.tr
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="bg-background"
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
                            <AddButton<T> fields={fields} onSubmit={onAdd}>
                              Add {title}
                            </AddButton>
                          </div>
                        )}
                      </div>
                    </TableCell>
                  </motion.tr>
                  {Array.from(
                    { length: Math.max(0, rowsPerPage - 1) },
                    (_, idx) => (
                      <TableRow
                        key={`empty-filler-row-${idx}`}
                        className={cn(
                          (idx + 1) % 2 === 0
                            ? "bg-background"
                            : "bg-muted/35 hover:bg-muted/50",
                        )}
                      >
                        {Array.from({
                          length: tableColCount,
                        }).map((_, cellIdx) => (
                          <TableCell
                            key={`empty-filler-cell-${idx}-${cellIdx}`}
                          >
                            &nbsp;
                          </TableCell>
                        ))}
                      </TableRow>
                    ),
                  )}
                </>
              )}
            </AnimatePresence>
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              className="cursor-pointer"
              onClick={(e) => {
                e.preventDefault();
                setPage((p) => Math.max(1, p - 1));
              }}
            />
          </PaginationItem>
          {Array.from({ length: pageCount }, (_, i) => i).map((i) => (
            <PaginationItem key={i}>
              <PaginationLink
                isActive={i + 1 === page}
                onClick={(e) => {
                  e.preventDefault();
                  setPage(i + 1);
                }}
                className={cn(
                  "cursor-pointer hover:bg-accent hover:text-accent-foreground",
                  page === i + 1 ? "bg-primary text-primary-foreground" : "",
                )}
              >
                {i + 1}
              </PaginationLink>
            </PaginationItem>
          ))}
          <PaginationItem>
            <PaginationNext
              className="cursor-pointer"
              onClick={(e) => {
                e.preventDefault();
                setPage((p) => Math.min(pageCount, p + 1));
              }}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
