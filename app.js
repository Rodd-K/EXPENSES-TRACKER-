/* ===================================================
   Ledger — Expense Tracker
   app.js

   BACKEND: Supabase
   Read + Create are connected to a real Supabase table.
   Update + Delete are still LOCAL STUBS for this lesson —
   they show a message instead of changing real data.
   We wire those up in the next lesson.
   =================================================== */

// ---------------------------------------------------
// SUPABASE SETUP — fill these 2 values in during class
// ---------------------------------------------------
// Both are on your project's Settings > API page.
// SUPABASE_URL: the "Project URL"
// SUPABASE_KEY: the "Publishable key" (this used to be called the "anon key" —
// same idea, safe to use in frontend code, do NOT use the secret key here)

const SUPABASE_URL = "https://osfvossfnxobhcxvddtz.supabase.co";
const SUPABASE_KEY = "sb_publishable_ITsFlK5Bv5FTlMi9eDUQ_w_jTd2_yJV";
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ---------------------------------------------------
// DATA LAYER
// ---------------------------------------------------

async function getExpenses() {
  const { data, error } = await supabaseClient
    .from('expenses')
    .select('*')
    .order('date', { ascending: false });

  if (error) throw error;
  return data;
}

async function createExpense(entry) {
  const { data, error } = await supabaseClient
    .from('expenses')
    .insert([entry])
    .select();

  if (error) throw error;
  return data[0];
}

async function updateExpense(id, updatedFields) {
  // NOT CONNECTED YET — wiring this up next lesson.
  console.log("updateExpense stub called with:", id, updatedFields);
  alert("Editing isn't connected to Supabase yet — that's next lesson's job!");
}

async function deleteExpense(id) {
  // NOT CONNECTED YET — wiring this up next lesson.
  console.log("deleteExpense stub called with:", id);
  alert("Deleting isn't connected to Supabase yet — that's next lesson's job!");
}

// ---------------------------------------------------
// DOM REFERENCES
// ---------------------------------------------------

const form = document.getElementById('entryForm');
const titleInput = document.getElementById('title');
const amountInput = document.getElementById('amount');
const categoryInput = document.getElementById('category');
const dateInput = document.getElementById('date');
const editingIdInput = document.getElementById('editingId');

const submitBtn = document.getElementById('submitBtn');
const cancelEditBtn = document.getElementById('cancelEditBtn');

const entriesList = document.getElementById('entriesList');
const emptyState = document.getElementById('emptyState');
const totalAmountEl = document.getElementById('totalAmount');

// Default the date field to today
dateInput.value = new Date().toISOString().split('T')[0];

// ---------------------------------------------------
// RENDERING
// ---------------------------------------------------

function formatCurrency(amount) {
  return `KSh ${Number(amount).toLocaleString()}`;
}

function formatDate(isoDate) {
  const d = new Date(isoDate);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
}

async function renderExpenses() {
  let currentExpenses;
  try {
    currentExpenses = await getExpenses();
  } catch (err) {
    console.error("Couldn't load expenses from Supabase:", err);
    entriesList.innerHTML = '';
    emptyState.hidden = false;
    emptyState.textContent = "Couldn't load expenses — check the console for the error.";
    return;
  }

  entriesList.innerHTML = '';

  if (currentExpenses.length === 0) {
    emptyState.hidden = false;
    emptyState.textContent = "No entries yet. Add your first expense above — it'll show up here.";
  } else {
    emptyState.hidden = true;

    currentExpenses.forEach(exp => {
      const row = document.createElement('div');
      row.className = 'entry-row';
      row.innerHTML = `
        <span class="entry-date">${formatDate(exp.date)}</span>
        <span class="entry-title">${escapeHtml(exp.title)}</span>
        <span class="entry-category">${escapeHtml(exp.category)}</span>
        <span class="entry-amount">${formatCurrency(exp.amount)}</span>
        <span class="entry-actions">
          <button type="button" class="edit-btn" data-id="${exp.id}">Edit</button>
          <button type="button" class="delete-btn" data-id="${exp.id}">Delete</button>
        </span>
      `;
      entriesList.appendChild(row);
    });
  }

  updateTotal(currentExpenses);
}

// Running total is always calculated fresh from the current list —
// never stored, so it can't drift out of sync with the entries.
function updateTotal(currentExpenses) {
  const total = currentExpenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
  totalAmountEl.textContent = formatCurrency(total);
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// ---------------------------------------------------
// EVENT HANDLERS
// ---------------------------------------------------

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const entry = {
    title: titleInput.value.trim(),
    amount: Number(amountInput.value),
    category: categoryInput.value,
    date: dateInput.value,
  };

  if (!entry.title || !entry.amount || !entry.category || !entry.date) {
    return; // required attributes on the inputs also guard this
  }

  const editingId = editingIdInput.value;

  try {
    if (editingId) {
      await updateExpense(editingId, entry); // stub for now
      exitEditMode();
    } else {
      await createExpense(entry); // real Supabase insert
    }
  } catch (err) {
    console.error("Couldn't save expense to Supabase:", err);
    alert("Couldn't save that entry — check the console for the error.");
    return;
  }

  form.reset();
  dateInput.value = new Date().toISOString().split('T')[0];
  await renderExpenses();
});

entriesList.addEventListener('click', async (event) => {
  const id = event.target.dataset.id;
  if (!id) return;

  if (event.target.classList.contains('delete-btn')) {
    await deleteExpense(id); // stub for now
  }

  if (event.target.classList.contains('edit-btn')) {
    enterEditMode(id);
  }
});

cancelEditBtn.addEventListener('click', () => {
  exitEditMode();
  form.reset();
  dateInput.value = new Date().toISOString().split('T')[0];
});

async function enterEditMode(id) {
  const currentExpenses = await getExpenses();
  const entry = currentExpenses.find(exp => String(exp.id) === String(id));
  if (!entry) return;

  titleInput.value = entry.title;
  amountInput.value = entry.amount;
  categoryInput.value = entry.category;
  dateInput.value = entry.date;
  editingIdInput.value = entry.id;

  submitBtn.textContent = 'Save changes';
  cancelEditBtn.hidden = false;

  titleInput.focus();
}

function exitEditMode() {
  editingIdInput.value = '';
  submitBtn.textContent = 'Add entry';
  cancelEditBtn.hidden = true;
}

// ---------------------------------------------------
// INIT
// ---------------------------------------------------

renderExpenses();
