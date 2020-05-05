"use strict";

const fs = require("fs");
const csv = require("csv-parser");
const LOG = require("./logger");
const CONFIG = require("../config");

const accounts = (path = CONFIG.CSV_ACCOUNTS_PATH) => {
	return new Promise((resolve, reject) => {
		try {
			const isAccountsFile = fs.existsSync(path);
			if (isAccountsFile) {
				const accounts = [];
				fs.createReadStream(path)
					.pipe(csv())
					.on("data", (data) => accounts.push(data))
					.on("end", () => {
						resolve(accounts);
					});
			} else {
				LOG.error("The file path is not exists.");
				resolve([]);
			}
		} catch (error) {
			LOG.error(error);
			resolve([]);
		}
	});
};

const posts = (path = CONFIG.CSV_POSTS_PATH) => {
	return new Promise((resolve, reject) => {
		try {
			const isFile = fs.existsSync(path);
			if (isFile) {
				const posts = [];
				fs.createReadStream(path)
					.pipe(csv())
					.on("data", (data) => posts.push(data))
					.on("end", () => {
						resolve(posts);
					});
			} else {
				LOG.error("The file path is not exists.");
				resolve([]);
			}
		} catch (error) {
			LOG.error(error);
			resolve([]);
		}
	});
};

/**
 * [description]
 * @param  {[type]} account_id [description]
 * @return {[type]}            [description]
 */
const whereAccount = (account_id, accounts) => {
	for (let i = accounts.length - 1; i >= 0; i--) {
		if (accounts[i]["id"] === account_id) return accounts[i];
	}
	return false;
};

module.exports = { accounts, posts, whereAccount };
