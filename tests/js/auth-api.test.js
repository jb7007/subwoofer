/**
 * Authentication API Tests
 *
 * Tests the authentication-related API functions that handle user
 * registration and login throughout the application.
 */

import { registerUser, loginUser } from "../../static/js/api/auth.js";
import * as apiHelper from "../../static/js/api/api-helper.js";

// Mock the API helper module
jest.mock("../../static/js/api/api-helper.js");

describe("Authentication API", () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe("registerUser", () => {
		test("calls fetchJson with correct parameters for user registration", async () => {
			const username = "testuser";
			const password = "testpass123";
			const timezone = "America/New_York";

			const mockResponse = {
				ok: true,
				status: 200,
				data: { success: true, message: "User created successfully" },
			};
			apiHelper.fetchJson.mockResolvedValue(mockResponse);

			const result = await registerUser(username, password, timezone);

			expect(apiHelper.fetchJson).toHaveBeenCalledWith("/register", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ username, password, timezone }),
			});
			expect(result).toEqual(mockResponse);
		});

		test("handles registration with minimal timezone", async () => {
			const username = "testuser2";
			const password = "password456";
			const timezone = "UTC";

			const mockResponse = {
				ok: true,
				status: 200,
				data: { success: true, user_id: 123 },
			};
			apiHelper.fetchJson.mockResolvedValue(mockResponse);

			const result = await registerUser(username, password, timezone);

			expect(apiHelper.fetchJson).toHaveBeenCalledWith("/register", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ username, password, timezone }),
			});
			expect(result).toEqual(mockResponse);
		});

		test("handles registration errors - duplicate username", async () => {
			const username = "existinguser";
			const password = "password123";
			const timezone = "UTC";

			const mockResponse = {
				ok: false,
				status: 400,
				data: {
					error: "user_exists",
					message: "Username already exists",
				},
			};
			apiHelper.fetchJson.mockResolvedValue(mockResponse);

			const result = await registerUser(username, password, timezone);

			expect(result).toEqual(mockResponse);
			expect(result.ok).toBe(false);
		});

		test("handles registration errors - invalid password", async () => {
			const username = "newuser";
			const password = "123"; // Too short
			const timezone = "UTC";

			const mockResponse = {
				ok: false,
				status: 400,
				data: {
					error: "validation_failed",
					message: "Password must be at least 6 characters",
				},
			};
			apiHelper.fetchJson.mockResolvedValue(mockResponse);

			const result = await registerUser(username, password, timezone);

			expect(result).toEqual(mockResponse);
		});

		test("handles server errors during registration", async () => {
			const username = "testuser";
			const password = "testpass123";
			const timezone = "UTC";

			const mockResponse = {
				ok: false,
				status: 500,
				data: null,
				error: new Error("Database connection failed"),
			};
			apiHelper.fetchJson.mockResolvedValue(mockResponse);

			const result = await registerUser(username, password, timezone);

			expect(result).toEqual(mockResponse);
		});

		test("handles empty credentials", async () => {
			const mockResponse = {
				ok: false,
				status: 400,
				data: { error: "missing_credentials" },
			};
			apiHelper.fetchJson.mockResolvedValue(mockResponse);

			const result = await registerUser("", "", "");

			expect(apiHelper.fetchJson).toHaveBeenCalledWith("/register", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ username: "", password: "", timezone: "" }),
			});
			expect(result).toEqual(mockResponse);
		});
	});

	describe("loginUser", () => {
		test("calls fetchJson with correct parameters for user login", async () => {
			const username = "testuser";
			const password = "testpass123";

			const mockResponse = {
				ok: true,
				status: 200,
				data: {
					success: true,
					message: "Login successful",
					user: { id: 1, username: "testuser", timezone: "UTC" },
				},
			};
			apiHelper.fetchJson.mockResolvedValue(mockResponse);

			const result = await loginUser(username, password);

			expect(apiHelper.fetchJson).toHaveBeenCalledWith("/login", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ username, password }),
			});
			expect(result).toEqual(mockResponse);
		});

		test("handles login with case-sensitive username", async () => {
			const username = "TestUser";
			const password = "password123";

			const mockResponse = {
				ok: true,
				status: 200,
				data: { success: true, user_id: 2 },
			};
			apiHelper.fetchJson.mockResolvedValue(mockResponse);

			const result = await loginUser(username, password);

			expect(apiHelper.fetchJson).toHaveBeenCalledWith("/login", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ username, password }),
			});
			expect(result).toEqual(mockResponse);
		});

		test("handles invalid credentials", async () => {
			const username = "testuser";
			const password = "wrongpassword";

			const mockResponse = {
				ok: false,
				status: 401,
				data: {
					error: "invalid_credentials",
					message: "Invalid username or password",
				},
			};
			apiHelper.fetchJson.mockResolvedValue(mockResponse);

			const result = await loginUser(username, password);

			expect(result).toEqual(mockResponse);
			expect(result.ok).toBe(false);
		});

		test("handles missing username", async () => {
			const username = "";
			const password = "testpass123";

			const mockResponse = {
				ok: false,
				status: 400,
				data: {
					error: "missing_username",
					message: "Username is required",
				},
			};
			apiHelper.fetchJson.mockResolvedValue(mockResponse);

			const result = await loginUser(username, password);

			expect(result).toEqual(mockResponse);
		});

		test("handles missing password", async () => {
			const username = "testuser";
			const password = "";

			const mockResponse = {
				ok: false,
				status: 400,
				data: {
					error: "missing_password",
					message: "Password is required",
				},
			};
			apiHelper.fetchJson.mockResolvedValue(mockResponse);

			const result = await loginUser(username, password);

			expect(result).toEqual(mockResponse);
		});

		test("handles non-existent user", async () => {
			const username = "nonexistentuser";
			const password = "password123";

			const mockResponse = {
				ok: false,
				status: 401,
				data: {
					error: "user_not_found",
					message: "User not found",
				},
			};
			apiHelper.fetchJson.mockResolvedValue(mockResponse);

			const result = await loginUser(username, password);

			expect(result).toEqual(mockResponse);
		});

		test("handles server errors during login", async () => {
			const username = "testuser";
			const password = "testpass123";

			const mockResponse = {
				ok: false,
				status: 500,
				data: null,
				error: new Error("Authentication service unavailable"),
			};
			apiHelper.fetchJson.mockResolvedValue(mockResponse);

			const result = await loginUser(username, password);

			expect(result).toEqual(mockResponse);
		});

		test("handles special characters in credentials", async () => {
			const username = "user@domain.com";
			const password = "p@ssw0rd!#$";

			const mockResponse = {
				ok: true,
				status: 200,
				data: { success: true, user_id: 3 },
			};
			apiHelper.fetchJson.mockResolvedValue(mockResponse);

			const result = await loginUser(username, password);

			expect(apiHelper.fetchJson).toHaveBeenCalledWith("/login", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ username, password }),
			});
			expect(result).toEqual(mockResponse);
		});
	});

	describe("Integration Tests", () => {
		test("authentication functions return promises", () => {
			apiHelper.fetchJson.mockResolvedValue({ ok: true, data: {} });

			expect(registerUser("user", "pass", "UTC")).toBeInstanceOf(Promise);
			expect(loginUser("user", "pass")).toBeInstanceOf(Promise);
		});

		test("functions handle concurrent authentication attempts", async () => {
			apiHelper.fetchJson.mockResolvedValue({
				ok: true,
				data: { success: true },
			});

			const promises = [
				loginUser("user1", "pass1"),
				loginUser("user2", "pass2"),
				registerUser("newuser", "newpass", "UTC"),
			];

			const results = await Promise.all(promises);

			expect(results).toHaveLength(3);
			expect(apiHelper.fetchJson).toHaveBeenCalledTimes(3);
		});

		test("handles mixed success and failure responses", async () => {
			// Mock different responses for each call
			apiHelper.fetchJson
				.mockResolvedValueOnce({ ok: true, data: { success: true } })
				.mockResolvedValueOnce({
					ok: false,
					status: 401,
					data: { error: "invalid_credentials" },
				})
				.mockResolvedValueOnce({ ok: true, data: { success: true } });

			const results = await Promise.all([
				loginUser("validuser", "validpass"),
				loginUser("invaliduser", "wrongpass"),
				registerUser("newuser", "newpass", "UTC"),
			]);

			expect(results[0].ok).toBe(true);
			expect(results[1].ok).toBe(false);
			expect(results[2].ok).toBe(true);
		});
	});
});
