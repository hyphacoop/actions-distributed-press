# `actions-distributed-press`
Easily deploy a site to Distributed Press using GitHub Actions

## Usage
Add 'Publish to Distributed Press' as a build step in your workflow file (e.g. `.github/workflows/deploy.yaml`)

```yaml
...
jobs:
  deploy:
    runs-on: ubuntu-20.04
    steps:
      - uses: actions/checkout@v2
      - name: Publish to Distributed Press 
        uses: hyphacoop/actions-distributed-press@v1.1
        with:
          publish_dir: public                     # (optional) defaults to /public
          dp_url: https://api.dp.chanterelle.xyz  # URL of Distributed Press API Instance (include http/https)
          refresh_token: xxxxx.yyyyy.zzzzz        # Refresh token 
          site_url: docs.distributed.press        # domain (without protocol)
          deploy_http: false
          deploy_hyper: true
          deploy_ipfs: true
          deploy_bittorrent: true
      ...
```
