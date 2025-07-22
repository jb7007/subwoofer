import { submitLog, fetchLogs } from "../api/index.js";
import { closeLogModal } from "../modals/index.js";
import { setLogs } from "../state/logs.js";
import { renderLogs } from "../components/index.js";
import { getLogData } from "../logic/index.js";

export function extractPieceAndComposer() {
	// get HTML dropdown value for the piece
	const dropdownValue = document.getElementById("pieceDropdown").value;

	// gets user-typed piece title and composer (if included) and trims inputs
	const manualTitle = document.getElementById("piece")?.value.trim();
	const manualComposer = document.getElementById("composerInput")?.value.trim();

	// piece title and composer info to be sent to backend, we'll clean them up later
	let pieceTitle,
		composer = null;

	if (dropdownValue) {
		// if user selects a pre-selected piece, use the saved piece from the dropdown
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

	return { pieceTitle, composer };
}

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
