const inquirer = require('inquirer');
const chalk = require('chalk');
const figlet = require('figlet');
const LOG = require('./lib/logger');
const CSV = require('./lib/csv');
const FB = require('./lib/facebook');

const init = () => {
	console.log(
		chalk.green(
			figlet.textSync('Facebook Tools', {
				font: 'Standard',
				horizontalLayout: 'default',
				verticalLayout: 'default',
			})
		)
	);
};

const askMode = () => {
	const question = [
		{
			name: 'MODE',
			type: 'list',
			message: 'Please select mode to run :)',
			choices: [{ name: 'Manual', value: 'Manual' }],
		},
	];

	return inquirer.prompt(question);
};

const askQuestions = (accounts) => {
	const account = accounts.map((item, i) => {
		return { name: i + 1 + '. ' + item['email'], value: item };
	});

	const questions = [
		{
			name: 'ACCOUNT',
			type: 'list',
			message: 'Account:',
			choices: account,
		},
	];
	return inquirer.prompt(questions);
};

const askPosts = (posts) => {
	const post = posts.map((item, i) => {
		return {
			name: i + 1 + '. ' + item['post'],
			value: { post: item['post'], content: item['content'] },
		};
	});

	const questions = [
		{
			name: 'POST',
			type: 'list',
			message: 'Post:',
			choices: post,
		},
	];
	return inquirer.prompt(questions);
};

const askGroups = (groups) => {
	const group = groups.map((item, i) => {
		return {
			name: i + 1 + '. ' + item['group_name'],
			value: { group_id: item['group_id'], group_name: item['group_name'] },
		};
	});

	const questions = [
		{
			name: 'GROUP',
			type: 'list',
			message: 'Group:',
			choices: group,
		},
	];
	return inquirer.prompt(questions);
};

const run = async () => {
	// show script introduction
	init();
	// ask question
	// const answerMode = await askMode();
	// const { MODE } = answerMode;
	// if (MODE === 'Manual') {
	const accounts = await CSV.accounts();
	const groups = await CSV.groups();
	const posts = await CSV.posts();

	const answers = await askQuestions(accounts);

	const answersPosts = await askPosts(posts);
	// const answersGroups = await askGroups(groups);

	const { email, password, proxy, secret_2fa } = answers.ACCOUNT;

	const { page, browser } = await FB.init(proxy);
	await FB.signIn(page, email, password, secret_2fa);

	await FB.shareToGroups(page, answersPosts.POST, groups);

	await FB.destroy({ page, browser });
	// } else {
	// 	LOG.error('We are not support.');
	// }
};

run();
