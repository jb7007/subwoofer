/**
 * Logs API Tests
 *
 * Tests the log-related API functions that handle practice log submission
 * and retrieval throughout the application.
 */

import {
	submitLog,
	fetchLogs,
	recentLogs,
	fetchPieces,
} from "../../static/js/api/logs.js";
import * as apiHelper from "../../static/js/api/api-helper.js";

// Mock the API helper module
jest.mock("../../static/js/api/api-helper.js");

describe("Logs API", () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe("submitLog", () => {
		test("calls fetchJson with correct parameters for log submission", async () => {
			const logData = {
				utc_timestamp: "2025-01-23T15:30:00",
				instrument: "piano",
				duration: 45,
				piece: "Moonlight Sonata",
				composer: "Beethoven",
				notes: "Great practice session",
			};

			const mockResponse = { ok: true, status: 201, data: { id: 123 } };
			apiHelper.fetchJson.mockResolvedValue(mockResponse);

			const result = await submitLog(logData);

			expect(apiHelper.fetchJson).toHaveBeenCalledWith("/api/logs", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(logData),
			});
			expect(result).toEqual(mockResponse);
		});

		test("handles log submission with minimal data", async () => {
			const logData = {
				utc_timestamp: "2025-01-23T15:30:00",
				instrument: "guitar",
				duration: 30,
			};

			const mockResponse = { ok: true, status: 201, data: { id: 124 } };
			apiHelper.fetchJson.mockResolvedValue(mockResponse);

			const result = await submitLog(logData);

			expect(apiHelper.fetchJson).toHaveBeenCalledWith("/api/logs", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(logData),
			});
			expect(result).toEqual(mockResponse);
		});

		test("handles log submission errors", async () => {
			const logData = {
				utc_timestamp: "invalid-date",
				instrument: "piano",
				duration: -5, // Invalid duration
			};

			const mockResponse = {
				ok: false,
				status: 400,
				data: {
					error: "validation_failed",
					message: "Invalid timestamp format",
				},
			};
			apiHelper.fetchJson.mockResolvedValue(mockResponse);

			const result = await submitLog(logData);

			expect(apiHelper.fetchJson).toHaveBeenCalledWith("/api/logs", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(logData),
			});
			expect(result).toEqual(mockResponse);
		});

		test("handles empty log data", async () => {
			const logData = {};

			const mockResponse = {
				ok: false,
				status: 400,
				data: {
					error: "validation_failed",
					message: "Missing required fields",
				},
			};
			apiHelper.fetchJson.mockResolvedValue(mockResponse);

			const result = await submitLog(logData);

			expect(apiHelper.fetchJson).toHaveBeenCalledWith("/api/logs", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(logData),
			});
			expect(result).toEqual(mockResponse);
		});

		test("handles network errors during submission", async () => {
			const logData = {
				utc_timestamp: "2025-01-23T15:30:00",
				instrument: "violin",
				duration: 60,
			};

			const mockResponse = {
				ok: false,
				status: 500,
				data: null,
				error: new Error("Network error"),
			};
			apiHelper.fetchJson.mockResolvedValue(mockResponse);

			const result = await submitLog(logData);

			expect(result).toEqual(mockResponse);
		});
	});

	describe("fetchLogs", () => {
		test("calls fetchJson with correct endpoint for fetching logs", async () => {
			const mockLogs = [
				{
					id: 1,
					utc_timestamp: "2025-01-23T15:30:00",
					instrument: "piano",
					duration: 45,
					piece: "Moonlight Sonata",
				},
				{
					id: 2,
					utc_timestamp: "2025-01-22T10:15:00",
					instrument: "guitar",
					duration: 30,
					piece: "Classical Gas",
				},
			];

			const mockResponse = { ok: true, status: 200, data: mockLogs };
			apiHelper.fetchJson.mockResolvedValue(mockResponse);

			const result = await fetchLogs();

			expect(apiHelper.fetchJson).toHaveBeenCalledWith("/api/logs");
			expect(result).toEqual(mockResponse);
		});

		test("handles empty logs response", async () => {
			const mockResponse = { ok: true, status: 200, data: [] };
			apiHelper.fetchJson.mockResolvedValue(mockResponse);

			const result = await fetchLogs();

			expect(apiHelper.fetchJson).toHaveBeenCalledWith("/api/logs");
			expect(result).toEqual(mockResponse);
		});

		test("handles fetch logs error", async () => {
			const mockResponse = {
				ok: false,
				status: 401,
				data: { error: "unauthorized" },
			};
			apiHelper.fetchJson.mockResolvedValue(mockResponse);

			const result = await fetchLogs();

			expect(result).toEqual(mockResponse);
		});
	});

	describe("recentLogs", () => {
		test("calls fetchJson with correct endpoint for recent logs", async () => {
			const mockRecentLogs = [
				{
					id: 5,
					utc_timestamp: "2025-01-23T15:30:00",
					instrument: "piano",
					duration: 45,
				},
			];

			const mockResponse = { ok: true, status: 200, data: mockRecentLogs };
			apiHelper.fetchJson.mockResolvedValue(mockResponse);

			const result = await recentLogs();

			expect(apiHelper.fetchJson).toHaveBeenCalledWith("/api/recent-logs");
			expect(result).toEqual(mockResponse);
		});

		test("handles empty recent logs", async () => {
			const mockResponse = { ok: true, status: 200, data: [] };
			apiHelper.fetchJson.mockResolvedValue(mockResponse);

			const result = await recentLogs();

			expect(result).toEqual(mockResponse);
		});

		test("handles recent logs fetch error", async () => {
			const mockResponse = {
				ok: false,
				status: 500,
				data: { error: "server_error" },
			};
			apiHelper.fetchJson.mockResolvedValue(mockResponse);

			const result = await recentLogs();

			expect(result).toEqual(mockResponse);
		});
	});

	describe("fetchPieces", () => {
		test("calls fetchJson with correct endpoint for pieces stats", async () => {
			const mockPieces = [
				{
					title: "Moonlight Sonata",
					composer: "Beethoven",
					total_time: 180,
					log_count: 4,
				},
				{
					title: "Classical Gas",
					composer: "Williams",
					total_time: 90,
					log_count: 2,
				},
			];

			const mockResponse = { ok: true, status: 200, data: mockPieces };
			apiHelper.fetchJson.mockResolvedValue(mockResponse);

			const result = await fetchPieces();

			expect(apiHelper.fetchJson).toHaveBeenCalledWith("/api/stats/pieces");
			expect(result).toEqual(mockResponse);
		});

		test("handles empty pieces response", async () => {
			const mockResponse = { ok: true, status: 200, data: [] };
			apiHelper.fetchJson.mockResolvedValue(mockResponse);

			const result = await fetchPieces();

			expect(result).toEqual(mockResponse);
		});

		test("handles fetch pieces error", async () => {
			const mockResponse = {
				ok: false,
				status: 403,
				data: { error: "forbidden" },
			};
			apiHelper.fetchJson.mockResolvedValue(mockResponse);

			const result = await fetchPieces();

			expect(result).toEqual(mockResponse);
		});
	});

	describe("Integration Tests", () => {
		test("all functions return promises", () => {
			const logData = { instrument: "piano", duration: 30 };

			apiHelper.fetchJson.mockResolvedValue({ ok: true, data: {} });

			expect(submitLog(logData)).toBeInstanceOf(Promise);
			expect(fetchLogs()).toBeInstanceOf(Promise);
			expect(recentLogs()).toBeInstanceOf(Promise);
			expect(fetchPieces()).toBeInstanceOf(Promise);
		});

		test("functions handle concurrent calls", async () => {
			apiHelper.fetchJson.mockResolvedValue({ ok: true, data: [] });

			const promises = [
				fetchLogs(),
				recentLogs(),
				fetchPieces(),
				submitLog({ instrument: "piano", duration: 30 }),
			];

			const results = await Promise.all(promises);

			expect(results).toHaveLength(4);
			expect(apiHelper.fetchJson).toHaveBeenCalledTimes(4);
		});
	});
});
