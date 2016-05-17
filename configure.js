/**
 * @fileoverview
 * @author Taketshi Aono
 */

'use strict';

var fs = require('fs');
var exec = require('child_process').exec;
var util = require('util');
var path = require('path');

var pkg = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
var VERSION_FILE = 'post-install.lock';

function isLatest(nodeVer) {
  if (fs.existsSync(VERSION_FILE)) {
    var versions = fs.readFileSync(VERSION_FILE, 'utf-8').split('--');
    return versions[0] === pkg.version && versions[1] === nodeVer;
  }
  return false;
}

exec('node --version', function(err, stdout, stderr) {
  if (err) throw err;
  if (stderr) throw stderr;
  if (isLatest(stdout)) {
    console.log('already installed.');
    spawn('./node_modules/.bin/gulp --no-color', () => console.log('done'));
    return;
  }

  var requiredNpmModules = pkg.globalDependencies || {};


  function spawn(cmd, cb) {
    var proc = exec(cmd);
    function redirect(d) {
      process.stdout.write(d);
    }
    proc.stdout.pipe(process.stdout);
    proc.stderr.pipe(process.stderr);
    proc.on('exit', function() {
      cb();
    });
  }


  function install(modules, cb) {
    if (!modules.length) {
      return cb();
    }
    spawn('npm install -g ' + modules.shift(), function() {
      install(modules, cb);
    });
  }


  function tryResolve(modules, cb) {
    var cmds = {};
    for (var prop in modules) {
      cmds[prop] = prop + (modules[prop] === '*'? '': '@' + modules[prop]);
    }

    exec('npm ls -g --depth=0', function(err, stdout, stderr) {
      var ret = [];
      for (var prop in cmds) {
        (function(cmd) {
          if (stdout.indexOf(cmd) === -1) {
            ret.push(cmd);
          } else {
            console.log('package [%s] is already installed. skip.', cmd);
          }
        })(cmds[prop]);
      }
      cb(ret);
    });
  }


  tryResolve(requiredNpmModules, function(required) {
    install(required, function() {
      spawn('./node_modules/.bin/gulp install --no-color', () => {
        fs.writeFileSync(VERSION_FILE, pkg.version + '--' + stdout, 'utf-8');
        spawn('./node_modules/.bin/gulp --no-color', () => console.log('done.'));
      });
    });
  });
});
