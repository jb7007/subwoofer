// static/js/log-core/log.js
import { renderLogs, setLogsData } from "./utils.js";
import { fetchLogs } from "./api.js"; 
import { setupLogForm, setupModalListeners } from "../modals/modal-setup.js";
import { sortLogs } from "./utils.js"; // import sorting logic

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
