# frontend/Dockerfile
FROM node:20-alpine AS dev

WORKDIR /app

EXPOSE 4200
CMD ["sh", "-c", "npm install && npm run start -- --host 0.0.0.0 --port 4200"]
