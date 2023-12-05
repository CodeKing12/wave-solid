import { bytesToSize, secondsToHMS } from "@/utils/general";
import { Match, Show, Switch, createEffect } from "solid-js";
import { AudioStream, StreamObj, Subtitle } from "./MediaTypes";
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

	function displayLang(languages: AudioStream[] | Subtitle[]) {
		let uniqueArray: string[] = [];
		languages.map((value) => {
			const uppercaseValue = value.language.toUpperCase();
			if (!uniqueArray.includes(uppercaseValue)) {
				uniqueArray.push(uppercaseValue);
			}
		});
		return uniqueArray.join("/");
	}

	return (
		<div
			class={`media-stream flex flex-col items-center justify-between md:flex-row ${
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
			</div>

			<Switch>
				<Match when={props.isEpisode && props.authToken}>
					<button
						onClick={() => {
							props.onStreamClick();
						}}
					>
						<svg
							class="text-yellow-300 duration-300 ease-in-out"
							classList={{ "!text-white": focused() }}
							xmlns="http://www.w3.org/2000/svg"
							width="40"
							height="40"
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
					<button
						class={`flex items-center justify-center space-x-4 rounded-md border-2 border-transparent bg-yellow-300 px-5 py-3 text-sm font-bold tracking-wide text-black-1 opacity-40 hover:border-yellow-300 hover:bg-black-1 hover:text-yellow-300 xl:h-16 xl:w-12 xl:!p-0 ${
							focused()
								? "!border-yellow-300 !bg-black-1 !text-yellow-300 !opacity-100"
								: ""
						}`}
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
	);
}
