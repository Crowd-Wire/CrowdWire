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

# start app
CMD ["nginx", "-g", "daemon off;"]
