ARG NODE_VERSION=18
FROM node:${NODE_VERSION}-alpine

ENV NODE_ENV=production

WORKDIR /usr/src/app
# The application needs write-permissions to the root application folder to persist data.
RUN chown root:node /usr/src/app && chmod 770 /usr/src/app

# Install dependencies separately from copying source code, to take advantage
# of layer caching mechanism.
# Mount cache to /root/.npm for speeding up subsequent builds
# Bind-mount package.json and package-lock.json to not have to copy them into the layer.
RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=package-lock.json,target=package-lock.json \
    --mount=type=cache,target=/root/.npm \
    npm ci --omit=dev

USER node

COPY . .

# Bind to all interfaces by default, so the application is reachable outside the container.
# This can be overwritten by the user in case of a more advanced setup.
ENV IP=0.0.0.0

CMD ["node", "src/index.js"]
