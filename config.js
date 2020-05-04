const DEFAULT_VALUES = {
	DELAY: 3000,
	WAITING: 5000,
	HIDE_BROWSER: true,
	LOAD_MEDIA: true,
	LOGIN: {
		URL: "https://www.facebook.com/login/",
		EMAIL_SELECTOR: 'input[name="email"]',
		PASS_SELECTOR: 'input[name="pass"]',
		SUCC_SELECTOR: 'div[data-click="profile_icon"]',
	},
	_2FA: {
		CODE_SELECTOR: 'input[id="approvals_code"]',
		SUBMIT_SELECTOR: 'button[id="checkpointSubmitButton"]',
	},
	CHECKPOINT: {
		SUBMIT_SELECTOR: 'button[id="checkpointSubmitButton"]',
	},
	SHARE_VIDEO_GROUP: {
		SELECTOR:
			'div[aria-label="Send this to friends or post it on your Timeline."]',
		DIALOG:
			'div[data-testid="Keycommand_wrapper_ModalLayer"] div[role="dialog"] div[data-vc-ignore-dynamic="1"]:nth-child(4)',
		DIALOG_1: '//span[contains(text(), "Share to a group")]',
		POPUP: 'div[aria-label="Share to a group"]',
		SEARCH_GROUP: 'input[aria-label="Search for groups"]',
		SHARE_BUTTON: 'div[aria-label="Share"]',
		DONE: '//span[contains(text(), "Shared")]',
		GROUP_NOT_FOUND:
			'//span[contains(text(), "No groups match your search.")]',
	},
	CSV_ACCOUNTS_PATH: "./accounts.csv",
	CSV_POSTS_PATH: "./posts.csv",
	CSV_GROUPS_PATH: "./groups.csv",
	API_2FA: "https://2ffhsk1114.execute-api.us-east-1.amazonaws.com/dev/",
};

module.exports = DEFAULT_VALUES;
