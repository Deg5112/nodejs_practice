'use strict'

const test = require('tape');
const series = require('run-series');
const fs = require('fs');
const folderSize = require('get-folder-size');
const download = require('./');

test('download', function (t) {
  t.plan(3);

  const COUNT = parseInt(process.env.COUNT, 10) || 10;

  series([
    (callback) => download(COUNT, callback),
    verifyCount,
    verifySize,
    verifyLodash
  ], t.end);

  function verifyCount (callback) {
    fs.readdir('./packages', function (err, files) {
      if (err) {
        return callback(err);
      }
      // Filter .gitignore and other hidden files
      files = files.filter((file) => !/^\./.test(file));
      t.equal(files.length, COUNT, `has ${COUNT} files`);
      callback();
    })
  }

  function verifySize (callback) {
    folderSize('./packages', function (err, size) {
      if (err) return callback(err);
      t.ok(size / 1024 > 5 * COUNT, 'min 5k per package');
      callback()
    })
  }

  function verifyLodash (callback) {
    const _ = require('./packages/lodash/package/lodash.js');
    t.equal(typeof _.map, 'function', '_.map exists');
    callback()
  }


  /*
    requiring further packages, re: making identical tests as the verifyLodash above, the problem is the other files have a bagillion requires inside the root files
    those would be brought in, if this was a real world scenario and all of these modules
    were brought in via npm install, as opposed to a coding test where these are programmitcally pulled from npm repo
    if you'd like me to write further test at some other point let me know
  */
});
