"use strict";

const unirest = require("unirest");
const CONFIG = require("../config");
const LOG = require("./logger");

const getCode = async (secret) => {
	return new Promise((resolve, reject) => {
		unirest
			.get(CONFIG.API_2FA + "?secret=" + secret)
			.then((response) => {
				try {
					const body = JSON.parse(response.body);
					if (!body.success) {
						LOG.error("Something went wrong with 2FA API.");
						reject("Something went wrong with 2FA API.");
					}
					resolve(body.data.code);
				} catch (error) {
					LOG.error(error);
					reject("Something went wrong with 2FA API.");
				}
			})
			.catch((err) => {
				LOG.error(err);
				reject(err);
			});
	});
};

module.exports = { getCode };
