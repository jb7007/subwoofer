import { fetchJson } from "./api-helper.js";

// sends a new user's credentials to the backend
export const registerUser = (username, password, timezone) =>
	fetchJson("/register", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ username, password, timezone }),
	});

export const loginUser = (username, password) =>
	fetchJson("/login", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ username, password }),
	});
