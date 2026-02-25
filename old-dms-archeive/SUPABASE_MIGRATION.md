# Supabase Project Migration (Dashboard Backup Restore)

This repo uses Supabase via env values:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

There are no tracked SQL migrations in `supabase/migrations/`, so use Supabase's official dashboard backup restore flow to move schema + data.

## 1) Prepare

1. Create the new Supabase project.
2. Install recent Postgres client tools (`psql`).
3. Download the old project's dashboard backup file (`*.backup.gz`) from Supabase.

## 2) Build the new project connection string

From new project dashboard -> `Connect`, copy either:

```bash
# Session pooler (default)
postgresql://postgres.<NEW_PROJECT_REF>:<DB_PASSWORD>@aws-0-<REGION>.pooler.supabase.com:5432/postgres

# Direct connection (if IPv6 supported or IPv4 add-on enabled)
postgresql://postgres.<NEW_PROJECT_REF>:<DB_PASSWORD>@db.<NEW_PROJECT_REF>.supabase.com:5432/postgres
```

If you reset DB password, wait a few minutes before restoring.

## 3) Unzip backup and restore

```bash
gunzip path/to/backup_name.backup.gz
psql -d "postgresql://postgres.<NEW_PROJECT_REF>:<DB_PASSWORD>@aws-0-<REGION>.pooler.supabase.com:5432/postgres" -f path/to/backup_name.backup
```

`object already exists` errors during restore are expected for some Supabase-managed schemas.

## 4) Move storage objects (if you use Supabase Storage)

DB restore brings bucket metadata, not actual files in S3 buckets. Migrate storage objects separately using Supabase's storage migration method/script from docs.

## 5) Switch app to new project

Update `.env`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://<NEW_PROJECT_REF>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<NEW_ANON_KEY>
```

Restart `pnpm dev` after env changes.

## 6) Link local Supabase CLI (optional)

```bash
pnpm supabase link --project-ref <NEW_PROJECT_REF>
```

## 7) Verify app behavior

1. `pnpm dev`
2. Test flows that read/write Supabase data.
3. Confirm data now appears in the new project dashboard.

## Notes

- If you see `GSSAPI negotiation` errors, update Postgres/`psql` to a newer version.
- Rotate leaked secrets (your current `.env` contains real-looking keys).
