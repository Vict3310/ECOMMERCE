---
name: detecting-real-browser-errors
description: Filter browser console noise (extensions, polyfills) from actual app errors
source: auto-skill
extracted_at: '2026-07-03T08:29:14.511Z'
---

# Detecting Real Browser Console Errors

When users paste browser console output, most of it is extension noise (MetaMask, Firefox content scripts, ad blockers). Identify the **actual app issues** by:

## Quick filter rules

| Signal | Source | Action |
|--------|--------|--------|
| `moz-extension://` or `chrome-extension://` | Browser extensions | Ignore |
| `contentscript.js` | Content scripts | Ignore |
| `installHook.js.map` source map error | MetaMask extension | Ignore |
| `NS_BINDING_ABORTED` | Ad blocker (uBlock, etc.) blocking Unsplash/images | Ignore — no fix needed |
| `OpaqueResponseBlocking` | Same ad blocker | Ignore |
| `ObjectMultiplex - orphaned data` | MetaMask or extension IPC | Ignore |
| `Window.fullScreen deprecated` | Firefox deprecation notice | Ignore |
| `Invalid DOM property \`fetchpriority\`` | **Your JSX code** | **Fix: `fetchPriority` camelCase** |
| `23505 duplicate key` | **Your database code** | **Fix: handle conflict gracefully** |
| `CORS request did not succeed` | **Your fetch/SRQ code** | **Fix: check headers, policies, or Supabase config** |
| `NS_ERROR_CONNECTION_REFUSED` | **Your backend** | **Fix: check if server is running** |

## Pattern matching

1. Look for URLs pointing to `localhost` or your own domain
2. Look for `React`, `Vite`, or framework names
3. Look for database error codes (23505, 23503, etc.)
4. Look for your app's error messages (e.g., `Failed to create user profile`)
