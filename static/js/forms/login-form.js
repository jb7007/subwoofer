import { loginUser } from "../api/index.js";

export async function handleLoginSubmit() {
	const username = document.getElementById("loginUsername").value.trim();
	const password = document.getElementById("loginPassword").value;
	try {
		// login user via API
		const { ok, status, data } = await loginUser(username, password);
		console.log("login response:", { ok, status, data });
		if (ok) {
			if (data.redirect) window.location.href = data.redirect;
			else console.log("login success:", data.message);
		} else {
			if (status === 401) alert("invalid username or password.");
			else alert(data.message || "login failed.");
		}
	} catch {
		alert("network error or server issue.");
	}
}
