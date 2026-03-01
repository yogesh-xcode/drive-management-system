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
  IconPrinter,
  IconTrash,
  IconX,
} from "@/lib/icons";
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
import { DatePicker } from "@/components/ui/date-picker";
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
import { getEntityFilterConfig } from "@/lib/filter-config";
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

type FilterOperator =
  | "contains"
  | "equals"
  | "startsWith"
  | "endsWith"
  | "before"
  | "after";

type FilterCriterion = {
  value: string;
  operator: FilterOperator;
};

type FilterMap = Record<string, FilterCriterion>;
type PrimaryFilter = {
  columnId: string;
  criterion: FilterCriterion;
} | null;

const TEXT_FILTER_OPERATORS: Array<{ label: string; value: FilterOperator }> = [
  { label: "Contains", value: "contains" },
  { label: "Equals", value: "equals" },
  { label: "Starts with", value: "startsWith" },
  { label: "Ends with", value: "endsWith" },
];

const DATE_FILTER_OPERATORS: Array<{ label: string; value: FilterOperator }> = [
  { label: "On", value: "equals" },
  { label: "Before", value: "before" },
  { label: "After", value: "after" },
];

function normalizeFilterMap(filters: FilterMap): FilterMap {
  const next: FilterMap = {};
  for (const [id, criterion] of Object.entries(filters)) {
    const value = criterion?.value?.trim?.() ?? "";
    if (!value) continue;
    next[id] = {
      value,
      operator: criterion?.operator ?? "contains",
    };
  }
  return next;
}

function toComparableDate(value: string): number | null {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  ).getTime();
}

function matchesFilter(cellRaw: unknown, criterion: FilterCriterion): boolean {
  const cell = normalizeText(cellRaw);
  const filterValue = criterion.value.toLowerCase();

  switch (criterion.operator) {
    case "equals":
      return cell === filterValue;
    case "startsWith":
      return cell.startsWith(filterValue);
    case "endsWith":
      return cell.endsWith(filterValue);
    case "before": {
      const cellDate = toComparableDate(String(cellRaw ?? ""));
      const filterDate = toComparableDate(criterion.value);
      if (cellDate === null || filterDate === null) return false;
      return cellDate < filterDate;
    }
    case "after": {
      const cellDate = toComparableDate(String(cellRaw ?? ""));
      const filterDate = toComparableDate(criterion.value);
      if (cellDate === null || filterDate === null) return false;
      return cellDate > filterDate;
    }
    case "contains":
    default:
      return cell.includes(filterValue);
  }
}

function filterOperatorLabel(operator: FilterOperator): string {
  switch (operator) {
    case "equals":
      return "is";
    case "startsWith":
      return "starts with";
    case "endsWith":
      return "ends with";
    case "before":
      return "before";
    case "after":
      return "after";
    case "contains":
    default:
      return "contains";
  }
}

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

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatPrintValue(type: ColumnMeta["type"], value: unknown): string {
  if (value === null || value === undefined || value === "") return "-";
  if (type === "date") {
    const date = new Date(String(value));
    if (!Number.isNaN(date.getTime())) {
      return date.toLocaleDateString("en-GB");
    }
  }
  return String(value);
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

  const entityFilterConfig = useMemo(() => getEntityFilterConfig(entity), [entity]);
  const primaryFilterColumns = useMemo(() => {
    const configured = entityFilterConfig.primary.columns;
    if (!configured.length) return columnMeta;
    const allowed = new Set(configured);
    return columnMeta.filter((col) => allowed.has(col.id));
  }, [columnMeta, entityFilterConfig]);
  const advancedFilterColumns = useMemo(() => {
    const configured = entityFilterConfig.advanced.columns;
    if (!configured || configured.length === 0) return columnMeta;
    const allowed = new Set(configured);
    return columnMeta.filter((col) => allowed.has(col.id));
  }, [columnMeta, entityFilterConfig]);

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
  const [primaryFilterQuery, setPrimaryFilterQuery] = useQueryState<string>(
    `${entity}PrimaryFilter`,
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
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);

  const [draftFilterColumn, setDraftFilterColumn] = useState<string>("");
  const [draftFilterOperator, setDraftFilterOperator] =
    useState<FilterOperator>("contains");
  const [draftFilterValue, setDraftFilterValue] = useState<string>("");
  const draftColumnMeta = useMemo(
    () =>
      advancedFilterColumns.find((col) => col.id === draftFilterColumn) ?? null,
    [advancedFilterColumns, draftFilterColumn],
  );

  useEffect(() => {
    if (!draftFilterColumn) return;
    if (draftColumnMeta?.type === "date") {
      if (!["equals", "before", "after"].includes(draftFilterOperator)) {
        setDraftFilterOperator("equals");
      }
      return;
    }
    if (["before", "after"].includes(draftFilterOperator)) {
      setDraftFilterOperator("contains");
    }
  }, [draftFilterColumn, draftColumnMeta, draftFilterOperator]);

  useEffect(() => {
    if (!draftFilterColumn) return;
    if (advancedFilterColumns.some((col) => col.id === draftFilterColumn)) return;
    setDraftFilterColumn("");
    setDraftFilterValue("");
  }, [draftFilterColumn, advancedFilterColumns]);

  const activeFilters = useMemo(() => {
    if (!filtersQuery) return {} as FilterMap;
    const parsed = safeJsonParse<Record<string, unknown>>(filtersQuery);
    if (!parsed || typeof parsed !== "object") return {} as FilterMap;

    const next: FilterMap = {};
    for (const [id, raw] of Object.entries(parsed)) {
      if (!columnIds.includes(id)) continue;

      if (typeof raw === "string") {
        const value = raw.trim();
        if (!value) continue;
        next[id] = { value, operator: "contains" };
        continue;
      }

      if (raw && typeof raw === "object") {
        const value = String((raw as { value?: unknown }).value ?? "").trim();
        const operator = (raw as { operator?: FilterOperator }).operator;
        if (!value) continue;
        next[id] = {
          value,
          operator: operator ?? "contains",
        };
      }
    }
    return normalizeFilterMap(next);
  }, [filtersQuery, columnIds]);
  const activePrimaryFilter = useMemo(() => {
    if (!primaryFilterQuery) return null;
    const parsed = safeJsonParse<{
      columnId?: unknown;
      criterion?: { value?: unknown; operator?: FilterOperator };
    }>(primaryFilterQuery);
    if (!parsed) return null;
    const columnId = String(parsed.columnId ?? "");
    if (!columnId || !columnIds.includes(columnId)) return null;

    const value = String(parsed.criterion?.value ?? "").trim();
    if (!value) return null;

    return {
      columnId,
      criterion: {
        value,
        operator: parsed.criterion?.operator ?? "equals",
      },
    };
  }, [primaryFilterQuery, columnIds]);
  const [pendingFilters, setPendingFilters] = useState<FilterMap>({});
  const [primaryDraftColumn, setPrimaryDraftColumn] = useState<string>("");
  const [primaryDraftValue, setPrimaryDraftValue] = useState<string>("");
  const pendingActiveFilters = useMemo(
    () => normalizeFilterMap(pendingFilters),
    [pendingFilters],
  );
  const primaryDraftColumnMeta = useMemo(
    () =>
      primaryFilterColumns.find((col) => col.id === primaryDraftColumn) ?? null,
    [primaryFilterColumns, primaryDraftColumn],
  );

  useEffect(() => {
    if (!primaryDraftColumn) return;
    if (primaryFilterColumns.some((col) => col.id === primaryDraftColumn)) return;
    setPrimaryDraftColumn("");
    setPrimaryDraftValue("");
  }, [primaryDraftColumn, primaryFilterColumns]);

  const hasPendingFilterChanges = useMemo(() => {
    const normalize = (obj: FilterMap) =>
      JSON.stringify(
        Object.entries(normalizeFilterMap(obj))
          .map(([id, criterion]) => [id, criterion.value, criterion.operator])
          .sort(([a], [b]) => a.localeCompare(b)),
      );
    const activePrimary = activePrimaryFilter
      ? `${activePrimaryFilter.columnId}:${activePrimaryFilter.criterion.value}`
      : "";
    const draftPrimary = primaryDraftValue.trim()
      ? `${primaryDraftColumn}:${primaryDraftValue.trim()}`
      : "";

    return (
      normalize(pendingFilters) !== normalize(activeFilters) ||
      activePrimary !== draftPrimary
    );
  }, [
    pendingFilters,
    activeFilters,
    activePrimaryFilter,
    primaryDraftColumn,
    primaryDraftValue,
  ]);

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
      if (
        activePrimaryFilter &&
        !matchesFilter(
          row[activePrimaryFilter.columnId],
          activePrimaryFilter.criterion,
        )
      ) {
        return false;
      }
      for (const [id, criterion] of Object.entries(activeFilters)) {
        if (!matchesFilter(row[id], criterion)) return false;
      }
      return true;
    });
  }, [data, searchQuery, activeFilters, columnIds, activePrimaryFilter]);

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
    const operator: FilterOperator =
      draftColumnMeta?.type === "date"
        ? ["equals", "before", "after"].includes(draftFilterOperator)
          ? draftFilterOperator
          : "equals"
        : ["before", "after"].includes(draftFilterOperator)
          ? "contains"
          : draftFilterOperator;

    setPendingFilters((prev) => ({
      ...prev,
      [draftFilterColumn]: {
        value: draftFilterValue.trim(),
        operator,
      },
    }));
    setDraftFilterValue("");
  };

  const applyPendingFilters = () => {
    const next = normalizeFilterMap(pendingFilters);
    if (Object.keys(next).length === 0) {
      void setFiltersQuery("");
    } else {
      void setFiltersQuery(JSON.stringify(next));
    }

    const primaryValue = primaryDraftValue.trim();
    if (!primaryDraftColumn || !primaryValue) {
      void setPrimaryFilterQuery("");
    } else {
      const nextPrimary: PrimaryFilter = {
        columnId: primaryDraftColumn,
        criterion: {
          value: primaryValue,
          operator: "equals",
        },
      };
      void setPrimaryFilterQuery(JSON.stringify(nextPrimary));
    }

    void setPageQuery(1);
    setIsFilterMenuOpen(false);
  };

  const clearPendingFilters = () => {
    setPendingFilters({});
    setPrimaryDraftColumn("");
    setPrimaryDraftValue("");
  };

  const removePendingFilter = (id: string) => {
    setPendingFilters((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
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
    return options.slice(0, 100);
  };

  const clearFilters = () => {
    void setFiltersQuery("");
    void setPrimaryFilterQuery("");
    void setPageQuery(1);
    setPendingFilters({});
    setPrimaryDraftColumn("");
    setPrimaryDraftValue("");
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

  const printableColumns = useMemo(
    () => columnMeta.filter((col) => visibleIds.has(col.id)),
    [columnMeta, visibleIds],
  );

  const handlePrint = () => {
    if (filteredData.length === 0) {
      setActionError("No rows available to print.");
      return;
    }

    const titleText = `${title} Report`;
    const printedAt = new Date().toLocaleString("en-GB");
    const headers = printableColumns
      .map((col) => `<th>${escapeHtml(col.label)}</th>`)
      .join("");

    const rowsHtml = filteredData
      .map((row) => {
        const cells = printableColumns
          .map((col) => {
            const value = formatPrintValue(col.type, row[col.id]);
            return `<td>${escapeHtml(value)}</td>`;
          })
          .join("");
        return `<tr>${cells}</tr>`;
      })
      .join("");

    const html = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>${escapeHtml(titleText)}</title>
    <style>
      @page { size: A4 landscape; margin: 16mm; }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        font-family: "Segoe UI", Arial, sans-serif;
        color: #1f2937;
        background: #ffffff;
      }
      .watermark {
        position: fixed;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        pointer-events: none;
        z-index: 2;
      }
      .watermark span {
        color: rgba(107, 114, 128, 0.08);
        font-size: 84px;
        font-weight: 800;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        white-space: nowrap;
        transform: rotate(-28deg);
        filter: blur(2.4px);
      }
      .content {
        position: relative;
        z-index: 1;
      }
      .header {
        display: flex;
        align-items: baseline;
        justify-content: space-between;
        margin-bottom: 12px;
      }
      h1 {
        font-size: 20px;
        margin: 0;
      }
      .meta {
        color: #6b7280;
        font-size: 12px;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        border: 1px solid #d1d5db;
        font-size: 12px;
      }
      thead th {
        background: #f3f4f6;
        text-align: left;
        font-weight: 700;
        border: 1px solid #d1d5db;
        padding: 8px;
      }
      tbody td {
        border: 1px solid #e5e7eb;
        padding: 7px 8px;
        vertical-align: top;
      }
      tbody tr:nth-child(even) td {
        background: #fafafa;
      }
    </style>
  </head>
  <body>
    <div class="watermark"><span>◉ DRIVEMS SUITE</span></div>
    <div class="content">
      <div class="header">
        <h1>${escapeHtml(titleText)}</h1>
        <div class="meta">Printed: ${escapeHtml(printedAt)}</div>
      </div>
      <table>
        <thead><tr>${headers}</tr></thead>
        <tbody>${rowsHtml}</tbody>
      </table>
    </div>
    <script>
      window.onload = function () {
        window.print();
      };
    </script>
  </body>
</html>`;

    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";
    iframe.setAttribute("aria-hidden", "true");
    document.body.appendChild(iframe);

    const iframeDoc = iframe.contentDocument;
    const iframeWindow = iframe.contentWindow;
    if (!iframeDoc || !iframeWindow) {
      document.body.removeChild(iframe);
      setActionError("Unable to prepare print preview.");
      return;
    }

    iframeDoc.open();
    iframeDoc.write(html);
    iframeDoc.close();

    const cleanup = () => {
      if (iframe.parentNode) {
        iframe.parentNode.removeChild(iframe);
      }
    };

    iframeWindow.onafterprint = cleanup;
    iframeWindow.focus();
    iframeWindow.print();
    setTimeout(cleanup, 1000);
  };

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
          {(Object.keys(activeFilters).length > 0 || activePrimaryFilter) && (
            <Button
              variant="destructive"
              size="sm"
              type="button"
              onClick={clearFilters}
            >
              <IconX size={14} />
              Clear
            </Button>
          )}

          <DropdownMenu
            open={isFilterMenuOpen}
            onOpenChange={(open) => {
              setIsFilterMenuOpen(open);
              if (open) {
                setPendingFilters(activeFilters);
                setPrimaryDraftColumn(
                  activePrimaryFilter?.columnId ??
                    entityFilterConfig.primary.defaultColumn ??
                    primaryFilterColumns[0]?.id ??
                    "",
                );
                setPrimaryDraftValue(
                  activePrimaryFilter?.criterion.value ?? "",
                );
              }
            }}
          >
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" type="button">
                <IconAdjustmentsHorizontal size={16} />
                Filters
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              side="left"
              align="start"
              sideOffset={8}
              className="w-80 p-3"
            >
              <DropdownMenuLabel className="p-0">
                Primary Filter
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="mt-2 grid grid-cols-12 gap-2">
                <div className="col-span-5">
                  <Select
                    value={primaryDraftColumn}
                    onValueChange={(value) => {
                      setPrimaryDraftColumn(value);
                      setPrimaryDraftValue("");
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Column" />
                    </SelectTrigger>
                    <SelectContent>
                      {primaryFilterColumns.map((col) => (
                        <SelectItem key={col.id} value={col.id}>
                          {col.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-7">
                  {primaryDraftColumnMeta?.type === "date" ? (
                    <DatePicker
                      value={primaryDraftValue}
                      onChange={(value) => {
                        setPrimaryDraftValue(value);
                      }}
                    />
                  ) : (
                    <Select
                      value={primaryDraftValue || "__none__"}
                      onValueChange={(value) => {
                        const nextValue = value === "__none__" ? "" : value;
                        setPrimaryDraftValue(nextValue);
                      }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Option" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">Select option</SelectItem>
                        {(primaryDraftColumn
                          ? getColumnDistinctOptions(primaryDraftColumn)
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
              </div>

              {activePrimaryFilter && (
                <div className="mt-3 rounded border px-2 py-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span>
                      <strong>Primary:</strong>{" "}
                      {columnMeta.find(
                        (c) => c.id === activePrimaryFilter.columnId,
                      )?.label || activePrimaryFilter.columnId}{" "}
                      is {activePrimaryFilter.criterion.value}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setPrimaryDraftColumn("");
                        setPrimaryDraftValue("");
                      }}
                    >
                      <IconX size={12} />
                    </button>
                  </div>
                </div>
              )}

              <DropdownMenuSeparator className="my-3" />
              <DropdownMenuLabel className="p-0">
                Column Filters
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="mt-2 grid grid-cols-12 gap-2">
                <div className="col-span-4">
                  <Select
                    value={draftFilterColumn}
                    onValueChange={setDraftFilterColumn}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Column" />
                    </SelectTrigger>
                    <SelectContent>
                      {advancedFilterColumns.map((col) => (
                        <SelectItem key={col.id} value={col.id}>
                          {col.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-3">
                  <Select
                    value={draftFilterOperator}
                    onValueChange={(value) =>
                      setDraftFilterOperator(value as FilterOperator)
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Rule" />
                    </SelectTrigger>
                    <SelectContent>
                      {(draftColumnMeta?.type === "date"
                        ? DATE_FILTER_OPERATORS
                        : TEXT_FILTER_OPERATORS
                      ).map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-3">
                  {draftColumnMeta?.type === "date" ? (
                    <DatePicker
                      value={draftFilterValue}
                      onChange={setDraftFilterValue}
                    />
                  ) : (
                    <Input
                      value={draftFilterValue}
                      onChange={(e) => setDraftFilterValue(e.target.value)}
                      placeholder="Value"
                    />
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

              {Object.keys(pendingActiveFilters).length > 0 && (
                <div className="mt-3 space-y-1 border-t pt-3">
                  {Object.entries(pendingActiveFilters).map(
                    ([id, criterion]) => (
                      <div
                        key={id}
                        className="flex items-center justify-between rounded border px-2 py-1 text-xs"
                      >
                        <span>
                          <strong>
                            {columnMeta.find((c) => c.id === id)?.label || id}:
                          </strong>{" "}
                          {filterOperatorLabel(criterion.operator)}{" "}
                          {criterion.value}
                        </span>
                        <button
                          type="button"
                          onClick={() => removePendingFilter(id)}
                        >
                          <IconX size={12} />
                        </button>
                      </div>
                    ),
                  )}
                </div>
              )}

              <div className="mt-3 flex items-center justify-center gap-24 ">
                <Button
                  variant="default"
                  size="sm"
                  className="min-w-24"
                  type="button"
                  onClick={clearPendingFilters}
                >
                  Clear all
                </Button>
                <Button
                  size="sm"
                  className="min-w-24"
                  type="button"
                  onClick={applyPendingFilters}
                  disabled={!hasPendingFilterChanges}
                >
                  Apply
                </Button>
              </div>
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

          <Button
            variant="outline"
            size="sm"
            type="button"
            onClick={handlePrint}
          >
            <IconPrinter size={16} />
            Print
          </Button>
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
                  {""}
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
