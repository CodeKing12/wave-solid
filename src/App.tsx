import Home from "./Home";
import { onMount } from "solid-js";
import { MediaProvider } from "./MediaContext";
import "./css/App.css";
import { AlertProvider } from "./AlertContext";
import Alerts from "./components/Utilities/Alerts";
import { init } from "./spatial-nav";
import scrollPolyfill from "scroll-polyfill";
import SettingsProvider from "./SettingsContext";
import LoadingIndicator from "./components/LoadingIndicator";
import LoaderProvider from "./LoaderContext";
import i18next from 'i18next';

import enTranslations from './locales/en.json';
import csTranslations from './locales/cs.json';
import skTranslations from './locales/sk.json';

export default function App() {
	scrollPolyfill();

	init({
		// debug: true,
		// visualDebug: true,
		// options
	});
    onMount(async () => {
        const savedSettings = JSON.parse(localStorage.getItem("settings") || '{}');
        const savedLanguage = savedSettings.language || 'en';

        await i18next.init({
            resources: {
                en: { translation: enTranslations },
                cs: { translation: csTranslations },
                sk: { translation: skTranslations }
            },
            lng: savedLanguage,
            fallbackLng: 'en',
        });

        console.log("i18next initialized with language:", savedLanguage);
    });
	return (
		<SettingsProvider>
			<AlertProvider>
				<LoaderProvider>
					<MediaProvider>
						<LoadingIndicator />
						<Home />
					</MediaProvider>
				</LoaderProvider>
				<Alerts />
			</AlertProvider>
		</SettingsProvider>
	);
}
