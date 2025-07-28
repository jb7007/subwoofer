/**
 * Time Format Component Tests
 *
 * Tests the time formatting utilities that convert practice session durations
 * into human-readable formats for display throughout the application.
 */

import {
	renderAsTxt,
	renderTxtShort,
} from "../../static/js/components/time-format.js";

describe("Time Format Component", () => {
	beforeEach(() => {
		// Clear the DOM before each test
		document.body.innerHTML = "";
	});

	describe("renderAsTxt", () => {
		test("formats zero minutes with default message", () => {
			const element = createTestElement("div", "test-time");

			renderAsTxt("test-time", 0);

			expect(element.innerHTML).toBe("<em>Nothing logged yet.</em>");
		});

		test("formats zero minutes with numeric flag", () => {
			const element = createTestElement("div", "test-time");

			renderAsTxt("test-time", 0, true);

			expect(element.innerHTML).toBe("<em>0 minutes</em>");
		});

		test("formats zero minutes with hasAffix flag", () => {
			const parent = createTestElement("div", "parent");
			const element = createTestElement("span", "test-time");
			parent.appendChild(element);

			renderAsTxt("test-time", 0, false, true);

			expect(parent.innerHTML).toBe("<em>Nothing logged yet.</em>");
		});

		test("formats single minute correctly", () => {
			const element = createTestElement("div", "test-time");

			renderAsTxt("test-time", 1);

			expect(element.innerHTML).toBe("<em>1 minute</em>");
		});

		test("formats multiple minutes correctly", () => {
			const element = createTestElement("div", "test-time");

			renderAsTxt("test-time", 45);

			expect(element.innerHTML).toBe("<em>45 minutes</em>");
		});

		test("formats exactly one hour", () => {
			const element = createTestElement("div", "test-time");

			renderAsTxt("test-time", 60);

			expect(element.innerHTML).toBe("<em>1 hour</em>");
		});

		test("formats multiple hours", () => {
			const element = createTestElement("div", "test-time");

			renderAsTxt("test-time", 120);

			expect(element.innerHTML).toBe("<em>2 hours</em>");
		});

		test("formats hours and single minute", () => {
			const element = createTestElement("div", "test-time");

			renderAsTxt("test-time", 61);

			expect(element.innerHTML).toBe("<em>1 hour and 1 minute</em>");
		});

		test("formats hours and multiple minutes", () => {
			const element = createTestElement("div", "test-time");

			renderAsTxt("test-time", 75);

			expect(element.innerHTML).toBe("<em>1 hour and 15 minutes</em>");
		});

		test("formats multiple hours and minutes", () => {
			const element = createTestElement("div", "test-time");

			renderAsTxt("test-time", 135);

			expect(element.innerHTML).toBe("<em>2 hours and 15 minutes</em>");
		});

		test("handles non-existent element gracefully", () => {
			expect(() => {
				renderAsTxt("non-existent", 60);
			}).not.toThrow();
		});

		test("handles edge case of very large numbers", () => {
			const element = createTestElement("div", "test-time");

			renderAsTxt("test-time", 1440); // 24 hours

			expect(element.innerHTML).toBe("<em>24 hours</em>");
		});
	});

	describe("renderTxtShort", () => {
		test("formats single minute in short format", () => {
			const element = createTestElement("div", "test-time");

			renderTxtShort("test-time", 1);

			expect(element.innerHTML).toBe("<em>1 min</em>");
		});

		test("formats multiple minutes in short format", () => {
			const element = createTestElement("div", "test-time");

			renderTxtShort("test-time", 45);

			expect(element.innerHTML).toBe("<em>45 mins</em>");
		});

		test("formats exactly one hour in short format", () => {
			const element = createTestElement("div", "test-time");

			renderTxtShort("test-time", 60);

			expect(element.innerHTML).toBe("<em>1 hr</em>");
		});

		test("formats multiple hours in short format", () => {
			const element = createTestElement("div", "test-time");

			renderTxtShort("test-time", 120);

			expect(element.innerHTML).toBe("<em>2 hrs</em>");
		});

		test("formats hours and single minute in short format", () => {
			const element = createTestElement("div", "test-time");

			renderTxtShort("test-time", 61);

			expect(element.innerHTML).toBe("<em>1 hr 1 min</em>");
		});

		test("formats hours and multiple minutes in short format", () => {
			const element = createTestElement("div", "test-time");

			renderTxtShort("test-time", 75);

			expect(element.innerHTML).toBe("<em>1 hr 15 mins</em>");
		});

		test("formats multiple hours and minutes in short format", () => {
			const element = createTestElement("div", "test-time");

			renderTxtShort("test-time", 135);

			expect(element.innerHTML).toBe("<em>2 hrs 15 mins</em>");
		});

		test("handles non-existent element gracefully", () => {
			expect(() => {
				renderTxtShort("non-existent", 60);
			}).not.toThrow();
		});

		test("handles zero minutes in short format", () => {
			const element = createTestElement("div", "test-time");

			renderTxtShort("test-time", 0);

			expect(element.innerHTML).toBe("<em>0 mins</em>");
		});
	});

	describe("Edge Cases and Error Handling", () => {
		test("handles negative numbers gracefully", () => {
			const element = createTestElement("div", "test-time");

			expect(() => {
				renderAsTxt("test-time", -5);
			}).not.toThrow();
		});

		test("handles floating point numbers", () => {
			const element = createTestElement("div", "test-time");

			renderAsTxt("test-time", 45.7);

			// Should preserve decimal precision
			expect(element.innerHTML).toBe("<em>45.7 minutes</em>");
		});

		test("handles string numbers", () => {
			const element = createTestElement("div", "test-time");

			renderAsTxt("test-time", "45");

			expect(element.innerHTML).toBe("<em>45 minutes</em>");
		});

		test("handles null and undefined gracefully", () => {
			const element = createTestElement("div", "test-time");

			expect(() => {
				renderAsTxt("test-time", null);
				renderAsTxt("test-time", undefined);
			}).not.toThrow();
		});
	});
});
