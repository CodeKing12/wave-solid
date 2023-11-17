// import { FocusContext, FocusDetails, useFocusable } from "@noriginmedia/norigin-spatial-navigation";
import { StreamObj } from "./MediaTypes";
import MediaStreamOption from "./Stream";

interface StreamEpisodesProps {
	authToken: string;
	episodeStreams: StreamObj[];
	customFocusKey: string;
	// onEpisodeStreamFocus: (focusDetails: FocusDetails) => void,
	onEpisodeStreamClick: (stream: StreamObj, isEnterpress?: boolean) => void;
}

export default function StreamEpisodes(props: StreamEpisodesProps) {
	//   const { ref, focusKey, focused, hasFocusedChild } = useFocusable({
	//     focusKey: customFocusKey
	//   })

	return (
		// <FocusContext.Provider value={focusKey}>
		<div
			class={`invisible flex -translate-y-10 flex-col gap-5 opacity-0 duration-500 ease-in-out ${
				props.episodeStreams?.length
					? "!visible mt-5 !translate-y-0 !opacity-100"
					: ""
			}`}
		>
			{props.episodeStreams?.length
				? props.episodeStreams.map((stream, index) => (
						<MediaStreamOption
							stream={stream}
							authToken={props.authToken}
							isEpisode={true}
							onStreamClick={(isEnterpress) =>
								props.onEpisodeStreamClick(stream, isEnterpress)
							}
						/>
				  ))
				: ""}
		</div>
		// </FocusContext.Provider>
	);
}