// import { FocusContext, FocusDetails, useFocusable } from "@noriginmedia/norigin-spatial-navigation"
import Episode from "./Episode";
import { SeasonStreamObj, SeriesData, SeriesStreamObj } from "./MediaModal";
import { SeriesObj, StreamObj } from "./MediaTypes";

interface EpisodeListProps {
	authToken: string;
	episodes: SeriesData;
	selectedSeason?: SeriesObj;
	isLoadingEpisodeStreams: string;
	// isFocusable: boolean,
	episodeStreams: SeasonStreamObj;
	onEpisodeStreamClick: (stream: StreamObj, isEnterpress?: boolean) => void;
	onEpisodeClick: (episode: SeriesObj) => void;
	// onEpisodeFocus: (focusDetails: FocusDetails) => void,
	// onEpisodeStreamFocus?: (focusDetails: FocusDetails) => void
}

export default function EpisodeList(props: EpisodeListProps) {
	// const { ref, focusKey, focused } = useFocusable({
	//     focusable: isFocusable
	// })

	return (
		// <FocusContext.Provider value={focusKey}>
		<div class="flex max-w-full flex-col flex-wrap gap-4">
			{props.episodes[props.selectedSeason?._id || ""]?.map(
				(episode, index) => (
					<Episode
						authToken={props.authToken}
						episode={episode}
						onClick={() => props.onEpisodeClick(episode)}
						episodeStreams={
							props.episodeStreams?.[episode?._id] || undefined
						}
						onEpisodeStreamClick={props.onEpisodeStreamClick}
						isLoadingStreams={
							props.isLoadingEpisodeStreams === episode?._id
						}
					/>
				),
			)}
		</div>
		// </FocusContext.Provider>
	);
}
