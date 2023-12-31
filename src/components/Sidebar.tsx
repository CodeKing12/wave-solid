import { useFocusable } from "@/spatial-nav/useFocusable";
import { FocusContext } from "@/spatial-nav";
import {
	IconBrush,
	IconComet,
	IconCurrencyKroneCzech,
	IconDeviceTv,
	IconDisc,
	IconLanguage,
	IconLayoutSidebarLeftCollapseFilled,
	IconLayoutSidebarLeftExpandFilled,
	IconLogout,
	IconLogout2,
	IconMovie,
	IconStereoGlasses,
} from "@tabler/icons-solidjs";
import {
	JSXElement,
	Match,
	Show,
	Switch,
	createEffect,
	createSignal,
	onMount,
} from "solid-js";
import FocusLeaf from "./Utilities/FocusLeaf";
import { checkTraktToken, getUserCode } from "@/utils/general";
import { VerifyDeviceData } from "./TraktTypes";
import { useAlert } from "@/AlertContext";
import { useLoader } from "@/LoaderContext";

export type PageType =
	| ""
	| "movies"
	| "series"
	| "concerts"
	| "fairy_tales"
	| "animated_movies"
	| "animated_series"
	| "movies_czsk"
	| "series_czsk"
	| "search";

interface SidebarItemProps {
	icon: JSXElement;
	text: string;
	page: PageType;
	// Remove the props below in the future and find a better way to do this without passing it into the component individually
	current: PageType;
	onItemClick: (page: PageType) => void;
}

interface SidebarProps {
	current: PageType;
	isHidden: boolean;
	traktToken: string;
	isLoggedIn: boolean;
	finishedLoading: boolean;
	onDeviceCode: (traktAuthData: VerifyDeviceData) => void;
	onHide: (isHidden: boolean) => void;
	onChange: (newVal: PageType) => void;
	onLoginClick: () => void;
	onLogout: () => void;
}

const NavItem = function NavItem(props: SidebarItemProps) {
	// console.log("Nav Item is re-rendering")
	const { setRef, focused, focusSelf } = useFocusable({
		onEnterPress: () => props.onItemClick(props.page),
	});

	function handleItemClick() {
		focusSelf();
		props.onItemClick(props.page);
	}

	return (
		<a
			ref={setRef}
			class={`flex w-full cursor-pointer items-center space-x-5 border-transparent border-opacity-0 px-8 py-2 text-[17px] font-medium opacity-70 hover:border-opacity-100 hover:fill-yellow-300 hover:text-yellow-300 active:font-semibold ${
				props.page === props.current
					? "border-r-4 border-yellow-300 border-opacity-100 fill-yellow-300 text-yellow-300 !opacity-100"
					: ""
			} ${
				focused()
					? "!border-x-4 !border-yellow-300 !opacity-100 [&>svg]:!text-yellow-300"
					: ""
			}`}
			onClick={handleItemClick}
		>
			{props.icon}
			<span>{props.text}</span>
		</a>
	);
};

const Sidebar = function Sidebar(props: SidebarProps) {
	const { addAlert } = useAlert();
	const { setShowLoader } = useLoader();

	const {
		setRef,
		focusSelf,
		hasFocusedChild,
		focusKey,
		// setFocus, -- to set focus manually to some focusKey
		// navigateByDirection, -- to manually navigate by direction
		// pause, -- to pause all navigation events
		// resume, -- to resume all navigation events
		// updateAllLayouts, -- to force update all layouts when needed
		// getCurrentFocusKey -- to get the current focus key
	} = useFocusable({
		get focusable() {
			return !props.isHidden;
		},
		autoRestoreFocus: false,
		saveLastFocusedChild: false,
		onArrowPress: () => true,
	});
	const [pollData, setPollData] = createSignal<
		VerifyDeviceData | "failed" | undefined
	>();
	const [traktToken, setTraktToken] = createSignal<string | undefined>();

	// onMount(() => {
	// 	const { isValid, access_token } = checkTraktToken();

	// 	if (isValid) {
	// 		setTraktToken(access_token);
	// 	} else {
	// 		localStorage.removeItem("trakt-auth");
	// 	}
	// });

	createEffect(() => {
		focusSelf();
	});

	createEffect(() => {
		if (props.traktToken && props.traktToken.length > 0) {
			setTraktToken(props.traktToken);
		}
	});

	async function loginTrakt() {
		setShowLoader(true);
		const authInfo = await getUserCode();
		setShowLoader(false);

		if (authInfo.status === "error") {
			setPollData("failed");
			addAlert({
				title:
					`<em>${authInfo.error?.message} </em> while trying to acquire Trakt User Code` ||
					"Failed to acquire Trakt User Code",
				type: "error",
			});
		} else {
			// authInfo.result follows the VerifyDeviceData type interface
			setPollData(authInfo.result);
			props.onDeviceCode({
				user_code: authInfo.result.user_code,
				verification_url: authInfo.result.verification_url,
				expires_in: authInfo.result.expires_in,
				device_code: authInfo.result.device_code,
				interval: authInfo.result.interval,
			});
		}
	}

	return (
		<aside
			id="sidenav"
			class={`sidenav fixed bottom-0 left-0 top-0 z-[100] h-full min-h-screen w-[320px] bg-black-1 pb-6 pt-20 duration-500 ease-in-out ${
				props.isHidden ? "!-left-[300px]" : ""
			} ${props.finishedLoading ? "" : "is-loading"}`}
		>
			<FocusLeaf
				class={`absolute right-0 top-0 opacity-60 duration-300 ease-in-out hover:opacity-100 ${
					props.isHidden ? "!-right-10 opacity-80" : ""
				}`}
				focusedStyles="!opacity-100"
				onEnterPress={() => props.onHide(!props.isHidden)}
			>
				{/* The right-[260px] is gotten by subtracting the width of the button from the width of the sidebar */}
				<button
					class="flex h-10 w-10 items-center justify-center bg-yellow-300 outline-none"
					onClick={() => props.onHide(!props.isHidden)}
				>
					{props.isHidden ? (
						<IconLayoutSidebarLeftExpandFilled size={28} />
					) : (
						<IconLayoutSidebarLeftCollapseFilled size={28} />
					)}
				</button>
			</FocusLeaf>
			<div
				class={`duration-500 ease-in-out ${
					props.isHidden ? "opacity-0" : ""
				}`}
			>
				<p class="mb-5 px-8 text-[15px] font-semibold text-[rgba(249,249,249,0.67)] text-opacity-[67]">
					Categories
				</p>
				<FocusContext.Provider value={focusKey()}>
					<div
						class="flex flex-col space-y-5 fill-white text-white"
						classList={{
							// "!border-yellow-300 !border-2": focused(),
							hasFocusedChildren: hasFocusedChild(),
						}}
						ref={setRef}
					>
						<NavItem
							icon={<IconMovie size={30} />}
							text="Movies"
							page="movies"
							current={props.current}
							onItemClick={props.onChange}
						/>
						<NavItem
							icon={<IconDeviceTv size={30} />}
							text="Series"
							page="series"
							current={props.current}
							onItemClick={props.onChange}
						/>
						<NavItem
							icon={<IconDisc size={30} />}
							text="Concerts"
							page="concerts"
							current={props.current}
							onItemClick={props.onChange}
						/>
						<NavItem
							icon={<IconComet size={30} />}
							text="Fairy Tales"
							page="fairy_tales"
							current={props.current}
							onItemClick={props.onChange}
						/>
						<NavItem
							icon={<IconStereoGlasses size={30} />}
							text="Animated Movies"
							page="animated_movies"
							current={props.current}
							onItemClick={props.onChange}
						/>
						<NavItem
							icon={<IconBrush size={30} />}
							text="Animated Series"
							page="animated_series"
							current={props.current}
							onItemClick={props.onChange}
						/>
						<NavItem
							icon={<IconCurrencyKroneCzech size={30} />}
							text="Movies CZ/SK"
							page="movies_czsk"
							current={props.current}
							onItemClick={props.onChange}
						/>
						<NavItem
							icon={<IconLanguage size={30} />}
							text="Series CZ/SK"
							page="series_czsk"
							current={props.current}
							onItemClick={props.onChange}
						/>
					</div>
				</FocusContext.Provider>
			</div>
			<div class="absolute bottom-2 flex flex-col gap-2">
				<Switch>
					<Match when={props.isLoggedIn}>
						<FocusLeaf
							class="logout-btn"
							focusedStyles="logout-btn-onfocus"
							onEnterPress={props.onLogout}
						>
							<button
								class="group mt-auto flex items-center space-x-3 px-8 py-2 text-[17px] font-medium text-white text-opacity-70 duration-500 ease-in-out hover:text-yellow-300"
								onClick={props.onLogout}
							>
								<span>Logout Webshare</span>
								<IconLogout2 class="text-yellow-300 duration-500 ease-in-out group-hover:text-white" />
							</button>
						</FocusLeaf>
					</Match>
					<Match when={!props.isLoggedIn}>
						<FocusLeaf
							class="login-btn"
							focusedStyles="login-btn-onfocus"
							onEnterPress={props.onLoginClick}
						>
							<button
								class="group mt-auto flex items-center space-x-3 border-2 border-l-0 border-yellow-300 bg-yellow-300 bg-opacity-90 px-8 py-2.5 font-semibold text-black-1 duration-500 ease-in-out hover:bg-transparent hover:text-yellow-300"
								onClick={props.onLoginClick}
							>
								<span>Webshare</span>
								<IconLogout class="text-black duration-500 ease-in-out group-hover:text-yellow-300" />
							</button>
						</FocusLeaf>
					</Match>
				</Switch>
				<Show when={!traktToken() || !Boolean(traktToken()?.length)}>
					<FocusLeaf
						class="login-btn w-full"
						focusedStyles="login-btn-onfocus"
						onEnterPress={loginTrakt}
					>
						<button
							class="group mt-auto flex w-full items-center space-x-3 border-2 border-l-0 border-yellow-300 bg-yellow-300 bg-opacity-90 px-8 py-2.5 font-semibold text-black-1 duration-500 ease-in-out hover:bg-transparent hover:text-yellow-300"
							onClick={loginTrakt}
						>
							<span>Trakt.TV</span>
							<IconLogout class="text-black duration-500 ease-in-out group-hover:text-yellow-300" />
						</button>
					</FocusLeaf>
				</Show>
				{/* {"Trakt Token: " + traktToken() + " " + Boolean(traktToken())} */}
			</div>
		</aside>
	);
};

export default Sidebar;
