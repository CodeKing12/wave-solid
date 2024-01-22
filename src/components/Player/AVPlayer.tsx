// -@ts-nocheck

import { ControlIcon, RangeSlider } from "./PlayerUtilities";
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
import FocusLeaf from "../Utilities/FocusLeaf";
import { FocusContext, useFocusable } from "@/spatial-nav";
import PlaybackControls from "./PlaybackControls";

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

interface SubtitleObj {
	duration: number;
	text: string;
	now: number;
}

export function AudioSlider(props: AudioSliderProps) {
	const { setRef, focused } = useFocusable({});

	return (
		<div
			ref={setRef}
			id="audio-slider"
			class="control-focus flex items-center space-x-1"
			classList={{ "is-focused": focused() }}
		>
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
								fill="currentColor"
							></path>
							<path
								d="M19.828 19.25a.75.75 0 0 1-.6-1.2c2.67-3.56 2.67-8.54 0-12.1a.75.75 0 0 1 1.2-.9c3.07 4.09 3.07 9.81 0 13.9-.14.2-.37.3-.6.3ZM14.02 3.782c-1.12-.62-2.55-.46-4.01.45l-2.92 1.83c-.2.12-.43.19-.66.19H5c-2.42 0-3.75 1.33-3.75 3.75v4c0 2.42 1.33 3.75 3.75 3.75H6.43c.23 0 .46.07.66.19l2.92 1.83c.88.55 1.74.82 2.54.82a3 3 0 0 0 1.47-.37c1.11-.62 1.73-1.91 1.73-3.63v-9.18c0-1.72-.62-3.01-1.73-3.63Z"
								fill="currentColor"
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
								fill="currentColor"
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
	let subtitleTimeout: any;
	let forwardTimer: number | undefined;
	let forwardInterval: number | undefined;
	let playbackCount = 0;
	// const controlsId = "player-controls"
	// const [controlsEl, setControlsEl] = createSignal<HTMLElement | undefined>();
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
	const defaultSubtitle: SubtitleObj = {
		duration: 0,
		text: "",
		now: 0,
	};
	const [currentSubtitle, setCurrentSubtitle] =
		createSignal<SubtitleObj>(defaultSubtitle);
	const [audioMenuOpen, setAudioMenuOpen] = createSignal(false);
	const [subtitleMenuOpen, setSubtitleMenuOpen] = createSignal(false);
	const [speedMenuOpen, setSpeedMenuOpen] = createSignal(false);
	const [volume, setVolume] = createSignal(50);
	const [isMute, setIsMute] = createSignal(false);
	const [showSubtitles, setShowSubtitles] = createSignal(true);

	const { ref, setRef, focusKey, focusSelf } = useFocusable({
		get isFocusBoundary() {
			return props.show;
		},
		get focusable() {
			return props.show;
		},
	});

	createEffect(() => {
		if (props.show) {
			document.addEventListener("keydown", handleKeyPress);
			document.addEventListener("keyup", handleKeyUp);
			document.addEventListener("mousemove", showElement);
			document.addEventListener("mousedown", showElement);

			if (props.url) {
				console.log("Focusing Player");
				focusSelf();

				if (props.canPlayonTizen) {
					tizen.tvaudiocontrol.setVolumeChangeListener(
						onTvVolumeChange,
					);

					setMediaDuration(0);
					setElapsedTime(0);
					setAvailableAudio([]);
					setAvailableSubtitles([]);
					webapis.avplay.stop();
					initializeVideo(props.url);
				}
			}
		}

		onCleanup(() => {
			document.removeEventListener("mousemove", showElement);
			document.removeEventListener("mousedown", showElement);
			document.removeEventListener("keydown", handleKeyPress);

			if (props.canPlayonTizen) {
				tizen.tvaudiocontrol.unsetVolumeChangeListener();
			}
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
		console.log("Seek Successful");
	}

	function onSeekError() {
		setIsPending(false);
		console.log("Failed to Seek Media");
	}

	function hideElement() {
		// @ts-ignore because by when the function is called, the element would have already be passed to the ref
		ref().style.opacity = "0";
		setShowControls(false);
		setAudioMenuOpen(false);
		setSubtitleMenuOpen(false);
		setSpeedMenuOpen(false);
	}

	function showElement() {
		// @ts-ignore
		ref().style.opacity = "1";
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
			refreshSubtitle();
			setPaused(false);
			console.log("Resumed Video");
		} else if (currentState === "PLAYING" && !isPending()) {
			webapis.avplay.pause();
			if (subtitleTimeout) {
				clearTimeout(subtitleTimeout);
			}
			setPaused(true);
			console.log("Paused Video");
		}
	}

	function longPressPlayback() {
		// Start timer on press
		forwardInterval = setInterval(function () {
			playbackCount += 1;
			console.log("Interval total: ", playbackCount);
			// Increment forwarding time based on timer duration
			// console.log(`Performing the ${direction} JUMP now`);
			// console.log("Final count: ", playbackCount, 15000 * playbackCount);
		}, 250); // Adjust timer interval as needed
	}

	function queuePlayback(direction: "FORWARD" | "BACKWARD") {
		// Start timer on press
		console.log("Interval: ", forwardInterval, Boolean(forwardInterval));
		if (forwardTimer) {
			clearTimeout(forwardTimer);
		}
		if (forwardInterval) {
			clearInterval(forwardInterval);
		}
		playbackCount += 1;
		forwardTimer = setTimeout(function () {
			// Increment forwarding time based on timer duration
			console.log(`Performing the ${direction} JUMP now`);
			console.log("Final count: ", playbackCount, 15000 * playbackCount);
			if (props.canPlayonTizen) {
				jumpMedia(direction, 15000 * playbackCount);
			}
			playbackCount = 0;
		}, 1000); // Adjust timer interval as needed
	}

	function handleKeyPress(event: KeyboardEvent) {
		showElement();
		const keycode = event.keyCode;
		// console.log("Pressed: ", keycode);

		// Space: 32
		// Enter & Remote-center: 13
		// Left: 37
		// Right: 39
		// Up: 38
		// Down: 40
		// Remote-play/pause: 10252
		// Escape & Remote-back: 10009
		switch (keycode) {
			// case 32:
			// 	togglePlayPause();
			// 	break;
			// case 13:
			// 	togglePlayPause();
			// case 10252:
			// 	togglePlayPause();
			// 	break;
			case 19: // MediaPause
			case 415: // MediaPlay
			case 10252: // MediaRewind
				togglePlayPause();
				break;
			case 412: // MediaRewind
				console.log("Clicked the back button");
				longPressPlayback();
				break;
			case 417: // MediaFastForward
				console.log("Clicked the forward button");
				longPressPlayback();
				// jumpMedia("FORWARD");
				break;
			case 27:
			case 10009:
				if (audioMenuOpen()) {
					setAudioMenuOpen(false);
				} else if (subtitleMenuOpen()) {
					setSubtitleMenuOpen(false);
				} else if (speedMenuOpen()) {
					setSpeedMenuOpen(false);
				} else {
					quitPlayer();
				}
				break;
			default:
				break;
		}
	}

	function handleKeyUp(event: KeyboardEvent) {
		const keycode = event.keyCode;

		switch (keycode) {
			case 412: // MediaRewind
				console.log("Clicked the back button");
				queuePlayback("BACKWARD");
				break;
			case 417: // MediaFastForward
				console.log("Clicked the forward button");
				queuePlayback("FORWARD");
				// jumpMedia("FORWARD");
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
				console.log(`Jumping Forward by ${milliseconds / 1000}s`);
				setIsPending(true);
				webapis.avplay.jumpForward(
					milliseconds,
					onSeekSuccess,
					onSeekError,
				);
			} else if (direction === "BACKWARD") {
				console.log(`Jumping Backward by ${milliseconds / 1000}s`);
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
		if (props.canPlayonTizen) {
			var usedKeys = [
				"MediaPlay",
				"MediaPause",
				"MediaPlayPause",
				"MediaStop",
				"MediaFastForward",
				"MediaRewind",
				"0",
				"1",
				"2",
				"3",
			];

			usedKeys.forEach(function (keyName) {
				tizen.tvinputdevice.registerKey(keyName);
			});
		}

		// Initially start the timeout
		resetTimeout();
	});

	function refreshSubtitle() {
		if (currentSubtitle() && currentSubtitle().duration) {
			var lastSubDurationDiff =
				currentSubtitle().duration -
				(elapsedTime() - currentSubtitle().now);
			if (lastSubDurationDiff > 0)
				renderSubtitle(lastSubDurationDiff, currentSubtitle().text);
		}
	}

	function renderSubtitle(duration: number, text: string) {
		if (subtitleTimeout) {
			clearTimeout(subtitleTimeout);
			subtitleTimeout = false;
		}

		console.log("subtitleDuration: " + duration);
		console.log("subtitleText: " + text);
		setCurrentSubtitle({
			duration,
			text,
			now: webapis.avplay.getCurrentTime(),
		});

		if (duration) {
			subtitleTimeout = setTimeout(function () {
				console.log("Clearing Subtitle");
				setCurrentSubtitle(defaultSubtitle);
			}, duration);
		}
	}

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
			quitPlayer();
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

		onsubtitlechange: function (duration, text) {
			renderSubtitle(parseInt(duration), text);
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
		<FocusContext.Provider value={focusKey()}>
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
							"!-translate-y-[calc(45px+64px+20px)]":
								showControls(),
							"!opacity-0 !invisible": !showSubtitles(),
						}}
						innerHTML={currentSubtitle().text}
					></p>
				</div>
				<div
					ref={setRef}
					id="player-controls"
					class="absolute bottom-0 top-0 z-20 flex h-screen w-screen flex-col items-center justify-end opacity-100 duration-500 ease-in-out"
				>
					<FocusLeaf
						class="control-focus absolute right-6 top-6"
						focusedStyles="is-focused"
						onEnterPress={quitPlayer}
					>
						<button class="" onclick={quitPlayer}>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="60"
								height="60"
								viewBox="0 0 24 24"
								fill="none"
							>
								<path
									d="M16.19 2H7.81C4.17 2 2 4.17 2 7.81v8.37C2 19.83 4.17 22 7.81 22h8.37c3.64 0 5.81-2.17 5.81-5.81V7.81C22 4.17 19.83 2 16.19 2Zm-.83 12.3c.29.29.29.77 0 1.06-.15.15-.34.22-.53.22s-.38-.07-.53-.22l-2.3-2.3-2.3 2.3c-.15.15-.34.22-.53.22s-.38-.07-.53-.22a.754.754 0 0 1 0-1.06l2.3-2.3-2.3-2.3a.754.754 0 0 1 0-1.06c.29-.29.77-.29 1.06 0l2.3 2.3 2.3-2.3c.29-.29.77-.29 1.06 0 .29.29.29.77 0 1.06l-2.3 2.3 2.3 2.3Z"
									fill="currentColor"
								></path>
							</svg>
						</button>
					</FocusLeaf>
					<div
						class="mb-1 flex h-[45px] w-full items-center space-x-4 px-16 text-[17px] font-semibold text-white"
						// focusedStyles="is-focused"
					>
						<p>{formatMilliseconds(elapsedTime())}</p>
						<TimeSlider
							elapsedTime={elapsedTime()}
							mediaDuration={mediaDuration()}
							updateElapsed={seekMedia}
						/>
						<p>{formatMilliseconds(mediaDuration())}</p>
					</div>
					<PlaybackControls
						volume={volume()}
						audioMenuOpen={audioMenuOpen()}
						subtitleMenuOpen={subtitleMenuOpen()}
						speedMenuOpen={speedMenuOpen()}
						availableAudio={availableAudio()}
						availableSubtitles={availableSubtitles()}
						changeVolume={changeVolume}
						currentAudioTrack={currentAudioTrack()}
						currentSubtitleTrack={currentSubtitleTrack()}
						handleChangeAudio={handleChangeAudio}
						handleChangeSubtitle={handleChangeSubtitle}
						isMute={isMute()}
						jumpMedia={jumpMedia}
						onMuteChange={onMuteChange}
						paused={paused()}
						playbackSpeed={playbackSpeed()}
						setAudioMenuOpen={setAudioMenuOpen}
						setSpeedMenuOpen={setSpeedMenuOpen}
						setSubtitleMenuOpen={setSubtitleMenuOpen}
						togglePlayPause={togglePlayPause}
						updatePlaybackSpeed={updatePlaybackSpeed}
					/>
				</div>
			</section>
		</FocusContext.Provider>
	);
}
