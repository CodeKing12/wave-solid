import { TablerIconsProps } from "@tabler/icons-solidjs";
import { JSXElement, Show } from "solid-js";

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
				class="slider-progress pointer-events-none absolute top-1/2 block h-[5px] -translate-y-1/2 rounded-md border-black bg-[#F5F5F5] shadow-[1px_1px_1px_0px_rgba(10,10,10,0.04)]"
				style={{ width: progressWidth() + "%" }}
			></div>
		</div>
	);
}
