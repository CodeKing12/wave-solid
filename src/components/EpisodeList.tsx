// import { FocusContext, FocusDetails, useFocusable } from "@noriginmedia/norigin-spatial-navigation"
import { FocusContext, FocusDetails, useFocusable } from "@/spatial-nav";
import Episode from "./Episode";
import { SeasonStreamObj, SeriesData } from "./MediaModal";
import { SeriesObj, StreamClickType } from "./MediaTypes";
import { For, Show } from "solid-js";
import FocusLeaf from "./Utilities/FocusLeaf";

interface EpisodeListProps {
	authToken: string;
	episodes: SeriesData;
	selectedSeason?: SeriesObj;
	isLoadingEpisodeStreams: string;
	isFocusable: boolean;
	episodeStreams: SeasonStreamObj;
	total: number;
	handleLoadMore: () => void;
	onEpisodeStreamClick: StreamClickType;
	onEpisodeClick: (episode: SeriesObj) => void;
	onEpisodeFocus: (focusDetails: FocusDetails) => void;
	onEpisodeStreamFocus?: (focusDetails: FocusDetails) => void;
}

export default function EpisodeList(props: EpisodeListProps) {
	const episodesToDisplay = () =>
		props.episodes[props.selectedSeason?._id || ""] ?? [];

	const { setRef, focusKey } = useFocusable({
		get focusable() {
			return props.isFocusable && episodesToDisplay()?.length > 0;
		},
	});

	return (
		<FocusContext.Provider value={focusKey()}>
			<div
				class="flex max-w-full flex-col flex-wrap space-y-4"
				ref={setRef}
			>
				<For each={episodesToDisplay()}>
					{(episode) => (
						<Episode
							authToken={props.authToken}
							episode={episode}
							onEpisodeStreamClick={props.onEpisodeStreamClick}
							onFocus={props.onEpisodeFocus}
							onEpisodeStreamFocus={props.onEpisodeStreamFocus}
						/>
					)}
				</For>
				<Show when={episodesToDisplay().length < props.total}>
					<FocusLeaf
						class="rounded-xl border-4 border-transparent bg-yellow-300 bg-opacity-90 py-5 font-bold text-black-1 duration-300 ease-in-out hover:!border-yellow-300 hover:!bg-transparent hover:!text-yellow-300"
						focusedStyles="!bg-transparent border-yellow-300 text-yellow-300"
						onEnterPress={props.handleLoadMore}
					>
						<button
							class="flex h-full w-full items-center justify-center"
							onclick={props.handleLoadMore}
						>
							Load More...
						</button>
					</FocusLeaf>
				</Show>
			</div>
		</FocusContext.Provider>
	);
}
