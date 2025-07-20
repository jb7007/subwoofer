// js/components/time-format.js

export function renderAsTxt(
	htmlId,
	minuteTime,
	numeric = false,
	hasAffix = false
) {
	const el = document.getElementById(htmlId);
	if (!el) return;

	if (minuteTime === 0) {
		if (numeric) {
			el.innerHTML = `<em>0 minutes</em>`;
		} else {
			const target = hasAffix ? el.parentElement : el;
			if (target) target.innerHTML = `<em>Nothing logged yet.</em>`;
		}
	} else if (minuteTime < 60) {
		el.innerHTML = `<em>${minuteTime} minute${
			minuteTime === 1 ? "" : "s"
		}</em>`;
	} else {
		const hours = Math.floor(minuteTime / 60);
		const minutes = minuteTime % 60;
		const hourText = `${hours} hour${hours === 1 ? "" : "s"}`;
		const minuteText =
			minutes > 0 ? ` and ${minutes} minute${minutes === 1 ? "" : "s"}` : "";
		el.innerHTML = `<em>${hourText + minuteText}</em>`;
	}
}

export function renderTxtShort(htmlId, minuteTime) {
	const el = document.getElementById(htmlId);
	if (!el) return;

	if (minuteTime < 60) {
		el.innerHTML = `<em>${minuteTime} min${minuteTime === 1 ? "" : "s"}</em>`;
	} else {
		const hours = Math.floor(minuteTime / 60);
		const minutes = minuteTime % 60;
		const hourText = `${hours} hr${hours === 1 ? "" : "s"}`;
		const minuteText =
			minutes > 0 ? ` ${minutes} min${minutes === 1 ? "" : "s"}` : "";
		el.innerHTML = `<em>${hourText + minuteText}</em>`;
	}
}
