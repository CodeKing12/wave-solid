import { bytesToSize, normalizeHDR, secondsToHMS } from "@/utils/general";
import { Match, Show, Switch, createMemo } from "solid-js";
import { AudioStream, StreamObj, Subtitle } from "./MediaTypes";
import { FocusDetails, useFocusable } from "@/spatial-nav";

interface MediaStreamOptionProps {
    stream: StreamObj;
    isEpisode?: boolean;
    authToken: string;
    onFocus: (focusDetails: FocusDetails) => void;
    onStreamClick: (isEnterpress?: boolean) => void;
}

function getResolutionLabel(width, height) {
    if (width >= 7600) {
        return "8K";
    } else if (width >= 3800) {
        return "4K";
    } else if (width >= 1900) {
        return "FHD";
    } else if (width >= 1250) {
        return "HD";
    } else {
        return "SD";
    }
}

export default function MediaStreamOption(props: MediaStreamOptionProps) {
    const isTizenTv = "tizen" in window;
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

    const isHdr = createMemo(() => normalizeHDR(props.stream.video[0].hdr));
    const is3d = createMemo(
        () => !!props.stream.video.find((item) => item["3d"]),
    );

    const resolutionLabel = createMemo(() => {
        if (props.stream.video && props.stream.video.length) {
            const video = props.stream.video[0];
            return getResolutionLabel(video.width, video.height);
        }
        return "";
    });
	
    const bitrate = createMemo(() => {
        if (props.stream.video.length && props.stream.size && props.stream.video[0].duration) {
            const sizeInBits = props.stream.size * 8; // Conversion to bits
            const durationInSeconds = props.stream.video[0].duration;
            return (sizeInBits / durationInSeconds / 1000000).toFixed(2) + " Mb/s"; // Conversion to Mb/s and rounding to 2 decimal places
        }
        return "";
    });

    function displayLang(languages: AudioStream[] | Subtitle[]) {
        let uniqueArray: string[] = [];
        languages.map((value) => {
            const uppercaseValue = value?.language?.toUpperCase();
            if (!uniqueArray.includes(uppercaseValue)) {
                uniqueArray.push(uppercaseValue);
            }
        });
        return uniqueArray.join("/");
    }

	function copyUrlToClipboard() {}

	return (
		<div
			class="media-stream flex flex-col items-center justify-between md:flex-row"
			classList={{
				"opacity-50": props.authToken.length <= 0,
				"space-y-10 md:space-x-16 md:space-y-0 xl:space-x-20":
					props.isEpisode,
			}}
			ref={setRef}
		>
			<div
				class={`md:justify-left -my-4 flex flex-wrap justify-center space-x-9 text-[17px] font-medium text-gray-300 text-opacity-50 xl:flex-nowrap xl:!space-x-[34px] [&>div]:my-4 ${
					focused() ? "stream-focus !text-opacity-90" : ""
				}`}
			>
				<Show when={props.stream.video.length}>
					<div class="duration flex flex-col items-center space-y-2">
						<svg
							class="icon-stream"
							xmlns="http://www.w3.org/2000/svg"
							width="24"
							height="24"
							viewBox="0 0 24 24"
							fill="none"
						>
							<path
								d="M17.39 15.67 13.35 12h-2.71L6.6 15.67a3.602 3.602 0 0 0-.95 4.01A3.63 3.63 0 0 0 9.05 22h5.89c1.52 0 2.85-.91 3.4-2.32.55-1.42.18-2.99-.95-4.01Zm-3.57 2.47h-3.64a.68.68 0 0 1-.68-.68c0-.37.31-.68.68-.68h3.64c.38 0 .68.31.68.68 0 .37-.31.68-.68.68ZM18.35 4.32A3.63 3.63 0 0 0 14.95 2h-5.9a3.63 3.63 0 0 0-2.44 6.33L10.65 12h2.71l4.04-3.67a3.635 3.635 0 0 0 .95-4.01Zm-4.53 2.91h-3.64a.68.68 0 0 1-.68-.68c0-.37.31-.68.68-.68h3.64c.38 0 .68.31.68.68 0 .37-.31.68-.68.68Z"
								fill="currentColor"
							></path>
						</svg>
						<p>{secondsToHMS(props.stream.video[0].duration)}</p>
					</div>{" "}
				</Show>

				<Show when={!props.isEpisode}>
					<div class="size flex flex-col items-center space-y-2">
						<svg
							class="icon-stream"
							xmlns="http://www.w3.org/2000/svg"
							width="24"
							height="24"
							viewBox="0 0 24 24"
							fill="none"
						>
							<path
								d="M12 2C6.49 2 2 6.49 2 12s4.49 10 10 10 10-4.49 10-10S17.51 2 12 2Zm-.75 6c0-.41.34-.75.75-.75s.75.34.75.75v5c0 .41-.34.75-.75.75s-.75-.34-.75-.75V8Zm1.67 8.38c-.05.13-.12.23-.21.33-.1.09-.21.16-.33.21-.12.05-.25.08-.38.08s-.26-.03-.38-.08-.23-.12-.33-.21c-.09-.1-.16-.2-.21-.33A.995.995 0 0 1 11 16c0-.13.03-.26.08-.38s.12-.23.21-.33c.1-.09.21-.16.33-.21a1 1 0 0 1 .76 0c.12.05.23.12.33.21.09.1.16.21.21.33.05.12.08.25.08.38s-.03.26-.08.38Z"
								fill="currentColor"
							></path>
						</svg>
						<p>{bytesToSize(props.stream.size)}</p>
					</div>
				</Show>

				<Show when={props.stream.audio.length}>
					<div class="audio flex flex-col items-center space-y-2">
						<svg
							class="icon-stream"
							xmlns="http://www.w3.org/2000/svg"
							width="24"
							height="24"
							viewBox="0 0 24 24"
							fill="none"
						>
							<path
								d="M16.19 2H7.81C4.17 2 2 4.17 2 7.81v8.37C2 19.83 4.17 22 7.81 22h8.37c3.64 0 5.81-2.17 5.81-5.81V7.81C22 4.17 19.83 2 16.19 2ZM17 17.47c-1.71 0-3.31-.74-4.59-2.11-1.45 1.31-3.34 2.11-5.41 2.11-.41 0-.75-.34-.75-.75s.34-.75.75-.75c3.47 0 6.34-2.75 6.71-6.27h-6.7c-.41 0-.75-.34-.75-.75s.34-.74.75-.74h4.24v-.93c0-.41.34-.75.75-.75s.75.34.75.75v.93h1.69c.02 0 .04-.01.06-.01.02 0 .04.01.06.01h2.43c.41 0 .75.34.75.75s-.34.75-.75.75h-1.78a8.754 8.754 0 0 1-1.77 4.56c1 1.11 2.25 1.71 3.56 1.71.41 0 .75.34.75.75s-.34.74-.75.74Z"
								fill="currentColor"
							></path>
						</svg>
						<p>{displayLang(props.stream.audio)}</p>
					</div>
				</Show>

				<Show when={props.stream.subtitles.length}>
					<div class="subtitles flex flex-col items-center space-y-2">
						<svg
							class="icon-stream"
							xmlns="http://www.w3.org/2000/svg"
							width="24"
							height="24"
							viewBox="0 0 24 24"
							fill="none"
						>
							<path
								d="M20.95 4.13c-.29-.42-.66-.79-1.08-1.08C18.92 2.36 17.68 2 16.19 2H7.81c-.2 0-.4.01-.59.03C3.94 2.24 2 4.37 2 7.81v8.38c0 1.49.36 2.73 1.05 3.68.29.42.66.79 1.08 1.08.82.6 1.86.95 3.09 1.03.19.01.39.02.59.02h8.38c3.64 0 5.81-2.17 5.81-5.81V7.81c0-1.49-.36-2.73-1.05-3.68Zm-2.2 4.77c0 .41-.34.75-.75.75s-.75-.34-.75-.75V7.72a.58.58 0 0 0-.58-.58h-3.92v9.72h1.78c.41 0 .75.34.75.75s-.34.75-.75.75H9.47c-.41 0-.75-.34-.75-.75s.34-.75.75-.75h1.78V7.14H7.33a.58.58 0 0 0-.58.58V8.9c0 .41-.34.75-.75.75s-.75-.34-.75-.75V7.72c0-1.15.93-2.08 2.08-2.08h9.33c1.15 0 2.08.93 2.08 2.08V8.9h.01Z"
								fill="currentColor"
							></path>
						</svg>
						<p>{displayLang(props.stream.subtitles)}</p>
					</div>{" "}
				</Show>

				<Show when={props.stream.video.length}>
					<div class="resolution flex flex-col items-center space-y-2">
						<svg
							class="icon-stream"
							xmlns="http://www.w3.org/2000/svg"
							width="24"
							height="24"
							viewBox="0 0 24 24"
							fill="none"
						>
							<path
								d="M21.97 5.5v4c0 1.761-1.299 3.223-3 3.465-.274.039-.5-.189-.5-.465v-.25c0-3.72-3.02-6.75-6.75-6.75h-.25c-.275 0-.503-.225-.464-.498A3.505 3.505 0 0 1 14.471 2h4c1.94 0 3.5 1.57 3.5 3.5Z"
								fill="currentColor"
							></path>
							<path
								d="M11.72 7H6.97c-2.76 0-5 2.24-5 5v5c0 2.76 2.24 5 5 5h5c2.76 0 5-2.24 5-5v-4.75c0-2.9-2.35-5.25-5.25-5.25Z"
								fill="currentColor"
							></path>
						</svg>
						<p>
							{props.stream.video[0].width +
								"×" +
								props.stream.video[0].height}
						</p>
					</div>
				</Show>
				
                <Show when={bitrate()}>
                    <div class="bitrate flex flex-col items-center space-y-2">
						<svg
						width="24.000000pt"
						height="19.000000pt"
						viewBox="0 0 145 120"
						fill="none">
						<path
							d="M58.15,52.98l28.6-18.22c0.2-0.15,0.48-0.12,0.65,0.06l2.76,2.94c0.17,0.18,0.18,0.47,0.02,0.66L68.51,63.6 c-3.08,3.31-6.37,3.96-9.02,3.1c-1.32-0.43-2.47-1.22-3.35-2.25c-0.88-1.02-1.49-2.27-1.74-3.61c-0.49-2.67,0.49-5.66,3.73-7.85 L58.15,52.98L58.15,52.98z M19.33,106.17c-3.05-2.87-5.8-6.05-8.21-9.48c-2.39-3.4-4.44-7.06-6.11-10.91 C3.38,82,2.12,78.02,1.26,73.88C0.44,69.86,0,65.7,0,61.44c0-8.32,1.66-16.25,4.65-23.49C7.77,30.43,12.33,23.66,18,18 c5.66-5.66,12.43-10.23,19.95-13.34C45.19,1.66,53.12,0,61.44,0c8.3,0,16.21,1.66,23.43,4.66c7.52,3.12,14.28,7.7,19.95,13.37 c5.68,5.68,10.26,12.46,13.38,19.97c3.01,7.24,4.68,15.16,4.68,23.44c0,4.05-0.4,8.01-1.16,11.85c-0.78,3.94-1.95,7.75-3.46,11.4 c-1.54,3.71-3.43,7.25-5.64,10.55c-2.23,3.34-4.78,6.45-7.6,9.3c-0.19,0.19-0.51,0.19-0.7,0l-3.07-3.06 c-0.06-0.02-0.12-0.06-0.17-0.11l-8.56-8.56c-0.19-0.19-0.19-0.51,0-0.7l4.49-4.49c0.19-0.19,0.51-0.19,0.7,0l6.61,6.61 c1.4-1.82,2.69-3.72,3.85-5.7c1.25-2.12,2.35-4.34,3.3-6.63c1.28-3.1,2.29-6.35,2.97-9.71c0.64-3.12,1-6.35,1.07-9.64h-9.11 c-0.27,0-0.5-0.22-0.5-0.5V55.7c0-0.27,0.22-0.5,0.5-0.5h8.76c-0.68-5.85-2.31-11.43-4.72-16.58c-2.49-5.31-5.82-10.15-9.82-14.37 l-5.86,5.86c-0.19,0.19-0.51,0.19-0.7,0l-4.49-4.49c-0.19-0.19-0.19-0.51,0-0.7l5.65-5.65c-4.44-3.57-9.45-6.46-14.87-8.5 C75.1,8.8,69.47,7.62,63.6,7.39v8.03c0,0.27-0.22,0.5-0.5,0.5h-6.36c-0.27,0-0.5-0.22-0.5-0.5V7.59 c-5.83,0.55-11.4,2.04-16.54,4.29c-5.31,2.33-10.17,5.49-14.42,9.3l5.87,5.87c0.19,0.19,0.19,0.51,0,0.7l-4.49,4.49 c-0.19,0.19-0.51,0.19-0.7,0l-5.8-5.8c-3.73,4.4-6.78,9.41-8.96,14.86C9.1,46.6,7.79,52.29,7.44,58.23h9.03 c0.27,0,0.5,0.22,0.5,0.5v6.36c0,0.27-0.22,0.5-0.5,0.5H7.5c0.22,2.94,0.68,5.8,1.35,8.58c0.72,3.01,1.7,5.92,2.91,8.72 c1.05,2.43,2.27,4.76,3.64,6.98c1.29,2.09,2.72,4.09,4.28,5.97l7.24-7.24c0.19-0.19,0.51-0.19,0.7,0l4.49,4.49 c0.19,0.19,0.19,0.51,0,0.7c-4.14,4.14-8.09,8.11-12.09,12.36C19.84,106.35,19.53,106.36,19.33,106.17L19.33,106.17z"
							fill="currentColor"
							/>
						</svg>
                        <p>{bitrate()}</p>
                    </div>
                </Show>
				
				<Show
					when={
						props.stream.video.length && props.stream.audio.length
					}
				>
					<div class="codec flex flex-col items-center space-y-2">
						<svg
							class="icon-stream"
							xmlns="http://www.w3.org/2000/svg"
							width="24"
							height="24"
							viewBox="0 0 24 24"
							fill="none"
						>
							<path
								d="M17 3.5H7c-3 0-5 1.5-5 5v7c0 3.5 2 5 5 5h10c3 0 5-1.5 5-5v-7c0-3.5-2-5-5-5ZM6.75 16c0 .41-.34.75-.75.75s-.75-.34-.75-.75V8c0-.41.34-.75.75-.75s.75.34.75.75v8Zm3 0c0 .41-.34.75-.75.75s-.75-.34-.75-.75v-1c0-.41.34-.75.75-.75s.75.34.75.75v1Zm0-4c0 .41-.34.75-.75.75s-.75-.34-.75-.75V8c0-.41.34-.75.75-.75s.75.34.75.75v4Zm3 4c0 .41-.34.75-.75.75s-.75-.34-.75-.75V8c0-.41.34-.75.75-.75s.75.34.75.75v8Zm3 0c0 .41-.34.75-.75.75s-.75-.34-.75-.75v-4c0-.41.34-.75.75-.75s.75.34.75.75v4Zm0-7c0 .41-.34.75-.75.75s-.75-.34-.75-.75V8c0-.41.34-.75.75-.75s.75.34.75.75v1Zm3 7c0 .41-.34.75-.75.75s-.75-.34-.75-.75V8c0-.41.34-.75.75-.75s.75.34.75.75v8Z"
								fill="currentColor"
							></path>
						</svg>
						<p>
							{props.stream.video[0].codec +
								"+" +
								props.stream.audio[0].codec}
						</p>
					</div>
				</Show>
				<div
					class="flex flex-col justify-center space-y-1 duration-300 ease-in-out"
					classList={{
						"opacity-50": !focused(),
					}}
				>
					<Show when={isHdr()}>
						<p class="border-2 border-yellow-300 px-2 py-1 font-semibold text-yellow-300">
							{isHdr()}
						</p>
					</Show>
					<Show when={resolutionLabel()}>
						<p class="border-2 border-yellow-300 px-2 py-1 font-semibold text-yellow-300">
							{resolutionLabel()}
						</p>
					</Show>
					<Show when={is3d()}>
						<p class="border-2 border-yellow-300 px-2 py-1 font-semibold text-yellow-300">
							{is3d() ? "3D" : ""}
						</p>
					</Show>
				</div>
			</div>

			<div class="flex gap-4">
				<Switch>
					<Match when={props.isEpisode && props.authToken}>
						<Show when={!isTizenTv}>
							<button onClick={copyUrlToClipboard}>
								<svg
									class="text-yellow-300 duration-300 ease-in-out"
									classList={{ "!text-white": focused() }}
									xmlns="http://www.w3.org/2000/svg"
									width="30"
									height="30"
									viewBox="0 0 24 24"
									fill="none"
								>
									<path
										d="M14.35 2h-4.7c-1.04 0-1.89.84-1.89 1.88v.94c0 1.04.84 1.88 1.88 1.88h4.71c1.04 0 1.88-.84 1.88-1.88v-.94C16.24 2.84 15.39 2 14.35 2Z"
										fill="currentColor"
									></path>
									<path
										d="M17.24 4.82c0 1.59-1.3 2.89-2.89 2.89h-4.7c-1.59 0-2.89-1.3-2.89-2.89 0-.56-.6-.91-1.1-.65a4.472 4.472 0 0 0-2.37 3.95v9.41C3.29 19.99 5.3 22 7.76 22h8.48c2.46 0 4.47-2.01 4.47-4.47V8.12c0-1.71-.96-3.2-2.37-3.95-.5-.26-1.1.09-1.1.65Zm-4.86 12.13H8c-.41 0-.75-.34-.75-.75s.34-.75.75-.75h4.38c.41 0 .75.34.75.75s-.34.75-.75.75Zm2.62-4H8c-.41 0-.75-.34-.75-.75s.34-.75.75-.75h7c.41 0 .75.34.75.75s-.34.75-.75.75Z"
										fill="currentColor"
									></path>
								</svg>
							</button>
						</Show>

						<button
							onClick={() => {
								props.onStreamClick();
							}}
						>
							<svg
								class="text-yellow-300 duration-300 ease-in-out"
								classList={{ "!text-white": focused() }}
								xmlns="http://www.w3.org/2000/svg"
								width="44"
								height="44"
								viewBox="0 0 24 24"
								fill="none"
							>
								<path
									d="M11.969 2c-5.52 0-10 4.48-10 10s4.48 10 10 10 10-4.48 10-10-4.47-10-10-10Zm3 12.23-2.9 1.67a2.284 2.284 0 0 1-2.3 0 2.285 2.285 0 0 1-1.15-2v-3.35c0-.83.43-1.58 1.15-2 .72-.42 1.58-.42 2.31 0l2.9 1.67c.72.42 1.15 1.16 1.15 2 0 .84-.43 1.59-1.16 2.01Z"
									fill="currentColor"
								></path>
							</svg>
						</button>
					</Match>

					<Match when={!props.isEpisode && props.authToken}>
						<Show when={!isTizenTv}>
							<button onClick={copyUrlToClipboard}>
								<svg
									class="text-yellow-300 duration-300 ease-in-out"
									classList={{ "!text-white": focused() }}
									xmlns="http://www.w3.org/2000/svg"
									width="34"
									height="34"
									viewBox="0 0 24 24"
									fill="none"
								>
									<path
										d="M14.35 2h-4.7c-1.04 0-1.89.84-1.89 1.88v.94c0 1.04.84 1.88 1.88 1.88h4.71c1.04 0 1.88-.84 1.88-1.88v-.94C16.24 2.84 15.39 2 14.35 2Z"
										fill="currentColor"
									></path>
									<path
										d="M17.24 4.82c0 1.59-1.3 2.89-2.89 2.89h-4.7c-1.59 0-2.89-1.3-2.89-2.89 0-.56-.6-.91-1.1-.65a4.472 4.472 0 0 0-2.37 3.95v9.41C3.29 19.99 5.3 22 7.76 22h8.48c2.46 0 4.47-2.01 4.47-4.47V8.12c0-1.71-.96-3.2-2.37-3.95-.5-.26-1.1.09-1.1.65Zm-4.86 12.13H8c-.41 0-.75-.34-.75-.75s.34-.75.75-.75h4.38c.41 0 .75.34.75.75s-.34.75-.75.75Zm2.62-4H8c-.41 0-.75-.34-.75-.75s.34-.75.75-.75h7c.41 0 .75.34.75.75s-.34.75-.75.75Z"
										fill="currentColor"
									></path>
								</svg>
							</button>
						</Show>

						<button
							class="flex items-center justify-center space-x-4 rounded-md border-2 border-transparent bg-yellow-300 px-5 py-3 text-sm font-bold tracking-wide text-black-1 opacity-40 hover:border-yellow-300 hover:bg-black-1 hover:text-yellow-300 xl:h-16 xl:w-12 xl:!p-0"
							classList={{
								"!border-yellow-300 !bg-black-1 !text-yellow-300 !opacity-100":
									focused(),
							}}
							onClick={() => props.onStreamClick()}
						>
							<span class="font-semibold xl:hidden">Watch</span>
							<svg
								class="xl:!ml-0"
								xmlns="http://www.w3.org/2000/svg"
								width="30"
								height="30"
								viewBox="0 0 24 24"
								fill="none"
							>
								<path
									d="M11.969 2c-5.52 0-10 4.48-10 10s4.48 10 10 10 10-4.48 10-10-4.47-10-10-10Zm3 12.23-2.9 1.67a2.284 2.284 0 0 1-2.3 0 2.285 2.285 0 0 1-1.15-2v-3.35c0-.83.43-1.58 1.15-2 .72-.42 1.58-.42 2.31 0l2.9 1.67c.72.42 1.15 1.16 1.15 2 0 .84-.43 1.59-1.16 2.01Z"
									fill="currentColor"
								></path>
							</svg>
						</button>
					</Match>
				</Switch>
			</div>
		</div>
	);
}
