/* ===================================================
   Ledger — Expense Tracker
   app.js

   NOTE FOR THE STUDENT:
   All four data functions below (getExpenses, createExpense,
   updateExpense, deleteExpense) are written as "async" and
   return Promises, even though right now they just use a
   local array. That's on purpose — when we connect Supabase
   or Appwrite next, only the INSIDE of these four functions
   changes. Nothing else in this file needs to be touched.
   =================================================== */

// ---------------------------------------------------
// DATA LAYER (this is the part that becomes Supabase/Appwrite later)
// ---------------------------------------------------

let expenses = [
  { id: 1, title: "Lunch",        amount: 450,  category: "Food",      date: "2026-09-06" },
  { id: 2, title: "Uber to work", amount: 300,  category: "Transport", date: "2026-09-07" },
  { id: 3, title: "Electricity",  amount: 1800, category: "Bills",     date: "2026-09-05" },
];

let nextId = 4; // TODO: remove once the database auto-generates ids

async function getExpenses() {
  // TODO (backend day): replace with
  // const { data, error } = await supabase.from('expenses').select('*').order('date', { ascending: false });
  // return data;
  return [...expenses].sort((a, b) => new Date(b.date) - new Date(a.date));
}

async function createExpense(entry) {
  // TODO (backend day): replace with
  // const { data, error } = await supabase.from('expenses').insert([entry]).select();
  const newEntry = { id: nextId++, ...entry };
  expenses.push(newEntry);
  return newEntry;
}

async function updateExpense(id, updatedFields) {
  // TODO (backend day): replace with
  // const { data, error } = await supabase.from('expenses').update(updatedFields).eq('id', id);
  expenses = expenses.map(exp =>
    exp.id === id ? { ...exp, ...updatedFields } : exp
  );
}

async function deleteExpense(id) {
  // TODO (backend day): replace with
  // const { error } = await supabase.from('expenses').delete().eq('id', id);
  expenses = expenses.filter(exp => exp.id !== id);
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
  const currentExpenses = await getExpenses();

  entriesList.innerHTML = '';

  if (currentExpenses.length === 0) {
    emptyState.hidden = false;
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

  if (editingId) {
    await updateExpense(Number(editingId), entry);
    exitEditMode();
  } else {
    await createExpense(entry);
  }

  form.reset();
  dateInput.value = new Date().toISOString().split('T')[0];
  await renderExpenses();
});

entriesList.addEventListener('click', async (event) => {
  const id = Number(event.target.dataset.id);
  if (!id) return;

  if (event.target.classList.contains('delete-btn')) {
    const confirmed = confirm('Delete this entry? This can\'t be undone.');
    if (!confirmed) return;

    await deleteExpense(id);
    await renderExpenses();
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
  const entry = currentExpenses.find(exp => exp.id === id);
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
