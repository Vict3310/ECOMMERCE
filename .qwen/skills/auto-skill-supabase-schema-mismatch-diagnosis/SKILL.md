---
name: auto-skill-supabase-schema-mismatch-diagnosis
description: Diagnose HTTP 406 "Cannot coerce the result to a single JSON object" errors caused by primary key type mismatches (UUID column vs TEXT IDs) in Supabase
source: auto-skill
extracted_at: '2026-07-03T13:14:32.018Z'
---

# Diagnosing Supabase Schema Mismatch — UUID Column vs TEXT IDs

When Supabase returns `406` with "Cannot coerce the result to a single JSON object" / "The result contains 0 rows", it means the query found 0 matching rows but the client code expected exactly 1 (due to `.select().single()`).

## Common Cause: Primary Key Type Mismatch

This frequently happens when:

- **Client uses TEXT IDs** (e.g., `iphone-16-pm`, `samsung-galaxy-s24`)
- **Database column is UUID type** (from a migration or schema file that changed the column)
- **UPDATE/SELECT queries find 0 rows** because the TEXT value can never match a UUID column
- **Supabase returns 406** because `.select().single()` requires exactly one result, but gets 0

## Diagnostic Pattern

### Step 1: Check the console logs for the query ID

Look for the exact ID being used in the UPDATE or SELECT query:

```
[ProductFormModal] Update successful, ID: iphone-16-pm, Data: {...}
PATCH /rest/v1/products?id=eq.iphone-16-pm 406
```

### Step 2: Verify the column type in Supabase SQL Editor

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'products' 
  AND column_name = 'id';
```

Expected result for TEXT IDs:
```
id | text
```

If it shows `uuid`, the schema has diverged from what the client expects.

### Step 3: Compare schema files

Check `supabase_schema.sql` (original) vs `supabase_apply_policies.sql` (applied):

```sql
-- Original schema — likely correct
id TEXT PRIMARY KEY

-- What was accidentally applied
id UUID PRIMARY KEY DEFAULT gen_random_uuid()
```

## Fix

### Option A: Change the column type via SQL (preferred)

```sql
ALTER TABLE public.products 
  ALTER COLUMN id TYPE TEXT;
```

This is a one-command fix if there are no UUID rows already in the column.

### Option B: Recreate the table definition

If the column has UUID data that needs migration, recreate with correct type:

```sql
CREATE TABLE public.products_temp (
  id TEXT PRIMARY KEY,
  -- ... all other columns ...
);

-- Copy data (TEXT IDs will match)
INSERT INTO public.products_temp SELECT * FROM public.products;

-- Drop old, rename new
DROP TABLE public.products;
ALTER TABLE public.products_temp RENAME TO products;

-- Re-enable RLS and recreate policies
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
-- ... recreate policies ...
```

## Prevention

- **Never run migration files blindly** — always diff them against the original schema
- **Verify column types** after any schema change in Supabase SQL Editor
- **Use the original `supabase_schema.sql` as the source of truth** for column types
- **Add a schema validation check** in CI:
  ```javascript
  // Before running migrations, verify column type
  const { data } = await supabase.rpc('verify_products_id_type');
  if (data?.type !== 'text') {
    console.error('Products id column is not TEXT — this will break product updates!');
  }
  ```

## Debug Checklist

1. ✅ Check the exact product ID being used in the query (from console logs)
2. ✅ Verify the column type matches — `id TEXT` for TEXT IDs, `id UUID` for UUIDs
3. ✅ Check if `supabase_apply_policies.sql` or similar migration files changed the column type
4. ✅ Run `ALTER TABLE ... ALTER COLUMN id TYPE TEXT;` if mismatch found
5. ✅ Test the UPDATE query works after the fix
6. ✅ Verify `.select().single()` now returns exactly one row
