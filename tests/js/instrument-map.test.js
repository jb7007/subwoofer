/**
 * Instrument Map Tests
 *
 * Tests the instrumentMap object that provides mappings between
 * instrument identifiers and their display names.
 */

import { instrumentMap } from "../../static/js/utils/instrument-map.js";

describe("instrumentMap", () => {
	describe("Object Structure", () => {
		test("is defined and is an object", () => {
			expect(instrumentMap).toBeDefined();
			expect(typeof instrumentMap).toBe("object");
			expect(instrumentMap).not.toBeNull();
		});

		test("is not an array", () => {
			expect(Array.isArray(instrumentMap)).toBe(false);
		});

		test("has enumerable properties", () => {
			const keys = Object.keys(instrumentMap);
			expect(keys.length).toBeGreaterThan(0);
		});

		test("all values are strings", () => {
			const values = Object.values(instrumentMap);
			values.forEach((value) => {
				expect(typeof value).toBe("string");
				expect(value.length).toBeGreaterThan(0);
			});
		});

		test("all keys are strings", () => {
			const keys = Object.keys(instrumentMap);
			keys.forEach((key) => {
				expect(typeof key).toBe("string");
				expect(key.length).toBeGreaterThan(0);
			});
		});
	});

	describe("String Instruments", () => {
		test("contains standard string instruments", () => {
			expect(instrumentMap.violin).toBe("Violin");
			expect(instrumentMap.viola).toBe("Viola");
			expect(instrumentMap.cello).toBe("Cello");
			expect(instrumentMap.doubleBass).toBe("Double Bass");
			expect(instrumentMap.harp).toBe("Harp");
		});

		test("string instrument values are properly formatted", () => {
			const stringInstruments = [
				"violin",
				"viola",
				"cello",
				"doubleBass",
				"harp",
			];
			stringInstruments.forEach((instrument) => {
				expect(instrumentMap[instrument]).toMatch(/^[A-Z]/); // Starts with capital
				expect(instrumentMap[instrument]).not.toMatch(/^\s|\s$/); // No leading/trailing spaces
			});
		});
	});

	describe("Woodwind Instruments", () => {
		test("contains standard woodwind instruments", () => {
			expect(instrumentMap.piccolo).toBe("Piccolo");
			expect(instrumentMap.flute).toBe("Flute");
			expect(instrumentMap.oboe).toBe("Oboe");
			expect(instrumentMap.englishHorn).toBe("English Horn");
			expect(instrumentMap.bassoon).toBe("Bassoon");
			expect(instrumentMap.contrabassoon).toBe("Contrabassoon");
		});

		test("contains clarinet family", () => {
			expect(instrumentMap.clarinetEb).toBe("E♭ Clarinet");
			expect(instrumentMap.clarinetBb).toBe("B♭ Clarinet");
			expect(instrumentMap.bassClarinet).toBe("Bass Clarinet");
			expect(instrumentMap.contraClarinet).toBe("Contrabass Clarinet");
		});

		test("handles special characters in clarinet names", () => {
			expect(instrumentMap.clarinetEb).toContain("♭");
			expect(instrumentMap.clarinetBb).toContain("♭");
		});
	});

	describe("Saxophone Family", () => {
		test("contains complete saxophone range", () => {
			expect(instrumentMap.sopranoSax).toBe("Soprano Saxophone");
			expect(instrumentMap.altoSax).toBe("Alto Saxophone");
			expect(instrumentMap.tenorSax).toBe("Tenor Saxophone");
			expect(instrumentMap.baritoneSax).toBe("Baritone Saxophone");
			expect(instrumentMap.bassSax).toBe("Bass Saxophone");
		});

		test("all saxophones follow naming convention", () => {
			const saxophones = [
				"sopranoSax",
				"altoSax",
				"tenorSax",
				"baritoneSax",
				"bassSax",
			];
			saxophones.forEach((sax) => {
				expect(instrumentMap[sax]).toContain("Saxophone");
				expect(instrumentMap[sax]).toMatch(/^[A-Z]/);
			});
		});
	});

	describe("Brass Instruments", () => {
		test("contains high brass instruments", () => {
			expect(instrumentMap.trumpet).toBe("Trumpet");
			expect(instrumentMap.cornet).toBe("Cornet");
			expect(instrumentMap.flugelhorn).toBe("Flugelhorn");
			expect(instrumentMap.frenchHorn).toBe("French Horn");
		});

		test("contains low brass instruments", () => {
			expect(instrumentMap.trombone).toBe("Trombone");
			expect(instrumentMap.bassTrombone).toBe("Bass Trombone");
			expect(instrumentMap.euphonium).toBe("Euphonium");
			expect(instrumentMap.baritoneHorn).toBe("Baritone Horn");
			expect(instrumentMap.tuba).toBe("Tuba");
		});
	});

	describe("Percussion Instruments", () => {
		test("contains drum instruments", () => {
			expect(instrumentMap.snareDrum).toBe("Snare Drum");
			expect(instrumentMap.bassDrum).toBe("Bass Drum");
			expect(instrumentMap.drumSet).toBe("Drum Set");
		});

		test("contains mallet instruments", () => {
			expect(instrumentMap.xylophone).toBe("Xylophone");
			expect(instrumentMap.marimba).toBe("Marimba");
			expect(instrumentMap.vibraphone).toBe("Vibraphone");
			expect(instrumentMap.glockenspiel).toBe("Glockenspiel");
		});

		test("contains other percussion", () => {
			expect(instrumentMap.cymbals).toBe("Cymbals");
			expect(instrumentMap.timpani).toBe("Timpani");
			expect(instrumentMap.multiPercussion).toBe("Multi-Percussion Setup");
			expect(instrumentMap.accessoryPercussion).toBe("Accessory Percussion");
			expect(instrumentMap.percussionOther).toBe("Other / Unlisted Percussion");
		});
	});

	describe("Other Instruments", () => {
		test("contains keyboard instruments", () => {
			expect(instrumentMap.piano).toBe("Piano");
			expect(instrumentMap.organ).toBe("Organ");
			expect(instrumentMap.celesta).toBe("Celesta");
		});

		test("contains string instruments (plucked)", () => {
			expect(instrumentMap.guitar).toBe("Guitar");
			expect(instrumentMap.electricGuitar).toBe("Electric Guitar");
			expect(instrumentMap.bassGuitar).toBe("Bass Guitar");
			expect(instrumentMap.ukulele).toBe("Ukulele");
		});

		test("contains voice and other", () => {
			expect(instrumentMap.voice).toBe("Voice");
			expect(instrumentMap.other).toBe("Other");
		});
	});

	describe("Data Integrity", () => {
		test("has no duplicate values", () => {
			const values = Object.values(instrumentMap);
			const uniqueValues = [...new Set(values)];
			expect(values.length).toBe(uniqueValues.length);
		});

		test("has no duplicate keys", () => {
			const keys = Object.keys(instrumentMap);
			const uniqueKeys = [...new Set(keys)];
			expect(keys.length).toBe(uniqueKeys.length);
		});

		test("has expected minimum number of instruments", () => {
			const instrumentCount = Object.keys(instrumentMap).length;
			expect(instrumentCount).toBeGreaterThanOrEqual(50); // Should have at least 50 instruments
		});

		test("no empty string values", () => {
			const values = Object.values(instrumentMap);
			values.forEach((value) => {
				expect(value.trim()).not.toBe("");
			});
		});

		test("no empty string keys", () => {
			const keys = Object.keys(instrumentMap);
			keys.forEach((key) => {
				expect(key.trim()).not.toBe("");
			});
		});
	});

	describe("Lookup Functionality", () => {
		test("can look up instruments by key", () => {
			expect(instrumentMap["piano"]).toBe("Piano");
			expect(instrumentMap["trumpet"]).toBe("Trumpet");
			expect(instrumentMap["violin"]).toBe("Violin");
		});

		test("returns undefined for non-existent keys", () => {
			expect(instrumentMap["nonexistent"]).toBeUndefined();
			expect(instrumentMap[""]).toBeUndefined();
			expect(instrumentMap["undefined"]).toBeUndefined();
		});

		test("key lookup is case sensitive", () => {
			expect(instrumentMap["Piano"]).toBeUndefined(); // Capital P
			expect(instrumentMap["PIANO"]).toBeUndefined(); // All caps
			expect(instrumentMap["piano"]).toBe("Piano"); // Correct case
		});
	});

	describe("Display Names", () => {
		test("display names are human readable", () => {
			const values = Object.values(instrumentMap);
			values.forEach((displayName) => {
				// Should start with capital letter
				expect(displayName).toMatch(/^[A-Z]/);
				// Should not contain underscores (internal identifiers)
				expect(displayName).not.toContain("_");
				// Should not be camelCase (display names should have spaces)
				if (displayName.includes(" ")) {
					expect(displayName).not.toMatch(/[a-z][A-Z]/);
				}
			});
		});

		test("special characters are properly handled", () => {
			// Test musical symbols
			expect(instrumentMap.clarinetEb).toContain("♭");
			expect(instrumentMap.clarinetBb).toContain("♭");

			// Test forward slash in percussion
			expect(instrumentMap.percussionOther).toContain("/");

			// Test hyphen in compound names
			expect(instrumentMap.multiPercussion).toContain("-");
		});

		test("abbreviations and acronyms are handled consistently", () => {
			// E♭ and B♭ should be formatted consistently
			expect(instrumentMap.clarinetEb).toMatch(/^E♭/);
			expect(instrumentMap.clarinetBb).toMatch(/^B♭/);
		});
	});

	describe("Coverage of Common Instruments", () => {
		test("includes all standard orchestra instruments", () => {
			// Strings
			expect(instrumentMap.violin).toBeDefined();
			expect(instrumentMap.viola).toBeDefined();
			expect(instrumentMap.cello).toBeDefined();
			expect(instrumentMap.doubleBass).toBeDefined();

			// Woodwinds
			expect(instrumentMap.flute).toBeDefined();
			expect(instrumentMap.oboe).toBeDefined();
			expect(instrumentMap.clarinetBb).toBeDefined();
			expect(instrumentMap.bassoon).toBeDefined();

			// Brass
			expect(instrumentMap.trumpet).toBeDefined();
			expect(instrumentMap.frenchHorn).toBeDefined();
			expect(instrumentMap.trombone).toBeDefined();
			expect(instrumentMap.tuba).toBeDefined();

			// Percussion
			expect(instrumentMap.timpani).toBeDefined();
		});

		test("includes common band instruments", () => {
			expect(instrumentMap.piccolo).toBeDefined();
			expect(instrumentMap.altoSax).toBeDefined();
			expect(instrumentMap.euphonium).toBeDefined();
			expect(instrumentMap.snareDrum).toBeDefined();
		});

		test("includes popular modern instruments", () => {
			expect(instrumentMap.piano).toBeDefined();
			expect(instrumentMap.guitar).toBeDefined();
			expect(instrumentMap.electricGuitar).toBeDefined();
			expect(instrumentMap.drumSet).toBeDefined();
			expect(instrumentMap.voice).toBeDefined();
		});
	});
});
