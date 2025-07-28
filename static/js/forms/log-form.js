/**
 * Practice Log Form Handler for Practice Tracker
 *
 * This module handles the practice log entry form functionality including
 * form submission, piece/composer extraction, field management, and form
 * validation. It coordinates between the UI form and the API layer.
 *
 * Key Features:
 * - Extract piece and composer information from form inputs
 * - Handle both dropdown selections and manual entry
 * - Form validation and error handling
 * - State management for logs after submission
 * - Modal integration for form display
 */

import { submitLog, fetchLogs } from "../api/index.js";
import { closeLogModal } from "../modals/index.js";
import { setLogs } from "../state/logs.js";
import { renderLogs } from "../components/index.js";
import { getLogData } from "../logic/index.js";

/**
 * Extract piece title and composer information from form inputs.
 *
 * This function handles two input methods:
 * 1. Dropdown selection of existing pieces (format: "title:::composer")
 * 2. Manual text input for new pieces with optional composer
 *
 * @returns {Object} Object containing:
 *   - pieceTitle: String title of the piece (or null if none provided)
 *   - composer: String composer name (or null if none provided)
 *
 * @example
 * const { pieceTitle, composer } = extractPieceAndComposer();
 * // Returns: { pieceTitle: "Chopin Etude Op. 10 No. 1", composer: "Chopin" }
 */
export function extractPieceAndComposer() {
	// Get HTML dropdown value for pre-existing pieces
	const dropdownValue = document.getElementById("pieceDropdown")?.value;

	// Get user-typed piece title and composer (if manually entered) and trim whitespace
	const manualTitle = document.getElementById("piece")?.value?.trim();
	const manualComposer = document
		.getElementById("composerInput")
		?.value?.trim();

	// Initialize variables for piece title and composer to be sent to backend
	let pieceTitle,
		composer = null;

	if (dropdownValue) {
		// User selected a pre-existing piece from dropdown
		// Format: "title:::composer" (triple colon separator)
		const [title, comp] = dropdownValue.split(":::");
		pieceTitle = title?.trim(); // Clean title from dropdown
		composer = comp?.trim(); // Clean composer from dropdown
	} else if (manualTitle) {
		// User manually typed a new piece
		pieceTitle = manualTitle;
		composer = manualComposer || "Unknown"; // Default to "Unknown" if no composer provided
	} else {
		// No piece information provided by user
		pieceTitle = null;
		composer = null;
	}

	return { pieceTitle, composer };
}

/**
 * Reset piece and composer form fields to their default state.
 *
 * This function clears the manual input fields and resets visibility
 * of composer-related elements when the form is reset or modal is closed.
 */
export function resetPieceComposerFields() {
	const pieceInput = document.getElementById("piece");
	const composerLabel = document.getElementById("composerLabel");
	const composerInput = document.getElementById("composerInput");

	if (pieceInput) pieceInput.value = "";

	if (composerInput) {
		composerInput.value = "";
		composerInput.disabled = true; // Disable composer input
		composerInput.style.display = "none";
	}

	if (composerLabel) composerLabel.style.display = "none";
}

export function setupPieceInputToggle() {
	const pieceInput = document.getElementById("piece");
	const composerLabel = document.getElementById("composerLabel");
	const composerInput = document.getElementById("composerInput");

	if (!pieceInput || !composerInput || !composerLabel) return;

	pieceInput.addEventListener("input", () => {
		const pieceFilled = pieceInput.value.trim() !== "";

		composerInput.disabled = !pieceFilled;
		composerInput.value = "";

		composerLabel.style.display = pieceFilled ? "flex" : "none";
		composerInput.style.display = pieceFilled ? "flex" : "none";
	});
}

export async function handleLogSubmission() {
	try {
		const logData = getLogData();
		console.log("Submitting log data:", logData);
		const { ok, data } = await submitLog(logData);
		console.log("Log submission response:", { ok, data });
		console.log("Log data:", data);
		if (!ok) {
			alert(data.message || "Failed to submit log.");
			return;
		}

		closeLogModal();

		const { ok: updateOk, data: logs } = await fetchLogs();
		console.log("Updated logs after submission:", logs);
		if (updateOk) {
			setLogs(logs);
			renderLogs(logs);
		}
	} catch (error) {
		console.error("Error submitting log:", error);
		alert("An error occurred while submitting the log. Please try again.");
	}
}
