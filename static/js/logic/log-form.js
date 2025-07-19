export function extractPieceAndComposer() {
	// get HTML dropdown value for the piece
	const dropdownValue = document.getElementById("pieceDropdown").value;

	// gets user-typed piece title and composer (if included) and trims inputs
	const manualTitle = document.getElementById("piece")?.value.trim();
	const manualComposer = document.getElementById("composerInput")?.value.trim();

	// piece title and composer info to be sent to backend, we'll clean them up later
	let pieceTitle,
		composer = null;

	if (dropdownValue) {
		// if user selects a pre-selected piece, use the saved piece from the dropdown
		const [title, comp] = dropdownValue.split(":::");
		// sets pieceTitle and composer to clean values for backend to use
		pieceTitle = title?.trim();
		composer = comp?.trim();
	} else if (manualTitle) {
		// use the manually typed piece
		pieceTitle = manualTitle;
		composer = manualComposer || "Unknown";
	} else {
		// No piece info given
		pieceTitle = null;
		composer = null;
	}

	return { pieceTitle, composer };
}
