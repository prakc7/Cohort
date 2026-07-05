(() => {
	const CURRENCY_META = {
		USD: { symbol: "$", label: "US Dollar" },
		EUR: { symbol: "€", label: "Euro" },
		GBP: { symbol: "£", label: "British Pound" },
		INR: { symbol: "₹", label: "Indian Rupee" },
		JPY: { symbol: "¥", label: "Japanese Yen" }
	};

	function getCurrencySymbol(currencyCode) {
		return CURRENCY_META[currencyCode]?.symbol || currencyCode;
	}

	function formatMoney(amount, currencyCode) {
		return new Intl.NumberFormat(undefined, {
			style: "currency",
			currency: currencyCode,
			maximumFractionDigits: currencyCode === "JPY" ? 0 : 2
		}).format(amount || 0);
	}

	function convertUsdToCurrency(amountInUsd, currencyCode, rates) {
		const rate = rates?.[currencyCode] || 1;
		return amountInUsd * rate;
	}

	function convertCurrencyToUsd(amount, currencyCode, rates) {
		const rate = rates?.[currencyCode] || 1;
		return currencyCode === "USD" ? amount : amount / rate;
	}

	function getCurrencyLabel(currencyCode) {
		return CURRENCY_META[currencyCode]?.label || currencyCode;
	}

	window.FinTrackCurrency = {
		CURRENCY_META,
		getCurrencySymbol,
		getCurrencyLabel,
		formatMoney,
		convertUsdToCurrency,
		convertCurrencyToUsd
	};
})();
// Currency helpers
