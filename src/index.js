const core = require('@actions/core');
const fetch = require('node-fetch');
const tar = require('tar-fs');
const streamToBlob = require('stream-to-blob');
const FormData = require('form-data');

let publishDir = core.getInput('publish_dir');
let siteURL = core.getInput('site_url', { require: true });
let dpURL = core.getInput('dp_url', { require: true });
dpURL = dpURL.endsWith("/") ? dpURL.slice(0, -1) : dpURL;
let refreshToken = core.getInput('refresh_token', { require: true });
let protocols = {
  http: core.getBooleanInput('deploy_http'),
  hyper: core.getBooleanInput('deploy_hyper'),
  ipfs: core.getBooleanInput('deploy_ipfs'),
};

const headers = { 
  Authorization: `Bearer ${refreshToken}`, 
};

console.log(`Getting ready to deploy ${siteURL} to ${dpURL}`);

async function run() {
  // see if the site exists
  const existCheckResponse = await fetch(`${dpURL}/v1/sites/${siteURL}`, { headers, method: 'GET' });
  if (!existCheckResponse.ok) {
    const json = await existCheckResponse.text();
    console.log(`Couldn't verify that the site exists: ${json}`);
    console.log("Creating a new site...");
    const makeSiteResponse = await fetch(`${dpURL}/v1/sites`, {
      headers: { 
        ...headers,
        'Content-Type': 'application/json'
      },
      method: 'POST',
      body: JSON.stringify({
        domain: siteURL,
        protocols,
      })
    });

    if (!makeSiteResponse.ok) {
      const json = await makeSiteResponse.text();
      throw new Error(`Failed to create the site: ${json}`);
    }

    console.log(await makeSiteResponse.text());
  }

  // put request to upload the content
  console.log("Creating tarball...");
  const tarStream = tar.pack(publishDir);
  const tarBlob = await streamToBlob(tarStream);
  const formData = new FormData();
  formData.append('file', tarBlob, siteURL);

  console.log("Uploading new site content...");
  const uploadResponse = await fetch(`${dpURL}/v1/sites/${siteURL}`, { headers, method: 'PUT', body: formData });
  if (!uploadResponse.ok) {
    const json = await uploadResponse.text();
    throw new Error(`Failed to upload the contents of the site: ${json}`);
  }

  console.log("Success!");
  console.log(await uploadResponse.text());
}

run();

