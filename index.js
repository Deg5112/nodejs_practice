'use strict'
const http = require('http');
const fs = require('fs');
const getNpmTarballUrl = require('get-npm-tarball-url').default;
const tar = require('tar-fs');
const targz = require('tar.gz');
var path = require('path');

const packages = {
    lodash: '4.17.4',
    request: '2.81.0',
    async: '2.4.1',
    express: '4.15.3',
    chalk: '1.1.3',
    bluebird: '3.5.0',
    underscore: '1.8.3',
    commander: '2.9.0',
    debug: '2.6.8',
    moment: '2.18.1'
};

function downloadPackages (count, callback) {
    for (let i in packages) {
        var url = getNpmTarballUrl(i, packages[i]);
        http.get(url, function(response) {
            response.pipe(fs.createWriteStream('tmp/' + i + '.tar')).on('finish', function () {
                targz().extract('tmp/'+i+'.tar', 'packages/'+i, function(err){
                    if(err) {
                        console.log('Something is wrong ', err.stack);
                    }
                    count -= 1;
                    if (count === 0) {
                        callback();
                    }
                });
            });
        });
    }
}

module.exports = downloadPackages;


