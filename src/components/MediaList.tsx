import { Index, Show } from "solid-js";
import MediaCard from "./MediaCard";
import { MediaObj } from "./MediaTypes";
import { Spinner, SpinnerType } from "solid-spinner";
import { FocusableComponentLayout } from "@/spatial-nav";
import "@/css/media.css";
import "@/css/transitions.css";
import { TransitionGroup } from "solid-transition-group";

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
			<div>
				<div
					id="media-list"
					class="-mx-1 -mt-4 flex flex-wrap justify-center xl:justify-start [&>div]:mx-1 [&>div]:mt-4"
					classList={{
						sidebarVisible: !props.isSidebarOpen,
						"!overflow-hidden": props.isModalOpen,
					}}
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
						<TransitionGroup name="slide" appear={true}>
							<Index each={props.media}>
								{(show, index) => (
									<MediaCard
										index={index}
										media={show()}
										showMediaInfo={onCardSelect}
										onFocus={props.onCardFocus}
										onEnterPress={onCardPress}
									/>
								)}
							</Index>
						</TransitionGroup>
					</Show>
				</div>
			</div>
		</>
	);
};

export default MediaList;
