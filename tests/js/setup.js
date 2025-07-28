/**
 * Jest Test Setup for Practice Tracker JavaScript Tests
 *
 * This file configures the testing environment for client-side JavaScript tests.
 * It sets up global mocks, test utilities, and DOM environment configurations
 * needed across all test files.
 */

// Mock fetch globally for API testing
global.fetch = jest.fn();

// Mock console methods to avoid noise in tests
global.console = {
	...console,
	log: jest.fn(),
	warn: jest.fn(),
	error: jest.fn(),
};

// Mock localStorage
const localStorageMock = {
	getItem: jest.fn(),
	setItem: jest.fn(),
	removeItem: jest.fn(),
	clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock sessionStorage
const sessionStorageMock = {
	getItem: jest.fn(),
	setItem: jest.fn(),
	removeItem: jest.fn(),
	clear: jest.fn(),
};
global.sessionStorage = sessionStorageMock;

// Setup DOM utilities
beforeEach(() => {
	// Clear all mocks before each test
	jest.clearAllMocks();

	// Reset fetch mock
	fetch.mockClear();

	// Clear localStorage and sessionStorage
	localStorage.clear();
	sessionStorage.clear();

	// Reset document body
	document.body.innerHTML = "";
});

// Helper function to create DOM elements for testing
global.createTestElement = (tag, id, content = "") => {
	const element = document.createElement(tag);
	if (id) element.id = id;
	if (content) element.textContent = content;
	document.body.appendChild(element);
	return element;
};

// Helper function to mock successful fetch responses
global.mockFetchSuccess = (data) => {
	fetch.mockResolvedValueOnce({
		ok: true,
		status: 200,
		json: async () => data,
	});
};

// Helper function to mock fetch errors
global.mockFetchError = (status = 500, data = "Server Error") => {
	fetch.mockResolvedValueOnce({
		ok: false,
		status,
		json: async () => (typeof data === "string" ? { error: data } : data),
	});
};

// Helper function to mock network errors
global.mockFetchNetworkError = (message = "Network Error") => {
	fetch.mockRejectedValueOnce(new Error(message));
};
