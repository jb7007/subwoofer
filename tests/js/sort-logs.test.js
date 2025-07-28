/**
 * Sort Logs Function Tests
 *
 * Tests the sortLogs function that handles sorting log arrays by different
 * fields with ascending/descending order support.
 */

import { sortLogs } from "../../static/js/logic/logs/logs.js";

describe("Sort Logs Function", () => {
	describe("sortLogs", () => {
		const mockLogs = [
			{
				id: 1,
				date: "2025-01-20",
				duration: 45,
				instrument: "piano",
				piece: "Moonlight Sonata",
				composer: "Beethoven",
			},
			{
				id: 2,
				date: "2025-01-22",
				duration: 30,
				instrument: "guitar",
				piece: "Classical Gas",
				composer: "Williams",
			},
			{
				id: 3,
				date: "2025-01-21",
				duration: 60,
				instrument: "violin",
				piece: "Canon in D",
				composer: "Pachelbel",
			},
		];

		test("sorts by duration ascending (default)", () => {
			const result = sortLogs(mockLogs, "duration");

			expect(result).toHaveLength(3);
			expect(result[0].duration).toBe(30);
			expect(result[1].duration).toBe(45);
			expect(result[2].duration).toBe(60);
		});

		test("sorts by duration descending", () => {
			const result = sortLogs(mockLogs, "duration", false);

			expect(result).toHaveLength(3);
			expect(result[0].duration).toBe(60);
			expect(result[1].duration).toBe(45);
			expect(result[2].duration).toBe(30);
		});

		test("sorts by date ascending with proper date conversion", () => {
			const result = sortLogs(mockLogs, "date");

			expect(result).toHaveLength(3);
			expect(result[0].date).toBe("2025-01-20");
			expect(result[1].date).toBe("2025-01-21");
			expect(result[2].date).toBe("2025-01-22");
		});

		test("sorts by date descending with proper date conversion", () => {
			const result = sortLogs(mockLogs, "date", false);

			expect(result).toHaveLength(3);
			expect(result[0].date).toBe("2025-01-22");
			expect(result[1].date).toBe("2025-01-21");
			expect(result[2].date).toBe("2025-01-20");
		});

		test("sorts by string field (instrument) ascending", () => {
			const result = sortLogs(mockLogs, "instrument");

			expect(result).toHaveLength(3);
			expect(result[0].instrument).toBe("guitar");
			expect(result[1].instrument).toBe("piano");
			expect(result[2].instrument).toBe("violin");
		});

		test("sorts by string field (composer) descending", () => {
			const result = sortLogs(mockLogs, "composer", false);

			expect(result).toHaveLength(3);
			expect(result[0].composer).toBe("Williams");
			expect(result[1].composer).toBe("Pachelbel");
			expect(result[2].composer).toBe("Beethoven");
		});

		test("sorts by id field ascending", () => {
			const result = sortLogs(mockLogs, "id");

			expect(result).toHaveLength(3);
			expect(result[0].id).toBe(1);
			expect(result[1].id).toBe(2);
			expect(result[2].id).toBe(3);
		});

		test("returns new array without mutating original", () => {
			const originalOrder = mockLogs.map((log) => log.id);
			const result = sortLogs(mockLogs, "duration");

			// Original array should be unchanged
			expect(mockLogs.map((log) => log.id)).toEqual(originalOrder);

			// Result should be different
			expect(result.map((log) => log.id)).not.toEqual(originalOrder);
		});

		test("handles empty array", () => {
			const result = sortLogs([], "duration");

			expect(result).toEqual([]);
		});

		test("handles single item array", () => {
			const singleLog = [mockLogs[0]];
			const result = sortLogs(singleLog, "duration");

			expect(result).toHaveLength(1);
			expect(result[0]).toEqual(mockLogs[0]);
		});

		test("handles logs with identical values", () => {
			const identicalLogs = [
				{ id: 1, duration: 30, piece: "A" },
				{ id: 2, duration: 30, piece: "B" },
				{ id: 3, duration: 30, piece: "C" },
			];

			const result = sortLogs(identicalLogs, "duration");

			expect(result).toHaveLength(3);
			// Order should be preserved for identical values
			expect(result.map((log) => log.id)).toEqual([1, 2, 3]);
		});

		test("handles complex date strings", () => {
			const complexDateLogs = [
				{ id: 1, date: "2025-01-20T15:30:00Z" },
				{ id: 2, date: "2025-01-20T10:15:00Z" },
				{ id: 3, date: "2025-01-21T09:00:00Z" },
			];

			const result = sortLogs(complexDateLogs, "date");

			expect(result[0].id).toBe(2); // Earliest time
			expect(result[1].id).toBe(1); // Later same day
			expect(result[2].id).toBe(3); // Next day
		});

		test("handles missing field gracefully", () => {
			const logsWithMissing = [
				{ id: 1, duration: 30 },
				{ id: 2 }, // Missing duration
				{ id: 3, duration: 45 },
			];

			const result = sortLogs(logsWithMissing, "duration");

			expect(result).toHaveLength(3);
			// Check that it sorted - undefined values get sorted based on JS comparison
			const durations = result.map((log) => log.duration);
			expect(durations).toEqual([30, undefined, 45]);
		});

		test("handles non-existent field", () => {
			const result = sortLogs(mockLogs, "nonExistentField");

			expect(result).toHaveLength(3);
			// Should return array in original order since all values are undefined
			expect(result.map((log) => log.id)).toEqual([1, 2, 3]);
		});
	});
});
