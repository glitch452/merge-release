# ![LogoMakr-2ULBLV](https://github.com/Github-Actions-Community/merge-release/assets/3071208/bb7d9b4c-04bd-41c5-9c08-0ee5c91fa4a1)

<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->

[![All Contributors](https://img.shields.io/badge/all_contributors-4-orange.svg?style=flat-square)](#contributors-)

<!-- ALL-CONTRIBUTORS-BADGE:END -->

GitHub Action for automated npm publishing.

This Action publishes a package to npm. It is meant to be used on every successful merge to main but
you'll need to configure that workflow yourself. You can look to the
[`.github/workflows/push.yml`](./.github/workflows/release.yml) file in this project as an example.

### Workflow

- Check for the latest version number published to npm.
- Lookup all commits between the git commit that triggered the action and the latest publish.
  - If the package hasn't been published or the prior publish does not include a git hash, we'll
    only pull the commit data that triggered the action.
- Based on the commit messages, increment the version from the lastest release.
  - If the strings "BREAKING CHANGE" or "!:" are found anywhere in any of the commit messages or descriptions the major
    version will be incremented.
  - If a commit message begins with the string "feat" then the minor version will be increased. This works
    for most common commit metadata for feature additions: `"feat: new API"` and `"feature: new API"`.
  - All other changes will increment the patch version.
- Publish to npm using the configured token.
- Push a tag for the new version to GitHub.

### Configuration

You can configure some aspects of merge-release action by passing some environmental variables.

- **GITHUB_TOKEN (required)**
  - Github token to allow tagging the version.
- **NPM_AUTH_TOKEN (required)**
  - NPM Auth Token to publish to NPM, read [here](https://docs.github.com/en/actions/configuring-and-managing-workflows/creating-and-storing-encrypted-secrets) how to setup it as a secret.
- **DEPLOY_DIR**
  - The path where the dist `package.json` is to run npm publish. Defaults to the root dir.
- **SRC_PACKAGE_DIR**
  - The path where the src package.json is found. Defaults to the root dir.
- **NPM_REGISTRY_URL**
  - NPM Registry URL to use. defaults to: `https://registry.npmjs.org/`
- **NPM_PRIVATE**
  - If you wish privately publish your package please ensure you have set this to `true`

`merge-release` will use `npm publish` unless you've defined a `publish` script in your `package.json`.

```yaml
- uses: Github-Actions-Community/merge-release@main
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
    NPM_AUTH_TOKEN: ${{ secrets.NPM_AUTH_TOKEN }}
    DEPLOY_DIR: my/deploy/dir
    SRC_PACKAGE_DIR: my/src/package
```

## Contributors ✨

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tbody>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="http://mikealrogers.com"><img src="https://avatars.githubusercontent.com/u/579?v=4?s=100" width="100px;" alt="Mikeal Rogers"/><br /><sub><b>Mikeal Rogers</b></sub></a><br /><a href="https://github.com/Github-Actions-Community/merge-release/commits?author=mikeal" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="http://www.achingbrain.net"><img src="https://avatars.githubusercontent.com/u/665810?v=4?s=100" width="100px;" alt="Alex Potsides"/><br /><sub><b>Alex Potsides</b></sub></a><br /><a href="https://github.com/Github-Actions-Community/merge-release/commits?author=achingbrain" title="Documentation">📖</a></td>
      <td align="center" valign="top" width="14.28%"><a href="http://www.kanekotic.com"><img src="https://avatars.githubusercontent.com/u/3071208?v=4?s=100" width="100px;" alt="Alvaro Jose"/><br /><sub><b>Alvaro Jose</b></sub></a><br /><a href="https://github.com/Github-Actions-Community/merge-release/commits?author=kanekotic" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="http://jonjoe.io"><img src="https://avatars.githubusercontent.com/u/2996688?v=4?s=100" width="100px;" alt="Jonjoe Whitfield"/><br /><sub><b>Jonjoe Whitfield</b></sub></a><br /><a href="https://github.com/Github-Actions-Community/merge-release/commits?author=Jonjoe" title="Code">💻</a></td>
    </tr>
  </tbody>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!

##### Created my free [logo](https://logomakr.com/5sISSS) at [LogoMakr.com](LogoMakr.com)
