
(function (old) {

  window.fetch = undefined;

  require("whatwg-fetch");

  const fake = window.fetch;

  window.fakeFetch = (url, opt) => {

    log(`ajax fetch polyfill ${url}`);

    return fake(url, opt);
  };

  window.fetch = (url, opt) => {

      log(`native fetch ${url}`);

      return old(url, opt);
  };
})(window.fetch);

const isObject = require("nlab/isObject");

export const fetchData = async (path, options) => {

  if (typeof options === "undefined") {

    options = {};
  }

  if (!/^https?:\/\//.test(path)) {

    path = origin + path;
  }

  console.log(`fetchData path: ${path}`);

  options.headers = {
    "x-requested-with": "fetch",
    ...options.headers,
  };

  const { delay, ...rest } = options;

  options = rest;

  if (Number.isInteger(delay) && delay > 0) {

    await new Promise(res => setTimeout(res, delay));
  }

  return fakeFetch(path, options);
};

export const fetchJson = (path, options) => {

  if (typeof options === "undefined") {

    options = {};
  }

  options.headers = {
    "Content-Type": "application/json; charset=utf-8",
    Accept: "application/json",
    ...options.headers,
  };

  if (isObject(options.body) || Array.isArray(options.body)) {

    options.body = JSON.stringify(options.body || {}, null, 4);

    options.method = options.method || "POST";
  } else {

    options.method = options.method || "GET";
  }

  const { raw, ...rest } = options;

  options = rest;

  const res = fetchData(path, options);

  if (raw) {

    return res;
  }

  return res.then(res => res.json());
};

/**
 * Purpose of this library is to just workaround github api requests quota:
 *
 * documentation_url: "https://docs.github.com/rest/overview/resources-in-the-rest-api#rate-limiting"
 * message: "API rate limit exceeded for xxx.xxx.xxx.xxx. (But here's the good news: Authenticated requests get a higher rate limit. Check out the documentation for more details.)"
 *
 * I could authenticate the request but it would increase the chance that will be to lazy to set this up on your end ;)
 * but why I'm worrying? probably no one will run this project anyway
 * ...no one will even get to the point of reading this comment probably ¯\_(ツ)_/¯
 */
export const proxyJson = (path, options) => {

  return fetchJson('/proxyJson', {
    method: 'post',
    body: {
      path,
    }
  })
}

window["fetchData"] = fetchData;

window["fetchJson"] = fetchJson;

window["proxyJson"] = proxyJson;

