import { For, createSignal } from "solid-js";
import MediaCard from "./MediaCard";
import MediaModal from "./MediaModal";
import { MediaObj } from "./MediaTypes";
// import Transition from "./Transition";
// import { useFocusable, FocusContext, FocusDetails, FocusableComponentLayout } from "@noriginmedia/norigin-spatial-navigation";

export interface MediaListProps {
    media?: MediaObj[],
    isModalOpen?: boolean,
    isSidebarOpen: boolean,
    // onCardFocus: (focusDetails: FocusableComponentLayout) => void,
    onMediaModalOpen: (mediaInfo: MediaObj) => void,
}

const MediaList = function MediaList(props: MediaListProps) {
    // const { ref, focusKey, hasFocusedChild } = useFocusable()
    console.log(props.media)

    // console.log("MediaList is re-rendering")
    const onCardSelect = (mediaInfo: MediaObj) => {
        // isAuthenticated ? displayMediaInfo(mediaInfo) : onMovieSelect(true)
        props.onMediaModalOpen(mediaInfo);
    }

    const onCardPress = (mediaInfo: MediaObj) => {
        // console.log("Card Pressed")
        onCardSelect(mediaInfo);
    };


    return (
        <>
            {/* <FocusContext.Provider value={focusKey}> */}
                {/* <div class={`${hasFocusedChild ? 'menu-expanded' : 'menu-collapsed'}`} ref={ref}> */}
                <div>
                    {/* <div class={`flex justify-center flex-wrap gap-4 ${isModalOpen ? "!overflow-hidden" : ""}`}> */}
                    <div id="media-list" class={`grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 justify-center flex-wrap gap-y-4 gap-x-1 md:gap-x-2 ${props.isModalOpen ? "!overflow-hidden" : ""} ${props.isSidebarOpen ? "lg:!grid-cols-4 xl:!grid-cols-5 2xl:!grid-cols-6" : "listIsHidden"}`}>
                    {/* grid-cols-1 sm:grid-cols-2 */}
                        <For each={props.media}>
                            {
                                (show: MediaObj) => 
                                <MediaCard id={show?._id} media={show} showMediaInfo={onCardSelect} onEnterPress={onCardPress} />
                            }
                        </For>
                    </div>
                </div>
            {/* </FocusContext.Provider> */}

            {/* { 
                openModal ? 
                <Transition>
                    <MediaModal show={openModal && isAuthenticated} media={selectedMedia} authToken={authToken} onExit={() => setOpenModal(false)} />
                </Transition>
                : ""
            } */}
        </>
    )
}

export default MediaList;