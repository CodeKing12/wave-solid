/* @refresh reload */
import { render } from "solid-js/web";
// import "solid-devtools";

import "./css/index.css";
import App from "./App";

const root = document.getElementById("root");

function successCallback() {
	console.log("The requested user agent string has been set successfully.");
	render(() => <App />, root!);
}

if ("tizen" in window) {
	tizen.websetting.setUserAgentString("Kodi/20.2", successCallback);
} else {
	render(() => <App />, root!);
}
