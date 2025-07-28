/**
 * API Helper Tests
 *
 * Tests the centralized API utilities that handle HTTP requests throughout
 * the application, including error handling and response formatting.
 */

import { fetchJson } from "../../static/js/api/api-helper.js";

describe("API Helper", () => {
	describe("fetchJson", () => {
		test("handles successful GET request", async () => {
			const mockData = { logs: [], total: 0 };
			mockFetchSuccess(mockData);

			const result = await fetchJson("/api/logs");

			expect(fetch).toHaveBeenCalledWith("/api/logs", {});
			expect(result.ok).toBe(true);
			expect(result.status).toBe(200);
			expect(result.data).toEqual(mockData);
			expect(result.error).toBeUndefined();
		});

		test("handles successful POST request", async () => {
			const requestData = { instrument: "piano", duration: 30 };
			const responseData = { success: true, id: 123 };
			mockFetchSuccess(responseData);

			const result = await fetchJson("/api/logs", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(requestData),
			});

			expect(fetch).toHaveBeenCalledWith("/api/logs", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(requestData),
			});
			expect(result.ok).toBe(true);
			expect(result.status).toBe(200);
			expect(result.data).toEqual(responseData);
		});

		test("handles HTTP error responses", async () => {
			const errorData = { error: "validation_failed", message: "Invalid data" };
			mockFetchError(400, errorData);

			const result = await fetchJson("/api/logs", {
				method: "POST",
				body: JSON.stringify({ invalid: "data" }),
			});

			expect(result.ok).toBe(false);
			expect(result.status).toBe(400);
			expect(result.data).toEqual(errorData);
			expect(result.error).toBeUndefined();
		});

		test("handles server error responses", async () => {
			const errorData = { error: "internal_server_error" };
			mockFetchError(500, errorData);

			const result = await fetchJson("/api/logs");

			expect(result.ok).toBe(false);
			expect(result.status).toBe(500);
			expect(result.data).toEqual(errorData);
		});

		test("handles network errors", async () => {
			mockFetchNetworkError("Failed to fetch");

			const result = await fetchJson("/api/logs");

			expect(result.ok).toBe(false);
			expect(result.status).toBe(500);
			expect(result.data).toBe(null);
			expect(result.error).toBeInstanceOf(Error);
			expect(result.error.message).toBe("Failed to fetch");
		});

		test("handles invalid JSON responses", async () => {
			fetch.mockResolvedValueOnce({
				ok: true,
				status: 200,
				json: async () => {
					throw new SyntaxError("Unexpected token");
				},
			});

			const result = await fetchJson("/api/logs");

			expect(result.ok).toBe(false);
			expect(result.status).toBe(500);
			expect(result.data).toBe(null);
			expect(result.error).toBeInstanceOf(SyntaxError);
		});

		test("handles different HTTP methods", async () => {
			const mockData = { success: true };

			// Test PUT
			mockFetchSuccess(mockData);
			await fetchJson("/api/logs/1", { method: "PUT" });
			expect(fetch).toHaveBeenLastCalledWith("/api/logs/1", { method: "PUT" });

			// Test DELETE
			mockFetchSuccess(mockData);
			await fetchJson("/api/logs/1", { method: "DELETE" });
			expect(fetch).toHaveBeenLastCalledWith("/api/logs/1", {
				method: "DELETE",
			});

			// Test PATCH
			mockFetchSuccess(mockData);
			await fetchJson("/api/logs/1", { method: "PATCH" });
			expect(fetch).toHaveBeenLastCalledWith("/api/logs/1", {
				method: "PATCH",
			});
		});

		test("handles custom headers", async () => {
			const mockData = { success: true };
			mockFetchSuccess(mockData);

			const customHeaders = {
				Authorization: "Bearer token123",
				"X-Custom-Header": "custom-value",
			};

			await fetchJson("/api/logs", {
				headers: customHeaders,
			});

			expect(fetch).toHaveBeenCalledWith("/api/logs", {
				headers: customHeaders,
			});
		});

		test("logs errors to console", async () => {
			const consoleSpy = jest.spyOn(console, "error").mockImplementation();
			mockFetchNetworkError("Network error");

			await fetchJson("/api/logs");

			expect(consoleSpy).toHaveBeenCalledWith(
				"Fetch error:",
				expect.any(Error)
			);
			consoleSpy.mockRestore();
		});

		test("handles empty response body", async () => {
			fetch.mockResolvedValueOnce({
				ok: true,
				status: 204, // No Content
				json: async () => null,
			});

			const result = await fetchJson("/api/logs/1", { method: "DELETE" });

			expect(result.ok).toBe(true);
			expect(result.status).toBe(204);
			expect(result.data).toBe(null);
		});

		test("passes through all fetch options", async () => {
			const mockData = { success: true };
			mockFetchSuccess(mockData);

			const options = {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: '{"test": "data"}',
				credentials: "include",
				cache: "no-cache",
			};

			await fetchJson("/api/test", options);

			expect(fetch).toHaveBeenCalledWith("/api/test", options);
		});
	});

	describe("Error Handling Edge Cases", () => {
		test("handles fetch throwing synchronous error", async () => {
			fetch.mockImplementationOnce(() => {
				throw new Error("Immediate error");
			});

			const result = await fetchJson("/api/logs");

			expect(result.ok).toBe(false);
			expect(result.status).toBe(500);
			expect(result.data).toBe(null);
			expect(result.error.message).toBe("Immediate error");
		});

		test("handles response.json() throwing error", async () => {
			fetch.mockResolvedValueOnce({
				ok: true,
				status: 200,
				json: async () => {
					throw new Error("JSON parse error");
				},
			});

			const result = await fetchJson("/api/logs");

			expect(result.ok).toBe(false);
			expect(result.error.message).toBe("JSON parse error");
		});

		test("handles undefined and null URLs", async () => {
			mockFetchSuccess({});

			await fetchJson(undefined);
			expect(fetch).toHaveBeenCalledWith(undefined, {});

			await fetchJson(null);
			expect(fetch).toHaveBeenCalledWith(null, {});
		});
	});
});
