FROM node:18

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package.json yarn.lock ./

RUN yarn

# Bundle app source
COPY . .
# Uncomment only if your hosting platform injects other env variables for you except certain ones you need to manually add
# COPY .env.production .env

RUN yarn build

ENV NODE_ENV production

EXPOSE 8080
CMD [ "node", "dist/index.js" ]

# Set user to node user instead of root for security
USER node