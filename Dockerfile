FROM node:alpine
WORKDIR /usr/app
COPY ./server ./
RUN npm install
CMD ["npm", "start"]
