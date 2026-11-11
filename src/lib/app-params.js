const isNode = typeof window === 'undefined';

const isClearAccessTokenRequested = () =>
	!isNode && new URLSearchParams(window.location.search).get('clear_access_token') === 'true';

const clearStoredAccessToken = () => {
	window.localStorage.removeItem('access_token');
	window.localStorage.removeItem('token');
};

const readToken = () => (isNode ? '' : window.localStorage.getItem('access_token') || '');

const getAppParams = () => {
	const clear = isClearAccessTokenRequested();
	if (clear) {
		clearStoredAccessToken();
	}

	return {
		appId: import.meta.env.VITE_APP_ID || '',
		// Address of the companion API service this frontend talks to.
		apiOrigin: import.meta.env.VITE_API_ORIGIN || '',
		appBaseUrl: import.meta.env.VITE_APP_BASE_URL || '',
		token: clear ? '' : readToken(),
	};
};

export const appParams = {
	...getAppParams(),
};
