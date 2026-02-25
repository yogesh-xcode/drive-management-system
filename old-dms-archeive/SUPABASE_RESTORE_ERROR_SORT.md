# Supabase Restore Error Sorting (Complete)

Source log: `supabase_restore.log`

## Totals

- Total log lines: `1232`
- Total `ERROR:` events: `459`
- Unique error signatures: `144`

## Priority Summary

- `P1` (requires action for full migration scope): `34`
- `P2` (managed-schema ownership/permissions, expected unless you are cloning internal Supabase system state): `342`
- `P3` (benign/expected already-exists or parse cascade): `83`

## Ordered Remediation Plan

1. `P1` Storage internal object mismatch
- Examples: `relation "storage.prefixes" does not exist`, `function storage.* does not exist`.
- Impact: storage internals/object metadata not fully restored from SQL script.
- Action: migrate storage buckets/objects using Supabase Storage migration method (outside plain SQL restore).
- Current status: no storage payload in backup (`storage.objects=0`, `storage.buckets=0`), so no additional data action required.

2. `P1` Managed auth/storage data incompatibility
- Examples: FK violations in `auth.identities`, `auth.sessions`, `auth.refresh_tokens`; `oauth_clients.client_id does not exist`; `schema_migrations` duplicate key.
- Impact: full clone of managed auth internals is incomplete.
- Action: migrate only required auth entities (usually users) via official auth migration path; do not attempt full internal table replay.
- Current status: resolved for this backup by replaying missing auth `COPY` blocks in dependency order.

3. `P2` Ownership/privilege mismatch in managed schemas
- Examples: `must be owner of ...`, `permission denied for schema auth/storage`, `permission denied to change default privileges`.
- Impact: expected when restoring with non-superuser in hosted Supabase.
- Action: ignore for app data; cannot fully resolve without internal superuser context.

4. `P3` Already-exists / reserved-role / parser cascade
- Examples: `role already exists`, `schema already exists`, `reserved role`, syntax errors after failed COPY.
- Impact: non-blocking noise in hosted Supabase restore.
- Action: ignore.

## Verification snapshot after restore

- `public.candidate_data = 70`
- `public.client_data = 50`
- `public.drive_data = 10`
- `public.staff_data = 30`
- `auth.users = 2`
- `auth.sessions = 0`
- `auth.refresh_tokens = 0`
- `auth.identities = 0`
- `storage.buckets = 0`
- `storage.objects = 0`

## Post-Fix Verification (Current)

- `auth.users = 2`
- `auth.identities = 2`
- `auth.sessions = 15`
- `auth.refresh_tokens = 48`
- `auth.one_time_tokens = 1`
- `auth.mfa_amr_claims = 15`
- `public.candidate_data = 70`
- `public.client_data = 50`
- `public.drive_data = 10`
- `public.staff_data = 30`
- `storage.buckets = 0`
- `storage.objects = 0`

## Backup vs Restored Count Diff (Key Tables)

These are the meaningful gaps for "complete migration" scope:

- `auth.identities`: backup `2` -> restored `0`
- `auth.sessions`: backup `15` -> restored `0`
- `auth.refresh_tokens`: backup `48` -> restored `0`
- `auth.one_time_tokens`: backup `1` -> restored `0`
- `auth.mfa_amr_claims`: backup `15` -> restored `0`

Expected platform drift (not app-breaking):

- `auth.schema_migrations`: backup `63` -> restored `74`
- `storage.migrations`: backup `39` -> restored `57`

Everything in `public.*` matched exactly.

## Full Sorted Error Matrix

| Priority | Category | Resolution Path | Count | Error Signature |
|---|---|---|---:|---|
| P2 | Ownership/privilege mismatch in managed schemas | Ignore for app data; required only for full system-clone | 51 | permission denied to change default privileges |
| P2 | Ownership/privilege mismatch in managed schemas | Ignore for app data; required only for full system-clone | 31 | permission denied for schema storage |
| P2 | Ownership/privilege mismatch in managed schemas | Ignore for app data; required only for full system-clone | 29 | grant options cannot be granted back to your own grantor |
| P2 | Ownership/privilege mismatch in managed schemas | Ignore for app data; required only for full system-clone | 28 | permission denied for schema auth |
| P2 | Ownership/privilege mismatch in managed schemas | Ignore for app data; required only for full system-clone | 14 | must be owner of table users |
| P2 | Ownership/privilege mismatch in managed schemas | Ignore for app data; required only for full system-clone | 12 | must be owner of table refresh_tokens |
| P1 | Storage internal object mismatch | Migrate storage via storage tool/script | 11 | relation "storage.prefixes" does not exist |
| P2 | Ownership/privilege mismatch in managed schemas | Ignore for app data; required only for full system-clone | 10 | permission denied to grant privileges as role "supabase_admin" |
| P2 | Ownership/privilege mismatch in managed schemas | Ignore for app data; required only for full system-clone | 10 | must be owner of table objects |
| P2 | Ownership/privilege mismatch in managed schemas | Ignore for app data; required only for full system-clone | 10 | must be owner of table mfa_factors |
| P2 | Ownership/privilege mismatch in managed schemas | Ignore for app data; required only for full system-clone | 9 | must be owner of table saml_relay_states |
| P2 | Ownership/privilege mismatch in managed schemas | Ignore for app data; required only for full system-clone | 8 | must be owner of table sessions |
| P2 | Ownership/privilege mismatch in managed schemas | Ignore for app data; required only for full system-clone | 8 | must be owner of table identities |
| P2 | Ownership/privilege mismatch in managed schemas | Ignore for app data; required only for full system-clone | 7 | must be owner of table sso_domains |
| P2 | Ownership/privilege mismatch in managed schemas | Ignore for app data; required only for full system-clone | 7 | must be owner of table saml_providers |
| P2 | Ownership/privilege mismatch in managed schemas | Ignore for app data; required only for full system-clone | 7 | must be owner of table one_time_tokens |
| P2 | Ownership/privilege mismatch in managed schemas | Ignore for app data; required only for full system-clone | 7 | must be owner of table flow_state |
| P2 | Ownership/privilege mismatch in managed schemas | Ignore for app data; required only for full system-clone | 6 | must be owner of table sso_providers |
| P2 | Ownership/privilege mismatch in managed schemas | Ignore for app data; required only for full system-clone | 6 | must be owner of table schema_migrations |
| P2 | Ownership/privilege mismatch in managed schemas | Ignore for app data; required only for full system-clone | 6 | must be owner of table mfa_challenges |
| P2 | Ownership/privilege mismatch in managed schemas | Ignore for app data; required only for full system-clone | 6 | must be owner of table mfa_amr_claims |
| P2 | Ownership/privilege mismatch in managed schemas | Ignore for app data; required only for full system-clone | 6 | Non-superuser owned event trigger must execute a non-superuser owned function |
| P2 | Ownership/privilege mismatch in managed schemas | Ignore for app data; required only for full system-clone | 5 | must be owner of table subscription |
| P2 | Ownership/privilege mismatch in managed schemas | Ignore for app data; required only for full system-clone | 5 | must be owner of table s3_multipart_uploads_parts |
| P2 | Ownership/privilege mismatch in managed schemas | Ignore for app data; required only for full system-clone | 5 | must be owner of table s3_multipart_uploads |
| P2 | Ownership/privilege mismatch in managed schemas | Ignore for app data; required only for full system-clone | 5 | must be owner of table oauth_clients |
| P2 | Ownership/privilege mismatch in managed schemas | Ignore for app data; required only for full system-clone | 5 | must be owner of table audit_log_entries |
| P2 | Ownership/privilege mismatch in managed schemas | Ignore for app data; required only for full system-clone | 4 | must be owner of table migrations |
| P2 | Ownership/privilege mismatch in managed schemas | Ignore for app data; required only for full system-clone | 4 | must be owner of table instances |
| P2 | Ownership/privilege mismatch in managed schemas | Ignore for app data; required only for full system-clone | 4 | must be owner of table buckets |
| P3 | Managed-role/system-setting restrictions | Ignore | 4 | "supabase_auth_admin" is a reserved role, only superusers can modify it |
| P2 | Ownership/privilege mismatch in managed schemas | Ignore for app data; required only for full system-clone | 3 | permission denied for function get_auth |
| P2 | Ownership/privilege mismatch in managed schemas | Ignore for app data; required only for full system-clone | 3 | must be owner of table buckets_analytics |
| P3 | Managed-role/system-setting restrictions | Ignore | 3 | "supabase_storage_admin" is a reserved role, only superusers can modify it |
| P3 | Managed-role/system-setting restrictions | Ignore | 3 | "supabase_read_only_user" is a reserved role, only superusers can modify it |
| P3 | Managed-role/system-setting restrictions | Ignore | 3 | "supabase_admin" is a reserved role, only superusers can modify it |
| P2 | Ownership/privilege mismatch in managed schemas | Ignore for app data; required only for full system-clone | 2 | must be owner of sequence refresh_tokens_id_seq |
| P1 | Storage internal object mismatch | Migrate storage via storage tool/script | 2 | function storage.objects_update_prefix_trigger() does not exist |
| P1 | Storage internal object mismatch | Migrate storage via storage tool/script | 2 | function storage.objects_insert_prefix_trigger() does not exist |
| P1 | Storage internal object mismatch | Migrate storage via storage tool/script | 2 | function storage.delete_prefix_hierarchy_trigger() does not exist |
| P3 | Managed-role/system-setting restrictions | Ignore | 2 | "supabase_etl_admin" is a reserved role, only superusers can modify it |
| P3 | Managed-role/system-setting restrictions | Ignore | 2 | "authenticator" role memberships are reserved, only superusers can grant them |
| P3 | Already-exists (managed objects) | Ignore (expected on target project) | 1 | type "wal_rls" already exists |
| P3 | Already-exists (managed objects) | Ignore (expected on target project) | 1 | type "wal_column" already exists |
| P3 | Already-exists (managed objects) | Ignore (expected on target project) | 1 | type "user_defined_filter" already exists |
| P3 | Already-exists (managed objects) | Ignore (expected on target project) | 1 | type "equality_op" already exists |
| P3 | Already-exists (managed objects) | Ignore (expected on target project) | 1 | type "action" already exists |
| P3 | Already-exists (managed objects) | Ignore (expected on target project) | 1 | trigger "update_objects_updated_at" for relation "objects" already exists |
| P3 | Already-exists (managed objects) | Ignore (expected on target project) | 1 | trigger "tr_check_filters" for relation "subscription" already exists |
| P3 | Already-exists (managed objects) | Ignore (expected on target project) | 1 | trigger "enforce_bucket_name_length_trigger" for relation "buckets" already exists |
| P3 | Cascade parse error after failed COPY | Ignore | 1 | trailing junk after numeric literal at or near "58c9cc12" |
| P3 | Cascade parse error after failed COPY | Ignore | 1 | syntax error at or near "20171026211738" |
| P3 | Cascade parse error after failed COPY | Ignore | 1 | syntax error at or near "0" |
| P3 | Already-exists (managed objects) | Ignore (expected on target project) | 1 | schema "vault" already exists |
| P3 | Already-exists (managed objects) | Ignore (expected on target project) | 1 | schema "storage" already exists |
| P3 | Already-exists (managed objects) | Ignore (expected on target project) | 1 | schema "realtime" already exists |
| P3 | Already-exists (managed objects) | Ignore (expected on target project) | 1 | schema "pgbouncer" already exists |
| P3 | Already-exists (managed objects) | Ignore (expected on target project) | 1 | schema "graphql_public" already exists |
| P3 | Already-exists (managed objects) | Ignore (expected on target project) | 1 | schema "graphql" already exists |
| P3 | Already-exists (managed objects) | Ignore (expected on target project) | 1 | schema "extensions" already exists |
| P3 | Already-exists (managed objects) | Ignore (expected on target project) | 1 | schema "auth" already exists |
| P3 | Already-exists (managed objects) | Ignore (expected on target project) | 1 | role "supabase_storage_admin" already exists |
| P3 | Already-exists (managed objects) | Ignore (expected on target project) | 1 | role "supabase_replication_admin" already exists |
| P3 | Already-exists (managed objects) | Ignore (expected on target project) | 1 | role "supabase_realtime_admin" already exists |
| P3 | Already-exists (managed objects) | Ignore (expected on target project) | 1 | role "supabase_read_only_user" already exists |
| P3 | Already-exists (managed objects) | Ignore (expected on target project) | 1 | role "supabase_etl_admin" already exists |
| P3 | Already-exists (managed objects) | Ignore (expected on target project) | 1 | role "supabase_auth_admin" already exists |
| P3 | Already-exists (managed objects) | Ignore (expected on target project) | 1 | role "supabase_admin" already exists |
| P3 | Already-exists (managed objects) | Ignore (expected on target project) | 1 | role "service_role" already exists |
| P3 | Already-exists (managed objects) | Ignore (expected on target project) | 1 | role "postgres" already exists |
| P3 | Already-exists (managed objects) | Ignore (expected on target project) | 1 | role "pgbouncer" already exists |
| P3 | Already-exists (managed objects) | Ignore (expected on target project) | 1 | role "dashboard_user" already exists |
| P3 | Already-exists (managed objects) | Ignore (expected on target project) | 1 | role "authenticator" already exists |
| P3 | Already-exists (managed objects) | Ignore (expected on target project) | 1 | role "authenticated" already exists |
| P3 | Already-exists (managed objects) | Ignore (expected on target project) | 1 | role "anon" already exists |
| P3 | Already-exists (managed objects) | Ignore (expected on target project) | 1 | relation "subscription" already exists |
| P3 | Already-exists (managed objects) | Ignore (expected on target project) | 1 | relation "schema_migrations" already exists |
| P3 | Already-exists (managed objects) | Ignore (expected on target project) | 1 | relation "messages" already exists |
| P3 | Already-exists (managed objects) | Ignore (expected on target project) | 1 | publication "supabase_realtime" already exists |
| P3 | Managed-role/system-setting restrictions | Ignore | 1 | permission denied to set parameter "session_preload_libraries" |
| P3 | Managed-role/system-setting restrictions | Ignore | 1 | permission denied to set parameter "log_min_messages" |
| P3 | Managed-role/system-setting restrictions | Ignore | 1 | permission denied to alter role |
| P2 | Ownership/privilege mismatch in managed schemas | Ignore for app data; required only for full system-clone | 1 | permission denied for table secrets |
| P2 | Ownership/privilege mismatch in managed schemas | Ignore for app data; required only for full system-clone | 1 | permission denied for table schema_migrations |
| P2 | Ownership/privilege mismatch in managed schemas | Ignore for app data; required only for full system-clone | 1 | permission denied for table migrations |
| P2 | Ownership/privilege mismatch in managed schemas | Ignore for app data; required only for full system-clone | 1 | permission denied for schema pgbouncer |
| P2 | Ownership/privilege mismatch in managed schemas | Ignore for app data; required only for full system-clone | 1 | must be owner of relation users |
| P2 | Ownership/privilege mismatch in managed schemas | Ignore for app data; required only for full system-clone | 1 | must be owner of relation sso_providers |
| P2 | Ownership/privilege mismatch in managed schemas | Ignore for app data; required only for full system-clone | 1 | must be owner of relation sessions |
| P2 | Ownership/privilege mismatch in managed schemas | Ignore for app data; required only for full system-clone | 1 | must be owner of relation objects |
| P2 | Ownership/privilege mismatch in managed schemas | Ignore for app data; required only for full system-clone | 1 | must be owner of relation identities |
| P2 | Ownership/privilege mismatch in managed schemas | Ignore for app data; required only for full system-clone | 1 | must be owner of relation buckets |
| P2 | Ownership/privilege mismatch in managed schemas | Ignore for app data; required only for full system-clone | 1 | must be owner of index users_email_partial_key |
| P2 | Ownership/privilege mismatch in managed schemas | Ignore for app data; required only for full system-clone | 1 | must be owner of index identities_email_idx |
| P2 | Ownership/privilege mismatch in managed schemas | Ignore for app data; required only for full system-clone | 1 | must be owner of function extensions.set_graphql_placeholder |
| P2 | Ownership/privilege mismatch in managed schemas | Ignore for app data; required only for full system-clone | 1 | must be owner of function extensions.grant_pg_net_access |
| P2 | Ownership/privilege mismatch in managed schemas | Ignore for app data; required only for full system-clone | 1 | must be owner of function extensions.grant_pg_graphql_access |
| P2 | Ownership/privilege mismatch in managed schemas | Ignore for app data; required only for full system-clone | 1 | must be owner of function extensions.grant_pg_cron_access |
| P2 | Ownership/privilege mismatch in managed schemas | Ignore for app data; required only for full system-clone | 1 | must be owner of function auth.uid |
| P2 | Ownership/privilege mismatch in managed schemas | Ignore for app data; required only for full system-clone | 1 | must be owner of function auth.role |
| P2 | Ownership/privilege mismatch in managed schemas | Ignore for app data; required only for full system-clone | 1 | must be owner of function auth.email |
| P1 | Managed-auth/storage data incompatibility | Needs separate Auth/Storage migration path | 1 | multiple primary keys for table "messages" are not allowed |
| P1 | Managed-auth/storage data incompatibility | Needs separate Auth/Storage migration path | 1 | insert or update on table "refresh_tokens" violates foreign key constraint "refresh_tokens_session_id_fkey" |
| P1 | Managed-auth/storage data incompatibility | Needs separate Auth/Storage migration path | 1 | insert or update on table "one_time_tokens" violates foreign key constraint "one_time_tokens_user_id_fkey" |
| P1 | Managed-auth/storage data incompatibility | Needs separate Auth/Storage migration path | 1 | insert or update on table "mfa_amr_claims" violates foreign key constraint "mfa_amr_claims_session_id_fkey" |
| P1 | Managed-auth/storage data incompatibility | Needs separate Auth/Storage migration path | 1 | insert or update on table "identities" violates foreign key constraint "identities_user_id_fkey" |
| P1 | Storage internal object mismatch | Migrate storage via storage tool/script | 1 | function storage.search_v2(text, text, integer, integer, text) does not exist |
| P1 | Storage internal object mismatch | Migrate storage via storage tool/script | 1 | function storage.search_v1_optimised(text, text, integer, integer, integer, text, text, text) does not exist |
| P1 | Storage internal object mismatch | Migrate storage via storage tool/script | 1 | function storage.search_legacy_v1(text, text, integer, integer, integer, text, text, text) does not exist |
| P1 | Storage internal object mismatch | Migrate storage via storage tool/script | 1 | function storage.prefixes_insert_trigger() does not exist |
| P1 | Storage internal object mismatch | Migrate storage via storage tool/script | 1 | function storage.list_objects_with_delimiter(text, text, text, integer, text, text) does not exist |
| P1 | Storage internal object mismatch | Migrate storage via storage tool/script | 1 | function storage.get_prefixes(text) does not exist |
| P1 | Storage internal object mismatch | Migrate storage via storage tool/script | 1 | function storage.get_prefix(text) does not exist |
| P1 | Storage internal object mismatch | Migrate storage via storage tool/script | 1 | function storage.get_level(text) does not exist |
| P1 | Storage internal object mismatch | Migrate storage via storage tool/script | 1 | function storage.delete_prefix(text, text) does not exist |
| P1 | Storage internal object mismatch | Migrate storage via storage tool/script | 1 | function storage.add_prefixes(text, text) does not exist |
| P3 | Already-exists (managed objects) | Ignore (expected on target project) | 1 | function "topic" already exists with same argument types |
| P3 | Already-exists (managed objects) | Ignore (expected on target project) | 1 | function "to_regrole" already exists with same argument types |
| P3 | Already-exists (managed objects) | Ignore (expected on target project) | 1 | function "subscription_check_filters" already exists with same argument types |
| P3 | Already-exists (managed objects) | Ignore (expected on target project) | 1 | function "set_graphql_placeholder" already exists with same argument types |
| P3 | Already-exists (managed objects) | Ignore (expected on target project) | 1 | function "send" already exists with same argument types |
| P3 | Already-exists (managed objects) | Ignore (expected on target project) | 1 | function "quote_wal2json" already exists with same argument types |
| P3 | Already-exists (managed objects) | Ignore (expected on target project) | 1 | function "pgrst_drop_watch" already exists with same argument types |
| P3 | Already-exists (managed objects) | Ignore (expected on target project) | 1 | function "pgrst_ddl_watch" already exists with same argument types |
| P3 | Already-exists (managed objects) | Ignore (expected on target project) | 1 | function "is_visible_through_filters" already exists with same argument types |
| P3 | Already-exists (managed objects) | Ignore (expected on target project) | 1 | function "grant_pg_net_access" already exists with same argument types |
| P3 | Already-exists (managed objects) | Ignore (expected on target project) | 1 | function "grant_pg_graphql_access" already exists with same argument types |
| P3 | Already-exists (managed objects) | Ignore (expected on target project) | 1 | function "grant_pg_cron_access" already exists with same argument types |
| P3 | Already-exists (managed objects) | Ignore (expected on target project) | 1 | function "check_equality_op" already exists with same argument types |
| P3 | Already-exists (managed objects) | Ignore (expected on target project) | 1 | function "cast" already exists with same argument types |
| P3 | Already-exists (managed objects) | Ignore (expected on target project) | 1 | function "build_prepared_statement_sql" already exists with same argument types |
| P3 | Already-exists (managed objects) | Ignore (expected on target project) | 1 | function "broadcast_changes" already exists with same argument types |
| P3 | Already-exists (managed objects) | Ignore (expected on target project) | 1 | function "apply_rls" already exists with same argument types |
| P1 | Managed-auth/storage data incompatibility | Needs separate Auth/Storage migration path | 1 | duplicate key value violates unique constraint "schema_migrations_pkey" |
| P1 | Managed-auth/storage data incompatibility | Needs separate Auth/Storage migration path | 1 | column "client_id" of relation "oauth_clients" does not exist |
| P3 | Managed-role/system-setting restrictions | Ignore | 1 | "supabase_replication_admin" is a reserved role, only superusers can modify it |
| P3 | Managed-role/system-setting restrictions | Ignore | 1 | "supabase_realtime_admin" role memberships are reserved, only superusers can grant them |
| P3 | Managed-role/system-setting restrictions | Ignore | 1 | "supabase_realtime_admin" is a reserved role, only superusers can modify it |
| P3 | Managed-role/system-setting restrictions | Ignore | 1 | "service_role" is a reserved role, only superusers can modify it |
| P3 | Managed-role/system-setting restrictions | Ignore | 1 | "pgbouncer" is a reserved role, only superusers can modify it |
| P3 | Managed-role/system-setting restrictions | Ignore | 1 | "dashboard_user" is a reserved role, only superusers can modify it |
| P3 | Managed-role/system-setting restrictions | Ignore | 1 | "authenticator" is a reserved role, only superusers can modify it |
| P3 | Managed-role/system-setting restrictions | Ignore | 1 | "authenticated" is a reserved role, only superusers can modify it |
| P3 | Managed-role/system-setting restrictions | Ignore | 1 | "anon" is a reserved role, only superusers can modify it |
