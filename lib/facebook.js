"use strict";

/* eslint-disable node/no-unsupported-features/es-syntax */
const fs = require("fs");
const puppeteer = require("puppeteer");
const LOG = require("./logger");
const CONFIG = require("../config");
const _2FA = require("./2fa");

/**
 * Init browser and page
 *
 * @return { page, browser } or false
 */
const init = (proxy = false) => {
	return new Promise(async (resolve) => {
		LOG.info("[INIT_BROWSER] => ", "Init");

		let args = [
			"--mute-audio",
			"--dns-prefetch-disable",
			"--lang=en-US",
			"--no-sandbox",
			"--disable-setuid-sandbox",
		];

		if (proxy) {
			proxy = proxy.split(":");
		}

		if (proxy.length > 2) {
			args.push("--proxy-server=http://" + proxy[0] + ":" + proxy[1]);
		}

		if (!CONFIG.LOAD_MEDIA) {
			args.push("--blink-settings=imagesEnabled=false");
		}

		const browser = await puppeteer.launch({
			args: args,
			// args: ['--incognito'],
			timeout: 10000,
			headless: CONFIG.HIDE_BROWSER,
		});

		const context = browser.defaultBrowserContext();
		context.overridePermissions("https://www.facebook.com", [
			"geolocation",
			"notifications",
		]);

		const page = await browser.newPage();

		if (proxy.length === 4) {
			await page.authenticate({ username: proxy[2], password: proxy[3] });
		}

		try {
			await page.setViewport({ width: 1280, height: 640 });
			// Connect to Chrome DevTools
			// const client = await page.target().createCDPSession();

			// await client.send('Network.emulateNetworkConditions', {
			// 	offline: false,
			// 	downloadThroughput: (1.5 * 1024 * 1024) / 8,
			// 	uploadThroughput: (750 * 1024) / 8,
			// 	latency: 40
			// });
			resolve({
				browser,
				page,
			});
		} catch (e) {
			LOG.error(e);
		}
		resolve(false);
	});
};

/**
 * Sign In
 * @param {*} cookie
 */
const signIn = async (page, email, password, secret) => {
	return new Promise(async (resolve, reject) => {
		try {
			await page.goto(CONFIG.LOGIN.URL, {
				timeout: 0,
				waitUntil: "networkidle0",
			});

			// Check Login
			await page.waitFor(CONFIG.DELAY);
			await page.type(CONFIG.LOGIN.EMAIL_SELECTOR, email, { delay: 100 });

			await page.waitFor(CONFIG.DELAY);
			await page.type(CONFIG.LOGIN.PASS_SELECTOR, password, {
				delay: 100,
			});

			await page.waitFor(CONFIG.DELAY);
			await page.keyboard.press("Enter");

			await page.waitFor(CONFIG.DELAY);

			let statusLogin = await isLogin(page);
			if (statusLogin) {
				await page.waitFor(CONFIG.DELAY);
				await takeScreenshot(page, `${email}_TASK_LOGIN`);
				return resolve(true);
			} else {
				const status2FA = await is2FA(page, secret);
				if (status2FA) {
					LOG.info("[CHECK_LOGIN] => ", "Processing 2FA ...");
					if (secret !== "false") {
						await process2FA(page, secret);
						await page.waitFor(CONFIG.DELAY);
						await processCheckPoint(page);

						statusLogin = await isLogin(page);
						if (statusLogin) {
							await page.waitFor(CONFIG.DELAY);
							await takeScreenshot(page, `${email}_TASK_LOGIN`);
							return resolve(true);
						} else {
							LOG.info("[SIGN_IN] => Login Faild. Give up :(");
							await takeScreenshot(page, `${email}_TASK_LOGIN_ERROR`);
							return reject(false);
						}
					} else {
						LOG.info(
							"[SIGN_IN] => Please provice Secret 2FA for this Account."
						);
						await takeScreenshot(page, `${email}_TASK_LOGIN_ERROR`);
						return reject(
							"[SIGN_IN] => Please provice Secret 2FA for this Account."
						);
					}
				} else {
					LOG.info("[SIGN_IN] => Processing Check Points.");
					await processCheckPoint(page);
					await page.waitFor(CONFIG.DELAY);
					await takeScreenshot(page, `${email}_TASK_LOGIN`);
					return resolve(true);
				}
			}
		} catch (e) {
			LOG.error(e);
			await takeScreenshot(page, `${email}_TASK_LOGIN_ERROR`);
			return reject("[SIGN_IN] => " + e);
		}
	});
};

/**
 * Check Login
 * @param {*} page
 */
const isLogin = (page) => {
	return new Promise(async (resolve, reject) => {
		try {
			await page.waitForSelector(CONFIG.LOGIN.SUCC_SELECTOR, {
				timeout: CONFIG.DELAY,
			});
			LOG.info("[CHECK_LOGIN] => ", "Login Successful :)");
			return resolve(true);
		} catch (err) {
			LOG.info("[CHECK_LOGIN] => ", "Login Faild :(");
			return resolve(false);
		}
	});
};

/**
 * Check Two-factor authentication required
 * @param {*} page
 */
const is2FA = (page) => {
	return new Promise(async (resolve, reject) => {
		try {
			await page.waitForSelector(CONFIG._2FA.CODE_SELECTOR, {
				timeout: CONFIG.DELAY,
			});
			return resolve(true);
		} catch (err) {
			return resolve(false);
		}
	});
};

/**
 * Process 2FA
 * @param {*} cookie
 */
const process2FA = async (page, secret) => {
	return new Promise(async (resolve, reject) => {
		try {
			// Get Code
			const code = await _2FA.getCode(secret);
			LOG.info("[PROCESSING_2FA] => ", "CODE: " + code);
			await page.waitFor(CONFIG.DELAY);
			await page.type(CONFIG._2FA.CODE_SELECTOR, code, { delay: 100 });

			await page.waitFor(CONFIG.DELAY);
			await page.keyboard.press("Enter");

			await page.waitFor(CONFIG.DELAY);

			const status2FA = await is2FA(page, secret);
			if (status2FA) {
				LOG.info(
					"[SIGN_IN] => Please provice Secret 2FA for this Account."
				);
				return reject(
					"[SIGN_IN] => Please provice Secret 2FA for this Account."
				);
			}
			return resolve(true);
		} catch (e) {
			return reject("[SIGN_IN] => " + e);
		}
	});
};

/**
 * Is Check Point
 * @param {*} page
 */
const isCheckPoint = (page) => {
	return new Promise(async (resolve, reject) => {
		try {
			await page.waitForSelector(CONFIG.CHECKPOINT.SUBMIT_SELECTOR, {
				timeout: CONFIG.DELAY,
			});
			return resolve(true);
		} catch (err) {
			return resolve(false);
		}
	});
};

/**
 * Process Check Point
 * @param {*} page
 */
const processCheckPoint = (page) => {
	return new Promise(async (resolve, reject) => {
		try {
			LOG.info("[PROCESSING_CHECK_POINT] => Check Points.");
			let checkPoint = true;
			do {
				checkPoint = await isCheckPoint(page);
				if (checkPoint) {
					await page.waitForSelector(
						CONFIG.CHECKPOINT.SUBMIT_SELECTOR,
						{ timeout: CONFIG.DELAY }
					);
					let button = await page.$(
						CONFIG.CHECKPOINT.SUBMIT_SELECTOR
					);
					await button.click();
					await page.waitFor(CONFIG.DELAY);
				}
			} while (checkPoint);
			return resolve(true);
		} catch (err) {
			return reject(err);
		}
	});
};

/**
 * Is Show Dialog Share
 * @param {*} page
 */
const isDialogShare = (page) => {
	return new Promise(async (resolve, reject) => {
		try {
			await page.waitForSelector(CONFIG.SHARE_VIDEO_GROUP.DIALOG, {
				timeout: CONFIG.DELAY,
			});
			return resolve(true);
		} catch (err) {
			return resolve(false);
		}
	});
};

/**
 * Show Dialog Share
 * @param {*} page
 */
const showDialogShare = (page) => {
	return new Promise(async (resolve, reject) => {
		try {
			let isShowDialog = false;
			do {
				LOG.info("[SHARE_VIDEO_GROUP] => ", "CLICK SHARE BUTTON");
				await page.waitForSelector(CONFIG.SHARE_VIDEO_GROUP.SELECTOR, {
					timeout: CONFIG.DELAY,
				});
				await page.waitFor(CONFIG.DELAY);
				let button = await page.$(CONFIG.SHARE_VIDEO_GROUP.SELECTOR);
				await button.click();
				await page.waitFor(CONFIG.DELAY);
				isShowDialog = isDialogShare(page);
				await page.waitFor(CONFIG.DELAY);
			} while (!isShowDialog);

			let buttonShareGroup = await page.$(
				CONFIG.SHARE_VIDEO_GROUP.DIALOG
			);
			await buttonShareGroup.click();
			LOG.info("[SHARE_VIDEO_GROUP] => ", "CLICK SHOW DIALOG");

			return resolve(true);
		} catch (err) {
			return reject(err);
		}
	});
};

/**
 * [description]
 * @param  {[type]} page        [description]
 * @param  {[type]} postObject  [description]
 * @param  {[type]} groupObject [description]
 * @param  {[type]} account     [description]
 * @return {[type]}             [description]
 */
const shareToGroup = (page, postObject, groupObject, account) => {
	return new Promise(async (resolve, reject) => {
		try {
			const { post, content } = postObject;
			const { group_id, group_name } = groupObject;
			LOG.info("[SHARE_VIDEO_GROUP] => ", "GO TO " + post);
			await page.goto(post, {
				timeout: 0,
				waitUntil: "networkidle0",
			});
			await page.waitFor(CONFIG.DELAY);
			await showDialogShare(page);
			await page.waitFor(CONFIG.DELAY);
			await clickByXpath(page, CONFIG.SHARE_VIDEO_GROUP.DIALOG_1);
			await page.waitFor(CONFIG.DELAY);
			await page.waitForSelector(CONFIG.SHARE_VIDEO_GROUP.POPUP, {
				timeout: CONFIG.DELAY,
			});
			await page.waitFor(CONFIG.DELAY);
			await page.keyboard.type(content, { delay: 100 });
			LOG.info("[SHARE_VIDEO_GROUP] => ", "TYPE CONTENT SHARE");

			await page.waitFor(CONFIG.DELAY);
			await page.waitForSelector(CONFIG.SHARE_VIDEO_GROUP.SEARCH_GROUP, {
				timeout: CONFIG.DELAY,
			});
			await page.type(CONFIG.SHARE_VIDEO_GROUP.SEARCH_GROUP, group_name, {
				delay: 100,
			});
			LOG.info("[SHARE_VIDEO_GROUP] => ", "SEARCH GROUP");

			await page.waitFor(CONFIG.DELAY);

			const groupExists = await existsByXpath(
				page,
				CONFIG.SHARE_VIDEO_GROUP.GROUP_NOT_FOUND
			);
			if (!groupExists) {
				await page.waitForSelector(
					CONFIG.SHARE_VIDEO_GROUP.SHARE_BUTTON,
					{
						timeout: CONFIG.DELAY,
					}
				);
				let shareButton = await page.$(
					CONFIG.SHARE_VIDEO_GROUP.SHARE_BUTTON
				);
				await shareButton.click();
				LOG.info("[SHARE_VIDEO_GROUP] => ", "CLICK SHARE");

				await page.waitFor(CONFIG.DELAY + 5000);
				LOG.info("[SHARE_VIDEO_GROUP] => ", "DONE: " + group_name);
			} else {
				LOG.error(
					"[SHARE_VIDEO_GROUP] => ",
					"GROUP NOT FOUND: " +
						group_name +
						" - ACCOUNT: " +
						account.email
				);
			}
			await takeScreenshot(page, `${account.email}_TASK_SHARE_GROUP_${group_name}`);
			return resolve(true);
		} catch (e) {
			await takeScreenshot(page, `${account.email}_TASK_SHARE_GROUP_ERROR_${group_name}`);
			reject("[SHARE_VIDEO_GROUP] => " + e);
		}
		reject("Can't Share Video To Group");
	});
};

/**
 * [description]
 * @param  {[type]} page       [description]
 * @param  {[type]} postObject [description]
 * @param  {[type]} groups     [description]
 * @param  {[type]} account    [description]
 * @return {[type]}            [description]
 */
const shareToGroups = (page, postObject, groups, account) => {
	return new Promise(async (resolve, reject) => {
		try {
			for (let index = 0; index < groups.length; index++) {
				// ignore if one of loop error keep it continue running
				try {
					var group = groups[index];
					await shareToGroup(page, postObject, group, account);
				} catch (e) {
					LOG.error(e);
				}
				await page.waitFor(CONFIG.DELAY);
			}
			resolve(true);
		} catch (error) {
			reject(error);
		}
	});
};

/**
 * Destroy
 * @param {page, browser}
 */
const destroy = async ({ browser, page }) => {
	await page.close();
	await browser.close();
};

/**
 * Click by Xpath
 * @param {*} page
 * @param {*} xpath
 */
const clickByXpath = (page, xpath) => {
	return new Promise(async (resolve, reject) => {
		try {
			const linkHandlers = await page.$x(xpath);
			if (linkHandlers.length > 0) {
				await linkHandlers[0].click();
				resolve(true);
			} else {
				reject("Can't click");
			}
		} catch (error) {
			reject("Something wrong with click xpath");
		}
	});
};

/**
 * Check XPath exists
 * @param  {[type]} page  [description]
 * @param  {[type]} xpath [description]
 * @return {[type]}       [description]
 */
const existsByXpath = (page, xpath) => {
	return new Promise(async (resolve, reject) => {
		try {
			const el = await page.$x(xpath);
			if (el.length > 0) {
				return resolve(true);
			}
			return resolve(false);
		} catch (error) {
			return resolve(false);
		}
	});
};

/**
 * Take Screenshot
 * @param  {[type]} page [description]
 * @param  {[type]} name [description]
 * @return {[type]}      [description]
 */
const takeScreenshot = (page, name) => {
	return new Promise(async (rs, rj) => {
		try {
			const cwd = process.cwd();
			const { env } = process;
			const screenshotsPath = `${cwd}/screenshots`;
			LOG.info(`Saved Screenshot: ${screenshotsPath}/${name}.jpg`);
			await page.screenshot({
				path: `${screenshotsPath}/${name}.jpg`,
				type: "jpeg",
			});
		} catch (e) {
			LOG.error(e);
		}
		rs(true);
	});
};

module.exports = {
	init,
	signIn,
	destroy,
	shareToGroup,
	shareToGroups,
	takeScreenshot,
};
