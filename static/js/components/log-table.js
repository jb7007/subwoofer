// js/components/log-table.js

import { instrumentMap, reverseInstrumentMap } from "../utils/index.js";
import { instrumentHTML } from "./instrument-dropdown.js";
import { handleLogDeletion, handleLogEdit } from "../forms/index.js";
import { renderTxtShort } from "./time-format.js";

export function renderLogs(logs) {
	const tableBody = document.getElementById("log-table-body");
	if (!tableBody) return;

	tableBody.innerHTML = ""; // Clear current rows

	logs.forEach((log) => {
		const row = document.createElement("tr");
		row.dataset.logId = log.id;
		row.dataset.rawDuration = log.duration; // Store the raw duration for editing
		row.style.position = "relative"; // Enable positioning for floating button
		console.log("Rendering log:", log);

		if (log.piece !== "Unlisted") {
			log.piece = `<span style="font-style: italic;">${log.piece}</span>`;
		}

		row.innerHTML = `
            <td data-label="id">${log.id}</td>
            <td data-label="date">${log.local_date}</td>
            <td data-label="duration">${renderTxtShort(
							undefined,
							log.duration,
							true
						)}</td>
            <td data-label="instrument">${
							instrumentMap[log.instrument] || log.instrument
						}</td>
            <td data-label="piece">${log.piece}</td>
            <td data-label="composer">${
							log.composer && log.composer.trim() !== "" ? log.composer : "N/A"
						}</td>
            <td data-label="notes">${log.notes}</td>
			<button class="floating-edit-btn" data-log-id="${
				log.id
			}" title="Edit log">✏️</button>
        `;

		tableBody.appendChild(row);
	});

	document.querySelectorAll(".floating-edit-btn").forEach((btn) => {
		btn.addEventListener("click", (e) => {
			e.stopPropagation();
			const logId = btn.closest("tr").dataset.logId;
			console.log("Edit button clicked for log ID:", logId);
			setupEditLogRow(logId);
		});
	});
}

function getCellData(row) {
	const values = {};
	const cellElements = {};

	row.querySelectorAll("td").forEach((cell) => {
		const label = cell.dataset.label;
		console.log("Processing cell:", cell, "with label:", label);
		if (label) {
			values[label] = cell.textContent.trim();
			cellElements[label] = cell;
		}
	});

	return { values, cellElements };
}

function getRawDurationFromRow(row) {
	return parseInt(row.dataset.rawDuration) || 0;
}

function rebindEditBtn(row, logId) {
	row.querySelector(".floating-edit-btn")?.addEventListener("click", (e) => {
		e.stopPropagation();
		setupEditLogRow(logId);
	});
}

function hideAllEditButtons() {
	document.querySelectorAll(".floating-edit-btn").forEach((btn) => {
		btn.style.display = "none";
	});
}

function showAllEditButtons() {
	document.querySelectorAll(".floating-edit-btn").forEach((btn) => {
		btn.style.display = "inline-block";
	});
}

function injectEditableFields(cellElements, values, logId, rawDuration) {
	cellElements[
		"id"
	].innerHTML = `<button class="delete-btn" data-log-id="${logId}" title="Edit log">Delete</button>`;
	cellElements[
		"date"
	].innerHTML = `<button class="cancel-btn" data-log-id="${logId}" title="Edit log">Cancel</button>
	<button class="submit-btn" data-log-id="${logId}" title="Edit log">Save</button>`;
	cellElements[
		"duration"
	].innerHTML = `<input type="text" id="edit-log${logId}-duration" value="${rawDuration}" placeholder="Enter mins: (${rawDuration})" />`;
	cellElements["instrument"].innerHTML = instrumentHTML;
	cellElements["instrument"].querySelector("select").value =
		reverseInstrumentMap[values["instrument"]];
	cellElements[
		"notes"
	].innerHTML = `<input type="text" id="edit-log${logId}-notes" value="${values["notes"]}" />`;
}

function buildEditedData(row, logId, values, rawDuration) {
	let raw = row.querySelector(`#edit-log${logId}-duration`)?.value?.trim();
	let newDuration;

	if (raw === "" || raw === undefined) {
		// if input is empty, keep the original duration unchanged
		newDuration = rawDuration;
	} else {
		newDuration = parseInt(raw);
		if (newDuration <= 0 || isNaN(newDuration)) {
			newDuration = 1;
			alert("Minimum required minutes for practicing is 1!");
		}
		if (newDuration > 1440) {
			newDuration = 1440;
			alert("Maximum allowed minutes for practicing is 1440!");
		}
	}

	return {
		id: logId,
		duration: newDuration,
		instrument:
			row.querySelector(".instrument-map")?.value ||
			reverseInstrumentMap[values["instrument"]],
		notes: row.querySelector(`#edit-log${logId}-notes`)?.value,
	};
}

export function setupEditLogRow(row_id) {
	hideAllEditButtons();
	const row = document.querySelector(`tr[data-log-id="${row_id}"]`);
	if (!row) return console.error(`Row with ID ${row_id} not found`);

	const logId = row.dataset.logId;
	if (!logId) return console.error(`Log ID not found for row ${row_id}`);

	const originalHTML = row.innerHTML;

	const { values, cellElements } = getCellData(row);
	const rawDuration = getRawDurationFromRow(row);
	injectEditableFields(cellElements, values, logId, rawDuration);

	// named functions for the event handlers to remove later
	const handleTableClick = async (e) => {
		// only handle clicks for the current row being edited
		if (!e.target.closest(`tr[data-log-id="${logId}"]`)) return;

		if (e.target.matches(".submit-btn")) {
			e.preventDefault();
			e.stopPropagation();
			const editedData = buildEditedData(row, logId, values, rawDuration);
			await handleLogEdit(editedData, logId);
			cleanup();
		}

		if (e.target.matches(".cancel-btn")) {
			e.preventDefault();
			e.stopPropagation();
			// Reset the row to its original state
			row.innerHTML = originalHTML;
			rebindEditBtn(row, logId);
			cleanup();
		}

		if (e.target.matches(".delete-btn")) {
			e.preventDefault();
			e.stopPropagation();
			const proceed = window.confirm(
				`Are you sure you want to delete log ${logId}? This is IRREVERSIBLE!`
			);

			if (proceed) {
				await handleLogDeletion(logId);
			} else {
				row.innerHTML = originalHTML;
				rebindEditBtn(row, logId);
			}
			cleanup();
		}
	};

	const handleKeyDown = async (e) => {
		// Only handle key events if we're focused on an input within the current row
		const activeElement = document.activeElement;
		const isInCurrentRow =
			activeElement && activeElement.closest(`tr[data-log-id="${logId}"]`);
		if (!isInCurrentRow) return;

		if (e.key === "Escape") {
			e.preventDefault();
			e.stopPropagation();
			// reset the row to its original state
			row.innerHTML = originalHTML;
			rebindEditBtn(row, logId);
			cleanup();
		}

		if (e.key === "Enter") {
			e.preventDefault();
			e.stopPropagation();
			const editedData = buildEditedData(row, logId, values, rawDuration);
			await handleLogEdit(editedData, logId);
			cleanup();
		}

		if (e.key === "Delete" && e.ctrlKey) {
			// require Ctrl+Delete to prevent accidental deletion
			e.preventDefault();
			e.stopPropagation();
			const proceed = window.confirm(
				`Are you sure you want to delete log ${logId}? This is IRREVERSIBLE!`
			);

			if (proceed) {
				await handleLogDeletion(logId);
			} else {
				row.innerHTML = originalHTML;
				rebindEditBtn(row, logId);
			}
			cleanup();
		}
	};

	const cleanup = () => {
		showAllEditButtons();
		const logTable = document.getElementById("log-table-body");
		logTable.removeEventListener("click", handleTableClick);
		document.removeEventListener("keydown", handleKeyDown);
	};

	const logTable = document.getElementById("log-table-body");
	logTable.addEventListener("click", handleTableClick);
	document.addEventListener("keydown", handleKeyDown);
}
