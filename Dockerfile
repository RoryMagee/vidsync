FROM node:alpine
WORKDIR '/app'
COPY server/package.json ./
RUN npm install
COPY . .
CMD ["npm", "start"]
