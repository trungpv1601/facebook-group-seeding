const inquirer = require("inquirer");
const chalk = require("chalk");
const figlet = require("figlet");
const CSV = require("./lib/csv");
const TASK = require("./lib/task");

const init = () => {
	console.log(
		chalk.green(
			figlet.textSync("Facebook Tools", {
				font: "Standard",
				horizontalLayout: "default",
				verticalLayout: "default",
			})
		)
	);
};

const askMode = () => {
	const question = [
		{
			name: "MODE",
			type: "list",
			message: "Please select mode to run :)",
			choices: [
				{ name: "Auto", value: "Auto" },
				{ name: "Manual", value: "Manual" },
			],
		},
	];

	return inquirer.prompt(question);
};

const askPosts = (posts) => {
	const post = posts.map((item, i) => {
		return {
			name: `${i + 1}. ${item["post_share"]} (${item["content_share"]})`,
			value: item,
		};
	});

	const questions = [
		{
			name: "POST",
			type: "list",
			message: "Post:",
			choices: post,
		},
	];
	return inquirer.prompt(questions);
};

const run = async () => {
	// show script introduction
	init();

	// Prepare data
	const accounts = await CSV.accounts();
	const posts = await CSV.posts();

	// ask questions
	const mode = await askMode();

	if (mode.MODE === "Auto") {
		for (let j = posts.length - 1; j >= 0; j--) {
			let post = posts[j];
			let account_id = post["account_id"];
			let account = CSV.whereAccount(account_id, accounts);
			await TASK.runShareVideoToGroups(account, post);
		}
	} else {
		const answersPosts = await askPosts(posts);
		let post = answersPosts.POST;
		let account_id = post["account_id"];
		let account = CSV.whereAccount(account_id, accounts);
		await TASK.runShareVideoToGroups(account, post);
	}

	process.exit();
};

run();
