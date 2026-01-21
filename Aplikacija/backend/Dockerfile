# backend/Dockerfile
FROM node:20-alpine AS dev

WORKDIR /app

# (dev) ostavljamo install u compose command-u zbog bind mount-a
EXPOSE 3000
CMD ["sh", "-c", "npm install && npm run start:dev"]
