import { authConfig } from "./constants";

export const TRAKT_API = import.meta.env.PROD
	? "https://api.trakt.tv"
	: "https://api-staging.trakt.tv";

export const GET_DEVICE_CODE = "/oauth/device/code";

export const traktAuthConfig: authConfig = {
	cache: false,
};
export const traktClientId = import.meta.env.VITE_CLIENT_ID;
