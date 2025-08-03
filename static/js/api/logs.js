import { fetchJson } from "./api-helper.js";

export const submitLog = (logData) =>
	fetchJson("/api/logs", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(logData),
	});

export const editLog = (logData, logNumber) =>
	fetchJson(`/api/edit-log/${logNumber}`, {
		method: "PATCH",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(logData),
	});

export const deleteLog = (logNumber) =>
	fetchJson(`/api/delete-log/${logNumber}`, {
		method: "DELETE",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ logNumber }),
	});

// gets the current user's logs
export const fetchLogs = () => fetchJson("/api/logs");
export const recentLogs = () => fetchJson("/api/recent-logs");
export const fetchPieces = () => fetchJson("/api/stats/pieces");
