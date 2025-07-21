import { handleSignupSubmit } from "../forms/signup-form.js";
import { handleLoginSubmit } from "../forms/login-form.js";
import { setupPieceInputToggle } from "../forms/log-form.js";
import {
	setUpEscapeToExit,
	setUpExitButton,
	setUpOpenButton,
	modalOverlayExit,
} from "./modal-helper.js";
import { handleLogSubmission } from "../logic/logs/logs.js";
import {
	signupAnimateModalIn,
	signupAnimateModalOut,
	loginAnimateModalIn,
	loginAnimateModalOut,
	logAnimateModalIn,
	logAnimateModalOut,
} from "../../js/animation/modal.js";

export function setupSignupForm() {
	const signupForm = document.getElementById("signupModalBox");
	if (!signupForm) return;

	signupForm.addEventListener("submit", async (e) => {
		e.preventDefault();
		await handleSignupSubmit();
	});
}

export function setupLoginForm() {
	const loginForm = document.getElementById("loginModalBox");
	if (!loginForm) return;

	loginForm.addEventListener("submit", async (e) => {
		e.preventDefault();
		await handleLoginSubmit();
	});
}

export function hiddenInputSetup(hiddenFields) {
	hiddenFields.forEach((fieldId) => {
		const field = document.getElementById(fieldId);
		if (field) {
			field.style.display = "none"; // Hide composer input
			field.disabled = true; // Disable composer input
			if (fieldId === "composerInput") {
				field.value = ""; // Clear composer input on close
			}
		}
	});
}

export function setupLogForm() {
	const logForm = document.getElementById("practiceModalBox");
	if (!logForm) return;

	setupPieceInputToggle();

	logForm.addEventListener("submit", async (e) => {
		e.preventDefault();
		await handleLogSubmission();
	});
}

export function setupModalListeners() {
	const modals = {
		signup: {
			openButtons: ["signUp", "navSignupButton"],
			closeButton: "signupCloseModal",
			cancelButton: null,
			modal: "signupModal",
			animateIn: signupAnimateModalIn,
			animateOut: signupAnimateModalOut,
			form: "signupModalBox",
			hiddenFields: null,
			populate: false,
		},
		login: {
			openButtons: ["loginButton"],
			closeButton: "loginCloseModal",
			cancelButton: null,
			modal: "loginModal",
			animateIn: loginAnimateModalIn,
			animateOut: loginAnimateModalOut,
			form: "loginModalBox",
			hiddenFields: null,
			populate: false,
		},
		log: {
			openButtons: ["openLogModal"],
			closeButton: "practiceCloseModal",
			cancelButton: "closePracticeLogModal",
			modal: "logModal",
			animateIn: logAnimateModalIn,
			animateOut: logAnimateModalOut,
			form: "practiceModalBox",
			hiddenFields: ["composerInput", "composerLabel"],
			populate: true,
		},
	};

	Object.values(modals).forEach(
		({
			openButtons,
			closeButton,
			cancelButton,
			modal,
			animateIn,
			animateOut,
			form,
			hiddenFields,
			populate,
		}) => {
			const modalEl = document.getElementById(modal);
			if (!modalEl) return;

			setUpEscapeToExit(modalEl, animateOut);

			openButtons.forEach((id) => {
				setUpOpenButton(modalEl, id, animateIn, hiddenFields, form, populate);
			});

			if (closeButton) setUpExitButton(modalEl, closeButton, animateOut);

			if (cancelButton) setUpExitButton(modalEl, cancelButton, animateOut);

			modalOverlayExit(modalEl, animateOut);
		}
	);
}
