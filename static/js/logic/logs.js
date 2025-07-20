// ====================
// SECTION: Log Data Functions
// ====================

import { submitLog } from "../api/logs.js";
import { closeLogModal } from "../modals/modal-safety.js";
import { extractPieceAndComposer } from "../../js/logic/log-form.js";
import { setLogs } from "../state/logs.js";
import { renderLogs } from "../components/log-table.js";

// ANCHOR Sending Log Data

export function getLogData() {
	const { pieceTitle, composer } = extractPieceAndComposer();
	const logData = {
		local_date: document.getElementById("logDate").value,
		utc_timestamp: new Date().toISOString(),

		duration: parseInt(document.getElementById("logDuration").value),
		instrument: document.getElementById("instrument").value,
		piece: pieceTitle,
		composer: composer,
		notes: document.getElementById("logNotes")?.value || null,
	};

	return logData;
}

export function sortLogs(logs, field, ascending = true) {
	return [...logs].sort((a, b) => {
		let valA = a[field],
			valB = b[field];
		if (field === "date") {
			valA = new Date(valA);
			valB = new Date(valB);
		}
		if (valA < valB) return ascending ? -1 : 1;
		if (valA > valB) return ascending ? 1 : -1;
		return 0;
	});
}

export async function handleLogSubmission() {
	try {
		const logData = getLogData();
		const { ok, data } = await submitLog(logData);
		if (!ok) {
			alert(data.message || "Failed to submit log.");
			return;
		}

		closeLogModal();

		const { ok: updateOk, data: logs } = await fetchLogs();
		if (updateOk) {
			setLogs(logs);
			renderLogs(logs);
		}
	} catch (error) {
		console.error("Error submitting log:", error);
		alert("An error occurred while submitting the log. Please try again.");
	}
}
