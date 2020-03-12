const DEFAULT_VALUES = {
	DELAY: 3000,
	WAITING: 5000,
	LOAD_MEDIA: false,
	LOGIN: {
		URL: 'https://www.facebook.com/login/',
		EMAIL_SELECTOR: 'input[name="email"]',
		PASS_SELECTOR: 'input[name="pass"]',
		SUCC_SELECTOR: 'div[data-click="profile_icon"]'
	},
	SHARE_VIDEO_GROUP: {
		SELECTOR: 'div[aria-label="Send this to friends or post it on your timeline."]',
		DIALOG:
			'div[data-testid="Keycommand_wrapper"] div[role="menu"] div[role="menuitem"]:nth-child(5)',
		SEARCH_GROUP: 'input[aria-label="Search for groups"]',
		SHARE_BUTTON: 'div[aria-label="Share"]',
		DONE: '//span[contains(text(), "Shared")]'
	},
	CSV_ACCOUNTS_PATH: './accounts.csv',
	CSV_POSTS_PATH: './posts.csv',
	CSV_GROUPS_PATH: './groups.csv'
};

module.exports = DEFAULT_VALUES;
