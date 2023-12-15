import {
	Art,
	I18nInfoLabel,
	Info2,
	LeanMediaStream,
	MediaObj,
	MediaSource,
	SeriesObj,
	StreamObj,
	VideoStream,
} from "@/components/MediaTypes";
import {
	AUTH_ENDPOINT,
	MEDIA_ENDPOINT,
	PATH_FILE_LINK,
	PATH_FILE_PASSWORD_SALT,
	PATH_FILE_PROTECTED,
	PATH_USER_DATA,
	TOKEN_PARAM_NAME,
	TOKEN_PARAM_VALUE,
	authAxiosConfig,
} from "@/components/constants";
import { stream_p } from "./Stream";
import { md5crypt } from "./MD5";
import { sha1 } from "./Sha";
import axiosInstance from "./axiosInstance";
import { FocusDetails, setFocus } from "@/spatial-nav";
import { Setter } from "solid-js";
import { AxiosError } from "axios";
import { useSettings } from "@/SettingsContext";
import {
	GET_DEVICE_CODE,
	TRAKT_API,
	traktAuthConfig,
	traktClientId,
} from "@/components/trakt-constants";
// import Player from "video.js/dist/types/player";

export function parseXml(data: string, param: string) {
	const xml = new DOMParser().parseFromString(data, "application/xml");
	const processed = xml.getElementsByTagName("response")[0];

	return processed.getElementsByTagName(param)[0]?.textContent || "";
}

export function uuidv4(): string {
	return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
		var r = (Math.random() * 16) | 0,
			v = c == "x" ? r : (r & 0x3) | 0x8;
		return v.toString(16);
	});
}

export function getUUID() {
	let device_uuid = localStorage.getItem("UUID");

	if (!device_uuid) {
		device_uuid = uuidv4();
		localStorage.setItem("UUID", device_uuid);
	}

	return device_uuid;
}

export function normalizeLanguage(source?: string): string {
	return (source && source?.toUpperCase()) || "?";
}

export function setWidths(selector: string) {
	const items = document.querySelectorAll<HTMLElement>(selector);
	const maxWWidth = Math.max(
		...Array.from(items).map((item) => item.offsetWidth),
	);
	items.forEach((item) => {
		item.style.width = (maxWWidth > 110 ? 110 : maxWWidth) + "px";
	});
}

export function transformStreamObj(
	source: StreamObj,
): LeanMediaStream | undefined {
	if (!source.video || !source.video.length) return undefined;
	const video: VideoStream = source.video[0];
	const result: LeanMediaStream = {
		size: source.size,
		language: source.audio
			?.map((item) => normalizeLanguage(item.language))
			?.filter((value, index, self) => self.indexOf(value) === index)
			?.sort()
			?.join("/"),
		/** mapped to video.textTracks, must remain unsorted */
		subtitleList: source.subtitles?.map((item) =>
			normalizeLanguage(item.language),
		),
		subtitles: source.subtitles
			?.map((item) => normalizeLanguage(item.language))
			?.filter((value, index, self) => self.indexOf(value) === index)
			?.sort()
			?.join("/"),
		width: video.width,
		height: video.height,
		videoCodec: source.video
			?.map((item) => item.codec)
			?.filter((value, index, self) => self.indexOf(value) === index)
			?.join("/"),
		audioCodec: source.audio
			?.map((item) => item.codec)
			?.filter((value, index, self) => self.indexOf(value) === index)
			?.join("/"),
		duration: video.duration,
		ident: source.ident,
		name: source.name,
		media: source.media,
		hdr: video.hdr ? video.hdr.toString() : undefined,
	};
	result.is3d = !!source.video.find((item: VideoStream) => (<any>item)["3d"]);
	return result;
}

export function convertSecondsToTime(seconds?: number) {
	if (seconds) {
		const hours = Math.floor(seconds / 3600);
		const minutes = Math.floor((seconds % 3600) / 60);

		const hoursString = hours > 0 ? `${hours}hr` : "";
		const minutesString = minutes > 0 ? `${minutes}min` : "";

		if (hoursString && minutesString) {
			return `${hoursString} ${minutesString}`;
		} else {
			return hoursString || minutesString || "0min";
		}
	}
	return 0;
}

export function bytesToSize(bytes: number) {
	const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
	if (bytes === 0) return "0 Byte";
	const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)).toString());
	return parseFloat((bytes / Math.pow(1024, i)).toFixed(1)) + sizes[i];
}

export function formatDate(dateString?: string) {
	if (dateString) {
		const options: Intl.DateTimeFormatOptions = {
			year: "numeric",
			month: "long",
			day: "numeric",
		};
		const date = new Date(dateString);
		return date.toLocaleDateString("en-US", options);
	}
	return "";
}

export function secondsToHMS(seconds: number) {
	const hours = Math.floor(seconds / 3600);
	const minutes = Math.floor((seconds % 3600) / 60);
	const remainingSeconds = Math.floor(seconds % 60);

	const formattedTime = `${hours}:${minutes < 10 ? "0" : ""}${minutes}:${
		remainingSeconds < 10 ? "0" : ""
	}${remainingSeconds}`;
	return formattedTime;
}

export async function getFilePasswordSalt(ident: string): Promise<string> {
	try {
		const response = await axiosInstance.post(
			AUTH_ENDPOINT + PATH_FILE_PASSWORD_SALT,
			{ ident },
			authAxiosConfig,
		);
		return parseXml(response.data, "salt");
	} catch (error) {
		console.log("An error occured while seasoning: ", error);
		return ""; // Return an empty string or handle the error appropriately
	}
}

export async function getUsername(token: string): Promise<string | AxiosError> {
	try {
		const response = await axiosInstance.post(
			AUTH_ENDPOINT + PATH_USER_DATA,
			{ wst: token },
			authAxiosConfig,
		);
		return parseXml(response.data, "username");
	} catch (error) {
		console.log("An error occured while getting username: ", error);
		return error as AxiosError; // Return an empty string or handle the error appropriately
	}
}

export async function getVideoLink(
	ident: string,
	token: string,
	https: boolean,
	password?: string,
) {
	const UUID = getUUID();

	try {
		let response = await axiosInstance.post(
			AUTH_ENDPOINT + PATH_FILE_LINK,
			{
				ident,
				wst: token,
				device_uuid: UUID,
				force_https: https ? 1 : 0,
				download_type: "video_stream",
				// Available download types are 'file_download', 'video_stream' and 'audio_stream'
				device_vendor: "wave",
				password,
			},
			authAxiosConfig,
		);

		const link = parseXml(response.data, "link");
		// console.log(link);
		return link;
	} catch (error) {
		console.log(error);
		return "Unable to get video link";
	}
}

export async function getStreamUrl(token: string, stream: StreamObj) {
	const https = document.location.protocol === "https:";
	const ident = stream.ident;
	const leanStream = transformStreamObj(stream);

	try {
		const response = await axiosInstance.post(
			AUTH_ENDPOINT + PATH_FILE_PROTECTED,
			{ ident },
			authAxiosConfig,
		);
		const isProtected = parseXml(response.data, "protected") === "1";

		if (isProtected) {
			const salt = await getFilePasswordSalt(ident);
			const password = sha1(md5crypt(stream_p(leanStream), salt));
			// axiosInstance.post(AUTH_ENDPOINT + PATH_FILE_INFO, { ident, password }, authAxiosConfig)
			const mediaUrl = await getVideoLink(ident, token, https, password);
			return mediaUrl;
		} else {
			const mediaUrl = await getVideoLink(ident, token, https);
			return mediaUrl;
		}
	} catch (error) {
		console.error("An error occurred:", error);
	}
}

export async function getMediaStreams(media: MediaObj | SeriesObj) {
	try {
		let response = await axiosInstance.get(
			MEDIA_ENDPOINT + `/api/media/${media._id}/streams`,
			{
				params: {
					[TOKEN_PARAM_NAME]: TOKEN_PARAM_VALUE,
				},
			},
		);
		return response.data;
	} catch (error) {
		console.log(error);
		return undefined;
	}
}

export function generateUniqueId(prefix = "") {
	const timestamp = Date.now().toString(36);
	const random = Math.random().toString(36).substr(2, 5); // Adjust the length as needed

	return `${prefix}${timestamp}${random}`;
}

export function formatStringAsId(input: string) {
	// Replace non-alphanumeric characters with underscores
	const formattedString = input.replace(/[^a-zA-Z0-9]+/g, "-");

	// Remove underscores from the beginning and end
	const trimmedString = formattedString.replace(/^_+|_+$/g, "");

	return trimmedString;
}

export async function checkWebshareStatus(token: string) {
	let success: boolean | "network_error" = true;
	const username = await getUsername(token);
	if (typeof username === "string" && !username.length) {
		success = false;
	} else if (
		typeof username === "object" &&
		username.code &&
		username.code === "ERR_NETWORK"
	) {
		success = "network_error";
	}
	return success;
}

export function smallPoster(
	source: string | undefined,
	retry = false,
): string | undefined {
	if (!source) return undefined;

	let url = source.replace("http://", "https://");

	// https://www.themoviedb.org/talk/53c11d4ec3a3684cf4006400
	// http://image.tmdb.org/t/p/original/4W24saRPKCJIwsvrf76zmV6FlsD.jpg
	if (url.indexOf("image.tmdb.org") > -1) {
		return url.replace("/original/", "/w300/");
	}

	// https://img.csfd.cz/files/images/film/posters/158/066/158066908_cf9118.jpg
	// to https://image.pmgstatic.com/cache/resized/w180/files/images/film/posters/158/066/158066908_cf9118.jpg
	if (url.indexOf("img.csfd.cz") > -1) {
		if (retry) {
			return url.replace(
				"//img.csfd.cz",
				"//image.pmgstatic.com/cache/resized/w180",
			);
		}
		return url.replace(
			"//img.csfd.cz",
			"//image.pmgstatic.com/cache/resized/w360",
		);
	}

	// https://image.pmgstatic.com/files/images/film/posters/167/107/167107831_b01ee4.jpg
	// to https://image.pmgstatic.com/cache/resized/w180/files/images/film/posters/167/107/167107831_b01ee4.jpg
	if (url.indexOf("//image.pmgstatic.com/files") > -1)
		return url.replace(
			"//image.pmgstatic.com/files",
			"//image.pmgstatic.com/cache/resized/w360/files",
		);

	// https://thetvdb.com/banners/series/375903/posters/5e86c5d2a7fcb.jpg
	// to https://thetvdb.com/banners/series/375903/posters/5e86c5d2a7fcb_t.jpg
	// https://thetvdb.com/banners/posters/71470-2.jpg
	// to // https://thetvdb.com/banners/posters/71470-2_t.jpg
	if (url.indexOf("thetvdb.com") > -1)
		return url.replace(/^(?!.+_t)(.+)(\.[a-z]+)$/, "$1_t$2");

	// https://assets.fanart.tv/fanart/movies/13475/movieposter/star-trek-54d39f41a8ab8.jpg
	// to https://fanart.tv/detailpreview/fanart/movies/13475/movieposter/star-trek-54d39f41a8ab8.jpg
	if (url.indexOf("assets.fanart.tv") > -1)
		return url.replace("assets.fanart.tv", "fanart.tv/detailpreview");
	return url;
}

export function mergeI18n(list: Array<I18nInfoLabel>): Info2 {
	const result: any = {};
	list.forEach((item) => {
		Object.keys(item).forEach((key) => {
			if (!result[key]) result[key] = (<any>item)[key];
		});
	});
	return <Info2>result;
}

export function resolveArtItem(
	list: Array<I18nInfoLabel>,
	key: keyof Art,
): string | undefined {
	const missing1 = "https://image.tmdb.org/t/p/originalnull";
	const missing2 =
		/^https:\/\/img.csfd.cz\/assets\/b[0-9]+\/images\/poster-free\.png$/;

	for (const info of list) {
		const url = info?.art?.[key];
		if (url && url != missing1 && !url?.match(missing2)) return url;
	}
	return undefined;
}

// The media (Pred Marazem) (when you search for prep) doesnt have a poster

export function handleEscape(
	event: KeyboardEvent,
	callback: () => void,
	isComponentEscape: boolean,
) {
	if (event.code === "Escape" && isComponentEscape) {
		callback();
	}
}

export function formatMilliseconds(milliseconds: number) {
	const seconds = Math.floor(milliseconds / 1000);
	const hours = Math.floor(seconds / 3600);
	const minutes = Math.floor((seconds % 3600) / 60);
	const remainingSeconds = seconds % 60;

	const formattedTime = `${String(hours).padStart(2, "0")}:${String(
		minutes,
	).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
	return formattedTime;
}

export function closeMenuOnBlur(
	direction: string,
	menuSetter: Setter<boolean>,
) {
	if (["left", "right", "down"].includes(direction)) {
		menuSetter(false);
	}
	return true;
}

export function controlShowEffect(
	controlShow: boolean,
	focusSelfFunc: (focusDetails?: FocusDetails | undefined) => void,
	isFocused: boolean,
	hasFocusedChild: boolean,
	onBlurFocusKey: string,
) {
	if (controlShow) {
		focusSelfFunc();
	} else {
		if (isFocused || hasFocusedChild) {
			setFocus(onBlurFocusKey);
		}
	}
}

export interface KeyTimeStamp {
	arrowUpTimestamp: number;
}

export function checkExplicitContent(mediaSource?: MediaSource) {
	const { getSetting } = useSettings();
	if (mediaSource && getSetting("restrict_content")) {
		const contentFilter = ["porno", "pornographic", "nudity", "erotic"];
		const hasContent = Array(
			...mediaSource.tags,
			...mediaSource.info_labels.genre,
		).map((desc) => {
			if (contentFilter.includes(desc.toLowerCase())) {
				return true;
			}
			return false;
		});
		return hasContent.includes(true);
	} else {
		console.log(
			"Couldn't check: ",
			mediaSource,
			getSetting("restrict_content"),
		);
	}
}

export class Timer {
	private timerId: number | null = null;
	private start: number | null = null;
	private remaining: number;

	constructor(
		private callback: () => void,
		delay: number,
	) {
		this.remaining = delay;
		this.resume();
	}

	pause(): void {
		if (this.timerId) {
			clearTimeout(this.timerId);
			this.timerId = null;
			this.remaining -= Date.now() - (this.start as number);
		}
	}

	resume(): void {
		if (this.timerId) {
			return;
		}

		this.start = Date.now();
		this.timerId = setTimeout(this.callback, this.remaining);
	}
}

export function normalizeHDR(source?: string | boolean) {
	if (!source) return;
	if (source === true) return "HDR";
	const isDolbyVision = source.includes("Dolby Vision");
	const isSMPTE = source.includes("SMPTE");
	if (isDolbyVision && isSMPTE) return "HDR+DV";
	return isDolbyVision ? "DV" : "HDR";
}

export async function getUserCode() {
	try {
		const response = axiosInstance.post(
			TRAKT_API + GET_DEVICE_CODE,
			{ client_id: traktClientId },
			traktAuthConfig,
		);

		return response;
	} catch (error) {
		console.log(error);
		return "An error occurred";
	}
}
