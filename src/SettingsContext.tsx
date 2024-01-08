import { createContext, createSignal, onMount, useContext } from "solid-js";

interface SettingsProviderObj {
	updateSetting: (property: keyof AppSettings, newValue: any) => void;
	getSetting: (
		property: keyof AppSettings | "all",
	) => boolean | string | number | AppSettings;
}

const defaultContextValue: SettingsProviderObj = {
	updateSetting: () => {},
	getSetting: () => "",
};

export interface AppSettings {
	restrict_content: boolean | "thorough";
	store_credentials: boolean;
	trakt_token: string;
}

const defaultSettings: AppSettings = {
	restrict_content: true,
	store_credentials: true,
	trakt_token: "",
};

type IsKeyOf<T, K extends keyof T> = K;

const SettingsContext = createContext<SettingsProviderObj>(defaultContextValue);

export default function SettingsProvider(props: any) {
	const [settings, setSettings] = createSignal<AppSettings>(defaultSettings);

	onMount(() => {
		const currentSettings = localStorage.getItem("settings");
		if (currentSettings) {
			const parsedSettings = JSON.parse(currentSettings);
			setSettings(parsedSettings);
		} else {
			localStorage.setItem("settings", JSON.stringify(settings()));
		}
	});

	const providerValue: SettingsProviderObj = {
		updateSetting: (property, newValue) => {
			const isValidKey: IsKeyOf<AppSettings, typeof property> = property;
			if (settings().hasOwnProperty(property) || isValidKey) {
				console.log("Setting setting: ", property, "--", newValue);
				setSettings((prevValue) => ({
					...prevValue,
					[property]: newValue,
				}));
				localStorage.setItem("settings", JSON.stringify(settings()));
			} else {
				throw Error("You are trying to set an invalid property");
			}
		},
		getSetting: (property) => {
			if (property === "all") {
				return settings();
			}
			if (settings().hasOwnProperty(property)) {
				// console.log(property, settings()[property]);
				return settings()[property];
			} else {
				throw Error("This setting does not exist");
			}
		},
	};

	return (
		<SettingsContext.Provider value={providerValue}>
			{props.children}
		</SettingsContext.Provider>
	);
}

export function useSettings() {
	const context = useContext(SettingsContext);
	if (!context) {
		throw Error("SettingsContext must be used inside a Settings Provider");
	}
	return context;
}
