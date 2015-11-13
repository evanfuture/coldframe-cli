var fs = require('fs');
var path = require('path');
var ansiblePath = path.resolve(process.cwd())+'/ansible';
var spawn = require('child_process').spawn;
var inquirer = require('inquirer');
var yaml = require('write-yaml');
var prependFile = require('prepend-file');
var fs = require('fs.extra');
var replace = require("replace");
var jsYaml = require('js-yaml');


var coldframeActivate = function(argv) {
	// 1. check if site_slug host_vars file exists
	// 2.a. if yes, run standard activation
	// 2.b. if no, run prompts to create it, then run standard activation.

	var site_slug = argv._[1];
	var site_host_file = path.resolve(process.cwd())+'/ansible/host_vars/'+site_slug+'.dev';
	var template_file = ansiblePath+'/host_vars/_default';
	try {
		var isFile = fs.statSync(site_host_file).isFile();
		var newSite = false;
	} catch (e) {
		var newSite = true;
	}

	if(newSite){
		// Create host_vars file using prompts.
		// first, create the new template file:
		fs.copy(template_file, site_host_file, { replace: true }, function (err) {
			if (err) {
			// i.e. file already exists or can't write to directory
			console.log('Template failed to copy.  Check your permissions.');
			throw err;
			}
		});
		// Grab important variables
		try {
			var doc = jsYaml.safeLoad(fs.readFileSync(ansiblePath+'/group_vars/all/secrets', 'utf8'));
			var default_admin_email = doc.vault_admin_email;
			var default_repo_owner = doc.vault_bitbucket_user;
		} catch (e) {
			console.log('Cannot Read \'secrets\' file.  Have you run \'coldframe init\'?');
		}
		// Now ask the questions:
		inquirer.prompt([
			{
				type: "list",
				message: "What type of site?",
				name: "site_type",
				choices: [
					{
						name: "Wordpress",
						value: "wordpress"
					},
					{
						name: "Angular",
						value: "angular"
					},
					{
						name: "Bare",
						value: "bare"
					}
				]
			},
			{
				type: "input",
				message: "Enter your site's title",
				name: "site_title"
			},
			{
				type: "confirm",
				message: "Custom Theme?",
				name: "custom_theme",
				when: function( answers ) {
					return answers.site_type === "wordpress";
				}
			},
			{
				type: "confirm",
				message: "Custom Plugin?",
				name: "custom_plugin",
				when: function( answers ) {
					return answers.site_type === "wordpress";
				}
			},
			{
				type: "confirm",
				message: "Install Demo Database?",
				name: "install_demo_database",
				when: function( answers ) {
					return answers.site_type === "wordpress";
				}
			},
			{
				type: "input",
				message: "Admin Email",
				name: "admin_email",
				default: default_admin_email,
				when: function( answers ) {
					return answers.site_type === "wordpress";
				}
			},
			{
				type: "input",
				message: "Bitbucket Repo Owner",
				name: "repo_owner",
				default: default_repo_owner
			},

		], function( answers ) {

			// add line to the hosts file in the appropriate spot.
			if(answers.site_type === 'wordpress'){
				replace({
					regex: '.wordpress.',
					replacement: '[wordpress]\n'+site_slug+'.dev',
					paths: [ansiblePath+'/hosts'],
					silent: true
				});

			} else {
				replace({
					regex: '.default.',
					replacement: '[default]\n'+site_slug+'.dev',
					paths: [ansiblePath+'/hosts'],
					silent: true
				});
			}

			replace({
				regex: "{{site_type}}",
				replacement: answers.site_type,
				paths: [site_host_file],
				silent: true
			});
			replace({
				regex: "{{site_title}}",
				replacement: answers.site_title,
				paths: [site_host_file],
				silent: true
			});
			if(answers.custom_theme === undefined){ var d_custom_theme = 'false';} else {var d_custom_theme = answers.custom_theme; }
			replace({
				regex: "{{custom_theme}}",
				replacement: d_custom_theme,
				paths: [site_host_file],
				silent: true
			});
			if(answers.custom_plugin === undefined){ var d_custom_plugin = 'false';} else {var d_custom_plugin = answers.custom_plugin; }
			replace({
				regex: "{{custom_plugin}}",
				replacement: d_custom_plugin,
				paths: [site_host_file],
				silent: true
			});
			if(answers.install_demo_database === undefined){ var d_install_demo_database = 'false';} else {var d_install_demo_database = answers.install_demo_database; }
			replace({
				regex: "{{install_demo_database}}",
				replacement: d_install_demo_database,
				paths: [site_host_file],
				silent: true
			});
			if(answers.admin_email === undefined){ var d_admin_email = default_admin_email;} else {var d_admin_email = answers.admin_email; }
			replace({
				regex: "{{admin_email}}",
				replacement: d_admin_email,
				paths: [site_host_file],
				silent: true
			});
			replace({
				regex: "{{repo_owner}}",
				replacement: answers.repo_owner,
				paths: [site_host_file],
				silent: true
			});
			activateSite();

		});
	} else {
		activateSite();
	}



	function activateSite(){
		var activate = spawn('ansible-playbook', ['-i', 'hosts', 'activate.yml', '-l', site_slug +'.dev'], {cwd: ansiblePath } );
		activate.stdout.on('data', function (data) {
			console.log('data: ' + data);
		});
		activate.stderr.on('data', function (data) {
			console.log('error: ' + data);
		});
	}
};

module.exports = coldframeActivate;