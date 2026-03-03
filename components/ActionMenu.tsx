"use client";

import { IconDots } from "@/lib/icons";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type MenuAction = {
  label: string;
  onClick: () => void;
  separatorBefore?: boolean;
};

export function ActionsMenu({
  label = "Actions",
  actions,
}: {
  label?: string;
  actions: MenuAction[];
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <IconDots className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {label && <DropdownMenuLabel>{label}</DropdownMenuLabel>}
        {actions.map((action, idx) => (
          <div key={idx}>
            {action.separatorBefore && <DropdownMenuSeparator />}
            <DropdownMenuItem onClick={action.onClick}>
              {action.label}
            </DropdownMenuItem>
          </div>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
