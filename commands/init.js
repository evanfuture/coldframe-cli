var fs = require('fs');
var inquirer = require('inquirer');
var yaml = require('write-yaml');
var prependFile = require('prepend-file');
var spawn = require('child_process').spawn;
var path = require('path');
var ansiblePath = path.resolve(process.cwd())+'/ansible';
var cwdPath = path.resolve(process.cwd());

var coldframeInit = function(){
	var template_file = ansiblePath+'/group_vars/all/secrets';
	var secretsReady = false;
	try {
		var isFile = fs.statSync(template_file).isFile();
		var newInstall = false;
	} catch (e) {
		var newInstall = true;
	}
	function createSecrets(){
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
				type: "input",
				message: "Enter your default wordpress admin email",
				name: "vault_admin_email"
			},
			{
				type: "password",
				message: "Paste your ACF Licence Key",
				name: "vault_acf_pro_key"
			}
		], function( answers ) {
			var acf_key = answers.vault_acf_pro_key;
			var data = {vault_bitbucket_user: answers.vault_bitbucket_username, vault_bitbucket_password: answers.vault_bitbucket_password, vault_admin_email: answers.vault_admin_email, vault_acf_pro_key: "\"acf_key\""};
			yaml.sync('./ansible/group_vars/all/secrets', data);
			prependFile.sync('./ansible/group_vars/all/secrets', '---\n');

		});

	};
	if(!newInstall){
		inquirer.prompt([
			{
				type: "expand",
				message: "Secrets File Already exists.  Do you want to overwrite it?: ",
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
				createSecrets();
			}
		});
		secretsReady = true;
	} else {
		createSecrets();
		secretsReady = true;
	}

	if(secretsReady){
		var launch = spawn('vagrant', ['up', '--provision'], {cwd: cwdPath } );
		launch.stdout.on('data', function (data) {
			console.log('data: ' + data);
		});
		launch.stderr.on('data', function (data) {
			console.log('error: ' + data);
		});
	}
};

module.exports = coldframeInit;