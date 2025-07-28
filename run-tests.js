#!/usr/bin/env node

/**
 * Test Runner Script for Practice Tracker
 *
 * This script provides a unified interface for running both Python and JavaScript tests.
 * It can be used in development, CI/CD pipelines, and for comprehensive test reporting.
 */

import { spawn } from "child_process";
import path from "path";

const colors = {
	green: "\x1b[32m",
	red: "\x1b[31m",
	yellow: "\x1b[33m",
	blue: "\x1b[34m",
	reset: "\x1b[0m",
	bold: "\x1b[1m",
};

function log(message, color = colors.reset) {
	console.log(`${color}${message}${colors.reset}`);
}

function runCommand(command, args, options = {}) {
	return new Promise((resolve, reject) => {
		const proc = spawn(command, args, {
			stdio: "inherit",
			shell: true,
			...options,
		});

		proc.on("close", (code) => {
			if (code === 0) {
				resolve(code);
			} else {
				reject(new Error(`Command failed with exit code ${code}`));
			}
		});

		proc.on("error", (err) => {
			reject(err);
		});
	});
}

async function runPythonTests() {
	log("\n🐍 Running Python Tests...", colors.blue + colors.bold);
	try {
		await runCommand(".venv\\Scripts\\python.exe", [
			"-m",
			"pytest",
			"--tb=short",
		]);
		log("✅ Python tests passed!", colors.green);
		return true;
	} catch (error) {
		log("❌ Python tests failed!", colors.red);
		return false;
	}
}

async function runJavaScriptTests() {
	log("\n🟨 Running JavaScript Tests...", colors.yellow + colors.bold);
	try {
		await runCommand("npm", ["test"]);
		log("✅ JavaScript tests passed!", colors.green);
		return true;
	} catch (error) {
		log("❌ JavaScript tests failed!", colors.red);
		return false;
	}
}

async function runJavaScriptCoverage() {
	log(
		"\n📊 Running JavaScript Tests with Coverage...",
		colors.blue + colors.bold
	);
	try {
		await runCommand("npm", ["run", "test:coverage"]);
		log("✅ JavaScript coverage report generated!", colors.green);
		return true;
	} catch (error) {
		log("❌ JavaScript coverage failed!", colors.red);
		return false;
	}
}

async function main() {
	const args = process.argv.slice(2);

	log("🧪 Practice Tracker Test Suite", colors.bold);
	log("================================", colors.bold);

	let pythonPassed = undefined;
	let jsPassed = undefined;

	if (args.includes("--python-only")) {
		pythonPassed = await runPythonTests();
	} else if (args.includes("--js-only")) {
		jsPassed = await runJavaScriptTests();
	} else if (args.includes("--js-coverage")) {
		jsPassed = await runJavaScriptCoverage();
	} else {
		// Run both test suites
		pythonPassed = await runPythonTests();
		jsPassed = await runJavaScriptTests();
	}

	log("\n📋 Test Summary", colors.bold);
	log("================", colors.bold);

	if (pythonPassed !== undefined) {
		log(
			`Python Tests: ${pythonPassed ? "✅ PASSED" : "❌ FAILED"}`,
			pythonPassed ? colors.green : colors.red
		);
	}

	if (jsPassed !== undefined) {
		log(
			`JavaScript Tests: ${jsPassed ? "✅ PASSED" : "❌ FAILED"}`,
			jsPassed ? colors.green : colors.red
		);
	}

	const allPassed =
		(pythonPassed !== undefined ? pythonPassed : true) &&
		(jsPassed !== undefined ? jsPassed : true);

	if (allPassed) {
		log(
			"\n🎉 All tests passed! Ready for deployment!",
			colors.green + colors.bold
		);
		process.exit(0);
	} else {
		log(
			"\n💥 Some tests failed. Please fix before deployment.",
			colors.red + colors.bold
		);
		process.exit(1);
	}
}

// Run main function when script is executed directly
main().catch((error) => {
	log(`\n❌ Test runner error: ${error.message}`, colors.red);
	process.exit(1);
});

export { runPythonTests, runJavaScriptTests, runJavaScriptCoverage };
