const core = require('@actions/core');
const fetch = requre('node-fetch');
const tar = require('tar-fs');
const { blob } = require('node:stream/consumers');


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

run();

