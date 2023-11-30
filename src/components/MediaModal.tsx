import { getDisplayDetails, getRatingAggr } from "./MediaCard";
import { MediaObj, SeriesObj, StreamObj } from "./MediaTypes";
import {
	MEDIA_ENDPOINT,
	TOKEN_PARAM_NAME,
	TOKEN_PARAM_VALUE,
	proxyUrl,
} from "./constants";
import {
	getMediaStreams,
	getStreamUrl,
	resolveArtItem,
	setWidths,
} from "@/utils/general";
import MediaDetails from "./MediaDetails";
import MediaStreamOption from "./Stream";
import Episode from "./Episode";
import Season from "./Season";
import axiosInstance from "@/utils/axiosInstance";
import EpisodeList from "./EpisodeList";
// import PlayMedia from "./PlayMedia";
import { IconArrowBackUp, IconHeartPlus, IconX } from "@tabler/icons-solidjs";
import {
	For,
	Match,
	Show,
	createEffect,
	createSignal,
	onMount,
} from "solid-js";
import { Spinner, SpinnerType } from "solid-spinner";
import {
	FocusContext,
	FocusDetails,
	getCurrentFocusKey,
	setFocus,
	useFocusable,
} from "@/spatial-nav";
import FocusLeaf from "./Utilities/FocusLeaf";
import AVPlayer from "./Player/AVPlayer";
import { Switch } from "solid-js";

interface MediaModalProps {
	show: boolean;
	media?: MediaObj;
	authToken: string;
	placeholderImg: string;
	onAuth: () => void;
	onExit: () => void;
}

export interface SeriesData {
	[mediaId: string]: SeriesObj[];
}

export type SeasonStreamObj = {
	[episodeId: string]: StreamObj[];
};

export interface SeriesStreamObj {
	[seasonId: string]: SeasonStreamObj;
}

const MediaModal = function MediaModal(props: MediaModalProps) {
	// console.log("MediaModal is re-rendering")
	const isTizenTv = "tizen" in window;
	const hasWebApi = "webapis" in window;
	const { ref, setRef, focusSelf, focusKey } = useFocusable({
		autoRestoreFocus: true,
		isFocusBoundary: true,
		focusable: props.show,
		preferredChildFocusKey: "MEDIA-DETAILS",
		// focusBoundaryDirections: ["left", "right"]
	});

	let modalContent: HTMLElement | null;

	onMount(() => {
		modalContent = document.querySelector(".modal-content");
	});

	createEffect(() => {
		if (props.show) {
			setFocus("MEDIA-TITLE");
			console.log(props.media);
			// focusSelf();
		} else {
			if (modalContent) {
				modalContent.scrollTop = 0;
			}
		}
	});

	const displayDetails = () => {
		if (props.media) {
			return getDisplayDetails(props.media._source.i18n_info_labels);
		}
	};
	const images = () => {
		if (props.media && props.show) {
			return {
				poster: resolveArtItem(
					props.media._source.i18n_info_labels,
					"poster",
				),
				fanart: resolveArtItem(
					props.media._source.i18n_info_labels,
					"fanart",
				),
			};
		} else {
			return {};
		}
	};

	createEffect(() => {
		console.log(props.show, images());
	});

	const movieDetails = () => {
		if (props.media) {
			return props.media._source;
		}
	};
	const [showEpisodes, setShowEpisodes] = createSignal(false);
	const [streams, setStreams] = createSignal([]);
	const [episodeStreams, setEpisodeStreams] = createSignal<SeriesStreamObj>(
		{},
	);
	const [seasons, setSeasons] = createSignal<SeriesData>({});
	const [selectedSeason, setSelectedSeason] = createSignal<SeriesObj>();
	const [selectedEpisode, setSelectedEpisode] = createSignal();
	const [episodes, setEpisodes] = createSignal<SeriesData>({});
	const [selectedStream, setSelectedStream] = createSignal<
		StreamObj | undefined
	>();
	const [mediaUrl, setMediaUrl] = createSignal<string | undefined>("");
	const [isLoadingEpisodeStreams, setIsLoadingEpisodeStreams] =
		createSignal("");
	let { rating, voteCount } = getRatingAggr(movieDetails()?.ratings);
	const streamClasses = [
		".size",
		".audio",
		".subtitles",
		".resolution",
		".codec",
		".duration",
	];
	const [isLoadingUrl, setIsLoadingUrl] = createSignal(false);
	const movieTitle = () =>
		displayDetails()?.title ||
		movieDetails()?.info_labels?.originaltitle ||
		"";
	let storeKeyRef = () => props?.media?._id + "__" + selectedSeason()?._id;
	let subMediaRef: HTMLDivElement | undefined;
	let tvMediaRef: HTMLDivElement | undefined;
	let episodeListRef: HTMLDivElement | undefined;
	const [lastFocus, setLastFocus] = createSignal<string>("FAVE-BTN");
	const [showPlayer, setShowPlayer] = createSignal(false);
	let prevShowPlayer = false;

	const onPlayerExit = () => {
		setShowPlayer(false);
		setMediaUrl(undefined);
		// focusSelf();
		if (lastFocus()) {
			setFocus(lastFocus());
		}
		// console.log("Focused MediaModal")
	};

	function transformMediaUrl(originalUrl: string) {
		const modifiedUrl = originalUrl.replace(
			/https:\/\/\d+\.dl\.wsfiles\.cz/,
			proxyUrl,
		);
		return modifiedUrl;
	}

	async function getEpisodes(season: SeriesObj) {
		try {
			const response = await axiosInstance.get(
				MEDIA_ENDPOINT + `/api/media/filter/v2/parent?sort=episode`,
				{
					params: {
						value: season._id,
						[TOKEN_PARAM_NAME]: TOKEN_PARAM_VALUE,
					},
				},
			);
			// console.log(response.data.hits.hits);
			return response.data.hits.hits;
		} catch (error) {
			console.log(error);
			return null;
		}
	}

	async function fetchModalData(media: MediaObj) {
		// let modalContent = document.querySelector(".modal-content");
		// if (modalContent) {
		// 	modalContent.scrollTop = 0;
		// }
		// Fetch TVShow information
		if (props.media && movieDetails()?.info_labels.mediatype === "tvshow") {
			axiosInstance
				.get(
					MEDIA_ENDPOINT + `/api/media/filter/v2/parent?sort=episode`,
					{
						params: {
							value: props.media?._id,
							[TOKEN_PARAM_NAME]: TOKEN_PARAM_VALUE,
						},
					},
				)
				.then(function (response) {
					// console.log(response.data.hits.hits);
					setSeasons((prevSeasons) => {
						return {
							...prevSeasons,
							[media._id]: response.data.hits.hits,
						};
					});
				});
			// Fetch available streams for the media
		} else {
			if (!media._streams) {
				const mediaStreams = await getMediaStreams(media);
				setStreams(mediaStreams);
			}
		}
	}

	createEffect(() => {
		if (props.media) {
			console.log("Media Changed");
			fetchModalData(props.media);
		}

		function handleModalEscape(event: KeyboardEvent) {
			if (
				(event.code === "Escape" || event.keyCode === 27) &&
				prevShowPlayer === showPlayer() &&
				!showPlayer()
			) {
				exitModal();
			}

			prevShowPlayer = showPlayer();
		}

		document.addEventListener("keydown", handleModalEscape);

		return () => {
			document.removeEventListener("keydown", handleModalEscape);
		};
	});

	createEffect(() => {
		streamClasses.forEach((streamClass) => setWidths(streamClass));
	});

	async function handleStreamPlay(stream: StreamObj, isEnterpress?: boolean) {
		if (props.authToken.length) {
			setIsLoadingUrl(true);
			setSelectedStream(stream);
			const mediaLink = await getStreamUrl(props.authToken, stream);
			if (mediaLink) {
				// console.log(mediaLink)
				if (isEnterpress) {
					setLastFocus(getCurrentFocusKey());
				} else {
					setLastFocus("");
				}
				setMediaUrl(mediaLink);
				setShowPlayer(true);
				prevShowPlayer = true;
			}
			setIsLoadingUrl(false);
		} else {
			props.onAuth();
		}
	}

	async function onSeasonClick(season: SeriesObj) {
		setShowEpisodes(true);
		setSelectedSeason(season);
		let seasonEpisodes = episodes()[season._id];
		if (!seasonEpisodes) {
			seasonEpisodes = await getEpisodes(season);
			// console.log(seasonEpisodes)
		}
		setEpisodes((prevEpisodes) => {
			return { ...prevEpisodes, [season._id]: seasonEpisodes };
		});
	}

	async function getEpisodeStreams(episode: SeriesObj) {
		let epiStreams = episodeStreams()[storeKeyRef()]?.[episode?._id];
		// console.log(epiStreams)
		if (!epiStreams) {
			setIsLoadingEpisodeStreams(episode._id);
			epiStreams = await getMediaStreams(episode);
		}
		// const streamObjKey = selectedSeason?._id + "__" + episode._id
		if (selectedSeason()) {
			setEpisodeStreams((prevStreams) => {
				return {
					...prevStreams,
					[storeKeyRef()]: {
						...prevStreams[storeKeyRef()],
						[episode._id]: epiStreams,
					},
				};
			});
		}
		setIsLoadingEpisodeStreams("");
		// console.log(episodeStreams)
	}

	function exitModal() {
		setSelectedSeason(undefined);
		setSelectedEpisode(undefined);
		setShowEpisodes(false);
		setShowPlayer(false);
		setMediaUrl(undefined);
		props.onExit();
		// setTimeout(() => {
		// }, 600)
	}

	const onDetailFocus = ({ y }: { y: number }) => {
		//   console.log("Detail Scroll")
		if (ref()) {
			// @ts-ignore
			ref().scrollTo({
				top: y,
				behavior: "smooth",
			});
		}
	};

	const onEpisodeFocus = (
		focusDetails: FocusDetails,
		isNotTvMedia?: boolean,
		isEpisodeList?: boolean,
	) => {
		//   console.log("SubMedia Scroll")
		if (ref()) {
			let offsetTop = 0;
			// console.log(focusDetails)
			const parentStyles = window.getComputedStyle(
				focusDetails.node.offsetParent,
			);
			const parentPaddingTop =
				parentStyles.getPropertyValue("padding-top");
			offsetTop =
				focusDetails.node.offsetTop - parseFloat(parentPaddingTop) - 30;
			if (tvMediaRef && !isNotTvMedia) {
				offsetTop = tvMediaRef?.offsetTop + focusDetails.y - 30;
			}
			// if (episodeListRef && isEpisodeList) {
			//     offsetTop = focusDetails.node.offsetParent.off
			// }

			// @ts-ignore
			ref().scrollTo({
				top: offsetTop,
				behavior: "smooth",
			});
		}
	};

	// rating = ; // To get the rating as a fraction of 10. (Multiplying by 2 undoes the dividing by 2 in the getRatingAggr function)

	return (
		<FocusContext.Provider value={focusKey()}>
			<div
				class={`media-modal invisible fixed bottom-0 left-0 right-0 top-0 z-0 h-screen w-screen bg-black-1 p-10 px-5 py-16 opacity-0 duration-500 ease-in-out xs:px-7 xsm:px-10 md:px-16 lg:px-20 xl:overflow-hidden ${
					showPlayer() ? "" : "overflow-y-scroll"
				} ${props.show ? "!visible !z-[100] !opacity-100" : ""}`}
				// -translate-y-20 !translate-y-0
			>
				<FocusLeaf
					class="absolute right-0 top-0"
					focusedStyles="exit-focus"
					onEnterPress={exitModal}
				>
					<button
						class="flex h-14 w-14 items-center justify-center border-[3px] border-yellow-300 bg-yellow-300 text-black-1 hover:bg-black-1 hover:text-yellow-300"
						onClick={exitModal}
					>
						<IconX size={30} />
					</button>
				</FocusLeaf>
				<div class="relative flex flex-col justify-center space-y-14 xl:h-full xl:flex-row xl:space-x-20 xl:space-y-0">
					<div class="poster relative mx-auto h-[500px] w-full max-w-[350px] rounded-[30px] bg-[#191919] bg-opacity-75 xl:h-full xl:w-[450px] xl:min-w-[450px]">
						{/* xl:w-[500px] */}
						<Show when={images()?.poster}>
							<img
								width={600}
								height={600}
								src={images()?.poster}
								class="h-full w-full rounded-[30px] object-cover"
								alt={movieTitle()}
							/>
						</Show>
						{
							// || <Skeleton width={500} height="100%" /> /* eslint-disable-line @next/next/no-img-element */
							// : <IconPhoto size={170} class="text-yellow-300 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 fill-transparent group-hover:-fill-yellow-300 transition-all ease-linear duration-500" />
						}
					</div>
					<div
						class="modal-content hide-scrollbar relative w-full py-10 text-gray-300 duration-300 ease-in-out xl:min-w-[550px] xl:overflow-y-scroll"
						ref={setRef}
					>
						{/* max-w-[620px] */}
						<MediaDetails
							movieTitle={movieTitle()}
							displayDetails={displayDetails()}
							movieDetails={movieDetails()}
							rating={rating}
							voteCount={voteCount}
							onFocus={onDetailFocus}
						/>
						{props.authToken.length ? (
							""
						) : (
							<p class="my-5 text-lg font-medium text-red-500">
								Login to watch
							</p>
						)}
						{movieDetails()?.info_labels.mediatype === "tvshow" ? (
							""
						) : (
							<div
								class={`media-streams mb-6 mt-12 w-full opacity-100 duration-300 ease-in-out`}
								classList={{
									"w-[600px]": !streams()?.length,
									"pointer-events-none opacity-40":
										!props.authToken.length,
								}}
							>
								<p class="mb-5 text-center text-base opacity-60">
									Available Streams
								</p>
								<div class="flex flex-col gap-20 md:gap-16 lg:gap-12 xl:gap-10">
									<Show
										when={streams()?.length}
										fallback={
											<Spinner
												type={SpinnerType.tailSpin}
												width={70}
												height={70}
												color="#fde047"
												class="relative left-1/2 mt-5 -translate-x-1/2 -translate-y-1/2"
											/>
										}
									>
										<For each={streams()}>
											{(stream) => (
												<MediaStreamOption
													stream={stream}
													onFocus={(
														focusDetails: FocusDetails,
													) =>
														onEpisodeFocus(
															focusDetails,
															true,
														)
													}
													onStreamClick={(
														isEnterpress?: boolean,
													) =>
														handleStreamPlay(
															stream,
															isEnterpress,
														)
													}
													authToken={props.authToken}
												/>
											)}
										</For>
									</Show>
								</div>
							</div>
						)}
						<div class="mt-16 flex flex-col items-center justify-center xsm:flex-row xsm:items-start xsm:justify-start xl:mt-10 xl:gap-12">
							<FocusLeaf
								focusedStyles="[&>button]:!bg-opacity-5 [&>button]:!border-white [&>button]:!text-white"
								customFocusKey="FAVE-BTN"
								onFocus={(focusDetails: FocusDetails) =>
									onEpisodeFocus(focusDetails, true)
								}
							>
								<button class="flex items-center gap-4 rounded-xl border-4 border-transparent bg-white px-10 py-3 text-[15px] font-bold tracking-wide text-black-1 hover:border-white hover:bg-opacity-5 hover:text-white">
									<IconHeartPlus size={32} />
									Add to Favorites
								</button>
							</FocusLeaf>

							<FocusLeaf
								isFocusable={Boolean(
									showEpisodes() && selectedSeason,
								)}
								focusedStyles="[&>button]:!bg-black-1 [&>button]:!border-yellow-300 [&>button]:!text-yellow-300"
								onFocus={(focusDetails: FocusDetails) =>
									onEpisodeFocus(focusDetails, true)
								}
								onEnterPress={() => {
									setShowEpisodes(false);
									setFocus(selectedSeason()?._id || "");
									setSelectedSeason(undefined);
								}}
							>
								<button
									class="invisible flex h-14 w-14 items-center justify-center rounded-xl border-4 border-transparent bg-yellow-300 text-black-1 opacity-0 hover:border-yellow-300 hover:bg-black-1 hover:text-yellow-300"
									classList={{
										"!visible !opacity-100":
											showEpisodes() &&
											Boolean(selectedSeason()),
									}}
									onClick={() => {
										setShowEpisodes(false);
										setSelectedSeason(undefined);
									}}
								>
									<IconArrowBackUp size={28} />
								</button>
							</FocusLeaf>

							{/* <button class="px-10 py-3 bg-yellow-300 text-black-1 rounded-xl text-base tracking-wide font-bold border-2 border-transparent hover:bg-black-1 hover:border-yellow-300 hover:text-yellow-300 flex items-center gap-4">
									<PlayCircle size={32} variant="Bold" />
									Watch
								</button> */}
						</div>
						<Show
							when={
								props.media &&
								movieDetails()?.info_labels.mediatype ===
									"tvshow"
							}
						>
							<div
								class="mb-6- mt-12"
								classList={{
									"w-[600px]":
										!seasons()[props.media?._id ?? ""]
											?.length,
								}}
							>
								<p class="mb-5 text-center text-base opacity-60">
									Available{" "}
									{showEpisodes() ? "Episodes" : "Seasons"}
								</p>
								<div
									class="relative min-h-[250px] w-full"
									ref={tvMediaRef}
								>
									<div
										class={`absolute top-0 flex w-full max-w-full flex-wrap gap-8 duration-300 ease-in-out ${
											selectedSeason() &&
											seasons()[props.media?._id ?? ""]
												?.length
												? "invisible -translate-y-16 opacity-0"
												: ""
										}`}
									>
										<Show
											when={
												seasons()[
													props.media?._id ?? ""
												]?.length
											}
											fallback={
												<Spinner
													type={SpinnerType.rings}
													width={70}
													height={70}
													color="#fde047"
													class="relative left-1/2 mt-5 -translate-x-1/2 -translate-y-1/2"
												/>
											}
										>
											<For
												each={
													seasons()[
														props.media?._id ?? ""
													]
												}
											>
												{(seriesMedia) => (
													<Switch>
														<Match
															when={
																seriesMedia
																	._source
																	.info_labels
																	.mediatype ===
																"season"
															}
														>
															<Season
																season={
																	seriesMedia
																}
																onClick={() => {
																	onSeasonClick(
																		seriesMedia,
																	);
																	setFocus(
																		"FAVE-BTN",
																	);
																}}
																onFocus={
																	onEpisodeFocus
																}
																isVisible={Boolean(
																	!selectedSeason() &&
																		seasons()[
																			props
																				.media
																				?._id ||
																				0
																		]
																			?.length,
																)}
															/>
														</Match>
														<Match
															when={
																seriesMedia
																	._source
																	.info_labels
																	.mediatype !==
																"season"
															}
														>
															<Episode
																authToken={
																	props.authToken
																}
																episode={
																	seriesMedia
																}
																onClick={() =>
																	getEpisodeStreams(
																		seriesMedia,
																	)
																}
																episodeStreams={
																	episodeStreams()[
																		storeKeyRef()
																	]?.[
																		seriesMedia
																			._id
																	]
																}
																onEpisodeStreamClick={(
																	stream,
																	isEnterpress,
																) =>
																	handleStreamPlay(
																		stream,
																		isEnterpress,
																	)
																}
																isLoadingStreams={
																	isLoadingEpisodeStreams() ===
																	seriesMedia._id
																}
																onFocus={
																	onEpisodeFocus
																}
															/>
														</Match>
													</Switch>
												)}
											</For>
										</Show>
									</div>
									<div
										class={`invisible absolute top-0 flex max-w-full translate-y-16 flex-col gap-10 opacity-0 duration-500 ease-in-out ${
											showEpisodes() &&
											selectedSeason &&
											episodes()[
												selectedSeason()?._id || 0
											]?.length
												? "!visible !translate-y-0 !opacity-100"
												: ""
										}`}
									>
										<EpisodeList
											authToken={props.authToken}
											episodes={episodes()}
											selectedSeason={selectedSeason()}
											episodeStreams={
												episodeStreams()[
													storeKeyRef()
												] || {}
											}
											onEpisodeClick={getEpisodeStreams}
											onEpisodeStreamClick={(
												stream,
												isEnterpress,
											) =>
												handleStreamPlay(
													stream,
													isEnterpress,
												)
											}
											isLoadingEpisodeStreams={isLoadingEpisodeStreams()}
											onEpisodeFocus={onEpisodeFocus}
											onEpisodeStreamFocus={
												onEpisodeFocus
											}
											isFocusable={Boolean(
												showEpisodes() &&
													selectedSeason(),
											)}
										/>
										{/* <div class="flex flex-col gap-4 flex-wrap max-w-full">
													{
														episodes[selectedSeason?._id || ""]?.map((episode, index) => <Episode key={index} episode={episode} onClick={() => getEpisodeStreams(episode)} episodeStreams={episodeStreams[storeKeyRef.current]?.[episode?._id] || undefined} onEpisodeStreamClick={(stream) => handleStreamPlay(stream)} isLoadingStreams={isLoadingEpisodeStreams === episode?._id} />)
													}
												</div> */}
									</div>
									<div
										class="invisible absolute bottom-0 top-0 flex h-full w-full items-center justify-center rounded-xl opacity-0 backdrop-blur-sm duration-300 ease-linear"
										classList={{
											"!visible !opacity-100":
												showEpisodes() &&
												!episodes()[
													selectedSeason()?._id || ""
												]?.length,
										}}
									>
										<Spinner
											type={SpinnerType.oval}
											width={70}
											height={70}
											color="#fde047"
										/>
									</div>
								</div>
							</div>
						</Show>
					</div>
					<div
						class="invisible absolute bottom-0 top-0 flex h-full w-full items-center justify-center rounded-xl opacity-0 backdrop-blur-sm duration-300 ease-linear"
						classList={{ "!visible !opacity-100": isLoadingUrl() }}
					>
						<Spinner
							type={SpinnerType.spinningCircles}
							width={70}
							height={70}
							color="#fde047"
						/>
					</div>
					{/* <div class={`fixed w-full h-full top-0 bottom-0 duration-500 ease-linear opacity-0 invisible bg-black -bg-opacity-90 ${mediaUrl?.length ? "!visible !opacity-100" : ""}`} ref={ref}>
						<MediaPlayer id="media-player" key={mediaUrl} src={mediaUrl + ".mp4"} class="h-full" title={displayDetails?.title} poster={displayDetails?.art.poster || ""} keyShortcuts={{togglePaused: "Space Enter", seekBackward: "ArrowLeft", seekForward: "ArrowRight", toggleFullscreen: "ArrowUp", toggleCaptions: "ArrowDown"}} keyTarget={mediaUrl ? "document" : "player"} autoplay={true}>
							<MediaProvider key={mediaUrl} />
							<DefaultVideoLayout icons={defaultLayoutIcons} />
							<Time type="duration" />
						</MediaPlayer>
						</div> */}
					{/* <AVPlay mediaUrl={mediaUrl} onPlaybackComplete={handlePlaybackComplete} /> */}
					<Switch>
						<Match when={isTizenTv && hasWebApi}>
							<AVPlayer
								url={mediaUrl()}
								show={showPlayer()}
								onQuit={onPlayerExit}
								canPlayonTizen={isTizenTv && hasWebApi}
							/>
						</Match>
						{/* <Match when={!(isTizenTv && hasWebApi)}>
							<PlayMedia
								show={showPlayer()}
								url={mediaUrl()}
								mediaFormat="mp4"
								mediaType="video/mp4"
								mediaDetails={displayDetails()}
								onExit={onPlayerExit}
							/>
						</Match> */}
					</Switch>
				</div>
			</div>
		</FocusContext.Provider>
	);
};

export default MediaModal;
