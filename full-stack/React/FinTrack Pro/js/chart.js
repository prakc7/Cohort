(() => {
	let activeChart = null;

	function buildSeries(transactions, preferredCurrency, rates) {
		const groupedByDate = new Map();

		transactions.forEach((transaction) => {
			const current = groupedByDate.get(transaction.date) || { income: 0, expense: 0 };
			const amountInPreferredCurrency = window.FinTrackCurrency.convertUsdToCurrency(transaction.amountUsd, preferredCurrency, rates);

			if (transaction.type === "income") {
				current.income += amountInPreferredCurrency;
			}
			else {
				current.expense += amountInPreferredCurrency;
			}

			groupedByDate.set(transaction.date, current);
		});

		const labels = Array.from(groupedByDate.keys()).sort();

		return {
			labels,
			income: labels.map((label) => groupedByDate.get(label)?.income || 0),
			expense: labels.map((label) => groupedByDate.get(label)?.expense || 0)
		};
	}

	function renderCashFlowChart(canvas, transactions, preferredCurrency, rates) {
		if (!canvas || typeof Chart === "undefined") {
			return;
		}

		if (activeChart) {
			activeChart.destroy();
		}

		const series = buildSeries(transactions, preferredCurrency, rates);

		activeChart = new Chart(canvas, {
			type: "bar",
			data: {
				labels: series.labels.length ? series.labels : ["No transactions yet"],
				datasets: [
					{
						label: "Income",
						data: series.labels.length ? series.income : [0],
						backgroundColor: "rgba(22, 163, 74, 0.8)"
					},
					{
						label: "Expense",
						data: series.labels.length ? series.expense : [0],
						backgroundColor: "rgba(220, 38, 38, 0.8)"
					}
				]
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				plugins: { legend: { position: "top" } },
				scales: {
					x: { grid: { display: false } },
					y: { beginAtZero: true }
				}
			}
		});

		return activeChart;
	}

	window.FinTrackChart = { renderCashFlowChart };
})();
// Chart utilities
