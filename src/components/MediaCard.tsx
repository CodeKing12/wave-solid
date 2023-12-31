import { useFocusable } from "@/spatial-nav/useFocusable";
import { I18nInfoLabel, MediaObj, RatingObj } from "./MediaTypes";
import {
	addToDefaultList,
	checkExplicitContent,
	normalizeMediatype,
	normalizeServices,
	resolveArtItem,
	smallPoster,
} from "@/utils/general";
import {
	IconHeart,
	IconPhoto,
	IconStar,
	IconStarFilled,
	IconExplicit,
	IconBookmark,
} from "@tabler/icons-solidjs";
import { Match, Switch, createEffect, createMemo } from "solid-js";
import { FocusableComponentLayout } from "@/spatial-nav";
import "@/css/media.css";
import { useSettings } from "@/SettingsContext";
import { useAlert } from "@/AlertContext";
import { useLoader } from "@/LoaderContext";

export interface MediaCardProps {
	// currentPagination: number,
	// currentPage: PageType,
	index: number;
	media: MediaObj;
	showMediaInfo: (mediaInfo: MediaObj) => void;
	onEnterPress: (mediaInfo: MediaObj) => void;
	onFocus: (focusDetails: FocusableComponentLayout) => void;
}

export function getDisplayDetails(mediaI18n: I18nInfoLabel[]) {
	let selectedDetails;

	selectedDetails = mediaI18n?.find(
		(obj: I18nInfoLabel) => obj.lang === "en",
	);
	if (
		!selectedDetails ||
		!selectedDetails.hasOwnProperty("art") ||
		!selectedDetails.art.hasOwnProperty("poster") ||
		!selectedDetails.title
	) {
		let selectedObject = null;

		for (const info of mediaI18n) {
			if (info.art && info.art.poster && info.title) {
				selectedObject = info;
				break; // Exit the loop once a poster is found
			}
		}

		// If no object with a poster is found, select the first object
		if (!selectedObject) {
			selectedObject = mediaI18n[0];
		}

		selectedDetails = selectedObject;
	}

	if (
		selectedDetails?.art?.poster &&
		selectedDetails?.art?.poster.startsWith("//")
	) {
		selectedDetails.art.poster = "https:" + selectedDetails?.art?.poster;
	}

	return selectedDetails;
}

export function getRatingAggr(ratings: RatingObj | undefined = {}) {
	let aggrRating: number = 0;
	let voteCount: number = 0;

	if (Object.keys(ratings).length) {
		for (const source in ratings) {
			const ratingData = ratings[source];
			aggrRating += ratingData.rating;
			voteCount += ratingData.votes;
		}

		aggrRating = aggrRating / Object.keys(ratings).length / 2;
	}

	return { rating: aggrRating, voteCount };
}

function MediaCard(props: MediaCardProps) {
	const { getSetting } = useSettings();
	const { addAlert } = useAlert();
	const { setShowLoader } = useLoader();
	const traktToken = () => (getSetting("trakt_token") as string) ?? "";

	function handleEnterPress() {
		if (!isExplicitContent()) {
			props.onEnterPress(props.media);
		}
	}
	const { setRef, focused, focusSelf } = useFocusable({
		onEnterPress: handleEnterPress,
		onFocus: props.onFocus,
	});

	createEffect(() => {
		if (props.media && props.index === 0) {
			focusSelf();
		}
	});

	const mediaSource = createMemo(() => props.media?._source);
	const isExplicitContent = createMemo(() =>
		checkExplicitContent(mediaSource()),
	);
	const reviews = () => {
		if (mediaSource()?.ratings) {
			return getRatingAggr(mediaSource()?.ratings);
		} else {
			return { rating: 0, voteCount: 0 };
		}
	};
	const premiere_date = new Date(mediaSource()?.info_labels?.premiered);
	const poster = createMemo(() => {
		if (mediaSource()?.i18n_info_labels) {
			return resolveArtItem(mediaSource()?.i18n_info_labels, "poster");
		} else {
			return "";
		}
	});
	const displayDetails = () => {
		let details: I18nInfoLabel;

		if (mediaSource()?.i18n_info_labels) {
			details = getDisplayDetails(mediaSource().i18n_info_labels);
		} else {
			details = {} as I18nInfoLabel;
		}
		if (!details?.title || details?.title.length === 0) {
			details.title = mediaSource()?.info_labels?.originaltitle;
		}

		return details;
	};
	const posterLink = createMemo(() => (poster ? smallPoster(poster()) : ""));

	function onImgError(event: any) {
		console.log("Image Error");
		// setPosterLink(smallPoster(poster(), true) || "")
	}

	const renderStars = createMemo(() => {
		const filledIcons = Array(Math.round(reviews().rating))
			.fill("")
			.map((value, index) => {
				return (
					<IconStarFilled
						class="fill-yellow-300 text-yellow-300"
						key={index}
						size={18}
					/>
				);
			});

		const emptyIcons = Array(5 - Math.round(reviews().rating))
			.fill("")
			.map((value, index) => {
				return (
					<IconStar
						class="fill-gray-300 text-gray-300 opacity-90"
						key={index + 5}
						size={18}
					/>
				);
			});

		return filledIcons.concat(emptyIcons);
	});

	const starRatings = () => {
		return renderStars();
	};

	const genres = () => {
		if (mediaSource()?.info_labels?.genre.length > 1) {
			return (
				mediaSource()?.info_labels.genre[0] +
				"/" +
				mediaSource()?.info_labels.genre[1]
			);
		} else {
			return mediaSource()?.info_labels?.genre[0];
		}
	};

	function handleCardClick() {
		focusSelf();
		if (!isExplicitContent()) {
			props.showMediaInfo(props.media);
		}
	}

	async function handleSync(syncType: "favorites" | "watchlist", e: Event) {
		e.stopPropagation();
		if (traktToken().length === 0) {
			addAlert({
				type: "error",
				title: "Trakt.TV Authentication Required",
				message: "Click the Login button in the Sidebar to continue.",
			});
			return;
		}
		setShowLoader(true);

		const traktMediaType = normalizeMediatype(
			props.media._source.info_labels.mediatype,
		);

		const displayName =
			syncType.charAt(0).toUpperCase() + syncType.slice(1);

		const response = await addToDefaultList(
			syncType,
			props.media._id,
			traktMediaType,
			displayDetails()?.title,
			mediaSource().info_labels.year,
			normalizeServices(mediaSource().services),
			traktToken(),
		);
		setShowLoader(false);

		if (response.status === "error") {
			if (response.error?.response?.status === 420) {
				addAlert({
					title: `${displayName} limit exceeded`,
					message: `Remove some items from your ${syncType} or upgrade your Trakt account`,
					type: "error",
				});
			} else {
				addAlert({
					title:
						response.error?.message ||
						`Failed to add item to Your ${displayName}`,
					type: "error",
				});
			}
		} else if (response.status === "success") {
			if (response?.result?.added[traktMediaType] === 1) {
				addAlert({
					title: `<em>${
						displayDetails().title
					}</em>&nbsp; added to ${displayName}`,
					type: "success",
				});
			} else if (
				response?.result?.not_found[traktMediaType][0]?.title ===
				displayDetails()?.title
			) {
				addAlert({
					title: `${
						props.media._source.info_labels.mediatype === "movie"
							? "Movie"
							: "TVShow"
					} not found`,
					message: "Trakt.TV does not recognize this item.",
					type: "info",
				});
			} else if (response?.result?.existing[traktMediaType] === 1) {
				addAlert({
					title: `Item is already in ${displayName}`,
					message: "No need to add it again.",
					type: "info",
				});
			}
		}
	}

	return (
		//   <div class={`w-[240px] h-[330px] rounded-xl bg-black-1 backdrop-blur-2xl bg-opacity-60 cursor-pointer group relative overflow-clip duration-[400ms] ease-in-out border-4 border-transparent ${focused ? "!duration-300 border-yellow-300" : ""}`} ref={ref}>
		mediaSource ? (
			<div
				id={props.media._id}
				class="media-card focusable group relative w-full cursor-pointer overflow-clip rounded-xl border-4 border-transparent bg-black-1 bg-opacity-60 backdrop-blur-2xl duration-[400ms] ease-in-out"
				classList={{
					"border-yellow-300 !duration-300": focused(),
				}}
				ref={setRef}
				onClick={handleCardClick}
			>
				<div class="media-poster relative h-full min-h-full overflow-hidden">
					<Switch>
						<Match when={poster() && !isExplicitContent()}>
							<img
								id={`${props.media._id}-poster`}
								width={300}
								height={400}
								class="h-full max-h-full w-full rounded-xl object-cover opacity-80 duration-200 ease-in-out"
								classList={{ "!blur-3xl": isExplicitContent() }}
								src={posterLink() || ""}
								alt={displayDetails()?.title}
								onError={onImgError}
							/>
						</Match>
						<Match when={!poster()}>
							<IconPhoto
								size={85}
								class="group-hover:-fill-yellow-300 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 fill-transparent text-yellow-300 transition-all duration-500 ease-linear"
							/>
						</Match>
						<Match when={isExplicitContent()}>
							{
								<IconExplicit
									size={85}
									class="group-hover:-fill-yellow-300 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 fill-transparent text-yellow-300 transition-all duration-500 ease-linear"
								/>
							}
						</Match>
					</Switch>
				</div>
				<div
					class="details-overlay invisible absolute bottom-0 h-full w-full rounded-[11px] px-3 py-5 text-gray-100 opacity-0 duration-[400ms] ease-in-out"
					classList={{
						"group-hover:visible group-hover:opacity-100":
							!isExplicitContent(),
						"!duration-300 !visible !opacity-100":
							focused() && !isExplicitContent(),
					}}
				>
					<div class="flex h-full flex-col justify-between">
						<div>
							<h5 class="mb-1 text-[15px] font-medium duration-300 ease-linear group-hover:text-yellow-300 sm:text-base xl:text-[17px]">
								{displayDetails()?.title ||
									mediaSource()?.info_labels?.originaltitle}
							</h5>
							<div class="flex flex-col justify-between sm:flex-row sm:items-center">
								<p class="text-sm text-gray-400">{genres()}</p>
								<p class="text-sm text-gray-400 text-opacity-80">
									{premiere_date.getFullYear() || ""}
								</p>
							</div>
							<div class="mt-2 flex items-center justify-between">
								<div class="flex scale-90 space-x-0.5 sm:scale-100">
									{starRatings()}
								</div>
								<p class="text-sm font-medium leading-normal text-gray-300 text-opacity-70">
									({reviews().voteCount})
								</p>
							</div>
						</div>
						<div class="flex items-center justify-between">
							<button
								class="group flex h-[50px] w-[50px] items-center justify-center space-x-4 rounded-2xl border-none bg-[rgba(249,249,249,0.20)] text-lg font-bold tracking-wide text-[#F9F9F9] !outline-none backdrop-blur-[5px] hover:bg-[#F9F9F9] hover:text-black-1"
								onclick={(e) => handleSync("favorites", e)}
							>
								<IconHeart
									width={22}
									class="group-hover:-fill-black-1"
								/>
							</button>

							<button
								class="group flex h-[50px] w-[50px] items-center justify-center space-x-4 rounded-2xl border-none bg-[rgba(249,249,249,0.20)] text-lg font-bold tracking-wide text-[#F9F9F9] !outline-none backdrop-blur-[5px] hover:bg-[#F9F9F9] hover:text-black-1"
								onclick={(e) => handleSync("watchlist", e)}
							>
								<IconBookmark
									width={22}
									class="group-hover:-fill-black-1"
								/>
							</button>

							{/* <button class="px-10 py-3 bg-yellow-300 text-black-1 rounded-xl text-sm tracking-wide font-semibold border-2 border-transparent hover:bg-black-1 hover:border-yellow-300 hover:text-yellow-300">
									Watch
								</button> */}
						</div>
					</div>
				</div>
			</div>
		) : (
			<div class="media-card group relative mx-auto flex h-[340px] w-full max-w-[250px] animate-pulse cursor-pointer items-center justify-center overflow-clip rounded-xl border-4 border-transparent bg-black-1 bg-opacity-60 backdrop-blur-2xl duration-[400ms] ease-in-out xsm:max-w-[230px] sm:h-[300px]">
				<IconPhoto size={40} color="text-gray-600" />
			</div>
		)
	);
}

export default MediaCard;
