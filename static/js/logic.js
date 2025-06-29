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

let logsData = []; // raw logs fetched from Flask
let currentSort = { field: "date", asc: false };

const instrumentMap = {
  // Strings
  violin: "Violin",
  viola: "Viola",
  cello: "Cello",
  doubleBass: "Double Bass",
  harp: "Harp",

  // Woodwinds
  piccolo: "Piccolo",
  flute: "Flute",
  oboe: "Oboe",
  englishHorn: "English Horn",
  clarinetEb: "E♭ Clarinet",
  clarinetBb: "B♭ Clarinet",
  bassClarinet: "Bass Clarinet",
  contraClarinet: "Contrabass Clarinet",
  bassoon: "Bassoon",
  contrabassoon: "Contrabassoon",

  // Saxophones
  sopranoSax: "Soprano Saxophone",
  altoSax: "Alto Saxophone",
  tenorSax: "Tenor Saxophone",
  baritoneSax: "Baritone Saxophone",
  bassSax: "Bass Saxophone",

  // Brass
  trumpet: "Trumpet",
  cornet: "Cornet",
  flugelhorn: "Flugelhorn",
  frenchHorn: "French Horn",

  // Low Brass
  trombone: "Trombone",
  bassTrombone: "Bass Trombone",
  euphonium: "Euphonium",
  baritoneHorn: "Baritone Horn",
  tuba: "Tuba",

  // Percussion
  snareDrum: "Snare Drum",
  bassDrum: "Bass Drum",
  cymbals: "Cymbals",
  timpani: "Timpani",
  xylophone: "Xylophone",
  marimba: "Marimba",
  vibraphone: "Vibraphone",
  glockenspiel: "Glockenspiel",
  drumSet: "Drum Set",
  multiPercussion: "Multi-Percussion Setup",
  accessoryPercussion: "Accessory Percussion",
  percussionOther: "Other / Unlisted Percussion",

  // Other
  piano: "Piano",
  organ: "Organ",
  celesta: "Celesta",
  guitar: "Guitar",
  electricGuitar: "Electric Guitar",
  bassGuitar: "Bass Guitar",
  ukulele: "Ukulele",
  voice: "Voice",
  other: "Other"
};

// getter so other files can access logsData safely
export function setLogsData(data) {
  logsData = data;
}

export function sortLogs(field) {
  if (currentSort.field === field) {
    currentSort.asc = !currentSort.asc;
  } else {
    currentSort.field = field;
    currentSort.asc = true;
  }

  const sorted = [...logsData].sort((a, b) => {
    let valA = a[field];
    let valB = b[field];
    if (field === "date") {
      valA = new Date(valA);
      valB = new Date(valB);
    }
    if (valA < valB) return currentSort.asc ? -1 : 1;
    if (valA > valB) return currentSort.asc ? 1 : -1;
    return 0;
  });

  renderLogs(sorted);
}


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

export function hiddenInputSetup(hiddenFields) {
  hiddenFields.forEach(fieldId => {
    const field = document.getElementById(fieldId);
    if (field) {
      field.style.display = "none"; // Hide composer input
      field.disabled = true; // Disable composer input
      if (fieldId === "composerInput") {
        field.value = ""; // Clear composer input on close
      }
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
      form: "signupModalBox",
      hiddenFields: null
    },
    login: {
      openButtons: ["loginButton"],
      closeButton: "loginCloseModal",
      cancelButton: null,
      modal: "loginModal",
      animateIn: loginAnimateModalIn,
      animateOut: loginAnimateModalOut,
      form: "loginModalBox",
      hiddenFields: null
    },
    log: {
      openButtons: ["openLogModal"],
      closeButton: "practiceCloseModal",
      cancelButton: "closePracticeLogModal",
      modal: "logModal",
      animateIn: logAnimateModalIn,
      animateOut: logAnimateModalOut,
      form: "practiceModalBox",
      hiddenFields: ["composerInput", "composerLabel"]
    }
  };

  Object.values(modals).forEach(({ openButtons, closeButton, cancelButton, modal, animateIn, animateOut, form, hiddenFields }) => {
    const modalEl = document.getElementById(modal);
    if (!modalEl) return;

    document.addEventListener("keydown", e => {
      // Close modal on Escape key if it's active
      if (e.key === "Escape" && modalEl.classList.contains("active")) {
        e.preventDefault();
        e.stopPropagation();
        // Call animateOut if available, else close modal
        if (typeof animateOut === "function") animateOut();
        else closeModal(modalEl);
      }
    });

    openButtons.forEach(id => {
      const btn = document.getElementById(id);
      if (!btn) return;
      btn.addEventListener("click", e => {
        if (modalEl.classList.contains("active")) return; // Prevent re-opening if already active
        if (hiddenFields) hiddenInputSetup(hiddenFields);
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

export function renderRecentLogs(logs) {
  const recentLogs = document.getElementById("recent-logs");
  if (!recentLogs) return;

  recentLogs.innerHTML = ""; // Clear it first

  // Group logs by date
  const grouped = {};

  logs.forEach(log => {
    if (!grouped[log.date]) { // Initialize array for logs for this date if not already present
      grouped[log.date] = []; // the date is the key, the log is the value
    }
    grouped[log.date].push(log); // Add log to the date group
  });

  // Render each date group
  Object.keys(grouped).forEach(date => {
    const dateHeading = document.createElement("li"); // Create a list item for the date
    dateHeading.className = "log-date-heading"; 
    dateHeading.innerHTML = `<strong>${date}</strong>`;
    recentLogs.appendChild(dateHeading); // Append the date heading to the recent logs container

    const dateGroup = document.createElement("ul"); // Create a new unordered list for this date's logs
    dateGroup.className = "log-date-group";  
    recentLogs.appendChild(dateGroup); // Append the date group to the recent logs container

    grouped[date].forEach(log => { // For each log in this date group
      const logItem = document.createElement("li"); // Create a list item for the log
      logItem.className = "recent-log-item";
      logItem.innerHTML = `
        ${instrumentMap[log.instrument] || log.instrument} - 
        <em>${log.piece || "N/A"} by ${log.composer || "Unknown"}
        <span class="log-duration">(${log.duration} mins)</span></em>
      `;
      dateGroup.appendChild(logItem); // Append the log item to the date group
    });
  });
}

