#!/usr/bin/env node

import * as fs from 'fs';
import * as path from 'path';
import bent from 'bent';
import simpleGit from 'simple-git';
import { execSync as _execSync, spawnSync as _spawnSync } from 'child_process';
import { promisify } from 'util';

const git = simpleGit();
const gitLog = promisify(git.log.bind(git));

const minorTagsRegex = new RegExp('^(feat)');

/**
 * @param {string} command
 * @param {string} cwd
 * @returns {ReturnType<typeof _spawnSync>}
 */
function spawnSync(command, cwd) {
  const [cmd, ...args] = command.split(' ');
  const ret = _spawnSync(cmd, args, { cwd, stdio: 'inherit' });
  if (ret.status) {
    console.error(ret);
    console.error(`Error: "${command}" returned non-zero exit code`);
    process.exit(ret.status);
  }
  return ret;
}

/**
 * @param {Parameters<typeof _execSync>[0]} command
 * @param {Parameters<typeof _execSync>[1]} options
 * @returns {ReturnType<typeof _execSync>}
 */
function execSync(command, options) {
  try {
    return _execSync(command, options);
  } catch (e) {
    console.error(`Failed to run command "${command}"`);
    throw e;
  }
}

/**
 * @param {string} version
 * @param {string} packageDir
 */
function setVersion(version, packageDir) {
  const json = execSync(`jq '.version="${version}"' package.json`, { cwd: packageDir });
  fs.writeFileSync(path.join(packageDir, 'package.json'), json);
}

/** @param {string} message */
function isMajorChange(message) {
  const firstLine = message.split(/\r?\n/)[0].toLowerCase();
  return !!(message.includes('BREAKING CHANGE') || firstLine.includes('!:'));
}

/** @param {string} message */
function isMinorChange(message) {
  const firstLine = message.split(/\r?\n/)[0].toLowerCase();
  return minorTagsRegex.test(firstLine);
}

const get = bent('json', process.env.NPM_REGISTRY_URL || 'https://registry.npmjs.org/');

const disableGitTag = process.env.DISABLE_GIT_TAG?.toLowerCase() === 'true';

const event = JSON.parse(fs.readFileSync('/github/workflow/event.json').toString());

const deployDir = path.join(process.cwd(), process.env.DEPLOY_DIR || './');
const srcPackageDir = path.join(process.cwd(), process.env.SRC_PACKAGE_DIR || './');

console.log('            using deploy directory : ' + deployDir);
console.log('using src directory (package.json) : ' + srcPackageDir);

const access = process.env.NPM_PRIVATE === 'true' ? 'restricted' : 'public';

console.log('deploy to NPM with access : ' + access);

const run = async () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(deployDir, 'package.json')));

  if (!process.env.NPM_AUTH_TOKEN) throw new Error('Merge-release requires NPM_AUTH_TOKEN');
  let latest;
  try {
    latest = await get(pkg.name + '/latest');
  } catch {
    // unpublished
  }

  /** @type {string[] | undefined} */
  let messages;

  if (latest) {
    if (latest.gitHead === process.env.GITHUB_SHA) return console.log('SHA matches latest release, skipping.');
    if (latest.gitHead) {
      try {
        let logs = await gitLog({
          from: latest.gitHead,
          to: process.env.GITHUB_SHA,
        });
        messages = logs.all.map((r) => r.message + '\n' + r.body);
      } catch {
        latest = null;
      }
      // g.log({from: 'f0002b6c9710f818b9385aafeb1bde994fe3b370', to: '53a92ca2d1ea3c55977f44d93e48e31e37d0bc69'}, (err, l) => console.log(l.all.map(r => r.message + '\n' + r.body)))
    } else {
      latest = null;
    }
  }
  if (!latest) {
    messages = (event.commits || []).map((commit) => commit.message + '\n' + commit.body);
  }

  let version = 'patch';
  if (messages.map(isMajorChange).includes(true)) {
    version = 'major';
  } else if (messages.map(isMinorChange).includes(true)) {
    version = 'minor';
  }

  let currentVersion = execSync(`npm view ${pkg.name} version`, {
    cwd: srcPackageDir,
  }).toString();

  setVersion(currentVersion, srcPackageDir);
  if (srcPackageDir !== deployDir) {
    setVersion(currentVersion, deployDir);
  }

  console.log('current:', currentVersion, '/', 'version:', version);
  let newVersion = execSync(`npm version --git-tag-version=false ${version}`, {
    cwd: srcPackageDir,
  }).toString();
  newVersion = newVersion
    .trim()
    .split(/(\r\n|\n|\r)/gm)
    .filter((word) => !/(\r\n|\n|\r)/.test(word))
    .pop();

  setVersion(newVersion.slice(1), srcPackageDir);
  if (srcPackageDir !== deployDir) {
    setVersion(newVersion.slice(1), deployDir);
  }

  console.log('new version:', newVersion);

  if (pkg.scripts && pkg.scripts.publish) {
    spawnSync(`npm run publish`, deployDir);
  } else {
    spawnSync(`npm publish --access=${access}`, deployDir);
  }

  spawnSync(`git checkout ${path.join(deployDir, 'package.json')}`); // cleanup
  spawnSync(`echo "version=${newVersion}" >> $GITHUB_OUTPUT`);

  if (!disableGitTag) {
    spawnSync(`git tag ${newVersion}`);
    const remote = `https://${process.env.GITHUB_ACTOR}:${process.env.GITHUB_TOKEN}@github.com/${process.env.GITHUB_REPOSITORY}.git`;
    spawnSync(`git push ${remote} --tags`);
  }
};

run();
