"use client";
import { SidePeak } from "../SidePeak";
import { Button } from "@/components/ui/button";
import { IconPlus } from "@/lib/icons";
import React from "react";
import { JSX } from "react";

// Generic AddButton props
export interface AddButtonProps<T extends Record<string, any>> {
  fields: any[];
  onSubmit: (values: T) => Promise<void>;
  children?: React.ReactNode;
  open?: boolean; // For programmatic control via Quick Create
  onOpenChange?: (open: boolean) => void; // Callback to handle open/close state
}

export const AddButton = React.forwardRef<
  HTMLButtonElement,
  AddButtonProps<any>
>(function AddButton<T extends Record<string, any>>(
  { fields, onSubmit, children, open, onOpenChange }: AddButtonProps<T>,
  ref
) {
  const isControlled = open !== undefined && !!onOpenChange;

  return (
    <>
      {isControlled && (
        <Button
          ref={ref}
          className="gap-1.5 text-sm"
          type="button"
          onClick={() => onOpenChange?.(true)}
        >
          <IconPlus /> {children}
        </Button>
      )}

      <SidePeak<T>
        side="right"
        mode="create"
        fields={fields}
        onSubmit={onSubmit}
        open={open}
        onOpenChange={onOpenChange}
      >
        {!isControlled && (
          <Button ref={ref} className="gap-1.5 text-sm" type="button">
            <IconPlus /> {children}
          </Button>
        )}
      </SidePeak>
    </>
  );
}) as <T extends Record<string, any>>(
  props: AddButtonProps<T> & { ref?: React.Ref<HTMLButtonElement> }
) => JSX.Element;
