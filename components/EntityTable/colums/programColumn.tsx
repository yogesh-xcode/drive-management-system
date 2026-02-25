"use client";
import { ColumnDef } from "@tanstack/react-table";
import { Client } from "@/types";
import dayjs from "dayjs";
import { ReactNode } from "react";

export const programColumns: ColumnDef<Client>[] = [
  {
    accessorKey: "programNo",
    header: "Program ID",
  },
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => {
      const rawDate = row.getValue("date");
      if (typeof rawDate === "string" || typeof rawDate === "number") {
        // Format as DD/MM/YYYY for all rows
        return <div>{dayjs(rawDate).format("DD/MM/YYYY")}</div>;
      }
      return <div className="text-right text-muted">Invalid date</div>;
    },
  },
  {
    accessorKey: "client",
    header: "Client",
    cell: ({ row }) => {
      const rawVal = row.getValue("client");
      return <div className="">{rawVal as ReactNode}</div>;
    },
  },
  {
    accessorKey: "opening",
    header: "Opening",
  },
  {
    accessorKey: "contact",
    header: "Contact",
  },
];
