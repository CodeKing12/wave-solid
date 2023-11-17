import {
	IconBadgeCc,
	IconLanguage,
	TablerIconsProps,
} from "@tabler/icons-solidjs";
import { Accessor, For, Index, JSXElement, Setter, Show } from "solid-js";

interface ControlIconProps {
	icon?: (props: TablerIconsProps) => JSXElement;
	onclick?: () => void;
	disabled?: boolean;
	children?: JSXElement;
}

interface RangeSliderProps {
	min: number;
	max: number;
	value: number;
	show?: boolean;
	class?: string;
	onSlide: (value: number) => void;
}

interface SelectSpeedProps {
	current: number;
	show: boolean;
	onClick: (speed: number) => void;
}

interface AvailableSubtitlesProps {
	current: any;
	show: boolean;
	subtitles: any[];
	onClick: (index?: number) => void;
}

interface AvailableAudioProps {
	current: any;
	show: boolean;
	audioTracks: any[];
	onClick: (index: number) => void;
}

interface ChangeSubtitlesProps {
	currentSubtitle: any;
	allSubtitles: any[];
	onSelect: (index?: number) => void;
	menuOpen: boolean;
	setMenuOpen: Setter<boolean>;
}

interface ChangeAudioTrackProps {
	currentAudioTrack: any;
	allAudioTracks: any[];
	onSelect: (index: number) => void;
	menuOpen: boolean;
	setMenuOpen: Setter<boolean>;
}

interface ChangeSpeedProps {
	menuOpen: boolean;
	setMenuOpen: Setter<boolean>;
	currentSpeed: number;
	updateSpeed: (newSpeed: number) => void;
}

export function ControlIcon(props: ControlIconProps) {
	return (
		<button
			class="flex h-16 w-16 items-center justify-center rounded-full bg-white bg-opacity-0 duration-300 ease-linear hover:bg-opacity-20 disabled:pointer-events-none disabled:cursor-default disabled:opacity-60"
			disabled={props.disabled}
			onclick={props.onclick}
		>
			<Show when={props.icon}>
				{/* 
                    // @ts-ignore */}
				<props.icon size={36} />
			</Show>
			{props.children}
		</button>
	);
}

export function RangeSlider(props: RangeSliderProps) {
	// const [value, setValue] = createSignal(50);

	const handleSliderChange = (event: InputEvent) => {
		// @ts-ignore
		const newValue = parseInt(event.target.value, 10);
		// setValue(newValue);
		props.onSlide(newValue);
	};

	const progressWidth = () => {
		return (props.value / props.max) * 100;
	};

	return (
		<div
			class="range-parent relative w-full duration-300 ease-in-out"
			classList={{
				"out-of-sight !w-0 !opacity-0 !invisible": props.show,
				[props.class ?? ""]: (props.class?.length ?? 0) > 0,
			}}
		>
			<input
				class={`range-slider cursor-grab`}
				type="range"
				min={props.min}
				max={props.max}
				// step="10"
				value={props.value}
				onInput={handleSliderChange}
			/>
			<div
				class="pointer-events-none absolute top-1/2 block h-[5px] -translate-y-1/2 rounded-md border-black bg-[#F5F5F5] shadow-[1px_1px_1px_0px_rgba(10,10,10,0.04)]"
				style={{ width: progressWidth() + "%" }}
			></div>
		</div>
	);
}

function AvailableAudioTracks(props: AvailableAudioProps) {
	return (
		// -translate-y- must be higher than the height of the timeline component for proper visibility
		<div
			class="absolute bottom-full right-0 flex -translate-y-12 flex-col gap-1 rounded-md bg-neutral-950 bg-opacity-90 py-3 backdrop-blur-sm duration-[400ms] ease-in-out"
			classList={{
				"!opacity-0 !invisible !-translate-y-24": !props.show,
			}}
		>
			<For each={props.audioTracks}>
				{(audio: any) => (
					<button
						class="flex w-60 items-center gap-3 bg-white bg-opacity-0 px-6 py-3 text-left text-[17px] font-medium uppercase duration-300 ease-in-out hover:bg-opacity-10"
						onclick={() => props.onClick(audio.index)}
					>
						<span
							class="block h-5 w-5 rounded-full border-2 border-white duration-150 ease-linear"
							classList={{
								"bg-white":
									audio.index === props.current?.index,
							}}
						></span>
						{audio.language}
					</button>
				)}
			</For>
		</div>
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
			<ControlIcon
				icon={IconLanguage}
				disabled={props.allAudioTracks.length === 0}
				onclick={() => props.setMenuOpen(!props.menuOpen)}
			/>
		</div>
	);
}

function AvailableSubtitles(props: AvailableSubtitlesProps) {
	return (
		// -translate-y- must be higher than the height of the timeline component for proper visibility
		<div
			class="absolute bottom-full right-0 flex -translate-y-12 flex-col gap-1 rounded-md bg-neutral-950 bg-opacity-90 py-3 backdrop-blur-sm duration-[400ms] ease-in-out"
			classList={{
				"!opacity-0 !invisible !-translate-y-24": !props.show,
			}}
		>
			<button
				class="flex w-60 items-center gap-3 bg-white bg-opacity-0 px-6 py-3 text-left text-[17px] font-medium capitalize duration-300 ease-in-out hover:bg-opacity-10"
				onclick={() => props.onClick()}
			>
				<span
					class="block h-5 w-5 rounded-full border-2 border-white duration-150 ease-linear"
					classList={{
						"bg-white": !props.current,
					}}
				></span>
				off
			</button>
			<For each={props.subtitles}>
				{(subtitle: any) => (
					<button
						class="flex w-60 items-center gap-3 bg-white bg-opacity-0 px-6 py-3 text-left text-[17px] font-medium capitalize duration-300 ease-in-out hover:bg-opacity-10"
						onclick={() => props.onClick(subtitle.index)}
					>
						<span
							class="block h-5 w-5 rounded-full border-2 border-white duration-150 ease-linear"
							classList={{
								"bg-white":
									subtitle.index === props.current?.index,
							}}
						></span>
						{subtitle.language}
					</button>
				)}
			</For>
		</div>
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
			<ControlIcon
				disabled={props.allSubtitles.length === 0}
				icon={IconBadgeCc}
				onclick={() => props.setMenuOpen(!props.menuOpen)}
			/>
		</div>
	);
}

function SelectSpeed(props: SelectSpeedProps) {
	// For HTTP and HTTPS videos, the supported playback rate is -8x ~ 8x in AVPlay.
	const speedOptions = [-8, -4, -2, 1, 2, 4, 8];
	// const speedDisplay = ["Slowest", "Slower", "Slow", "Normal", "Fast", "Faster", "Fastest"];

	return (
		// -translate-y- must be higher than the height of the timeline component for proper visibility
		<div
			class="absolute bottom-full right-0 flex -translate-y-12 flex-col gap-1 rounded-md bg-neutral-950 bg-opacity-90 py-3 backdrop-blur-sm duration-[400ms] ease-in-out"
			classList={{
				"!opacity-0 !invisible !-translate-y-24": !props.show,
			}}
		>
			<Index each={speedOptions}>
				{(option: Accessor<number>) => (
					<button
						class="flex w-60 items-center gap-3 bg-white bg-opacity-0 px-6 py-3 text-left text-base font-medium capitalize duration-300 ease-in-out hover:bg-opacity-10"
						onclick={() => props.onClick(option())}
					>
						<span
							class="block h-5 w-5 rounded-full border-2 border-white duration-150 ease-linear"
							classList={{
								"bg-white": option() === props.current,
							}}
						></span>
						<p>
							<Show when={option() !== 1} fallback={"Normal"}>
								<span class="ml-1 text-base">
									{1 / Math.abs(option())}
								</span>
							</Show>
						</p>
					</button>
				)}
			</Index>
		</div>
	);
}

export function ChangeSpeed(props: ChangeSpeedProps) {
	return (
		<div
			class="relative"
			tabIndex="-1"
			onBlur={() => console.log("Close Speed Menu Now")}
		>
			<SelectSpeed
				current={props.currentSpeed}
				show={props.menuOpen}
				onClick={props.updateSpeed}
			/>
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
						fill="#f5f5f5"
					></path>
					<path
						d="M12 21.998a3.88 3.88 0 1 0 0-7.76 3.88 3.88 0 0 0 0 7.76ZM16 8.5c-1.1 0-2 .9-2 2v.75c0 .69.56 1.25 1.25 1.25H16c1.1 0 2-.9 2-2s-.9-2-2-2Z"
						fill="#f5f5f5"
					></path>
				</svg>
			</ControlIcon>
		</div>
	);
}
