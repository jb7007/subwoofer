/**
 * API Helper Utilities for Practice Tracker
 *
 * This module provides centralized utilities for making HTTP requests throughout
 * the application. It standardizes API communication with consistent error handling,
 * response formatting, and logging for debugging purposes.
 *
 * Key Features:
 * - Standardized fetch wrapper with error handling
 * - Consistent response format across all API calls
 * - Automatic JSON parsing and error catching
 * - Debug logging for development and troubleshooting
 */

/**
 * Wrapper function for fetch requests with standardized error handling.
 *
 * This function provides a consistent interface for all API calls in the application.
 * It automatically handles JSON parsing, error catching, and response formatting
 * to ensure all API calls return the same data structure.
 *
 * @param {string} url - The API endpoint URL to fetch from
 * @param {Object} options - Fetch options (method, headers, body, etc.)
 * @param {string} options.method - HTTP method (GET, POST, PUT, DELETE)
 * @param {Object} options.headers - Request headers
 * @param {string|Object} options.body - Request body data
 *
 * @returns {Promise<Object>} Standardized response object:
 *   - ok: Boolean indicating if request was successful
 *   - status: HTTP status code
 *   - data: Parsed JSON response data (null if error)
 *   - error: Error object if request failed
 *
 * @example
 * // GET request
 * const result = await fetchJson('/api/logs');
 * if (result.ok) {
 *   console.log(result.data);
 * }
 *
 * // POST request
 * const result = await fetchJson('/api/logs', {
 *   method: 'POST',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify({ instrument: 'piano', duration: 30 })
 * });
 */
export async function fetchJson(url, options = {}) {
	try {
		// Make the HTTP request
		const response = await fetch(url, options);

		// Parse JSON response (will throw if invalid JSON)
		const data = await response.json();

		// Return standardized response format
		return {
			ok: response.ok, // True if status 200-299
			status: response.status, // HTTP status code
			data, // Parsed JSON data
		};
	} catch (error) {
		// Log error for debugging (could be network error, invalid JSON, etc.)
		console.error("Fetch error:", error);

		// Return standardized error format
		return {
			ok: false,
			status: 500, // Generic server error
			data: null, // No data available
			error, // Original error for debugging
		};
	}
}
