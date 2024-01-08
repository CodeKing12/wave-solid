import Home from "./Home";
import { MediaProvider } from "./MediaContext";
import "./css/App.css";
import { AlertProvider } from "./AlertContext";
import Alerts from "./components/Utilities/Alerts";
import { init } from "./spatial-nav";
import scrollPolyfill from "scroll-polyfill";
import SettingsProvider from "./SettingsContext";
import LoadingIndicator from "./components/LoadingIndicator";
import LoaderProvider from "./LoaderContext";
import { onMount } from "solid-js";

export default function App() {
	scrollPolyfill();

	init({
		// debug: true,
		// visualDebug: true,
		// options
	});

	onMount(() => {
		function successCallback() {
			console.log(
				"The requested user agent string has been set successfully.",
			);
		}

		if ("tizen" in window) {
			console.log("Setting User Agent");
			tizen.websetting.setUserAgentString("Kodi/20.2", successCallback);
		}
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
