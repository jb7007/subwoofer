/**
 * Graph Display Component for Practice Tracker Dashboard
 *
 * This module handles the rendering of all dashboard charts using Plotly.js.
 * It receives chart data from the backend API and creates interactive visualizations
 * including gauges, line charts, and bar charts for practice data display.
 *
 * Dependencies:
 * - Plotly.js (loaded globally)
 * - time-format.js for duration formatting utilities
 *
 * Chart Types:
 * - Daily practice gauge: Shows today's progress vs target
 * - Cumulative chart: All-time practice progress over time
 * - Weekly chart: Current week's daily practice totals
 */

import { renderAsTxt } from "./time-format.js";

/**
 * Renders the daily practice gauge showing today's progress vs target.
 *
 * Creates a circular gauge chart that displays today's practice minutes
 * with a visual indicator of progress toward the daily target. The gauge
 * uses color coding to show different achievement levels.
 *
 * @param {Object} data - Daily practice data from API
 * @param {number} data.total_today - Minutes practiced today
 * @param {number} data.target - Daily target in minutes (usually 60)
 */
function renderDailyMinutes(data) {
	if (!data) {
		console.error("renderDailyMinutes: data is undefined");
		return;
	}

	const { total_today, target } = data;

	// Configure Plotly gauge chart
	const trace = [
		{
			value: total_today, // Current value to display
			type: "indicator",
			mode: "gauge+number+delta", // Show gauge, number, and delta from target
			delta: { reference: target }, // Show difference from target
			gauge: {
				axis: { visible: false, range: [null, 120] }, // 0-120 minute range
				steps: [
					{ range: [0, 60], color: "lightgray" }, // 0-60 min: light gray
					{ range: [60, 90], color: "gray" }, // 60-90 min: darker gray
				],
			},
		},
	];

	// Render the gauge with minimal margins for compact display
	Plotly.newPlot("daily-gauge", trace, {
		height: 125,
		margin: { t: 10, b: 10, l: 0, r: 0 },
	});

	// Also display as formatted text for accessibility
	renderAsTxt("daily-practice-txt", total_today);
}

/**
 * Renders the cumulative practice minutes chart showing all-time progress.
 *
 * Creates a line chart displaying the running total of practice minutes
 * over time, from the user's first practice session to today. This gives
 * users a visual representation of their long-term practice journey.
 *
 * @param {Object} graphData - Cumulative chart data from API
 * @param {number} graphData.total_mins - Total practice minutes to date
 * @param {Array} graphData.y_vals - Cumulative minutes for each date
 * @param {number} graphData.x_range - Number of data points for scaling
 */
function renderTotalMinutes(graphData) {
	const { total_mins, y_vals, x_range } = graphData;

	// Prepare chart data with both indicator and line chart
	const data = [
		{
			type: "indicator",
			mode: "number+delta",
			title: { text: "Cumulative Total" },
			value: total_mins, // Display total minutes
			delta: { reference: total_mins - 10, valueformat: ".0f" }, // Show recent change
			axis: { visible: false },
		},
		{
			mode: "lines",
			y: y_vals, // Cumulative values over time
			fill: "tozeroy", // Fill area under the line
			line: { color: "cornflowerblue", width: 2 }, // Blue line styling
			fillcolor: "rgba(100, 149, 237, 0.3)", // Semi-transparent fill
		},
	];

	// Configure chart layout for clean, minimal appearance
	const layout = {
		margin: { t: 5, b: 0, l: 0, r: 0 }, // Minimal margins
		xaxis: { range: [0, x_range - 1], visible: false }, // Hide x-axis
		yaxis: { visible: false }, // Hide y-axis
	};

	// Render the chart with responsive sizing
	Plotly.newPlot("total-chart", data, layout, { responsive: true });

	// Also display total as formatted text
	renderAsTxt("total-practice-txt", total_mins);
}

/**
 * Renders the weekly practice chart showing daily totals and average line.
 *
 * Creates a bar chart displaying practice minutes for each day of the current
 * week, with an average line for comparison. This helps users see their
 * consistency and identify patterns in their practice schedule.
 *
 * @param {Object} data - Weekly practice data from API
 * @param {Array} data.y_vals - Daily practice minutes for each day of week
 * @param {number} data.min_avg - Average daily practice for days with practice
 * @param {Array} data.min_avg_arr - Average value repeated for trend line
 * @param {number} data.x_axis_range - Range for x-axis (0-6 for 7 days)
 */
function renderAvgMinutes(data) {
	const { y_vals, min_avg, min_avg_arr, x_axis_range } = data;

	// Prepare chart data with indicator and line chart
	const trace = [
		{
			type: "indicator",
			mode: "number+delta",
			title: { text: "Total Average" },
			value: Math.floor(min_avg), // Show average as whole number
			delta: { reference: min_avg - 25, valueformat: ".0f" }, // Show change from baseline
			axis: { visible: false },
			showlegend: false,
		},
		{
			mode: "lines+markers",
			y: y_vals, // Daily practice minutes
			showlegend: false,
			line: { color: "rgb(38, 56, 91)", width: 2 }, // Dark blue line for actual data
		},
		{
			mode: "lines",
			y: min_avg_arr, // Average line for comparison
			fill: "tozeroy", // Fill area under average
			line: { color: "cornflowerblue", width: 2 }, // Light blue for average
			fillcolor: "rgba(100, 149, 237, 0.3)", // Semi-transparent fill
			showlegend: false,
		},
	];

	// Configure layout for clean appearance
	const layout = {
		margin: { t: 5, b: 0, l: 0, r: 0 }, // Minimal margins
		xaxis: { range: [0, x_axis_range], visible: false }, // Hide x-axis (days)
		yaxis: { range: [-1, null], visible: false }, // Hide y-axis, start slightly below 0
	};

	// Render the weekly chart
	Plotly.newPlot("avg-chart", trace, layout, { responsive: true });

	// Display average as formatted text (no "mins" suffix, show as average)
	renderAsTxt("avg-practice-txt", Math.floor(min_avg), false, true);
}

/**
 * Main function to render all dashboard charts with backend-provided data.
 *
 * This function takes the unified dashboard data from the API and renders
 * all three chart types. It handles the new backend-calculated data structure
 * and ensures all charts are properly displayed.
 *
 * @param {Object} dashboardData - Complete dashboard data from /api/dashboard/stats
 * @param {Object} dashboardData.cumulative - Data for cumulative chart
 * @param {Object} dashboardData.weekly - Data for weekly chart
 * @param {Object} dashboardData.daily - Data for daily gauge
 */

export function renderGraphs(dashData) {
	/**
	 * Render all dashboard charts using backend-calculated data.
	 *
	 * This is the main entry point called by dashboard.js to render all charts
	 * after fetching data from the /api/dashboard/stats endpoint. It safely
	 * handles missing data and provides error logging for debugging.
	 */

	// Render daily practice gauge if data is available
	if (dashData.daily) {
		renderDailyMinutes(dashData.daily);
	} else {
		console.error("dashData.daily is undefined - cannot render daily gauge");
	}

	// Render cumulative practice chart if data is available
	if (dashData.cumulative) {
		renderTotalMinutes(dashData.cumulative);
	} else {
		console.warn(
			"dashData.cumulative is undefined - skipping cumulative chart"
		);
	}

	// Render weekly practice chart if data is available
	if (dashData.weekly) {
		renderAvgMinutes(dashData.weekly);
	} else {
		console.warn("dashData.weekly is undefined - skipping weekly chart");
	}
}
