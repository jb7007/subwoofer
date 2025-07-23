// js/components/graph-display.js

import { renderAsTxt } from "./time-format.js";

// Renders the user's daily practice gauge
function renderDailyMinutes(data) {
	if (!data) {
		console.error("renderDailyMinutes: data is undefined");
		return;
	}

	const { total_today, target } = data;
	const trace = [
		{
			value: total_today,
			type: "indicator",
			mode: "gauge+number+delta",
			delta: { reference: target },
			gauge: {
				axis: { visible: false, range: [null, 120] },
				steps: [
					{ range: [0, 60], color: "lightgray" },
					{ range: [60, 90], color: "gray" },
				],
			},
		},
	];

	Plotly.newPlot("daily-gauge", trace, {
		height: 125,
		margin: { t: 10, b: 10, l: 0, r: 0 },
	});
	renderAsTxt("daily-practice-txt", total_today);
}

// Renders the user's total cumulative minutes chart
function renderTotalMinutes(graphData) {
	const { total_mins, y_vals, x_range } = graphData;

	const data = [
		{
			type: "indicator",
			mode: "number+delta",
			title: { text: "Cumulative Total" },
			value: total_mins,
			delta: { reference: total_mins - 10, valueformat: ".0f" },
			axis: { visible: false },
		},
		{
			mode: "lines",
			y: y_vals,
			fill: "tozeroy",
			line: { color: "cornflowerblue", width: 2 },
			fillcolor: "rgba(100, 149, 237, 0.3)",
		},
	];

	const layout = {
		margin: { t: 5, b: 0, l: 0, r: 0 },
		xaxis: { range: [0, x_range - 1], visible: false },
		yaxis: { visible: false },
	};

	Plotly.newPlot("total-chart", data, layout, { responsive: true });
	renderAsTxt("total-practice-txt", total_mins);
}

// Renders average minutes and trend line for current week
function renderAvgMinutes(data) {
	const { y_vals, min_avg, min_avg_arr, x_axis_range } = data;

	const trace = [
		{
			type: "indicator",
			mode: "number+delta",
			title: { text: "Total Average" },
			value: Math.floor(min_avg),
			delta: { reference: min_avg - 25, valueformat: ".0f" },
			axis: { visible: false },
			showlegend: false,
		},
		{
			mode: "lines+markers",
			y: y_vals,
			showlegend: false,
			line: { color: "rgb(38, 56, 91)", width: 2 },
		},
		{
			mode: "lines",
			y: min_avg_arr,
			fill: "tozeroy",
			line: { color: "cornflowerblue", width: 2 },
			fillcolor: "rgba(100, 149, 237, 0.3)",
			showlegend: false,
		},
	];

	const layout = {
		margin: { t: 5, b: 0, l: 0, r: 0 },
		xaxis: { range: [0, x_axis_range], visible: false },
		yaxis: { range: [-1, null], visible: false },
	};

	Plotly.newPlot("avg-chart", trace, layout, { responsive: true });
	renderAsTxt("avg-practice-txt", Math.floor(min_avg), false, true);
}

// Combined renderer (used in dashboard.js)
export function renderGraphs(dashData) {
	if (dashData.daily) {
		renderDailyMinutes(dashData.daily);
	} else {
		console.error("dashData.daily is undefined");
	}

	if (dashData.cumulative) {
		renderTotalMinutes(dashData.cumulative);
	}

	if (dashData.weekly) {
		renderAvgMinutes(dashData.weekly);
	}
}
