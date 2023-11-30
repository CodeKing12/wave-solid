import { defineConfig } from "vite";
import solid from "vite-plugin-solid";
import legacy from "@vitejs/plugin-legacy";
// import "core-js/modules/es.global-this.js.js"

export default defineConfig({
	build: {
		// target: "es2015",
		// rollupOptions: {
		// 	external: ["core-js/modules/web.queue-microtask.js"],
		// },
	},
	plugins: [
		legacy({
			targets: ["ie 11"], // expected compatible browser target range
			additionalLegacyPolyfills: [
				"core-js/modules/es.global-this.js",
				"core-js/modules/web.queue-microtask.js",
				"regenerator-runtime/runtime",
			],
			modernPolyfills: ["web.queue-microtask"], // no need to generate polyfills block for modern browsers (default false)
			renderLegacyChunks: true, // need to generate legacy browser compatible chunks (default true)
		}),
		// devtools({
		// 	/* features options - all disabled by default */
		// 	autoname: true, // e.g. enable autoname
		// }),
		solid(),
	],
	base: "./",
	resolve: {
		alias: {
			"@": "/src",
		},
	},
});
