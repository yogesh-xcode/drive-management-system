import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import React, { useEffect, useRef, useMemo, useState } from "react";

type FieldType = "text" | "email" | "number" | "date" | "select";

export type FieldDef = {
  name: string;
  label: string;
  type?: FieldType;
  placeholder?: string;
  required?: boolean;
  defaultValue?: string | number;
  disabled?: boolean;
  options?: { label: string; value: string }[]; // ✅ for dropdowns
};


type Mode = "create" | "update";

type SidePeakProps<T extends Record<string, any>> = {
  children?: React.ReactNode;
  mode: Mode;
  side?: "top" | "right" | "bottom" | "left";
  open?: boolean; // Controlled for programmatic open, undefined for SheetTrigger
  onOpenChange?: (o: boolean) => void; // Optionally handle open/close externally
  title?: string;
  description?: string;
  fields: FieldDef[];
  immutable?: string[];
  initialValues?: Partial<T>;
  submitLabel?: string;
  cancelLabel?: string;
  onSubmit: (values: T) => void | Promise<void>;
  validate?: (values: T) => string | null;
  closeOnSuccess?: boolean;
};

export function SidePeak<T extends Record<string, any>>({
  children,
  side,
  mode,
  open,
  onOpenChange,
  title,
  description,
  fields,
  immutable,
  initialValues = {},
  submitLabel,
  cancelLabel = "Close",
  onSubmit,
  validate,
  closeOnSuccess = false,
}: SidePeakProps<T>) {
  const autoTitle = useMemo(
    () => title ?? (mode === "create" ? "Add Record" : "Update Record"),
    [mode, title]
  );
  const autoDescription = useMemo(
    () =>
      description ??
      (mode === "create"
        ? "Create a new record"
        : "Update the selected record"),
    [mode, description]
  );
  const buildInitial = () =>
    fields.reduce((acc, f) => {
      const init =
        (initialValues as any)[f.name] ??
        f.defaultValue ??
        (f.type === "number" ? "" : "");
      return { ...acc, [f.name]: init };
    }, {} as T);

  const [values, setValues] = useState<T>(buildInitial());
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false); // For controlled: reset on opening (rising edge)

  const wasOpen = useRef(false);
  useEffect(() => {
    if ((open ?? false) && !wasOpen.current) {
      setValues(buildInitial());
      setError(null);
      setLoading(false);
    }
    wasOpen.current = Boolean(open);
  }, [open, JSON.stringify(initialValues), JSON.stringify(fields), mode]); // For uncontrolled: reset on mount (i.e., every open via SheetTrigger remounts)

  useEffect(() => {
    setValues(buildInitial());
    setError(null);
    setLoading(false); // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(initialValues), JSON.stringify(fields), mode]);

  const handleOpenChange = (state: boolean) => {
    onOpenChange?.(state);
  };

  const handleChange = (name: string, v: string) => {
    setValues((prev) => ({ ...prev, [name]: v }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const msg = validate?.(values);
    if (msg) {
      setError(msg);
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await onSubmit(values);
      if (mode === "create") {
        setValues(buildInitial());
      }
      if (closeOnSuccess && onOpenChange) {
        onOpenChange(false);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      {/* Only show SheetTrigger if not controlled by "open" */}
      {open === undefined && children && (
        <SheetTrigger asChild>{children}</SheetTrigger>
      )}

      <SheetContent side={side} className="rounded-l-lg h-[650px] my-15 p-5">
        <form onSubmit={handleSubmit}>
          <SheetHeader>
            <SheetTitle>{autoTitle}</SheetTitle>
            <SheetDescription>{autoDescription}</SheetDescription>
          </SheetHeader>

          <div className="grid flex-1 auto-rows-min gap-4 px-2 py-4">
            {fields.map((f) => (
              <div className="grid gap-2" key={f.name}>
                <label className="font-medium" htmlFor={f.name}>
                  {f.label}
                  {f.required ? " *" : ""}
                </label>

                <Input
                  id={f.name}
                  name={f.name}
                  type={f.type ?? "text"}
                  placeholder={f.placeholder}
                  required={f.required}
                  disabled={
                    f.disabled ||
                    (mode === "update" && immutable?.includes(f.name))
                  }
                  value={values[f.name] ?? ""}
                  onChange={(e) => handleChange(f.name, e.target.value)}
                />
              </div>
            ))}

            {error ? <p className="text-sm text-destructive">{error}</p> : null}
          </div>

          <SheetFooter>
            <Button type="submit" disabled={loading}>
              {submitLabel ??
                (mode === "create"
                  ? loading
                    ? "Creating..."
                    : "Create"
                  : loading
                  ? "Updating..."
                  : "Update")}
            </Button>
            <SheetClose asChild>
              <Button variant="outline" type="button">
                {cancelLabel}
              </Button>
            </SheetClose>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
