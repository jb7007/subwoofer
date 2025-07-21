// js/logic/dashboard/dashboard.js
// handles main logic for dashboard

import { fetchLogs, recentLogs } from "../api/logs.js";
import { getDashStats } from "../api/dash.js";
import { setupModalListeners } from "../modals/modal-setup.js";
import { renderRecentLogs } from "../components/recent-logs.js";
import { renderGraphs } from "../components/graph-display.js";
import { setMetricText } from "../components/dash-metrics.js";

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
			setMetricText({
				"top-instrument": dashResult.data.common_instrument,
				"total-mins": dashResult.data.total_minutes,
				"total-mins-header": dashResult.data.total_minutes,
				"avg-mins": dashResult.data.average_minutes,
				"avg-mins-header": dashResult.data.average_minutes,
				"common-piece": dashResult.data.common_piece,
			});
		}
	} catch (err) {
		console.error("Error fetching logs for chart:", err);
	}
});
