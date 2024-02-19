import { createEffect, onCleanup } from "solid-js";
import { createSignal, Show } from "solid-js";
import { IconX } from "@tabler/icons-solidjs";
import { FocusContext, useFocusable } from "@/spatial-nav";
import FocusLeaf from "./Utilities/FocusLeaf";
import FormSwitch from "./Switch";
import { AppSettings, useSettings } from "@/SettingsContext";
import { Trans } from '@mbarzda/solid-i18next';
import { useTransContext } from '@mbarzda/solid-i18next';
import { useTranslation } from '@mbarzda/solid-i18next';
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

function CustomColorPicker() {
    const { getSetting, updateSetting } = useSettings();
    const colors = ["#ff0000", "#00ff00", "#0000ff", "#ff00ff", "#00ffff", "#ffff00", "#000000", "#ffffff", "#880000", "#008800"];
    const selectedColor = () => getSetting('subtitle_color').toString();
    const [focusedColor, setFocusedColor] = createSignal(colors[0]);

    function handleColorSelect(color) {
        updateSetting('subtitle_color', color);
    }

    return (
        <div class="color-picker">
            {colors.map((color, index) => (
                <FocusLeaf key={color} customFocusKey={`COLOR-${index}`} onFocus={() => setFocusedColor(color)} onEnterPress={() => handleColorSelect(color)}>
                    <div
                        class="color-option"
                        style={{ background: color }}
                        classList={{ "selected": color === selectedColor(), "focused": color === focusedColor() }}
                    ></div>
                </FocusLeaf>
            ))}
        </div>
    );
}


function LanguageSetting() {
    const [, { changeLanguage }] = useTransContext();
    const { getSetting, updateSetting } = useSettings();
    const { setRef, focused } = useFocusable({
        onEnterPress: handleChangeLanguage,
    });

    const currentLanguageCode = () => getSetting("language") || "en";
    const languages = {
        en: "English",
        cs: "Čeština",
        sk: "Slovenčina"
    };

    function handleChangeLanguage() {
        const languageKeys = Object.keys(languages);
        const currentIndex = languageKeys.indexOf(currentLanguageCode());
        const nextIndex = (currentIndex + 1) % languageKeys.length;
        const nextLanguage = languageKeys[nextIndex];

        updateSetting("language", nextLanguage);
        changeLanguage(nextLanguage.toLowerCase());
    }

    const currentLanguageName = () => languages[currentLanguageCode()];

    return (
        <FocusLeaf focusedStyles="focused-setting" onEnterPress={handleChangeLanguage}>
            <div class="flex items-center space-x-32" ref={setRef}>
                <h4 class="text-xl decoration-white underline-offset-8 duration-300 ease-in-out"
                    classList={{
                        "underline text-yellow-300 font-semibold": focused(),
                    }}>
                    <Trans key="language_label" /> {currentLanguageName()}
                </h4>
            </div>
        </FocusLeaf>
    );
}


function SpeedTest() {
    const [downloadSpeed, setDownloadSpeed] = createSignal(null);
    const [testing, setTesting] = createSignal(false);
    const [currentUrl, setCurrentUrl] = createSignal("");
    const { setRef, focused } = useFocusable({ 
        trackChildren: true,
        onEnterPress: measureDownloadSpeed
    });
    const testServers = [
        'http://vip.1.dl.wsfiles.cz/test.soubor',
        'http://vip.2.dl.wsfiles.cz/test.soubor',
        'http://vip.3.dl.wsfiles.cz/test.soubor',
        'http://vip.4.dl.wsfiles.cz/test.soubor',
        'http://vip.5.dl.wsfiles.cz/test.soubor',
        'http://vip.6.dl.wsfiles.cz/test.soubor',
        'http://vip.7.dl.wsfiles.cz/test.soubor',
        'http://vip.16.dl.wsfiles.cz/test.soubor',
        'http://vip.17.dl.wsfiles.cz/test.soubor'
    ];

async function measureDownloadSpeed() {
    if (testing()) return;

    try {
        setTesting(true);
        const urlIndex = Math.floor(Math.random() * testServers.length);
        const url = testServers[urlIndex];
        setCurrentUrl(`vip.${urlIndex + 1}.dl.wsfiles.cz`);

        const maxTestDuration = 20000;
        const initialRangeSize = 100000000;
        let rangeSize = initialRangeSize;

        const startTime = new Date().getTime();
        let endTime;

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), maxTestDuration);

        try {
            const response = await fetch(url, {
                headers: { 'Range': `bytes=0-${rangeSize - 1}` },
                signal: controller.signal
            });
            const data = await response.arrayBuffer();
            endTime = new Date().getTime();
        } catch (error) {
            if (error.name === 'AbortError') {
                endTime = new Date().getTime();
                const elapsedTime = endTime - startTime;
                const elapsedSeconds = elapsedTime / 1000;
                rangeSize = initialRangeSize * (elapsedSeconds / (maxTestDuration / 1000));
            } else {
                throw error;
            }
        } finally {
            clearTimeout(timeoutId);
        }

        const durationInSeconds = (endTime - startTime) / 1000;
        const bitsLoaded = rangeSize * 8;
        const speedMbps = ((bitsLoaded / durationInSeconds) / (1024 * 1024)).toFixed(2);

        setDownloadSpeed(`${speedMbps} Mbps`);
    } catch (error) {
        console.error('Error when measuring download speed:', error);
    } finally {
        setTesting(false);
    }
}

    return (
        <div class="speed-test">
            <FocusLeaf focusedStyles="focused-button" onEnterPress={measureDownloadSpeed}>
                <button
                    ref={setRef}
                    class="speed-test-button text-lg decoration-clone decoration-white decoration-4 underline-offset-8 duration-300 ease-in-out"
                    classList={{ 
                        "focused-button": focused(),
                        "underline": focused(),
                        "text-yellow-300 font-semibold": focused()
                    }}
                    onClick={measureDownloadSpeed}
                    disabled={testing()}
                >
                    <Trans key="speed_test_button" />
                </button>
            </FocusLeaf>
            <Show when={testing()}>
                <p><Trans key="measuring" /></p>
            </Show>
            <Show when={downloadSpeed()}>
                <p><Trans key="download_speed" /> {downloadSpeed()} (<Trans key="server" /> {currentUrl()})</p>
            </Show>
        </div>
    );
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
            >
                <div
                    class="invisible z-20 w-[650px] max-w-full translate-y-10 rounded-2xl bg-[#191919] px-8 pb-10 pt-10 text-white opacity-0 duration-[400ms] ease-in-out"
                    classList={{
                        "!visible !translate-y-0 !opacity-100": props.show,
                    }}
                >
                    <div class="mb-8 flex items-center justify-between">
                        <h3 class="text-3xl font-semibold text-gray-50">
                            <Trans key="settings_title" />
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
									title={<Trans key="restrict_content_label" />}
									id="restrict_content"
								/>
								<SpeedTest />
								
								<SliderSetting
									title={<Trans key="sub_size" />}
									id="subtitle_size"
								/>

                                <div class="color-picker-label">
                                    <Trans key="sub_color" />
                                </div>

                                <CustomColorPicker />
								<LanguageSetting />
							</div>
						</div>
					</div>
				</div>
				<div class="absolute inset-0 z-10 h-full w-full bg-black bg-opacity-80"></div>
			</div>
		</FocusContext.Provider>
	);
}
