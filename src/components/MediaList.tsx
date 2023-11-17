import { Index } from "solid-js";
import MediaCard from "./MediaCard";
import { MediaObj } from "./MediaTypes";
import { Spinner, SpinnerType } from "solid-spinner";
import { FocusableComponentLayout } from "@/spatial-nav";

export interface MediaListProps {
	media?: MediaObj[];
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
					class={`grid grid-cols-1 flex-wrap justify-center gap-x-1 gap-y-4 xs:grid-cols-2 sm:grid-cols-3 md:gap-x-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 ${
						props.isModalOpen ? "!overflow-hidden" : ""
					} ${
						props.isSidebarOpen
							? "lg:!grid-cols-4 xl:!grid-cols-5 2xl:!grid-cols-6"
							: "listIsHidden"
					}`}
				>
					{/* grid-cols-1 sm:grid-cols-2 */}
					{/* fallback={<Spinner type={SpinnerType.puff} width={70} height={70} color="#fde047" class="!absolute top-[37%] left-1/2 -translate-x-1/2 -translate-y-1/2" />} */}
					{/* Can use this for the placeholder: <Suspense></Suspense> */}
					<Index
						each={props.media}
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
				</div>
			</div>
		</>
	);
};

export default MediaList;