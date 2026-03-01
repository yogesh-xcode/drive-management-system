"use client";

import { IconUpload } from "@/lib/icons";
import Papa from "papaparse";
import { useState } from "react";

import FileUpload04 from "@/components/file-upload-04";
import type { FieldDef } from "@/components/SidePeak";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type FileUploadDialogProps = {
  entityLabel: string;
  fields: FieldDef[];
  onImportRows: (rows: Record<string, any>[]) => Promise<{
    inserted: number;
    skipped?: number;
  }>;
};

function normalizeKey(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function coerceValue(field: FieldDef, rawValue: unknown): unknown {
  const value = String(rawValue ?? "").trim();
  if (!value) return "";

  if (field.type === "number") {
    const parsed = Number(value.replace(/,/g, ""));
    if (Number.isNaN(parsed)) {
      throw new Error(`Invalid number for ${field.label}: ${value}`);
    }
    return parsed;
  }

  if (field.type === "date") {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      throw new Error(`Invalid date for ${field.label}: ${value}`);
    }
    return date.toISOString().slice(0, 10);
  }

  if (field.type === "select" && field.options?.length) {
    const matched = field.options.find(
      (option) => option.value.toLowerCase() === value.toLowerCase(),
    );
    if (!matched) {
      throw new Error(`Invalid option for ${field.label}: ${value}`);
    }
    return matched.value;
  }

  return value;
}

function parseCsv(file: globalThis.File) {
  return new Promise<Record<string, unknown>[]>((resolve, reject) => {
    Papa.parse<Record<string, unknown>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        const fatalErrors = result.errors.filter(
          (error) =>
            error.code !== "TooManyFields" && error.code !== "TooFewFields",
        );

        if (fatalErrors.length > 0) {
          reject(new Error(fatalErrors[0]?.message || "CSV parse failed."));
          return;
        }
        resolve(result.data ?? []);
      },
      error: (error) => reject(error),
    });
  });
}

function mapRowsToFields(
  rawRows: Record<string, unknown>[],
  fields: FieldDef[],
) {
  const skipped: string[] = [];
  const mapped: Record<string, unknown>[] = [];

  for (let rowIndex = 0; rowIndex < rawRows.length; rowIndex += 1) {
    const rawRow = rawRows[rowIndex];
    const keyMap = new Map<string, unknown>();

    for (const [key, value] of Object.entries(rawRow)) {
      keyMap.set(normalizeKey(key), value);
    }

    const next: Record<string, unknown> = {};
    let shouldSkip = false;

    for (const field of fields) {
      const rawValue =
        keyMap.get(normalizeKey(field.name)) ??
        keyMap.get(normalizeKey(field.label)) ??
        "";

      try {
        const coerced = coerceValue(field, rawValue);
        if (field.required && String(coerced ?? "").trim() === "") {
          throw new Error(`Missing required value for ${field.label}`);
        }

        if (String(coerced ?? "").trim() !== "") {
          next[field.name] = coerced;
        }
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Invalid row value";
        skipped.push(`Row ${rowIndex + 2}: ${message}`);
        shouldSkip = true;
        break;
      }
    }

    if (!shouldSkip && Object.keys(next).length > 0) {
      mapped.push(next);
    }
  }

  return { mapped, skipped };
}

export function FileUploadDialog({
  entityLabel,
  fields,
  onImportRows,
}: FileUploadDialogProps) {
  const [open, setOpen] = useState(false);

  const handleUploadFile = async (file: globalThis.File) => {
    const extension = file.name.split(".").pop()?.toLowerCase();
    if (extension !== "csv") {
      throw new Error("Only CSV import is supported for database sync right now.");
    }

    const rawRows = await parseCsv(file);
    const { mapped, skipped } = mapRowsToFields(rawRows, fields);

    if (mapped.length === 0) {
      throw new Error("No valid rows found in file.");
    }

    const result = await onImportRows(mapped);
    return {
      inserted: result.inserted,
      skipped: (result.skipped ?? 0) + skipped.length,
    };
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="sm">
          <IconUpload className="h-4 w-4" />
          Upload {entityLabel}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Upload {entityLabel} File</DialogTitle>
          <DialogDescription>
            Import CSV rows for {entityLabel.toLowerCase()} records into Supabase.
          </DialogDescription>
        </DialogHeader>
        <FileUpload04
          onUploadFile={handleUploadFile}
          onUploadComplete={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
