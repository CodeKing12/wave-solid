import { bytesToSize, secondsToHMS } from "@/utils/general";
import { Match, Show, Switch, createEffect } from "solid-js";
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
import { FocusDetails, useFocusable } from "@/spatial-nav";

interface MediaStreamOptionProps {
	stream: StreamObj;
	isEpisode?: boolean;
	authToken: string;
	onFocus: (focusDetails: FocusDetails) => void;
	onStreamClick: (isEnterpress?: boolean) => void;
}

export default function MediaStreamOption(props: MediaStreamOptionProps) {
	const { setRef, focused } = useFocusable({
		onEnterPress: () => props.onStreamClick(true),
		onFocus: props.onFocus,
		get focusable() {
			return Boolean(props.authToken && props.authToken?.length);
		},
		get focusKey() {
			return props.stream._id;
		},
	});

	return (
		<div
			class={`flex flex-col items-center justify-between md:flex-row ${
				props.isEpisode
					? "space-y-10 md:space-x-10 md:space-y-0"
					: "space-y-10 md:space-x-16 md:space-y-0 xl:space-x-20"
			}`}
			classList={{
				"opacity-50": props.authToken.length <= 0,
			}}
			ref={setRef}
		>
			<div
				class={`md:justify-left -my-4 flex flex-wrap justify-center space-x-9 text-[15px] text-gray-300 xl:flex-nowrap xl:!space-x-8 [&>div]:my-4 ${
					focused() ? "stream-focus" : ""
				}`}
			>
				<Show when={props.stream.video.length}>
					<div class="duration flex flex-col items-center space-y-1.5">
						<IconHourglassEmpty size={22} class="icon-stream" />
						<p>{secondsToHMS(props.stream.video[0].duration)}</p>
					</div>{" "}
				</Show>

				<Show when={!props.isEpisode}>
					<div class="size flex flex-col items-center space-y-1.5">
						<IconFileInfo size={22} class="icon-stream" />
						<p>{bytesToSize(props.stream.size)}</p>
					</div>
				</Show>

				<Show when={props.stream.audio.length}>
					<div class="audio flex flex-col items-center space-y-1.5">
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
					<div class="subtitles flex flex-col items-center space-y-1.5">
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
				</Show>

				<Show when={props.stream.video.length}>
					<div class="resolution flex flex-col items-center space-y-1.5">
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
					<div class="codec flex flex-col items-center space-y-1.5">
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
				<Match when={props.isEpisode && props.authToken}>
					<button
						onClick={() => {
							props.onStreamClick();
						}}
					>
						<IconPlayerPlayFilled
							size={30}
							class={`text-yellow-300 duration-300 ease-in-out ${
								focused() ? "!text-white" : ""
							}`}
						/>
					</button>
				</Match>

				<Match when={!props.isEpisode && props.authToken}>
					<button
						class={`flex items-center justify-center space-x-4 rounded-md border-2 border-transparent bg-yellow-300 px-5 py-3 text-sm font-bold tracking-wide text-black-1 hover:border-yellow-300 hover:bg-black-1 hover:text-yellow-300 xl:h-16 xl:w-12 xl:!p-0 ${
							focused()
								? "!border-yellow-300 !bg-black-1 !text-yellow-300"
								: ""
						}`}
						onClick={() => props.onStreamClick()}
					>
						<span class="font-semibold xl:hidden">Watch</span>
						<IconPlayerPlayFilled class="xl:!ml-0" size={28} />
					</button>
				</Match>
			</Switch>
		</div>
	);
}
