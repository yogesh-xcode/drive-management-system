"use client";

import {
  IconBell,
  IconChevronDown,
  IconPlus,
  IconSearch,
  IconX,
} from "@/lib/icons";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  candidateDataService,
  clientDataService,
  driveDataService,
  staffDataService,
} from "@/lib/repositories";
import {
  buildGlobalSearchIndex,
  GlobalSearchItem,
  groupGlobalSearchResults,
  searchGlobalIndex,
} from "@/lib/global-search";
import { NavUser } from "@/components/nav-user";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

const notifications = [
  {
    id: 1,
    title: "Drive status updated",
    description: "The Java Backend drive was marked as completed.",
  },
  {
    id: 2,
    title: "New candidate added",
    description: "A candidate was added to the React JS pipeline.",
  },
  {
    id: 3,
    title: "Reminder",
    description: "Staff onboarding review is due this Friday.",
  },
];

type HeaderAction = {
  label: string;
  href: string;
};

const PAGE_META: Record<string, { title: string; action: HeaderAction }> = {
  "/dashboard": {
    title: "Dashboard",
    action: { label: "Create Candidate", href: "/candidate?add=1" },
  },
  "/staff": {
    title: "Staff",
    action: { label: "Add Staff", href: "/staff?add=1" },
  },
  "/client": {
    title: "Client",
    action: { label: "Add Program", href: "/client?add=1" },
  },
  "/candidate": {
    title: "Candidate",
    action: { label: "Add Candidate", href: "/candidate?add=1" },
  },
  "/drive": {
    title: "Drive",
    action: { label: "Add Drive", href: "/drive?add=1" },
  },
  "/reports": {
    title: "Reports",
    action: { label: "Open Reports", href: "/reports" },
  },
  "/account": {
    title: "Account Settings",
    action: { label: "Create Candidate", href: "/candidate?add=1" },
  },
  "/notifications": {
    title: "Notifications",
    action: { label: "Create Candidate", href: "/candidate?add=1" },
  },
  "/support": {
    title: "Support",
    action: { label: "Create Candidate", href: "/candidate?add=1" },
  },
};

const ACTION_OPTIONS: HeaderAction[] = [
  { label: "Create Candidate", href: "/candidate?add=1" },
  { label: "Add Staff", href: "/staff?add=1" },
  { label: "Add Program", href: "/client?add=1" },
  { label: "Add Drive", href: "/drive?add=1" },
];
const RECENT_SEARCH_STORAGE_KEY = "drivems_recent_searches_v1";

export function AppHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const basePath = `/${pathname.split("/").filter(Boolean)[0] || "dashboard"}`;
  const searchContainerRef = useRef<HTMLDivElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const searchLoadedRef = useRef(false);

  const currentMeta = useMemo(
    () =>
      PAGE_META[basePath] ?? {
        title: "Dashboard",
        action: { label: "Create Candidate", href: "/candidate?add=1" },
      },
    [basePath],
  );
  const [selectedAction, setSelectedAction] = useState<HeaderAction>(
    currentMeta.action,
  );
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isSearchMenuOpen, setIsSearchMenuOpen] = useState(false);
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const [searchIndex, setSearchIndex] = useState<GlobalSearchItem[]>([]);
  const [activeSearchIndex, setActiveSearchIndex] = useState<number>(-1);
  const [recentSearches, setRecentSearches] = useState<GlobalSearchItem[]>([]);

  useEffect(() => {
    setSelectedAction(currentMeta.action);
  }, [currentMeta]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
    }, 150);
    return () => clearTimeout(timeout);
  }, [searchInput]);

  useEffect(() => {
    if (!isSearchMenuOpen) return;
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setIsSearchMenuOpen(false);
        setActiveSearchIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isSearchMenuOpen]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(RECENT_SEARCH_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as GlobalSearchItem[];
      if (!Array.isArray(parsed)) return;
      setRecentSearches(parsed.slice(0, 2));
    } catch {
      // Ignore malformed persisted values.
    }
  }, []);

  const persistRecentSearches = useCallback((items: GlobalSearchItem[]) => {
    try {
      localStorage.setItem(RECENT_SEARCH_STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Ignore storage failures.
    }
  }, []);

  const addRecentSearch = useCallback(
    (item: GlobalSearchItem) => {
      setRecentSearches((prev) => {
        const next = [item, ...prev.filter((entry) => entry.id !== item.id)].slice(
          0,
          2,
        );
        persistRecentSearches(next);
        return next;
      });
    },
    [persistRecentSearches],
  );

  const ensureSearchIndexLoaded = useCallback(async () => {
    if (searchLoadedRef.current || isSearchLoading) return;
    setIsSearchLoading(true);

    const [staffRes, clientRes, candidateRes, driveRes] = await Promise.allSettled(
      [
        staffDataService.get(),
        clientDataService.get(),
        candidateDataService.get(),
        driveDataService.get(),
      ],
    );

    const staff =
      staffRes.status === "fulfilled" ? (staffRes.value.data ?? []) : [];
    const clients =
      clientRes.status === "fulfilled" ? (clientRes.value.data ?? []) : [];
    const candidates =
      candidateRes.status === "fulfilled" ? (candidateRes.value.data ?? []) : [];
    const drives =
      driveRes.status === "fulfilled" ? (driveRes.value.data ?? []) : [];

    if (staffRes.status === "rejected") {
      toast.error("Global search: failed to load staff records.");
    }
    if (clientRes.status === "rejected") {
      toast.error("Global search: failed to load client records.");
    }
    if (candidateRes.status === "rejected") {
      toast.error("Global search: failed to load candidate records.");
    }
    if (driveRes.status === "rejected") {
      toast.error("Global search: failed to load drive records.");
    }

    setSearchIndex(
      buildGlobalSearchIndex({
        staff,
        clients,
        candidates,
        drives,
      }),
    );
    searchLoadedRef.current = true;
    setIsSearchLoading(false);
  }, [isSearchLoading]);

  const matchedResults = useMemo(
    () => searchGlobalIndex(searchIndex, debouncedSearch, 12),
    [searchIndex, debouncedSearch],
  );
  const groupedResults = useMemo(
    () => groupGlobalSearchResults(matchedResults),
    [matchedResults],
  );

  useEffect(() => {
    if (activeSearchIndex >= matchedResults.length) {
      setActiveSearchIndex(matchedResults.length > 0 ? 0 : -1);
    }
  }, [matchedResults.length, activeSearchIndex]);

  const openSearchResult = (item: GlobalSearchItem) => {
    addRecentSearch(item);
    const params = new URLSearchParams();
    params.set(`${item.entity}Search`, item.queryValue);
    router.push(`${item.route}?${params.toString()}`);
    setSearchInput("");
    setDebouncedSearch("");
    setIsSearchMenuOpen(false);
    setActiveSearchIndex(-1);
  };

  const clearSearchInput = () => {
    setSearchInput("");
    setDebouncedSearch("");
    setIsSearchMenuOpen(false);
    setActiveSearchIndex(-1);
    searchInputRef.current?.focus();
  };

  const focusGlobalSearch = useCallback(() => {
    setIsSearchMenuOpen(true);
    void ensureSearchIndexLoaded();
    searchInputRef.current?.focus();
  }, [ensureSearchIndexLoaded]);

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key.toLowerCase() === "k") {
        event.preventDefault();
        event.stopPropagation();
        focusGlobalSearch();
      }
    };

    document.addEventListener("keydown", handleShortcut, true);
    return () => {
      document.removeEventListener("keydown", handleShortcut, true);
    };
  }, [focusGlobalSearch]);

  const showSearchMenu =
    isSearchMenuOpen &&
    (debouncedSearch.length >= 2 || recentSearches.length > 0);

  return (
    <>
      {pathname === "/" ? null : (
        <header className="h-14 border-b bg-background px-4 md:px-6">
          <div className="grid h-full grid-cols-[auto_1fr_auto] items-center gap-3">
            <div className="min-w-[140px]">
              <h1 className="truncate text-lg font-semibold">{currentMeta.title}</h1>
            </div>

            <div ref={searchContainerRef} className="relative mx-auto w-full max-w-md">
              <label className="relative block">
                <IconSearch className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchInput}
                  onFocus={() => {
                    focusGlobalSearch();
                  }}
                  onChange={(e) => {
                    setSearchInput(e.target.value);
                    setIsSearchMenuOpen(true);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") {
                      setIsSearchMenuOpen(false);
                      setActiveSearchIndex(-1);
                      return;
                    }

                    if (debouncedSearch.length < 2 || matchedResults.length === 0) return;

                    if (e.key === "ArrowDown") {
                      e.preventDefault();
                      setActiveSearchIndex((prev) =>
                        prev < 0 || prev === matchedResults.length - 1
                          ? 0
                          : prev + 1,
                      );
                      return;
                    }

                    if (e.key === "ArrowUp") {
                      e.preventDefault();
                      setActiveSearchIndex((prev) =>
                        prev <= 0 ? matchedResults.length - 1 : prev - 1,
                      );
                      return;
                    }

                    if (e.key === "Enter") {
                      e.preventDefault();
                      const target =
                        matchedResults[activeSearchIndex >= 0 ? activeSearchIndex : 0];
                      if (target) openSearchResult(target);
                    }
                  }}
                  placeholder={`Search ${currentMeta.title.toLowerCase()} or type a command`}
                  className="border-input bg-background h-9 w-full rounded-md border pr-20 pl-8 text-sm outline-none transition focus:border-primary/40 focus:ring-2 focus:ring-primary/10"
                />
                {searchInput.length > 0 && (
                  <button
                    type="button"
                    aria-label="Clear search"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={clearSearchInput}
                    className="text-muted-foreground hover:text-foreground absolute top-1/2 right-11 -translate-y-1/2 rounded-sm p-0.5 transition-colors"
                  >
                    <IconX className="size-3.5" />
                  </button>
                )}
                <kbd className="text-muted-foreground pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 rounded border bg-muted/40 px-1.5 py-0.5 text-[10px] font-semibold">
                  Ctrl + K
                </kbd>
              </label>

              {showSearchMenu && (
                <div
                  role="listbox"
                  className="bg-popover text-popover-foreground absolute z-50 mt-1 w-full overflow-hidden rounded-md border shadow-lg"
                >
                  {debouncedSearch.length < 2 ? (
                    <div className="py-1">
                      <div className="text-muted-foreground px-3 py-1 text-[11px] font-semibold uppercase tracking-wide">
                        Recent searches
                      </div>
                      {recentSearches.slice(0, 2).map((item) => (
                        <button
                          key={`recent-${item.id}`}
                          role="option"
                          aria-selected={false}
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => openSearchResult(item)}
                          className="hover:bg-accent/60 flex w-full items-start justify-between gap-3 px-3 py-2 text-left text-sm"
                        >
                          <div className="min-w-0">
                            <p className="truncate font-medium">{item.title}</p>
                            {item.subtitle && (
                              <p className="text-muted-foreground truncate text-xs">
                                {item.subtitle}
                              </p>
                            )}
                          </div>
                          <span className="text-muted-foreground rounded border px-1.5 py-0.5 text-[10px] uppercase">
                            {item.entity}
                          </span>
                        </button>
                      ))}
                    </div>
                  ) : isSearchLoading ? (
                    <div className="text-muted-foreground px-3 py-3 text-sm">
                      Loading search index...
                    </div>
                  ) : matchedResults.length === 0 ? (
                    <div className="text-muted-foreground px-3 py-3 text-sm">
                      No matching records.
                    </div>
                  ) : (
                    <>
                      <div className="max-h-80 overflow-y-auto py-1">
                        {groupedResults.map((group) => (
                          <div key={group.entity}>
                            <div className="text-muted-foreground px-3 py-1 text-[11px] font-semibold uppercase tracking-wide">
                              {group.label}
                            </div>
                            {group.items.map((item) => {
                              const globalIndex = matchedResults.findIndex(
                                (entry) => entry.id === item.id,
                              );
                              const active = globalIndex === activeSearchIndex;
                              return (
                                <button
                                  key={item.id}
                                  role="option"
                                  aria-selected={active}
                                  type="button"
                                  onMouseDown={(e) => e.preventDefault()}
                                  onMouseEnter={() => setActiveSearchIndex(globalIndex)}
                                  onClick={() => openSearchResult(item)}
                                  className={`flex w-full items-start justify-between gap-3 px-3 py-2 text-left text-sm ${active ? "bg-accent text-accent-foreground" : "hover:bg-accent/60"
                                    }`}
                                >
                                  <div className="min-w-0">
                                    <p className="truncate font-medium">{item.title}</p>
                                    {item.subtitle && (
                                      <p className="text-muted-foreground truncate text-xs">
                                        {item.subtitle}
                                      </p>
                                    )}
                                  </div>
                                  <span className="text-muted-foreground rounded border px-1.5 py-0.5 text-[10px] uppercase">
                                    {item.entity}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        ))}
                      </div>
                      <div className="text-muted-foreground border-t px-3 py-2 text-[11px]">
                        Press Enter to open first result.
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
            <div className="flex items-center justify-end gap-2">
              <div className="flex items-center">
                <Button
                  className="h-9 rounded-r-none rounded-l-md border-r border-primary-foreground/20 px-3 text-xs font-semibold"
                  onClick={() => router.push(selectedAction.href)}
                >
                  <IconPlus className="size-4" />
                  {selectedAction.label}
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      className="h-9 rounded-l-none rounded-r-md px-2"
                      aria-label="Open quick actions"
                    >
                      <IconChevronDown className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" sideOffset={6}>
                    {ACTION_OPTIONS.map((option) => (
                      <DropdownMenuItem
                        key={option.label}
                        onSelect={() => {
                          setSelectedAction(option);
                        }}
                      >
                        {option.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <button
                    type="button"
                    className="hover:bg-muted relative inline-flex size-9 items-center justify-center rounded-md transition-colors"
                    aria-label="Open notifications"
                  >
                    <span className="bg-primary absolute top-1.5 right-1.5 size-1.5 rounded-full" />
                    <IconBell className="size-4 text-muted-foreground" />
                  </button>
                </DialogTrigger>
                <DialogContent className="bg-card/95 top-16 right-4 left-auto w-[calc(100%-2rem)] translate-x-0 translate-y-0 gap-0 overflow-hidden rounded-xl border-border p-0 shadow-xl backdrop-blur-sm sm:max-w-md md:right-6">
                  <DialogHeader className="border-b border-border px-4 py-3">
                    <DialogTitle className="text-base">Notifications</DialogTitle>
                    <DialogDescription className="text-xs">
                      Recent updates from your workspace.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="max-h-[360px] space-y-1 overflow-y-auto p-2">
                    {notifications.map((item) => (
                      <div
                        key={item.id}
                        className="hover:bg-accent/60 group relative rounded-lg border border-border bg-background/60 px-3 py-2.5 transition-colors"
                      >
                        <span className="bg-primary/70 absolute top-3 left-1 h-2.5 w-0.5 rounded-full opacity-70 group-hover:opacity-100" />
                        <p className="pl-2 text-sm font-semibold text-foreground">
                          {item.title}
                        </p>
                        <p className="text-muted-foreground mt-1 pl-2 text-xs leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </DialogContent>
              </Dialog>
              <NavUser />
            </div>
          </div>
        </header>
      )}
    </>
  );
}
