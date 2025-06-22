// static/js/log.js
import { setupModalListeners, setupLogForm, renderLogs } from "./logic.js";
import { fetchLogs } from "./api.js";

document.addEventListener("DOMContentLoaded", async () => {
  setupModalListeners();
  setupLogForm();

  // Fetch and display logs on page load
  try {
    const { ok, data } = await fetchLogs();
    if (ok) renderLogs(data);
    else console.error("Failed to load logs.");
  } catch (err) {
    console.error("Error fetching logs:", err);
  }
});
