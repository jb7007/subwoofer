// js/logic/dashboard/dashboard.js
// handles main logic for dashboard

import { fetchLogs, recentLogs, getDashStats } from "../api/index.js";
import { setupModalListeners } from "../modals/index.js";
import {
	renderRecentLogs,
	renderGraphs,
	setMetricText,
} from "../components/index.js";

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
			console.log("Recent logs:", recentResult.data);
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
