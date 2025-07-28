/**
 * renderRecentLogs Function Tests
 *
 * Tests the renderRecentLogs function that takes log entries and renders
 * them grouped by date in a hierarchical DOM structure.
 */

import { renderRecentLogs } from "../../static/js/components/recent-logs.js";
import { instrumentMap } from "../../static/js/utils/index.js";
import { renderTxtShort } from "../../static/js/components/time-format.js";

// Mock the dependencies
jest.mock("../../static/js/utils/index.js");
jest.mock("../../static/js/components/time-format.js");

describe("renderRecentLogs", () => {
	let container;

	beforeEach(() => {
		// Create a mock container element
		container = document.createElement("ul");
		container.id = "recent-logs";
		document.body.appendChild(container);

		// Mock instrumentMap
		instrumentMap.piano = "Piano";
		instrumentMap.guitar = "Guitar";
		instrumentMap.violin = "Violin";

		// Clear mocks
		jest.clearAllMocks();
	});

	afterEach(() => {
		document.body.innerHTML = "";
		jest.clearAllMocks();
	});

	describe("Basic Functionality", () => {
		test("renders logs grouped by date", () => {
			const logs = [
				{
					id: 1,
					local_date: "2025-01-23",
					duration: 45,
					instrument: "piano",
					piece: "Moonlight Sonata",
					composer: "Beethoven",
				},
				{
					id: 2,
					local_date: "2025-01-23",
					duration: 30,
					instrument: "guitar",
					piece: "Classical Gas",
					composer: "Williams",
				},
				{
					id: 3,
					local_date: "2025-01-22",
					duration: 60,
					instrument: "violin",
					piece: "Canon in D",
					composer: "Pachelbel",
				},
			];

			renderRecentLogs(logs);

			// Should have 2 date headings
			const dateHeadings = container.querySelectorAll(".log-date-heading");
			expect(dateHeadings).toHaveLength(2);

			// Should have 2 date groups
			const dateGroups = container.querySelectorAll(".log-date-group");
			expect(dateGroups).toHaveLength(2);

			// Check date heading content
			expect(dateHeadings[0].innerHTML).toBe("<strong>2025-01-23</strong>");
			expect(dateHeadings[1].innerHTML).toBe("<strong>2025-01-22</strong>");

			// Should have 3 log items total
			const logItems = container.querySelectorAll(".recent-log-item");
			expect(logItems).toHaveLength(3);
		});

		test("calls renderTxtShort for each log", () => {
			const logs = [
				{
					id: 1,
					local_date: "2025-01-23",
					duration: 45,
					instrument: "piano",
					piece: "Test Piece",
					composer: "Test Composer",
				},
			];

			renderRecentLogs(logs);

			expect(renderTxtShort).toHaveBeenCalledTimes(1);
			expect(renderTxtShort).toHaveBeenCalledWith("0durationIs45", 45);
		});

		test("uses instrumentMap for instrument display", () => {
			const logs = [
				{
					id: 1,
					local_date: "2025-01-23",
					duration: 30,
					instrument: "piano",
					piece: "Test Piece",
					composer: "Test Composer",
				},
			];

			renderRecentLogs(logs);

			const logItem = container.querySelector(".recent-log-item");
			expect(logItem.innerHTML).toContain("Piano –");
		});
	});

	describe("Container Handling", () => {
		test("returns early if container doesn't exist", () => {
			// Remove the container
			container.remove();

			const logs = [
				{ id: 1, local_date: "2025-01-23", duration: 30, instrument: "piano" },
			];

			// Should not throw
			expect(() => renderRecentLogs(logs)).not.toThrow();
			expect(renderTxtShort).not.toHaveBeenCalled();
		});

		test("clears existing content", () => {
			// Add some existing content
			container.innerHTML = "<li>Existing content</li>";

			const logs = [
				{
					id: 1,
					local_date: "2025-01-23",
					duration: 30,
					instrument: "piano",
					piece: "Test",
					composer: "Test",
				},
			];

			renderRecentLogs(logs);

			// Should not contain the existing content
			expect(container.innerHTML).not.toContain("Existing content");
		});
	});

	describe("Data Handling", () => {
		test("handles empty logs array", () => {
			renderRecentLogs([]);

			expect(container.innerHTML).toBe("");
			expect(renderTxtShort).not.toHaveBeenCalled();
		});

		test("handles logs with missing optional fields", () => {
			const logs = [
				{
					id: 1,
					local_date: "2025-01-23",
					duration: 30,
					instrument: "piano",
					// Missing piece and composer
				},
			];

			renderRecentLogs(logs);

			const logItem = container.querySelector(".recent-log-item");
			expect(logItem.innerHTML).toContain("N/A by Unknown");
		});

		test("handles null/undefined piece and composer", () => {
			const logs = [
				{
					id: 1,
					local_date: "2025-01-23",
					duration: 30,
					instrument: "piano",
					piece: null,
					composer: undefined,
				},
			];

			renderRecentLogs(logs);

			const logItem = container.querySelector(".recent-log-item");
			expect(logItem.innerHTML).toContain("N/A by Unknown");
		});

		test("handles unmapped instruments", () => {
			const logs = [
				{
					id: 1,
					local_date: "2025-01-23",
					duration: 30,
					instrument: "banjo", // Not in instrumentMap
					piece: "Test",
					composer: "Test",
				},
			];

			renderRecentLogs(logs);

			const logItem = container.querySelector(".recent-log-item");
			expect(logItem.innerHTML).toContain("banjo –");
		});
	});

	describe("Date Grouping", () => {
		test("groups multiple logs by same date", () => {
			const logs = [
				{
					id: 1,
					local_date: "2025-01-23",
					duration: 30,
					instrument: "piano",
					piece: "Piece 1",
					composer: "Composer 1",
				},
				{
					id: 2,
					local_date: "2025-01-23",
					duration: 45,
					instrument: "guitar",
					piece: "Piece 2",
					composer: "Composer 2",
				},
			];

			renderRecentLogs(logs);

			const dateHeadings = container.querySelectorAll(".log-date-heading");
			const dateGroups = container.querySelectorAll(".log-date-group");
			const logItems = container.querySelectorAll(".recent-log-item");

			expect(dateHeadings).toHaveLength(1);
			expect(dateGroups).toHaveLength(1);
			expect(logItems).toHaveLength(2);

			// Both items should be in the same date group
			const firstGroup = dateGroups[0];
			expect(firstGroup.querySelectorAll(".recent-log-item")).toHaveLength(2);
		});

		test("creates separate groups for different dates", () => {
			const logs = [
				{
					id: 1,
					local_date: "2025-01-23",
					duration: 30,
					instrument: "piano",
					piece: "Piece 1",
					composer: "Composer 1",
				},
				{
					id: 2,
					local_date: "2025-01-24",
					duration: 45,
					instrument: "guitar",
					piece: "Piece 2",
					composer: "Composer 2",
				},
			];

			renderRecentLogs(logs);

			const dateHeadings = container.querySelectorAll(".log-date-heading");
			const dateGroups = container.querySelectorAll(".log-date-group");

			expect(dateHeadings).toHaveLength(2);
			expect(dateGroups).toHaveLength(2);

			// Each group should have one item
			expect(dateGroups[0].querySelectorAll(".recent-log-item")).toHaveLength(
				1
			);
			expect(dateGroups[1].querySelectorAll(".recent-log-item")).toHaveLength(
				1
			);
		});
	});

	describe("DOM Structure", () => {
		test("creates correct DOM hierarchy", () => {
			const logs = [
				{
					id: 1,
					local_date: "2025-01-23",
					duration: 30,
					instrument: "piano",
					piece: "Test Piece",
					composer: "Test Composer",
				},
			];

			renderRecentLogs(logs);

			// Check the structure: container > dateHeading + dateGroup
			const children = Array.from(container.children);
			expect(children).toHaveLength(2);

			const dateHeading = children[0];
			const dateGroup = children[1];

			expect(dateHeading.tagName).toBe("LI");
			expect(dateHeading.className).toBe("log-date-heading");

			expect(dateGroup.tagName).toBe("UL");
			expect(dateGroup.className).toBe("log-date-group");

			// Check log item inside date group
			const logItem = dateGroup.querySelector(".recent-log-item");
			expect(logItem.tagName).toBe("LI");
			expect(logItem.className).toBe("recent-log-item");
		});

		test("generates unique IDs for duration elements", () => {
			const logs = [
				{
					id: 1,
					local_date: "2025-01-23",
					duration: 30,
					instrument: "piano",
					piece: "Piece 1",
					composer: "Composer 1",
				},
				{
					id: 2,
					local_date: "2025-01-23",
					duration: 45,
					instrument: "guitar",
					piece: "Piece 2",
					composer: "Composer 2",
				},
			];

			renderRecentLogs(logs);

			const durationSpans = container.querySelectorAll(".log-duration");
			expect(durationSpans).toHaveLength(2);

			expect(durationSpans[0].id).toBe("0durationIs30");
			expect(durationSpans[1].id).toBe("1durationIs45");
		});
	});

	describe("Content Formatting", () => {
		test("formats log content correctly", () => {
			const logs = [
				{
					id: 1,
					local_date: "2025-01-23",
					duration: 45,
					instrument: "piano",
					piece: "Moonlight Sonata",
					composer: "Beethoven",
				},
			];

			renderRecentLogs(logs);

			const logItem = container.querySelector(".recent-log-item");
			const content = logItem.innerHTML;

			expect(content).toContain("Piano –");
			expect(content).toContain("<em>Moonlight Sonata by Beethoven");
			expect(content).toContain(
				'<span class="log-duration" id="0durationIs45">Loading...</span>'
			);
		});

		test("handles special characters in piece and composer names", () => {
			const logs = [
				{
					id: 1,
					local_date: "2025-01-23",
					duration: 30,
					instrument: "piano",
					piece: "Für Elise",
					composer: "Beethoven & Co.",
				},
			];

			renderRecentLogs(logs);

			const logItem = container.querySelector(".recent-log-item");
			expect(logItem.innerHTML).toContain("Für Elise by Beethoven &amp; Co.");
		});
	});

	describe("Edge Cases", () => {
		test("handles very large number of logs", () => {
			const logs = Array.from({ length: 100 }, (_, i) => ({
				id: i + 1,
				local_date: `2025-01-${(i % 31) + 1}`.padStart(10, "0"),
				duration: (i % 120) + 1,
				instrument: ["piano", "guitar", "violin"][i % 3],
				piece: `Piece ${i + 1}`,
				composer: `Composer ${i + 1}`,
			}));

			expect(() => renderRecentLogs(logs)).not.toThrow();
			expect(renderTxtShort).toHaveBeenCalledTimes(100);
		});

		test("handles logs with same date but different order", () => {
			const logs = [
				{
					id: 3,
					local_date: "2025-01-22",
					duration: 60,
					instrument: "violin",
					piece: "Canon",
					composer: "Pachelbel",
				},
				{
					id: 1,
					local_date: "2025-01-23",
					duration: 30,
					instrument: "piano",
					piece: "Sonata",
					composer: "Mozart",
				},
				{
					id: 2,
					local_date: "2025-01-22",
					duration: 45,
					instrument: "guitar",
					piece: "Study",
					composer: "Sor",
				},
			];

			renderRecentLogs(logs);

			const dateHeadings = container.querySelectorAll(".log-date-heading");
			expect(dateHeadings).toHaveLength(2);

			// Should group 2025-01-22 logs together
			const firstDateGroup = container.querySelectorAll(".log-date-group")[0];
			const firstGroupItems =
				firstDateGroup.querySelectorAll(".recent-log-item");
			expect(firstGroupItems).toHaveLength(2);
		});

		test("handles zero duration", () => {
			const logs = [
				{
					id: 1,
					local_date: "2025-01-23",
					duration: 0,
					instrument: "piano",
					piece: "Quick Practice",
					composer: "Me",
				},
			];

			renderRecentLogs(logs);

			expect(renderTxtShort).toHaveBeenCalledWith("0durationIs0", 0);
		});
	});
});
