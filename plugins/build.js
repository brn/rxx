/**
 * @fileoverview
 * @author Taketoshi Aono
 */

var through = require('through2');
var fs = require('fs');
var Builder = require('systemjs-builder');
var async = require('async');
var path = require('path');
var gutil = require('gulp-util');
var _ = require('lodash');


module.exports = function(options) {
  const configStr = fs.readFileSync(options.configFile, 'utf8');
  const builder = new Builder('./');
  const files = [];

  Function('System', configStr)({config: function(config) {
    config.baseURL = options.baseURL;
    if (options.replace && config.map) {
      _.forIn(options.replace, function(v, k) {
        config.map[k] = v;
      });
    }
    builder.config(config);
  }});


  function transform(file, encoding, callback) {
    files.push(file);
    callback();
  }

  
  function flush(callback) {
    const self = this;
    async.forEachSeries(files, function(file, next) {
      require('colors');
      const src = files[0].history[0];
      console.log(('Strart build process ').yellow.bold + src);
      builder.buildStatic(src, options.build || {})
        .then(function(output) {
          file.contents = new Buffer(output.source);
          self.push(file);
          next();
        })
        .catch(function(err) {
          console.log('Build error');
          console.log(err);
          next();
        });
    }, callback);
  }

  return through.obj(transform, flush);
};
