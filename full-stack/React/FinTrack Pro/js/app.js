(() => {
	const body = document.body;
	const page = body.dataset.page;

	function requireSession() {
		const currentUser = window.FinTrackStore.getCurrentUser();

		if (!currentUser) {
			window.location.href = "login.html";
			return null;
		}

		return currentUser;
	}

	function applySavedTheme(userId) {
		const preferences = window.FinTrackStore.getPreferences(userId);
		window.FinTrackSettings.applyTheme(preferences.darkMode);
		return preferences;
	}

	async function initDashboard() {
		const currentUser = requireSession();

		if (!currentUser) {
			return;
		}

		const preferredCurrency = currentUser.currency || window.FinTrackStore.DEFAULT_CURRENCY;
		const rates = await window.FinTrackApi.ensureExchangeRates();
		const preferences = applySavedTheme(currentUser.userId);

		window.FinTrackStore.ensureDefaultPreferences(currentUser);

		const modal = document.getElementById("transactionModal");
		const form = document.getElementById("transactionForm");
		const errorBox = document.getElementById("transactionError");
		const tbody = document.getElementById("transactionTableBody");
		const balanceEl = document.getElementById("currentBalance");
		const incomeEl = document.getElementById("totalIncome");
		const expenseEl = document.getElementById("totalExpense");
		const totalTransactionsEl = document.getElementById("totalTransactions");
		const searchInput = document.getElementById("transactionSearch");
		const filterButtons = document.querySelectorAll("[data-filter]");
		const chartCanvas = document.getElementById("cashFlowChart");
		const addButton = document.getElementById("addTransactionButton");
		const closeButton = document.getElementById("closeTransactionModalButton");
		const logoutButton = document.getElementById("logoutButton");
		const darkModeToggle = document.getElementById("darkModeToggle");
		const resetButton = document.getElementById("resetAllDataButton");
		const userGreeting = document.getElementById("userGreeting");
		const exchangeRateStamp = document.getElementById("exchangeRateStamp");
		const transactionCurrency = document.getElementById("transactionCurrency");
		const transactionCategory = document.getElementById("transactionCategory");
		const transactionDate = document.getElementById("transactionDate");

		let activeFilter = window.FinTrackTransactions.TRANSACTION_FILTERS.all;
		const state = {
			transactions: window.FinTrackTransactions.getTransactionsForUser(currentUser.userId)
		};

		function setError(message) {
			if (!errorBox) return;
			errorBox.textContent = message;
		}

		function clearError() {
			setError("");
		}

		function openModal() {
			modal.classList.add("open");
			modal.setAttribute("aria-hidden", "false");
			clearError();
		}

		function closeModal() {
			modal.classList.remove("open");
			modal.setAttribute("aria-hidden", "true");
			form.reset();
			transactionDate.valueAsDate = new Date();
			transactionCurrency.value = preferredCurrency;
			transactionCategory.value = window.FinTrackStore.CATEGORY_OPTIONS[0];
		}

		function refreshDashboard() {
			state.transactions = window.FinTrackTransactions.getTransactionsForUser(currentUser.userId);
			const summary = window.FinTrackTransactions.calculateSummary(state.transactions, preferredCurrency, rates.rates);

			window.FinTrackTransactions.renderCards(summary, {
				balance: balanceEl,
				income: incomeEl,
				expense: expenseEl,
				totalTransactions: totalTransactionsEl
			}, preferredCurrency);

			window.FinTrackTransactions.renderTransactionTable({
				tbody,
				transactions: state.transactions,
				preferredCurrency,
				rates: rates.rates,
				filterValue: activeFilter,
				searchTerm: searchInput.value,
				onDelete: handleDeleteTransaction
			});

			window.FinTrackChart.renderCashFlowChart(chartCanvas, state.transactions, preferredCurrency, rates.rates);

			if (exchangeRateStamp) {
				exchangeRateStamp.textContent = `Rates last updated ${rates.updatedAt ? new Date(rates.updatedAt).toLocaleString() : "recently"}`;
			}
		}

		function handleDeleteTransaction(transactionId) {
			window.FinTrackTransactions.deleteTransaction(currentUser.userId, transactionId);
			refreshDashboard();
		}

		function initializeFilters() {
			filterButtons.forEach((button) => {
				button.addEventListener("click", () => {
					filterButtons.forEach((entry) => entry.classList.remove("active"));
					button.classList.add("active");
					activeFilter = button.dataset.filter;
					refreshDashboard();
				});
			});
		}

		function initializeModal() {
			addButton.addEventListener("click", openModal);
			closeButton.addEventListener("click", closeModal);
			modal.querySelector("[data-close-modal]").addEventListener("click", closeModal);

			form.addEventListener("submit", (event) => {
				event.preventDefault();
				clearError();

				const payload = {
					type: document.getElementById("transactionType").value,
					description: document.getElementById("transactionDescription").value,
					amount: document.getElementById("transactionAmount").value,
					currency: transactionCurrency.value,
					date: transactionDate.value,
					category: transactionCategory.value
				};

				if (!payload.description.trim()) return setError("Description is required.");
				if (!payload.amount || Number(payload.amount) <= 0) return setError("Amount must be greater than zero.");
				if (!payload.date) return setError("Date is required.");
				if (!payload.category) return setError("Category is required.");

				window.FinTrackTransactions.addTransaction(currentUser.userId, payload, rates.rates);
				closeModal();
				refreshDashboard();
			});

			document.addEventListener("keydown", (event) => {
				if (event.key === "Escape" && modal.classList.contains("open")) {
					closeModal();
				}
			});
		}

		function initializePreferences() {
			darkModeToggle.checked = preferences.darkMode;
			darkModeToggle.addEventListener("change", () => {
				window.FinTrackStore.savePreferences(currentUser.userId, {
					...window.FinTrackStore.getPreferences(currentUser.userId),
					darkMode: darkModeToggle.checked,
					fullName: currentUser.name,
					currency: preferredCurrency
				});
				window.FinTrackSettings.applyTheme(darkModeToggle.checked);
			});
		}

		transactionCurrency.innerHTML = window.FinTrackStore.CURRENCY_OPTIONS.map((code) => `<option value="${code}">${code}</option>`).join("");
		transactionCurrency.value = preferredCurrency;
		transactionCategory.innerHTML = window.FinTrackStore.CATEGORY_OPTIONS.map((category) => `<option value="${category}">${category}</option>`).join("");
		transactionCategory.value = window.FinTrackStore.CATEGORY_OPTIONS[0];
		transactionDate.valueAsDate = new Date();
		userGreeting.textContent = currentUser.name;

		initializeFilters();
		initializeModal();
		initializePreferences();

		searchInput.addEventListener("input", refreshDashboard);
		logoutButton.addEventListener("click", () => {
			window.FinTrackStore.removeCurrentUser();
			window.location.href = "login.html";
		});

		resetButton.addEventListener("click", () => {
			const confirmed = window.confirm("Reset all stored data for this browser?");

			if (!confirmed) {
				return;
			}

			window.FinTrackStore.resetAllData();
			window.location.href = "index.html";
		});

		refreshDashboard();
	}

	async function initSettings() {
		const currentUser = requireSession();

		if (!currentUser) {
			return;
		}

		const preferences = applySavedTheme(currentUser.userId);
		const rates = await window.FinTrackApi.ensureExchangeRates();

		const form = document.getElementById("settingsForm");
		const nameInput = document.getElementById("profileName");
		const currencySelect = document.getElementById("profileCurrency");
		const darkModeToggle = document.getElementById("settingsDarkMode");
		const message = document.getElementById("settingsMessage");
		const logoutButton = document.getElementById("logoutButton");
		const resetButton = document.getElementById("resetAllDataButton");

		window.FinTrackSettings.populateSelect(currencySelect, preferences.currency || currentUser.currency || window.FinTrackStore.DEFAULT_CURRENCY, window.FinTrackStore.CURRENCY_OPTIONS);
		nameInput.value = preferences.fullName || currentUser.name || "";
		darkModeToggle.checked = preferences.darkMode;

		darkModeToggle.addEventListener("change", () => {
			window.FinTrackSettings.applyTheme(darkModeToggle.checked);
		});

		form.addEventListener("submit", (event) => {
			event.preventDefault();

			const updatedName = nameInput.value.trim();
			const updatedCurrency = currencySelect.value;
			const nextPreferences = {
				...preferences,
				fullName: updatedName,
				currency: updatedCurrency,
				darkMode: darkModeToggle.checked
			};

			window.FinTrackStore.savePreferences(currentUser.userId, nextPreferences);
			window.FinTrackStore.updateCurrentUser({
				name: updatedName,
				currency: updatedCurrency
			});

			message.textContent = "Settings saved successfully.";
			setTimeout(() => {
				message.textContent = "";
				window.location.href = "dashboard.html";
			}, 700);
		});

		logoutButton.addEventListener("click", () => {
			window.FinTrackStore.removeCurrentUser();
			window.location.href = "login.html";
		});

		resetButton.addEventListener("click", () => {
			if (!window.confirm("Reset all stored data for this browser?")) {
				return;
			}

			window.FinTrackStore.resetAllData();
			window.location.href = "index.html";
		});

		void rates;
	}

	if (page === "dashboard") {
		initDashboard();
	}
	else if (page === "settings") {
		initSettings();
	}
})();
// App bootstrap
