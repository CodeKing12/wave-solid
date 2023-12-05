import { FocusContext, setFocus } from "@/spatial-nav";
import { useFocusable } from "@/spatial-nav/useFocusable";
import { IconSearch, IconZoomFilled } from "@tabler/icons-solidjs";
import FocusLeaf from "./Utilities/FocusLeaf";
import { createEffect, createSignal } from "solid-js";
import "@/css/layout.css";

interface NavProps {
	onSearch: (searchTerm: string) => void;
	showFavorites: () => void;
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
				<div class="flex flex-col items-center justify-between space-y-5 lg:flex-row lg:space-y-0">
					<div class="flex items-center space-x-12 text-lg font-medium text-white text-opacity-80">
						<FocusLeaf
							focusedStyles="after:block animateUnderline"
							customFocusKey="Nav-Favorites"
						>
							<a
								class="cursor-pointer"
								onClick={props.showFavorites}
							>
								Favorites
							</a>
						</FocusLeaf>
						<FocusLeaf focusedStyles="after:block animateUnderline">
							<a class="cursor-pointer">Watched</a>
						</FocusLeaf>
					</div>

					<FocusLeaf
						isForm
						class="w-full text-[#AEAFB2] lg:w-fit"
						focusedStyles="searchFocus"
						onEnterPress={() => handleSearch(undefined)}
					>
						<form
							class="search-form group relative"
							onSubmit={handleSearch}
						>
							<input
								class="h-14 w-full rounded-xl border border-[rgba(249,249,249,0.10)] px-14 py-3 text-base text-white outline-none placeholder:text-base placeholder:text-gray-300 lg:w-[350px]"
								placeholder="Search Movies or TV Shows"
								onInput={(e) => setSearchTerm(e.target.value)}
							/>
							<IconSearch
								size={24}
								class="icon absolute left-4 top-1/2 duration-300 ease-in-out"
								// -translate-y-1/2 will be applied in css file for backwards compatibility for chrome 47
							/>
							<button
								class={`-group-hover:visible -group-hover:opacity-100 invisible absolute right-4 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg bg-yellow-300 text-black-1 opacity-0 ease-in-out ${
									searchTerm() ? "!visible !opacity-100" : ""
								}`}
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
