import { registerUser } from "../api/auth.js";

export async function handleSignupSubmit() {
	const username = document.getElementById("signupUsername").value.trim();
	const password = document.getElementById("signupPassword").value;
	const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
	try {
		// register user via API
		const { ok, status, data } = await registerUser(
			username,
			password,
			timezone
		);
		if (ok) {
			if (data.redirect) window.location.href = data.redirect;
			else console.log("signup success:", data.message);
		} else {
			if (status === 409) alert("username already exists! try another one.");
			else alert(data.message || "signup failed.");
		}
	} catch {
		alert("network error or server issue.");
	}
}
