// js/components/graph-display.js

import { renderAsTxt } from "./time-format.js";
import {
	getDailyGraphVal,
	logsNotFound,
	totalLogMins,
	setAsTmrw,
} from "../logic/dashboard/utils.js";

// Renders the user's daily practice gauge
function renderDailyMinutes(logs) {
	const totalToday = getDailyGraphVal(logs);

	const trace = [
		{
			value: totalToday,
			type: "indicator",
			mode: "gauge+number+delta",
			delta: { reference: 60 },
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
	renderAsTxt("daily-practice-txt", totalToday);
}

// Renders the user's total cumulative minutes chart
function renderTotalMinutes(logs) {
	let totalMins = 0,
		xRange = 0;
	const xVals = [],
		yVals = [];

	if (!logsNotFound(logs)) {
		const logsByDate = [...logs].sort(
			(a, b) => new Date(a.isodate) - new Date(b.isodate)
		);
		const [year, month, day] = logsByDate[0].isodate.split("-").map(Number);
		let current = new Date(year, month - 1, day);
		const end = new Date();

		const logMap = new Map();
		for (const log of logs) {
			if (!logMap.has(log.isodate)) logMap.set(log.isodate, []);
			logMap.get(log.isodate).push(log);
		}

		while (current <= end) {
			const dateStr = current.toLocaleString("sv-SE").split(" ")[0];
			const dayLogs = logMap.get(dateStr) || [];
			const dayMins = totalLogMins(dayLogs);

			xVals.push(dateStr);
			yVals.push((totalMins += dayMins));
			xRange++;

			setAsTmrw(current);
		}
	}

	const data = [
		{
			type: "indicator",
			mode: "number+delta",
			title: { text: "Cumulative Total" },
			value: totalMins,
			delta: { reference: totalMins - 10, valueformat: ".0f" },
			axis: { visible: false },
		},
		{
			mode: "lines",
			y: yVals,
			fill: "tozeroy",
			line: { color: "cornflowerblue", width: 2 },
			fillcolor: "rgba(100, 149, 237, 0.3)",
		},
	];

	const layout = {
		margin: { t: 5, b: 0, l: 0, r: 0 },
		xaxis: { range: [0, xRange - 1], visible: false },
		yaxis: { visible: false },
	};

	Plotly.newPlot("total-chart", data, layout, { responsive: true });
	renderAsTxt("total-practice-txt", totalMins);
}

// Renders average minutes and trend line for current week
function renderAvgMinutes(logs) {
	let minAvg = 0,
		yVals = [],
		minAvgArr = [],
		xAxisRange = 1;

	if (logs && logs.length > 0) {
		const totalMin = logs.reduce((sum, log) => sum + log.duration, 0);
		minAvg = totalMin / logs.length;

		const today = new Date();
		const start = new Date(today);
		start.setDate(today.getDate() - today.getDay()); // start of week

		const days = [];
		let current = new Date(start);
		while (current <= today) {
			days.push(current.toLocaleString("sv-SE").split(" ")[0]);
			current.setDate(current.getDate() + 1);
		}

		yVals = days.map((d) => {
			const dayLogs = logs.filter((log) => log.isodate === d);
			return dayLogs.reduce((sum, log) => sum + log.duration, 0);
		});

		minAvgArr = new Array(days.length).fill(minAvg);
		xAxisRange = days.length - 1;
	}

	const trace = [
		{
			type: "indicator",
			mode: "number+delta",
			title: { text: "Total Average" },
			value: Math.floor(minAvg),
			delta: { reference: minAvg - 25, valueformat: ".0f" },
			axis: { visible: false },
			showlegend: false,
		},
		{
			mode: "lines+markers",
			y: yVals,
			showlegend: false,
			line: { color: "rgb(38, 56, 91)", width: 2 },
		},
		{
			mode: "lines",
			y: minAvgArr,
			fill: "tozeroy",
			line: { color: "cornflowerblue", width: 2 },
			fillcolor: "rgba(100, 149, 237, 0.3)",
			showlegend: false,
		},
	];

	const layout = {
		margin: { t: 5, b: 0, l: 0, r: 0 },
		xaxis: { range: [0, xAxisRange], visible: false },
		yaxis: { range: [-1, null], visible: false },
	};

	Plotly.newPlot("avg-chart", trace, layout, { responsive: true });
	renderAsTxt("avg-practice-txt", Math.floor(minAvg), false, true);
}

// Combined renderer (used in dashboard.js)
export function renderGraphs(logs) {
	renderDailyMinutes(logs);
	renderTotalMinutes(logs);
	renderAvgMinutes(logs);
}
