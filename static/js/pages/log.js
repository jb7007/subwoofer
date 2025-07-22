// static/js/log-core/log.js
import { setupModalListeners, setupLogForm } from "../modals/index.js";
import { fetchLogs } from "../api/index.js";
import { setLogs, getLogs } from "../state/logs.js";
import { sortLogs } from "../logic/index.js";
import { renderLogs } from "../components/index.js";

document.addEventListener("DOMContentLoaded", async () => {
	setupModalListeners();
	setupLogForm();

	// Fetch and display logs on page load
	try {
		const { ok, data } = await fetchLogs();
		if (ok) {
			setLogs(data);
			renderLogs(data);
		} else console.error("Failed to load logs.");
	} catch (err) {
		console.error("Error fetching logs:", err);
	}

	document.querySelectorAll("[data-sort]").forEach((header) => {
		header.addEventListener("click", () => {
			const field = header.getAttribute("data-sort");
			const sorted = sortLogs(getLogs(), field);
			renderLogs(sorted);
		});
	});
});
