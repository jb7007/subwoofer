module.exports = {
	testEnvironment: "jsdom",
	setupFilesAfterEnv: ["<rootDir>/tests/js/setup.js"],
	testMatch: ["<rootDir>/tests/js/**/*.test.js"],
	collectCoverageFrom: [
		"static/js/**/*.js",
		"!static/js/init.js",
		"!static/js/**/index.js",
	],
	transform: {
		"^.+\\.js$": "babel-jest",
	},
	moduleNameMapper: {
		"^@/(.*)$": "<rootDir>/static/js/$1",
	},
	verbose: true,
	coverageDirectory: "coverage",
	coverageReporters: ["text", "lcov", "html"],
	coverageThreshold: {
		global: {
			branches: 20,
			functions: 20,
			lines: 20,
			statements: 20,
		},
	},
};
