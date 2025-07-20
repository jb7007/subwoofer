// js/logic/dashboard/utils.js

/** Returns true if no logs or empty array */
export const logsNotFound = (logs) => !logs || logs.length === 0;

/** Sum up an array of log objects’ .duration */
export function totalLogMins(logs) {
	return logs.reduce((sum, log) => sum + log.duration, 0);
}

/** Increment a Date by one day (in-place) */
export function setAsTmrw(date) {
	date.setDate(date.getDate() + 1);
}

/** ISO-string “YYYY-MM-DD” for today */
export function getTodayISO() {
	return new Date().toLocaleString("sv-SE").split(" ")[0];
}

/** Total minutes for today’s logs */
export function getDailyGraphVal(logs) {
	return logsNotFound(logs)
		? 0
		: totalLogMins(logs.filter((log) => log.isodate === getTodayISO()));
}
