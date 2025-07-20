// js/components/dash-metrics.js

export function setMetricText(metrics = {}) {
	for (const [id, value] of Object.entries(metrics)) {
		const el = document.getElementById(id);
		if (el) el.textContent = value;
	}
}
