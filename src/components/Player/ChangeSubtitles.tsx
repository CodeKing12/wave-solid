import { For, Setter, createEffect } from "solid-js";
import { ControlIcon } from "./PlayerUtilities";
import { IconBadgeCc } from "@tabler/icons-solidjs";
import { FocusContext, useFocusable } from "@/spatial-nav";
import FocusLeaf from "../Utilities/FocusLeaf";
import { closeMenuOnBlur, controlShowEffect } from "@/utils/general";

interface AvailableSubtitlesProps {
	current: any;
	show: boolean;
	subtitles: any[];
	onClick: (index?: number) => void;
}

interface ChangeSubtitlesProps {
	currentSubtitle: any;
	allSubtitles: any[];
	onSelect: (index?: number) => void;
	menuOpen: boolean;
	setMenuOpen: Setter<boolean>;
}

function AvailableSubtitles(props: AvailableSubtitlesProps) {
	const { setRef, focusKey, focusSelf, focused, hasFocusedChild } =
		useFocusable({
			get preferredChildFocusKey() {
				return (
					"AVPLAYER-SUBTITLE-TRACK-" +
					props.subtitles[props.subtitles.length - 1]?.index
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
			"AVPLAYER-SUBTITLE-CONTROL-BUTTON",
		),
	);

	return (
		// -translate-y- must be higher than the height of the timeline component for proper visibility
		<FocusContext.Provider value={focusKey()}>
			<div
				class="absolute bottom-full right-0 flex -translate-y-12 flex-col space-y-1 rounded-md bg-neutral-950 bg-opacity-90 py-3 backdrop-blur-sm duration-[400ms] ease-in-out"
				classList={{
					"!opacity-0 !invisible !-translate-y-24": !props.show,
				}}
				ref={setRef}
			>
				<FocusLeaf
					class="border-white"
					focusedStyles="text-yellow-300"
					customFocusKey={"AVPLAYER-SUBTITLE-TRACK-OFF"}
					onEnterPress={() => props.onClick()}
				>
					<button
						class="flex w-60 items-center space-x-3 bg-white bg-opacity-0 px-6 py-3 text-left text-[17px] font-medium capitalize duration-300 ease-in-out hover:bg-opacity-10"
						onclick={() => props.onClick()}
					>
						<span
							class="block h-5 w-5 rounded-full border-2 border-current duration-150 ease-linear"
							classList={{
								"bg-current": !props.current,
							}}
						></span>
						<span>off</span>
					</button>
				</FocusLeaf>
				<For each={props.subtitles}>
					{(subtitle: any) => (
						<FocusLeaf
							class="border-white"
							focusedStyles="text-yellow-300"
							customFocusKey={
								"AVPLAYER-SUBTITLE-TRACK-" + subtitle.index
							}
							onEnterPress={() => props.onClick(subtitle.index)}
						>
							<button
								class="flex w-60 items-center space-x-3 bg-white bg-opacity-0 px-6 py-3 text-left text-[17px] font-medium capitalize duration-300 ease-in-out hover:bg-opacity-10"
								onclick={() => props.onClick(subtitle.index)}
							>
								<span
									class="block h-5 w-5 rounded-full border-2 border-current duration-150 ease-linear"
									classList={{
										"bg-current":
											subtitle.index ===
											props.current?.index,
									}}
								></span>
								<span>{subtitle.language}</span>
							</button>
						</FocusLeaf>
					)}
				</For>
			</div>
		</FocusContext.Provider>
	);
}

export function ChangeSubtitles(props: ChangeSubtitlesProps) {
	return (
		<div class="relative">
			<AvailableSubtitles
				current={props.currentSubtitle}
				show={props.menuOpen}
				subtitles={props.allSubtitles}
				onClick={props.onSelect}
			/>
			<FocusLeaf
				class="control-focus"
				focusedStyles="is-focused"
				customFocusKey="AVPLAYER-SUBTITLE-CONTROL-BUTTON"
				isFocusable={props.allSubtitles.length > 0}
				onArrowPress={(direction: string) =>
					closeMenuOnBlur(direction, props.setMenuOpen)
				}
				onEnterPress={() => props.setMenuOpen(!props.menuOpen)}
			>
				<ControlIcon
					icon={IconBadgeCc}
					disabled={props.allSubtitles.length === 0}
					onclick={() => props.setMenuOpen(!props.menuOpen)}
				/>
			</FocusLeaf>
		</div>
	);
}
