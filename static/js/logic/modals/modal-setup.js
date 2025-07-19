import { getLogData, postLog } from "../log-core/utils";
import { registerUser, loginUser } from "../../api";
import { setUpEscapeToExit, setUpExitButton, setUpOpenButton } from "./modal-helper";

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

    // get HTML dropdown value for the piece
    const dropdownValue = document.getElementById("pieceDropdown").value;
    // gets user-typed piece title and composer (if included) and trims inputs
    const manualTitle = document.getElementById("piece")?.value.trim();
    const manualComposer = document.getElementById("composerInput")?.value.trim();

    // piece title and composer info to be sent to backend, we'll clean them up later
    let pieceTitle = null;
    let composer = null;

    if (dropdownValue) { // if user selects a pre-selected piece 
      // use the saved piece from the dropdown
      const [title, comp] = dropdownValue.split(":::");
      // sets pieceTitle and composer to clean values for backend to use
      pieceTitle = title?.trim();
      composer = comp?.trim();
    } else if (manualTitle) {
      // use the manually typed piece
      pieceTitle = manualTitle;
      composer = manualComposer || "Unknown";
    } else {
      // No piece info given
      pieceTitle = null;
      composer = null;
    }

    postLog(getLogData());

  });
}

export function hiddenInputSetup(hiddenFields) {
  hiddenFields.forEach((fieldId) => {
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
      hiddenFields: null,
    },
    login: {
      openButtons: ["loginButton"],
      closeButton: "loginCloseModal",
      cancelButton: null,
      modal: "loginModal",
      animateIn: loginAnimateModalIn,
      animateOut: loginAnimateModalOut,
      form: "loginModalBox",
      hiddenFields: null,
    },
    log: {
      openButtons: ["openLogModal"],
      closeButton: "practiceCloseModal",
      cancelButton: "closePracticeLogModal",
      modal: "logModal",
      animateIn: logAnimateModalIn,
      animateOut: logAnimateModalOut,
      form: "practiceModalBox",
      hiddenFields: ["composerInput", "composerLabel"],
    },
  };

  Object.values(modals).forEach(
    ({
      openButtons,
      closeButton,
      cancelButton,
      modal,
      animateIn,
      animateOut,
      form,
      hiddenFields,
    }) => {
      const modalEl = document.getElementById(modal);
      if (!modalEl) return;

      setUpEscapeToExit(modalEl, animateOut);

      openButtons.forEach((id) => {
        setUpOpenButton(modalEl, id, animateIn, hiddenFields, form, true)
      });

      if (closeButton) setUpExitButton(modalEl, closeButton, animateOut);

      if (cancelButton) setUpExitButton(modalEl, cancelButton, animateOut);

      modalOverlayExit(modalEl, animateOut);
    }
  );
}

