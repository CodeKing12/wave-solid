export default {
	plugins: {
		tailwindcss: {},
		autoprefixer: {},
		"postcss-preset-env": {
			browsers: "ie 11", // configure a compatible browser version
			autoprefixer: {
				flexbox: "no-2009",
				grid: "no-autoplace",
			},
		},
		// oldie: {},
	},
};
