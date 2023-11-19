// import { FocusContext, FocusDetails, useFocusable } from "@noriginmedia/norigin-spatial-navigation";
import { FocusContext, FocusDetails, useFocusable } from "@/spatial-nav";
import { StreamObj } from "./MediaTypes";
import MediaStreamOption from "./Stream";
import { For, Show } from "solid-js";

interface StreamEpisodesProps {
	authToken: string;
	episodeStreams: StreamObj[];
	customFocusKey: string;
	onEpisodeStreamFocus: (focusDetails: FocusDetails) => void;
	onEpisodeStreamClick: (stream: StreamObj, isEnterpress?: boolean) => void;
}

export default function StreamEpisodes(props: StreamEpisodesProps) {
	const { setRef, focusKey } = useFocusable({
		focusKey: props.customFocusKey,
	});

	return (
		<FocusContext.Provider value={focusKey()}>
			<div
				class="invisible flex -translate-y-10 flex-col gap-5 opacity-0 duration-500 ease-in-out"
				classList={{
					"!visible mt-5 !translate-y-0 !opacity-100":
						props.episodeStreams?.length > 0,
				}}
				ref={setRef}
			>
				<Show when={props.episodeStreams?.length}>
					<For each={props.episodeStreams}>
						{(stream) => (
							<MediaStreamOption
								stream={stream}
								authToken={props.authToken}
								isEpisode={true}
								onStreamClick={(isEnterpress) =>
									props.onEpisodeStreamClick(
										stream,
										isEnterpress,
									)
								}
								onFocus={props.onEpisodeStreamFocus}
							/>
						)}
					</For>
				</Show>
			</div>
		</FocusContext.Provider>
	);
}
