// ====================
// SECTION: Log Data Functions
// ====================

import { extractPieceAndComposer } from "../../forms/index.js";

// ANCHOR Sending Log Data

export function getLogData() {
	const { pieceTitle, composer } = extractPieceAndComposer();
	const logData = {
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
