import { FocusContext, setFocus } from "@/spatial-nav";
import { useFocusable } from "@/spatial-nav/useFocusable";
import { IconSearch, IconZoomFilled } from "@tabler/icons-solidjs";
import FocusLeaf from "./FocusLeaf";
import { createEffect } from "solid-js";

interface NavProps {
	query: string;
	updateQuery: (value: string) => void;
	onSearch: () => void;
	showFavorites: () => void;
}

const Navbar = function Navbar(props: NavProps) {
	// console.log("Navbar is re-rendering")
	const { setRef, focusKey, focused, hasFocusedChild } = useFocusable();

	createEffect(() => {
		setFocus("Nav-Favorites");
	});

	return (
		<FocusContext.Provider value={focusKey()}>
			<nav
				class={`flex flex-col items-center justify-between gap-5 lg:flex-row ${
					hasFocusedChild() ? "border-4 border-yellow-300" : ""
				}`}
				ref={setRef}
			>
				<div class="flex items-center gap-12 font-medium text-white text-opacity-80">
					<FocusLeaf
						focusedStyles="after:block animateUnderline"
						customFocusKey="Nav-Favorites"
					>
						<a class="cursor-pointer" onClick={props.showFavorites}>
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
					onEnterPress={props.onSearch}
				>
					<form
						class="group relative"
						onSubmit={(e) => {
							e.preventDefault();
							props.onSearch();
						}}
					>
						<input
							class="h-14 w-full rounded-xl border border-[rgba(249,249,249,0.10)] bg-gray-700 bg-opacity-10 px-14 py-3 text-sm text-white outline-none placeholder:text-sm placeholder:text-gray-300 lg:w-[350px]"
							placeholder="Search Movies or TV Shows"
							onChange={(e) => props.updateQuery(e.target.value)}
						/>
						<IconSearch
							size={24}
							class="icon absolute left-4 top-1/2 -translate-y-1/2 duration-300 ease-in-out"
						/>
						<button
							class={`-group-hover:visible -group-hover:opacity-100 invisible absolute right-4 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg bg-yellow-300 opacity-0 ease-in-out ${
								props.query ? "!visible !opacity-100" : ""
							}`}
							onClick={(e) => {
								e.preventDefault();
								props.onSearch();
							}}
						>
							<IconZoomFilled color="#21201E" size={16} />
						</button>
					</form>
				</FocusLeaf>
			</nav>
		</FocusContext.Provider>
	);
};

export default Navbar;
