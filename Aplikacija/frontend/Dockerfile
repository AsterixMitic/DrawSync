# ---- build stage ----
FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
# for prod builds; make sure "build" script exists in package.json
RUN npm run build

# ---- runtime stage ----
FROM nginx:1.25-alpine
# Angular output is in dist/<app-name>; copy app root to nginx html.
COPY --from=build /app/dist/frontend /usr/share/nginx/html

# Angular SPA routing support
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
