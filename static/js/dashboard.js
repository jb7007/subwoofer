// static/js/dashboard.js
import { setupModalListeners, renderRecentLogs } from "./logic.js";
import { fetchLogs, recentLogs } from "./api.js";
import { renderDailyMinutes, renderTotalMinutes } from "./plot.js";

document.addEventListener("DOMContentLoaded", async () => {
  setupModalListeners();

  try {
    const { ok, data } = await fetchLogs();
    if (ok) {
      renderDailyMinutes(data);
      renderTotalMinutes(data);
    } else console.error("Failed to load logs for chart.");
  } catch (err) {
    console.error("Error fetching logs for chart:", err);
  }

  // Fetch and display recent logs on page load
  try {
    const { ok, data } = await recentLogs();
    if (ok) renderRecentLogs(data);
    else console.error("Failed to load recent logs.");
  } catch (err) {
    console.error("Error fetching recent logs:", err);
  }

  fetch("/api/dash-stats")
    .then((response) => {
      if (!response.ok) throw new Error("Network response was not ok");
      return response.json();
    })
    .then((data) => {
      document.getElementById("top-instrument").textContent =
        data.common_instrument;
      document.getElementById("total-mins").textContent = data.total_minutes;
      document.getElementById("total-mins-header").textContent =
        data.total_minutes;
      document.getElementById("avg-mins").textContent = data.average_minutes;
      document.getElementById("avg-mins-header").textContent =
        data.average_minutes;
    });
});
