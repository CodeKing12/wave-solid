// import { memo } from "react";
// import { useFocusable, FocusContext } from "@noriginmedia/norigin-spatial-navigation";
// import { Video, VideoVertical, MusicCircle, MagicStar, VideoOctagon, Magicpen, UserTag, Slider, ArrowLeft2, ArrowRight2, SidebarLeft, SidebarRight, Logout } from "iconsax-react"
// import FocusLeaf from "./FocusLeaf";

import { IconBrush, IconComet, IconCurrencyKroneCzech, IconDeviceTv, IconDisc, IconLanguage, IconLayoutSidebarLeftCollapseFilled, IconLayoutSidebarLeftExpandFilled, IconLogout, IconLogout2, IconMovie, IconStereoGlasses } from "@tabler/icons-solidjs";
import { JSXElement } from "solid-js";


export type PageType = "" | "movies" | "series" | "concerts" | "fairy_tales" | "animated_movies" | "animated_series" | "movies_czsk" | "series_czsk" | "search";

interface SidebarItemProps { 
    icon: JSXElement,
    text: string,
    page: PageType,
    // Remove the props below in the future and find a better way to do this without passing it into the component individually
    current: PageType,
    onItemClick: (page: PageType) => void
}

interface SidebarProps {
    current: PageType,
    isHidden: boolean,
    isLoggedIn: boolean;
    finishedLoading: boolean;
    onHide: (isHidden: boolean) => void,
    onChange: (newVal: PageType) => void,
    onLoginClick: () => void,
    onLogout: () => void,
}

const NavItem = function NavItem({ icon, text, page, current, onItemClick }: SidebarItemProps) {
    // console.log("Nav Item is re-rendering")
    // const { ref, focused } = useFocusable({onEnterPress: () => onItemClick(page)});

    return (
        <a 
            // ref={ref}
            class={`flex gap-5 items-center text-base active:font-semibold cursor-pointer py-2 px-8 w-full border-r-2 border-yellow-300 border-opacity-0 hover:border-opacity-100 hover:text-yellow-300 hover:fill-yellow-300 opacity-80 ${page === current ? "text-yellow-300 fill-yellow-300 opacity-100 border-r-4 border-opacity-100" : ""}`} 
            onClick={() => onItemClick(page)}
        >
            {icon}
            <span>{ text }</span>
        </a>
    )
}

const Sidebar = function Sidebar(props: SidebarProps) {
    // console.log("Sidebar is re-rendering")
    // const {
    //     ref,
    //     focusSelf,
    //     hasFocusedChild,
    //     focusKey
    //     // setFocus, -- to set focus manually to some focusKey
    //     // navigateByDirection, -- to manually navigate by direction
    //     // pause, -- to pause all navigation events
    //     // resume, -- to resume all navigation events
    //     // updateAllLayouts, -- to force update all layouts when needed
    //     // getCurrentFocusKey -- to get the current focus key
    // } = useFocusable({
    //     focusable: !isHidden,
    //     autoRestoreFocus: true,
    //     onArrowPress: () => true,
    // });

    // createEffect(() => {
    //     focusSelf();
    // });

    return (
        // <FocusContext.Provider value={focusKey}>
            <aside id="sidenav" class={`sidenav z-[100] w-[300px] bg-black-1 h-full min-h-screen fixed top-0 bottom-0 left-0 pt-20 pb-6 duration-500 ease-in-out ${props.isHidden ? "!-left-[300px]" : ""} ${props.finishedLoading ? "" : "is-loading"}`}>
                {/* <FocusLeaf class={`absolute top-0 right-0 opacity-60 hover:opacity-100 duration-300 ease-in-out ${isHidden ? "!-right-10 opacity-80" : ""}`} focusedStyles="!opacity-100" onEnterPress={() => onHide(!isHidden)}> */}
                <div class={`absolute top-0 right-0 opacity-60 hover:opacity-100 duration-300 ease-in-out ${props.isHidden ? "!-right-10 opacity-80" : ""}`}>
                    {/* The right-[260px] is gotten by subtracting the width of the button from the width of the sidebar */}
                    <button class="bg-yellow-300 w-10 h-10 flex justify-center items-center outline-none" onClick={() => props.onHide(!props.isHidden)}>
                        {
                            props.isHidden ?
                            <IconLayoutSidebarLeftExpandFilled size={28} />
                            : <IconLayoutSidebarLeftCollapseFilled size={28} />
                        }
                    </button>
                </div>
                {/* </FocusLeaf> */}
                <div class={`duration-500 ease-in-out ${props.isHidden ? "opacity-0" : ""}`}>
                    <p class="font-semibold text-[rgba(249,249,249,0.67)] text-opacity-[67] mb-5 px-8 text-[15px]">Categories</p>
                    {/* <FocusContext.Provider value={focusKey}> */}
                        <div class="text-white fill-white flex flex-col gap-5">
                            <NavItem icon={<IconMovie size={30} />} text="Movies" page="movies" current={props.current} onItemClick={props.onChange} />
                            <NavItem icon={<IconDeviceTv size={30} />} text="Series" page="series" current={props.current} onItemClick={props.onChange} />
                            <NavItem icon={<IconDisc size={30} />} text="Concerts" page="concerts" current={props.current} onItemClick={props.onChange} />
                            <NavItem icon={<IconComet size={30} />} text="Fairy Tales" page="fairy_tales" current={props.current} onItemClick={props.onChange} />
                            <NavItem icon={<IconStereoGlasses size={30} />} text="Animated Movies" page="animated_movies" current={props.current} onItemClick={props.onChange} />
                            <NavItem icon={<IconBrush size={30} />} text="Animated Series" page="animated_series" current={props.current} onItemClick={props.onChange} />
                            <NavItem icon={<IconCurrencyKroneCzech size={30} />} text="Movies CZ/SK" page="movies_czsk" current={props.current} onItemClick={props.onChange} />
                            <NavItem icon={<IconLanguage size={30} />} text="Series CZ/SK" page="series_czsk" current={props.current} onItemClick={props.onChange} />
                        </div>
                    {/* </FocusContext.Provider> */}
                </div>
                {
                    props.isLoggedIn ? (
                        <div class="absolute bottom-[18px] logout-btn">
                            <button class="mt-auto text-opacity-70 text-white font-medium flex items-center gap-3 py-2 px-8 text-[17px] hover:text-yellow-300 group duration-500 ease-in-out" onClick={props.onLogout}>
                                Logout
                                <IconLogout2 class="text-yellow-300 group-hover:text-white duration-500 ease-in-out" />
                            </button>
                        </div>
                    ) : (
                        <div class="absolute bottom-[18px] login-btn">
                            <button class="py-2.5 px-8 bg-yellow-300 bg-opacity-90 hover:bg-transparent text-black-1 mt-auto font-semibold flex items-center gap-3 hover:text-yellow-300 group border-2 border-l-0 border-yellow-300 duration-500 ease-in-out" onClick={props.onLoginClick}>
                                Login
                                <IconLogout class="text-black group-hover:text-yellow-300 duration-500 ease-in-out" />
                            </button>
                        </div>
                    )
                }
            </aside>
        // </FocusContext.Provider>
    )
}

export default Sidebar