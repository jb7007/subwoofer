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
		const row = document.createElement("tr"); // current row to render

		row.dataset.logId = log.id; // store log id for editing
		row.dataset.rawDuration = log.duration; // store the raw duration for editing

		row.style.position = "relative"; // enable positioning for floating button

		if (log.piece !== "Unlisted") {
			// if piece is not "Unlisted", italicize it
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
			}" title="Edit this log">✏️</button>
        `;

		tableBody.appendChild(row);
	});

	document.querySelectorAll(".floating-edit-btn").forEach((btn) => {
		btn.addEventListener("click", (e) => {
			e.stopPropagation();
			const logId = btn.closest("tr").dataset.logId; // store log id from the button
			setupEditLogRow(logId);
		});
	});
}

function getCellData(row) {
	const values = {}; // to store cell values
	const cellElements = {}; // to store cell elements for later use

	row.querySelectorAll("td").forEach((cell) => {
		const label = cell.dataset.label; // i.e. "id", "date", "duration", etc. from data-label attribute
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
	// rebind the edit button to the row after revealing (from hidden state)
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
	// setup the editable fields in the table cells
	cellElements[
		"id" // now becomes a delete button
	].innerHTML = `<button class="delete-btn" data-log-id="${logId}" title="Delete log">Delete</button>`;

	cellElements[
		"date" // now has cancel and save buttons
	].innerHTML = `<button class="cancel-btn" data-log-id="${logId}" title="Cancel edit">Cancel</button>
	<button class="submit-btn" data-log-id="${logId}" title="Save edit">Save</button>`;

	cellElements[
		"duration" // now has an input field for editing duration, with the previous duration as default
	].innerHTML = `<input type="text" id="edit-log${logId}-duration" value="${rawDuration}" placeholder="Enter mins: (${rawDuration})" />`;

	cellElements["instrument"].innerHTML = instrumentHTML; // inject the instrument dropdown
	cellElements["instrument"].querySelector("select").value =
		reverseInstrumentMap[values["instrument"]]; // set the select value to the instrument from the log
	cellElements[
		"notes" // now has an input field for editing notes, with the previous notes as default
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
			newDuration = 1; // set to minimum 1 minute if invalid
			alert("Minimum required minutes for practicing is 1!");
		}
		if (newDuration > 1440) {
			newDuration = 1440; // cap the maximum duration to 1440 minutes (24 hours)
			alert("Maximum allowed minutes for practicing is 1440!");
		}
	}

	return {
		id: logId, // log ID to edit
		duration: newDuration, // new duration in minutes
		instrument:
			row.querySelector(".instrument-map")?.value ||
			reverseInstrumentMap[values["instrument"]],
		notes: row.querySelector(`#edit-log${logId}-notes`)?.value,
	};
}

export function setupEditLogRow(row_id) {
	hideAllEditButtons(); // hide all edit buttons to prevent multiple edits at once
	const row = document.querySelector(`tr[data-log-id="${row_id}"]`); // find the row with the given ID
	if (!row) return console.error(`Row with ID ${row_id} not found`);

	const logId = row.dataset.logId;
	if (!logId) return console.error(`Log ID not found for row ${row_id}`);

	const originalHTML = row.innerHTML; // store the original HTML to reset later

	const { values, cellElements } = getCellData(row);
	const rawDuration = getRawDurationFromRow(row); // store the raw duration for editing
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
			// reset the row to its original state
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
		// only handle key events if we're focused on an input within the current row
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
			// require ctrl+delete to prevent accidental deletion
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
		showAllEditButtons(); // show all edit buttons again
		const logTable = document.getElementById("log-table-body");
		logTable.removeEventListener("click", handleTableClick); // remove the click event listener
		document.removeEventListener("keydown", handleKeyDown); // remove the keydown event listener
	};

	const logTable = document.getElementById("log-table-body");
	logTable.addEventListener("click", handleTableClick); // add the click event listener
	document.addEventListener("keydown", handleKeyDown); // add the keydown event listener
}
