import { bytesToSize, secondsToHMS } from "@/utils/general";
import { Match, Show, Switch } from "solid-js";
// import { Barcode, Clock, Document, MessageText1, PlayCircle, Size, VolumeHigh } from "iconsax-react";
import { StreamObj } from "./MediaTypes";
import {
	IconAspectRatio,
	IconBadgeCc,
	IconFileBarcode,
	IconFileInfo,
	IconHourglassEmpty,
	IconLanguage,
	IconPlayerPlayFilled,
} from "@tabler/icons-solidjs";
// import { FocusDetails, useFocusable } from "@noriginmedia/norigin-spatial-navigation";

interface MediaStreamOptionProps {
	stream: StreamObj;
	isEpisode?: boolean;
	authToken: string;
	// onFocus?: (focusDetails: FocusDetails) => void,
	onStreamClick: (isEnterpress?: boolean) => void;
}

export default function MediaStreamOption(props: MediaStreamOptionProps) {
	// const { ref, focused } = useFocusable({
	//     onEnterPress: () => onStreamClick(true),
	//     onFocus,
	//     focusable: authToken && authToken?.length ? true : false
	// });

	return (
		<div
			class={`flex flex-col items-center justify-between md:flex-row ${
				props.isEpisode ? "gap-10" : "gap-10 md:gap-16 xl:gap-20"
			}`}
		>
			<div
				class={`md:justify-left flex flex-wrap justify-center gap-x-8 gap-y-4 text-[15px] text-gray-300 text-opacity-50 xl:flex-nowrap xl:!gap-8`}
			>
				<Show when={props.stream.video.length}>
					<div class="duration flex flex-col items-center gap-1.5">
						<IconHourglassEmpty size={22} class="icon-stream" />
						<p>{secondsToHMS(props.stream.video[0].duration)}</p>
					</div>{" "}
					: ""
				</Show>

				<Show when={!props.isEpisode}>
					<div class="size flex flex-col items-center gap-1.5">
						<IconFileInfo size={22} class="icon-stream" />
						<p>{bytesToSize(props.stream.size)}</p>
					</div>
				</Show>

				<Show when={props.stream.audio.length}>
					<div class="audio flex flex-col items-center gap-1.5">
						<IconLanguage size={22} class="icon-stream" />
						<p>
							{props.stream.audio
								.map(
									(audio) =>
										audio?.language?.toUpperCase() || "",
								)
								.join("/")}
						</p>
					</div>
				</Show>

				<Show when={props.stream.subtitles.length}>
					<div class="subtitles flex flex-col items-center gap-1.5">
						<IconBadgeCc size={22} class="icon-stream" />
						<p>
							{props.stream.subtitles
								.map(
									(subtitle) =>
										subtitle?.language?.toUpperCase(),
								)
								.join("/")}
						</p>
					</div>{" "}
					: ""
				</Show>
				<Show when={props.stream.video.length}>
					<div class="resolution flex flex-col items-center gap-1.5">
						<IconAspectRatio size={22} class="icon-stream" />
						<p>
							{props.stream.video
								.map(
									(video) => video.width + "×" + video.height,
								)
								.join(",")}
						</p>
					</div>
				</Show>
				<Show
					when={
						props.stream.video.length &&
						props.stream.audio.length &&
						!props.isEpisode
					}
				>
					<div class="codec flex flex-col items-center gap-1.5">
						<IconFileBarcode size={22} class="icon-stream" />
						<p>
							{props.stream.video[0].codec +
								"+" +
								props.stream.audio[0].codec}
						</p>
					</div>
				</Show>
			</div>

			<Switch>
				<Match when={props.isEpisode}>
					<button
						onClick={() => {
							props.onStreamClick();
						}}
					>
						<IconPlayerPlayFilled
							size={40}
							class={`text-yellow-300 duration-300 ease-in-out`}
						/>
					</button>
				</Match>

				<Match when={!props.isEpisode}>
					<button
						class={`flex items-center justify-center gap-4 rounded-md border-2 border-transparent bg-yellow-300 px-5 py-3 text-base text-sm font-bold tracking-wide text-black-1 hover:border-yellow-300 hover:bg-black-1 hover:text-yellow-300 xl:h-16 xl:w-12 xl:!p-0`}
						onClick={() => props.onStreamClick()}
					>
						<span class="font-semibold xl:hidden">Watch</span>
						<IconPlayerPlayFilled size={28} />
					</button>
				</Match>
			</Switch>
		</div>
	);
}
