import Home from "./Home";
import { MediaProvider } from "./MediaContext";
import "./App.css";
import { AlertProvider } from "./AlertContext";
import Alerts from "./components/Alerts";
import { init } from "./spatial-nav";

export default function App() {
	init({
		debug: true,
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
