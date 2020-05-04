"use strict";

const pino = require("pino");
const childProcess = require("child_process");
const stream = require("stream");

const logThrough = new stream.PassThrough();

const logger = pino({}, logThrough);

const cwd = process.cwd();
const { env } = process;
const logPath = `${cwd}/logs`;

const child = childProcess.spawn(
	process.execPath,
	[
		require.resolve("pino-tee"),
		"info",
		`${logPath}/info.log`,
		"warn",
		`${logPath}/warn.log`,
		"error",
		`${logPath}/error.log`,
		"fatal",
		`${logPath}/fatal.log`,
	],
	{ cwd, env }
);

logThrough.pipe(child.stdin);
logThrough.pipe(process.stdout);

module.exports = logger;
