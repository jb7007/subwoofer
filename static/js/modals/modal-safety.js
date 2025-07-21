import { closeModal } from "./modal-helper.js";
import { logAnimateModalOut } from "../../js/animation/modal.js";
import { resetPieceComposerFields } from "../forms/log-form.js";

export function closeLogModal() {
	const modalEl = document.getElementById("logModal");
	if (!modalEl) return;

	if (logAnimateModalOut) {
		resetPieceComposerFields();
		logAnimateModalOut();
	} else {
		closeModal(modalEl);
	}
}
