import { createEffect, onCleanup } from "solid-js";
import { IconX } from "@tabler/icons-solidjs";
import { FocusContext, useFocusable } from "@/spatial-nav";
import FocusLeaf from "./Utilities/FocusLeaf";
import FormSwitch from "./Switch";
import { AppSettings, useSettings } from "@/SettingsContext";

interface SettingsProps {
	show: boolean;
	onClose: () => void;
}

interface SwitchSettingProps {
	title: string;
	id: keyof AppSettings;
}

function SwitchSetting(props: SwitchSettingProps) {
	const { getSetting, updateSetting } = useSettings();
	const currentValue = () => getSetting(props.id);

	function changeSetting() {
		updateSetting(props.id, !currentValue());
	}

	return (
		<div class="flex items-center space-x-32">
			<h4 class="text-lg">{props.title}</h4>
			<h4>
				<FormSwitch value={currentValue()} onSwitch={changeSetting} />
			</h4>
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
							<div class="flex flex-col space-y-4">
								<SwitchSetting
									title="Restrict Explicit Content"
									id="restrict_content"
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
