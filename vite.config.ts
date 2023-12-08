import { defineConfig } from "vite";
import solid from "vite-plugin-solid";

export default defineConfig({
	build: {
		// target: "es2015",
		// rollupOptions: {
		// 	external: ["core-js/modules/web.queue-microtask.js"],
		// },
	},
	plugins: [solid()],
	base: "./",
	resolve: {
		alias: {
			"@": "/src",
		},
	},
});
