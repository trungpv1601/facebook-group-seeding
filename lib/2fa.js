'use strict';

const unirest = require('unirest');
const CONFIG = require('../config');

const getCode = async (secret) => {
	return new Promise((resolve, reject) => {
		unirest
			.get(CONFIG.API_2FA + '?secret=' + secret)
			.then((response) => {
				try {
					const body = JSON.parse(response.body);
					if (!body.success) {
						reject('Something went wrong with 2FA API.');
					}
					resolve(body.data.code);
				} catch (error) {
					reject('Something went wrong with 2FA API.');
				}
			})
			.catch((err) => {
				reject(err);
			});
	});
};

module.exports = { getCode };
