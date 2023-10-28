// import { useFocusable, FocusContext } from "@noriginmedia/norigin-spatial-navigation";
// import FocusLeaf from "./FocusLeaf";
// import { SearchNormal, SearchNormal1 } from "iconsax-react";

import { IconSearch, IconZoomFilled } from "@tabler/icons-solidjs";

interface NavProps {
    query: string;
    updateQuery: (value: string) => void;
    onSearch: () => void;
    showFavorites: () => void;
}
 
const Navbar = function Navbar(props: NavProps) {
    // console.log("Navbar is re-rendering")
    // const { ref, focusKey, focused, hasFocusedChild } = useFocusable()
  
    return (
      // <FocusContext value={focusKey}>
        <nav class={`flex flex-col lg:flex-row gap-5 items-center justify-between`}>
          <div class="flex gap-12 items-center text-white text-opacity-80 font-medium">
            <div>
              <a class="cursor-pointer" onClick={props.showFavorites}>Favorites</a>
            </div>
            <div>
              <a class="cursor-pointer">Watched</a>
            </div>
          </div>
  
          <div class="w-full lg:w-fit text-[#AEAFB2]">
            <form class="relative group" onSubmit={(e) => {e.preventDefault();props.onSearch()}}>
                <input class="w-full lg:w-[350px] h-14 px-14 py-3 text-white text-sm bg-gray-700 bg-opacity-10 rounded-xl border border-[rgba(249,249,249,0.10)] placeholder:text-gray-300 placeholder:text-sm outline-none" placeholder="Search Movies or TV Shows" onChange={(e) => props.updateQuery(e.target.value)} />
                <IconSearch size={24} class="absolute top-1/2 -translate-y-1/2 left-4 icon ease-in-out duration-300" />
                <button class={`w-8 h-8 bg-yellow-300 rounded-lg absolute top-1/2 -translate-y-1/2 right-4 flex items-center justify-center opacity-0 invisible -group-hover:visible -group-hover:opacity-100 ease-in-out ${props.query ? "!visible !opacity-100" : ""}`} onClick={(e) => {e.preventDefault();props.onSearch()}}>
                  <IconZoomFilled color="#21201E" size={16} />
                </button>
            </form>
          </div>
        </nav>
      // </FocusContext.Provider>
    )
}

export default Navbar