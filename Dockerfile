FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json* ./
COPY packages/api/package.json packages/api/
COPY packages/shared/package.json packages/shared/
COPY packages/web/package.json packages/web/
RUN npm ci
COPY packages/shared packages/shared
COPY packages/api packages/api
COPY packages/web packages/web
RUN npm run build
RUN npm prune --omit=dev
WORKDIR /app/packages/api
RUN npx prisma generate
ENV NODE_ENV=production
EXPOSE 3001
CMD ["node", "dist/main.js"]
