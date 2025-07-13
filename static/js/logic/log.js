// static/js/log.js
import {
  setupModalListeners,
  setupLogForm,
  renderLogs,
  sortLogs,
  setLogsData,
} from "./logic.js";
import { fetchLogs } from "../api/index.js";

document.addEventListener("DOMContentLoaded", async () => {
  setupModalListeners();
  setupLogForm();

  // Fetch and display logs on page load
  try {
    const { ok, data } = await fetchLogs();
    if (ok) {
      setLogsData(data);
      renderLogs(data);
    } else console.error("Failed to load logs.");
  } catch (err) {
    console.error("Error fetching logs:", err);
  }

  document.querySelectorAll("[data-sort]").forEach((header) => {
    header.addEventListener("click", () => {
      const field = header.getAttribute("data-sort");
      sortLogs(field);
    });
  });
});
