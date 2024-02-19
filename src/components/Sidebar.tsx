import { useFocusable } from "@/spatial-nav/useFocusable";
import { FocusContext } from "@/spatial-nav";
import { Trans } from '@mbarzda/solid-i18next';
import { useTransContext } from '@mbarzda/solid-i18next';
import { useTranslation } from '@mbarzda/solid-i18next';
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
				<div class="logo-container px-10 py-5">
					<svg
						class="icon-logo"
						xmlns="http://www.w3.org/2000/svg"
						width="120.000000pt"
						height="120.000000pt"
						viewBox="0 0 500.000000 500.000000"
						fill="none"
					>
						<path
							d="m 267.18561,2.5918686 c -4.5328,-0.22344 -8.86982,-0.10586 -12.94482,0.36914 -7.29999,0.9 -16.0002,4.10108 -24.70019,9.1010804 -4.1,2.39999 -17.70023,15.39895 -48.7002,46.39892 -40.69996,40.79995 -43.39962,43.299801 -51.09961,47.299801 -8.59999,4.39999 -21.19991,8.20019 -27.3999,8.20019 -3.199997,0 -3.700297,0.40069 -4.800287,3.20069 -2.1,5.99999 -4.29991,18.2002 -4.89991,27.70019 -0.8,11.79999 -0.49989,12.09961 11.600097,12.09961 10.39999,0 19.10011,-2.00049 29.6001,-7.00049 11.29999,-5.19999 18.89943,-11.29972 33.89941,-26.69971 41.79996,-42.999941 68.69962,-69.400281 75.09961,-73.800281 10.69999,-7.29999 26.2007,-15.2001 37.70069,-19.1001 12.59998,-4.29999 28.59912,-6.39921 35.09912,-4.69921 3.39999,0.99999 4.60097,0.8997 6.50097,-0.3003 4.7,-3.09999 1.29931,-6.80039 -10.70068,-11.90039 C 296.14002,7.0110186 280.78404,3.2621786 267.18561,2.5918686 Z m -71.0332,5.81983 c -1.9375,0.175 -5.06153,1.2997003 -9.81152,3.4497004 -21.59998,9.59999 -45.70031,28.7008 -60.30029,47.80078 -8,10.39999 -17.80049,26.598827 -17.50049,28.798827 0.7,5.099996 12.79991,1.30029 22.8999,-7.199707 2.5,-2.09999 10.20098,-9.7003 17.00098,-16.80029 6.79999,-7.19999 20.89893,-21.69981 31.39892,-32.2998 12.99999,-13.29999 19.0005,-19.99952 19.0005,-21.49951 0,-1.6500001 -0.75049,-2.4250004 -2.688,-2.2500004 z M 323.26569,43.162179 c -5.49999,-0.1 -11.17481,0.14981 -15.4248,0.79981 -17.39998,2.6 -41.00099,12.59972 -56.00098,23.69971 -4.89999,3.69999 -23.40002,21.599237 -48,46.699201 -21.99998,22.39998 -42.9,42.9002 -46.5,45.7002 -15.49998,11.79999 -31.19885,17.00059 -51.29883,17.10059 -12.399977,0 -12.900677,0.0998 -13.700677,2.2998 -0.9,2.3 1.3,15.20021 4.5,26.2002 2.4,8.29999 3.799527,8.7997 22.999507,8.6997 14.79999,0 16.70099,-0.19932 24.50098,-2.79931 18.19998,-6 29.50002,-13.90022 48,-33.7002 23.89997,-25.59997 61.59981,-62.59971 69.7998,-68.69971 19.99998,-14.899978 39.69983,-22.900384 62.29981,-25.400381 17.99998,-2 38.30021,1.399327 53.20019,8.799313 5.9,2.9 7.4002,3.00097 8.2002,0.50098 1.3,-4.199996 -10.5005,-22.200593 -22.00049,-33.600583 -8.09999,-8.09999 -16.6002,-13 -26.2002,-15 -3.54999,-0.75 -8.87451,-1.19932 -14.37451,-1.29932 z m 17.44922,60.562491 c -5.97499,-0.3625 -11.97403,-0.31269 -16.37402,0.23731 -15.99999,2 -31.7006,7.69903 -44.10059,15.99902 -4.09999,2.7 -22.29944,20.30101 -50.39941,48.50098 -26.29998,26.49997 -46.40098,45.79922 -50.00098,48.19922 -8.99999,5.99999 -21.39972,12 -31.19971,15 -7.69999,2.29999 -10.69962,2.70039 -24.0996,2.90039 -8.6,0.1 -15.8004,0.59971 -16.4004,1.1997 -1.29999,1.3 2.30089,8.19982 11.40088,21.79981 20.09998,30.09997 55.49985,53.49991 93.79981,61.8999 11.59999,2.6 43.59913,3.2001 57.59912,1.1001 27.69997,-4.1 50.5007,-13.50011 72.20068,-29.6001 14.69999,-10.99999 31.19923,-32.29953 42.19922,-54.49951 6.1,-12.49999 12,-28.39971 12,-32.69971 0,-0.8 -2.49902,-3.8002 -5.49902,-6.70019 -19.19998,-18.19998 -53.60061,-18.79959 -80.10059,-1.59961 -3.19999,2.2 -15.79981,13.69923 -27.7998,25.69922 -24.29998,24.19997 -25.0002,24.60087 -30.7002,18.90088 -2.5,-2.5 -2.90039,-3.7002 -2.90039,-8.2002 v -5.2998 l 19.30078,-19.1001 c 26.19998,-25.99998 37.99983,-34.40079 56.29981,-40.30078 14.39998,-4.7 34.3004,-5.39922 47.90039,-1.69922 5.59999,1.5 16.49883,6.39932 22.79883,10.29931 2.69999,1.6 2.90039,1.59971 4.40039,-0.30029 1.3,-1.7 1.40088,-4.19952 0.90088,-15.49951 -0.6,-12.99999 -3.4002,-30.29951 -5.2002,-31.99951 -0.5,-0.4 -4.60069,-3.50088 -9.20068,-6.90088 -9.79999,-7.19999 -20.69913,-12.49961 -30.59912,-15.09961 -4.3,-1.1 -10.25108,-1.87432 -16.22608,-2.23682 z M 34.140693,382.96198 c -3.29999,0 -6.30029,0.59961 -7.80029,1.59961 -3.5,2.4 -4.9,4.29981 -6,8.2998 -0.9,3.2 0.50011,8.10053 14.6001,50.50049 17.89998,53.69995 17.79952,53.60029 27.49951,54.30029 4.49999,0.4 6.00039,0.0986 8.90039,-1.90136 4.3,-2.9 6.7001,-7.59992 13.1001,-25.89991 2.69999,-7.89999 5.20049,-15.09941 5.50049,-15.89941 0.4,-0.8 3.39941,6.9006 6.89941,17.10059 3.399997,10.19999 6.999897,19.69961 7.899897,21.09961 5.1,7.69999 18.80001,7.50048 24,-0.49952 1.5,-2.19999 29.6003,-84.8003 31.8003,-93.30029 3.29999,-12.99999 -14.99992,-21.10028 -24.39991,-10.80029 -2.39999,2.69999 -6.60078,14.10002 -13.30078,36 -3.1,10.39999 -6.09951,19.50019 -6.49951,20.20019 -0.4,0.8 -1.99942,-2.8 -3.89941,-9 -5.9,-18.49998 -8.90059,-25.40068 -12.600587,-28.70068 -4.7,-4.1 -9.49991,-4.89902 -15.3999,-2.49902 -5.9,2.49999 -7.7002,5.69894 -14.2002,25.39892 -2.79999,8.49999 -5.29941,15.69981 -5.39941,15.79981 -0.2,0.2 -1.30049,-2.89903 -2.50049,-6.99903 -1.2,-3.99999 -5.09932,-16.3003 -8.79932,-27.30029 -5.69999,-17.49998 -7.00078,-20.49932 -10.30078,-23.79932 -3.29999,-3.39999 -4.19961,-3.70019 -9.09961,-3.70019 z m 248.575197,0.0747 c -2.9,0 -5.7751,0.47529 -7.4751,1.42529 -1.4,0.8 -3.40078,2.49941 -4.30078,3.89941 -3,4.7 -1.9995,9.69943 5.50049,27.89942 11.09999,26.99997 20.30049,49.3002 25.00049,60.70019 7.49999,18.59998 10.49962,21.60078 21.09961,20.80078 8.99999,-0.7 12.69941,-4.30021 17.39941,-17.20019 2.4,-6.7 9.6006,-24.00014 24.60059,-59.6001 11.19998,-26.49997 11.3994,-27.79942 5.39941,-33.89941 -2.9,-2.9 -4.29932,-3.50127 -8.79932,-3.80127 -5.99999,-0.5 -10.4,1.60029 -13.5,6.30029 -1,1.5 -7.30098,16.50031 -14.00097,33.30029 -8.89999,22.49998 -12.39942,30.09961 -12.89942,28.59961 -3.29999,-9.39999 -23.99961,-59.69981 -25.59961,-62.2998 -1.1,-1.8 -3.30029,-3.89922 -4.80029,-4.69922 -1.8,-0.95 -4.72451,-1.42529 -7.62451,-1.42529 z m -65.2002,0.0117 c -2.94999,0.0625 -5.97568,0.6128 -8.07568,1.6128 -4.4,2.19999 -6.79913,6.09982 -14.09912,23.2998 -29.19997,68.49993 -31.30078,73.60118 -31.30078,77.70117 -0.1,8 5.80049,12.89961 14.50049,12.09961 7.69999,-0.8 10.4002,-3.49981 15.70019,-15.7998 l 2.2002,-5.00098 h 21 21 l 3,6.7002 c 3.29999,7.39999 5.9001,10.70088 10.10009,12.90088 8.3,4.29999 19.79883,-2.10099 19.79883,-11.00098 0,-1.5 -1.99893,-7.39903 -4.39892,-12.99902 -2.4,-5.5 -6.90089,-16.20011 -9.90088,-23.6001 -13.39999,-32.59997 -24.90001,-58.59981 -27,-60.79981 -1.2,-1.3 -3.39991,-3.00127 -4.89991,-3.80127 -1.79999,-0.94999 -4.67451,-1.375 -7.62451,-1.3125 z m 221.79932,0.15088 c -11.32499,-0.0125 -23.92481,0.21211 -31.17481,0.66211 -9.89999,0.7 -12.99931,2.60001 -14.79931,9 -1.3,4.9 -1.3,90.39981 0,95.29981 0.6,2 2.4001,4.80068 4.1001,6.20068 l 3.09961,2.6001 h 32.50048 32.49903 l 3.90088,-3.90088 c 3.49999,-3.5 3.89941,-4.40001 3.89941,-9 0,-4.4 -0.49991,-5.59893 -3.3999,-8.89893 l -3.3999,-3.70019 -22.59961,-0.30029 -22.60108,-0.3003 v -8.50049 -8.39941 h 15 c 17.09998,0 20.8,-0.90069 24,-6.20068 4,-6.5 1.80048,-14.29932 -4.99951,-17.79932 -3.4,-1.7 -5.89943,-1.99951 -18.89941,-1.99951 H 421.5406 l -0.39991,-8.10059 c -0.2,-4.39999 -0.10039,-8.30049 0.0996,-8.50049 0.3,-0.2 8.39962,-0.0993 18.09961,0.20069 21.19998,0.8 26.40049,0 31.00049,-5.2002 2.6,-2.99999 3,-4.30039 3,-8.90039 0,-4.79999 -0.40069,-5.99961 -3.20068,-9.09961 -2.1,-2.2 -4.79932,-3.80039 -7.29932,-4.40039 -2.15,-0.5 -12.2004,-0.74922 -23.52539,-0.76172 z M 217.2403,428.961 c 0.4,0 2.79942,4.80069 5.39942,10.70069 2.59999,5.99999 4.70068,11.10048 4.70068,11.50048 0,1 -19.99951,0.99961 -19.99951,0.0996 0,-1.3 9.39941,-22.30078 9.89941,-22.30078 z"
							fill="currentColor"
							transform="stroke-width:0.1"
						></path>
					</svg>
				</div>
			<div
				class={`duration-500 ease-in-out ${
					props.isHidden ? "opacity-0" : ""
				}`}
			>
				<p class="mb-5 px-8 text-[15px] font-semibold text-[rgba(249,249,249,0.67)] text-opacity-[67]">
					<Trans key="categories" />
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
							text={<Trans key="movies" />}
							page="movies"
							current={props.current}
							onItemClick={props.onChange}
						/>
						<NavItem
							icon={<IconDeviceTv size={30} />}
							text={<Trans key="series" />}
							page="series"
							current={props.current}
							onItemClick={props.onChange}
						/>
						<NavItem
							icon={<IconDisc size={30} />}
							text={<Trans key="concerts" />}
							page="concerts"
							current={props.current}
							onItemClick={props.onChange}
						/>
						<NavItem
							icon={<IconComet size={30} />}
							text={<Trans key="fairy_tales" />}
							page="fairy_tales"
							current={props.current}
							onItemClick={props.onChange}
						/>
						<NavItem
							icon={<IconStereoGlasses size={30} />}
							text={<Trans key="animated_movies" />}
							page="animated_movies"
							current={props.current}
							onItemClick={props.onChange}
						/>
						<NavItem
							icon={<IconBrush size={30} />}
							text={<Trans key="animated_series" />}
							page="animated_series"
							current={props.current}
							onItemClick={props.onChange}
						/>
						<NavItem
							icon={<IconCurrencyKroneCzech size={30} />}
							text={<Trans key="movies_czsk" />}
							page="movies_czsk"
							current={props.current}
							onItemClick={props.onChange}
						/>
						<NavItem
							icon={<IconLanguage size={30} />}
							text={<Trans key="series_czsk" />}
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
								class="group mt-auto flex items-center space-x-8 border-2 border-l-0 border-yellow-300 bg-yellow-300 bg-opacity-90 px-8 py-2.5 font-semibold text-black-1 duration-500 ease-in-out hover:bg-transparent hover:text-yellow-300"
								onClick={props.onLogout}
							>
								<span><Trans key="logout_webshare" /></span>
								<IconLogout2 class="text-black duration-500 ease-in-out group-hover:text-yellow-300" />
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
