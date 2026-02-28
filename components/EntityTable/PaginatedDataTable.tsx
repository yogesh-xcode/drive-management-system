"use client";

import React, { ReactNode, useEffect, useMemo, useState } from "react";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type RowSelectionState,
  type SortingState,
  type VisibilityState,
  useReactTable,
} from "@tanstack/react-table";
import {
  IconAdjustmentsHorizontal,
  IconArrowsSort,
  IconChevronDown,
  IconChevronUp,
  IconTrash,
  IconX,
} from "@tabler/icons-react";
import { useQueryState } from "nuqs";

import { AddButton } from "@/components/Button/AddButton";
import { ExportButton } from "@/components/Button/ExportButton";
import { type FieldDef, SidePeak } from "@/components/SidePeak";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { serviceMap } from "@/lib/repositories/services";
import { cn } from "@/lib/utils";

export interface PaginatedDataTableProps<T extends Record<string, any>> {
  columns: ColumnDef<T>[];
  data: T[];
  dateAccessor: string;
  fields: FieldDef[];
  onAdd?: (values: T) => Promise<void>;
  onEdit?: (row: T, values: T) => Promise<void>;
  onDelete?: (row: T) => Promise<void>;
  title?: string;
  entity: keyof typeof serviceMap;
  immutableFields?: string[];
  rowsPerPage?: number;
  loading?: boolean;
  quickCreateOpen?: boolean;
  onQuickCreateOpenChange?: (open: boolean) => void;
  toolbarBeforeExport?: ReactNode;
}

type ColumnMeta = {
  id: string;
  label: string;
  type: "text" | "number" | "date" | "select";
};

function safeJsonParse<T>(value: string): T | null {
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

function normalizeText(value: unknown): string {
  if (value === null || value === undefined) return "";
  return String(value).toLowerCase();
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return "Operation failed. Please try again.";
}

function buildColumnMeta<T extends Record<string, any>>(
  columns: ColumnDef<T>[],
  fields: FieldDef[],
  sampleData: T[],
): ColumnMeta[] {
  const fieldByName = new Map(fields.map((f) => [f.name, f]));

  return columns
    .map((col) => {
      const accessorKey = (col as { accessorKey?: unknown }).accessorKey;
      const id =
        typeof col.id === "string"
          ? col.id
          : typeof accessorKey === "string"
            ? accessorKey
            : null;

      if (!id) return null;

      const field = fieldByName.get(id);
      const headerLabel =
        typeof col.header === "string" ? col.header : field?.label || id;

      let type: ColumnMeta["type"] = "text";
      if (field?.type === "date") type = "date";
      else if (field?.type === "number") type = "number";
      else if (field?.type === "select") type = "select";
      else {
        const sample = sampleData.find((row) => row[id] !== undefined)?.[id];
        if (typeof sample === "number") type = "number";
        else if (id.toLowerCase().includes("date")) type = "date";
      }

      return { id, label: headerLabel, type };
    })
    .filter((item): item is ColumnMeta => Boolean(item));
}

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
  toolbarBeforeExport,
}: PaginatedDataTableProps<T>) {
  const hasActions = Boolean(onEdit || onDelete);

  const columnMeta = useMemo(
    () => buildColumnMeta(columns, fields, data),
    [columns, fields, data],
  );

  const filterModalColumns = useMemo(
    () =>
      columnMeta.filter(
        (col) =>
          col.id !== "id" &&
          col.id !== "name" &&
          col.id !== "fullName" &&
          col.id !== "email" &&
          col.id !== "contact" &&
          col.id !== "programNo" &&
          col.id !== "opening",
      ),
    [columnMeta],
  );

  const columnIds = useMemo(() => columnMeta.map((c) => c.id), [columnMeta]);
  const columnTypeById = useMemo(
    () => new Map(columnMeta.map((c) => [c.id, c.type])),
    [columnMeta],
  );

  const defaultSort = `${dateAccessor}:desc`;

  const [searchQuery, setSearchQuery] = useQueryState<string>(
    `${entity}Search`,
    {
      parse: (v) => v ?? "",
      serialize: (v) => v,
      defaultValue: "",
      clearOnDefault: true,
      shallow: true,
      history: "replace",
    },
  );

  const [pageQuery, setPageQuery] = useQueryState<number>(`${entity}Page`, {
    parse: (v) => {
      const parsed = Number.parseInt(v, 10);
      return Number.isNaN(parsed) || parsed < 1 ? null : parsed;
    },
    serialize: (v) => String(v),
    defaultValue: 1,
    clearOnDefault: true,
    shallow: true,
    history: "replace",
  });

  const [sortQuery, setSortQuery] = useQueryState<string>(`${entity}Sort`, {
    parse: (v) => {
      const [id, dir] = v.split(":");
      if (!id || !columnIds.includes(id)) return defaultSort;
      if (dir !== "asc" && dir !== "desc") return `${id}:asc`;
      return `${id}:${dir}`;
    },
    serialize: (v) => v,
    defaultValue: defaultSort,
    clearOnDefault: true,
    shallow: true,
    history: "replace",
  });

  const [visibilityQuery, setVisibilityQuery] = useQueryState<string>(
    `${entity}Columns`,
    {
      parse: (v) => v,
      serialize: (v) => v,
      defaultValue: "",
      clearOnDefault: true,
      shallow: true,
      history: "replace",
    },
  );

  const [filtersQuery, setFiltersQuery] = useQueryState<string>(
    `${entity}Filters`,
    {
      parse: (v) => v,
      serialize: (v) => v,
      defaultValue: "",
      clearOnDefault: true,
      shallow: true,
      history: "replace",
    },
  );

  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [editRow, setEditRow] = useState<T | null>(null);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const [draftFilterColumn, setDraftFilterColumn] = useState<string>("");
  const [draftFilterValue, setDraftFilterValue] = useState<string>("");
  const draftColumnMeta = useMemo(
    () =>
      filterModalColumns.find((col) => col.id === draftFilterColumn) ?? null,
    [filterModalColumns, draftFilterColumn],
  );

  const activeTextFilters = useMemo(() => {
    if (!filtersQuery) return {} as Record<string, string>;
    const parsed = safeJsonParse<Record<string, string>>(filtersQuery);
    if (!parsed || typeof parsed !== "object")
      return {} as Record<string, string>;

    const normalized: Record<string, string> = {};
    for (const [id, value] of Object.entries(parsed)) {
      if (columnIds.includes(id) && value.trim()) {
        normalized[id] = value.trim();
      }
    }
    return normalized;
  }, [filtersQuery, columnIds]);

  const visibleIds = useMemo(() => {
    if (!visibilityQuery) return new Set(columnIds);
    const parsed = safeJsonParse<string[]>(visibilityQuery);
    if (!Array.isArray(parsed) || parsed.length === 0)
      return new Set(columnIds);
    const valid = parsed.filter((id) => columnIds.includes(id));
    return new Set(valid.length ? valid : columnIds);
  }, [visibilityQuery, columnIds]);

  const columnVisibility = useMemo<VisibilityState>(() => {
    const state: VisibilityState = {};
    for (const id of columnIds) state[id] = visibleIds.has(id);
    return state;
  }, [columnIds, visibleIds]);

  const [sortId, sortDir] = sortQuery.split(":");
  const sorting = useMemo<SortingState>(
    () => [
      {
        id: columnIds.includes(sortId) ? sortId : dateAccessor,
        desc: sortDir === "desc",
      },
    ],
    [sortId, sortDir, columnIds, dateAccessor],
  );

  const filteredData = useMemo(() => {
    const search = (searchQuery ?? "").trim().toLowerCase();
    return data.filter((row) => {
      if (search) {
        const hit = columnIds.some((id) =>
          normalizeText(row[id]).includes(search),
        );
        if (!hit) return false;
      }
      for (const [id, value] of Object.entries(activeTextFilters)) {
        const cell = normalizeText(row[id]);
        if (!cell.includes(value.toLowerCase())) return false;
      }
      return true;
    });
  }, [data, searchQuery, activeTextFilters, columnIds]);

  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      sorting,
      rowSelection,
      pagination: {
        pageIndex: Math.max(0, pageQuery - 1),
        pageSize: rowsPerPage,
      },
      columnVisibility,
    },
    onSortingChange: (updater) => {
      const next = typeof updater === "function" ? updater(sorting) : updater;
      const first = next[0];
      if (!first?.id) return;
      void setSortQuery(`${first.id}:${first.desc ? "desc" : "asc"}`);
      void setPageQuery(1);
    },
    onRowSelectionChange: setRowSelection,
    onPaginationChange: (updater) => {
      const current = {
        pageIndex: Math.max(0, pageQuery - 1),
        pageSize: rowsPerPage,
      };
      const next = typeof updater === "function" ? updater(current) : updater;
      void setPageQuery(next.pageIndex + 1);
    },
    enableRowSelection: true,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const rows = table.getRowModel().rows;
  const pageCount = Math.max(1, table.getPageCount());
  const page = table.getState().pagination.pageIndex + 1;
  const selectedRows = table.getFilteredSelectedRowModel().rows;

  useEffect(() => {
    if (page > pageCount) {
      void setPageQuery(pageCount);
    }
  }, [page, pageCount, setPageQuery]);

  const onSortColumn = (id: string) => {
    if (sortId !== id) {
      void setSortQuery(`${id}:asc`);
      void setPageQuery(1);
      return;
    }
    if (sortDir === "asc") {
      void setSortQuery(`${id}:desc`);
      void setPageQuery(1);
      return;
    }
    void setSortQuery(defaultSort);
    void setPageQuery(1);
  };

  const sortIcon = (id: string) => {
    if (sortId !== id) return null;
    return sortDir === "asc" ? (
      <IconChevronUp size={14} />
    ) : (
      <IconChevronDown size={14} />
    );
  };

  const toggleColumn = (id: string, checked: boolean) => {
    const next = new Set(visibleIds);
    if (checked) next.add(id);
    else if (next.size > 1) next.delete(id);

    const arr = columnIds.filter((colId) => next.has(colId));
    if (arr.length === columnIds.length) {
      void setVisibilityQuery("");
      return;
    }
    void setVisibilityQuery(JSON.stringify(arr));
  };

  const applyDraftFilter = () => {
    if (!draftFilterColumn || !draftFilterValue.trim()) return;
    const next = {
      ...activeTextFilters,
      [draftFilterColumn]: draftFilterValue.trim(),
    };
    void setFiltersQuery(JSON.stringify(next));
    void setPageQuery(1);
    setDraftFilterValue("");
  };

  const setExplicitFilterValue = (id: string, value: string) => {
    const next = { ...activeTextFilters };
    if (!value.trim()) {
      delete next[id];
    } else {
      next[id] = value.trim();
    }
    if (Object.keys(next).length === 0) {
      void setFiltersQuery("");
    } else {
      void setFiltersQuery(JSON.stringify(next));
    }
    void setPageQuery(1);
  };

  const getColumnDistinctOptions = (id: string) => {
    const options = Array.from(
      new Set(
        data
          .map((row) => row[id])
          .filter((value) => value !== null && value !== undefined)
          .map((value) => String(value).trim())
          .filter((value) => value.length > 0),
      ),
    ).sort((a, b) => a.localeCompare(b));
    return options.slice(0, 50);
  };

  const removeFilter = (id: string) => {
    const next = { ...activeTextFilters };
    delete next[id];
    if (Object.keys(next).length === 0) {
      void setFiltersQuery("");
    } else {
      void setFiltersQuery(JSON.stringify(next));
    }
    void setPageQuery(1);
  };

  const clearFilters = () => {
    void setFiltersQuery("");
    void setPageQuery(1);
  };

  const onDeleteSelected = async () => {
    if (!onDelete || selectedRows.length === 0 || isBulkDeleting) return;
    try {
      setActionError(null);
      setIsBulkDeleting(true);
      for (const row of selectedRows) {
        await onDelete(row.original);
      }
      setRowSelection({});
    } catch (error) {
      setActionError(getErrorMessage(error));
    } finally {
      setIsBulkDeleting(false);
    }
  };

  const pageNumbers = () => {
    if (pageCount <= 7)
      return Array.from({ length: pageCount }, (_, i) => i + 1);
    if (page <= 4) return [1, 2, 3, 4, 5, -1, pageCount];
    if (page >= pageCount - 3)
      return [
        1,
        -1,
        pageCount - 4,
        pageCount - 3,
        pageCount - 2,
        pageCount - 1,
        pageCount,
      ];
    return [1, -1, page - 1, page, page + 1, -1, pageCount];
  };

  const tableColCount =
    table.getVisibleLeafColumns().length + (hasActions ? 1 : 0) + 1;

  return (
    <div className="ml-5.5 flex w-[95.5%] flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Input
          placeholder="Search records..."
          value={searchQuery}
          onChange={(e) => {
            void setSearchQuery(e.target.value);
            void setPageQuery(1);
          }}
          className="h-9 w-full max-w-xs"
        />

        <div className="flex flex-wrap items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" type="button">
                <IconAdjustmentsHorizontal size={16} />
                Filters
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 p-3">
              <DropdownMenuLabel className="p-0">
                Column Filter
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="mt-2 grid grid-cols-12 gap-2">
                <div className="col-span-5">
                  <Select
                    value={draftFilterColumn}
                    onValueChange={setDraftFilterColumn}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Column" />
                    </SelectTrigger>
                    <SelectContent>
                      {filterModalColumns.map((col) => (
                        <SelectItem key={col.id} value={col.id}>
                          {col.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-5">
                  {draftColumnMeta?.type === "date" ? (
                    <Input
                      type="date"
                      value={draftFilterValue}
                      onChange={(e) => setDraftFilterValue(e.target.value)}
                    />
                  ) : (
                    <Select
                      value={draftFilterValue || "__none__"}
                      onValueChange={(value) =>
                        setDraftFilterValue(value === "__none__" ? "" : value)
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Option" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">Select option</SelectItem>
                        {(draftFilterColumn
                          ? getColumnDistinctOptions(draftFilterColumn)
                          : []
                        ).map((opt) => (
                          <SelectItem key={opt} value={opt}>
                            {opt}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
                <div className="col-span-2">
                  <Button
                    size="sm"
                    type="button"
                    onClick={applyDraftFilter}
                    className="w-full"
                  >
                    Add
                  </Button>
                </div>
              </div>

              <DropdownMenuSeparator className="my-3" />
              <DropdownMenuLabel className="p-0">
                All Column Filters
              </DropdownMenuLabel>
              <div className="mt-2 grid max-h-72 grid-cols-1 gap-2 overflow-auto pr-1">
                {filterModalColumns.map((col) => {
                  const value = activeTextFilters[col.id] ?? "";
                  const options = getColumnDistinctOptions(col.id);
                  return (
                    <div key={col.id} className="flex flex-col gap-1">
                      <label className="text-muted-foreground text-xs font-medium">
                        {col.label}
                      </label>
                      {col.type === "date" ? (
                        <Input
                          type="date"
                          value={value}
                          onChange={(e) =>
                            setExplicitFilterValue(col.id, e.target.value)
                          }
                        />
                      ) : (
                        <Select
                          value={value || "__all__"}
                          onValueChange={(next) =>
                            setExplicitFilterValue(
                              col.id,
                              next === "__all__" ? "" : next,
                            )
                          }
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder={`Filter ${col.label}`} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="__all__">All</SelectItem>
                            {options.map((opt) => (
                              <SelectItem key={opt} value={opt}>
                                {opt}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  );
                })}
              </div>

              {Object.keys(activeTextFilters).length > 0 && (
                <div className="mt-3 space-y-1">
                  {Object.entries(activeTextFilters).map(([id, value]) => (
                    <div
                      key={id}
                      className="flex items-center justify-between rounded border px-2 py-1 text-xs"
                    >
                      <span>
                        <strong>
                          {columnMeta.find((c) => c.id === id)?.label || id}:
                        </strong>{" "}
                        {value}
                      </span>
                      <button type="button" onClick={() => removeFilter(id)}>
                        <IconX size={12} />
                      </button>
                    </div>
                  ))}
                  <Button
                    variant="ghost"
                    size="sm"
                    type="button"
                    onClick={clearFilters}
                  >
                    Clear all
                  </Button>
                </div>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <IconArrowsSort size={16} /> Sort
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 p-3">
              <DropdownMenuLabel className="p-0">Sort</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="mt-2 grid grid-cols-2 gap-2">
                <Select
                  value={sortId}
                  onValueChange={(id) => {
                    void setSortQuery(
                      `${id}:${sortDir === "desc" ? "desc" : "asc"}`,
                    );
                    void setPageQuery(1);
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Column" />
                  </SelectTrigger>
                  <SelectContent>
                    {columnMeta.map((col) => (
                      <SelectItem key={col.id} value={col.id}>
                        {col.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={sortDir === "desc" ? "desc" : "asc"}
                  onValueChange={(dir) => {
                    void setSortQuery(`${sortId || dateAccessor}:${dir}`);
                    void setPageQuery(1);
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Order" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="asc">Ascending</SelectItem>
                    <SelectItem value="desc">Descending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {onAdd && (
            <AddButton<T>
              fields={fields}
              onSubmit={async (values) => {
                try {
                  setActionError(null);
                  await onAdd(values);
                } catch (error) {
                  setActionError(getErrorMessage(error));
                  throw error;
                }
              }}
              open={quickCreateOpen}
              onOpenChange={onQuickCreateOpenChange}
            >
              Add {title}
            </AddButton>
          )}

          {toolbarBeforeExport}

          <ExportButton entity={entity} />
        </div>
      </div>

      {actionError && <p className="text-sm text-destructive">{actionError}</p>}

      {selectedRows.length > 0 && (
        <div className="flex items-center justify-between rounded-md border bg-muted/25 px-3 py-2">
          <div className="text-sm">
            <strong>{selectedRows.length}</strong> selected
          </div>
          <div className="flex items-center gap-2">
            {onDelete && (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                disabled={isBulkDeleting}
                onClick={onDeleteSelected}
              >
                <IconTrash size={14} />
                {isBulkDeleting ? "Deleting..." : "Delete selected"}
              </Button>
            )}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => table.toggleAllRowsSelected(false)}
            >
              Clear
            </Button>
          </div>
        </div>
      )}

      {onEdit && editRow && (
        <SidePeak<T>
          key={(editRow as { id?: string })?.id || "new"}
          open={!!editRow}
          onOpenChange={(open) => !open && setEditRow(null)}
          mode="update"
          fields={fields}
          initialValues={editRow}
          immutable={immutableFields}
          onSubmit={async (values) => {
            try {
              setActionError(null);
              await onEdit(editRow, values);
              setEditRow(null);
            } catch (error) {
              setActionError(getErrorMessage(error));
              throw error;
            }
          }}
          closeOnSuccess
        />
      )}

      <div className="w-full overflow-hidden rounded-md border-2">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                <TableHead className="w-10 text-left">
                  <input
                    type="checkbox"
                    aria-label="Select all rows"
                    checked={table.getIsAllPageRowsSelected()}
                    ref={(el) => {
                      if (el)
                        el.indeterminate = table.getIsSomePageRowsSelected();
                    }}
                    onChange={(e) =>
                      table.toggleAllPageRowsSelected(e.target.checked)
                    }
                    className="size-4 accent-primary"
                  />
                </TableHead>

                {headerGroup.headers.map((header) => {
                  const accessor = (
                    header.column.columnDef as { accessorKey?: unknown }
                  ).accessorKey;
                  const id =
                    typeof accessor === "string"
                      ? accessor
                      : typeof header.column.id === "string"
                        ? header.column.id
                        : null;
                  const canSort = Boolean(id && columnIds.includes(id));

                  return (
                    <TableHead
                      key={header.id}
                      className={cn(
                        "px-8.5",
                        canSort && "cursor-pointer select-none",
                        id && columnTypeById.get(id) === "text"
                          ? "text-left"
                          : "text-center",
                      )}
                      onClick={() => {
                        if (canSort && id) onSortColumn(id);
                      }}
                    >
                      {header.isPlaceholder ? null : (
                        <div
                          className={cn(
                            "flex w-full items-center gap-1",
                            id && columnTypeById.get(id) === "text"
                              ? "justify-start pl-5"
                              : "justify-center",
                          )}
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                          {canSort && id ? sortIcon(id) : null}
                        </div>
                      )}
                    </TableHead>
                  );
                })}

                {hasActions && (
                  <TableHead className="px-4 text-center">Actions</TableHead>
                )}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={tableColCount}
                  className="h-24 text-center text-muted-foreground"
                >
                  Loading...
                </TableCell>
              </TableRow>
            ) : rows.length > 0 ? (
              rows.map((row, index) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() ? "selected" : undefined}
                  className={cn(
                    index % 2 === 0
                      ? "bg-background"
                      : "bg-muted/35 hover:bg-muted/50",
                  )}
                >
                  <TableCell className="w-10 text-center">
                    <input
                      type="checkbox"
                      aria-label="Select row"
                      checked={row.getIsSelected()}
                      onChange={(e) => row.toggleSelected(e.target.checked)}
                      className="size-4 accent-primary"
                    />
                  </TableCell>

                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={cn(
                        "px-4",
                        columnTypeById.get(cell.column.id) === "text"
                          ? "text-left"
                          : "text-center",
                      )}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}

                  {hasActions && (
                    <TableCell className="px-4 text-center">
                      {onEdit && (
                        <button
                          type="button"
                          onClick={() => setEditRow(row.original)}
                          className="mr-3 text-primary hover:underline"
                        >
                          Edit
                        </button>
                      )}
                      {onDelete && (
                        <button
                          type="button"
                          onClick={async () => {
                            try {
                              setActionError(null);
                              await onDelete(row.original);
                            } catch (error) {
                              setActionError(getErrorMessage(error));
                            }
                          }}
                          className="text-destructive hover:underline"
                        >
                          Delete
                        </button>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={tableColCount}
                  className="h-24 text-center text-muted-foreground"
                >
                  No results found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between gap-3">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                className="cursor-pointer"
                onClick={(e) => {
                  e.preventDefault();
                  table.previousPage();
                }}
              />
            </PaginationItem>

            {pageNumbers().map((num, idx) =>
              num === -1 ? (
                <PaginationItem key={`ellipsis-${idx}`}>
                  <PaginationEllipsis />
                </PaginationItem>
              ) : (
                <PaginationItem key={num}>
                  <PaginationLink
                    isActive={num === page}
                    onClick={(e) => {
                      e.preventDefault();
                      table.setPageIndex(num - 1);
                    }}
                    className={cn(
                      "cursor-pointer hover:bg-accent hover:text-accent-foreground",
                      num === page ? "bg-primary text-primary-foreground" : "",
                    )}
                  >
                    {num}
                  </PaginationLink>
                </PaginationItem>
              ),
            )}

            <PaginationItem>
              <PaginationNext
                className="cursor-pointer"
                onClick={(e) => {
                  e.preventDefault();
                  table.nextPage();
                }}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}
