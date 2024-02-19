/* @refresh reload */
import { render } from "solid-js/web";
import { TransProvider } from '@mbarzda/solid-i18next';
import i18next from 'i18next';
// import "solid-devtools";

import "./css/index.css";
import App from "./App";

const root = document.getElementById("root");

function renderApp() {
  render(
    () => (
      <TransProvider i18n={i18next}>
        <App />
      </TransProvider>
    ),
    root
  );
}

if ("tizen" in window) {
  tizen.websetting.setUserAgentString("Kodi/20.2", renderApp);
} else {
  renderApp();
}
