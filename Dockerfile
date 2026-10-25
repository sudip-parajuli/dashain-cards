FROM node:22-alpine
WORKDIR /app
COPY package.json ./
COPY web ./web
COPY server ./server
ENV PORT=4174
EXPOSE 4174
USER node
CMD ["node", "server/start.mjs"]
