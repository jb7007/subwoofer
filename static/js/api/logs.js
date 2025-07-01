import { fetchJson } from "./apiHelper.js";

export const submitLog = (logData) =>
  fetchJson("/api/logs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ logData }),
  });

// gets the current user's logs
export const fetchLogs = () => fetchJson("/api/logs");
export const recentLogs = () => fetchJson("/api/recent-logs");
export const fetchPieces = () => fetchJson("/api/pieces");
