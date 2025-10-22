FROM node:20-slim
WORKDIR /app

# Install only prod deps
COPY package*.json ./
RUN npm ci --omit=dev

# Copy the rest of the source
COPY . .

EXPOSE 8080
CMD ["npm","start"]

