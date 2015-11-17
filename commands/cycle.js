var path = require('path');
var cwdPath = path.resolve(process.cwd());
var spawn = require('child-process-promise').spawn;

var coldframeCycle = function() {

	spawn('vagrant', ['halt'])
	.progress(function (childProcess) {
		childProcess.stdout.on('data', function (data) {
			console.log('[spawn] stdout: ', data.toString());
		});
		childProcess.stderr.on('data', function (data) {
			console.log('[spawn] stderr: ', data.toString());
		});
	})
	.then(function () {
		spawn('vagrant', ['up'])
		.progress(function (childProcess) {
			childProcess.stdout.on('data', function (data) {
				console.log('[spawn] stdout: ', data.toString());
			});
			childProcess.stderr.on('data', function (data) {
				console.log('[spawn] stderr: ', data.toString());
			});
		})
		.then(function () {
			console.log('Done with cycle.');
			return true;
		});
	})
	.fail(function (err) {
		console.error('[spawn] ERROR: ', err);
		return false;
	});

};

module.exports = coldframeCycle;