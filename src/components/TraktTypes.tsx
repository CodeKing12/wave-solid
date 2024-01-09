export interface DeviceAuthObj {
	device_code: string;
	user_code: string;
	verification_url: string;
	expires_in: number;
	interval: number;
}

export interface ActivateTraktInfo {
	user_code: string;
	verification_url: string;
	expires_in: number;
}

export interface VerifyDeviceData extends ActivateTraktInfo {
	device_code: string;
	interval: number;
}

export type APIAuthResponse = {
	access_token: string;
	token_type: "bearer";
	expires_in: number;
	refresh_token: string;
	scope: "public";
	created_at: number;
};

export type TRAKT_MEDIA_TYPE = "movies" | "shows" | "seasons" | "episodes";
export type TRAKT_MEDIA_TYPE_SINGULAR = "movie" | "show" | "season" | "episode";
export type TRAKT_MEDIA_SORT = "rank" | "added" | "released" | "title";

export type TraktSyncIDs = {
	trakt: number;
	tmdb: number;
	imdb: string;
	slug: string;
	tvdb?: string;
	csfd?: string;
};

export type StoredTraktAuth = {
	access_token: string;
	refresh_token: string;
	expiration: number;
};

export interface TraktTokenRetriever extends StoredTraktAuth {
	isValid: boolean;
}

export interface TraktMediaSyncData {
	title: string;
	year: number;
	ids: TraktSyncIDs;
	notes?: string;
}

export interface TraktUpdateFavoritesResponse {
	added: {
		movies: number;
		shows: number;
	};
	existing: {
		movies: number;
		shows: number;
	};
	not_found: {
		movies: TraktMediaSyncData[];
		shows: TraktMediaSyncData[];
	};
	list: {
		updated_at: string;
		item_count: number;
	};
}

export type SyncType = "favorites" | "watchlist" | "history";

export interface TraktDefaultListItem {
	rank: number;
	id: number;
	listed_at: string;
	notes: string | null;
	type: TRAKT_MEDIA_TYPE_SINGULAR;
	movie?: TraktMediaSyncData;
	show?: TraktMediaSyncData;
	season?: TraktMediaSyncData;
	episode?: TraktMediaSyncData;
}
