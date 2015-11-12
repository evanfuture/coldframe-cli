#!/usr/bin/env node
var inquirer = require('inquirer');
var yaml = require('write-yaml');
var prependFile = require('prepend-file');
var spawn = require('child_process').spawn;
var path = require('path');
var cwdPath = path.resolve(process.cwd());

var argv = require('yargs')
	.usage('Usage: $0 <command>')
	.command('init', 'Setup coldframe.', function(){
		var coldframeInit = require('./commands/init');
		coldframeInit();
	})
	.command('cycle', 'Shortcut for vagrant halt && vagrant up', function(){
		var coldframeCycle = require('./commands/cycle');
		coldframeCycle();
	})
	.command('activate', 'Install coldframe site.', function(yargs){
		argv = yargs.argv
		var coldframeActivate = require('./commands/activate')(argv);
	})
	.command('deactivate', 'Remove coldframe site.', function(){
		var coldframeInit = require('./commands/deactivate');
		coldframeDeactivate();
	})
	.command('wp', 'Use WP-CLI commands on a coldframe site.', function(){
		var coldframeInit = require('./commands/wp');
		coldframeWp();
	})
	.command('deploy', 'Deploy a coldframe site.', function(){
		var coldframeInit = require('./commands/deploy');
		coldframeDeploy();
	})
	.help('help')
	.argv;

// help / none