import { createEffect, onCleanup } from "solid-js";
import { IconX } from "@tabler/icons-solidjs";
import { FocusContext, useFocusable } from "@/spatial-nav";
import FocusLeaf from "./Utilities/FocusLeaf";
import FormSwitch from "./Switch";
import { AppSettings, useSettings } from "@/SettingsContext";
import { DefaultColorPicker } from "@thednp/solid-color-picker";

import "@thednp/solid-color-picker/style.css";

interface SettingsProps {
	show: boolean;
	onClose: () => void;
}

interface SwitchSettingProps {
	title: string;
	id: keyof AppSettings;
}

interface SliderSettingProps {
	title: string;
	id: keyof AppSettings;
}

function SwitchSetting(props: SwitchSettingProps) {
	const { getSetting, updateSetting } = useSettings();
	const currentValue = () => getSetting(props.id);
	const { setRef, focused } = useFocusable({
		onEnterPress: changeSetting,
	});

	function changeSetting() {
		updateSetting(props.id, !currentValue());
	}

	return (
		<div class="flex items-center space-x-32" ref={setRef}>
			<h4
				class="decoration-clone text-lg decoration-white decoration-4 underline-offset-8 duration-300 ease-in-out"
				classList={{
					"underline text-yellow-300 font-semibold": focused(),
				}}
			>
				{props.title}
			</h4>
			<h4>
				<FormSwitch value={currentValue()} onSwitch={changeSetting} />
			</h4>
		</div>
	);
}

function SliderSetting(props: SliderSettingProps) {
	const { getSetting, updateSetting } = useSettings();
	const currentValue = () => parseInt(getSetting(props.id));
	const { setRef, focused } = useFocusable({
		onArrowPress: handleIncrement,
	});

	function changeSetting(
		event: Event | null,
		increment: false | "decrease" | "increase" = false,
	) {
		let newValue = currentValue();

		if (increment === "increase") {
			newValue += 1;
		} else if (increment === "decrease") {
			newValue -= 1;
		}

		if (event) {
			newValue = parseInt(event.target?.value);
		}

		if (newValue > 500) {
			newValue = 500;
		}

		if (newValue) {
			updateSetting(props.id, newValue);
		}
	}

	function handleIncrement(direction: string) {
		if (direction === "left") {
			changeSetting(null, "decrease");
			return false;
		} else if (direction === "right") {
			changeSetting(null, "increase");
			return false;
		}

		return true;
	}

	return (
		<div class="flex items-center space-x-32" ref={setRef}>
			<h4
				class="w-full flex-1 decoration-clone text-lg decoration-white decoration-4 underline-offset-8 duration-300 ease-in-out"
				classList={{
					"underline text-yellow-300 font-semibold": focused(),
				}}
			>
				{props.title}
			</h4>
			<div class="w-2/5">
				{/* Create a number input with step buttons */}
				<div class="flex items-center gap-6">
					{/* <FocusLeaf
						class="h-12 p-2 text-yellow-300"
						focusedStyles="bg-yellow-300 text-black"
					>
						<button>
							<IconMinus size={32} />
						</button>
					</FocusLeaf> */}
					{/* You won't be able to use keyboard controls in the number
					input because of the spatial navigation */}
					<input
						class="remove-step h-12 w-16 border-none bg-black bg-opacity-20 text-center text-xl font-semibold !outline-none"
						type="number"
						value={currentValue()}
						onInput={changeSetting}
						max={500}
					/>
					{/* <FocusLeaf
						class="h-12 p-2 text-yellow-300"
						focusedStyles="bg-yellow-300 text-black"
					>
						<button>
							<IconPlus size={32} class="" />
						</button>
					</FocusLeaf> */}
				</div>
			</div>
		</div>
	);
}

function ColorSetting(props: SliderSettingProps) {
	const { getSetting, updateSetting } = useSettings();
	const currentValue = () => getSetting(props.id).toString();
	const { setRef, focused } = useFocusable({
		onEnterPress: handleEnter,
	});
	let colorInput: HTMLButtonElement | undefined;

	function handleEnter() {
		if (!colorInput) {
			colorInput = document.querySelector(
				`#${props.id} button.picker-toggle`,
			) as HTMLButtonElement;
		}

		if (colorInput.getAttribute("aria-expanded") === "false") {
			colorInput?.click();
		}
	}

	function changeSetting(color: string) {
		if (color !== currentValue()) {
			updateSetting(props.id, color);
		}
	}

	return (
		<div class="flex items-center space-x-32" ref={setRef}>
			<h4
				class="decoration-clone text-lg decoration-white decoration-4 underline-offset-8 duration-300 ease-in-out"
				classList={{
					"underline text-yellow-300 font-semibold": focused(),
				}}
			>
				{props.title}
			</h4>
			<div class="w-2/5" id={props.id}>
				<DefaultColorPicker
					value={currentValue()}
					onChange={changeSetting}
				/>
			</div>
		</div>
	);
}

export default function Settings(props: SettingsProps) {
	// console.log("Login is Re-rendering")

	function handleLoginEscape(event: KeyboardEvent) {
		if (event.code === "Escape" || event.keyCode === 27) {
			props.onClose();
		}
	}

	createEffect(() => {
		document.addEventListener("keydown", handleLoginEscape);
	});

	onCleanup(() => {
		document.removeEventListener("keydown", handleLoginEscape);
	});

	const { setRef, focusSelf, focusKey } = useFocusable({
		get focusable() {
			return props.show;
		},
		trackChildren: true,
		autoRestoreFocus: true,
		get isFocusBoundary() {
			return props.show;
		},
		preferredChildFocusKey: "SETTINGS_QUIT_BUTTON",
	});

	createEffect(() => {
		if (props.show) {
			focusSelf();
		}
	});

	return (
		<FocusContext.Provider value={focusKey()}>
			<div
				class="login-modal invisible fixed bottom-0 top-0 z-0 flex h-full w-full items-center justify-center opacity-0 duration-300 ease-linear"
				classList={{
					"!visible !z-[110] !opacity-100": props.show,
				}}
				ref={setRef}
			>
				<div
					class="invisible z-20 w-[650px] max-w-full translate-y-10 rounded-2xl bg-[#191919] px-8 pb-10 pt-10 text-white opacity-0 duration-[400ms] ease-in-out"
					classList={{
						"!visible !translate-y-0 !opacity-100": props.show,
					}}
				>
					<div class="mb-8 flex items-center justify-between">
						<h3 class="text-3xl font-semibold text-gray-50">
							Settings
						</h3>
						<FocusLeaf
							focusedStyles="on-svg-focus"
							onEnterPress={props.onClose}
							customFocusKey="SETTINGS_QUIT_BUTTON"
						>
							<button
								class="cursor-pointer text-white hover:text-yellow-300"
								onClick={props.onClose}
							>
								<IconX
									class="duration-300 ease-in-out"
									size={35}
								/>
							</button>
						</FocusLeaf>
					</div>
					<div class="relative">
						<div
							class="duration-300 ease-in-out"
							classList={{
								"visible opacity-100": props.show,
							}}
						>
							<div class="flex flex-col space-y-8">
								<SwitchSetting
									title="Restrict Explicit Content"
									id="restrict_content"
								/>

								<SliderSetting
									title="Adjust Subtitle Size"
									id="subtitle_size"
								/>

								<ColorSetting
									title="Change Subtitle Color"
									id="subtitle_color"
								/>
							</div>
						</div>
					</div>
				</div>
				<div class="absolute inset-0 z-10 h-full w-full bg-black bg-opacity-80"></div>
			</div>
		</FocusContext.Provider>
	);
}
