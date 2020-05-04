"use strict";

const LOG = require("./logger");
const FB = require("./facebook");
const CONFIG = require("../config");

/**
 * Share a Video to groups which are belong to the user
 * @param  {[type]} account [description]
 * @param  {[type]} post    [description]
 * @param  {[type]} groups  [description]
 * @return {[type]}         [description]
 */
const runShareVideoToGroups = (account, post, groups) => {
	return new Promise(async (rs, rj) => {
		try {
			const { email, password, proxy, secret_2fa } = account;

			const { page, browser } = await FB.init(proxy);

			FB.loadCookies(page, email);

			await page.waitFor(CONFIG.DELAY);

			await page.goto(CONFIG.LOGIN.URL, {
				timeout: 0,
				waitUntil: "networkidle0",
			});

			await page.waitFor(CONFIG.DELAY);

			let statusLogin = await FB.isLogin(page);

			if (!statusLogin) {
				await FB.signIn(page, email, password, secret_2fa);
			}

			await FB.shareToGroups(page, post, groups, account);

			await FB.destroy({ page, browser });

			rs("I'm finish your task.");
		} catch (e) {
			LOG.error(e);
			rj(e);
		}
	});
};

module.exports = {
	runShareVideoToGroups,
};
