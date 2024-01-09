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

export default function App() {
	scrollPolyfill();

	init({
		// debug: true,
		// visualDebug: true,
		// options
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
