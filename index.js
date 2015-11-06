#!/usr/bin/env node

var fs = require('fs');
var path = require('path');
var ansiblePath = path.resolve(process.cwd())+'/ansible';
var spawn = require('child_process').spawn;

var userArgs = process.argv.slice(2);
var command = userArgs[0];

var coldframe = fs.stat('./ansible/coldframe.yml', function(err) {
	if(err === null) {
		console.log('This is a coldframe project.  We can proceed.');
		if(command === 'init'){
			// Check requirements
				// Ansible, Vagrant, vagrant-plugins
				// ansible
				fs.stat('/usr/local/bin/ansible', function(err) {
					if(err !== null) {
						console.log('Ansible is not installed.  Please verify prerequisites.');
						process.exit(2);
						process.kill(process.pid, 'SIGKILL');
					}
				});
				// vagrant
				fs.stat('/usr/local/bin/vagrant', function(err) {
					if(err !== null) {
						console.log('Vagrant is not installed.  Please verify prerequisites.');
						process.exit(2);
						process.kill(process.pid, 'SIGKILL');
					}
				});
			// Generate secrets file
				// default bitbucket user & password & acf pro key
			// Check for rsa keys
			// vagrant up
			console.log('Still working on the init feature.');
		}
		else if (command === 'activate') {
			var siteSlug = userArgs[1];
			var alreadyActive = fs.stat('./sites/'+siteSlug+'/', function(err){
				if(err === null){
					console.log(siteSlug+' is already active!!');
					process.exit(2);
				} else {
					var activate = spawn('ansible-playbook', ['-i', 'hosts', 'activate.yml', '-l', siteSlug +'.dev'], {cwd: ansiblePath } );
					activate.stdout.on('data', function (data) {
						console.log('data: ' + data);
					});
					activate.stderr.on('data', function (data) {
						console.log('error: ' + data);
					});
				}
			});
			console.log('Still working on this feature.');
		}
		else if (command === 'deactivate'){
			console.log('Still working on this feature.');
		}
		else if (command === 'deploy'){
			console.log('Still working on this feature.');
		}
		else if (command === 'wp'){
			console.log('Still working on this feature.');
		}
		else {
			console.log(ansiblePath);
		}
	} else  {
		console.log('This is not a coldframe project.  We must stop.');
		process.exit(1);
	}
});

// Available commands:

// ** (none)
//  checks for coldframe files in current path, also spits out help file

// ** init
//  runs through box-setup prompts and creates config files

// ** activate
//   - by itself just lists existing sites then prompts for site name
//   - if followed by a site slug, runs the scripts for that site
//   - if a new site, sets up the config file before running ansible

// ** deactivate
//   - by itself lists existing sites and prompts for site name
//   - if followed by a site name, runs the scripts to deactivate that site

// ** deploy

// ** [site_slug] wp [commands]
//   - Runs a wp-cli command from the given directory

// ** [site_slug] db dump
//   - quickly dump the db to its appropriate place.