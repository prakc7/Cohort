(() => {
	const RATE_ENDPOINT = "https://open.er-api.com/v6/latest/USD";

	async function fetchExchangeRates() {
		const response = await fetch(RATE_ENDPOINT, { cache: "no-store" });

		if (!response.ok) {
			throw new Error("Unable to load exchange rates.");
		}

		const payload = await response.json();

		if (payload.result !== "success" || !payload.rates) {
			throw new Error("Exchange-rate API returned an unexpected payload.");
		}

		const cache = {
			base: payload.base_code || "USD",
			rates: payload.rates,
			updatedAt: new Date().toISOString()
		};

		window.FinTrackStore.saveRatesCache(cache);
		return cache;
	}

	async function ensureExchangeRates() {
		const cache = window.FinTrackStore.getRatesCache();

		if (cache && cache.rates && Object.keys(cache.rates).length > 1) {
			return cache;
		}

		try {
			return await fetchExchangeRates();
		}
		catch {
			return cache;
		}
	}

	window.FinTrackApi = {
		fetchExchangeRates,
		ensureExchangeRates
	};
})();
// API client
