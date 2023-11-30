/* @refresh reload */
import { render } from "solid-js/web";
// import "solid-devtools";

import "./css/index.css";
import App from "./App";

const root = document.getElementById("root");

render(() => <App />, root!);
