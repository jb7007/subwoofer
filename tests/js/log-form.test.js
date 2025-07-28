/**
 * Log Form Component Tests
 *
 * Tests the practice log form handling functions including piece/composer
 * extraction, form validation, and form state management.
 */

import {
	extractPieceAndComposer,
	resetPieceComposerFields,
} from "../../static/js/forms/log-form.js";

describe("Log Form Component", () => {
	beforeEach(() => {
		// Clear the DOM and setup form elements before each test
		document.body.innerHTML = "";

		// Create form elements that the functions expect
		createTestElement("select", "pieceDropdown");
		createTestElement("input", "piece");
		createTestElement("input", "composerInput");
		createTestElement("label", "composerLabel");
	});

	describe("extractPieceAndComposer", () => {
		test("extracts piece and composer from dropdown selection", () => {
			// Create dropdown with option that has the value we want to test
			const dropdown = document.getElementById("pieceDropdown");
			const option = document.createElement("option");
			option.value = "Moonlight Sonata:::Beethoven";
			option.textContent = "Moonlight Sonata - Beethoven";
			dropdown.appendChild(option);
			dropdown.value = "Moonlight Sonata:::Beethoven";

			const result = extractPieceAndComposer();

			expect(result.pieceTitle).toBe("Moonlight Sonata");
			expect(result.composer).toBe("Beethoven");
		});

		test("extracts piece and composer from dropdown with extra whitespace", () => {
			const dropdown = document.getElementById("pieceDropdown");
			const option = document.createElement("option");
			option.value = "  Chopin Etude Op. 10 No. 1  :::  Chopin  ";
			dropdown.appendChild(option);
			dropdown.value = "  Chopin Etude Op. 10 No. 1  :::  Chopin  ";

			const result = extractPieceAndComposer();

			expect(result.pieceTitle).toBe("Chopin Etude Op. 10 No. 1");
			expect(result.composer).toBe("Chopin");
		});

		test("handles dropdown selection with empty composer", () => {
			const dropdown = document.getElementById("pieceDropdown");
			const option = document.createElement("option");
			option.value = "Unknown Piece:::";
			dropdown.appendChild(option);
			dropdown.value = "Unknown Piece:::";

			const result = extractPieceAndComposer();

			expect(result.pieceTitle).toBe("Unknown Piece");
			expect(result.composer).toBe("");
		});

		test("extracts manual piece with composer", () => {
			const dropdown = document.getElementById("pieceDropdown");
			const pieceInput = document.getElementById("piece");
			const composerInput = document.getElementById("composerInput");

			dropdown.value = ""; // No dropdown selection
			pieceInput.value = "Bach Invention No. 1";
			composerInput.value = "J.S. Bach";

			const result = extractPieceAndComposer();

			expect(result.pieceTitle).toBe("Bach Invention No. 1");
			expect(result.composer).toBe("J.S. Bach");
		});

		test("extracts manual piece without composer (defaults to Unknown)", () => {
			const dropdown = document.getElementById("pieceDropdown");
			const pieceInput = document.getElementById("piece");
			const composerInput = document.getElementById("composerInput");

			dropdown.value = "";
			pieceInput.value = "My Original Composition";
			composerInput.value = "";

			const result = extractPieceAndComposer();

			expect(result.pieceTitle).toBe("My Original Composition");
			expect(result.composer).toBe("Unknown");
		});

		test("extracts manual piece with whitespace trimming", () => {
			const dropdown = document.getElementById("pieceDropdown");
			const pieceInput = document.getElementById("piece");
			const composerInput = document.getElementById("composerInput");

			dropdown.value = "";
			pieceInput.value = "  Clair de Lune  ";
			composerInput.value = "  Debussy  ";

			const result = extractPieceAndComposer();

			expect(result.pieceTitle).toBe("Clair de Lune");
			expect(result.composer).toBe("Debussy");
		});

		test("returns null values when no piece information provided", () => {
			const dropdown = document.getElementById("pieceDropdown");
			const pieceInput = document.getElementById("piece");

			dropdown.value = "";
			pieceInput.value = "";

			const result = extractPieceAndComposer();

			expect(result.pieceTitle).toBe(null);
			expect(result.composer).toBe(null);
		});

		test("prioritizes dropdown over manual input", () => {
			const dropdown = document.getElementById("pieceDropdown");
			const pieceInput = document.getElementById("piece");
			const composerInput = document.getElementById("composerInput");

			// Create option element first, then set value
			const option = document.createElement("option");
			option.value = "Dropdown Piece:::Dropdown Composer";
			dropdown.appendChild(option);
			dropdown.value = "Dropdown Piece:::Dropdown Composer";

			pieceInput.value = "Manual Piece";
			composerInput.value = "Manual Composer";

			const result = extractPieceAndComposer();

			expect(result.pieceTitle).toBe("Dropdown Piece");
			expect(result.composer).toBe("Dropdown Composer");
		});

		test("handles malformed dropdown value", () => {
			const dropdown = document.getElementById("pieceDropdown");

			// Create option element for malformed value
			const option = document.createElement("option");
			option.value = "Malformed Value Without Separator";
			dropdown.appendChild(option);
			dropdown.value = "Malformed Value Without Separator";

			const result = extractPieceAndComposer();

			expect(result.pieceTitle).toBe("Malformed Value Without Separator");
			expect(result.composer).toBe(undefined); // No separator found
		});

		test("handles dropdown with multiple separators", () => {
			const dropdown = document.getElementById("pieceDropdown");

			// Create option element for multi-separator value
			const option = document.createElement("option");
			option.value =
				"Complex:::Title:::With:::Multiple:::Parts:::Composer Name";
			dropdown.appendChild(option);
			dropdown.value =
				"Complex:::Title:::With:::Multiple:::Parts:::Composer Name";

			const result = extractPieceAndComposer();

			expect(result.pieceTitle).toBe("Complex");
			expect(result.composer).toBe("Title"); // Takes first split part as composer
		});

		test("handles empty strings in manual inputs", () => {
			const dropdown = document.getElementById("pieceDropdown");
			const pieceInput = document.getElementById("piece");
			const composerInput = document.getElementById("composerInput");

			dropdown.value = "";
			pieceInput.value = "   "; // Only whitespace
			composerInput.value = "   ";

			const result = extractPieceAndComposer();

			expect(result.pieceTitle).toBe(null); // Trimmed empty string
			expect(result.composer).toBe(null);
		});
	});

	describe("resetPieceComposerFields", () => {
		test("clears piece input field", () => {
			const pieceInput = document.getElementById("piece");
			pieceInput.value = "Some Piece Title";

			resetPieceComposerFields();

			expect(pieceInput.value).toBe("");
		});

		test("clears composer input field", () => {
			const composerInput = document.getElementById("composerInput");
			composerInput.value = "Some Composer";

			resetPieceComposerFields();

			expect(composerInput.value).toBe("");
		});

		test("hides composer label and input", () => {
			const composerLabel = document.getElementById("composerLabel");
			const composerInput = document.getElementById("composerInput");

			// Make them visible first
			composerLabel.style.display = "block";
			composerInput.style.display = "block";

			resetPieceComposerFields();

			expect(composerLabel.style.display).toBe("none");
			expect(composerInput.style.display).toBe("none");
		});

		test("handles missing elements gracefully", () => {
			// Remove some elements
			document.getElementById("piece").remove();
			document.getElementById("composerLabel").remove();

			expect(() => {
				resetPieceComposerFields();
			}).not.toThrow();
		});

		test("clears fields with special characters", () => {
			const pieceInput = document.getElementById("piece");
			const composerInput = document.getElementById("composerInput");

			pieceInput.value = "Pièce with ñ and ü";
			composerInput.value = 'Composer & "Special" Characters';

			resetPieceComposerFields();

			expect(pieceInput.value).toBe("");
			expect(composerInput.value).toBe("");
		});

		test("resets fields multiple times without errors", () => {
			const pieceInput = document.getElementById("piece");

			pieceInput.value = "Test Piece";

			resetPieceComposerFields();
			expect(pieceInput.value).toBe("");

			resetPieceComposerFields();
			expect(pieceInput.value).toBe("");

			resetPieceComposerFields();
			expect(pieceInput.value).toBe("");
		});
	});

	describe("Edge Cases and Error Handling", () => {
		test("handles null/undefined element IDs", () => {
			// Remove all elements
			document.body.innerHTML = "";

			expect(() => {
				extractPieceAndComposer();
				resetPieceComposerFields();
			}).not.toThrow();
		});

		test("handles elements without value property", () => {
			// Replace input with div (no value property)
			document
				.getElementById("piece")
				.replaceWith(createTestElement("div", "piece"));

			expect(() => {
				extractPieceAndComposer();
				resetPieceComposerFields();
			}).not.toThrow();
		});

		test("handles very long piece titles and composers", () => {
			const dropdown = document.getElementById("pieceDropdown");
			const longTitle = "A".repeat(1000);
			const longComposer = "B".repeat(1000);

			// Create option element for long values
			const option = document.createElement("option");
			option.value = `${longTitle}:::${longComposer}`;
			dropdown.appendChild(option);
			dropdown.value = `${longTitle}:::${longComposer}`;

			const result = extractPieceAndComposer();

			expect(result.pieceTitle).toBe(longTitle);
			expect(result.composer).toBe(longComposer);
		});

		test("handles unicode characters in piece information", () => {
			const dropdown = document.getElementById("pieceDropdown");

			// Create option element for unicode values
			const option = document.createElement("option");
			option.value = "🎵 Musical Piece 🎹:::🎼 Composer 🎻";
			dropdown.appendChild(option);
			dropdown.value = "🎵 Musical Piece 🎹:::🎼 Composer 🎻";

			const result = extractPieceAndComposer();

			expect(result.pieceTitle).toBe("🎵 Musical Piece 🎹");
			expect(result.composer).toBe("🎼 Composer 🎻");
		});
	});
});
