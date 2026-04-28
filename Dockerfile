FROM node:22-alpine

WORKDIR /app

# Install only runtime deps deterministically.
COPY package*.json ./
RUN npm ci --omit=dev --no-audit --no-fund

# Copy app source.
COPY . .

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["npm", "start"]
