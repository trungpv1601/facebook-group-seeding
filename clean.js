"use strict";

const fs = require("fs");

const folders = ["logs", "screenshots"];
const exts = ["log", "jpg"];

// Get Logs Folder
const cwd = process.cwd();
const { env } = process;

for (let i = folders.length - 1; i >= 0; i--) {
	let folder = folders[i];
	const path = `${cwd}/${folder}`;
	console.log(`Cleaning ${path} \n`);

	let dirCont = fs.readdirSync(path);
	let files = dirCont.filter(function(elm) {
		let regex = new RegExp(`.*\.(${exts[i]})`, "gi");
		return elm.match(regex);
	});

	for (let i = files.length - 1; i >= 0; i--) {
		let file = files[i];
		fs.unlinkSync(`${path}/${file}`);
	}
}

console.log("Done ;) \n");
