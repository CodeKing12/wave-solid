// import { FocusContext, FocusDetails, useFocusable } from "@noriginmedia/norigin-spatial-navigation"
import { FocusContext, FocusDetails, useFocusable } from "@/spatial-nav";
import Episode from "./Episode";
import { SeasonStreamObj, SeriesData } from "./MediaModal";
import { SeriesObj, StreamObj } from "./MediaTypes";
import { For, Index, createEffect } from "solid-js";

interface EpisodeListProps {
	authToken: string;
	episodes: SeriesData;
	selectedSeason?: SeriesObj;
	isLoadingEpisodeStreams: string;
	isFocusable: boolean;
	episodeStreams: SeasonStreamObj;
	onEpisodeStreamClick: (stream: StreamObj, isEnterpress?: boolean) => void;
	onEpisodeClick: (episode: SeriesObj) => void;
	onEpisodeFocus: (focusDetails: FocusDetails) => void;
	onEpisodeStreamFocus?: (focusDetails: FocusDetails) => void;
}

export default function EpisodeList(props: EpisodeListProps) {
	const { setRef, focusKey } = useFocusable({
		focusable: props.isFocusable,
	});
	createEffect(() => console.log(props.isFocusable));

	return (
		<FocusContext.Provider value={focusKey()}>
			<div class="flex max-w-full flex-col flex-wrap gap-4" ref={setRef}>
				<For each={props.episodes[props.selectedSeason?._id || ""]}>
					{(episode) => (
						<Episode
							authToken={props.authToken}
							episode={episode}
							onClick={() => props.onEpisodeClick(episode)}
							episodeStreams={
								props.episodeStreams?.[episode?._id] ||
								undefined
							}
							onEpisodeStreamClick={props.onEpisodeStreamClick}
							isLoadingStreams={
								props.isLoadingEpisodeStreams === episode?._id
							}
							onFocus={props.onEpisodeFocus}
							onEpisodeStreamFocus={props.onEpisodeStreamFocus}
						/>
					)}
				</For>
			</div>
		</FocusContext.Provider>
	);
}
