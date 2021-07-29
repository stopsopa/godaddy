
require('dotenv-up')({
  override    : false,
  deep        : 2,
}, false, 'fetchJsonForTests');

const fetchJson = require('../lib/fetchJsonForNode');

const dotenv        = require('../webpack/dotenv');

const negotiatePort = require('nlab/negotiatePort');

let port = parseInt(dotenv('PORT'), 10);

if ( port < 1 ) {

  throw new Error(`port < 1`);
}

const host = dotenv('HOST');

const protocol = dotenv('PROTOCOL');

const domain = `${protocol}://${host}${negotiatePort(protocol, port, ':')}`

const fetchJsonForTests = async (path, opt) => {

  if ( ! /^https?:\/\//.test(path) ) {

    path = domain + path;
  }

  try {

    return await fetchJson(path, opt);
  }
  catch (e) {

    if (String(e).includes('ECONNREFUSED')) {

      console.log(`\n\n    \x1b[31mINFO: ECONNREFUSED detected, please make sure that server is running for testing, run \n\n    make webpackprod\n    make serverprod\x1b[0m\n\n`);
    }

    throw e;
  }
}

module.exports = {
  fetchJsonTransport: fetchJsonForTests,
  fetchJson: (path, opt) => {
    return fetchJsonForTests(`/proxyJson`, {
      method: 'post',
      body: {
        path,
      }
    });
  }
}