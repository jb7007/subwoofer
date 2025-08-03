/**
 * Time Formatting Utilities for Practice Tracker
 *
 * This module provides functions to format practice time durations in various
 * formats for display throughout the application. It handles singular/plural
 * forms, different verbosity levels, and special cases like zero values.
 *
 * Key Features:
 * - Convert minutes to human-readable hour/minute format
 * - Handle singular/plural forms correctly
 * - Support different formatting styles (full vs abbreviated)
 * - Handle edge cases (zero time, exact hours, etc.)
 * - Direct DOM element updating with formatted text
 */

/**
 * Render practice time as formatted text in a DOM element.
 *
 * This function converts practice minutes into human-readable format and
 * updates the specified DOM element. It handles various display modes and
 * special cases for better user experience.
 *
 * @param {string} htmlId - ID of the DOM element to update
 * @param {number} minuteTime - Practice time in minutes
 * @param {boolean} numeric - If true, always show "X minutes" format
 * @param {boolean} hasAffix - If true, update parent element for zero values
 *
 * @example
 * renderAsTxt("practice-time", 75);        // "1 hour and 15 minutes"
 * renderAsTxt("practice-time", 45);        // "45 minutes"
 * renderAsTxt("practice-time", 0);         // "Nothing logged yet."
 * renderAsTxt("practice-time", 60);        // "1 hour"
 */
export function renderAsTxt(
	htmlId,
	minuteTime,
	numeric = false,
	hasAffix = false
) {
	const el = document.getElementById(htmlId);
	if (!el) return; // Exit if element doesn't exist

	// Handle zero time cases
	if (minuteTime === 0) {
		if (numeric) {
			// Force numeric display even for zero
			el.innerHTML = `<em>0 minutes</em>`;
		} else {
			// Show "Nothing logged yet" message
			const target = hasAffix ? el.parentElement : el;
			if (target) target.innerHTML = `<em>Nothing logged yet.</em>`;
		}
	} else if (minuteTime < 60) {
		// Less than an hour: show just minutes
		el.innerHTML = `<em>${minuteTime} minute${
			minuteTime === 1 ? "" : "s" // Handle singular/plural
		}</em>`;
	} else {
		// An hour or more: show hours and minutes
		const hours = Math.floor(minuteTime / 60);
		const minutes = minuteTime % 60;
		const hourText = `${hours} hour${hours === 1 ? "" : "s"}`;
		const minuteText =
			minutes > 0 ? ` and ${minutes} minute${minutes === 1 ? "" : "s"}` : "";
		el.innerHTML = `<em>${hourText + minuteText}</em>`;
	}
}

/**
 * Render practice time in abbreviated format.
 *
 * This function provides a shorter format for displaying practice time,
 * useful in compact UI areas or when space is limited.
 *
 * @param {string} htmlId - ID of the DOM element to update
 * @param {number} minuteTime - Practice time in minutes
 *
 * @example
 * renderTxtShort("compact-time", 75);     // "1hr 15min"
 * renderTxtShort("compact-time", 45);     // "45min"
 * renderTxtShort("compact-time", 60);     // "1hr"
 */
export function renderTxtShort(htmlId, minuteTime, parse = false) {
	if (parse) {
		if (minuteTime < 60) {
			// Less than an hour: show abbreviated minutes
			return `${minuteTime} min${minuteTime === 1 ? "" : "s"}</em>`;
		} else {
			// An hour or more: show abbreviated hours and minutes
			const hours = Math.floor(minuteTime / 60);
			const minutes = minuteTime % 60;
			const hourText = `${hours} hr${hours === 1 ? "" : "s"}`; // "1 hr" or "2 hrs"
			const minuteText =
				minutes > 0 ? ` ${minutes} min${minutes === 1 ? "" : "s"}` : ""; // " 15 mins" or ""
			return `<em>${hourText + minuteText}</em>`;
		}
	}

	const el = document.getElementById(htmlId);
	if (!el) return; // Exit if element doesn't exist

	if (minuteTime < 60) {
		// Less than an hour: show abbreviated minutes
		el.innerHTML = `<em>${minuteTime} min${minuteTime === 1 ? "" : "s"}</em>`;
	} else {
		// An hour or more: show abbreviated hours and minutes
		const hours = Math.floor(minuteTime / 60);
		const minutes = minuteTime % 60;
		const hourText = `${hours} hr${hours === 1 ? "" : "s"}`; // "1 hr" or "2 hrs"
		const minuteText =
			minutes > 0 ? ` ${minutes} min${minutes === 1 ? "" : "s"}` : ""; // " 15 mins" or ""
		el.innerHTML = `<em>${hourText + minuteText}</em>`;
	}
}
