---
name: troubleshooting-supabase-product-save-failures
description: Diagnose and fix product save failures in Supabase-backed React apps — RLS blocks, missing setProducts, auth timing
source: auto-skill
extracted_at: '2026-07-03T13:05:00.000Z'
---

# Troubleshooting Supabase Product Save Failures

When product save appears to fail in a Supabase-backed React app, systematically check these categories of bugs.

## 1. RLS (Row Level Security) Blocking the Write

Supabase silently blocks the operation and returns no error if the authenticated user lacks permission. This is the most common cause of "save didn't work but no error appeared."

**Symptoms:** Insert/update silently fails, no console error, data not persisted.

**Diagnose:** Add `.select()` after the write to force Supabase to return an error:
```javascript
const { data, error } = await supabase
  .from('products')
  .insert(product)
  .select()  // Forces error reporting for RLS blocks
  .single();

if (error) {
  console.error('Insert failed:', error.message);
} else if (!data) {
  // RLS blocked the insert — Supabase doesn't throw, it returns null
  console.error('Save blocked by RLS: no permission');
}
```

**Fix:** Ensure the user's role grants the correct RLS policy. Verify in the Supabase dashboard → Authentication → Users → check the user's role field matches the RLS policy condition.

## 2. Missing `setProducts` After Successful UPDATE

When editing an existing product, calling `supabase.from('products').update(...)` only updates the database. The React local state must be updated separately, or the UI won't reflect changes.

**Bug pattern:**
```javascript
const { error } = await supabase
  .from('products')
  .update(normalizedProduct)
  .eq('id', product.id);

if (!error) {
  // ❌ Forgot: setProducts([...]);  -- UI never updates
}
```

**Fix:**
```javascript
if (!error) {
  // Update local state so UI reflects the change
  setProducts(prev => prev.map(p =>
    p.id === normalizedProduct.id ? normalizedProduct : p
  ));
}
```

## 3. Reference to Undefined Variable (Copy-Paste Bug)

Common when modifying code: the INSERT path accidentally references an old or undefined variable instead of the normalized product object.

**Bug pattern:**
```javascript
// normalizedProduct is defined above, but...
await supabase.from('products').insert(newProduct);  // ❌ newProduct is undefined
```

**Fix:** Use the same variable:
```javascript
await supabase.from('products').insert(normalizedProduct);  // ✅
```

## 4. Unnecessary Pre-SELECT Before UPDATE

Reading the row before updating it adds an unnecessary roundtrip and can cause timing issues (data changes between read and write).

**Bug pattern:**
```javascript
// ❌ Don't do this before an UPDATE
const { data } = await supabase.from('products').select().eq('id', id).single();
await supabase.from('products').update(data).eq('id', id);
```

**Fix:** Update directly:
```javascript
// ✅ Direct update — no SELECT needed
await supabase.from('products').update(normalizedProduct).eq('id', id);
```

## 5. Auth State Timing (User Not Logged In When Saving)

If the session/user state hasn't loaded before the save attempt, Supabase sends the request unauthenticated.

**Diagnose:** Add logging to the session handler:
```javascript
const handleSession = async (session) => {
  console.log('[AppContext] Auth state change:', session?.user?.id ? 'logged in' : 'logged out');
  // ...
};
```

**Fix:** Ensure the app waits for auth to resolve before allowing user actions, or disable save buttons while auth is loading.

## Debug Checklist

1. ✅ Check browser console for Supabase error messages
2. ✅ Verify the authenticated user has the correct role for RLS policies
3. ✅ Add `.select().single()` after insert/update to catch silent RLS blocks
4. ✅ Ensure `setProducts` is called in both INSERT and UPDATE success paths
5. ✅ Verify you're passing the correct variable to `.insert()` (not an undefined one)
6. ✅ Confirm auth is fully loaded before attempting saves
