# https://blog.zack.computer/docker-containers-nodejs-nextjs
FROM node:17.6.0-alpine as DependenciesImage

# To add the missing shared libraries to your image,
# adding the libc6-compat package in your Dockerfile is recommended: apk add --no-cache libc6-compat
# https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine
RUN apk add --no-cache libc6-compat

# Switch workdir to project directory
WORKDIR /home/node/app

# Install node packages
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

FROM node:17.6.0-alpine as BuildImage

# Switch workdir to project directory
WORKDIR /home/node/app

# Bring over the installed dependencies and the rest of the source code to build
COPY --from=DependenciesImage /home/node/app/node_modules ./node_modules
COPY . .

# Build project
RUN yarn build

# Remove the development dependencies since we don't need them
# and install production dependencies
RUN rm -rf node_modules && \
    yarn install --production --frozen-lockfile --ignore-scripts --prefer-offline

FROM node:17.6.0-alpine

EXPOSE 3000

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Create group and user
RUN addgroup --system --gid 1001 nextjs && \
    adduser --system --uid 1001 nextjs

# Switch workdir to project directory
WORKDIR /home/node/app

# Copy base files from BuildImage
COPY --from=BuildImage --chown=nextjs:nextjs /home/node/app/package.json /home/node/app/yarn.lock ./
COPY --from=BuildImage --chown=nextjs:nextjs /home/node/app/node_modules ./node_modules
COPY --from=BuildImage --chown=nextjs:nextjs /home/node/app/next.config.js ./
COPY --from=BuildImage --chown=nextjs:nextjs /home/node/app/.next ./.next

# Copy project files from BuildImage
COPY --from=BuildImage --chown=nextjs:nextjs /home/node/app/locales ./locales
COPY --from=BuildImage --chown=nextjs:nextjs /home/node/app/public ./public

CMD ["yarn", "start"]
