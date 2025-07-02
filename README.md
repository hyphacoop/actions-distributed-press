# `actions-distributed-press`
Easily deploy a site to [Distributed Press](https://distributed.press) using GitHub Actions. 
Contains examples for deploying websites using [Helia](https://helia.io/) and [Hypercore](https://holepunch.to/) protocols.

## Usage
### GitHub Actions Workflows

Two GitHub Actions templates are provided:

1. **static-deploy.yml**: For static websites.

   - **Customize**:
     - `publish_dir`: Set to your static site's output folder ( defaults to root `./`).
     - `site_url`: Replace `example.com` with your domain.

```yml
name: Publish Static Website to Distributed Press

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Publish to Distributed Press
        uses: hyphacoop/actions-distributed-press@v1.1.0
        with:
          publish_dir: ./ # Change to your static files directory, e.g., public
          dp_url: https://api.distributed.press
          refresh_token: ${{ secrets.DISTRIBUTED_PRESS_TOKEN }}
          site_url: example.com # Replace with your custom domain
          deploy_http: false
          deploy_hyper: true
          deploy_ipfs: true
```

2. **build-deploy.yml**: For projects requiring a build step.
   - **Customize**:
     - `publish_dir`: Set to your build output folder (e.g., `build`).
     - `site_url`: Replace `example.com` with your domain.
     - `publish_branch`: Adjust `gh-pages` to your preferred branch (e.g., `prod`).

```yml
name: Build and Deploy Site to Distributed Press

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest

    steps:
      # Step 1: Check out the repository
      - uses: actions/checkout@v3

      # Step 2: Set up Node.js
      - name: Set up Node.js 18
        uses: actions/setup-node@v3
        with:
          node-version: 18

      # Step 3: Install dependencies and build the site
      - name: Install dependencies
        run: npm ci

      - name: Build the site
        run: npm run build # Ensure this command generates output in the public directory

      # Step 4: Deploy to Distributed Press
      - name: Publish to Distributed Press
        uses: hyphacoop/actions-distributed-press@v1.1.0
        with:
          publish_dir: public # (optional) defaults to /public
          dp_url: https://api.distributed.press
          refresh_token: ${{ secrets.DISTRIBUTED_PRESS_TOKEN }}
          site_url: example.com # Replace with your custom domain
          deploy_http: true
          deploy_hyper: true
          deploy_ipfs: true

      # Step 5: Deploy to GitHub Pages
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v4
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: build # Change to your output directory if different (e.g., dist)
          publish_branch: gh-pages # Change to your GitHub Pages branch if different (e.g., prod)
```

### Distributed Press Token Setup

1. Obtain a free Distributed Press token from [get-a-token](https://distributed.press/2024/10/18/get-a-token/) page.
2. Add it as `DISTRIBUTED_PRESS_TOKEN` in your repository's **Settings > Secrets and variables > Actions > Secrets**.

#### Domain Setup

Configure your domain for Distributed Press:

| Type    | Name                   | Value                    |
| ------- | ---------------------- | ------------------------ |
| `CNAME` | `example.com`          | `api.distributed.press.` |
| `NS`    | `_dnslink.example.com` | `api.distributed.press.` |

**Note**: Include the trailing dot (`.`) in `api.distributed.press.`.

- To obtain an SSL certificate, contact the Distributed Press team. For HTTP publishing, the most convenient method is GitHub Pages. See [GitHub Pages domain setup](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site) for details.

### Deployment Options

There are three ways you can deploy your site:

1. **Sutty CMS**: A no-code platform with templates for easy publishing.
2. **GitHub Actions**: Automate deployment via workflows (as provided above).
3. **Distributed Press CLI**: A command-line tool for advanced site management.

> With the Fediverse [Social Inbox](https://hypha.coop/dripline/announcing-dp-social-inbox/) integration support, your site can receive comments, likes, and replies from the Fediverse.

Please see [Distributed Press Documentation](https://docs.distributed.press/deployment/).

### Congratulations!

Your site is now published over IPFS and Hyper can be accessed via `ipns://yourdomain.com` or `hyper://yourdomain.com`. You’ll also see it on our [explore page](https://explore.distributed.press/) 👀.
