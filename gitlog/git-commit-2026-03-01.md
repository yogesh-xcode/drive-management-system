# Git Commit Plan - 2026-03-01

Updated from live `git status --short`.

## Current Status Snapshot

### Modified (`M`)
- `.gitignore`
- `app/candidate/CandidatePage.tsx`
- `app/client/ClientPage.tsx`
- `app/client/page.tsx`
- `app/drive/page.tsx`
- `app/globals.css`
- `app/layout.tsx`
- `app/page.tsx`
- `app/staff/page.tsx`
- `components/ActionMenu.tsx`
- `components/BrandLogo.tsx`
- `components/Button/AddButton.tsx`
- `components/Button/ExportButton.tsx`
- `components/Button/FilterButton.tsx`
- `components/Cards/Candidate/ApplicationVelocityCard.tsx`
- `components/Cards/Candidate/OfferRateCard.tsx`
- `components/Cards/Candidate/StatusConversionCard.tsx`
- `components/Cards/Client/GrowthStatsCard.tsx`
- `components/Cards/Client/OpeningsStatsCard.tsx`
- `components/Cards/DashboardCard.tsx`
- `components/Cards/Drive/StatCard.tsx`
- `components/Cards/Staff/StaffCountCard.tsx`
- `components/EntityTable/DataTable.tsx`
- `components/EntityTable/PaginatedDataTable.tsx`
- `components/FileUploadDialog.tsx`
- `components/Skeleton/CardSkeleton.tsx`
- `components/Skeleton/DashboardSkeleten.tsx`
- `components/Skeleton/PageSkeleton.tsx`
- `components/Skeleton/SearchActionSkeleton.tsx`
- `components/Skeleton/TableSkeleton.tsx`
- `components/app-sidebar.tsx`
- `components/file-upload-04.tsx`
- `components/layout/AppHeader.tsx`
- `components/login-form.tsx`
- `components/nav-main.tsx`
- `components/nav-user.tsx`
- `components/ui/accordion.tsx`
- `components/ui/button.tsx`
- `components/ui/dialog.tsx`
- `components/ui/dropdown-menu.tsx`
- `components/ui/pagination.tsx`
- `components/ui/select.tsx`
- `components/ui/sheet.tsx`
- `components/ui/sidebar.tsx`
- `components/ui/skeleton.tsx`
- `components/ui/table.tsx`
- `package.json`
- `pnpm-lock.yaml`
- `postcss.config.mjs`
- `theme-variants/variant-13.css`
- `types/index.ts`

### Untracked (`??`)
- `components/base/`
- `components/layout/PageTitle.tsx`
- `components/ui/calendar.tsx`
- `components/ui/date-picker.tsx`
- `components/ui/popover.tsx`
- `gitlog/`
- `hooks/use-breakpoint.ts`
- `lib/filter-config.ts`
- `lib/icons.ts`
- `lib/utils/cx.ts`
- `lib/utils/is-react-component.ts`
- `prd-1..md`
- `public/menu.png`
- `public/menu.png:Zone.Identifier`
- `styles/`
- `theme-variants/variant-14.css`
- `theme-variants/variant-15.css`
- `theme-variants/variant-16.css`

---

## Chronological Commit Sequence

## 1. Theme foundation and variants
**Message**: `feat(theme): add style system foundation and variant set`

```bash
git add .gitignore app/globals.css postcss.config.mjs styles theme-variants/variant-13.css theme-variants/variant-14.css theme-variants/variant-15.css theme-variants/variant-16.css
git commit -m "feat(theme): add style system foundation and variant set"
```

## 2. Sidebar/header shell refactor
**Message**: `feat(layout): rebuild app shell with aligned sidebar and header`

```bash
git add app/layout.tsx components/app-sidebar.tsx components/layout/AppHeader.tsx components/layout/PageTitle.tsx components/BrandLogo.tsx components/nav-main.tsx components/nav-user.tsx hooks/use-breakpoint.ts public/menu.png
git commit -m "feat(layout): rebuild app shell with aligned sidebar and header"
```

## 3. App pages and action workflow
**Message**: `feat(pages): align per-page actions and navigation behavior`

```bash
git add app/page.tsx app/client/page.tsx app/client/ClientPage.tsx app/candidate/CandidatePage.tsx app/staff/page.tsx app/drive/page.tsx components/ActionMenu.tsx components/Button/AddButton.tsx components/Button/ExportButton.tsx types/index.ts
git commit -m "feat(pages): align per-page actions and navigation behavior"
```

## 4. Filters + date picker workflow
**Message**: `feat(filters): add themed date picker and apply-on-click filter flow`

```bash
git add components/Button/FilterButton.tsx components/EntityTable/DataTable.tsx components/EntityTable/PaginatedDataTable.tsx components/ui/calendar.tsx components/ui/popover.tsx components/ui/date-picker.tsx lib/filter-config.ts
git commit -m "feat(filters): add themed date picker and apply-on-click filter flow"
```

## 5. UI primitives and icon standardization
**Message**: `refactor(ui): unify icons and refresh core UI primitives`

```bash
git add lib/icons.ts lib/utils/cx.ts lib/utils/is-react-component.ts components/base components/ui/accordion.tsx components/ui/button.tsx components/ui/dialog.tsx components/ui/dropdown-menu.tsx components/ui/pagination.tsx components/ui/select.tsx components/ui/sheet.tsx components/ui/sidebar.tsx components/ui/skeleton.tsx components/ui/table.tsx
git commit -m "refactor(ui): unify icons and refresh core UI primitives"
```

## 6. Cards, skeletons, and upload improvements
**Message**: `feat(ux): update cards, skeleton screens, and upload accessibility`

```bash
git add components/Cards/Candidate/ApplicationVelocityCard.tsx components/Cards/Candidate/OfferRateCard.tsx components/Cards/Candidate/StatusConversionCard.tsx components/Cards/Client/GrowthStatsCard.tsx components/Cards/Client/OpeningsStatsCard.tsx components/Cards/DashboardCard.tsx components/Cards/Drive/StatCard.tsx components/Cards/Staff/StaffCountCard.tsx components/Skeleton/CardSkeleton.tsx components/Skeleton/DashboardSkeleten.tsx components/Skeleton/PageSkeleton.tsx components/Skeleton/SearchActionSkeleton.tsx components/Skeleton/TableSkeleton.tsx components/FileUploadDialog.tsx components/file-upload-04.tsx
git commit -m "feat(ux): update cards, skeleton screens, and upload accessibility"
```

## 7. Dependency and misc polish
**Message**: `chore: sync dependencies and remaining project polish`

```bash
git add components/login-form.tsx package.json pnpm-lock.yaml prd-1..md
git commit -m "chore: sync dependencies and remaining project polish"
```

## Optional cleanup
Windows ADS artifact in repo:
```bash
rm -f public/menu.png:Zone.Identifier
```

If removed, commit with:
```bash
git add -A
git commit -m "chore: remove Windows zone identifier artifact"
```
