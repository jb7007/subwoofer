// init.js
// sets up app logic like modals and form submission (runs on all app pages)

// import the core setup functions
import { setupSignupForm, setupLoginForm, setupLogForm, setupModalListeners } from './logic.js';

// run when the document is ready
document.addEventListener("DOMContentLoaded", () => {
  // always try to attach modal buttons (signup, login, practice log)
  setupModalListeners();

  // wire up the signup form if it's on the page
  setupSignupForm();

  // wire up the login form if it's on the page
  setupLoginForm();

  // wire up the practice log form if it's on the page
  setupLogForm();
});
