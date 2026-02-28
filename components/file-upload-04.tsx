"use client";

import { File as FileIcon, FileSpreadsheet, X } from "lucide-react";
import { ChangeEvent, DragEvent, useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

type UploadSummary = {
  inserted: number;
  skipped?: number;
};

type FileUpload04Props = {
  onUploadFile: (file: globalThis.File) => Promise<UploadSummary>;
  onUploadComplete?: () => void;
};

export default function FileUpload04({
  onUploadFile,
  onUploadComplete,
}: FileUpload04Props) {
  const [uploadState, setUploadState] = useState<{
    file: globalThis.File | null;
    progress: number;
    preparing: boolean;
    uploading: boolean;
  }>({
    file: null,
    progress: 0,
    preparing: false,
    uploading: false,
  });
  const [inlineError, setInlineError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validFileTypes = [
    "text/csv",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ];

  const simulatePreparation = (file: globalThis.File) => {
    setUploadState({ file, progress: 0, preparing: true, uploading: false });

    let current = 0;
    const tick = () => {
      current = Math.min(current + Math.floor(Math.random() * 18) + 10, 100);
      setUploadState((prev) => ({ ...prev, progress: current }));

      if (current >= 100) {
        setUploadState((prev) => ({ ...prev, preparing: false }));
        return;
      }

      setTimeout(tick, 90);
    };

    setTimeout(tick, 90);
  };

  const handleFile = (file: globalThis.File | undefined) => {
    if (!file) return;

    if (validFileTypes.includes(file.type)) {
      simulatePreparation(file);
      setInlineError(null);
    } else {
      toast.error("Please upload a CSV, XLSX, or XLS file.", {
        position: "bottom-right",
        duration: 3000,
      });
    }
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    handleFile(event.target.files?.[0]);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    handleFile(event.dataTransfer.files?.[0]);
  };

  const resetFile = () => {
    setUploadState({ file: null, progress: 0, preparing: false, uploading: false });
    setInlineError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const getFileIcon = () => {
    if (!uploadState.file) return <FileIcon />;

    const fileExt = uploadState.file.name.split(".").pop()?.toLowerCase() || "";
    return ["csv", "xlsx", "xls"].includes(fileExt) ? (
      <FileSpreadsheet className="h-5 w-5 text-foreground" />
    ) : (
      <FileIcon className="h-5 w-5 text-foreground" />
    );
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const { file, progress, preparing, uploading } = uploadState;

  const handleUpload = async () => {
    if (!file || uploading || preparing || progress < 100) return;

    setInlineError(null);
    setUploadState((prev) => ({ ...prev, uploading: true }));

    try {
      const result = await onUploadFile(file);
      setUploadState((prev) => ({ ...prev, uploading: false, progress: 100 }));

      const skipped = result.skipped ?? 0;
      if (result.inserted === 0 && skipped > 0) {
        toast.warning(`No new rows imported. Skipped ${skipped} duplicate row(s).`, {
          position: "bottom-right",
          duration: 3500,
        });
      } else if (skipped > 0) {
        toast.success(
          `Imported ${result.inserted} row(s). Skipped ${skipped} row(s).`,
          {
            position: "bottom-right",
            duration: 3500,
          },
        );
      } else {
        toast.success(`Imported ${result.inserted} row(s) successfully.`, {
          position: "bottom-right",
          duration: 3000,
        });
      }

      onUploadComplete?.();
      resetFile();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Upload failed. Please try again.";
      setUploadState((prev) => ({ ...prev, uploading: false }));

      const normalized = message.toLowerCase();
      if (
        normalized.includes("duplicate") ||
        normalized.includes("unique constraint") ||
        normalized.includes("already exists")
      ) {
        setInlineError(
          "Duplicate file data detected. Some records already exist in Supabase.",
        );
        toast.error("Duplicate records detected. Some rows were already present.", {
          position: "bottom-right",
          duration: 3500,
        });
        return;
      }

      setInlineError(message);
      toast.error(message, {
        position: "bottom-right",
        duration: 3500,
      });
    }
  };

  return (
    <div className="flex items-center justify-center p-10 w-full max-w-lg">
      <form
        className="w-full"
        onSubmit={(e) => {
          e.preventDefault();
          void handleUpload();
        }}
      >
        <h3 className="text-balance text-lg font-semibold text-foreground">
          File Upload
        </h3>

        <div
          className="flex justify-center rounded-md border mt-2 border-dashed border-input px-6 py-12"
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
        >
          <div>
            <FileIcon
              className="mx-auto h-12 w-12 text-muted-foreground"
              aria-hidden={true}
            />
            <div className="flex text-sm leading-6 text-muted-foreground">
              <p>Drag and drop or</p>
              <label
                htmlFor="file-upload-03"
                className="relative cursor-pointer rounded-sm pl-1 font-medium text-primary hover:underline hover:underline-offset-4"
              >
                <span>choose file</span>
                <input
                  id="file-upload-03"
                  name="file-upload-03"
                  type="file"
                  className="sr-only"
                  accept=".csv, .xlsx, .xls"
                  onChange={handleFileChange}
                  ref={fileInputRef}
                />
              </label>
              <p className="text-pretty pl-1">to upload</p>
            </div>
          </div>
        </div>

        <p className="text-pretty mt-2 text-xs leading-5 text-muted-foreground sm:flex sm:items-center sm:justify-between">
          <span>Accepted file types: CSV, XLSX or XLS files.</span>
          <span className="pl-1 sm:pl-0">Max. size: 10MB</span>
        </p>

        {file && (
          <Card className="relative mt-8 bg-muted p-4 gap-4">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1 text-muted-foreground hover:text-foreground"
              aria-label="Remove"
              onClick={resetFile}
            >
              <X className="h-5 w-5 shrink-0" aria-hidden={true} />
            </Button>

            <div className="flex items-center space-x-2.5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm bg-background shadow-sm ring-1 ring-inset ring-border">
                {getFileIcon()}
              </span>
              <div>
                <p className="text-pretty text-xs font-medium text-foreground">
                  {file?.name}
                </p>
                <p className="text-pretty mt-0.5 text-xs text-muted-foreground">
                  {file && formatFileSize(file.size)}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Progress value={progress} className="h-1.5" />
              <span className="text-xs text-muted-foreground">{progress}%</span>
            </div>
          </Card>
        )}

        <div className="mt-8 flex items-center justify-end space-x-3">
          <Button
            type="button"
            variant="outline"
            className="whitespace-nowrap"
            onClick={resetFile}
            disabled={!file}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="whitespace-nowrap"
            disabled={!file || uploading || preparing || progress < 100}
          >
            {uploading
              ? "Uploading..."
              : preparing || progress < 100
                ? "Preparing..."
                : "Upload"}
          </Button>
        </div>
        {inlineError && (
          <p className="mt-2 text-right text-sm text-destructive">{inlineError}</p>
        )}
      </form>
    </div>
  );
}
