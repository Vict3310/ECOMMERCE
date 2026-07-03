---
name: handling-supabase-duplicate-key-conflicts
description: Gracefully handle 23505 duplicate key errors when inserting user profiles or records
source: auto-skill
extracted_at: '2026-07-03T08:29:14.511Z'
---

# Handling Supabase Duplicate Key Conflicts (23505)

When Supabase returns error code `23505`, a unique constraint was violated — usually meaning the record already exists. Instead of failing the operation, handle it by falling back to fetching the existing record.

## Pattern

```javascript
const { error: insertError } = await supabase.from('users').insert(newProfile);

if (insertError) {
  // Handle duplicate key gracefully
  if (insertError.code === '23505') {
    const { data: existingProfile } = await supabase
      .from('users')
      .select('*')
      .eq('id', currentUser.id)
      .single();
    
    if (existingProfile) {
      setUserProfile(existingProfile);
      localStorage.setItem('ifeco-user-profile', JSON.stringify(existingProfile));
      return; // Exit early — success via existing data
    }
  }
  
  // Other errors — still show the error
  console.error('Failed to create user profile:', insertError);
  showNotification(`Failed: ${insertError.message}`, 'error');
}
```

## Why this happens

- Auth user gets created but the profile table insert fails (race condition, network glitch)
- On next load, auth user exists, profile check sees none, tries to insert again — duplicate

## Alternative: `upsert`

If you don't need the insert-fail-then-fetch fallback, use `upsert` directly:

```javascript
const { error } = await supabase
  .from('users')
  .upsert({ id: currentUser.id, email: currentUser.email }, { onConflict: 'id' })
  .select()
  .single();
```
