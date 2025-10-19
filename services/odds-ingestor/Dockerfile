FROM node:20-slim
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev   # or npm install --omit=dev if you chose Option B
COPY . .
ENV PORT=8080
CMD ["npm", "start"]
