"use client";

import {
  IconCreditCard,
  IconLogout,
  IconNotification,
  IconUserCircle,
} from "@/lib/icons";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { userService } from "@/lib/repositories";
import { useEffect, useState } from "react";

const makeAvatarUrl = (name: string) =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=E5E7EB&color=111827`;

export function NavUser() {
  interface userType {
    name: string;
    email: string;
    avatar: string;
  }

  const [user, setUser] = useState<userType>({
    name: "Admin",
    email: "admin@gmail.com",
    avatar: makeAvatarUrl("Admin"),
  });

  useEffect(() => {
    const fetchUser = async () => {
      // Make sure the get() function returns a supabase user object
      const supabaseUser = await userService.get();

      setUser({
        name: supabaseUser?.user_metadata?.display_name || "Admin",
        email: supabaseUser?.email,
        avatar:
          supabaseUser?.user_metadata?.avatar_url ||
          makeAvatarUrl(supabaseUser?.user_metadata?.display_name || "Admin"),
      });
    };
    fetchUser();
  }, []);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="hover:bg-accent flex items-center rounded-md p-1"
        >
          <Avatar className="h-8 w-8 grayscale">
            <AvatarImage src={user.avatar || makeAvatarUrl(user.name)} alt={user.name} />
            <AvatarFallback className="rounded-full">HH</AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
        side="bottom"
        align="end"
        sideOffset={6}
      >
        <DropdownMenuLabel className="p-0 font-normal">
          <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
            <Avatar className="h-8 w-8 rounded-lg">
              <AvatarImage src={user.avatar || makeAvatarUrl(user.name)} alt={user.name} />
              <AvatarFallback className="rounded-lg">HH</AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">{user.name}</span>
              <span className="text-muted-foreground truncate text-xs">
                {user.email}
              </span>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <IconUserCircle />
            Account
          </DropdownMenuItem>
          <DropdownMenuItem>
            <IconCreditCard />
            Billing
          </DropdownMenuItem>
          <DropdownMenuItem>
            <IconNotification />
            Notifications
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <IconLogout />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
