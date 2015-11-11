var spawn = require('child_process').spawn;
var path = require('path');
var cwdPath = path.resolve(process.cwd());

var coldframeCycle = function() {
	var halt = spawn('vagrant', ['halt'], {cwd: cwdPath } );
	halt.stdout.on('data', function (data) {
		console.log('data: ' + data);
		var up = spawn('vagrant', ['up'], {cwd: cwdPath } );
		up.stdout.on('data', function (data) {
			console.log('data: ' + data);
		});
		up.stderr.on('data', function (data) {
			console.log('error: ' + data);
		});
	});
	halt.stderr.on('data', function (data) {
		console.log('error: ' + data);
	});
};

module.exports = coldframeCycle;