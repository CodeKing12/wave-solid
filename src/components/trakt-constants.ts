import { APIAuthConfig } from "./constants";

export const TRAKT_API = import.meta.env.PROD
	? "https://api.trakt.tv"
	: "https://api-staging.trakt.tv";

export const GET_DEVICE_CODE = "/oauth/device/code";
export const POLL_ACCESS_TOKEN = "/oauth/device/token";
export const FAVORITES_ENDPOINT = "/sync/favorites";
export const WATCHLIST_ENDPOINT = "/sync/watchlist";

export const traktClientId = import.meta.env.PROD
	? import.meta.env.VITE_CLIENT_ID
	: import.meta.env.VITE_CLIENT_ID;
// : import.meta.env.VITE_STAGING_CLIENT_ID;

export const traktClientSecret = import.meta.env.PROD
	? import.meta.env.VITE_CLIENT_SECRET
	: import.meta.env.VITE_CLIENT_SECRET;
// : import.meta.env.VITE_STAGING_CLIENT_SECRET;

export const traktAuthConfig: APIAuthConfig = {
	headers: {
		"Content-Type": "application/json",
		"trakt-api-key": traktClientId,
		"trakt-api-version": 2,
	},
	cache: false,
};

export const traktProxy = import.meta.env.PROD
	? "https://api.trakt.tv"
	: "http://localhost:9000/trakt";
// : "http://localhost:9000/trakt-staging";
