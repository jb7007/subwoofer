// js/logic/dashboard/dashboard.js
// handles main logic for dashboard

import { recentLogs, getDashboardStats } from "../api/index.js";
import { setupModalListeners } from "../modals/index.js";
import {
	renderRecentLogs,
	renderGraphs,
	setMetricText,
} from "../components/index.js";

document.addEventListener("DOMContentLoaded", async () => {
	setupModalListeners();

	try {
		const recentResult = await recentLogs();
		const dashboardResult = await getDashboardStats();

		if (dashboardResult.ok && dashboardResult.data) {
			const data = dashboardResult.data;
			renderGraphs(data);
			setMetricText({
				"top-instrument": data.common_instrument,
				"total-mins": data.total_minutes,
				"total-mins-header": data.total_minutes,
				"avg-mins": data.average_minutes,
				"avg-mins-header": data.average_minutes,
				"common-piece": data.common_piece,
			});
		}

		if (recentResult.ok) {
			renderRecentLogs(recentResult.data);
		}
	} catch (err) {
		console.error("Error fetching logs for chart:", err);
	}
});
