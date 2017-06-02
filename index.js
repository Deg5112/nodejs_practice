'use strict'
const http = require('http');
const https = require('https');
const fs = require('fs');
const getNpmTarballUrl = require('get-npm-tarball-url').default;
const tar = require('tar-fs');
const targz = require('tar.gz');
const cheerio = require('cheerio');

//This was fun, let me know if you want me to try anything else, looking forward to your feedback :)

function downloadPackages (count, callback) {
    let packages  = {};

    https.get("https://www.npmjs.com/browse/depended", function(res) {
        res.setEncoding('utf8');
        let body = '';

        res.on('data', function (chunk) {
            body += chunk;
        });

        res.on('end', function() {
            const $ = cheerio.load(body);
            let x = 0;

            while (x < count) {
                let packageName = $($('a.name')[x]).text();
                let versionTargetSelector = '[href="/package/'+packageName+'"]';
                packages[packageName] = $(versionTargetSelector).last().text();
                x++;
            }

            for (let i in packages) {
                let url = getNpmTarballUrl(i, packages[i]);
                http.get(url, function(response) {
                    response.pipe(fs.createWriteStream('tmp/' + i + '.tar')).on('finish', function () {
                        targz().extract('tmp/'+i+'.tar', 'packages/'+i, function(err) {
                            if (err) {
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
        });
    }).on('error', function(e) {
        console.log("Got error: " + e.message)
    });
}

module.exports = downloadPackages;


