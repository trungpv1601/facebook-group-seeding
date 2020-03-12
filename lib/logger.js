'use strict';

const pino = require('pino');

pino.level = process.env.LOG_LEVEL || 'debug';

const logger = pino({
	prettyPrint: {
		levelFirst: true
	},
	prettifier: require('pino-pretty')
});

module.exports = logger;
