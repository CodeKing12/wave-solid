// -@ts-nocheck

import {
	ChangeAudioTrack,
	ChangeSpeed,
	ChangeSubtitles,
	ControlIcon,
	RangeSlider,
} from "./PlayerUtilities";
import {
	Match,
	Show,
	Switch,
	createEffect,
	createSignal,
	onCleanup,
	onMount,
} from "solid-js";

import "@/css/slider.css";
import { formatMilliseconds } from "@/utils/general";
import { AVPlayPlaybackCallback } from "tizen-tv-webapis";

interface AVPlayerProps {
	show: boolean;
	url?: string;
	canPlayonTizen: boolean;
	onQuit: () => void;
}

interface TimeSliderProps {
	elapsedTime: number;
	mediaDuration: number;
	updateElapsed: (newTime: number) => void;
}

interface AudioSliderProps {
	currentVolume: number;
	isMute: boolean;
	toggleMute: () => void;
	updateVolume: (newVolume: number) => void;
}

function AudioSlider(props: AudioSliderProps) {
	return (
		<div class="flex items-center space-x-1">
			<ControlIcon onclick={props.toggleMute}>
				<Switch>
					<Match when={props.currentVolume >= 50 && !props.isMute}>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="35"
							height="35"
							viewBox="0 0 24 24"
							fill="none"
						>
							<path
								d="M18 16.75a.75.75 0 0 1-.6-1.2 5.94 5.94 0 0 0 0-7.1.75.75 0 0 1 1.2-.9c1.96 2.62 1.96 6.28 0 8.9-.15.2-.37.3-.6.3Z"
								fill="#f5f5f5"
							></path>
							<path
								d="M19.828 19.25a.75.75 0 0 1-.6-1.2c2.67-3.56 2.67-8.54 0-12.1a.75.75 0 0 1 1.2-.9c3.07 4.09 3.07 9.81 0 13.9-.14.2-.37.3-.6.3ZM14.02 3.782c-1.12-.62-2.55-.46-4.01.45l-2.92 1.83c-.2.12-.43.19-.66.19H5c-2.42 0-3.75 1.33-3.75 3.75v4c0 2.42 1.33 3.75 3.75 3.75H6.43c.23 0 .46.07.66.19l2.92 1.83c.88.55 1.74.82 2.54.82a3 3 0 0 0 1.47-.37c1.11-.62 1.73-1.91 1.73-3.63v-9.18c0-1.72-.62-3.01-1.73-3.63Z"
								fill="#f5f5f5"
							></path>
						</svg>
					</Match>
					<Match
						when={
							props.currentVolume < 60 &&
							props.currentVolume >= 5 &&
							!props.isMute
						}
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="35"
							height="35"
							viewBox="0 0 24 24"
							fill="none"
						>
							<path
								d="M19.328 16.75a.75.75 0 0 1-.6-1.2 5.94 5.94 0 0 0 0-7.1.75.75 0 0 1 1.2-.9 7.44 7.44 0 0 1 0 8.9c-.14.2-.37.3-.6.3ZM15.348 3.782c-1.12-.62-2.55-.46-4.01.45l-2.92 1.83c-.2.12-.43.19-.66.19H6.328c-2.42 0-3.75 1.33-3.75 3.75v4c0 2.42 1.33 3.75 3.75 3.75H7.758c.23 0 .46.07.66.19l2.92 1.83c.88.55 1.74.82 2.54.82a3 3 0 0 0 1.47-.37c1.11-.62 1.73-1.91 1.73-3.63v-9.18c0-1.72-.62-3.01-1.73-3.63Z"
								fill="#f5f5f5"
							></path>
						</svg>
					</Match>
					<Match when={props.currentVolume < 5 && !props.isMute}>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="35"
							height="35"
							viewBox="0 0 24 24"
							fill="none"
						>
							<path
								d="M17.52 3.782c-1.12-.62-2.55-.46-4.01.45l-2.92 1.83c-.2.12-.43.19-.66.19H8.5c-2.42 0-3.75 1.33-3.75 3.75v4c0 2.42 1.33 3.75 3.75 3.75H9.93c.23 0 .46.07.66.19l2.92 1.83c.88.55 1.74.82 2.54.82a3 3 0 0 0 1.47-.37c1.11-.62 1.73-1.91 1.73-3.63v-9.18c0-1.72-.62-3.01-1.73-3.63Z"
								fill="#f5f5f5"
							></path>
						</svg>
					</Match>
					<Match when={props.isMute}>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="35"
							height="35"
							viewBox="0 0 24 24"
							fill="none"
						>
							<path
								d="m22.531 13.42-1.45-1.45 1.4-1.4c.29-.29.29-.77 0-1.06a.754.754 0 0 0-1.06 0l-1.4 1.4-1.45-1.45a.754.754 0 0 0-1.06 0c-.29.29-.29.77 0 1.06l1.45 1.45-1.49 1.49c-.29.29-.29.77 0 1.06.15.15.34.22.53.22s.38-.07.53-.22l1.49-1.49 1.45 1.45c.15.15.34.22.53.22s.38-.07.53-.22c.29-.29.29-.76 0-1.06ZM14.02 3.782c-1.12-.62-2.55-.46-4.01.45l-2.92 1.83c-.2.12-.43.19-.66.19H5c-2.42 0-3.75 1.33-3.75 3.75v4c0 2.42 1.33 3.75 3.75 3.75H6.43c.23 0 .46.07.66.19l2.92 1.83c.88.55 1.74.82 2.54.82a3 3 0 0 0 1.47-.37c1.11-.62 1.73-1.91 1.73-3.63v-9.18c0-1.72-.62-3.01-1.73-3.63Z"
								fill="#f5f5f5"
							></path>
						</svg>
					</Match>
				</Switch>
			</ControlIcon>
			<RangeSlider
				class="!w-44"
				min={0}
				max={100}
				value={props.currentVolume}
				onSlide={props.updateVolume}
			/>
		</div>
	);
}

function TimeSlider(props: TimeSliderProps) {
	return (
		<div class="flex w-full items-center space-x-1">
			<RangeSlider
				min={0}
				max={props.mediaDuration}
				value={props.elapsedTime}
				onSlide={props.updateElapsed}
			/>
		</div>
	);
}

export default function AVPlayer(props: AVPlayerProps) {
	let timeoutId: number;
	// const controlsId = "player-controls"
	const [controlsEl, setControlsEl] = createSignal<HTMLElement | undefined>();
	const [mediaDuration, setMediaDuration] = createSignal(0);
	const [elapsedTime, setElapsedTime] = createSignal(0);
	const [availableSubtitles, setAvailableSubtitles] = createSignal<any[]>([
		// { index: 1, language: "EN" },
		// { index: 2, language: "OL" },
		// { index: 3, language: "GM" },
	]);
	const [availableAudio, setAvailableAudio] = createSignal<any[]>([
		// { index: 1, language: "EN" },
		// { index: 2, language: "OL" },
		// { index: 3, language: "GM" },
	]);
	const [playbackSpeed, setPlaybackSpeed] = createSignal(1);
	const [paused, setPaused] = createSignal(true);
	const [isPending, setIsPending] = createSignal(true);
	const [isBuffering, setIsBuffering] = createSignal(true);
	const [bufferPercent, setBufferPercent] = createSignal(0);
	const [showControls, setShowControls] = createSignal(true);
	const [currentSubtitleTrack, setCurrentSubtitleTrack] = createSignal<
		any | false
	>();
	const [currentAudioTrack, setCurrentAudioTrack] = createSignal<any>();
	const [currentSubtitle, setCurrentSubtitle] = createSignal("");
	const [audioMenuOpen, setAudioMenuOpen] = createSignal(false);
	const [subtitleMenuOpen, setSubtitleMenuOpen] = createSignal(false);
	const [speedMenuOpen, setSpeedMenuOpen] = createSignal(false);
	const [volume, setVolume] = createSignal(50);
	const [isMute, setIsMute] = createSignal(false);
	const [showSubtitles, setShowSubtitles] = createSignal(true);

	createEffect(() => {
		if (props.canPlayonTizen && props.show && props.url) {
			document.addEventListener("mousemove", showElement);
			document.addEventListener("mousedown", showElement);
			document.addEventListener("keydown", handleKeyPress);
			tizen.tvaudiocontrol.setVolumeChangeListener(onTvVolumeChange);

			setMediaDuration(0);
			setElapsedTime(0);
			setAvailableAudio([]);
			setAvailableSubtitles([]);
			webapis.avplay.stop();
			initializeVideo(props.url);
		}

		onCleanup(() => {
			document.removeEventListener("mousemove", showElement);
			document.removeEventListener("mousedown", showElement);
			document.removeEventListener("keydown", handleKeyPress);
			tizen.tvaudiocontrol.unsetVolumeChangeListener();
		});
	});

	createEffect(() => {
		if (audioMenuOpen()) {
			setSubtitleMenuOpen(false);
		}
	});

	createEffect(() => {
		if (subtitleMenuOpen()) {
			setAudioMenuOpen(false);
		}
	});

	function quitPlayer() {
		props.onQuit();
		webapis.avplay.stop();
		setMediaDuration(0);
		setElapsedTime(0);
		setAvailableAudio([]);
		setAvailableSubtitles([]);
	}

	function onSeekSuccess() {
		setIsPending(false);
	}

	function onSeekError() {
		setIsPending(false);
	}

	function hideElement() {
		// @ts-ignore because by when the function is called, the element would have already be passed to the ref
		controlsEl().style.opacity = "0";
		setShowControls(false);
		setAudioMenuOpen(false);
		setSubtitleMenuOpen(false);
		setSpeedMenuOpen(false);
	}

	function showElement() {
		// @ts-ignore
		controlsEl().style.opacity = "1";
		setShowControls(true);
		resetTimeout();
	}

	function togglePlayPause() {
		const currentState = webapis.avplay.getState();
		if (
			(currentState === "READY" || currentState === "PAUSED") &&
			!isPending()
		) {
			webapis.avplay.play();
			setPaused(false);
			console.log("Resumed Video");
		} else if (currentState === "PLAYING" && !isPending()) {
			webapis.avplay.pause();
			setPaused(true);
			console.log("Paused Video");
		}
	}

	function handleKeyPress(event: KeyboardEvent) {
		showElement();
		const keycode = event.keyCode;
		console.log("Pressed: ", keycode);
		// Space: 32
		// Enter & Remote-center: 13
		// Left: 37
		// Right: 39
		// Up: 38
		// Down: 40
		// Remote-play/pause: 10252
		// Escape & Remote-back: 10009
		switch (keycode) {
			case 32:
				togglePlayPause();
				break;
			// case 13:
			// 	togglePlayPause();
			case 10252:
				togglePlayPause();
				break;
			case 37:
				jumpMedia("BACKWARD");
				break;
			case 39:
				jumpMedia("FORWARD");
				break;
			case 10009:
				quitPlayer();
				break;
			default:
				break;
		}
	}

	function resetTimeout() {
		clearTimeout(timeoutId);
		timeoutId = setTimeout(hideElement, 3000); // Adjust the time in milliseconds (e.g., 3000 for 3 seconds)
	}

	// function pauseVideo() {
	// 	console.log("Clicked to Pause");
	// 	if (webapis.avplay.getState() === "PLAYING" && !isPending()) {
	// 		webapis.avplay.pause();
	// 		setPaused(true);
	// 		console.log("Paused Video");
	// 	}
	// }

	// function resumeVideo() {
	// 	const currentState = webapis.avplay.getState();
	// 	console.log("Clicked to Resume");
	// 	if (
	// 		(currentState === "READY" || currentState === "PAUSED") &&
	// 		!isPending()
	// 	) {
	// 		webapis.avplay.play();
	// 		setPaused(false);
	// 		console.log("Resumed Video");
	// 	}
	// }

	function seekMedia(newTime: number) {
		setElapsedTime(newTime);
		const currentState = webapis.avplay.getState();
		if (
			(currentState === "IDLE" ||
				currentState === "READY" ||
				currentState === "PLAYING" ||
				currentState === "PAUSED") &&
			!isPending()
		) {
			console.log("Seeking to: ", newTime, formatMilliseconds(newTime));
			setIsPending(true);
			webapis.avplay.seekTo(newTime, onSeekSuccess, onSeekError);
		}
	}

	function jumpMedia(
		direction: "FORWARD" | "BACKWARD",
		milliseconds = 15000,
	) {
		const currentState = webapis.avplay.getState();
		// Perform action only at the appropriate state
		if (
			(currentState === "READY" ||
				currentState === "PLAYING" ||
				currentState === "PAUSED") &&
			!isPending()
		) {
			const currentTime = webapis.avplay.getCurrentTime();
			setElapsedTime(currentTime + milliseconds);

			if (direction === "FORWARD") {
				console.log("Jumping Forward by 15s");
				setIsPending(true);
				webapis.avplay.jumpForward(
					milliseconds,
					onSeekSuccess,
					onSeekError,
				);
			} else if (direction === "BACKWARD") {
				console.log("Jumping Backward by 15s");
				setIsPending(true);
				webapis.avplay.jumpBackward(
					milliseconds,
					onSeekSuccess,
					onSeekError,
				);
			}
		}
	}

	function handleChangeAudio(trackIndex: number) {
		const currentState = webapis.avplay.getState();
		if (
			(currentState === "READY" || currentState === "PLAYING") &&
			!isPending()
		) {
			webapis.avplay.setSelectTrack("AUDIO", trackIndex);
			setCurrentAudioTrack(getStreamInfo("AUDIO"));
		}
	}

	function handleChangeSubtitle(trackIndex?: number) {
		if (!trackIndex) {
			setShowSubtitles(false);
			setCurrentSubtitleTrack(false);
			return;
		}
		const currentState = webapis.avplay.getState();
		if (
			(currentState === "READY" ||
				currentState === "PLAYING" ||
				currentState === "PAUSED") &&
			!isPending()
		) {
			webapis.avplay.setSelectTrack("TEXT", trackIndex);
			setCurrentSubtitleTrack(getStreamInfo("TEXT"));
		}
		setShowSubtitles(true);
	}

	function changeVolume(volume: number) {
		console.log(volume);
		// Conditionally use the tizen api so the functionality works (for debugging purposes on normal browsers)
		if (props.canPlayonTizen) {
			tizen.tvaudiocontrol.setVolume(volume);
		}
		setVolume(volume);
	}

	function onMuteChange() {
		// Conditionally use the tizen api so the functionality works (for debugging purposes on normal browsers)
		const muted = props.canPlayonTizen
			? tizen.tvaudiocontrol.isMute()
			: isMute();
		const newMutedState = !muted;

		if (props.canPlayonTizen) {
			tizen.tvaudiocontrol.setMute(newMutedState);
		}

		setIsMute(newMutedState);
		console.log("Muted: ", newMutedState);
	}

	function updatePlaybackSpeed(newSpeed: number) {
		// Sets the current playback rate. Positive parameter values play the media forwards, while negative values cause the media to play in reverse.
		const currentState = webapis.avplay.getState();
		if (
			(currentState === "READY" ||
				currentState === "PLAYING" ||
				currentState === "PAUSED") &&
			!isPending()
		) {
			webapis.avplay.setSpeed(newSpeed);
			setPlaybackSpeed(newSpeed);
		}
	}

	function onTvVolumeChange(volume: number) {
		setVolume(volume);
	}

	onMount(() => {
		tizen.tvinputdevice.registerKey("MediaPlayPause");

		// Initially start the timeout
		resetTimeout();
	});

	let listener: AVPlayPlaybackCallback = {
		onbufferingstart: function () {
			console.log("Buffering start.");
			setIsBuffering(true);
		},

		onbufferingprogress: function (percent: number) {
			console.log("Buffering progress data : " + percent);
			setBufferPercent(percent);
		},

		onbufferingcomplete: function () {
			console.log("Buffering complete.");
			setIsBuffering(false);
		},
		onstreamcompleted: function () {
			console.log("Stream Completed");
			webapis.avplay.stop();
		},

		oncurrentplaytime: function (currentTime: number) {
			setElapsedTime(currentTime);
			// console.log("Current playtime: " + currentTime);
		},

		onerror: function (eventType) {
			console.log("event type error : " + eventType);
		},

		onevent: function (eventType, eventData) {
			console.log("event type: " + eventType + ", data: " + eventData);
		},

		onsubtitlechange: function (duration, text, data3, data4) {
			console.log(duration, data4, data3);
			console.log("subtitleText: " + text);
			setCurrentSubtitle(text);
		},
		// ondrmevent: function(drmEvent, drmData) {
		//     console.log("DRM callback: " + drmEvent + ", data: " + drmData);
		// }
	};

	function getStreamInfo(type: "AUDIO" | "TEXT") {
		const streamInfo = webapis.avplay.getCurrentStreamInfo();
		if (type === "AUDIO") {
			const audio = streamInfo.find((data) => data.type === "AUDIO");
			if (audio && audio.index) {
				const extraInfo = JSON.parse(audio?.extra_info || "");
				return {
					index: audio?.index,
					...extraInfo,
				};
			}
			return {};
		} else if (type === "TEXT") {
			const subtitle = streamInfo.find((data) => data.type === "TEXT");
			if (subtitle && subtitle.index) {
				const extraInfo = JSON.parse(subtitle?.extra_info || "");
				return {
					index: subtitle?.index,
					language:
						extraInfo.track_lang ||
						`Track ${parseInt(extraInfo.track_num) + 1}`,
					...extraInfo,
				};
			}
			return {};
		}
	}

	var successCallback = function () {
		console.log("The media has finished preparing");
		console.log("All Tracks", webapis.avplay.getTotalTrackInfo());
		console.log("Stream Info: ", webapis.avplay.getCurrentStreamInfo());
		setCurrentAudioTrack(getStreamInfo("AUDIO"));
		setCurrentSubtitleTrack(getStreamInfo("TEXT"));

		const totalTrackInfo = webapis.avplay.getTotalTrackInfo();
		const allAudioTracks: any[] = [];
		const allTextTracks: any[] = [];
		for (let i = 0; i < totalTrackInfo.length; i++) {
			let trackInfo = totalTrackInfo[i];
			const extraInfo = JSON.parse(trackInfo.extra_info);

			if (trackInfo.type == "AUDIO") {
				allAudioTracks.push({
					index: trackInfo.index,
					...extraInfo,
				});
			} else if (trackInfo.type == "TEXT") {
				allTextTracks.push({
					index: trackInfo.index,
					language:
						extraInfo.track_lang ||
						`Track ${parseInt(extraInfo.track_num) + 1}`,
					...extraInfo,
				});
			}
		}

		console.log(allAudioTracks, allTextTracks);
		setAvailableAudio(allAudioTracks);
		setAvailableSubtitles(allTextTracks);

		// setAvailableAudio();
		setMediaDuration(webapis.avplay.getDuration());
		webapis.avplay.play();
		setIsPending(false);
		setPaused(false);
	};

	var errorCallback = function () {
		console.log("The media has failed to prepare");
	};

	// const player = document.getElementById("avPlayer");

	function initializeVideo(mediaUrl: string) {
		setVolume(tizen.tvaudiocontrol.getVolume());
		webapis.avplay.open(mediaUrl);
		webapis.avplay.setListener(listener);
		webapis.avplay.setDisplayRect(0, 0, 1920, 1080);
		webapis.avplay.prepareAsync(successCallback, errorCallback);
	}

	// Check if this works when the device resolution is different from 1920x1080
	// webapis.avplay.setDisplayRect(0,0,window.innerWidth,window.innerHeight);

	return (
		<section
			class="fixed inset-0 !mx-0 h-full w-full duration-500 ease-in-out"
			classList={{ "opacity-0 invisible": !props.show }}
		>
			<Show when={props.canPlayonTizen}>
				<object
					class="absolute left-0 top-0 h-[1080px] w-[1920px] "
					id="avPlayer"
					type="application/avplayer"
				></object>
			</Show>
			<Show when={!props.canPlayonTizen}>
				<div class="bg-player absolute bottom-0 top-0 h-screen w-screen"></div>
			</Show>
			<div
				class="pointer-events-none invisible absolute z-30 flex h-full w-full items-center justify-center bg-black bg-opacity-0 opacity-0 duration-300 ease-in-out"
				classList={{
					"!bg-opacity-10": !showControls(),
					"!opacity-100 !visible": isBuffering(),
				}}
			>
				<div class="relative flex h-28 w-28 items-center justify-center">
					<svg
						class="vds-buffering-icon"
						// Don't spin when it is not visible, it affects performance, even if it's impact is relatively little
						classList={{ spinning: isBuffering() }}
						fill="none"
						viewBox="0 0 120 120"
						aria-hidden="true"
					>
						<circle
							class="buffering-track stroke-[8] text-gray-50 opacity-25"
							cx="60"
							cy="60"
							r="54"
							stroke="currentColor"
						></circle>
						<circle
							class="buffering-track-fill stroke-[9] text-white opacity-75"
							cx="60"
							cy="60"
							r="54"
							stroke="currentColor"
							pathLength="100"
							style={{
								"stroke-dasharray": 100,
								"stroke-dashoffset": "50",
							}}
						></circle>
					</svg>
					<p class="absolute text-[19px] font-semibold text-white">
						{bufferPercent()}%
					</p>
				</div>
			</div>
			<div class="pointer-events-none absolute z-30 flex h-full w-full items-end justify-center">
				<p
					class="text media-subtitle -translate-y-10 px-7 py-4 text-center text-[32px] font-bold text-white duration-500 ease-in-out"
					classList={{
						"!-translate-y-[calc(45px+64px+20px)]": showControls(),
						"!opacity-0 !invisible": !showSubtitles(),
					}}
					innerHTML={currentSubtitle()}
				></p>
			</div>
			<div
				ref={setControlsEl}
				id="player-controls"
				class="absolute bottom-0 top-0 z-20 flex h-screen w-screen flex-col items-center justify-end opacity-100 duration-500 ease-in-out"
			>
				<button class="absolute right-6 top-6" onclick={quitPlayer}>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="60"
						height="60"
						viewBox="0 0 24 24"
						fill="none"
					>
						<path
							d="M16.19 2H7.81C4.17 2 2 4.17 2 7.81v8.37C2 19.83 4.17 22 7.81 22h8.37c3.64 0 5.81-2.17 5.81-5.81V7.81C22 4.17 19.83 2 16.19 2Zm-.83 12.3c.29.29.29.77 0 1.06-.15.15-.34.22-.53.22s-.38-.07-.53-.22l-2.3-2.3-2.3 2.3c-.15.15-.34.22-.53.22s-.38-.07-.53-.22a.754.754 0 0 1 0-1.06l2.3-2.3-2.3-2.3a.754.754 0 0 1 0-1.06c.29-.29.77-.29 1.06 0l2.3 2.3 2.3-2.3c.29-.29.77-.29 1.06 0 .29.29.29.77 0 1.06l-2.3 2.3 2.3 2.3Z"
							fill="#f5f5f5"
						></path>
					</svg>
				</button>
				<div class="mb-1 flex h-[45px] w-full items-center space-x-4 px-16 text-[17px] font-semibold text-white">
					<p>{formatMilliseconds(elapsedTime())}</p>
					<TimeSlider
						elapsedTime={elapsedTime()}
						mediaDuration={mediaDuration()}
						updateElapsed={seekMedia}
					/>
					<p>{formatMilliseconds(mediaDuration())}</p>
				</div>
				<div class="mb-3 flex h-16 w-full items-center justify-between px-10 text-white">
					<div class="relative w-[400px]">
						<AudioSlider
							currentVolume={volume()}
							isMute={isMute()}
							updateVolume={changeVolume}
							toggleMute={onMuteChange}
						/>
					</div>

					<div class="flex items-center space-x-7">
						<ControlIcon onclick={() => jumpMedia("BACKWARD")}>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="40"
								height="40"
								viewBox="0 0 24 24"
								fill="none"
							>
								<path
									d="M14.431 16.92h-2.29c-.41 0-.75-.34-.75-.75s.34-.75.75-.75h2.29a.781.781 0 0 0 0-1.56h-2.29c-.24 0-.47-.12-.61-.31a.746.746 0 0 1-.1-.68l.76-2.29c.1-.31.39-.51.71-.51h3.06c.41 0 .75.34.75.75s-.34.75-.75.75h-2.52l-.26.79h1.25a2.279 2.279 0 1 1 0 4.56ZM9.54 16.92c-.41 0-.75-.34-.75-.75v-3.39L8.6 13c-.28.31-.75.33-1.06.06A.755.755 0 0 1 7.49 12l1.5-1.67c.21-.23.54-.31.83-.2.29.11.48.39.48.7v5.35c-.01.41-.34.74-.76.74Z"
									fill="#f5f5f5"
								></path>
								<path
									d="M12.002 3.48c-.08 0-.16.01-.24.01l.82-1.02c.26-.32.21-.8-.12-1.05a.747.747 0 0 0-1.05.12L9.442 4c-.01.01-.01.02-.02.04-.03.04-.05.09-.07.13-.02.05-.04.09-.05.13-.01.05-.01.09-.01.14v.2c.01.03.03.05.04.08.02.05.04.09.06.14.03.04.06.08.1.11.02.03.03.06.06.08.02.01.03.02.05.03.02.02.05.03.08.04.05.03.11.05.16.06.04.02.07.02.1.02s.05.01.08.01.05-.01.07-.02c.03 0 .06.01.09 0 .64-.15 1.24-.22 1.81-.22 4.49 0 8.14 3.65 8.14 8.14s-3.65 8.14-8.14 8.14-8.14-3.65-8.14-8.14c0-1.74.57-3.42 1.65-4.86a.75.75 0 0 0-1.2-.9c-1.28 1.7-1.95 3.69-1.95 5.76 0 5.31 4.32 9.64 9.64 9.64s9.64-4.32 9.64-9.64-4.32-9.63-9.63-9.63Z"
									fill="#f5f5f5"
								></path>
							</svg>
						</ControlIcon>

						<button onclick={togglePlayPause}>
							<Switch>
								<Match when={paused()}>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										width="60"
										height="60"
										viewBox="0 0 24 24"
										fill="none"
									>
										<path
											d="M11.969 2c-5.52 0-10 4.48-10 10s4.48 10 10 10 10-4.48 10-10-4.47-10-10-10Zm3 12.23-2.9 1.67a2.284 2.284 0 0 1-2.3 0 2.285 2.285 0 0 1-1.15-2v-3.35c0-.83.43-1.58 1.15-2 .72-.42 1.58-.42 2.31 0l2.9 1.67c.72.42 1.15 1.16 1.15 2 0 .84-.43 1.59-1.16 2.01Z"
											fill="#f5f5f5"
										></path>
									</svg>
								</Match>
								<Match when={!paused()}>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										width="60"
										height="60"
										viewBox="0 0 24 24"
										fill="none"
									>
										<path
											d="M11.969 2c-5.52 0-10 4.48-10 10s4.48 10 10 10 10-4.48 10-10-4.47-10-10-10Zm-1.25 13.03c0 .48-.2.67-.71.67h-1.3c-.51 0-.71-.19-.71-.67V8.97c0-.48.2-.67.71-.67h1.29c.51 0 .71.19.71.67v6.06h.01Zm5.28 0c0 .48-.2.67-.71.67h-1.29c-.51 0-.71-.19-.71-.67V8.97c0-.48.2-.67.71-.67h1.29c.51 0 .71.19.71.67v6.06Z"
											fill="#f5f5f5"
										></path>
									</svg>
								</Match>
							</Switch>
						</button>
						{/* <button class="w-12 h-12 flex items-center justify-center p-2 rounded-full border-2 bg-white bg-opacity-5 border-white">
                            <IconPlayerPlayFilled />
                        </button> */}
						<ControlIcon onclick={() => jumpMedia("FORWARD")}>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="40"
								height="40"
								viewBox="0 0 24 24"
								fill="none"
							>
								<path
									d="M14.431 16.92h-2.29c-.41 0-.75-.34-.75-.75s.34-.75.75-.75h2.29a.781.781 0 0 0 0-1.56h-2.29c-.24 0-.47-.12-.61-.31a.746.746 0 0 1-.1-.68l.76-2.29c.1-.31.39-.51.71-.51h3.06c.41 0 .75.34.75.75s-.34.75-.75.75h-2.52l-.26.79h1.25a2.279 2.279 0 1 1 0 4.56ZM9.54 16.92c-.41 0-.75-.34-.75-.75v-3.39L8.6 13c-.28.31-.75.33-1.06.06A.755.755 0 0 1 7.49 12l1.5-1.67c.21-.23.54-.31.83-.2.29.11.48.39.48.7v5.35c-.01.41-.34.74-.76.74Z"
									fill="#f5f5f5"
								></path>
								<path
									d="M19.692 7.349a.75.75 0 0 0-1.2.9c1.08 1.44 1.65 3.12 1.65 4.86 0 4.49-3.65 8.14-8.14 8.14s-8.14-3.65-8.14-8.14 3.65-8.13 8.14-8.13c.58 0 1.17.07 1.81.22.03.01.06 0 .09 0s.05.02.07.02c.03 0 .05-.01.08-.01s.06-.01.1-.02c.06-.01.11-.04.16-.06.03-.02.06-.03.09-.05.01-.01.03-.01.04-.02.03-.02.04-.05.06-.07a.58.58 0 0 0 .1-.12c.03-.04.04-.09.06-.14.01-.03.03-.06.04-.09v-.05c.01-.05.01-.1 0-.15 0-.05 0-.09-.01-.14-.01-.04-.03-.08-.05-.13a.61.61 0 0 0-.07-.14c0-.01 0-.02-.01-.03l-1.98-2.47a.748.748 0 0 0-1.05-.12c-.32.26-.37.73-.12 1.05l.82 1.02c-.08 0-.16-.01-.24-.01-5.31 0-9.64 4.32-9.64 9.64s4.32 9.64 9.64 9.64 9.64-4.32 9.64-9.64c.01-2.07-.67-4.06-1.94-5.76Z"
									fill="#f5f5f5"
								></path>
							</svg>
						</ControlIcon>
					</div>

					<div class="flex w-[400px] justify-end space-x-2">
						<ChangeAudioTrack
							currentAudioTrack={currentAudioTrack()}
							allAudioTracks={availableAudio()}
							onSelect={handleChangeAudio}
							menuOpen={audioMenuOpen()}
							setMenuOpen={setAudioMenuOpen}
						/>
						<ChangeSubtitles
							currentSubtitle={currentSubtitleTrack()}
							allSubtitles={availableSubtitles()}
							onSelect={handleChangeSubtitle}
							menuOpen={subtitleMenuOpen()}
							setMenuOpen={setSubtitleMenuOpen}
						/>
						<ChangeSpeed
							currentSpeed={playbackSpeed()}
							menuOpen={speedMenuOpen()}
							setMenuOpen={setSpeedMenuOpen}
							updateSpeed={updatePlaybackSpeed}
						/>
						{/* <ControlIcon icon={IconMaximize} /> */}
					</div>
				</div>
			</div>
		</section>
	);
}
