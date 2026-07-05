(() => {
	function applyTheme(isDarkMode) {
		document.body.classList.toggle("dark-mode", Boolean(isDarkMode));
	}

	function populateSelect(selectElement, selectedValue, values) {
		selectElement.innerHTML = values.map((value) => `<option value="${value}">${value}</option>`).join("");
		selectElement.value = selectedValue;
	}

	window.FinTrackSettings = {
		applyTheme,
		populateSelect
	};
})();
// Settings logic
