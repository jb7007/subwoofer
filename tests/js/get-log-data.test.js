/**
 * getLogData Function Tests
 *
 * Tests the getLogData function that extracts form data and creates
 * a structured log data object for practice log submission.
 */

import { getLogData } from "../../static/js/logic/logs/logs.js";
import { extractPieceAndComposer } from "../../static/js/forms/index.js";

// Mock the extractPieceAndComposer function
jest.mock("../../static/js/forms/index.js");

describe("getLogData", () => {
	let mockDate;

	beforeEach(() => {
		// Mock Date constructor to return consistent timestamp
		const mockDateValue = new Date("2025-01-23T15:30:00.000Z");
		mockDate = jest
			.spyOn(global, "Date")
			.mockImplementation(() => mockDateValue);

		// Setup DOM elements
		document.body.innerHTML = `
			<input id="logDuration" value="" />
			<select id="instrument">
				<option value="">Select instrument</option>
				<option value="piano">Piano</option>
				<option value="guitar">Guitar</option>
			</select>
			<textarea id="logNotes"></textarea>
		`;

		// Reset mocks
		jest.clearAllMocks();
	});

	afterEach(() => {
		mockDate.mockRestore();
		jest.clearAllMocks();
		document.body.innerHTML = "";
	});

	describe("Basic Functionality", () => {
		test("creates log data with all fields populated", () => {
			// Setup DOM values
			document.getElementById("logDuration").value = "45";
			document.getElementById("instrument").value = "piano";
			document.getElementById("logNotes").value = "Great practice session!";

			// Mock piece/composer extraction
			extractPieceAndComposer.mockReturnValue({
				pieceTitle: "Moonlight Sonata",
				composer: "Beethoven",
			});

			const result = getLogData();

			expect(result).toEqual({
				utc_timestamp: "2025-01-23T15:30:00.000Z",
				duration: 45,
				instrument: "piano",
				piece: "Moonlight Sonata",
				composer: "Beethoven",
				notes: "Great practice session!",
			});

			expect(extractPieceAndComposer).toHaveBeenCalledTimes(1);
		});

		test("handles missing optional notes field", () => {
			document.getElementById("logDuration").value = "30";
			document.getElementById("instrument").value = "guitar";
			// Notes field is empty - should return null per implementation

			extractPieceAndComposer.mockReturnValue({
				pieceTitle: "Classical Gas",
				composer: "Williams",
			});

			const result = getLogData();

			expect(result.notes).toBeNull();
		});

		test("handles null piece and composer from extraction", () => {
			document.getElementById("logDuration").value = "60";
			document.getElementById("instrument").value = "violin";

			extractPieceAndComposer.mockReturnValue({
				pieceTitle: null,
				composer: null,
			});

			const result = getLogData();

			expect(result.piece).toBeNull();
			expect(result.composer).toBeNull();
		});

		test("generates current UTC timestamp", () => {
			document.getElementById("logDuration").value = "15";
			document.getElementById("instrument").value = "piano";

			extractPieceAndComposer.mockReturnValue({
				pieceTitle: "Test Piece",
				composer: "Test Composer",
			});

			const result = getLogData();

			expect(result.utc_timestamp).toBe("2025-01-23T15:30:00.000Z");
		});
	});

	describe("Duration Parsing", () => {
		test("parses duration as integer", () => {
			document.getElementById("logDuration").value = "45";
			document.getElementById("instrument").value = "piano";

			extractPieceAndComposer.mockReturnValue({
				pieceTitle: "Test",
				composer: "Test",
			});

			const result = getLogData();

			expect(result.duration).toBe(45);
			expect(typeof result.duration).toBe("number");
		});

		test("parses string duration to integer", () => {
			document.getElementById("logDuration").value = "120";
			document.getElementById("instrument").value = "guitar";

			extractPieceAndComposer.mockReturnValue({
				pieceTitle: "Test",
				composer: "Test",
			});

			const result = getLogData();

			expect(result.duration).toBe(120);
		});

		test("handles invalid duration input", () => {
			document.getElementById("logDuration").value = "invalid";
			document.getElementById("instrument").value = "piano";

			extractPieceAndComposer.mockReturnValue({
				pieceTitle: "Test",
				composer: "Test",
			});

			const result = getLogData();

			expect(result.duration).toBeNaN();
		});

		test("handles empty duration input", () => {
			document.getElementById("logDuration").value = "";
			document.getElementById("instrument").value = "piano";

			extractPieceAndComposer.mockReturnValue({
				pieceTitle: "Test",
				composer: "Test",
			});

			const result = getLogData();

			expect(result.duration).toBeNaN();
		});

		test("handles decimal duration (rounds down)", () => {
			document.getElementById("logDuration").value = "45.7";
			document.getElementById("instrument").value = "piano";

			extractPieceAndComposer.mockReturnValue({
				pieceTitle: "Test",
				composer: "Test",
			});

			const result = getLogData();

			expect(result.duration).toBe(45);
		});
	});

	describe("DOM Element Handling", () => {
		test("handles missing logNotes element gracefully", () => {
			// Remove the notes element
			document.getElementById("logNotes").remove();

			document.getElementById("logDuration").value = "30";
			document.getElementById("instrument").value = "piano";

			extractPieceAndComposer.mockReturnValue({
				pieceTitle: "Test",
				composer: "Test",
			});

			const result = getLogData();

			expect(result.notes).toBeNull();
		});

		test("handles whitespace in notes field", () => {
			document.getElementById("logDuration").value = "30";
			document.getElementById("instrument").value = "piano";
			document.getElementById("logNotes").value =
				"   Some notes with spaces   ";

			extractPieceAndComposer.mockReturnValue({
				pieceTitle: "Test",
				composer: "Test",
			});

			const result = getLogData();

			expect(result.notes).toBe("   Some notes with spaces   ");
		});

		test("handles special characters in form fields", () => {
			document.getElementById("logDuration").value = "30";

			// Set instrument select properly - add option first
			const instrumentSelect = document.getElementById("instrument");
			const specialOption = document.createElement("option");
			specialOption.value = "special-instrument";
			specialOption.textContent = "Special Instrument";
			instrumentSelect.appendChild(specialOption);
			instrumentSelect.value = "special-instrument";

			document.getElementById("logNotes").value =
				"Notes with émojis 🎵 & symbols!";

			extractPieceAndComposer.mockReturnValue({
				pieceTitle: "Pièce Spéciale",
				composer: "Cömposer",
			});

			const result = getLogData();

			expect(result.instrument).toBe("special-instrument");
			expect(result.notes).toBe("Notes with émojis 🎵 & symbols!");
			expect(result.piece).toBe("Pièce Spéciale");
			expect(result.composer).toBe("Cömposer");
		});

		test("handles very long input values", () => {
			const longDuration = "999999";
			const longInstrument = "a".repeat(1000);
			const longNotes = "x".repeat(5000);

			document.getElementById("logDuration").value = longDuration;

			// Set instrument select properly - add option first
			const instrumentSelect = document.getElementById("instrument");
			const longOption = document.createElement("option");
			longOption.value = longInstrument;
			longOption.textContent = "Long Instrument";
			instrumentSelect.appendChild(longOption);
			instrumentSelect.value = longInstrument;

			document.getElementById("logNotes").value = longNotes;

			extractPieceAndComposer.mockReturnValue({
				pieceTitle: "b".repeat(2000),
				composer: "c".repeat(1500),
			});

			const result = getLogData();

			expect(result.duration).toBe(999999);
			expect(result.instrument).toBe(longInstrument);
			expect(result.notes).toBe(longNotes);
		});
	});

	describe("Integration with extractPieceAndComposer", () => {
		test("calls extractPieceAndComposer correctly", () => {
			document.getElementById("logDuration").value = "30";
			document.getElementById("instrument").value = "piano";

			extractPieceAndComposer.mockReturnValue({
				pieceTitle: "Test Piece",
				composer: "Test Composer",
			});

			getLogData();

			expect(extractPieceAndComposer).toHaveBeenCalledTimes(1);
			expect(extractPieceAndComposer).toHaveBeenCalledWith();
		});

		test("handles extractPieceAndComposer returning undefined values", () => {
			document.getElementById("logDuration").value = "30";
			document.getElementById("instrument").value = "piano";

			extractPieceAndComposer.mockReturnValue({
				pieceTitle: undefined,
				composer: undefined,
			});

			const result = getLogData();

			expect(result.piece).toBeUndefined();
			expect(result.composer).toBeUndefined();
		});

		test("handles extractPieceAndComposer throwing error", () => {
			document.getElementById("logDuration").value = "30";
			document.getElementById("instrument").value = "piano";

			extractPieceAndComposer.mockImplementation(() => {
				throw new Error("Extraction failed");
			});

			expect(() => getLogData()).toThrow("Extraction failed");
		});
	});

	describe("Edge Cases", () => {
		test("handles negative duration", () => {
			document.getElementById("logDuration").value = "-45";
			document.getElementById("instrument").value = "piano";

			extractPieceAndComposer.mockReturnValue({
				pieceTitle: "Test",
				composer: "Test",
			});

			const result = getLogData();

			expect(result.duration).toBe(-45);
		});

		test("handles zero duration", () => {
			document.getElementById("logDuration").value = "0";
			document.getElementById("instrument").value = "piano";

			extractPieceAndComposer.mockReturnValue({
				pieceTitle: "Test",
				composer: "Test",
			});

			const result = getLogData();

			expect(result.duration).toBe(0);
		});

		test("handles empty instrument selection", () => {
			document.getElementById("logDuration").value = "30";
			document.getElementById("instrument").value = "";

			extractPieceAndComposer.mockReturnValue({
				pieceTitle: "Test",
				composer: "Test",
			});

			const result = getLogData();

			expect(result.instrument).toBe("");
		});

		test("creates consistent object structure", () => {
			document.getElementById("logDuration").value = "30";
			document.getElementById("instrument").value = "piano";

			extractPieceAndComposer.mockReturnValue({
				pieceTitle: "Test",
				composer: "Test",
			});

			const result = getLogData();

			expect(Object.keys(result)).toEqual([
				"utc_timestamp",
				"duration",
				"instrument",
				"piece",
				"composer",
				"notes",
			]);
		});
	});
});
