const fs = require('fs');
const csv = require('csv-parser');
const LOG = require('./logger');
const CONFIG = require('../config');

const accounts = async (path = CONFIG.CSV_ACCOUNTS_PATH) => {
	return new Promise((resolve, reject) => {
		try {
			const isAccountsFile = fs.existsSync(path);
			if (isAccountsFile) {
				const accounts = [];
				fs.createReadStream(path)
					.pipe(csv())
					.on('data', data => accounts.push(data))
					.on('end', () => {
						resolve(accounts);
					});
			} else {
				LOG.error('The file path is not exists.');
				resolve([]);
			}
		} catch (error) {
			LOG.error(error);
			resolve([]);
		}
	});
};

const groups = async (path = CONFIG.CSV_GROUPS_PATH) => {
	return new Promise((resolve, reject) => {
		try {
			const isFile = fs.existsSync(path);
			if (isFile) {
				const groups = [];
				fs.createReadStream(path)
					.pipe(csv())
					.on('data', data => groups.push(data))
					.on('end', () => {
						resolve(groups);
					});
			} else {
				LOG.error('The file path is not exists.');
				resolve([]);
			}
		} catch (error) {
			LOG.error(error);
			resolve([]);
		}
	});
};

const posts = async (path = CONFIG.CSV_POSTS_PATH) => {
	return new Promise((resolve, reject) => {
		try {
			const isFile = fs.existsSync(path);
			if (isFile) {
				const posts = [];
				fs.createReadStream(path)
					.pipe(csv())
					.on('data', data => posts.push(data))
					.on('end', () => {
						resolve(posts);
					});
			} else {
				LOG.error('The file path is not exists.');
				resolve([]);
			}
		} catch (error) {
			LOG.error(error);
			resolve([]);
		}
	});
};

module.exports = { accounts, groups, posts };
