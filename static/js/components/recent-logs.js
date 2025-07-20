// js/components/recent-logs.js

import { instrumentMap } from "../utils/instrument-map.js";
import { renderTxtShort } from "./time-format.js";

// Takes log entries and renders them grouped by date
export function renderRecentLogs(logs) {
	const container = document.getElementById("recent-logs");
	if (!container) return;

	container.innerHTML = "";

	// Group logs by date
	const grouped = {};
	for (const log of logs) {
		if (!grouped[log.date]) grouped[log.date] = [];
		grouped[log.date].push(log);
	}

	let count = 0;

	// Render each date group
	for (const [date, logsForDate] of Object.entries(grouped)) {
		const dateHeading = document.createElement("li");
		dateHeading.className = "log-date-heading";
		dateHeading.innerHTML = `<strong>${date}</strong>`;
		container.appendChild(dateHeading);

		const dateGroup = document.createElement("ul");
		dateGroup.className = "log-date-group";
		container.appendChild(dateGroup);

		for (const log of logsForDate) {
			const logItem = document.createElement("li");
			logItem.className = "recent-log-item";

			const listId = `${count}durationIs${log.duration}`;
			logItem.innerHTML = `
				${instrumentMap[log.instrument] || log.instrument} – 
				<em>${log.piece || "N/A"} by ${log.composer || "Unknown"}
				(<span class="log-duration" id="${listId}">Loading...</span>)</em>
			`;

			dateGroup.appendChild(logItem);
			renderTxtShort(listId, log.duration);
			count++;
		}
	}
}
