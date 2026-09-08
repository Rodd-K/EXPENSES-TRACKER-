# Ledger — Expense Tracker

A simple expense tracker: add, edit, and delete entries, with a running total that recalculates automatically.

**Status: frontend only.** Data currently lives in a local JavaScript array and resets on every page reload. Backend (Supabase or Appwrite) is the next step.

## Files

- `index.html` — page structure and the entry form
- `style.css` — ledger-themed styling
- `app.js` — all app logic, including the data layer

## Running locally

No build step needed — just open `index.html` in a browser, or use the VS Code "Live Server" extension for auto-reload while editing.

## Where the backend will plug in

In `app.js`, everything the app does to data goes through four functions near the top of the file:

- `getExpenses()`
- `createExpense(entry)`
- `updateExpense(id, updatedFields)`
- `deleteExpense(id)`

Each one already has a `TODO` comment showing the Supabase call that will replace the local-array logic. Nothing else in the file needs to change when the backend is connected — the rendering and event-handling code just calls these four functions and doesn't know or care where the data actually comes from.

## Next steps

1. Host this as-is on GitHub → deploy to Vercel/Netlify to get a live link
2. Review the UI and request any changes before backend work starts
3. Set up the `expenses` table in Supabase (or collection in Appwrite) matching the schema in the teaching notes
4. Fill in the four `TODO`s in `app.js`
