import { For, Setter, createEffect } from "solid-js";
import { ControlIcon } from "./PlayerUtilities";
import { IconLanguage } from "@tabler/icons-solidjs";
import { FocusContext, useFocusable } from "@/spatial-nav";
import { closeMenuOnBlur, controlShowEffect } from "@/utils/general";
import FocusLeaf from "../Utilities/FocusLeaf";

interface AvailableAudioProps {
	current: any;
	show: boolean;
	audioTracks: any[];
	onClick: (index: number) => void;
}

interface ChangeAudioTrackProps {
	currentAudioTrack: any;
	allAudioTracks: any[];
	onSelect: (index: number) => void;
	menuOpen: boolean;
	setMenuOpen: Setter<boolean>;
}

function AvailableAudioTracks(props: AvailableAudioProps) {
	const { setRef, focusKey, focusSelf, focused, hasFocusedChild } =
		useFocusable({
			get preferredChildFocusKey() {
				return (
					"AVPLAYER-AUDIO-TRACK-" +
					props.audioTracks[props.audioTracks.length - 1]?.index
				);
			},
			trackChildren: true,
			isFocusBoundary: true,
			focusBoundaryDirections: ["up", "left", "right"],
			get focusable() {
				return props.show;
			},
		});

	createEffect(() =>
		controlShowEffect(
			props.show,
			focusSelf,
			focused(),
			hasFocusedChild(),
			"AVPLAYER-AUDIO-CONTROL-BUTTON",
		),
	);

	return (
		// -translate-y- must be higher than the height of the timeline component for proper visibility
		<FocusContext.Provider value={focusKey()}>
			<div
				class="absolute bottom-full right-0 flex -translate-y-12 flex-col gap-1 rounded-md bg-neutral-950 bg-opacity-90 py-3 backdrop-blur-sm duration-[400ms] ease-in-out"
				classList={{
					"!opacity-0 !invisible !-translate-y-24": !props.show,
				}}
				ref={setRef}
			>
				<For each={props.audioTracks}>
					{(audio: any) => (
						<FocusLeaf
							class="border-white"
							focusedStyles="text-yellow-300"
							customFocusKey={
								"AVPLAYER-AUDIO-TRACK-" + audio.index
							}
							onEnterPress={() => props.onClick(audio.index)}
						>
							<button
								class="flex w-60 items-center gap-3 bg-white bg-opacity-0 px-6 py-3 text-left text-[17px] font-medium uppercase duration-300 ease-in-out hover:bg-opacity-10"
								onclick={() => props.onClick(audio.index)}
							>
								<span
									class="block h-5 w-5 rounded-full border-2 border-current duration-150 ease-linear"
									classList={{
										"bg-current":
											audio.index ===
											props.current?.index,
									}}
								></span>
								{audio.language}
							</button>
						</FocusLeaf>
					)}
				</For>
			</div>
		</FocusContext.Provider>
	);
}

export function ChangeAudioTrack(props: ChangeAudioTrackProps) {
	return (
		<div class="relative">
			<AvailableAudioTracks
				current={props.currentAudioTrack}
				show={props.menuOpen}
				audioTracks={props.allAudioTracks}
				onClick={props.onSelect}
			/>
			<FocusLeaf
				class="control-focus"
				focusedStyles="is-focused"
				customFocusKey="AVPLAYER-AUDIO-CONTROL-BUTTON"
				isFocusable={props.allAudioTracks.length > 0}
				onArrowPress={(direction: string) =>
					closeMenuOnBlur(direction, props.setMenuOpen)
				}
				onEnterPress={() => props.setMenuOpen(!props.menuOpen)}
			>
				<ControlIcon
					icon={IconLanguage}
					disabled={props.allAudioTracks.length === 0}
					onclick={() => props.setMenuOpen(!props.menuOpen)}
				/>
			</FocusLeaf>
		</div>
	);
}
