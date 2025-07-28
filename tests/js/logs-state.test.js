/**
 * Logs State Management Tests
 *
 * Tests the simple state management functions for storing and retrieving
 * the current logs array in the application.
 */

import { getLogs, setLogs } from "../../static/js/state/logs.js";

describe("Logs State Management", () => {
	describe("getLogs and setLogs", () => {
		test("returns empty array initially", () => {
			const logs = getLogs();
			expect(logs).toEqual([]);
		});

		test("stores and retrieves logs array", () => {
			const testLogs = [
				{
					id: 1,
					instrument: "piano",
					duration: 45,
					piece: "Moonlight Sonata",
				},
				{
					id: 2,
					instrument: "guitar",
					duration: 30,
					piece: "Classical Gas",
				},
			];

			setLogs(testLogs);
			const retrievedLogs = getLogs();

			expect(retrievedLogs).toEqual(testLogs);
			expect(retrievedLogs).toHaveLength(2);
		});

		test("overwrites previous logs when setting new ones", () => {
			const firstLogs = [{ id: 1, piece: "First" }];
			const secondLogs = [{ id: 2, piece: "Second" }];

			setLogs(firstLogs);
			expect(getLogs()).toEqual(firstLogs);

			setLogs(secondLogs);
			expect(getLogs()).toEqual(secondLogs);
			expect(getLogs()).not.toEqual(firstLogs);
		});

		test("handles empty array", () => {
			setLogs([{ id: 1, piece: "Test" }]);
			expect(getLogs()).toHaveLength(1);

			setLogs([]);
			expect(getLogs()).toEqual([]);
		});

		test("handles null input gracefully", () => {
			setLogs(null);
			const result = getLogs();
			expect(result).toBeNull();
		});

		test("handles undefined input gracefully", () => {
			setLogs(undefined);
			const result = getLogs();
			expect(result).toBeUndefined();
		});

		test("maintains reference to the same array", () => {
			const testLogs = [{ id: 1, piece: "Test" }];
			setLogs(testLogs);

			const retrieved = getLogs();
			expect(retrieved).toBe(testLogs); // Same reference
		});

		test("handles complex log objects", () => {
			const complexLogs = [
				{
					id: 1,
					utc_timestamp: "2025-01-23T15:30:00Z",
					local_date: "2025-01-23",
					duration: 45,
					instrument: "piano",
					piece: "Moonlight Sonata",
					composer: "Beethoven",
					notes: "Great practice session with dynamics work",
				},
			];

			setLogs(complexLogs);
			const result = getLogs();

			expect(result).toEqual(complexLogs);
			expect(result[0].notes).toBe("Great practice session with dynamics work");
		});

		test("handles large arrays", () => {
			const largeLogs = Array.from({ length: 1000 }, (_, i) => ({
				id: i + 1,
				piece: `Piece ${i + 1}`,
				duration: Math.floor(Math.random() * 60) + 15,
			}));

			setLogs(largeLogs);
			const result = getLogs();

			expect(result).toHaveLength(1000);
			expect(result[0].id).toBe(1);
			expect(result[999].id).toBe(1000);
		});

		test("state persists across multiple gets", () => {
			const testLogs = [{ id: 1, piece: "Persistent" }];
			setLogs(testLogs);

			const first = getLogs();
			const second = getLogs();
			const third = getLogs();

			expect(first).toEqual(testLogs);
			expect(second).toEqual(testLogs);
			expect(third).toEqual(testLogs);
		});
	});
});
