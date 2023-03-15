/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 396:
/***/ ((module) => {

module.exports = eval("require")("@actions/core");


/***/ }),

/***/ 137:
/***/ ((module) => {

module.exports = eval("require")("tar-fs");


/***/ }),

/***/ 465:
/***/ ((module) => {

"use strict";
module.exports = require("node:stream/consumers");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __nccwpck_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		var threw = true;
/******/ 		try {
/******/ 			__webpack_modules__[moduleId](module, module.exports, __nccwpck_require__);
/******/ 			threw = false;
/******/ 		} finally {
/******/ 			if(threw) delete __webpack_module_cache__[moduleId];
/******/ 		}
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat */
/******/ 	
/******/ 	if (typeof __nccwpck_require__ !== 'undefined') __nccwpck_require__.ab = __dirname + "/";
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
const core = __nccwpck_require__(396);
const tar = __nccwpck_require__(137);
const { blob } = __nccwpck_require__(465);

let publishDir = core.getInput('publish_dir');
let siteURL = core.getInput('site_url', { require: true });
let dpURL = core.getInput('dp_url', { require: true });
dpURL = dpURL.endsWith("/") ? dpURL : dpURL + "/";
let refreshToken = core.getInput('refresh_token', { require: true });
let protocols = {
  http: core.getInput('deploy_http'),
  hyper: core.getInput('deploy_hyper'),
  ipfs: core.getInput('deploy_ipfs'),
};

const headers = { Authorization: `Bearer ${refreshToken}` };

async function run() {
  // see if the site exists
  let siteExists = true;
  const existCheckResponse = await fetch(`${dpURL}/v1/sites/${siteURL}`, { headers, method: 'get' });
  if (!existCheckResponse.ok) {
    const json = await existCheckResponse.json();
    console.log(`Couldn't verify that the site exists: ${json}`);
    siteExists = false;
  }

  // create it if it doesnt
  if (!siteExists) {
    console.log("Create a new site...")
    const makeSiteResponse = await fetch(`${dpURL}/v1/sites/${siteURL}`, {
      headers,
      method: 'post',
      body: JSON.stringify({
        domain: siteURL,
        protocols,
      })
    });

    if (!makeSiteResponse.ok) {
      const json = await makeSiteResponse.json();
      throw new Error(`Failed to create the site: ${json}`);
    }
  }

  // put request to upload the content
  console.log("Creating tarball...");
  const tarStream = tar.pack(publishDir);
  const tarBlob = await blob(tarStream);
  const formData = new FormData();
  formData.append('file', tarBlob, siteURL);

  console.log("Uploading new site content...");
  const uploadResponse = await fetch(`${dpURL}/v1/sites/${siteURL}`, { headers, method: 'put', body: formData });
  if (!uploadResponse.ok) {
    const json = await uploadResponse.json();
    throw new Error(`Failed to upload the contents of the site: ${json}`);
  }

  console.log("Success!");
}

run()

})();

module.exports = __webpack_exports__;
/******/ })()
;