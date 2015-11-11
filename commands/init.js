var inquirer = require('inquirer');
var yaml = require('write-yaml');
var prependFile = require('prepend-file');
var spawn = require('child_process').spawn;
var path = require('path');
var cwdPath = path.resolve(process.cwd());

var coldframeInit = function(){
	console.log('Caution, this will overwrite your secrets file');
	inquirer.prompt([
		{
			type: "expand",
			message: "Secrets File (might) Already exists.  Do you want to overwrite it?: ",
			name: "overwrite",
			choices: [
				{
					key: "y",
					name: "Yes, Overwrite",
					value: "overwrite"
				},
				{
					key: "n",
					name: "No, Abort",
					value: "abort"
				}
			]
		}
	], function( overwriteFile ) {
		if (overwriteFile.overwrite === "overwrite"){
			inquirer.prompt([
				{
					type: "input",
					message: "Enter your team's Default bitbucket username",
					name: "vault_bitbucket_username"
				},
				{
					type: "password",
					message: "Enter your team's Default bitbucket password",
					name: "vault_bitbucket_password"
				},
				{
					type: "password",
					message: "Paste your ACF Licence Key",
					name: "vault_acf_pro_key"
				}
			], function( answers ) {
				var acf_key = answers.vault_acf_pro_key;
				var data = {vault_bitbucket_user: answers.vault_bitbucket_username, vault_bitbucket_password: answers.vault_bitbucket_password, vault_acf_pro_key: "\"acf_key\""};
				yaml.sync('./ansible/group_vars/all/secrets', data);
				prependFile.sync('./ansible/group_vars/all/secrets', '---\n');

			});
		}
	});
};

module.exports = coldframeInit;