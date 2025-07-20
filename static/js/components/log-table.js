import { instrumentMap } from "../instrument-map.js";

export function renderLogs(logs) {
	const tableBody = document.getElementById("log-table-body");
	if (!tableBody) return;

	tableBody.innerHTML = ""; // Clear current rows

	logs.forEach((log) => {
		const row = document.createElement("tr");

		row.innerHTML = `
            <td>${log.id}</td>
            <td>${log.display_date}</td>
            <td>${log.duration}</td>
            <td>${instrumentMap[log.instrument] || log.instrument}</td>
            <td>${log.piece}</td>
            <td>${log.composer || "N/A"}</td>
            <td>${log.notes}</td>
        `;

		tableBody.appendChild(row);
	});
}
