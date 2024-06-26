FROM node:20-slim

LABEL version="1.0.0"
LABEL repository="http://github.com/Github-Actions-Community/merge-release"
LABEL homepage="http://github.com/merge-release"
LABEL maintainer="Github-Actions-Community <me@kanekotic.com>"

LABEL com.github.actions.name="Automated releases for npm packages."
LABEL com.github.actions.description="Release npm package based on commit metadata."
LABEL com.github.actions.icon="package"
LABEL com.github.actions.color="red"

RUN apt-get -y update && \
  apt-get -y --no-install-recommends install git jq findutils curl ca-certificates && \
  rm -rf /var/lib/apt/lists/* && \
  npm update -g npm

COPY . .

# Install dependencies here
RUN npm ci --omit dev

ENTRYPOINT ["/entrypoint.sh"]
CMD ["help"]
