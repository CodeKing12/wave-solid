import { Match, Setter, Switch } from "solid-js";
import { ControlIcon } from "./PlayerUtilities";
import { AudioSlider } from "./AVPlayer";
import { ChangeAudioTrack } from "./ChangeAudio";
import { ChangeSubtitles } from "./ChangeSubtitles";
import { ChangeSpeed } from "./ChangeSpeed";
import FocusLeaf from "../Utilities/FocusLeaf";
import { FocusContext, useFocusable } from "@/spatial-nav";

interface PlaybackControlsProps {
	volume: number;
	isMute: boolean;
	changeVolume: (volume: number) => void;
	onMuteChange: () => void;
	paused: boolean;
	jumpMedia: (
		direction: "FORWARD" | "BACKWARD",
		milliseconds?: number,
	) => void;
	handleChangeAudio: (trackIndex: number) => void;
	handleChangeSubtitle: (trackIndex?: number) => void;
	updatePlaybackSpeed: (newSpeed: number) => void;
	togglePlayPause: () => void;
	currentAudioTrack: any;
	currentSubtitleTrack: any | false;
	playbackSpeed: number;
	availableAudio: any[];
	availableSubtitles: any[];
	speedMenuOpen: boolean;
	setSpeedMenuOpen: Setter<boolean>;
	audioMenuOpen: boolean;
	setAudioMenuOpen: Setter<boolean>;
	subtitleMenuOpen: boolean;
	setSubtitleMenuOpen: Setter<boolean>;
}

export default function PlaybackControls(props: PlaybackControlsProps) {
	const { focusKey, setRef } = useFocusable({
		isFocusBoundary: true,
		focusBoundaryDirections: ["left", "right"],
	});

	return (
		<FocusContext.Provider value={focusKey()}>
			<div
				class="mb-3 flex h-16 w-full items-center justify-between px-10 text-white"
				ref={setRef}
			>
				<div class="relative w-[400px]">
					<AudioSlider
						currentVolume={props.volume}
						isMute={props.isMute}
						updateVolume={props.changeVolume}
						toggleMute={props.onMuteChange}
					/>
				</div>

				<div class="flex items-center space-x-7">
					<FocusLeaf
						class="control-focus"
						focusedStyles="is-focused"
						onEnterPress={() => props.jumpMedia("BACKWARD")}
					>
						<ControlIcon
							onclick={() => props.jumpMedia("BACKWARD")}
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="40"
								height="40"
								viewBox="0 0 24 24"
								fill="none"
							>
								<path
									d="M14.431 16.92h-2.29c-.41 0-.75-.34-.75-.75s.34-.75.75-.75h2.29a.781.781 0 0 0 0-1.56h-2.29c-.24 0-.47-.12-.61-.31a.746.746 0 0 1-.1-.68l.76-2.29c.1-.31.39-.51.71-.51h3.06c.41 0 .75.34.75.75s-.34.75-.75.75h-2.52l-.26.79h1.25a2.279 2.279 0 1 1 0 4.56ZM9.54 16.92c-.41 0-.75-.34-.75-.75v-3.39L8.6 13c-.28.31-.75.33-1.06.06A.755.755 0 0 1 7.49 12l1.5-1.67c.21-.23.54-.31.83-.2.29.11.48.39.48.7v5.35c-.01.41-.34.74-.76.74Z"
									fill="currentColor"
								></path>
								<path
									d="M12.002 3.48c-.08 0-.16.01-.24.01l.82-1.02c.26-.32.21-.8-.12-1.05a.747.747 0 0 0-1.05.12L9.442 4c-.01.01-.01.02-.02.04-.03.04-.05.09-.07.13-.02.05-.04.09-.05.13-.01.05-.01.09-.01.14v.2c.01.03.03.05.04.08.02.05.04.09.06.14.03.04.06.08.1.11.02.03.03.06.06.08.02.01.03.02.05.03.02.02.05.03.08.04.05.03.11.05.16.06.04.02.07.02.1.02s.05.01.08.01.05-.01.07-.02c.03 0 .06.01.09 0 .64-.15 1.24-.22 1.81-.22 4.49 0 8.14 3.65 8.14 8.14s-3.65 8.14-8.14 8.14-8.14-3.65-8.14-8.14c0-1.74.57-3.42 1.65-4.86a.75.75 0 0 0-1.2-.9c-1.28 1.7-1.95 3.69-1.95 5.76 0 5.31 4.32 9.64 9.64 9.64s9.64-4.32 9.64-9.64-4.32-9.63-9.63-9.63Z"
									fill="currentColor"
								></path>
							</svg>
						</ControlIcon>
					</FocusLeaf>

					<FocusLeaf
						class="control-focus"
						focusedStyles="is-focused"
						onEnterPress={props.togglePlayPause}
					>
						<button onclick={props.togglePlayPause}>
							<Switch>
								<Match when={props.paused}>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										width="60"
										height="60"
										viewBox="0 0 24 24"
										fill="none"
									>
										<path
											d="M11.969 2c-5.52 0-10 4.48-10 10s4.48 10 10 10 10-4.48 10-10-4.47-10-10-10Zm3 12.23-2.9 1.67a2.284 2.284 0 0 1-2.3 0 2.285 2.285 0 0 1-1.15-2v-3.35c0-.83.43-1.58 1.15-2 .72-.42 1.58-.42 2.31 0l2.9 1.67c.72.42 1.15 1.16 1.15 2 0 .84-.43 1.59-1.16 2.01Z"
											fill="currentColor"
										></path>
									</svg>
								</Match>
								<Match when={!props.paused}>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										width="60"
										height="60"
										viewBox="0 0 24 24"
										fill="none"
									>
										<path
											d="M11.969 2c-5.52 0-10 4.48-10 10s4.48 10 10 10 10-4.48 10-10-4.47-10-10-10Zm-1.25 13.03c0 .48-.2.67-.71.67h-1.3c-.51 0-.71-.19-.71-.67V8.97c0-.48.2-.67.71-.67h1.29c.51 0 .71.19.71.67v6.06h.01Zm5.28 0c0 .48-.2.67-.71.67h-1.29c-.51 0-.71-.19-.71-.67V8.97c0-.48.2-.67.71-.67h1.29c.51 0 .71.19.71.67v6.06Z"
											fill="currentColor"
										></path>
									</svg>
								</Match>
							</Switch>
						</button>
					</FocusLeaf>
					{/* <button class="w-12 h-12 flex items-center justify-center p-2 rounded-full border-2 bg-white bg-opacity-5 border-white">
                                    <IconPlayerPlayFilled />
                                </button> */}
					<FocusLeaf
						class="control-focus"
						focusedStyles="is-focused"
						onEnterPress={() => props.jumpMedia("FORWARD")}
					>
						<ControlIcon onclick={() => props.jumpMedia("FORWARD")}>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="40"
								height="40"
								viewBox="0 0 24 24"
								fill="none"
							>
								<path
									d="M14.431 16.92h-2.29c-.41 0-.75-.34-.75-.75s.34-.75.75-.75h2.29a.781.781 0 0 0 0-1.56h-2.29c-.24 0-.47-.12-.61-.31a.746.746 0 0 1-.1-.68l.76-2.29c.1-.31.39-.51.71-.51h3.06c.41 0 .75.34.75.75s-.34.75-.75.75h-2.52l-.26.79h1.25a2.279 2.279 0 1 1 0 4.56ZM9.54 16.92c-.41 0-.75-.34-.75-.75v-3.39L8.6 13c-.28.31-.75.33-1.06.06A.755.755 0 0 1 7.49 12l1.5-1.67c.21-.23.54-.31.83-.2.29.11.48.39.48.7v5.35c-.01.41-.34.74-.76.74Z"
									fill="currentColor"
								></path>
								<path
									d="M19.692 7.349a.75.75 0 0 0-1.2.9c1.08 1.44 1.65 3.12 1.65 4.86 0 4.49-3.65 8.14-8.14 8.14s-8.14-3.65-8.14-8.14 3.65-8.13 8.14-8.13c.58 0 1.17.07 1.81.22.03.01.06 0 .09 0s.05.02.07.02c.03 0 .05-.01.08-.01s.06-.01.1-.02c.06-.01.11-.04.16-.06.03-.02.06-.03.09-.05.01-.01.03-.01.04-.02.03-.02.04-.05.06-.07a.58.58 0 0 0 .1-.12c.03-.04.04-.09.06-.14.01-.03.03-.06.04-.09v-.05c.01-.05.01-.1 0-.15 0-.05 0-.09-.01-.14-.01-.04-.03-.08-.05-.13a.61.61 0 0 0-.07-.14c0-.01 0-.02-.01-.03l-1.98-2.47a.748.748 0 0 0-1.05-.12c-.32.26-.37.73-.12 1.05l.82 1.02c-.08 0-.16-.01-.24-.01-5.31 0-9.64 4.32-9.64 9.64s4.32 9.64 9.64 9.64 9.64-4.32 9.64-9.64c.01-2.07-.67-4.06-1.94-5.76Z"
									fill="currentColor"
								></path>
							</svg>
						</ControlIcon>
					</FocusLeaf>
				</div>

				<div class="flex w-[400px] justify-end space-x-2">
					<ChangeAudioTrack
						currentAudioTrack={props.currentAudioTrack}
						allAudioTracks={props.availableAudio}
						onSelect={props.handleChangeAudio}
						menuOpen={props.audioMenuOpen}
						setMenuOpen={props.setAudioMenuOpen}
					/>
					<ChangeSubtitles
						currentSubtitle={props.currentSubtitleTrack}
						allSubtitles={props.availableSubtitles}
						onSelect={props.handleChangeSubtitle}
						menuOpen={props.subtitleMenuOpen}
						setMenuOpen={props.setSubtitleMenuOpen}
					/>
					<ChangeSpeed
						currentSpeed={props.playbackSpeed}
						menuOpen={props.speedMenuOpen}
						setMenuOpen={props.setSpeedMenuOpen}
						updateSpeed={props.updatePlaybackSpeed}
					/>
					{/* <ControlIcon icon={IconMaximize} /> */}
				</div>
			</div>
		</FocusContext.Provider>
	);
}
