const fs = require("fs-extra");
const sassPlugin = require("esbuild-plugin-sass");
const esbuild = require("esbuild");
const ejs = require("ejs");
let Walk = require("walkdir");
const path = require("path");
(async () => {
	let config = {};

	esbuild.build({
		entryPoints: [path.join(__dirname, "./js/index.js")],
		outdir: "./bundle",
		plugins: [sassPlugin()],
		bundle: true,
		allowOverwrite: true,
		globalName: "handy",
		define: {
			global: "window",
		},
		sourcemap: true,
		treeShaking: true,
		minify: true,
		write: true,
	});
	let paths = Walk.sync("./pages", {
		return_object: true,
	});

	// .map((p) => {
	// return path.relative(path.join(__dirname, "pages"), p);
	// });
	for (const file in paths) {
		// if (Object.hasOwnProperty.call(paths, file)) {
		const element = paths[file];

		if (
			element.isFile() &&
			!file.startsWith(path.join(__dirname, "pages", "components"))
		) {
			let relP = path.relative(path.join(__dirname, "pages"), file);
			let buildedName;
			let pgName = path.basename(relP).slice(0, -4);
			if (pgName != "index") {
				buildedName = path.join(
					__dirname,
					"bundle",
					path.relative(path.join(__dirname, "pages"), path.dirname(file)),
					pgName,
					"index.html"
				);
			} else {
				buildedName = path.join(
					__dirname,
					"bundle",
					path.relative(path.join(__dirname, "pages"), path.dirname(file)),
					pgName + ".html"
				);
			}
			if (!fs.existsSync(path.dirname(buildedName))) {
				fs.mkdirSync(path.dirname(buildedName), { recursive: true });
			}
			fs.writeFileSync(buildedName, await ejs.renderFile(file, config));
		}
		fs.copySync("./static", "./bundle");

		// }
	}
})();
