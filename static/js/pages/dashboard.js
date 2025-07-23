/**
 * Dashboard Page Logic for Practice Tracker
 *
 * This module handles the main dashboard functionality including data fetching,
 * chart rendering, and metric display. It coordinates between the API layer
 * and the various UI components to create a comprehensive dashboard experience.
 *
 * Key Responsibilities:
 * - Fetch dashboard statistics and recent logs from API
 * - Render all charts using backend-calculated data
 * - Display practice metrics and summary statistics
 * - Set up modal interactions for user actions
 * - Handle errors gracefully with appropriate logging
 *
 * Dependencies:
 * - API functions for data fetching
 * - Chart components for data visualization
 * - Modal setup for user interactions
 * - Metric display components for statistics
 */

import { recentLogs, getDashboardStats } from "../api/index.js";
import { setupModalListeners } from "../modals/index.js";
import {
	renderRecentLogs, // Displays recent practice sessions
	renderGraphs, // Renders all dashboard charts
	setMetricText, // Updates metric display elements
} from "../components/index.js";

/**
 * Initialize dashboard when DOM is ready.
 *
 * This function runs when the page loads and coordinates all dashboard
 * initialization including API calls, chart rendering, and UI setup.
 * It uses the unified dashboard API endpoint for efficiency.
 */
document.addEventListener("DOMContentLoaded", async () => {
	// Set up modal event listeners for user interactions
	setupModalListeners();

	try {
		// Fetch data from API endpoints concurrently for better performance
		const recentResult = await recentLogs(); // Get recent practice sessions
		const dashboardResult = await getDashboardStats(); // Get charts + statistics

		// Handle dashboard statistics and charts
		if (dashboardResult.ok && dashboardResult.data) {
			const data = dashboardResult.data;

			// Render all charts using backend-calculated data
			renderGraphs(data);

			// Update dashboard metrics with practice statistics
			setMetricText({
				"top-instrument": data.common_instrument, // Most frequent instrument
				"total-mins": data.total_minutes, // Lifetime total minutes
				"total-mins-header": data.total_minutes, // Header display
				"avg-mins": data.average_minutes, // Average per session
				"avg-mins-header": data.average_minutes, // Header display
				"common-piece": data.common_piece, // Most frequent piece
			});
		} else {
			console.error("Failed to fetch dashboard data:", dashboardResult);
		}

		// Handle recent practice logs display
		if (recentResult.ok) {
			renderRecentLogs(recentResult.data);
		} else {
			console.error("Failed to fetch recent logs:", recentResult);
		}
	} catch (err) {
		// Log any unexpected errors during dashboard initialization
		console.error("Error initializing dashboard:", err);

		// Could add user-facing error message here in the future
		// showErrorMessage("Unable to load dashboard data. Please refresh the page.");
	}
});
