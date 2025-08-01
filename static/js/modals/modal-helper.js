import { resetPieceComposerFields } from "../forms/index.js";
import { fetchPieces } from "../api/index.js";

export function openModal(modalElement) {
	// adds the .active class, which makes the modal visible
	modalElement.classList.add("active");
}

export function closeModal(modalElement) {
	// removes the .active class so the modal hides
	modalElement.classList.remove("active");

	// selects all inputs inside the modal and clears their values
	modalElement.querySelectorAll("input").forEach((input) => {
		input.value = ""; // clear input field
	});

	modalElement.querySelectorAll("textarea").forEach((area) => {
		area.value = ""; // clear textarea field
	});
}

export function setUpEscapeToExit(modalEl, animateOut) {
	if (!modalEl) return;

	document.addEventListener("keydown", (e) => {
		if (e.key === "Escape" && modalEl.classList.contains("active")) {
			e.preventDefault();
			e.stopPropagation();
			// Call animateOut if available, else close
			if (modalEl.id === "logModal") resetPieceComposerFields();
			if (typeof animateOut === "function") animateOut();
			else closeModal(modalEl);
		}
	});
}

export function setUpOpenButton(
	modalEl,
	id,
	animateIn,
	hiddenFields,
	form,
	populate = false
) {
	const btn = document.getElementById(id);
	if (!btn) return;

	btn.addEventListener("click", (e) => {
		if (modalEl.classList.contains("active")) return; // Prevent re-opening if already active
		if (hiddenFields) {
			hiddenInputSetup(hiddenFields);
		}

		e.preventDefault();
		document.getElementById(form)?.reset();

		if (modalEl.id === "logModal") resetPieceComposerFields();

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

		if (modalEl.id === "logModal") resetPieceComposerFields();
		if (typeof animateOut === "function") animateOut();
		else closeModal(modalEl);
	});
}

export function modalOverlayExit(modalEl, animateOut) {
	window.addEventListener("click", (e) => {
		if (e.target === modalEl) {
			e.preventDefault();
			e.stopPropagation();

			if (modalEl.id === "logModal") resetPieceComposerFields();
			if (typeof animateOut === "function") animateOut();
			else closeModal(modalEl);
		}
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
