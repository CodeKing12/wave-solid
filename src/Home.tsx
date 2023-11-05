// import Sidebar, { PageType } from '@/components/Sidebar'
// import { SearchNormal1, ArrowLeft, ArrowRight, SearchNormal } from "iconsax-react"
import {
	MEDIA_ENDPOINT,
	TOKEN_PARAM_NAME,
	TOKEN_PARAM_VALUE,
	allPages,
	api_map,
	mediaPerPage,
} from "@/components/constants";
// import { useEffect, createSignal, useRef, useCallback, useMemo } from 'react';
import MediaList from "@/components/MediaList";
// import { BeatLoader, BounceLoader, ClipLoader, ClockLoader, ClimbingBoxLoader, FadeLoader, GridLoader, PuffLoader, PulseLoader, PropagateLoader, RingLoader, SquareLoader, SkewLoader, ScaleLoader, HashLoader, SyncLoader, RotateLoader } from 'react-spinners';
// import { HashLoader } from 'react-spinners';
import { MediaObj, MediaType } from "@/components/MediaTypes";
import Login from "@/components/Login";
// import Alert, { AlertData, AlertInfo } from "@/components/Alert";
// import { useFocusable, FocusContext } from "@noriginmedia/norigin-spatial-navigation";
// import FocusLeaf from '@/components/FocusLeaf';
import MediaModal from "@/components/MediaModal";
import dummyMediaInfo from "@/media.json";
import { useAlert } from "@/AlertContext";
import axiosInstance from "@/utils/axiosInstance";
import { checkWebshareStatus } from "@/utils/general";
import Navbar from "@/components/Navbar";
import {
	onMount,
	createEffect,
	createMemo,
	createResource,
	createSignal,
} from "solid-js";
import { IconArrowLeft, IconArrowRight } from "@tabler/icons-solidjs";
// import { Spinner, SpinnerType } from 'solid-spinner';
import Sidebar, { PageType } from "./components/Sidebar";
import { useFocusable } from "./spatial-nav";

type PaginationType = {
	[page in PageType]: number;
};

interface TokenObj {
	value: string;
	expiration: number;
}

interface mediaSignalsObj {
	currentPageNum: number;
	searchHistory: string[];
}

interface PageMediaObj {
	totals: number;
	media: {
		[page in PageType]: MediaObj[][];
	};
}

export default function Home() {
	const [loading, setLoading] = createSignal(false);
	const [isAuthenticated, setIsAuthenticated] = createSignal(false);
	const [openLogin, setOpenLogin] = createSignal(false);
	const [authToken, setAuthToken] = createSignal("");

	// const dummyMedia: MediaType = {}
	// allPages.map((page) => dummyMedia[page] = [Array(mediaPerPage).fill({})])
	// console.log(dummyMedia)
	const [media, setMedia] = createSignal<MediaType>({});

	const [page, setPage] = createSignal<PageType>("movies");
	const [totals, setTotals] = createSignal<PaginationType>(
		{} as PaginationType,
	);

	const dummyPagination: any = {};
	allPages.map((page) => (dummyPagination[page] = 0));
	const [pagination, setPagination] =
		createSignal<PaginationType>(dummyPagination);

	const [hideSidebar, setHideSidebar] = createSignal(false);
	let prevPagination = pagination();
	const [query, setQuery] = createSignal("");
	const [searchHistory, setSearchHistory] = createSignal<string[]>([]);
	const { setRef, focusKey, hasFocusedChild, focusSelf } = useFocusable({
		forceFocus: true,
	});
	const [selectedMedia, setSelectedMedia] = createSignal<
		MediaObj | undefined
	>();
	const [openModal, setOpenModal] = createSignal(false);
	const [finishedLoading, setFinishedLoading] = createSignal(false);
	const [modalPlaceholder, setModalPlaceholder] = createSignal("");

	// createEffect(() => {
	//   if (!openLogin() && !openModal()) {
	//     // console.log("Focused self after login modal close")
	//     // focusSelf();
	//   }
	//   if (isAuthenticated() && !openModal()) {
	//     // console.log("Quit media modal")
	//     // focusSelf();
	//   }
	// })

	const { addAlert } = useAlert();

	onMount(() => {
		// Initialize
		// console.log(SpatialNavigation);
		// SpatialNavigation.init();

		// // Define navigable elements (anchors and elements with "focusable" class).
		// SpatialNavigation.add({
		// 	selector: "a, .focusable",
		// });

		// // Make the *currently existing* navigable elements focusable.
		// SpatialNavigation.makeFocusable();

		// // Focus the first navigable element.
		// SpatialNavigation.focus();

		async function retrieveToken() {
			let storedAuth = localStorage.getItem("authToken");
			const storedToken: TokenObj = JSON.parse(storedAuth || "{}");
			const currentTime = new Date().getTime();
			const isValid = await checkWebshareStatus(storedToken.value);

			if (
				isValid &&
				storedToken.expiration &&
				currentTime < storedToken.expiration
			) {
				setAuthToken(storedToken.value);
				setIsAuthenticated(true);
			} else {
				localStorage.removeItem("authToken");
			}
		}
		retrieveToken();

		if (window.screen.width < 1200) {
			setHideSidebar(true);
		}
		setFinishedLoading(true);

		// function displayInputs(event: KeyboardEvent) {
		//   setKeyInput([event.code, event.keyCode, event.key, event.which])
		// }

		// document.addEventListener("keydown", displayInputs)
	});

	// const fetched = []

	const updatePagination = (page: PageType, increment?: number) => {
		// const prevPageValue = pagination()[page] || 0
		setPagination((prevPagination) => ({
			...prevPagination,
			[page]: increment ? prevPagination[page] + increment : 0,
		}));
	};
	const currentMedia = createMemo(() => media()[page()]);
	const currentPageIndex = createMemo(() => pagination()[page()]);

	const mediaSignals = createMemo(() => {
		const signal: mediaSignalsObj = {
			currentPageNum: pagination()[page()],
			searchHistory: searchHistory(),
		};
		return signal;
	});

	async function fetchPageMedia(
		k: any,
		{ value: prevValue }: { value: any },
	) {
		const info: mediaSignalsObj = {
			currentPageNum: pagination()[page()],
			searchHistory: searchHistory(),
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
				media: {
					...(prevValue?.media || []),
					[page()]: [
						...(prevValue?.media[page()] || []),
						response.data.hits.hits,
					],
				},
			};

			return newState;
		} catch (error) {
			console.log(error);
		}
	}

	const [pageMedia, { refetch }] = createResource(fetchPageMedia);
	createEffect(() => {
		const pageMediaLength = pageMedia()?.media[page()]?.length ?? 0;
		if (pagination()[page()] + 1 > pageMediaLength) {
			console.log("Should refetch");
			refetch();
		} else {
			// addMedia(pageMedia()?.media[page()]?.[currentPageIndex()])
			console.log("Don't refetch");
		}
	});

	// createEffect(() => {
	//   const isSearch = searchHistory()[searchHistory().length - 1] === query()
	//   if (!pagination.hasOwnProperty(page())) {
	//     updatePagination(page())
	//   }
	//   if (!media.hasOwnProperty(page()) || currentPageIndex() > prevPagination[page()] || isSearch) {
	//     console.log(currentPageIndex(), currentMedia(), isSearch)
	//     // Temp Fix is adding 1 to it. Think of a better fix in the morning
	//     if ((currentPageIndex() + 1 >= currentMedia().length || isSearch)) {
	//       setLoading(true);
	//       // if (page() === "search" && currentPageIndex() <= 0) {
	//       //   media()[page()] = []
	//       // }
	//     }
	//   }
	//   prevPagination = pagination();
	// })

	const searchMedia = () => {
		if (
			query().length &&
			query() !== searchHistory()[searchHistory().length - 1]
		) {
			setSearchHistory([...searchHistory(), query()]);
			updatePagination("search");

			if (page() !== "search") {
				setPage("search");
			}
		} else if (!query().length) {
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

	const onMediaModalClose = () => setOpenModal(false);

	const onMediaCardClick = (mediaInfo: MediaObj) => {
		setOpenModal(true);
		setSelectedMedia(mediaInfo);
		const placeholderUrl = document
			.getElementById(mediaInfo._id + "-poster")
			?.getAttribute("src");
		setModalPlaceholder(placeholderUrl || "");
	};

	const navUpdateQuery = (query: string) => setQuery(query);
	const navShowFavorites = () => console.log("Clicked Favorites");
	const hideSidebarHandler = (isHidden: boolean) => setHideSidebar(isHidden);
	const openLoginHandler = () => setOpenLogin(true);
	const closeLoginHandler = () => setOpenLogin(false);
	const sbLogoutHandler = () => logoutWebshare();

	const pageChangeHandler = (newPage: PageType) => {
		console.log("Clicked Sidebar");
		console.log(pageMedia());
		setPage(newPage);
	};

	const dummyData = Array(100).fill({});

	const getCurrentPageMedia = createMemo(() => {
		// console.log("getPageMedia", media(), page(), pagination())
		// console.log(media()[page()]?.[pagination()[page()]][0])
		// return media()[page()]?.[pagination()[page()]]
		console.log(page(), currentPageIndex());
		const currentPageData =
			pageMedia()?.media[page()]?.[currentPageIndex()];
		console.log(currentPageData);

		return currentPageData;
	});

	return (
		<main class="bg-[#191919]">
			{/* <div class="fixed top-1 left-1/2 z-[10000] text-white">Keys: { keyInput.map((val, index) => (<span class='text-yellow-300 mr-2' key={index}>{ val }</span>)) }</div> */}
			<Sidebar
				current={page()}
				onChange={pageChangeHandler}
				isHidden={hideSidebar()}
				isLoggedIn={isAuthenticated()}
				onHide={hideSidebarHandler}
				onLogout={sbLogoutHandler}
				finishedLoading={finishedLoading()}
				onLoginClick={openLoginHandler}
			/>

			{/* <FocusContext.Provider value={focusKey}> */}
			<section
				class={`xxl:px-[72px] flex h-screen min-h-screen flex-1 flex-col overflow-auto px-3 pb-16 pt-10 font-poppins duration-500 ease-in-out xs:px-4 xsm:px-8 md:px-14 lg:ml-[300px] xl:px-16 ${
					hideSidebar() ? "!ml-0" : ""
				}`}
				id="main-display"
				ref={mainRef}
			>
				<Navbar
					query={query()}
					updateQuery={navUpdateQuery}
					onSearch={searchMedia}
					showFavorites={navShowFavorites}
				/>

				<div class={`relative mt-6 flex-1`} ref={setRef}>
					{/* {page() && ( */}
					<MediaList
						media={getCurrentPageMedia()}
						onMediaModalOpen={onMediaCardClick}
						isSidebarOpen={hideSidebar()}
					/>
					{/* )} */}
					{
						// media()[page()] && media()[page()]?.[pagination()[page()]]?.length ?
						// : <Spinner type={SpinnerType.puff} width={70} height={70} color="#fde047" class="!absolute top-[37%] left-1/2 -translate-x-1/2 -translate-y-1/2" />
					}
				</div>
				<div
					class={`mt-10 flex flex-col items-center gap-7 sm:flex-row sm:justify-between sm:gap-0 ${
						loading()
							? "pointer-events-none opacity-40"
							: "pointer-events-auto opacity-100"
					}`}
				>
					{/* <FocusLeaf class={pagination[page] + 1 === 1 ? "cursor-not-allowed" : ""} focusedStyles="[&>button]:!bg-black-1 [&>button]:!border-yellow-300 [&>button]:!text-yellow-300" isFocusable={pagination[page] + 1 !== 1} onEnterPress={() => updatePagination(page, -1)}> */}
					<button
						class={`flex items-center gap-4 rounded-xl border-2 border-transparent bg-yellow-300 px-9 py-3 text-lg font-semibold text-black-1 hover:border-yellow-300 hover:bg-black-1 hover:text-yellow-300 ${
							pagination()[page()] + 1 === 1
								? "pointer-events-none opacity-40"
								: ""
						}`}
						onClick={() => updatePagination(page(), -1)}
					>
						{/* <ArrowLeft size={32} variant='Bold' /> */}
						<IconArrowLeft size={32} />
						Previous
					</button>
					{/* </FocusLeaf> */}

					{typeof pagination()[page()] == "number" &&
					pagination()[page()] >= 0 ? (
						<p class="text-lg font-semibold text-gray-300">
							Page:{" "}
							<span class="ml-2 text-yellow-300">
								{pagination()[page()] + 1}
							</span>{" "}
							/ {Math.ceil(totals()[page()] / mediaPerPage)}
						</p>
					) : (
						""
					)}

					{/* <FocusLeaf class={pagination[page] + 1 === Math.ceil(totals[page] / mediaPerPage) ? "cursor-not-allowed" : ""} focusedStyles="[&>button]:!bg-black-1 [&>button]:!border-yellow-300 [&>button]:!text-yellow-300" isFocusable={pagination[page] + 1 !== Math.ceil(totals[page] / mediaPerPage)} onEnterPress={() => updatePagination(page, +1)}> */}
					<button
						class={`flex items-center gap-4 rounded-xl border-2 border-transparent bg-yellow-300 px-9 py-3 text-lg font-semibold text-black-1 hover:border-yellow-300 hover:bg-black-1 hover:text-yellow-300 ${
							pagination()[page()] + 1 ===
							Math.ceil(totals()[page()] / mediaPerPage)
								? "pointer-events-none opacity-40"
								: ""
						}`}
						onClick={() => updatePagination(page(), +1)}
					>
						Next
						{/* <ArrowRight size={32} variant='Bold' /> */}
						<IconArrowRight size={32} />
					</button>
					{/* </FocusLeaf> */}
				</div>
			</section>
			{/* </FocusContext.Provider> */}

			<Login
				show={openLogin() && !isAuthenticated()}
				onLogin={onLogin}
				onClose={closeLoginHandler}
			/>

			{/* <Transition> */}
			{
				// selectedMedia && openModal && <MediaModal show={openModal} media={selectedMedia || dummyMedia} placeholderImg={modalPlaceholder} authToken={authToken} onAuth={() => setOpenLogin(true)} onExit={onMediaModalClose} />
				<MediaModal
					show={openModal()}
					media={selectedMedia()}
					placeholderImg={modalPlaceholder()}
					authToken={authToken()}
					onAuth={openLoginHandler}
					onExit={onMediaModalClose}
				/>
			}
			{/* </Transition> */}
		</main>
	);
}
