
const path = require("path");

const fs = require("fs");

const mkdirp = require("mkdirp");

const fetchJson = require('./fetchJsonForNode');

const sha256 = require('nlab/sha256');

const se = require('nlab/se');

const m = msg => `proxyJsonMiddleware.js error: ${msg}`;

const th = msg => new Error(m(msg));

module.exports = ({
  targetDir
}) => {

  if (typeof targetDir !== 'string') {

    throw th(`targetDir is not a string`);
  }

  // maybe it's ugly but it works the best
  if ( fs.existsSync(targetDir) ) {

    if ( ! fs.lstatSync(targetDir).isDirectory() ) {

      throw th(`Path ${targetDir} already exist and it is not a directory, it should be directory 1`);
    }
  }
  else {

    mkdirp.sync(targetDir);
  }

  if ( fs.existsSync(targetDir) ) {

    if ( ! fs.lstatSync(targetDir).isDirectory() ) {

      throw th(`Path ${targetDir} already exist and it is not a directory, it should be directory 2`);
    }
  }

  return async (req, res) => {

    let error;

    try {

      if (typeof req.body.path !== 'string') {

        throw th(`req.body.path is not a string`);
      }

      if ( ! req.body.path.trim() ) {

        throw th(`req.body.path is an empty string`);
      }

      const hash = sha256(req.body.path);

      const file = path.resolve(targetDir, `${hash}.json`);

      if ( fs.existsSync(file) ) {

        const content = fs.readFileSync(file, 'utf8').toString();

        const json = JSON.parse(content);

        res.set('X-proxy-json', 'from-file');

        console.log(`proxyJsonMiddleware.js request for ${req.body.path} - from-file`)

        return res.json(json.json.body);
      }

      const json = await fetchJson(req.body.path, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 11_2_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.114 Safari/537.36',
            // Request forbidden by administrative rules. Please make sure your request has a User-Agent header (http://developer.github.com/v3/#user-agent-required). Check https://developer.github.com for other possible causes.
        }
      });

      if (json.status === 200) {

        fs.writeFileSync(file, JSON.stringify({
          'req.body.path': req.body.path,
          json,
        }, null, 4));

        res.set('X-proxy-json', 'from-url');

        console.log(`proxyJsonMiddleware.js request for ${req.body.path} - from-url`)

        return res.json(json.body);
      }

      error = json;
    }
    catch (e) {

      error = se(e);
    }

    console.log(m(JSON.stringify(error, null, 4)));

    return res.status(500).json(m(`general proxy error`)); // to don't send details of the error to the client
  }
}