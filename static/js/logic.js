// static/js/logic.js
// handles signup + log form logic, and sets up modal behavior

// API functions (allow getting/posting data)
import { registerUser, loginUser, submitLog, fetchLogs } from './api.js';
import { closeModal } from './modal.js';
// modal animation functions (if available)
import {
  signupAnimateModalIn,
  signupAnimateModalOut,
  loginAnimateModalIn,
  loginAnimateModalOut,
  logAnimateModalIn,
  logAnimateModalOut
} from './animation/modal.js';

const instrumentMap = {
  piano: "Piano",
  guitar: "Guitar",
  violin: "Violin",
  viola: "Viola",
  cello: "Cello",
  uprightBass: "Upright Bass",
  flute: "Flute",
  clarinet: "Clarinet",
  oboe: "Oboe",
  bassoon: "Bassoon",
  sopSax: "Soprano Saxophone",
  altoSax: "Alto Saxophone",
  tenSax: "Tenor Saxophone",
  barSax: "Baritone Saxophone",
  trumpet: "Trumpet",
  trombone: "Trombone",
  frenchHorn: "French Horn",
  tuba: "Tuba",
  harp: "Harp",
  drums: "Drums",
  voice: "Voice",
  other: "Other"
};


export function setupSignupForm() {
  const signupForm = document.getElementById("signupModalBox");
  if (!signupForm) return;

  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = document.getElementById("signupUsername").value.trim();
    const password = document.getElementById("signupPassword").value;
    try {
      // register user via API
      const { ok, status, data } = await registerUser(username, password);
      if (ok) {
        if (data.redirect) window.location.href = data.redirect;
        else console.log("signup success:", data.message);
      } else {
        if (status === 409) alert("username already exists! try another one.");
        else alert(data.message || "signup failed.");
      }
    } catch {
      alert("network error or server issue.");
    }
  });
}

export function setupLoginForm() {
  const loginForm = document.getElementById("loginModalBox");
  if (!loginForm) return;

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = document.getElementById("loginUsername").value.trim();
    const password = document.getElementById("loginPassword").value;
    try {
      // login user via API
      const { ok, status, data } = await loginUser(username, password);
      if (ok) {
        if (data.redirect) window.location.href = data.redirect;
        else console.log("login success:", data.message);
      } else {
        if (status === 401) alert("invalid username or password.");
        else alert(data.message || "login failed.");
      }
    } catch {
      alert("network error or server issue.");
    }
  });
}

export function setupLogForm() {
  const logForm = document.getElementById("practiceModalBox");
  if (!logForm) return;

  const pieceInput = document.getElementById("piece");
  const composerLabel = document.getElementById("composerLabel");
  const composerInput = document.getElementById("composerInput");

  if (!pieceInput || !composerLabel || !composerInput) return;

  // Initialize composer input state
  if (pieceInput) {
    pieceInput.value = ""; // clear piece input on load
    composerLabel.style.display = "none"; // hide composer label initially
    composerInput.style.display = "none"; // hide composer input initially
  }

  pieceInput.addEventListener("input", () => {
    if (pieceInput.value.trim() !== "") {
      composerInput.disabled = false; // enable composer input if piece is entered
      composerInput.value = ""; // clear composer input when piece is entered
      composerLabel.style.display = "flex"; // show composer label
      composerInput.style.display = "flex"; // show composer field
    } else {
      composerInput.value = ""; // clear composer input if piece is cleared
      composerInput.disabled = true; // disable composer input if no piece
      composerLabel.style.display = "none"; // optional: re-hide if field is cleared
      composerInput.style.display = "none"; // optional: re-hide if field is cleared
    }
  });


  logForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    // gather data from form fields
    const logData = {
      date: document.getElementById("logDate").value,
      duration: document.getElementById("logDuration").value,
      instrument: document.getElementById("instrument").value,
      piece: document.getElementById("piece")?.value || null,
      composer: document.getElementById("composerInput")?.value || null,
      notes: document.getElementById("logNotes")?.value || null
    };

    try {
      const { ok, data } = await submitLog(logData);
      if (!ok) {
        alert(data.message || "Log failed.");
        return;
      }

      // 1) Animate out if available, else just close
      const modalEl = document.getElementById("logModal");
      if (typeof logAnimateModalOut === "function") {
        logAnimateModalOut();
      } else {
        closeModal(modalEl);
      }

      // 2) Re-fetch logs and update table
      const { ok: fetchOk, data: logs } = await fetchLogs();
      if (fetchOk) {
        renderLogs(logs);
      }

    } catch {
      alert("network error.");
    }
  });
}

export function setupModalListeners() {
  const modals = {
    signup: {
      openButtons: ["signUp", "navSignupButton"],
      closeButton: "signupCloseModal",
      cancelButton: null,
      modal: "signupModal",
      animateIn: signupAnimateModalIn,
      animateOut: signupAnimateModalOut,
      form: "signupModalBox"
    },
    login: {
      openButtons: ["loginButton"],
      closeButton: "loginCloseModal",
      cancelButton: null,
      modal: "loginModal",
      animateIn: loginAnimateModalIn,
      animateOut: loginAnimateModalOut,
      form: "loginModalBox"
    },
    log: {
      openButtons: ["openLogModal"],
      closeButton: "practiceCloseModal",
      cancelButton: "closePracticeLogModal",
      modal: "logModal",
      animateIn: logAnimateModalIn,
      animateOut: logAnimateModalOut,
      form: "practiceModalBox"
    }
  };

  Object.values(modals).forEach(({ openButtons, closeButton, cancelButton, modal, animateIn, animateOut, form }) => {
    const modalEl = document.getElementById(modal);
    if (!modalEl) return;

    document.addEventListener("keydown", e => {
      // Close modal on Escape key if it's active
      if (e.key === "Escape" && modalEl.classList.contains("active")) {
        e.preventDefault();
        e.stopPropagation();
        if (typeof animateOut === "function") animateOut();
        else closeModal(modalEl);
      }
    });

    openButtons.forEach(id => {
      const btn = document.getElementById(id);
      if (!btn) return;
      btn.addEventListener("click", e => {
        e.preventDefault();
        document.getElementById(form)?.reset();
        if (typeof animateIn === "function") animateIn();
        else modalEl.classList.add("active");
      });
    });

    if (closeButton) {
      const btn = document.getElementById(closeButton);
      btn?.addEventListener("click", e => {
        e.preventDefault();
        e.stopPropagation();
        if (typeof animateOut === "function") animateOut();
        else closeModal(modalEl);
      });
    }

    if (cancelButton) {
      const btn = document.getElementById(cancelButton);
      btn?.addEventListener("click", e => {
        e.preventDefault();
        e.stopPropagation();
        if (typeof animateOut === "function") animateOut();
        else closeModal(modalEl);
      });
    }

    window.addEventListener("click", e => {
      if (e.target === modalEl) {
        e.preventDefault();
        e.stopPropagation();
        if (typeof animateOut === "function") animateOut();
        else closeModal(modalEl);
      }
    });
  });
}

export function renderLogs(logs) {
  const tableBody = document.getElementById("log-table-body");
  if (!tableBody) return;

  tableBody.innerHTML = ""; // Clear current rows

  logs.forEach(log => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${log.id}</td>
      <td>${log.date}</td>
      <td>${log.duration}</td>
      <td>${instrumentMap[log.instrument] || log.instrument}</td>
      <td>${log.piece}</td>
      <td>${log.composer || "N/A"}</td>
      <td>${log.notes}</td>
    `;

    tableBody.appendChild(row);
  });
}

