(() => {
	const TRANSACTION_FILTERS = {
		all: "all",
		income: "income",
		expense: "expense"
	};

	function createTransactionId() {
		return `${Date.now()}-${Math.floor(Math.random() * 100000)}`;
	}

	function getTransactionsForUser(userId) {
		return window.FinTrackStore.getTransactions(userId).sort((left, right) => {
			return new Date(right.date).getTime() - new Date(left.date).getTime();
		});
	}

	function addTransaction(userId, transaction, rates) {
		const transactions = window.FinTrackStore.getTransactions(userId);
		const normalizedTransaction = {
			id: createTransactionId(),
			userId,
			type: transaction.type,
			description: transaction.description.trim(),
			amount: Number(transaction.amount),
			currency: transaction.currency,
			amountUsd: window.FinTrackCurrency.convertCurrencyToUsd(Number(transaction.amount), transaction.currency, rates),
			date: transaction.date,
			category: transaction.category,
			createdAt: new Date().toISOString()
		};

		transactions.push(normalizedTransaction);
		window.FinTrackStore.saveTransactions(userId, transactions);
		return normalizedTransaction;
	}

	function deleteTransaction(userId, transactionId) {
		const transactions = window.FinTrackStore.getTransactions(userId).filter((transaction) => transaction.id !== transactionId);
		window.FinTrackStore.saveTransactions(userId, transactions);
		return transactions;
	}

	function calculateSummary(transactions, preferredCurrency, rates) {
		const summary = transactions.reduce((result, transaction) => {
			const amountInPreferredCurrency = window.FinTrackCurrency.convertUsdToCurrency(transaction.amountUsd, preferredCurrency, rates);

			if (transaction.type === "income") {
				result.income += amountInPreferredCurrency;
			}
			else {
				result.expense += amountInPreferredCurrency;
			}

			return result;
		}, { income: 0, expense: 0 });

		summary.balance = summary.income - summary.expense;
		summary.totalTransactions = transactions.length;
		return summary;
	}

	function getFilteredTransactions(transactions, filterValue, searchTerm) {
		const normalizedSearch = searchTerm.trim().toLowerCase();

		return transactions.filter((transaction) => {
			const matchesType = filterValue === TRANSACTION_FILTERS.all || transaction.type === filterValue;
			const searchableText = [transaction.description, transaction.category, transaction.date, transaction.currency].join(" ").toLowerCase();
			const matchesSearch = normalizedSearch === "" || searchableText.includes(normalizedSearch);
			return matchesType && matchesSearch;
		});
	}

	function renderTransactionTable({ tbody, transactions, preferredCurrency, rates, filterValue, searchTerm, onDelete }) {
		const filteredTransactions = getFilteredTransactions(transactions, filterValue, searchTerm);
		tbody.innerHTML = "";

		if (filteredTransactions.length === 0) {
			const emptyRow = document.createElement("tr");
			emptyRow.className = "empty-row";
			emptyRow.innerHTML = '<td colspan="5">No transactions found.</td>';
			tbody.appendChild(emptyRow);
			return filteredTransactions;
		}

		filteredTransactions.forEach((transaction) => {
			const amountInPreferredCurrency = window.FinTrackCurrency.convertUsdToCurrency(transaction.amountUsd, preferredCurrency, rates);

			const row = document.createElement("tr");
			row.innerHTML = `
				<td>${transaction.date}</td>
				<td>
					<strong>${transaction.description}</strong>
					<div class="muted">${transaction.currency} entry</div>
				</td>
				<td>${transaction.category}</td>
				<td class="amount ${transaction.type}">
					${window.FinTrackCurrency.formatMoney(amountInPreferredCurrency, preferredCurrency)}
					<div class="muted">${window.FinTrackCurrency.formatMoney(transaction.amount, transaction.currency)}</div>
				</td>
				<td>
					<button class="icon-button danger" type="button" data-delete-id="${transaction.id}">Delete</button>
				</td>
			`;

			tbody.appendChild(row);
		});

		tbody.querySelectorAll("[data-delete-id]").forEach((button) => {
			button.addEventListener("click", () => onDelete(button.dataset.deleteId));
		});

		return filteredTransactions;
	}

	function renderCards(summary, elements, preferredCurrency) {
		elements.balance.textContent = window.FinTrackCurrency.formatMoney(summary.balance, preferredCurrency);
		elements.income.textContent = window.FinTrackCurrency.formatMoney(summary.income, preferredCurrency);
		elements.expense.textContent = window.FinTrackCurrency.formatMoney(summary.expense, preferredCurrency);
		elements.totalTransactions.textContent = String(summary.totalTransactions);
	}

	window.FinTrackTransactions = {
		TRANSACTION_FILTERS,
		addTransaction,
		deleteTransaction,
		calculateSummary,
		getTransactionsForUser,
		renderTransactionTable,
		renderCards
	};
})();
// Transaction logic
