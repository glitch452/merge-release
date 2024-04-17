#!/bin/sh

set -e

# Set default values
NPM_STRICT_SSL="${NPM_STRICT_SSL:-true}"
NPM_REGISTRY_SCHEME="https"
if ! $NPM_STRICT_SSL; then NPM_REGISTRY_SCHEME="http"; fi
NPM_REGISTRY_DOMAIN="$(echo "${NPM_REGISTRY_URL:-registry.npmjs.org}" | sed -r 's/https?:\/\///')"
NPM_REGISTRY_URL="${NPM_REGISTRY_SCHEME}://$NPM_REGISTRY_DOMAIN"
# Respect NPM_CONFIG_USERCONFIG if it is provided, default to $HOME/.npmrc
NPM_CONFIG_USERCONFIG="${NPM_CONFIG_USERCONFIG:-"$HOME/.npmrc"}"

if [ "$DEBUG" = "true" ]; then
  echo "Debug Enabled, Printing Environment:"
  printenv
  echo ""
fi

if [ -n "$NPM_CUSTOM_NPMRC" ]; then
  # Use a fully-formed npmrc file if provided
  echo "$NPM_CUSTOM_NPMRC" > "$NPM_CONFIG_USERCONFIG"
  chmod 0600 "$NPM_CONFIG_USERCONFIG"
elif [ -n "$NPM_AUTH_TOKEN" ]; then
  printf "//%s/:_authToken=%s\\nregistry=%s\\nstrict-ssl=%s" "$NPM_REGISTRY_DOMAIN" "$NPM_AUTH_TOKEN" "$NPM_REGISTRY_URL" "${NPM_STRICT_SSL}" > "$NPM_CONFIG_USERCONFIG"
  chmod 0600 "$NPM_CONFIG_USERCONFIG"
fi

if [ "$DEBUG" = "true" ]; then
  echo "Debug Enabled, Printing '$NPM_CONFIG_USERCONFIG' file contents:"
  cat "$NPM_CONFIG_USERCONFIG"
  echo "\n"
fi

# initialize git
remote_repo="https://${GITHUB_ACTOR}:${GITHUB_TOKEN}@github.com/${GITHUB_REPOSITORY}.git"
git config --global --add safe.directory "/github/workspace"
git config http.sslVerify false
git config user.name "Merge Release"
git config user.email "actions@users.noreply.github.com"
git remote add merge-release "${remote_repo}"
git remote --verbose
git show-ref # useful for debugging
git branch --verbose

# Dependencies are installed at build time
node /src/merge-release-run.js "$@" || exit 1
