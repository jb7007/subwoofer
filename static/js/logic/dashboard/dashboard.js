// dashboard.js
// handles main logic for dashboard

import { fetchLogs, recentLogs, getDashStats } from "../../api/index.js";
import { setupModalListeners } from "../logic.js";
import { renderRecentLogs } from "./dashHelper.js";
import { renderGraphs } from "./plot.js";
import { setTextContent } from "./utils.js";

document.addEventListener("DOMContentLoaded", async () => {
  setupModalListeners();

  try {
    const fetchResult = await fetchLogs();
    const recentResult = await recentLogs();
    const dashResult = await getDashStats();
    if (fetchResult.ok) {
      renderGraphs(fetchResult.data);
    }
    if (recentResult.ok) {
      renderRecentLogs(recentResult.data);
    }
    if (dashResult.ok) {
      const ids = {
        "top-instrument": dashResult.data.common_instrument,
        "total-mins": dashResult.data.total_minutes,
        "total-mins-header": dashResult.data.total_minutes,
        "avg-mins": dashResult.data.average_minutes,
        "avg-mins-header": dashResult.data.average_mintes,
        "common-piece": dashResult.data.common_piece,
      };

      Object.entries(ids).forEach(([id, value]) => {
        setTextContent(id, value);
      });
    }
  } catch (err) {
    console.error("Error fetching logs for chart:", err);
  }
});
