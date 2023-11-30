import Home from "./Home";
import { MediaProvider } from "./MediaContext";
import "./css/App.css";
import { AlertProvider } from "./AlertContext";
import Alerts from "./components/Utilities/Alerts";
import { init } from "./spatial-nav";
import scrollPolyfill from "scroll-polyfill";

export default function App() {
	scrollPolyfill();

	init({
		// debug: true,
		// visualDebug: true,
		// options
	});

	return (
		<AlertProvider>
			<MediaProvider>
				<Home />
			</MediaProvider>
			<Alerts />
		</AlertProvider>
	);
}
