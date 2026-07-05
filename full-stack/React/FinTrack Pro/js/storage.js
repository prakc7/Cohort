(() => {
	const STORAGE_PREFIX = "FinTrackPro";

	const STORAGE_KEYS = {
		users: `${STORAGE_PREFIX}.users`,
		session: `${STORAGE_PREFIX}.session`,
		transactions: `${STORAGE_PREFIX}.transactions`,
		preferences: `${STORAGE_PREFIX}.preferences`,
		rates: `${STORAGE_PREFIX}.exchangeRates`
	};

	const DEFAULT_CURRENCY = "USD";

	const CURRENCY_OPTIONS = ["USD", "EUR", "GBP", "INR", "JPY"];

	const CATEGORY_OPTIONS = [
		"Food & Dining",
		"Shopping",
		"Recharge & Bills",
		"Petrol & Auto",
		"Utilities",
		"Salary",
		"Entertainment",
		"Other"
	];

	const DEFAULT_PREFERENCES = {
		fullName: "",
		currency: DEFAULT_CURRENCY,
		darkMode: false,
		updatedAt: null
	};

	const DEFAULT_RATE_CACHE = {
		base: DEFAULT_CURRENCY,
		rates: { USD: 1 },
		updatedAt: null
	};

	function readJSON(key, fallback) {
		try {
			const rawValue = localStorage.getItem(key);
			return rawValue ? JSON.parse(rawValue) : fallback;
		}
		catch {
			return fallback;
		}
	}

	function writeJSON(key, value) {
		localStorage.setItem(key, JSON.stringify(value));
	}

	function getUsers() {
		return readJSON(STORAGE_KEYS.users, []);
	}

	function saveUsers(users) {
		writeJSON(STORAGE_KEYS.users, users);
	}

	function getSession() {
		return readJSON(STORAGE_KEYS.session, null);
	}

	function saveSession(session) {
		writeJSON(STORAGE_KEYS.session, session);
	}

	function clearSession() {
		localStorage.removeItem(STORAGE_KEYS.session);
	}

	function getCurrentUser() {
		const session = getSession();

		if (!session) {
			return null;
		}

		const users = getUsers();
		const user = users.find((entry) => entry.id === session.userId);

		if (!user) {
			return null;
		}

		return { ...user, ...session };
	}

	function updateCurrentUser(sessionPatch) {
		const currentSession = getSession();

		if (!currentSession) {
			return null;
		}

		const nextSession = { ...currentSession, ...sessionPatch };
		saveSession(nextSession);

		const users = getUsers();
		const userIndex = users.findIndex((entry) => entry.id === nextSession.userId);

		if (userIndex >= 0) {
			users[userIndex] = {
				...users[userIndex],
				name: nextSession.name ?? users[userIndex].name,
				currency: nextSession.currency ?? users[userIndex].currency
			};

			saveUsers(users);
		}

		return getCurrentUser();
	}

	function setCurrentUser(user) {
		saveSession({
			userId: user.id,
			name: user.name,
			email: user.email,
			currency: user.currency,
			loginTime: new Date().toISOString()
		});
	}

	function removeCurrentUser() {
		clearSession();
	}

	function getPreferences(userId) {
		const storedPreferences = readJSON(STORAGE_KEYS.preferences, {});
		return { ...DEFAULT_PREFERENCES, ...(storedPreferences[userId] || {}) };
	}

	function savePreferences(userId, preferences) {
		const storedPreferences = readJSON(STORAGE_KEYS.preferences, {});

		storedPreferences[userId] = {
			...DEFAULT_PREFERENCES,
			...(storedPreferences[userId] || {}),
			...preferences,
			updatedAt: new Date().toISOString()
		};

		writeJSON(STORAGE_KEYS.preferences, storedPreferences);
		return storedPreferences[userId];
	}

	function getTransactions(userId) {
		const allTransactions = readJSON(STORAGE_KEYS.transactions, []);
		return allTransactions.filter((transaction) => transaction.userId === userId);
	}

	function saveTransactions(userId, transactions) {
		const allTransactions = readJSON(STORAGE_KEYS.transactions, []);
		const nextTransactions = [
			...allTransactions.filter((transaction) => transaction.userId !== userId),
			...transactions.map((transaction) => ({ ...transaction, userId }))
		];

		writeJSON(STORAGE_KEYS.transactions, nextTransactions);
		return transactions;
	}

	function getRatesCache() {
		return { ...DEFAULT_RATE_CACHE, ...readJSON(STORAGE_KEYS.rates, {}) };
	}

	function saveRatesCache(cache) {
		writeJSON(STORAGE_KEYS.rates, {
			...DEFAULT_RATE_CACHE,
			...cache,
			updatedAt: new Date().toISOString()
		});
	}

	function resetUserData(userId) {
		const allTransactions = readJSON(STORAGE_KEYS.transactions, []);
		writeJSON(STORAGE_KEYS.transactions, allTransactions.filter((transaction) => transaction.userId !== userId));

		const preferences = readJSON(STORAGE_KEYS.preferences, {});
		delete preferences[userId];
		writeJSON(STORAGE_KEYS.preferences, preferences);
	}

	function resetAllData() {
		localStorage.removeItem(STORAGE_KEYS.users);
		localStorage.removeItem(STORAGE_KEYS.session);
		localStorage.removeItem(STORAGE_KEYS.transactions);
		localStorage.removeItem(STORAGE_KEYS.preferences);
		localStorage.removeItem(STORAGE_KEYS.rates);
	}

	function ensureDefaultPreferences(user) {
		const currentPreferences = getPreferences(user.id);

		if (!currentPreferences.fullName) {
			savePreferences(user.id, {
				fullName: user.name,
				currency: user.currency || DEFAULT_CURRENCY,
				darkMode: false
			});
		}
	}

	window.FinTrackStore = {
		STORAGE_KEYS,
		DEFAULT_CURRENCY,
		CURRENCY_OPTIONS,
		CATEGORY_OPTIONS,
		getUsers,
		saveUsers,
		getSession,
		saveSession,
		clearSession,
		getCurrentUser,
		updateCurrentUser,
		setCurrentUser,
		removeCurrentUser,
		getPreferences,
		savePreferences,
		getTransactions,
		saveTransactions,
		getRatesCache,
		saveRatesCache,
		resetUserData,
		resetAllData,
		ensureDefaultPreferences
	};
})();
