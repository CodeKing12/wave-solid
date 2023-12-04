import { Accessor, Index, Setter, Show, createEffect } from "solid-js";
import { ControlIcon } from "./PlayerUtilities";
import { FocusContext, useFocusable } from "@/spatial-nav";
import { closeMenuOnBlur, controlShowEffect } from "@/utils/general";
import FocusLeaf from "../Utilities/FocusLeaf";

interface SelectSpeedProps {
	current: number;
	show: boolean;
	onClick: (speed: number) => void;
}

interface ChangeSpeedProps {
	menuOpen: boolean;
	setMenuOpen: Setter<boolean>;
	currentSpeed: number;
	updateSpeed: (newSpeed: number) => void;
}

function SelectSpeed(props: SelectSpeedProps) {
	// For HTTP and HTTPS videos, the supported playback rate is -8x ~ 8x in AVPlay.
	const speedOptions = [-8, -4, -2, 1, 2, 4, 8];
	const { setRef, focusKey, focusSelf, focused, hasFocusedChild } =
		useFocusable({
			get preferredChildFocusKey() {
				return (
					"AVPLAYER-SPEED-CONTROL-" +
					speedOptions[speedOptions.length - 1].toString()
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
			"AVPLAYER-SPEED-CONTROL-BUTTON",
		),
	);
	// const speedDisplay = ["Slowest", "Slower", "Slow", "Normal", "Fast", "Faster", "Fastest"];

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
				<Index each={speedOptions}>
					{(option: Accessor<number>) => (
						<FocusLeaf
							customFocusKey={
								"AVPLAYER-SPEED-CONTROL-" + option().toString()
							}
							class="border-white"
							focusedStyles="text-yellow-300"
							onEnterPress={() => props.onClick(option())}
						>
							<button
								class="flex w-60 items-center gap-3 bg-white bg-opacity-0 px-6 py-3 text-left text-base font-medium capitalize duration-300 ease-in-out hover:bg-opacity-10"
								onclick={() => props.onClick(option())}
							>
								<span
									class="block h-5 w-5 rounded-full border-2 border-current duration-150 ease-linear"
									classList={{
										"bg-current":
											option() === props.current,
									}}
								></span>
								<p>
									<Show
										when={option() !== 1}
										fallback={"Normal"}
									>
										<span class="ml-1 text-base">
											{1 / Math.abs(option())}
										</span>
									</Show>
								</p>
							</button>
						</FocusLeaf>
					)}
				</Index>
			</div>
		</FocusContext.Provider>
	);
}

export function ChangeSpeed(props: ChangeSpeedProps) {
	// const { setRef, focusKey } = useFocusable({});

	return (
		// <FocusContext.Provider value={focusKey()}>
		<div
			// ref={setRef}
			// classList={{ "is-focused": focused() }}
			class="relative"
			tabIndex="1"
			onBlur={() => console.log("Close Speed Menu Now")}
		>
			<SelectSpeed
				current={props.currentSpeed}
				show={props.menuOpen}
				onClick={props.updateSpeed}
			/>
			<FocusLeaf
				class="control-focus"
				focusedStyles="is-focused"
				customFocusKey="AVPLAYER-SPEED-CONTROL-BUTTON"
				onArrowPress={(direction: string) =>
					closeMenuOnBlur(direction, props.setMenuOpen)
				}
				onEnterPress={() => props.setMenuOpen(!props.menuOpen)}
			>
				<ControlIcon onclick={() => props.setMenuOpen(!props.menuOpen)}>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="35"
						height="35"
						viewBox="0 0 24 24"
						fill="none"
					>
						<path
							d="M19.14 20.25c-.19 0-.38-.07-.53-.21-.3-.29-.3-.76-.01-1.06a9.188 9.188 0 0 0 2.65-6.48c0-5.1-4.15-9.25-9.25-9.25S2.75 7.4 2.75 12.5c0 2.43.93 4.72 2.63 6.46.29.3.28.77-.01 1.06-.3.29-.77.28-1.06-.01a10.709 10.709 0 0 1-3.06-7.51C1.25 6.57 6.07 1.75 12 1.75S22.75 6.57 22.75 12.5c0 2.83-1.09 5.51-3.08 7.53-.14.15-.34.22-.53.22Z"
							fill="currentColor"
						></path>
						<path
							d="M12 21.998a3.88 3.88 0 1 0 0-7.76 3.88 3.88 0 0 0 0 7.76ZM16 8.5c-1.1 0-2 .9-2 2v.75c0 .69.56 1.25 1.25 1.25H16c1.1 0 2-.9 2-2s-.9-2-2-2Z"
							fill="currentColor"
						></path>
					</svg>
				</ControlIcon>
			</FocusLeaf>
		</div>
		// </FocusContext.Provider>
	);
}
