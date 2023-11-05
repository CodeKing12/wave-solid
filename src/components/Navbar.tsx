// import { useFocusable, FocusContext } from "@noriginmedia/norigin-spatial-navigation";
// import FocusLeaf from "./FocusLeaf";
// import { SearchNormal, SearchNormal1 } from "iconsax-react";

import { FocusContext } from "@/spatial-nav";
import { useFocusable } from "@/spatial-nav/useFocusable";
import { IconSearch, IconZoomFilled } from "@tabler/icons-solidjs";

interface NavProps {
	query: string;
	updateQuery: (value: string) => void;
	onSearch: () => void;
	showFavorites: () => void;
}

const Navbar = function Navbar(props: NavProps) {
	// console.log("Navbar is re-rendering")
	const { setRef, focusKey, focused, hasFocusedChild } = useFocusable({});

	return (
		<FocusContext.Provider value={focusKey}>
			<nav
				class={`flex flex-col items-center justify-between gap-5 lg:flex-row ${
					focused ? "border-4 border-yellow-300" : ""
				}`}
				ref={setRef}
			>
				<div class="flex items-center gap-12 font-medium text-white text-opacity-80">
					<div>
						<a class="cursor-pointer" onClick={props.showFavorites}>
							Favorites
						</a>
					</div>
					<div>
						<a class="cursor-pointer">Watched</a>
					</div>
				</div>

				<div class="w-full text-[#AEAFB2] lg:w-fit">
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
				</div>
			</nav>
		</FocusContext.Provider>
	);
};

export default Navbar;
