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

const askQuestions = (accounts) => {
	const account = accounts.map((item, i) => {
		return { name: i + 1 + ". " + item["email"], value: item };
	});

	const questions = [
		{
			name: "ACCOUNT",
			type: "list",
			message: "Account:",
			choices: account,
		},
	];
	return inquirer.prompt(questions);
};

const askPosts = (posts) => {
	const post = posts.map((item, i) => {
		return {
			name: i + 1 + ". " + item["post"],
			value: { post: item["post"], content: item["content"] },
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

const askGroups = (groups) => {
	const group = groups.map((item, i) => {
		return {
			name: i + 1 + ". " + item["group_name"],
			value: {
				group_id: item["group_id"],
				group_name: item["group_name"],
			},
		};
	});

	const questions = [
		{
			name: "GROUP",
			type: "list",
			message: "Group:",
			choices: group,
		},
	];
	return inquirer.prompt(questions);
};

const run = async () => {
	// show script introduction
	init();

	// Prepare data
	const accounts = await CSV.accounts();
	const groups = await CSV.groups();
	const posts = await CSV.posts();

	// ask questions
	const mode = await askMode();

	if (mode.MODE === "Auto") {
		for (let i = accounts.length - 1; i >= 0; i--) {
			let account = accounts[i];
			for (let j = posts.length - 1; j >= 0; j--) {
				let post = posts[j];
				await TASK.runShareVideoToGroups(account, post, groups);
			}
		}
	} else {
		const answers = await askQuestions(accounts);
		const answersPosts = await askPosts(posts);

		await TASK.runShareVideoToGroups(
			answers.ACCOUNT,
			answersPosts.POST,
			groups
		);
	}

	process.exit();
};

run();
