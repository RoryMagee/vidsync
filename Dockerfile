FROM node:alpine
WORKDIR '/app'
COPY server/package.json ./
RUN npm install
COPY ./server .
CMD ["npm", "start"]

FROM nginx
EXPOSE 80
