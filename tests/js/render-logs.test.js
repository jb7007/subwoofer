/**
 * renderLogs Function Tests
 *
 * Tests the renderLogs function that renders log entries in a
 * table format with columns for all log details.
 */

import { renderLogs } from "../../static/js/components/log-table.js";
import { instrumentMap } from "../../static/js/utils/index.js";

// Mock the dependencies
jest.mock("../../static/js/utils/index.js", () => ({
	instrumentMap: {
		piano: "Piano",
		guitar: "Guitar",
		violin: "Violin",
	},
}));

// Mock console.log to avoid test output noise
const originalConsoleLog = console.log;
beforeAll(() => {
	console.log = jest.fn();
});

afterAll(() => {
	console.log = originalConsoleLog;
});

describe("renderLogs", () => {
	let tableBody;

	beforeEach(() => {
		// Create a mock table body element
		tableBody = document.createElement("tbody");
		tableBody.id = "log-table-body";
		document.body.appendChild(tableBody);

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
		test("renders logs as table rows", () => {
			const logs = [
				{
					id: 1,
					local_date: "2025-01-23",
					duration: 45,
					instrument: "piano",
					piece: "Moonlight Sonata",
					composer: "Beethoven",
					notes: "Great practice session",
				},
				{
					id: 2,
					local_date: "2025-01-22",
					duration: 30,
					instrument: "guitar",
					piece: "Classical Gas",
					composer: "Williams",
					notes: "Worked on fingerpicking",
				},
			];

			renderLogs(logs);

			const rows = tableBody.querySelectorAll("tr");
			expect(rows).toHaveLength(2);
		});

		test("renders correct number of columns for each row", () => {
			const logs = [
				{
					id: 1,
					local_date: "2025-01-23",
					duration: 45,
					instrument: "piano",
					piece: "Test Piece",
					composer: "Test Composer",
					notes: "Test notes",
				},
			];

			renderLogs(logs);

			const row = tableBody.querySelector("tr");
			const cells = row.querySelectorAll("td");

			// Should have 7 columns: id, date, duration, instrument, piece, composer, notes
			expect(cells).toHaveLength(7);
		});

		test("logs each entry to console", () => {
			const logs = [
				{
					id: 1,
					local_date: "2025-01-23",
					duration: 45,
					instrument: "piano",
					piece: "Test Piece",
					composer: "Test Composer",
					notes: "Test notes",
				},
			];

			renderLogs(logs);

			expect(console.log).toHaveBeenCalledWith("Rendering log:", logs[0]);
		});
	});

	describe("Container Handling", () => {
		test("returns early if table body doesn't exist", () => {
			// Remove the table body
			tableBody.remove();

			const logs = [
				{ id: 1, local_date: "2025-01-23", duration: 30, instrument: "piano" },
			];

			// Should not throw
			expect(() => renderLogs(logs)).not.toThrow();
			expect(console.log).not.toHaveBeenCalled();
		});

		test("clears existing rows", () => {
			// Add some existing content
			tableBody.innerHTML = "<tr><td>Existing row</td></tr>";

			const logs = [
				{
					id: 1,
					local_date: "2025-01-23",
					duration: 30,
					instrument: "piano",
					piece: "Test",
					composer: "Test",
					notes: "Test",
				},
			];

			renderLogs(logs);

			// Should not contain the existing content
			expect(tableBody.innerHTML).not.toContain("Existing row");

			// Should have the new content
			const rows = tableBody.querySelectorAll("tr");
			expect(rows).toHaveLength(1);
		});
	});

	describe("Data Rendering", () => {
		test("renders all log fields correctly", () => {
			const logs = [
				{
					id: 42,
					local_date: "2025-01-23",
					duration: 75,
					instrument: "piano",
					piece: "Moonlight Sonata",
					composer: "Beethoven",
					notes: "Excellent practice session",
				},
			];

			renderLogs(logs);

			const row = tableBody.querySelector("tr");
			const cells = row.querySelectorAll("td");

			expect(cells[0].textContent).toBe("42");
			expect(cells[1].textContent).toBe("2025-01-23");
			expect(cells[2].textContent).toBe("75");
			expect(cells[3].textContent).toBe("Piano");
			expect(cells[4].textContent).toBe("Moonlight Sonata");
			expect(cells[5].textContent).toBe("Beethoven");
			expect(cells[6].textContent).toBe("Excellent practice session");
		});

		test("uses instrumentMap for instrument display", () => {
			const logs = [
				{
					id: 1,
					local_date: "2025-01-23",
					duration: 30,
					instrument: "guitar",
					piece: "Study",
					composer: "Sor",
					notes: "Practice",
				},
			];

			renderLogs(logs);

			const row = tableBody.querySelector("tr");
			const instrumentCell = row.querySelectorAll("td")[3];
			expect(instrumentCell.textContent).toBe("Guitar");
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
					notes: "Test",
				},
			];

			renderLogs(logs);

			const row = tableBody.querySelector("tr");
			const instrumentCell = row.querySelectorAll("td")[3];
			expect(instrumentCell.textContent).toBe("banjo");
		});

		test("handles null/undefined composer", () => {
			const logs = [
				{
					id: 1,
					local_date: "2025-01-23",
					duration: 30,
					instrument: "piano",
					piece: "Test Piece",
					composer: null,
					notes: "Test notes",
				},
				{
					id: 2,
					local_date: "2025-01-24",
					duration: 45,
					instrument: "guitar",
					piece: "Another Piece",
					composer: undefined,
					notes: "More notes",
				},
			];

			renderLogs(logs);

			const rows = tableBody.querySelectorAll("tr");

			const firstComposerCell = rows[0].querySelectorAll("td")[5];
			expect(firstComposerCell.textContent).toBe("N/A");

			const secondComposerCell = rows[1].querySelectorAll("td")[5];
			expect(secondComposerCell.textContent).toBe("N/A");
		});
	});

	describe("Empty Data Handling", () => {
		test("handles empty logs array", () => {
			renderLogs([]);

			const rows = tableBody.querySelectorAll("tr");
			expect(rows).toHaveLength(0);
			expect(tableBody.innerHTML).toBe("");
		});

		test("handles logs with empty string values", () => {
			const logs = [
				{
					id: 1,
					local_date: "",
					duration: 0,
					instrument: "",
					piece: "",
					composer: "",
					notes: "",
				},
			];

			renderLogs(logs);

			const row = tableBody.querySelector("tr");
			const cells = row.querySelectorAll("td");

			expect(cells[1].textContent).toBe(""); // date
			expect(cells[2].textContent).toBe("0"); // duration
			expect(cells[3].textContent).toBe(""); // instrument (empty string from map lookup)
			expect(cells[4].textContent).toBe(""); // piece
			expect(cells[5].textContent).toBe("N/A"); // composer (empty string becomes N/A)
			expect(cells[6].textContent).toBe(""); // notes
		});
	});

	describe("Special Characters and HTML", () => {
		test("handles special characters in text fields", () => {
			const logs = [
				{
					id: 1,
					local_date: "2025-01-23",
					duration: 30,
					instrument: "piano",
					piece: "Für Elise",
					composer: "Beethoven & Co.",
					notes: "Practice with é, ñ, ü characters",
				},
			];

			renderLogs(logs);

			const row = tableBody.querySelector("tr");
			const cells = row.querySelectorAll("td");

			expect(cells[4].textContent).toBe("Für Elise");
			expect(cells[5].textContent).toBe("Beethoven & Co.");
			expect(cells[6].textContent).toBe("Practice with é, ñ, ü characters");
		});

		test("handles HTML-like content safely", () => {
			const logs = [
				{
					id: 1,
					local_date: "2025-01-23",
					duration: 30,
					instrument: "piano",
					piece: "<script>alert('test')</script>",
					composer: "<b>Bold Composer</b>",
					notes: "Notes with <em>emphasis</em>",
				},
			];

			renderLogs(logs);

			const row = tableBody.querySelector("tr");
			const cells = row.querySelectorAll("td");

			// HTML is rendered as-is (not escaped)
			expect(cells[4].innerHTML).toBe("<script>alert('test')</script>");
			expect(cells[5].innerHTML).toBe("<b>Bold Composer</b>");
			expect(cells[6].innerHTML).toBe("Notes with <em>emphasis</em>");
		});
	});

	describe("Large Data Sets", () => {
		test("handles large number of logs efficiently", () => {
			const logs = Array.from({ length: 1000 }, (_, i) => ({
				id: i + 1,
				local_date: `2025-01-${((i % 28) + 1).toString().padStart(2, "0")}`,
				duration: (i % 120) + 1,
				instrument: ["piano", "guitar", "violin"][i % 3],
				piece: `Piece ${i + 1}`,
				composer: `Composer ${i + 1}`,
				notes: `Practice notes for log ${i + 1}`,
			}));

			const startTime = performance.now();
			renderLogs(logs);
			const endTime = performance.now();

			// Should handle 1000 logs reasonably (under 1000ms is acceptable for DOM operations)
			expect(endTime - startTime).toBeLessThan(1000);

			const rows = tableBody.querySelectorAll("tr");
			expect(rows).toHaveLength(1000);
		});
	});

	describe("Data Type Handling", () => {
		test("handles various data types for duration", () => {
			const logs = [
				{
					id: 1,
					local_date: "2025-01-23",
					duration: 45, // number
					instrument: "piano",
					piece: "Test",
					composer: "Test",
					notes: "Test",
				},
				{
					id: 2,
					local_date: "2025-01-24",
					duration: "30", // string
					instrument: "guitar",
					piece: "Test",
					composer: "Test",
					notes: "Test",
				},
			];

			renderLogs(logs);

			const rows = tableBody.querySelectorAll("tr");
			expect(rows[0].querySelectorAll("td")[2].textContent).toBe("45");
			expect(rows[1].querySelectorAll("td")[2].textContent).toBe("30");
		});

		test("handles various data types for id", () => {
			const logs = [
				{
					id: 123, // number
					local_date: "2025-01-23",
					duration: 30,
					instrument: "piano",
					piece: "Test",
					composer: "Test",
					notes: "Test",
				},
				{
					id: "456", // string
					local_date: "2025-01-24",
					duration: 45,
					instrument: "guitar",
					piece: "Test",
					composer: "Test",
					notes: "Test",
				},
			];

			renderLogs(logs);

			const rows = tableBody.querySelectorAll("tr");
			expect(rows[0].querySelectorAll("td")[0].textContent).toBe("123");
			expect(rows[1].querySelectorAll("td")[0].textContent).toBe("456");
		});
	});

	describe("DOM Structure Validation", () => {
		test("creates proper table row structure", () => {
			const logs = [
				{
					id: 1,
					local_date: "2025-01-23",
					duration: 30,
					instrument: "piano",
					piece: "Test",
					composer: "Test",
					notes: "Test",
				},
			];

			renderLogs(logs);

			const row = tableBody.querySelector("tr");
			expect(row.tagName).toBe("TR");

			const cells = row.querySelectorAll("td");
			expect(cells).toHaveLength(7);

			cells.forEach((cell) => {
				expect(cell.tagName).toBe("TD");
			});
		});

		test("maintains correct cell order", () => {
			const logs = [
				{
					id: 99,
					local_date: "2025-12-25",
					duration: 88,
					instrument: "violin",
					piece: "Holiday Song",
					composer: "Traditional",
					notes: "Festive practice",
				},
			];

			renderLogs(logs);

			const cells = tableBody.querySelectorAll("td");

			// Verify the order matches expected table structure
			expect(cells[0].textContent).toBe("99"); // id
			expect(cells[1].textContent).toBe("2025-12-25"); // local_date
			expect(cells[2].textContent).toBe("88"); // duration
			expect(cells[3].textContent).toBe("Violin"); // instrument (mapped)
			expect(cells[4].textContent).toBe("Holiday Song"); // piece
			expect(cells[5].textContent).toBe("Traditional"); // composer
			expect(cells[6].textContent).toBe("Festive practice"); // notes
		});
	});
});
