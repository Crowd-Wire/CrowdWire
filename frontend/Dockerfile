FROM node:14.15.1 as build

# set working directory
WORKDIR /usr/src/app

# install and cache app dependencies
COPY package*.json ./
ADD package.json /usr/src/app/package.json
RUN npm install
# Bundle app source
COPY . ./
RUN npm run build

FROM nginx:stable-alpine
COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /usr/src/app/build /usr/share/nginx/html

# Specify port
EXPOSE 80

# Copy .env file and shell script to container
WORKDIR /usr/share/nginx/html


# Add bash
#RUN apk add --no-cache bash

# Make our shell script executable
#RUN chmod +x env.sh
# start app
#"/bin/bash", "-c", "./env.sh &&
CMD [ "nginx", "-g", "daemon off;"]
