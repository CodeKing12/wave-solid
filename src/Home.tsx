import {
	MEDIA_ENDPOINT,
	TOKEN_PARAM_NAME,
	TOKEN_PARAM_VALUE,
	allPages,
	api_map,
	mediaPerPage,
} from "@/components/constants";
import MediaList from "@/components/MediaList";
import { MediaObj } from "@/components/MediaTypes";
import Login from "@/components/Login";
import MediaModal from "@/components/MediaModal";
import { useAlert } from "@/AlertContext";
import axiosInstance from "@/utils/axiosInstance";
import {
	checkTraktToken,
	checkWebshareStatus,
	filterByTraktID,
	getDefaultlist,
	normalizeTraktService,
} from "@/utils/general";
import Navbar from "@/components/Navbar";
import {
	onMount,
	createEffect,
	createMemo,
	createResource,
	createSignal,
	Show,
} from "solid-js";
import { IconArrowLeft, IconArrowRight } from "@tabler/icons-solidjs";
import Sidebar, { PageType } from "./components/Sidebar";
import { FocusContext, useFocusable } from "./spatial-nav";
import FocusLeaf from "./components/Utilities/FocusLeaf";
import Settings from "./components/Settings";
import {
	SyncDataLength,
	SyncType,
	TraktDefaultListItem,
	VerifyDeviceData,
} from "./components/TraktTypes";
import AuthenticateTrakt from "./components/AuthenticateTrakt";
import { useSettings } from "./SettingsContext";
import { useLoader } from "./LoaderContext";
import { AxiosError } from "axios";
// import { makePersisted } from "@solid-primitives/storage";

type PaginationType = {
	[page in PageType]: number;
};

interface TokenObj {
	value: string;
	expiration: number;
}

interface mediaSignalsObj {
	currentPageNum: number;
	// searchHistory: string[];
}

interface PageMediaObj {
	totals: number;
	// media: {
	// 	[page in PageType]: MediaObj[][];
	// };
	media: MediaObj[];
}

export type SyncDataObj = {
	[sync in SyncType]?: MediaObj[];
	// [sync in SyncType]?: {
	// 	movies: MediaObj[];
	// 	shows: MediaObj[];
	// 	seasons?: MediaObj[];
	// 	episodes?: MediaObj[];
	// };
};

export interface TraktPaginationDataObj {
	watchlist?: {
		itemCount: number;
		pageCount: number;
		currentPage: number;
	};
	history?: {
		itemCount: number;
		pageCount: number;
		currentPage: number;
	};
	favorites?: null;
	media?: null;
}

export default function Home() {
	const { setRef, focusKey, focusSelf } = useFocusable({
		forceFocus: true,
	});
	const { updateSetting } = useSettings();
	const { setShowLoader } = useLoader();

	const [display, setDisplay] = createSignal<"media" | SyncType>("media");
	const [syncData, setSyncData] = createSignal<SyncDataObj>();
	// makePersisted(, {
	// 	name: "trakt-sync",
	// 	storage: sessionStorage,
	// });
	const [mediaHistory, setMediaHistory] = createSignal<{
		[id: string]: number;
	}>();

	const [hasNetwork, setHasNetwork] = createSignal(true);
	const [isAuthenticated, setIsAuthenticated] = createSignal(false);
	const [openLogin, setOpenLogin] = createSignal(false);
	const [openSettings, setOpenSettings] = createSignal(false);
	const [openTraktAuth, setOpenTraktAuth] = createSignal(false);
	const [authToken, setAuthToken] = createSignal("");

	const [page, setPage] = createSignal<PageType>("movies");

	const dummyPagination: any = {};
	allPages.map((page) => (dummyPagination[page] = 0));
	const [traktPage, setTraktPage] = createSignal({
		history: 0,
		watchlist: 0,
		favorites: 0,
		media: 0,
	});
	const [traktPaginationData, setTraktPaginationData] =
		createSignal<TraktPaginationDataObj>();
	const [pagination, setPagination] =
		createSignal<PaginationType>(dummyPagination);

	const [hideSidebar, setHideSidebar] = createSignal(false);
	const [query, setQuery] = createSignal("");

	const [selectedMedia, setSelectedMedia] = createSignal<
		MediaObj | undefined
	>();
	const [openModal, setOpenModal] = createSignal(false);
	const [finishedLoading, setFinishedLoading] = createSignal(false);
	const [traktData, setTraktData] = createSignal<VerifyDeviceData>();
	const [modalPlaceholder, setModalPlaceholder] = createSignal("");
	const [traktToken, setTraktToken] = createSignal("");

	const displayReadableName = createMemo(
		() => display().charAt(0).toUpperCase() + display().slice(1),
	);

	createEffect(() => {
		if (!openLogin() && !openModal() && !openSettings()) {
			console.log("Focused self after login/settings modal close");
			focusSelf();
		}
		if (isAuthenticated() && !openModal() && !openSettings()) {
			console.log("Quit media modal");
			focusSelf();
		}
	});

	const { addAlert } = useAlert();

	onMount(() => {
		async function retrieveWebshareToken() {
			let storedAuth = localStorage.getItem("authToken");
			const storedToken: TokenObj = JSON.parse(storedAuth || "{}");
			const currentTime = new Date().getTime();
			const isValid = await checkWebshareStatus(storedToken.value);

			if (
				isValid === true &&
				storedToken.expiration &&
				currentTime < storedToken.expiration
			) {
				setAuthToken(storedToken.value);
				setIsAuthenticated(true);
			} else if (isValid === "network_error") {
				setHasNetwork(false);
			} else {
				let prevStoredAuth = localStorage.getItem("previous-authToken");
				if (prevStoredAuth === "null") {
					localStorage.setItem(
						"previous-authToken",
						JSON.stringify(storedAuth),
					);
				}
				localStorage.removeItem("authToken");
			}
		}

		function retrieveTraktToken() {
			const { isValid, access_token } = checkTraktToken();

			if (isValid) {
				updateSetting("trakt_token", access_token);
				setTraktToken(access_token);
			} else {
				localStorage.removeItem("trakt-auth");
			}
		}

		retrieveWebshareToken();
		retrieveTraktToken();

		if (window.screen.width < 1200) {
			setHideSidebar(true);
		}
		setFinishedLoading(true);

		// function displayInputs(event: KeyboardEvent) {
		//   setKeyInput([event.code, event.keyCode, event.key, event.which])
		// }

		// document.addEventListener("keydown", displayInputs)
	});

	createEffect(() => {
		if (traktPage()[display()] > 0 && display() !== "media") {
			// @ts-ignore because I've added a check to make sure the fn isnt called when display() is "media"
			showSynced(display(), true, traktPage()[display()] + 1);
		}
	});

	const updatePagination = (page?: PageType, increment?: number) => {
		// const prevPageValue = pagination()[page] || 0
		if (!page && (display() === "watchlist" || display() === "history")) {
			setTraktPage((prev) => ({
				...prev,
				[display()]: prev[display()] + (increment ?? 0),
			}));
		}
		if (page) {
			setPagination((prevPagination) => ({
				...prevPagination,
				[page]: increment ? prevPagination[page] + increment : 0,
			}));
		}
	};

	async function fetchPageMedia(
		k: any,
		{ value: prevValue }: { value: any },
	) {
		const info: mediaSignalsObj = {
			currentPageNum: pagination()[page()],
		};
		// Should only update signal when there is no data to display. This way the resource fetcher is only called when there is no data stored
		try {
			const response = await axiosInstance.get(
				MEDIA_ENDPOINT + api_map[page()],
				{
					params: {
						[TOKEN_PARAM_NAME]: TOKEN_PARAM_VALUE,
						from:
							info.currentPageNum > 0
								? mediaPerPage * info.currentPageNum
								: undefined,
						value: page() === "search" ? query().trim() : undefined,
					},
				},
			);

			const newState: PageMediaObj = {
				totals: response.data.hits.total.value,
				media: response.data.hits.hits,
			};

			setDisplay("media");
			return newState;
		} catch (err) {
			const error = err as AxiosError;

			console.log(error);
			addAlert({
				type: "error",
				title: "Failed to fetch page media",
				message: error?.message,
			});
		}
	}

	const [pageMedia] = createResource(
		() => [page(), query(), pagination()],
		fetchPageMedia,
	);

	const searchMedia = (query: string) => {
		if (query.length) {
			setQuery(query);
			updatePagination("search");

			if (page() !== "search") {
				setPage("search");
			}
		} else if (!query.length) {
			setPage("movies");
		}
	};

	const logoutWebshare = () => {
		setAuthToken("");
		setIsAuthenticated(false);
		localStorage.removeItem("authToken");
		addAlert({
			type: "success",
			title: "Logout Successful",
		});
	};

	const onLogin = (isSuccess: boolean, token: string) => {
		setIsAuthenticated(isSuccess);
		setAuthToken(token);
		setOpenLogin(false);
		addAlert({
			type: "success",
			title: "Authentication Successful",
		});
	};

	let mainRef: HTMLElement | undefined;

	const onMediaModalClose = () => {
		setOpenModal(false);
		setSelectedMedia(undefined);
	};

	const onCardFocus = ({ y }: { y: number }) => {
		if (mainRef) {
			mainRef.scrollTo({
				top: y,
				behavior: "smooth",
			});
		}
	};

	const onMediaCardClick = (mediaInfo: MediaObj) => {
		setOpenModal(true);
		setSelectedMedia(mediaInfo);
		const placeholderUrl = document
			.getElementById(mediaInfo._id + "-poster")
			?.getAttribute("src");
		setModalPlaceholder(placeholderUrl || "");
	};

	async function showSynced(
		type: SyncType,
		isPagination = true,
		page?: number,
	) {
		// If the display() for a type is clicked again, go back to the media display
		if (display() === type && !isPagination) {
			setDisplay("media");
			return;
		}
		// If the data has already been fetched, don't fetch it again.
		if (type === "favorites" && (syncData()?.[type]?.length ?? 0) > 0) {
			setDisplay(type);
			return;
		}
		const displayName = type.charAt(0).toUpperCase() + type.slice(1);

		if (traktToken().length === 0) {
			addAlert({
				type: "error",
				title: "Trakt.TV Authentication Required",
				message: "Click the Login button in the Sidebar to continue.",
			});
			return;
		}

		setShowLoader(true);
		const traktSynced = await getDefaultlist(type, traktToken(), page);

		if (traktSynced.status === "error") {
			setShowLoader(false);
			addAlert({
				title:
					traktSynced.error?.message ||
					`Failed to fetch your ${displayName}`,
				type: "error",
			});
		} else {
			if (
				(type === "watchlist" || type === "history") &&
				traktSynced.headers
			) {
				setTraktPaginationData((prev) => {
					return {
						...prev,
						[type]: {
							itemCount:
								traktSynced.headers["x-pagination-item-count"],
							pageCount:
								traktSynced.headers["x-pagination-page-count"],
							currentPage:
								traktSynced.headers["x-pagination-page"],
						},
					};
				});
			}
			// Generate the trakt_with_type ids for filtering with SCC
			const ids: string[] = traktSynced.result.map(
				(item: TraktDefaultListItem) =>
					`${normalizeTraktService(item.type)}:${item[item.type]?.ids
						.trakt}`,
			);

			if (ids.length > 0) {
				const syncInfo = await filterByTraktID(ids);

				if (syncInfo.status === "error") {
					addAlert({
						title:
							syncInfo.error?.message ||
							`Failed to fetch synced media information`,
						message: "No response from SCC Database",
						type: "error",
					});
				} else {
					setSyncData((prev) => {
						return {
							...prev,
							[type]: [
								...(prev?.[type] ?? []),
								[...syncInfo.result.hits.hits],
							],
						};
					});
					if (type === "history") {
						const watchCount: any = {};
						console.log(traktSynced.result);
						traktSynced.result.forEach(
							(item: TraktDefaultListItem) => {
								const itemId = item[item.type]?.ids.trakt ?? 0;
								const sccServiceId = `${normalizeTraktService(
									item.type,
								)}:${itemId}`;
								const media = syncInfo.result.hits.hits.find(
									(media: MediaObj) =>
										media._source.services.trakt ===
										itemId.toString(),
								);

								watchCount[media?._id] = ids.filter(
									(id) => id === sccServiceId.toString(),
								).length;
							},
						);
						console.log(watchCount);
						setMediaHistory(watchCount);
					}
					setDisplay(type);
				}
			} else {
				addAlert({
					type: "info",
					title: `Your ${displayName} ${
						type === "favorites" ? "are" : "is"
					} empty`,
					message:
						type === "history"
							? "You haven't watched anything"
							: `You haven't added any media to your ${displayName}`,
				});
			}
			setShowLoader(false);
		}
	}

	const hideSidebarHandler = (isHidden: boolean) => setHideSidebar(isHidden);
	const openLoginHandler = () => setOpenLogin(true);
	const closeLoginHandler = () => {
		setOpenLogin(false);
	};
	const closeSettingsHandler = () => {
		setOpenSettings(false);
	};
	const sbLogoutHandler = () => logoutWebshare();

	const pageChangeHandler = (newPage: PageType) => {
		setPage(newPage);
	};

	const getPaginationData = createMemo(() => {
		return Math.ceil((pageMedia()?.totals ?? 0) / mediaPerPage);
	});

	function navigateItem(item: string) {
		if (item === "settings") {
			setOpenSettings(true);
		}
	}

	function displayDeviceCode(traktAuthData: VerifyDeviceData) {
		setTraktData(traktAuthData);
		setOpenTraktAuth(true);
	}

	function determineMedia() {
		// @ts-ignore
		const dataToDisplay = syncData()?.[display()]?.[traktPage()[display()]];
		console.log(dataToDisplay);

		if (display() === "media") {
			// || !dataToDisplay?.length
			// if (!dataToDisplay?.length) {
			// 	setDisplay("media");
			// }
			return pageMedia()?.media;
		}

		if (display() !== "media") {
			if (dataToDisplay?.length) {
				return dataToDisplay;
			} else {
				return [];
				// addAlert({
				// 	type: "info",
				// 	title: `You don't have any ${displayReadableName()}`,
				// 	message: `Add some media to your ${display()}`,
				// });
				// setDisplay("media");
			}
		}
	}

	function handleSyncDisplayBackPress() {
		setDisplay("media");
	}

	function handleRemoveMedia(media: MediaObj) {
		const currentDisplay = display();

		if (currentDisplay === "media") {
			console.error(
				"display() is not meant to be set to `media` at this stage.",
			);
		} else {
			setSyncData((prev) => {
				const mediaList = prev?.[currentDisplay];

				console.log({
					...prev,
					[display()]: mediaList?.filter((item) => item !== media),
				});

				return {
					...prev,
					[display()]: mediaList?.filter((item) => item !== media),
				};
			});
		}
	}

	function getSyncDataLength() {
		const obj: SyncDataLength = {};
		(Object.keys(syncData() ?? {}) as SyncType[]).forEach(
			(key) => (obj[key] = syncData()?.[key]?.length ?? 0),
		);
		console.log("This is the length obj: ", obj);
		return obj;
	}

	return (
		<main class="bg-[#191919]">
			{/* <div class="fixed top-1 left-1/2 z-[10000] text-white">Keys: { keyInput.map((val, index) => (<span class='text-yellow-300 mr-2' key={index}>{ val }</span>)) }</div> */}
			<Sidebar
				current={page()}
				traktToken={traktToken()}
				onChange={pageChangeHandler}
				isHidden={hideSidebar()}
				isLoggedIn={isAuthenticated()}
				onDeviceCode={displayDeviceCode}
				onHide={hideSidebarHandler}
				onLogout={sbLogoutHandler}
				finishedLoading={finishedLoading()}
				onLoginClick={openLoginHandler}
			/>

			<FocusContext.Provider value={focusKey()}>
				<section
					class={`flex h-screen min-h-screen flex-1 flex-col overflow-auto px-3 pb-16 pt-10 font-poppins duration-500 ease-in-out xs:px-4 xsm:px-8 md:px-14 lg:ml-[300px] xl:px-16 ${
						hideSidebar() ? "!ml-0" : ""
					}`}
					// 3xl:px-[72px]
					id="main-display"
					ref={mainRef}
				>
					<Navbar
						onSearch={searchMedia}
						showSynced={(type) => showSynced(type, false)}
						handleNav={navigateItem}
						currentDisplay={display()}
					/>

					<div class="relative mt-6 flex-1" ref={setRef}>
						<MediaList
							// media={pageMedia()?.media}
							media={determineMedia()}
							display={display()}
							isLoading={pageMedia.loading}
							onMediaModalOpen={onMediaCardClick}
							onCardFocus={onCardFocus}
							isSidebarOpen={hideSidebar()}
							handleBackPress={handleSyncDisplayBackPress}
							onRemoveMedia={handleRemoveMedia}
							syncLength={getSyncDataLength()}
							setSyncData={setSyncData}
							history={mediaHistory()}
						/>
					</div>
					<Show when={display() === "media"}>
						<div
							class={`mt-12 flex flex-col items-center space-y-7 sm:flex-row sm:justify-between sm:space-y-0 ${
								pageMedia.loading
									? "pointer-events-none opacity-40"
									: "pointer-events-auto opacity-100"
							}`}
						>
							<FocusLeaf
								class={
									pagination()[page()] === 0
										? "cursor-not-allowed"
										: ""
								}
								focusedStyles="[&>button]:!bg-black-1 [&>button]:!border-yellow-300 [&>button]:!text-yellow-300"
								isFocusable={pagination()[page()] !== 0}
								onEnterPress={() =>
									updatePagination(page(), -1)
								}
							>
								<button
									class={`flex items-center space-x-3 rounded-xl border-2 border-transparent bg-yellow-300 px-9 py-3 text-lg font-semibold text-black-1 hover:border-yellow-300 hover:bg-black-1 hover:text-yellow-300 ${
										pagination()[page()] === 0
											? "pointer-events-none opacity-40"
											: ""
									}`}
									onClick={() => updatePagination(page(), -1)}
								>
									{/* <ArrowLeft size={32} variant='Bold' /> */}
									<IconArrowLeft size={32} />
									<span>Previous</span>
								</button>
							</FocusLeaf>

							{/* {typeof pagination()[page()] == "number" &&
							pagination()[page()] >= 0 ? ( */}
							<Show
								when={!pageMedia.loading && getPaginationData()}
							>
								<p class="text-lg font-semibold text-gray-300">
									Page:{" "}
									<span class="ml-2 text-yellow-300">
										{pagination()[page()] + 1}
									</span>{" "}
									/ {getPaginationData()}
								</p>
							</Show>

							<FocusLeaf
								class={
									pagination()[page()] + 1 ===
									getPaginationData()
										? "cursor-not-allowed"
										: ""
								}
								focusedStyles="[&>button]:!bg-black-1 [&>button]:!border-yellow-300 [&>button]:!text-yellow-300"
								isFocusable={
									pagination()[page()] + 1 !==
									getPaginationData()
								}
								onEnterPress={() =>
									updatePagination(page(), +1)
								}
							>
								<button
									class={`flex items-center space-x-3 rounded-xl border-2 border-transparent bg-yellow-300 px-9 py-3 text-lg font-semibold text-black-1 hover:border-yellow-300 hover:bg-black-1 hover:text-yellow-300 ${
										pagination()[page()] + 1 ===
										getPaginationData()
											? "pointer-events-none opacity-40"
											: ""
									}`}
									onClick={() => updatePagination(page(), +1)}
								>
									<span>Next</span>
									{/* <ArrowRight size={32} variant='Bold' /> */}
									<IconArrowRight size={32} />
								</button>
							</FocusLeaf>
						</div>
					</Show>
					<Show
						when={
							(traktPaginationData()?.[display()]?.pageCount ??
								0) > 1
						}
					>
						<div
							class={`mt-12 flex flex-col items-center space-y-7 sm:flex-row sm:justify-between sm:space-y-0 ${
								pageMedia.loading
									? "pointer-events-none opacity-40"
									: "pointer-events-auto opacity-100"
							}`}
						>
							<FocusLeaf
								class={
									traktPage()[display()] === 0
										? "cursor-not-allowed"
										: ""
								}
								focusedStyles="[&>button]:!bg-black-1 [&>button]:!border-yellow-300 [&>button]:!text-yellow-300"
								isFocusable={traktPage()[display()] !== 0}
								onEnterPress={() =>
									updatePagination(undefined, -1)
								}
							>
								<button
									class={`flex items-center space-x-3 rounded-xl border-2 border-transparent bg-yellow-300 px-9 py-3 text-lg font-semibold text-black-1 hover:border-yellow-300 hover:bg-black-1 hover:text-yellow-300 ${
										traktPage()[display()] === 0
											? "pointer-events-none opacity-40"
											: ""
									}`}
									onClick={() =>
										updatePagination(undefined, -1)
									}
								>
									<IconArrowLeft size={32} />
									<span>Previous</span>
								</button>
							</FocusLeaf>

							<Show
								when={
									traktPaginationData()?.[display()]
										?.pageCount
								}
							>
								<p class="text-lg font-semibold text-gray-300">
									Page:{" "}
									<span class="ml-2 text-yellow-300">
										{traktPage()[display()] + 1}
									</span>{" "}
									/{" "}
									{
										traktPaginationData()?.[display()]
											?.pageCount
									}
								</p>
							</Show>

							<FocusLeaf
								class={
									traktPage()[display()] + 1 ===
									traktPaginationData()?.[display()]
										?.pageCount
										? "cursor-not-allowed"
										: ""
								}
								focusedStyles="[&>button]:!bg-black-1 [&>button]:!border-yellow-300 [&>button]:!text-yellow-300"
								isFocusable={
									traktPage()[display()] + 1 !==
									traktPaginationData()?.[display()]
										?.pageCount
								}
								onEnterPress={() =>
									updatePagination(undefined, +1)
								}
							>
								<button
									class={`flex items-center space-x-3 rounded-xl border-2 border-transparent bg-yellow-300 px-9 py-3 text-lg font-semibold text-black-1 hover:border-yellow-300 hover:bg-black-1 hover:text-yellow-300 ${
										traktPage()[display()] + 1 ===
										traktPaginationData()?.[display()]
											?.pageCount
											? "pointer-events-none opacity-40"
											: ""
									}`}
									onClick={() =>
										updatePagination(undefined, +1)
									}
								>
									<span>Next</span>
									{/* <ArrowRight size={32} variant='Bold' /> */}
									<IconArrowRight size={32} />
								</button>
							</FocusLeaf>
						</div>
					</Show>
				</section>
			</FocusContext.Provider>

			<Login
				show={openLogin() && !isAuthenticated()}
				onLogin={onLogin}
				onClose={closeLoginHandler}
			/>

			<AuthenticateTrakt
				show={openTraktAuth()}
				traktAuth={traktData()}
				quitModal={(traktToken) => {
					setOpenTraktAuth(false);
					if (traktToken && traktToken.length > 0) {
						setTraktToken(traktToken);
					}
				}}
			/>

			<Settings show={openSettings()} onClose={closeSettingsHandler} />

			{/* Add a modal to display when there is no network */}

			{/* <Transition name="slide">
				<Show when={openModal() && selectedMedia()}> */}
			<MediaModal
				show={openModal()}
				media={selectedMedia()}
				placeholderImg={modalPlaceholder()}
				authToken={authToken()}
				onAuth={openLoginHandler}
				onExit={onMediaModalClose}
				syncLength={getSyncDataLength()}
				setSyncData={setSyncData}
			/>
			{/* </Show>
			</Transition> */}
		</main>
	);
}
