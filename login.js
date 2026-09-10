/* ===================================================
   Ledger — Login
   login.js

   AUTH STATUS: local stub, no real backend check yet.
   Credentials are hardcoded below and passwords are plain
   text — this is fine ONLY for this teaching demo, never
   for a real app. Real passwords must never be stored or
   compared as plain text; a real backend hashes them.

   TODO (later lesson): replace checkCredentials() with a
   real Supabase query against a "users" table, and use
   Supabase Auth (or at least hashed passwords) instead of
   a hardcoded list.
   =================================================== */

// ---------------------------------------------------
// DEMO USERS (stand-in for a real users table)
// ---------------------------------------------------

const DEMO_USERS = [
  { name: "admin", password: "admin123" },
  { name: "student", password: "student123" },
];

// Returns true/false. Swap this out for a real Supabase call later —
// everything else in this file stays the same.
async function checkCredentials(name, password) {
  // TODO (backend day): replace with something like
  // const { data, error } = await supabaseClient
  //   .from('users')
  //   .select('*')
  //   .eq('name', name)
  //   .eq('password_hash', hash(password)) // never compare plain text for real
  //   .single();
  // return !error && data;

  const match = DEMO_USERS.find(
    (u) => u.name === name && u.password === password
  );
  return Boolean(match);
}

// ---------------------------------------------------
// DOM + EVENT HANDLING
// ---------------------------------------------------

const loginForm = document.getElementById('loginForm');
const loginNameInput = document.getElementById('loginName');
const loginPasswordInput = document.getElementById('loginPassword');
const loginError = document.getElementById('loginError');

// If already logged in, skip straight to the app
if (sessionStorage.getItem('loggedInUser')) {
  window.location.href = 'index.html';
}

loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const name = loginNameInput.value.trim();
  const password = loginPasswordInput.value;

  const isValid = await checkCredentials(name, password);

  if (isValid) {
    sessionStorage.setItem('loggedInUser', name);
    window.location.href = 'index.html';
  } else {
    loginError.hidden = false;
    loginPasswordInput.value = '';
    loginPasswordInput.focus();
  }
});
