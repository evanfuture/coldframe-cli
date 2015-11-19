var Promise = require("bluebird");
var fs = Promise.promisifyAll(require("fs-extra"));
fs.existsAsync = Promise.promisify(function exists2(path, exists2callback) {
	fs.exists(path, function callbackWrapper(exists) { exists2callback(null, exists); });
});
var prompt = Promise.promisifyAll(require("prompt"));
var prependFile = Promise.promisifyAll(require('prepend-file'));
var spawn = require('child_process').spawn;
var spawnSync = require('child_process').spawnSync;

var path = require('path');
var cwdPath = path.resolve(process.cwd());
var fileColdframe= path.resolve(process.cwd())+'/ansible/coldframe.yml';
var fileVault = cwdPath+'/.coldframe_vault_pass';
var fileSecrets = cwdPath+'/ansible/group_vars/all/secrets';
var fileUserSecrets = cwdPath+'/ansible/group_vars/all/secrets_user';

var coldframeInit = function(){

	checkColdframe().then(checkVault).then(checkSecrets).then(checkUserSecrets).then(initColdframe);

	function checkColdframe(){
		return fs.existsAsync(fileColdframe).then(function(existsColdframe){
			if(!existsColdframe) {
				console.log('Coldframe is not installed, lets do that.');
				return createColdframe().then(function(resolve){
					console.log('Ok, Coldframe is installed...');
				});
			} else{
				return true;
			}
		}).catch(function(err){
			console.log(err);
		});
	};

	function createColdframe(){
		return new Promise(function(resolve, reject){
			var pullColdframe = spawnSync('git', ['clone', 'https://github.com/evanfuture/coldframe.git', '--depth=1'], {cwd: cwdPath});
			var moveColdframe = spawnSync('cp', ['-a', './coldframe/.', './'], {cwd: cwdPath});
			var deleteRepo = spawnSync('rm', ['-rf', './coldframe'], {cwd: cwdPath});

			if (deleteRepo.status !== 0) {
			  reject(deleteRepo.stderr);
			} else {
			  resolve(deleteRepo.status);
			}
		});
	};

	function checkVault(){
		return fs.existsAsync(fileVault).then(function(existsVault){
			if(!existsVault) {
				console.log('Vault is not installed, lets do that.');
				return createVault().then(function(resolve){
					console.log('Ok, Vault is installed...');
				});
			} else{
				return true;
			}
		}).catch(function(err){
			console.log(err);
		});
	};

	function createVault(){

		prompt.start();
		return prompt.getAsync(['coldframe_vault_pass'])
			.then(function(result){
				var coldframe_vault_pass = result.coldframe_vault_pass;
				return coldframe_vault_pass;
			}).then(function(coldframe_vault_pass){
				return fs.outputFileAsync(fileVault, coldframe_vault_pass);
		});
	};

	function checkSecrets(){
		return fs.existsAsync(fileSecrets).then(function(existsSecrets){
			if(!existsSecrets) {
				console.log('Secrets is not installed, lets do that.');
				return createSecrets().then(function(resolve){
					console.log('Ok, Secrets is installed...');
				});
			} else{
				return true;
			}
		}).catch(function(err){
			console.log(err);
		});
	};

	function createSecrets(){
		prompt.start();
		return prompt.getAsync(['vault_bitbucket_user', 'vault_bitbucket_password', 'vault_admin_email', 'vault_acf_pro_key'])
			.then(function(results){
				return prependFile.sync(cwdPath+'/ansible/group_vars/all/secrets', '---\nvault_bitbucket_user: '+results.vault_bitbucket_user+'\nvault_bitbucket_password: '+results.vault_bitbucket_password+'\nvault_admin_email: '+results.vault_admin_email+'\nvault_acf_pro_key: "'+results.vault_acf_pro_key+'"\n');
		});
	};

	function checkUserSecrets(){
		return fs.existsAsync(fileUserSecrets).then(function(existsUserSecrets){
			if(!existsUserSecrets) {
				console.log('UserSecrets is not installed, lets do that.');
				return createUserSecrets().then(function(resolve){
					console.log('Ok, UserSecrets is installed...');
				});
			} else{
				return true;
			}
		}).catch(function(err){
			console.log(err);
		});
	};

	function createUserSecrets(){
		prompt.start();
		return prompt.getAsync(['vault_bitbucket_username', 'vault_bitbucket_password'])
			.then(function(result){
				var data = {vault_bitbucket_user: result.vault_bitbucket_username, vault_bitbucket_password: result.vault_bitbucket_password};
				return data;
			}).then(function(data){
				return yaml.sync(cwdPath+'/ansible/group_vars/all/secrets_user', data);
			}).then(function(){
				return prependFile.sync(cwdPath+'/ansible/group_vars/all/secrets_user', '---\n');
		});
	};

	function initColdframe(){
		console.log('Running Vagrant Up.  Stay tuned for a few more prompts...');
		var launch = spawn('vagrant', ['up', '--provision'], {cwd: cwdPath } );
		launch.stdout.on('data', function (data) {
			console.log('data: ' + data);
		});
		launch.stderr.on('data', function (data) {
			console.log('error: ' + data);
		});
	};

};

module.exports = coldframeInit;