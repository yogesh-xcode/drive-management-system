"use client";
import React from "react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { cn } from "@/lib/utils";
import { DataTable } from "./DataTable";
import { serviceMap } from "@/lib/repositories/services";

// Updated Props!
export interface TablePaginationProps<T extends Record<string, any>> {
  columns: any[]; // Ideally ColumnDef<T>[]
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
  addButtonOpen?: boolean; // <-- ADD THIS
  onAddButtonOpenChange?: (open: boolean) => void; // <-- AND THIS
}

export function TablePagination<T extends Record<string, any>>({
  columns,
  data,
  dateAccessor,
  fields,
  onAdd,
  onEdit,
  onDelete,
  title,
  entity,
  immutableFields = [],
  rowsPerPage = 10,
  addButtonOpen, // <-- RECEIVE THESE!
  onAddButtonOpenChange, // <--
}: TablePaginationProps<T>) {
  const [page, setPage] = React.useState(1);
  const pageCount = Math.max(1, Math.ceil(data.length / rowsPerPage));

  const paginatedRows = React.useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return data.slice(start, start + rowsPerPage);
  }, [page, data, rowsPerPage]);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex justify-around w-full">
        <DataTable<T>
          columns={columns}
          data={paginatedRows}
          dateAccessor={dateAccessor}
          fields={fields}
          onAdd={onAdd}
          onEdit={onEdit}
          onDelete={onDelete}
          title={title}
          immutableFields={immutableFields}
          entity={entity}
          addButtonOpen={addButtonOpen} // <-- FORWARD THEM
          onAddButtonOpenChange={onAddButtonOpenChange} // <--
        />
      </div>

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
                  page === i + 1 ? "bg-primary text-primary-foreground" : ""
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

export default TablePagination;
