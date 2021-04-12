
const log           = require('inspc');

const dotenv        = require('./webpack/dotenv');

require('dotenv-up')({
  override    : false,
  deep        : 1,
}, true, 'server');

const path          = require('path');

const fs            = require('fs');

const express       = require('express');

const compression   = require('compression');

const se = require('nlab/se');

const webpack = require('./config')('production');

const app = express();

const server    = require('http').createServer(app);

app.set('json spaces', 4);

app.use(express.urlencoded({extended: false}));

app.use(express.json());

app.use(compression({filter: (req, res) => {

    if (req.headers['x-no-compression']) {
      // don't compress responses with this request header
      return false
    }

    // fallback to standard filter function
    return compression.filter(req, res)
  }}));

app.use(express.static(webpack.public, {
  maxAge: '356 days',
  index: false,
}));

(function () {

  const ifDevUseFileModificationTime = (function () {

    if (process.env.NODE_ENV !== "production") {

      try {

        const w           = require('./webpack.config');

        return path.resolve(w.output.path, w.output.filename.replace(/\[name\]/g, Object.keys(w.entry)[0]));
      }
      catch (e) {

        log.dump({
          ifDevUseFileModificationTime_error: e,
        })
      }
    }
  }());

  const template = require('./webpack/server-template')({
    buildtimefile   : webpack.server.buildtime,
    tempatefile     : path.resolve(webpack.public, 'index.html'),
    isProd          : process.env.NODE_ENV === "production",
  })

  app.get('*', (req, res) => {

    let mtime;

    if (ifDevUseFileModificationTime) {

      try {

        if (fs.existsSync(ifDevUseFileModificationTime)) {

          const stats = fs.statSync(ifDevUseFileModificationTime);

          mtime = (stats.mtime).toISOString().substring(0, 19).replace('T', '_').replace(/:/g, '-') + '_dev_mtime'
        }
      }
      catch (e) {}
    }

    let tmp = template({
      mode            : process.env.NODE_ENV || 'undefined',
      mtime,
    });

    res.send(tmp);
  });
}());

try {

  let port = parseInt(dotenv('PORT'), 10);

  if ( port < 1 ) {

    throw new Error(`port < 1`);
  }

  const host = dotenv('HOST');

  server.listen(
    port,
    host,
    undefined, // io -- this extra parameter
    () => {
      console.log(`\n 🌎  Server is running ` + ` http://${host}:${port} ` + "\n")
    }
  );
}
catch (e) {

  log.dump({
    general_error: se(e),
  }, 4)

  process.exit(1);
}