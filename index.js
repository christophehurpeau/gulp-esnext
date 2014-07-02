'use strict';
var gutil = require('gulp-util');
var through = require('through2');
var esnext = require('esnext');
var applySourceMap = require('vinyl-sourcemaps-apply');

module.exports = function (options) {
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
            if (file.sourceMap) {
                options = options || {};
                options.sourceFileName = options.sourceFileName || file.relative;
                options.sourceMapName = options.sourceMapName || file.relative;// + '.map';
            }
			var res = esnext.compile(file.contents.toString(), options);

			file.contents = new Buffer(res.code);
			if (res.map) {
                if (file.sourceMap) {
                    applySourceMap(file, res.map);
                } else {
    				this.push(new gutil.File({
    					cwd: file.cwd,
    					base: file.base,
    					path: file.path + '.map',
    					contents: new Buffer(res.map)
    				}));
                }
			}
		} catch (err) {
			this.emit('error', new gutil.PluginError('gulp-esnext', err));
		}

		this.push(file);
		cb();
	});
};
