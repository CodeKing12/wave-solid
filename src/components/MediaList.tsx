import { Index, Show } from "solid-js";
import MediaCard from "./MediaCard";
import { MediaObj } from "./MediaTypes";
import { Spinner, SpinnerType } from "solid-spinner";
import { FocusableComponentLayout } from "@/spatial-nav";
import "@/css/media.css";

export interface MediaListProps {
	media?: MediaObj[];
	isLoading: boolean;
	isModalOpen?: boolean;
	isSidebarOpen: boolean;
	onCardFocus: (focusDetails: FocusableComponentLayout) => void;
	onMediaModalOpen: (mediaInfo: MediaObj) => void;
}

const MediaList = function MediaList(props: MediaListProps) {
	// const { setRef, focusKey, hasFocusedChild, focusSelf } = useFocusable({forceFocus: true});

	// createEffect(() => {
	// 	console.log(props.media)
	// 	focusSelf();
	// });

	const dummyData = Array(100).fill({});

	// console.log("MediaList is re-rendering")
	const onCardSelect = (mediaInfo: MediaObj) => {
		// isAuthenticated ? displayMediaInfo(mediaInfo) : onMovieSelect(true)
		props.onMediaModalOpen(mediaInfo);
	};

	const onCardPress = (mediaInfo: MediaObj) => {
		// console.log("Card Pressed")
		onCardSelect(mediaInfo);
	};

	// return (<div></div>)

	return (
		<>
			{/* <div class={`${hasFocusedChild ? 'menu-expanded' : 'menu-collapsed'}`} ref={ref}> */}
			<div>
				{/* <div class={`flex justify-center flex-wrap gap-4 ${isModalOpen ? "!overflow-hidden" : ""}`}> */}
				<div
					id="media-list"
					// class={`grid grid-cols-1 flex-wrap justify-center space-x-1 space-y-4 xs:grid-cols-2 sm:grid-cols-3 md:space-x-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 ${
					class={`-mt-4 flex flex-wrap space-x-1.5 [&>div]:mt-4 ${
						props.isModalOpen ? "!overflow-hidden" : ""
					} ${props.isSidebarOpen ? "" : "sidebarVisible"}`}
				>
					{/* grid-cols-1 sm:grid-cols-2 */}
					{/* fallback={<Spinner type={SpinnerType.puff} width={70} height={70} color="#fde047" class="!absolute top-[37%] left-1/2 -translate-x-1/2 -translate-y-1/2" />} */}
					{/* Can use this for the placeholder: <Suspense></Suspense> */}
					<Show
						when={!props.isLoading}
						fallback={
							<Spinner
								type={SpinnerType.puff}
								width={70}
								height={70}
								color="#fde047"
								class="!absolute left-1/2 top-[37%] -translate-x-1/2 -translate-y-1/2"
							/>
						}
					>
						<Index each={props.media}>
							{(show, index) => (
								<MediaCard
									id={show()?._id}
									index={index}
									media={show()}
									showMediaInfo={onCardSelect}
									onFocus={props.onCardFocus}
									onEnterPress={onCardPress}
								/>
							)}
						</Index>
					</Show>
				</div>
			</div>
		</>
	);
};

export default MediaList;
