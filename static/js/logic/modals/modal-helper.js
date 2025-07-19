import { hiddenInputSetup } from "./modal-setup.js";
import { populatePieceDropdown } from "./modal-setup.js";

export function setUpEscapeToExit(modalEl, animateOut) {
    if (!modalEl) return;

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modalEl.classList.contains("active")) {
      e.preventDefault();
      e.stopPropagation();
      // Call animateOut if available, else close modal
      if (typeof animateOut === "function") animateOut();
      else closeModal(modalEl);
    }
  });
}

export function setUpOpenButton(modalEl, id, animateIn, hiddenFields, form, populate = false) {
    const btn = document.getElementById(id);
    if (!btn) return;

    btn.addEventListener("click", (e) => {
        if (modalEl.classList.contains("active")) return; // Prevent re-opening if already active
        if (hiddenFields) hiddenInputSetup(hiddenFields);
        e.preventDefault();
        document.getElementById(form)?.reset();
    
        if (populate) populatePieceDropdown();
    
        if (typeof animateIn === "function") animateIn();
        else modalEl.classList.add("active");
    });
}

export function setUpExitButton(modalEl, button, animateOut) {
    const btn = document.getElementById(button);
    btn?.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (typeof animateOut === "function") animateOut();
        else closeModal(modalEl);
    });
}

export function modalOverlayExit(modalEl, animateOut) {
    window.addEventListener("click", (e) => {
        if (e.target === modalEl) {
            e.preventDefault();
            e.stopPropagation();
            if (typeof animateOut === "function") animateOut();
            else closeModal(modalEl);
        }
    });
}

export async function populatePieceDropdown() {
  const dropdown = document.getElementById("pieceDropdown");
  if (!dropdown) return;

  // TODO: adjust backend logic for fetching specific log attributes
  const { ok, data } = await fetchPieces();
  if (!ok) {
    console.warn("Could not load pieces.");
    return;
  }

  dropdown.innerHTML = '<option value="">-- Select a piece --</option>';

  data.forEach((piece) => {
    const option = document.createElement("option");
    option.value = `${piece.title}:::${piece.composer}`;
    option.textContent = `${piece.title} (${piece.composer})`;
    dropdown.appendChild(option);
  });
}

// opens a modal by adding the "active" class
export function openModal(modalElement) {
  // adds the .active class, which makes the modal visible
  modalElement.classList.add("active");
}

// closes a modal by removing "active" and clearing inputs
export function closeModal(modalElement) {
  // removes the .active class so the modal hides
  modalElement.classList.remove("active");

  // selects all inputs inside the modal and clears their values
  modalElement.querySelectorAll("input").forEach(input => {
    input.value = ""; // clear input field
  });

  // optionally could also clear textareas if you want
  modalElement.querySelectorAll("textarea").forEach(area => {
    area.value = ""; // clear textarea field
  });
}