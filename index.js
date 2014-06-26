'use strict';
var gutil = require('gulp-util');
var through = require('through2');
var esnext = require('esnext');
var applySourceMap = require('vinyl-sourcemaps-apply');
var objectAssign = require('object-assign');

module.exports = function (options) {
	var _options = options || {};

	return through.obj(function (file, enc, cb) {
		if (file.isNull()) {
			this.push(file);
			return cb();
		}

		if (file.isStream()) {
			this.emit('error', new gutil.PluginError('gulp-esnext', 'Streaming not supported'));
			return cb();
		}

		try {
			var options = objectAssign({}, _options);
			if (file.sourceMap) {
				options.sourceFileName = options.sourceFileName || file.relative;
				options.sourceMapName = options.sourceMapName || file.relative;// + '.map';
			}
			var res = esnext.compile(file.contents.toString(), options);

			file.contents = new Buffer(res.code);
			if (res.map && file.sourceMap) {
				applySourceMap(file, res.map);
			}
		} catch (err) {
			this.emit('error', new gutil.PluginError('gulp-esnext', err));
		}

		this.push(file);
		cb();
	});
};
