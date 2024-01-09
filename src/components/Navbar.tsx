import { FocusContext, setFocus } from "@/spatial-nav";
import { useFocusable } from "@/spatial-nav/useFocusable";
import {
	IconBookmarksFilled,
	IconHeartFilled,
	IconSearch,
	IconZoomFilled,
} from "@tabler/icons-solidjs";
import FocusLeaf from "./Utilities/FocusLeaf";
import { Show, createEffect, createSignal } from "solid-js";
import "@/css/layout.css";
import { SyncType } from "./TraktTypes";
import { Transition } from "solid-transition-group";

interface NavProps {
	onSearch: (searchTerm: string) => void;
	showSynced: (type: SyncType) => void;
	handleNav: (name: string) => void;
	currentDisplay: SyncType | "media";
}

const Navbar = function Navbar(props: NavProps) {
	// console.log("Navbar is re-rendering")
	const { setRef, focusKey, hasFocusedChild } = useFocusable({});
	const [searchTerm, setSearchTerm] = createSignal("");

	function handleSearch(e: Event | undefined) {
		if (e) {
			e.preventDefault();
		}
		props.onSearch(searchTerm());
	}

	createEffect(() => {
		setFocus("Nav-Favorites");
	});

	return (
		<FocusContext.Provider value={focusKey()}>
			<nav
				class={`navbar block ${
					hasFocusedChild() ? "border-4 border-yellow-300" : ""
				}`}
				ref={setRef}
			>
				<div class="flex flex-col items-center justify-between space-y-5 xl:flex-row xl:space-y-0">
					<div class="flex flex-wrap items-center space-x-11 text-lg font-medium text-white text-opacity-80 duration-300 ease-in-out sm:flex-nowrap">
						<FocusLeaf
							focusedStyles="after:block animateUnderline"
							class="hover:text-yellow-300"
							customFocusKey="Nav-Favorites"
							onEnterPress={() => props.showSynced("favorites")}
						>
							<a
								class="flex cursor-pointer items-center gap-2"
								onClick={() => props.showSynced("favorites")}
							>
								Favorites
								<Transition name="slide">
									<Show
										when={
											props.currentDisplay === "favorites"
										}
									>
										<IconHeartFilled
											class="text-yellow-300"
											width={24}
										/>
									</Show>
								</Transition>
							</a>
						</FocusLeaf>
						<FocusLeaf
							focusedStyles="after:block animateUnderline"
							class="hover:text-yellow-300"
							onEnterPress={() => props.showSynced("watchlist")}
						>
							<a
								onclick={() => props.showSynced("watchlist")}
								class="flex cursor-pointer items-center gap-2"
							>
								Watchlist
								<Transition name="slide">
									<Show
										when={
											props.currentDisplay === "watchlist"
										}
									>
										<IconBookmarksFilled
											class="text-yellow-300"
											width={24}
										/>
									</Show>
								</Transition>
							</a>
						</FocusLeaf>
						<FocusLeaf
							focusedStyles="after:block animateUnderline"
							class="hover:text-yellow-300"
						>
							<a class="cursor-pointer">History</a>
						</FocusLeaf>
						<FocusLeaf
							focusedStyles="after:block animateUnderline"
							class="hover:text-yellow-300"
							onEnterPress={() => props.handleNav("settings")}
						>
							<a
								class="cursor-pointer"
								onclick={() => props.handleNav("settings")}
							>
								Settings
							</a>
						</FocusLeaf>
					</div>

					<FocusLeaf
						isForm
						class="w-full text-[#AEAFB2] xl:w-fit"
						focusedStyles="searchFocus"
						onEnterPress={() => handleSearch(undefined)}
					>
						<form
							class="search-form group relative"
							onSubmit={handleSearch}
						>
							<input
								class="h-14 w-full rounded-xl border border-[rgba(249,249,249,0.10)] px-14 py-3 text-base text-white outline-none placeholder:text-base placeholder:text-gray-300 xl:w-[350px]"
								placeholder="Search Movies or TV Shows"
								onInput={(e) => setSearchTerm(e.target.value)}
							/>
							<IconSearch
								size={24}
								class="icon absolute left-4 top-1/2 duration-300 ease-in-out"
								// -translate-y-1/2 will be applied in css file for backwards compatibility for chrome 47
							/>
							<input class="hidden" type="submit" />
							<button
								class="-group-hover:visible -group-hover:opacity-100 invisible absolute right-4 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg bg-yellow-300 text-black-1 opacity-0 ease-in-out"
								classList={{
									"!visible !opacity-100":
										searchTerm().length > 0,
								}}
								onClick={handleSearch}
							>
								<IconZoomFilled size={16} />
							</button>
						</form>
					</FocusLeaf>
				</div>
			</nav>
		</FocusContext.Provider>
	);
};

export default Navbar;
