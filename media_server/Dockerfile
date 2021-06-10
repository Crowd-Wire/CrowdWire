FROM node:14.15.1

EXPOSE 3001

# set working directory
WORKDIR /usr/src/app

COPY package.json ./

RUN npm i

COPY . .

RUN npm run build

ENV NODE_ENV production

# add entrypoint.sh
COPY ./entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh

ENTRYPOINT ["./entrypoint.sh"]
