// js/components/log-table.js

import { instrumentMap, reverseInstrumentMap } from "../utils/index.js";
import { instrumentHTML } from "./instrument-dropdown.js";
import { editLog } from "../api/logs.js";
import { handleLogEdit } from "../forms/index.js";

export function renderLogs(logs) {
	const tableBody = document.getElementById("log-table-body");
	if (!tableBody) return;

	tableBody.innerHTML = ""; // Clear current rows

	logs.forEach((log) => {
		const row = document.createElement("tr");
		row.dataset.logId = log.id;
		row.style.position = "relative"; // Enable positioning for floating button
		console.log("Rendering log:", log);

		row.innerHTML = `
            <td data-label="id">${log.id}</td>
            <td data-label="date">${log.local_date}</td>
            <td data-label="duration">${log.duration}</td>
            <td data-label="instrument">${
							instrumentMap[log.instrument] || log.instrument
						}</td>
            <td data-label="piece">${log.piece}</td>
            <td data-label="composer">${log.composer || "N/A"}</td>
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

function injectEditableFields(cellElements, values, logId) {
	cellElements[
		"id"
	].innerHTML = `<button class="cancel-btn" data-log-id="${logId}" title="Edit log">Cancel</button>`;
	cellElements[
		"date"
	].innerHTML = `<button class="submit-btn" data-log-id="${logId}" title="Edit log">Save</button>`;
	cellElements[
		"duration"
	].innerHTML = `<input type="text" id="edit-log${logId}-duration" value="${values["duration"]}" />`;
	cellElements["instrument"].innerHTML = instrumentHTML;
	cellElements["instrument"].querySelector("select").value =
		reverseInstrumentMap[values["instrument"]];
	cellElements[
		"notes"
	].innerHTML = `<input type="text" id="edit-log${logId}-notes" value="${values["notes"]}" />`;
}

function buildEditedData(row, logId, values) {
	let raw = row.querySelector(`#edit-log${logId}-duration`)?.value?.trim();
	let newDuration;

	if (raw === "" || raw === undefined) {
		newDuration = values["duration"];
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
		notes:
			row.querySelector(`#edit-log${logId}-notes`)?.value || values["notes"],
	};
}

function resetLogRow(row, values) {
	const cellElements = getCellData(row).cellElements;
	row.querySelector(".cancel-btn").remove();
	row.querySelector(".submit-btn").remove();
	Object.keys(values).forEach((key) => {
		if (cellElements[key]) {
			cellElements[key].textContent = values[key];
		}
	});
	console.log("Row reset to original state for log ID:", row.dataset.logId);
}

export function setupEditLogRow(row_id) {
	const row = document.querySelector(`tr[data-log-id="${row_id}"]`);
	if (!row) return console.error(`Row with ID ${row_id} not found`);

	const logId = row.dataset.logId;
	if (!logId) return console.error(`Log ID not found for row ${row_id}`);

	const { values, cellElements } = getCellData(row);
	injectEditableFields(cellElements, values, logId);

	const logTable = document.getElementById("log-table-body");
	logTable.addEventListener("click", async (e) => {
		if (e.target.matches(".submit-btn")) {
			e.preventDefault();
			e.stopPropagation();
			const editedData = buildEditedData(row, logId, values);
			await handleLogEdit(editedData, logId);
		}

		if (e.target.matches(".cancel-btn")) {
			e.preventDefault();
			e.stopPropagation();
			console.log("Cancel button clicked for log ID:", logId);
			// Reset the row to its original state
			resetLogRow(row, values);
		}
	});
}
